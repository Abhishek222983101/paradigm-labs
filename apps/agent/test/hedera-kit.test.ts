import { describe, expect, it } from "vitest"
import { balanceFromKit, KIT_TOOLS } from "../src/hedera-kit"

const token = (token_id: string, balance: number, decimals: number) => ({
  automatic_association: true,
  created_timestamp: "0",
  token_id,
  freeze_status: "NOT_APPLICABLE",
  kyc_status: "NOT_APPLICABLE",
  balance,
  decimals,
  symbol: "USDC",
})

describe("hedera agent kit wiring", () => {
  it("loads only the HCS submit and balance query tools (no transfer tool)", () => {
    const methods = KIT_TOOLS.map((t) => t({}).method).sort()
    expect(methods).toEqual(["get_account_token_balances_query_tool", "submit_topic_message_tool"])
    expect(methods.some((m) => /transfer|airdrop|allowance/.test(m))).toBe(false)
  })

  it("converts the mirror-node base units to USDC", () => {
    expect(balanceFromKit({ tokens: [token("0.0.429274", 12_345_678, 6)] }, "0.0.429274")).toBeCloseTo(
      12.345678,
    )
  })

  it("treats a token the account does not hold as 0", () => {
    expect(balanceFromKit({ tokens: [token("0.0.1", 5, 0)] }, "0.0.429274")).toBe(0)
    expect(balanceFromKit(undefined, "0.0.429274")).toBe(0)
  })
})
