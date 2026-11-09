// Every agent decision goes two places: the console feed (Neon events, scope "agent") and the public spend
// log on Hedera Consensus Service. Claude Haiku writes a one-line plain explanation; it never decides.

import type { dbPool } from "@adx/db"
import { events } from "@adx/db"
import { operatorClient } from "@adx/shared/hedera"
import { TopicMessageSubmitTransaction } from "@hiero-ledger/sdk"
import { kitSubmitTopicMessage } from "./hedera-kit"

type DB = ReturnType<typeof dbPool>
export type AgentAction =
  | "paid"
  | "needs_human"
  | "approved"
  | "declined"
  | "skipped"
  | "failed"
  | "task_posted"
  | "heartbeat"

/** Plain facts in words, so the note can't misread a field (e.g. call a human approval "automatic"). */
function plain(action: AgentAction, f: Record<string, unknown>): Record<string, unknown> {
  const amount = f.amount !== undefined ? `${f.amount} USDC` : undefined
  const how =
    f.approval === "agent-pass"
      ? "a human approved it with World ID (World Agent Pass) before I paid"
      : f.approval === "auto"
        ? "it was within my 5 USDC limit, so I paid on my own"
        : undefined
  return {
    whatHappened: action,
    amount,
    paidTo: f.payTo ? `the person who filmed the clip (Hedera account ${f.payTo})` : undefined,
    approval: how,
    reason: f.reason,
  }
}

/** Used when Claude is unavailable, or its sentence contradicts the facts. */
function template(action: AgentAction, f: Record<string, unknown>): string | null {
  const amt = `${f.amount} USDC`
  switch (action) {
    case "paid":
      return f.approval === "agent-pass"
        ? `Paid ${amt} to the person who filmed the clip after you approved it with World ID.`
        : `Paid ${amt} to the person who filmed the clip on my own; it was within my limit.`
    case "needs_human":
      return `Paused a ${amt} payment: it's above my 5 USDC limit, so a human must approve it.`
    case "approved":
      return `A human approved the ${amt} payment with World ID, so I'm paying now.`
    case "declined":
      return `Did not pay ${amt}: ${String(f.reason ?? "it was not approved")}.`
    default:
      return null
  }
}

function contradicts(note: string, f: Record<string, unknown>): boolean {
  if (f.approval === "agent-pass" && /automatic|on my own|without (a )?human/i.test(note)) return true
  if (f.approval === "auto" && /\byou approved|world id/i.test(note)) return true
  if (/vendor|merchant/i.test(note)) return true
  if (f.amount !== undefined && !note.includes(String(f.amount))) return true
  return false
}

export async function explain(action: AgentAction, facts: Record<string, unknown>): Promise<string | null> {
  const key = process.env.ANTHROPIC_API_KEY
  if (action === "heartbeat") return null
  const fallback = template(action, facts)
  if (!key) return fallback
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: process.env.AGENT_MODEL ?? "claude-haiku-5-5",
        max_tokens: 60,
        system:
          "You are the buying agent for a robot team that buys training clips filmed by people. In one short plain sentence (max 18 words), tell your human what you just did and why. Use only the facts given and keep their meaning exactly: if a human approved, say so; never call it automatic. Write money as '<n> USDC'. The money goes to the person who filmed the clip, never call them a vendor. No jargon, no emojis, never invent numbers or limits. If the reason is a technical error, say it was a technical problem, not a team rule.",
        messages: [{ role: "user", content: JSON.stringify(plain(action, facts)) }],
      }),
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return fallback
    const j = (await res.json()) as { content?: Array<{ text?: string }> }
    const note = j.content?.[0]?.text?.trim().slice(0, 200)
    if (!note || contradicts(note, facts)) return fallback
    return note
  } catch {
    return fallback
  }
}

/**
 * Write one spend-log message to HCS through the Hedera Agent Kit's submit-topic-message tool. If the kit
 * fails, fall back to a plain Hiero SDK submit so the public log never goes quiet. Returns the tx id.
 */
export async function submitSpendLog(topic: string, msg: string): Promise<string | undefined> {
  try {
    return await kitSubmitTopicMessage(topic, msg)
  } catch (e) {
    console.error("[hcs] agent kit submit failed, using SDK:", (e as Error).message)
  }
  try {
    const c = operatorClient()
    const r = await new TopicMessageSubmitTransaction().setTopicId(topic).setMessage(msg).execute(c)
    await r.getReceipt(c)
    return r.transactionId.toString()
  } catch (e) {
    console.error("[hcs]", (e as Error).message)
    return undefined
  }
}

export async function record(db: DB, action: AgentAction, facts: Record<string, unknown>) {
  const note = await explain(action, facts)
  let hcsTx: string | undefined
  const topic = process.env.HEDERA_SPEND_TOPIC_ID
  if (topic && action !== "heartbeat") {
    const msg = JSON.stringify({ v: 1, t: new Date().toISOString(), action, ...facts }).slice(0, 1000)
    hcsTx = await submitSpendLog(topic, msg)
  }
  await db.insert(events).values({
    scope: "agent",
    step: action,
    ok: action !== "failed" && action !== "declined",
    data: { ...facts, note, hcsTx },
  })
  console.log(JSON.stringify({ evt: action, ...facts, hcsTx }))
}
