// Paradigm buyer agent. Every few seconds:
//   1. find accepted clips for our tasks that aren't paid, declined or awaiting a human
//   2. discover price + payee from the x402 challenge, ask the policy (pure code) what to do
//   3. pay automatically within the limit, or open a World Agent Pass approval above it
//   4. poll open approvals: approved → pay (bound to that exact payment); denied/expired → nothing paid
//   5. keep the verifier listing alive on Arkiv (heartbeat)
import { approvals, dbPool, eq, sql } from "@adx/db"
import { liveVerifiers, safeExtend } from "@adx/shared/arkiv"
import { approvalValid, DEFAULT_POLICY, type Decision, decide } from "@adx/shared/policy"
import { ExpirationTime } from "@arkiv-network/sdk"
import { pollApproval, startApproval } from "./approval"
import { kitUsdcBalance } from "./hedera-kit"
import { record } from "./log"
import { discover, payFor } from "./pay"

const db = dbPool(3)
const BASE = (process.env.AGENT_TARGET_URL ?? "https://adx-paradigm.vercel.app").replace(/\/$/, "")
const TICK_MS = Number(process.env.AGENT_TICK_MS ?? 5000)
const policy = {
  ...DEFAULT_POLICY,
  autoLimitUsd: Number(process.env.AGENT_AUTO_LIMIT ?? DEFAULT_POLICY.autoLimitUsd),
  dailyBudgetUsd: Number(process.env.AGENT_DAILY_BUDGET ?? DEFAULT_POLICY.dailyBudgetUsd),
}

async function spentToday(): Promise<number> {
  const r = await db.execute(
    sql`select coalesce(sum(amount),0)::float as s from payments where status = 'settled' and updated_at >= date_trunc('day', now() at time zone 'utc')`,
  )
  return Number((r.rows[0] as { s: number }).s)
}

/** Accepted clips with no payment row yet and no open approval. */
async function candidates(): Promise<Array<{ submissionKey: string; jobId: string }>> {
  const r = await db.execute(sql`
    select j.submission_key, j.id from jobs j
    where j.status = 'accepted' and j.submission_key is not null
      and not exists (select 1 from payments p where lower(p.submission_key) = lower(j.submission_key) and p.status in ('settled','settling','declined'))
      and not exists (select 1 from approvals a where lower(a.submission_key) = lower(j.submission_key) and a.status = 'pending')
    order by j.created_at limit 5`)
  return r.rows.map((x) => ({
    submissionKey: String((x as Record<string, unknown>).submission_key),
    jobId: String((x as Record<string, unknown>).id),
  }))
}

// Failed payments back off (30 s, 2 min, 5 min) and give up after 3 tries; only the first failure and the
// final give-up are logged, so a broken payment can't flood the feed or the spend log.
const failures = new Map<string, { count: number; nextTry: number }>()
const BACKOFF_MS = [30_000, 120_000, 300_000]

// USDC pre-check (Hedera Agent Kit balance query on the buyer account pay.ts pays from). Read-only: it can
// only hold a payment back, never start one. If the query itself fails we pay as before, so a mirror-node
// hiccup can't stall the demo. A low balance is logged once per clip and retried every minute.
const LOW_FUNDS_RETRY_MS = 60_000
const lowFundsLogged = new Set<string>()

async function hasEnoughUsdc(amountUsd: number): Promise<{ ok: boolean; balance?: number }> {
  const buyer = process.env.HEDERA_BUYER_ID
  if (!buyer) return { ok: true }
  try {
    const balance = await kitUsdcBalance(buyer)
    return { ok: balance >= amountUsd, balance }
  } catch (e) {
    console.error(JSON.stringify({ evt: "balance_check_error", msg: (e as Error).message?.slice(0, 200) }))
    return { ok: true }
  }
}

async function pay(
  submissionKey: string,
  decision: Decision,
  approval: "auto" | "agent-pass",
  offer: { amountUsd: number; payTo: string },
) {
  const funds = await hasEnoughUsdc(offer.amountUsd)
  if (!funds.ok) {
    const f = failures.get(submissionKey) ?? { count: 0, nextTry: 0 }
    f.nextTry = Date.now() + LOW_FUNDS_RETRY_MS
    failures.set(submissionKey, f)
    if (!lowFundsLogged.has(submissionKey)) {
      lowFundsLogged.add(submissionKey)
      await record(db, "skipped", {
        submissionKey,
        amount: offer.amountUsd,
        balance: funds.balance,
        reason: "Not enough USDC in the agent's account",
      })
    }
    return
  }
  lowFundsLogged.delete(submissionKey)
  try {
    const paid = await payFor(`${BASE}/api/x402/clip/${submissionKey}`, decision, approval)
    failures.delete(submissionKey)
    await record(db, "paid", {
      submissionKey,
      amount: offer.amountUsd,
      payTo: offer.payTo,
      tx: paid.tx,
      approval,
      ms: paid.ms,
    })
  } catch (e) {
    const f = failures.get(submissionKey) ?? { count: 0, nextTry: 0 }
    f.count += 1
    f.nextTry = Date.now() + (BACKOFF_MS[f.count - 1] ?? 600_000)
    failures.set(submissionKey, f)
    const reason = (e as Error).message.slice(0, 200)
    if (f.count === 1)
      await record(db, "failed", { submissionKey, amount: offer.amountUsd, reason, attempt: 1 })
    if (f.count >= 3) {
      await db.execute(
        sql`insert into payments (submission_key, amount, pay_to, status) values (${submissionKey}, ${offer.amountUsd}, ${offer.payTo}, 'declined') on conflict (submission_key) do update set status = 'declined'`,
      )
      await record(db, "failed", {
        submissionKey,
        amount: offer.amountUsd,
        reason: `Gave up after 3 tries: ${reason}`,
        attempt: 3,
      })
    }
  }
}

async function handleNew() {
  for (const c of await candidates()) {
    const f = failures.get(c.submissionKey)
    if (f && Date.now() < f.nextTry) continue
    const url = `${BASE}/api/x402/clip/${c.submissionKey}`
    const offer = await discover(url).catch(() => null)
    if (!offer) continue
    const decision = decide(
      {
        submissionKey: c.submissionKey,
        verdict: "accept",
        amountUsd: offer.amountUsd,
        payTo: offer.payTo,
        spentTodayUsd: await spentToday(),
      },
      policy,
    )
    if (decision.action === "pay") {
      await pay(c.submissionKey, decision, "auto", offer)
    } else if (decision.action === "needs_human") {
      const message = `Approve ${offer.amountUsd} USDC to ${offer.payTo} for a robot-training clip`
      const dev = await startApproval(message)
      const [row] = await db
        .insert(approvals)
        .values({
          bindingHash: decision.bindingHash,
          amount: String(offer.amountUsd),
          payTo: offer.payTo,
          submissionKey: c.submissionKey,
          status: "pending",
          deviceCode: dev.deviceCode,
          userCode: dev.userCode,
          verificationUri: dev.verificationUriComplete,
        })
        .returning({ id: approvals.id })
      await record(db, "needs_human", {
        submissionKey: c.submissionKey,
        amount: offer.amountUsd,
        payTo: offer.payTo,
        approvalId: row?.id,
        reason: decision.reason,
      })
    } else {
      await db.execute(
        sql`insert into payments (submission_key, amount, pay_to, status) values (${c.submissionKey}, ${offer.amountUsd}, ${offer.payTo}, 'declined') on conflict (submission_key) do nothing`,
      )
      await record(db, "skipped", {
        submissionKey: c.submissionKey,
        amount: offer.amountUsd,
        reason: decision.reason,
      })
    }
  }
}

async function handleApprovals() {
  const open = await db.select().from(approvals).where(eq(approvals.status, "pending")).limit(10)
  for (const a of open) {
    if (!a.deviceCode) continue
    const r = await pollApproval(a.deviceCode)
    if (r.state === "pending") continue
    if (r.state === "approved") {
      await db
        .update(approvals)
        .set({
          status: "approved",
          approverSub: r.sub,
          acr: r.acr,
          authTime: r.authTime,
          decidedAt: new Date(),
        })
        .where(eq(approvals.id, a.id))
      // Re-discover and re-decide: the approval only unlocks the exact payment it was bound to.
      const url = `${BASE}/api/x402/clip/${a.submissionKey}`
      const offer = await discover(url).catch(() => null)
      const decision = offer
        ? decide(
            {
              submissionKey: a.submissionKey,
              verdict: "accept",
              amountUsd: offer.amountUsd,
              payTo: offer.payTo,
              spentTodayUsd: await spentToday(),
            },
            policy,
          )
        : null
      if (
        !offer ||
        !decision ||
        !approvalValid(
          { status: "approved", bindingHash: a.bindingHash, authTime: r.authTime },
          decision.bindingHash,
        )
      ) {
        await record(db, "declined", {
          submissionKey: a.submissionKey,
          approvalId: a.id,
          reason: "The approved payment no longer matches",
        })
        continue
      }
      await record(db, "approved", {
        submissionKey: a.submissionKey,
        approvalId: a.id,
        amount: offer.amountUsd,
        acr: r.acr,
      })
      await pay(a.submissionKey, decision, "agent-pass", offer)
    } else {
      await db
        .update(approvals)
        .set({ status: r.state === "expired" ? "expired" : "denied", decidedAt: new Date() })
        .where(eq(approvals.id, a.id))
      await db.execute(
        sql`insert into payments (submission_key, amount, pay_to, status, approval_id) values (${a.submissionKey}, ${a.amount}, ${a.payTo}, 'declined', ${a.id}) on conflict (submission_key) do nothing`,
      )
      await record(db, "declined", {
        submissionKey: a.submissionKey,
        approvalId: a.id,
        amount: Number(a.amount),
        reason: r.reason,
      })
    }
  }
}

let lastHeartbeat = 0
async function heartbeat() {
  if (Date.now() - lastHeartbeat < 60 * 60_000) return
  lastHeartbeat = Date.now()
  const listings = (
    await Promise.all(["towel-fold", "shirt-fold"].map((s) => liveVerifiers(s).catch(() => [])))
  ).flat()
  for (const l of listings)
    await safeExtend("verifier", l.key, ExpirationTime.fromHours(24)).catch(() => undefined)
  console.log(JSON.stringify({ evt: "heartbeat", listings: listings.length }))
}

let busy = false
async function tick() {
  if (busy) return
  busy = true
  try {
    await handleApprovals()
    await handleNew()
    await heartbeat()
  } catch (e) {
    console.error(JSON.stringify({ evt: "tick_error", msg: (e as Error).message?.slice(0, 200) }))
  } finally {
    busy = false
  }
}

console.log(JSON.stringify({ evt: "agent_start", target: BASE, policy }))
void tick()
setInterval(tick, TICK_MS)
