import { str } from "@arkiv-network/sdk/schema"
import { describe, expect, it } from "vitest"
import { assertPublicSafe, UnsafeArkivWrite } from "../src/arkiv/guard"

const ok = (v: Record<string, unknown>) => expect(() => assertPublicSafe("adx.test", v)).not.toThrow()
const bad = (v: Record<string, unknown>) =>
  expect(() => assertPublicSafe("adx.test", v)).toThrow(UnsafeArkivWrite)
const hex64 = "a".repeat(64)

describe("write guard", () => {
  it("passes normal task values", () => {
    ok({
      title: str("Fold a towel, top-down"),
      status: "open",
      reward: 3n,
      slots: 3,
      rubricHash: hex64,
      swarmRef: hex64,
    })
  })
  it("passes a Hedera tx id", () => ok({ hederaTx: "0.0.9185802@1793933035.147018991" }))
  it("rejects a 0x 32-byte hex in title (private key / nullifier)", () => bad({ title: `0x${hex64}` }))
  it("rejects a bare 64-hex outside hash/ref columns", () => bad({ title: hex64 }))
  it("rejects 128-hex (encrypted swarm ref)", () => bad({ swarmRef: "b".repeat(128) }))
  it("rejects forbidden column names", () => {
    bad({ nullifier: "x" })
    bad({ apiKey: "x" })
    bad({ userEmail: "x" })
    bad({ uploadToken: "x" })
  })
  it("rejects emails and phone numbers", () => {
    bad({ title: "contact me at a.b@example.com" })
    bad({ title: "call +91 98765 43210" })
  })
  it("rejects API keys and JWTs", () => {
    bad({ model: "sk-ant-abcdefghijklmnop" })
    bad({ model: "AIzaSyD-abcdefghijklmnopqrst" })
    bad({ approval: "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIxMjM0NSJ9.c2lnbmF0dXJlLWhlcmU" })
  })
  it("scans bytes columns too (evidence JSON)", () => {
    bad({ evidence: new TextEncoder().encode(JSON.stringify({ leaked: `0x${hex64}` })) })
    ok({
      evidence: new TextEncoder().encode(
        JSON.stringify({ steps: [{ name: "first_fold", t: "00:04" }], rubricHash: hex64 }),
      ),
    })
  })
  it("allows fingerprints in their exact format only", () => {
    ok({ dhash: "0123456789abcdef|1234567890123456|fedcba9876543210", dhashA: "0123" })
    bad({ dhash: "call me +91 98765 43210" })
    bad({ dhashA: "12345" })
  })
  it("rejects strings over 128 bytes", () => bad({ title: "x".repeat(129) }))
  it("never echoes the value in the error", () => {
    try {
      assertPublicSafe("adx.test", { title: `0x${hex64}` })
    } catch (e) {
      expect(String((e as Error).message)).not.toContain(hex64)
    }
  })
})
