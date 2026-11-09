import { describe, expect, it } from "vitest"
import { decodeChallenge, encodeChallenge, newChallenge } from "../src/challenge"
import { decrypt, encrypt, newClipKey, sha256Hex } from "../src/crypto"
import { rubricSchema, TOWEL_RUBRIC } from "../src/rubric"

describe("crypto", () => {
  it("AES-GCM round-trips and detects tampering", () => {
    const key = newClipKey()
    const plain = Buffer.from("towel clip bytes")
    const blob = encrypt(plain, key)
    expect(decrypt(blob, key).equals(plain)).toBe(true)
    blob[15] = (blob[15] as number) ^ 1
    expect(() => decrypt(blob, key)).toThrow()
  })
  it("sha256", () => expect(sha256Hex("abc")).toMatch(/^ba7816bf/))
})

describe("challenge", () => {
  it("encodes and decodes", () => {
    for (let i = 0; i < 50; i++) {
      const c = newChallenge()
      expect(decodeChallenge(encodeChallenge(c))).toEqual(c)
      expect(c.fingers).toBeGreaterThanOrEqual(1)
      expect(c.fingers).toBeLessThanOrEqual(5)
    }
  })
})

describe("rubric", () => {
  it("towel rubric is valid", () => expect(rubricSchema.parse(TOWEL_RUBRIC)).toBeTruthy())
})
