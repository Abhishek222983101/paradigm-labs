// The live system map: rebuilds the most recent run (claim → clip → agent → payment) from what the
// services really wrote to Postgres. Public, display-safe fields only: no nullifiers, wallets or keys.
import { claimsPrivate, db, desc, events, jobs, payments, sql } from "@adx/db"
import { links } from "@adx/shared"

export type NodeId =
  | "world"
  | "claim"
  | "upload"
  | "checks"
  | "gemini"
  | "swarm"
  | "arkiv"
  | "agent"
  | "pass"
  | "hedera"
  | "licence"

export type LiveLog = {
  at: string
  node: NodeId
  ok: boolean
  text: string
  proof?: { label: string; href: string }
}

export type LiveRun = {
  startedAt: string | null
  lastAt: string | null
  done: Partial<Record<NodeId, string>> // node → when it finished
  skipped: NodeId[]
  failed: NodeId | null
  log: LiveLog[]
  clip: { id: string; status: string } | null
  amount: number | null
}

const STEP_NODE: Record<string, NodeId> = {
  received: "upload",
  probe: "checks",
  fingerprint: "checks",
  dedup: "checks",
  verdict: "gemini",
  encrypt: "swarm",
  store: "swarm",
  publish: "arkiv",
}

const STEP_TEXT: Record<string, string> = {
  received: "Clip uploaded from the phone",
  probe: "Length and sound checked",
  fingerprint: "Video fingerprint taken",
  dedup: "Compared with every clip on Arkiv",
  verdict: "Gemini watched the clip",
  encrypt: "Clip encrypted (AES-256)",
  store: "Encrypted clip stored on Swarm",
  publish: "Submission and verdict written to Arkiv",
}

type Data = Record<string, unknown>
const str = (v: unknown) => (typeof v === "string" ? v : undefined)

export async function liveRun(): Promise<LiveRun> {
  const d = db()
  const [claim] = await d
    .select({ at: claimsPrivate.createdAt, claimKey: claimsPrivate.claimKey })
    .from(claimsPrivate)
    .orderBy(desc(claimsPrivate.createdAt))
    .limit(1)
  const [job] = await d
    .select({ id: jobs.id, status: jobs.status, claimKey: jobs.claimKey, at: jobs.createdAt })
    .from(jobs)
    .orderBy(desc(jobs.createdAt))
    .limit(1)

  const run: LiveRun = {
    startedAt: null,
    lastAt: null,
    done: {},
    skipped: [],
    failed: null,
    log: [],
    clip: null,
    amount: null,
  }
  const push = (l: LiveLog) => {
    run.log.push(l)
    if (l.ok) run.done[l.node] = l.at
    else if (!run.failed) run.failed = l.node
  }

  // A claim newer than the newest clip means someone is mid-flow: show only the claim so far.
  const claimIsNewer = claim && (!job || claim.at > job.at)
  const runClaim = claimIsNewer
    ? claim
    : job
      ? (
          await d
            .select({ at: claimsPrivate.createdAt, claimKey: claimsPrivate.claimKey })
            .from(claimsPrivate)
            .where(sql`${claimsPrivate.claimKey} = ${job.claimKey}`)
            .limit(1)
        )[0]
      : undefined

  if (runClaim) {
    const at = runClaim.at.toISOString()
    push({ at, node: "world", ok: true, text: "World ID proof verified: one unique human" })
    push({
      at,
      node: "claim",
      ok: true,
      text: "Slot claimed and recorded on Arkiv",
      proof: runClaim.claimKey ? { label: "Claim", href: links.arkivEntity(runClaim.claimKey) } : undefined,
    })
    run.startedAt = at
  }

  if (job && !claimIsNewer) {
    run.clip = { id: job.id, status: job.status }
    run.startedAt ??= job.at.toISOString()
    const evs = await d
      .select()
      .from(events)
      .where(sql`${events.scope} = ${`submission:${job.id}`}`)
      .orderBy(events.id)
      .limit(40)
    let submissionKey: string | undefined
    for (const e of evs) {
      const node = STEP_NODE[e.step]
      if (!node) continue
      const data = (e.data ?? {}) as Data
      const at = e.createdAt.toISOString()
      let text = STEP_TEXT[e.step] ?? e.step
      let proof: LiveLog["proof"]
      if (e.step === "verdict") {
        const s = data.summary as { verdict?: string; score?: number } | undefined
        if (s?.verdict)
          text = `Gemini watched the clip: ${s.verdict === "accept" ? "accepted" : s.verdict}, ${s.score ?? data.score}/100`
      }
      if (e.step === "store" && str(data.swarmRef)) {
        proof = { label: "Swarm", href: links.swarmTestnet(str(data.swarmRef) as string) }
      }
      if (e.step === "publish") {
        submissionKey = str(data.submissionKey)
        const vk = str(data.verificationKey)
        if (vk) proof = { label: "Verdict", href: links.arkivEntity(vk) }
      }
      if (!e.ok && str(data.reason)) text = `${text}: ${str(data.reason)}`
      push({ at, node, ok: e.ok, text, proof })
    }

    if (submissionKey) {
      const key = submissionKey.toLowerCase()
      const agentEvs = await d
        .select()
        .from(events)
        .where(sql`${events.scope} = 'agent' and lower(${events.data}->>'submissionKey') = ${key}`)
        .orderBy(events.id)
        .limit(20)
      for (const e of agentEvs) {
        const data = (e.data ?? {}) as Data
        const at = e.createdAt.toISOString()
        const amount = typeof data.amount === "number" ? data.amount : Number(data.amount ?? 0)
        if (amount) run.amount = amount
        const hcs = str(data.hcsTx)
        const hcsProof = hcs ? { label: "HCS log", href: links.hashscanTx(hcs) } : undefined
        if (e.step === "needs_human") {
          push({
            at,
            node: "agent",
            ok: true,
            text: `Agent paused: ${amount} USDC is above its 5 USDC limit`,
            proof: hcsProof,
          })
        } else if (e.step === "approved") {
          push({
            at,
            node: "pass",
            ok: true,
            text: "A human approved with World Agent Pass (Orb)",
            proof: hcsProof,
          })
        } else if (e.step === "declined") {
          push({ at, node: "pass", ok: false, text: "The human declined the payment", proof: hcsProof })
        } else if (e.step === "paid") {
          if (!run.done.agent)
            push({
              at,
              node: "agent",
              ok: true,
              text: `Agent decided to pay ${amount} USDC (within its limit)`,
            })
          if (data.approval !== "agent-pass" && !run.done.pass) run.skipped.push("pass")
          const tx = str(data.tx)
          push({
            at,
            node: "hedera",
            ok: true,
            text: `Paid ${amount} USDC via x402 on Hedera${typeof data.ms === "number" ? ` in ${(data.ms / 1000).toFixed(1)} s` : ""}`,
            proof: tx ? { label: "HashScan", href: links.hashscanTx(tx) } : undefined,
          })
        } else if (e.step === "failed") {
          push({ at, node: "hedera", ok: false, text: "Payment attempt failed; the agent will retry" })
        }
      }
      const [pay] = await d
        .select()
        .from(payments)
        .where(sql`lower(${payments.submissionKey}) = ${key}`)
        .limit(1)
      if (pay?.licenceKey) {
        push({
          at: (pay.updatedAt ?? pay.createdAt).toISOString(),
          node: "licence",
          ok: true,
          text: "Receipt and licence written to Arkiv, owned by the contributor",
          proof: { label: "Licence", href: links.arkivEntity(pay.licenceKey) },
        })
      }
    }
  }

  run.log.sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0))
  run.lastAt = run.log.at(-1)?.at ?? null
  return run
}
