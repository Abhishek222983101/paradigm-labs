// Claim a slot (system architecture §9.2 /api/claims, flow F3):
//   wallet signature → World ID proof (signal-bound) → Neon reservation under a per-task lock
//   (UNIQUE(task, nullifier) = one human per task; count < slots = no overbooking)
//   → public adx.claim on Arkiv (fresh pseudonym, challenge) → upload token.
// The nullifier and wallet stay in Neon; Arkiv only gets the pseudonym, slot and challenge.
import "server-only"
import { randomBytes } from "node:crypto"
import { claimsPrivate, contributors, db, desc, eq, humans, jobs, sql, uploadTokens } from "@adx/db"
import { S, startCreate, taskByKey } from "@adx/shared/arkiv"
import { decodeChallenge, encodeChallenge, newChallenge } from "@adx/shared/challenge"
import { type ClaimResponse, claimMessage, claimSignal } from "@adx/shared/claim"
import { issueUploadToken } from "@adx/shared/upload-token"
import { checksLeft, isBlocked } from "@adx/shared/verdict"
import { ExpirationTime } from "@arkiv-network/sdk"
import { key as keyV, str, u64 } from "@arkiv-network/sdk/schema"
import { type Hex, hashMessage, isAddressEqual, recoverMessageAddress, recoverPublicKey } from "viem"
import { fail } from "./api"
import { issueRestartToken, verifyRestartToken } from "./restart-token"
import { type IdkitResult, verifyClaimProof } from "./world"

const CLAIM_TTL_MS = 2 * 60 * 60 * 1000
/** A slot is held by a submitted claim, or an unused claim younger than its 2 h Arkiv expiry. */
const LIVE_SQL =
  "(status = 'submitted' or (status in ('reserving','active') and created_at > now() - interval '2 hours'))"

function uploadSecret(): string {
  const s = process.env.UPLOAD_TOKEN_SECRET
  if (!s || s.length < 32) fail(503, "unconfigured", "Uploads aren't configured on this deployment yet")
  return s
}

function uploadUrl(): string | null {
  const w = process.env.WORKER_PUBLIC_URL
  return w ? `${w.replace(/\/$/, "")}/upload` : null
}

async function newUpload(claimKey: string, taskKey: string) {
  const t = issueUploadToken({ claim: claimKey, task: taskKey }, uploadSecret())
  await db().insert(uploadTokens).values({ tokenHash: t.tokenHash, claimKey, expiresAt: t.expiresAt })
  return { url: uploadUrl(), token: t.token, expiresAt: t.expiresAt.toISOString() }
}

export type ClaimInput = {
  taskKey: Hex
  wallet: Hex
  signature: Hex
  /** World ID proof. Not needed when a valid restart pass is given (the person proved it seconds ago). */
  idkit?: IdkitResult
  restart?: boolean
  restartToken?: string
}

/** Demo switch: lets a verified person release their own slot and claim again (still one slot per human). */
export const restartAllowed = () => process.env.DEMO_RESTART === "true"

export type ClaimDeps = { verify: (result: IdkitResult, expectedSignal: string) => Promise<string> }

export async function claimSlot(
  input: ClaimInput,
  deps: ClaimDeps = { verify: verifyClaimProof },
): Promise<{ res: ClaimResponse; publicKey: Hex; arkivDone?: Promise<void> }> {
  let arkivDone: Promise<void> | undefined
  const { taskKey, wallet, signature, idkit } = input
  const restartRowId =
    input.restartToken && restartAllowed() ? verifyRestartToken(input.restartToken, taskKey, wallet) : null
  if (input.restartToken && !restartRowId)
    fail(401, "restart_expired", "That start-over pass expired. Claim again.")
  if (!restartRowId && !idkit) fail(400, "invalid", "World ID proof missing")

  // 1. The caller controls the wallet (signature over task + wallet + the single-use World nonce, or the pass).
  const nonce = restartRowId
    ? `restart:${(input.restartToken as string).slice(-24)}`
    : (idkit as IdkitResult).nonce
  const message = claimMessage(taskKey, wallet, nonce)
  const signer = await recoverMessageAddress({ message, signature }).catch(() => null)
  if (!signer || !isAddressEqual(signer, wallet)) fail(401, "bad_signature", "Wallet signature doesn't match")
  const publicKey = await recoverPublicKey({ hash: hashMessage(message), signature })

  // 2. The task is ours, open, and not past its deadline.
  const task = await taskByKey(taskKey).catch(() =>
    fail(503, "arkiv_unavailable", "Arkiv is slow right now. Try again."),
  )
  if (!task) fail(404, "no_task", "This task doesn't exist")
  if (task.status !== "open" || task.deadline <= Math.floor(Date.now() / 1000)) {
    fail(410, "task_closed", "This task has closed")
  }

  // 3. A real, unique human, and the proof is bound to this task + wallet. With a restart pass, the person is the
  //    one recorded on their previous claim (proved with World ID moments before the pass was issued).
  let nullifier: string
  if (restartRowId) {
    const [prev] = await db().select().from(claimsPrivate).where(eq(claimsPrivate.id, restartRowId)).limit(1)
    if (!prev || prev.taskKey !== taskKey || prev.status === "released") {
      fail(409, "restart_used", "That slot was already started over. Claim again.")
    }
    nullifier = prev.nullifier
  } else {
    nullifier = await deps.verify(idkit as IdkitResult, claimSignal(taskKey, wallet))
  }

  // Reputation gate: free checks and the garbage-data block are per person (World ID), not per wallet.
  const [h] = await db().select().from(humans).where(eq(humans.nullifier, nullifier)).limit(1)
  if (h && isBlocked(h)) {
    fail(403, "blocked", "This World ID can't claim tasks anymore: too many clips were rejected.")
  }
  if (h && checksLeft(h) <= 0) {
    fail(403, "no_checks_left", "You've used your free checks. Each accepted clip earns one back.")
  }

  // 4. Reserve a slot atomically. Same human again → resume their claim if it's live, else 409.
  const d = db()
  const reservation = await d.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${taskKey}))`)
    const mine = await tx
      .select()
      .from(claimsPrivate)
      .where(sql`${claimsPrivate.taskKey} = ${taskKey} and ${claimsPrivate.nullifier} = ${nullifier}`)
      .limit(1)
    const prior = mine[0]
    const lapsed =
      prior && prior.status !== "submitted" && prior.createdAt.getTime() < Date.now() - CLAIM_TTL_MS
    const restarting = Boolean(prior && restartAllowed() && (input.restart || restartRowId))
    if (prior && !lapsed && !restarting) return { kind: "existing" as const, row: prior }
    if (prior && (lapsed || restarting)) {
      // Release this person's own previous slot, keeping the record (its clip may already be uploaded).
      // The nullifier is suffixed so UNIQUE(task, nullifier) admits the fresh claim.
      if (prior.claimKey) await tx.delete(uploadTokens).where(eq(uploadTokens.claimKey, prior.claimKey))
      await tx
        .update(claimsPrivate)
        .set({ status: "released", nullifier: `${prior.nullifier}:released:${prior.id}` })
        .where(eq(claimsPrivate.id, prior.id))
    }
    const taken = await tx.execute(
      sql`select count(*)::int as n from claims_private where task_key = ${taskKey} and ${sql.raw(LIVE_SQL)}`,
    )
    const n = Number((taken.rows[0] as { n: number }).n)
    if (n >= task.slots) return { kind: "full" as const }
    const [row] = await tx
      .insert(claimsPrivate)
      .values({ taskKey, nullifier, wallet: wallet.toLowerCase(), status: "reserving" })
      .returning()
    return { kind: "new" as const, row: row as NonNullable<typeof row>, slot: n + 1 }
  })

  if (reservation.kind === "full") fail(409, "task_full", "All slots on this task are taken")
  if (reservation.kind === "existing") {
    const row = reservation.row
    const challenge = row.challenge ? decodeChallenge(row.challenge) : null
    if (row.status === "active" && row.claimKey && challenge) {
      // Same human (World ID proved it). Hand back their slot, bound to the wallet they use now.
      if (row.wallet !== wallet.toLowerCase()) {
        await d
          .update(claimsPrivate)
          .set({ wallet: wallet.toLowerCase() })
          .where(eq(claimsPrivate.id, row.id))
        await d.insert(contributors).values({ wallet: wallet.toLowerCase() }).onConflictDoNothing()
      }
      return {
        publicKey,
        res: {
          claimKey: row.claimKey,
          taskKey,
          challenge,
          slot: 0,
          upload: await newUpload(row.claimKey, taskKey),
          resumed: true,
        },
      }
    }
    const canRestart = restartAllowed()
    if (row.status === "submitted" && row.claimKey) {
      const [job] = await d
        .select({ id: jobs.id })
        .from(jobs)
        .where(eq(jobs.claimKey, row.claimKey))
        .orderBy(desc(jobs.createdAt))
        .limit(1)
      fail(409, "already_submitted", "You already sent a clip for this task.", {
        submissionId: job?.id ?? null,
        canRestart,
        restartToken: canRestart ? issueRestartToken(taskKey, wallet, row.id) : undefined,
      })
    }
    fail(409, "already_claimed", "You already hold a slot on this task.", {
      canRestart,
      restartToken: canRestart ? issueRestartToken(taskKey, wallet, row.id) : undefined,
    })
  }

  // 5. Publish the public claim. The key is predicted (~0.3 s) and returned at once; the Arkiv transaction
  //    (~7 s) confirms in the background (arkivDone, awaited by the route with after()).
  const challenge = newChallenge()
  const claimant = `c_${randomBytes(5).toString("hex")}`
  let claimKey: Hex
  const write = startCreate(
    "web",
    S.Claim,
    {
      task: keyV(taskKey),
      status: str("active"),
      slot: u64(reservation.slot),
      claimant: str(claimant),
      challenge: str(encodeChallenge(challenge)),
    },
    ExpirationTime.fromHours(2),
  )
  try {
    claimKey = await write.key
  } catch (e) {
    await d.delete(claimsPrivate).where(eq(claimsPrivate.id, reservation.row.id))
    console.error("[claims] arkiv unavailable", (e as Error).message)
    fail(503, "arkiv_unavailable", "Couldn't reach Arkiv. No slot was taken. Try again.")
  }
  arkivDone = write.done.then(
    (r) => console.log(JSON.stringify({ evt: "claim_on_arkiv", key: r.entityKey, ms: r.ms })),
    (e) => console.error("[claims] arkiv write failed after reply", claimKey, (e as Error).message),
  )

  await d
    .update(claimsPrivate)
    .set({ claimKey, status: "active", challenge: encodeChallenge(challenge) })
    .where(eq(claimsPrivate.id, reservation.row.id))
  await d.insert(contributors).values({ wallet: wallet.toLowerCase() }).onConflictDoNothing()

  return {
    arkivDone,
    publicKey,
    res: {
      claimKey,
      taskKey,
      challenge,
      slot: reservation.slot,
      upload: await newUpload(claimKey, taskKey),
      resumed: false,
    },
  }
}

/** Count of live reservations per task (authoritative for slots; Arkiv mirrors it). */
export async function liveClaimCount(taskKey: string): Promise<number> {
  const r = await db().execute(
    sql`select count(*)::int as n from claims_private where task_key = ${taskKey} and ${sql.raw(LIVE_SQL)}`,
  )
  return Number((r.rows[0] as { n: number }).n)
}
