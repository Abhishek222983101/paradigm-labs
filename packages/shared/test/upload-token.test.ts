import { describe, expect, it } from "vitest"
import { issueUploadToken, verifyUploadToken } from "../src/upload-token"

const secret = "s".repeat(48)
const claim = `0x${"1".repeat(64)}`
const task = `0x${"2".repeat(64)}`

describe("upload tokens", () => {
  it("round-trips", () => {
    const t = issueUploadToken({ claim, task }, secret)
    const v = verifyUploadToken(t.token, secret)
    expect(v.ok).toBe(true)
    if (v.ok) {
      expect(v.payload.claim).toBe(claim)
      expect(v.tokenHash).toBe(t.tokenHash)
    }
  })
  it("rejects a tampered payload", () => {
    const { token } = issueUploadToken({ claim, task }, secret)
    const [body, sig] = token.split(".")
    const forged = Buffer.from(
      Buffer.from(body as string, "base64url")
        .toString()
        .replace("1111", "3333"),
    ).toString("base64url")
    expect(verifyUploadToken(`${forged}.${sig}`, secret)).toEqual({ ok: false, reason: "bad_signature" })
  })
  it("rejects the wrong secret", () => {
    const { token } = issueUploadToken({ claim, task }, secret)
    expect(verifyUploadToken(token, "x".repeat(48)).ok).toBe(false)
  })
  it("expires after 15 minutes", () => {
    const now = Date.now()
    const { token } = issueUploadToken({ claim, task }, secret, now)
    expect(verifyUploadToken(token, secret, now + 16 * 60_000)).toEqual({ ok: false, reason: "expired" })
  })
  it("rejects garbage", () => {
    expect(verifyUploadToken("abc", secret).ok).toBe(false)
    expect(verifyUploadToken("a.b.c", secret).ok).toBe(false)
    expect(verifyUploadToken("x".repeat(600), secret).ok).toBe(false)
  })
})
