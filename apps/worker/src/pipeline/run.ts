// The verification pipeline (system architecture §11.1), one job at a time per slot:
//   probe → (fingerprint → dedup) ∥ (Gemini watches the clip) → rules decide → encrypt → our Swarm node
//   → Arkiv: adx.submission (worker wallet) then adx.verification (verifier wallet) → reputation.
// Every stage writes an event, so the phone's status page ticks live. The verdict event is written as soon
// as it's known (before storage/publishing), so the person sees "Accepted" fast.
import { readFile, rm } from "node:fs/promises"
import type { dbPool } from "@adx/db"
import { claimsPrivate, clipKeys, eq, events, humans, jobs, sql } from "@adx/db"
import { S, safeCreate, startCreate, submissionsByBucket, taskByKey } from "@adx/shared/arkiv"
import { decodeChallenge } from "@adx/shared/challenge"
import { encrypt, newClipKey, sha256Hex } from "@adx/shared/crypto"
import type { PipelineStepId, VerdictSummary } from "@adx/shared/events"
import { swarmUpload } from "@adx/shared/swarm"
import { applyVerdict, decide, isNearDuplicate } from "@adx/shared/verdict"
import { ExpirationTime } from "@arkiv-network/sdk"
import { bytes, key as keyV, str, u64 } from "@arkiv-network/sdk/schema"
import type { Hex } from "viem"
import { watchClip } from "./gemini"
import { fingerprint, probe } from "./media"

type DB = ReturnType<typeof dbPool>
export type PipelineEnv = { beeUrl: string; batchId?: string; geminiKey: string }
type Job = typeof jobs.$inferSelect

const MIN_S = 14
const MAX_S = 35

class Final extends Error {
  constructor(
    readonly status: "rejected" | "duplicate" | "failed",
    readonly reason: string,
    readonly data: Record<string, unknown> = {},
  ) {
    super(reason)
  }
}

export async function processJob(db: DB, env: PipelineEnv, job: Job): Promise<string> {
  const scope = `submission:${job.id}`
  const event = (step: PipelineStepId, ok: boolean, ms: number, data?: Record<string, unknown>) =>
    db.insert(events).values({ scope, step, ok, ms, data: data ?? null })
  const timed = async <T>(
    step: PipelineStepId,
    fn: () => Promise<T>,
    data?: (v: T) => Record<string, unknown>,
  ) => {
    const t0 = Date.now()
    const v = await fn()
    await event(step, true, Date.now() - t0, data?.(v))
    return v
  }

  try {
    // Context: the task (rubric) from Arkiv and the challenge saved with the clip.
    const task = await taskByKey(job.taskKey as Hex)
    if (!task?.rubric) throw new Final("failed", "The task for this clip is no longer open")
    const challenge = job.challenge ? decodeChallenge(job.challenge) : null
    if (!challenge) throw new Final("failed", "This clip has no challenge on record")
    const exists = await readFile(job.path).then(
      () => true,
      () => false,
    )
    if (!exists)
      throw new Final("failed", "The uploaded file is no longer on the worker. Please record again.")

    // 1. Probe: right length, has picture and sound.
    const p = await timed(
      "probe",
      () => probe(job.path),
      (v) => ({ durationMs: v.durationMs }),
    )
    const durationS = p.durationMs / 1000
    if (!p.hasVideo) throw new Final("rejected", "The file has no video track")
    if (durationS < MIN_S || durationS > MAX_S) {
      throw new Final("rejected", `The clip is ${Math.round(durationS)} seconds; it needs to be 15 to 30.`)
    }

    // A verdict from an earlier attempt (e.g. storage timed out afterwards) is reused, never recomputed.
    const [priorEv] = await db
      .select({ data: events.data })
      .from(events)
      .where(
        sql`${events.scope} = ${scope} and ${events.step} = 'verdict' and ${events.ok} is not null and (${events.data} ->> 'summary') is not null`,
      )
      .limit(1)
    const prior = priorEv?.data
      ? {
          summary: (priorEv.data as { summary: VerdictSummary }).summary,
          model: (priorEv.data as { model?: string }).model ?? "gemini-3-flash-preview",
        }
      : null

    // 2+3 in parallel with 4: fingerprint + cross-buyer dedup, and the AI watching the clip.
    const dedupWork = (async () => {
      const hashes = await timed("fingerprint", () => fingerprint(job.path, p.durationMs))
      const [a, b, c] = hashes.map((h) => h.slice(0, 4)) as [string, string, string]
      const t0 = Date.now()
      const near = (await submissionsByBucket(a, b, c)).find((s) =>
        isNearDuplicate(hashes, s.dhash.split("|")),
      )
      await event(
        "dedup",
        !near,
        Date.now() - t0,
        near ? { duplicateOf: near.key, reason: "Matches a clip already on Arkiv" } : {},
      )
      return { hashes, duplicateOf: near?.key }
    })()
    const rubric = task.rubric
    const [fp, ai] = await Promise.all([
      dedupWork,
      prior
        ? Promise.resolve(null)
        : watchClip({
            path: job.path,
            mime: job.mime ?? "video/mp4",
            rubric,
            challenge,
            durationS,
            apiKey: env.geminiKey,
          }),
    ])
    if (fp.duplicateOf)
      throw new Final("duplicate", "This clip matches one already on Arkiv", { duplicateOf: fp.duplicateOf })

    // 5. Code decides, once. A retry reuses the earlier verdict: no second AI call, no second reputation change.
    let summary: VerdictSummary
    let model: string
    if (prior) {
      summary = prior.summary
      model = prior.model
    } else {
      if (!ai) throw new Error("no AI report")
      summary = decide({ report: ai.report, rubric, challenge, durationS })
      model = ai.model
      await event("verdict", summary.verdict !== "reject", ai.ms, {
        verdict: summary.verdict,
        score: summary.score,
        summary,
        model,
      })
      await updateReputation(db, job.claimKey, summary.verdict)
    }
    const status =
      summary.verdict === "accept" ? "accepted" : summary.verdict === "reject" ? "rejected" : "review"
    await db.update(jobs).set({ status, updatedAt: new Date() }).where(eq(jobs.id, job.id))

    // 6+7. Encrypt and store on our Swarm node (ciphertext only).
    const key = newClipKey()
    const blob = await timed("encrypt", async () => encrypt(await readFile(job.path), key))
    const cipherSha256 = sha256Hex(blob)
    const swarmRef = await timed(
      "store",
      async () => {
        let last: unknown
        for (let i = 0; i < 3; i++) {
          try {
            return await swarmUpload(blob, { beeUrl: env.beeUrl, batchId: env.batchId, timeoutMs: 45_000 })
          } catch (e) {
            last = e
            await new Promise((r) => setTimeout(r, 2000 * (i + 1)))
          }
        }
        throw last
      },
      (ref) => ({ swarmRef: ref }),
    )

    // 8. Publish to Arkiv in parallel: the submission key is predicted, so the verifier's verdict can reference
    //    it while the worker's transaction is still confirming (two wallets, two queues, ~7 s instead of ~14 s).
    const t0 = Date.now()
    const subWrite = startCreate(
      "worker",
      S.Submission,
      {
        task: keyV(job.taskKey as Hex),
        claim: keyV(job.claimKey as Hex),
        status: str(status),
        dhashA: str(fp.hashes[0]?.slice(0, 4) ?? "0000"),
        dhashB: str(fp.hashes[1]?.slice(0, 4) ?? "0000"),
        dhashC: str(fp.hashes[2]?.slice(0, 4) ?? "0000"),
        dhash: str(fp.hashes.join("|")),
        swarmRef: str(swarmRef),
        cipherSha256: str(cipherSha256),
        durationMs: u64(p.durationMs),
      },
      ExpirationTime.fromDays(30),
    )
    const subKey = await subWrite.key
    // Sellable as soon as the key is known: the agent can start paying while Arkiv confirms.
    await db
      .insert(clipKeys)
      .values({ submissionKey: subKey, aesKey: key, swarmRef, cipherSha256 })
      .onConflictDoNothing()
    await db.update(jobs).set({ submissionKey: subKey, updatedAt: new Date() }).where(eq(jobs.id, job.id))
    const evidence = JSON.stringify({
      steps: summary.steps,
      liveness: summary.liveness,
      reason: summary.reason,
    })
    const verWrite = safeCreate(
      "verifier",
      S.Verification,
      {
        submission: keyV(subKey),
        task: keyV(job.taskKey as Hex),
        verdict: str(summary.verdict),
        score: u64(summary.score),
        model: str(model),
        rubricHash: str(task.rubricHash),
        evidence: bytes(new TextEncoder().encode(evidence)),
        evidenceHash: str(sha256Hex(evidence)),
      },
      ExpirationTime.fromDays(180),
    )
    const [sub, ver] = await Promise.all([subWrite.done, verWrite])
    await event("publish", true, Date.now() - t0, {
      submissionKey: sub.entityKey,
      verificationKey: ver.entityKey,
      submissionTx: sub.txHash,
      verificationTx: ver.txHash,
    })
    await event("done", true, 0, { verdict: summary.verdict })
    await rm(job.path, { force: true }) // raw clip gone; only the encrypted copy on Swarm remains
    return status
  } catch (e) {
    if (e instanceof Final) {
      await event(e.status === "duplicate" ? "dedup" : "verdict", false, 0, { reason: e.reason, ...e.data })
      await db
        .update(jobs)
        .set({ status: e.status, error: e.reason, updatedAt: new Date() })
        .where(eq(jobs.id, job.id))
      if (e.status !== "failed")
        await updateReputation(db, job.claimKey, e.status === "duplicate" ? "duplicate" : "reject")
      await event("done", false, 0, {
        verdict: e.status === "duplicate" ? "duplicate" : "reject",
        reason: e.reason,
      })
      await rm(job.path, { force: true })
      return e.status
    }
    throw e // retried by the runner
  }
}

/** Reputation is keyed by the person's World ID nullifier (released claims carry a suffix). */
async function updateReputation(db: DB, claimKey: string, v: "accept" | "reject" | "review" | "duplicate") {
  const [c] = await db
    .select({ nullifier: claimsPrivate.nullifier })
    .from(claimsPrivate)
    .where(eq(claimsPrivate.claimKey, claimKey))
    .limit(1)
  if (!c) return
  const nullifier = c.nullifier.split(":")[0] as string
  const [h] = await db.select().from(humans).where(eq(humans.nullifier, nullifier)).limit(1)
  const cur = h ?? { accepted: 0, rejected: 0, rejectStreak: 0, checksUsed: 0 }
  const next = applyVerdict({ ...cur, checksUsed: cur.checksUsed + 1 }, v)
  await db
    .insert(humans)
    .values({ nullifier, ...next, updatedAt: new Date() })
    .onConflictDoUpdate({ target: humans.nullifier, set: { ...next, updatedAt: sql`now()` } })
}
