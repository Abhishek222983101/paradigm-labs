// AES-256-GCM clip encryption and hashing helpers (Node only).
// Wire format: iv(12) ‖ ciphertext ‖ tag(16) — the same layout scripts/swarm-smoke.ts proved against Swarm.
import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from "node:crypto"

const IV = 12
const TAG = 16

export function newClipKey(): Buffer {
  return randomBytes(32)
}

export function encrypt(plain: Uint8Array, key: Uint8Array): Buffer {
  if (key.length !== 32) throw new Error("AES-256 key must be 32 bytes")
  const iv = randomBytes(IV)
  const c = createCipheriv("aes-256-gcm", key, iv)
  const ct = Buffer.concat([c.update(plain), c.final()])
  return Buffer.concat([iv, ct, c.getAuthTag()])
}

export function decrypt(blob: Uint8Array, key: Uint8Array): Buffer {
  if (blob.length < IV + TAG) throw new Error("ciphertext too short")
  const buf = Buffer.from(blob)
  const d = createDecipheriv("aes-256-gcm", key, buf.subarray(0, IV))
  d.setAuthTag(buf.subarray(buf.length - TAG))
  return Buffer.concat([d.update(buf.subarray(IV, buf.length - TAG)), d.final()])
}

export function sha256Hex(data: Uint8Array | string): string {
  return createHash("sha256").update(data).digest("hex")
}

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  return ab.length === bb.length && timingSafeEqual(ab, bb)
}
