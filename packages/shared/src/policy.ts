// The buyer agent's spending policy (system architecture §12). A pure function: no network, no LLM.
// The agent's AI writes text; only this decides whether money moves.
import { createHash } from "node:crypto"

export type Policy = {
  autoLimitUsd: number // pay without a human up to this, per clip
  hardCapUsd: number // never pay more than this per clip, even with approval
  dailyBudgetUsd: number // total per UTC day, approvals included
  allowedPayees?: string[] // optional allow-list of Hedera accounts
}

export const DEFAULT_POLICY: Policy = { autoLimitUsd: 5, hardCapUsd: 10, dailyBudgetUsd: 20 }

export type PayRequest = {
  submissionKey: string
  verdict: string
  amountUsd: number
  payTo: string
  spentTodayUsd: number
}

export type Decision =
  | { action: "pay"; reason: string; bindingHash: string }
  | { action: "needs_human"; reason: string; bindingHash: string }
  | { action: "skip"; reason: string; bindingHash: string }

/** sha256(amount|payTo|submission): an approval is valid only for exactly this payment. */
export function bindingHash(r: Pick<PayRequest, "amountUsd" | "payTo" | "submissionKey">): string {
  return createHash("sha256")
    .update(`${r.amountUsd.toFixed(6)}|${r.payTo}|${r.submissionKey.toLowerCase()}`)
    .digest("hex")
}

export function decide(r: PayRequest, p: Policy = DEFAULT_POLICY): Decision {
  const h = bindingHash(r)
  const out = (action: Decision["action"], reason: string) => ({ action, reason, bindingHash: h }) as Decision
  if (r.verdict !== "accept") return out("skip", "Only accepted clips are paid for")
  if (!Number.isFinite(r.amountUsd) || r.amountUsd <= 0) return out("skip", "Invalid price")
  if (!/^0\.0\.\d+$/.test(r.payTo)) return out("skip", "Payee isn't a Hedera account")
  if (p.allowedPayees && !p.allowedPayees.includes(r.payTo))
    return out("skip", "Payee isn't on the allow-list")
  if (r.amountUsd > p.hardCapUsd) return out("skip", `Above the hard cap of ${p.hardCapUsd} USDC`)
  if (r.spentTodayUsd + r.amountUsd > p.dailyBudgetUsd)
    return out("skip", `Daily budget of ${p.dailyBudgetUsd} USDC reached`)
  if (r.amountUsd > p.autoLimitUsd) {
    return out(
      "needs_human",
      `${r.amountUsd} USDC is above the ${p.autoLimitUsd} USDC limit: a human must approve`,
    )
  }
  return out("pay", `${r.amountUsd} USDC is within the ${p.autoLimitUsd} USDC limit`)
}

/** An approval only unlocks the payment it was bound to, and only while fresh. */
export function approvalValid(
  a: { status: string; bindingHash: string; authTime: Date | null },
  expectedBinding: string,
  now = Date.now(),
  maxAgeS = 300,
): boolean {
  return (
    a.status === "approved" &&
    a.bindingHash === expectedBinding &&
    !!a.authTime &&
    now - a.authTime.getTime() <= maxAgeS * 1000
  )
}
