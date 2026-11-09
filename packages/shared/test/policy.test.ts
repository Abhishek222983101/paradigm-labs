import { describe, expect, it } from "vitest"
import { approvalValid, bindingHash, decide } from "../src/policy"

const base = {
  submissionKey: `0x${"a".repeat(64)}`,
  verdict: "accept",
  amountUsd: 3,
  payTo: "0.0.11333310",
  spentTodayUsd: 0,
}

describe("spending policy", () => {
  it("pays accepted clips within the auto limit", () => expect(decide(base).action).toBe("pay"))
  it("asks a human above the auto limit", () =>
    expect(decide({ ...base, amountUsd: 6 }).action).toBe("needs_human"))
  it("refuses above the hard cap even with a human", () =>
    expect(decide({ ...base, amountUsd: 11 }).action).toBe("skip"))
  it("refuses when the daily budget would be exceeded", () =>
    expect(decide({ ...base, spentTodayUsd: 18 }).reason).toMatch(/Daily budget/))
  it("never pays for non-accepted clips", () => {
    for (const v of ["reject", "review", "duplicate"])
      expect(decide({ ...base, verdict: v }).action).toBe("skip")
  })
  it("refuses non-Hedera payees and bad prices", () => {
    expect(decide({ ...base, payTo: "0xabc" }).action).toBe("skip")
    expect(decide({ ...base, amountUsd: -1 }).action).toBe("skip")
    expect(decide({ ...base, amountUsd: Number.NaN }).action).toBe("skip")
  })
  it("honours an allow-list", () =>
    expect(
      decide(base, { autoLimitUsd: 5, hardCapUsd: 10, dailyBudgetUsd: 20, allowedPayees: ["0.0.1"] }).action,
    ).toBe("skip"))
})

describe("approval binding", () => {
  const h = bindingHash(base)
  it("binding changes with amount, payee or clip", () => {
    expect(bindingHash({ ...base, amountUsd: 3.01 })).not.toBe(h)
    expect(bindingHash({ ...base, payTo: "0.0.1" })).not.toBe(h)
    expect(bindingHash({ ...base, submissionKey: `0x${"b".repeat(64)}` })).not.toBe(h)
  })
  it("an approval unlocks only its own payment, only while fresh", () => {
    const now = Date.now()
    const a = { status: "approved", bindingHash: h, authTime: new Date(now - 60_000) }
    expect(approvalValid(a, h, now)).toBe(true)
    expect(approvalValid(a, bindingHash({ ...base, amountUsd: 9 }), now)).toBe(false)
    expect(approvalValid({ ...a, authTime: new Date(now - 10 * 60_000) }, h, now)).toBe(false)
    expect(approvalValid({ ...a, status: "denied" }, h, now)).toBe(false)
    expect(approvalValid({ ...a, authTime: null }, h, now)).toBe(false)
  })
})
