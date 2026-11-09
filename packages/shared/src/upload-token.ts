// Single-use upload tokens. Format: base64url(payload).base64url(hmac-sha256(payload)).
// The worker verifies the signature + expiry here; single use is enforced by the upload_tokens row in Neon.
import { createHmac, randomBytes } from "node:crypto"
import { z } from "zod"
import { safeEqual, sha256Hex } from "./crypto"

const payloadSchema = z.object({
  v: z.literal(1),
  claim: z.string().regex(/^0x[0-9a-f]{64}$/i),
  task: z.string().regex(/^0x[0-9a-f]{64}$/i),
  exp: z.number().int(),
  n: z.string().length(22),
})
export type UploadTokenPayload = z.infer<typeof payloadSchema>

export const UPLOAD_TOKEN_TTL_S = 15 * 60

const b64u = (b: Buffer | string) => Buffer.from(b).toString("base64url")

function sign(body: string, secret: string) {
  return createHmac("sha256", secret).update(body).digest("base64url")
}

export function issueUploadToken(
  input: { claim: string; task: string },
  secret: string,
  now = Date.now(),
): { token: string; tokenHash: string; expiresAt: Date } {
  if (secret.length < 32) throw new Error("UPLOAD_TOKEN_SECRET too short")
  const payload: UploadTokenPayload = {
    v: 1,
    claim: input.claim.toLowerCase(),
    task: input.task.toLowerCase(),
    exp: Math.floor(now / 1000) + UPLOAD_TOKEN_TTL_S,
    n: randomBytes(16).toString("base64url"),
  }
  const body = b64u(JSON.stringify(payload))
  const token = `${body}.${sign(body, secret)}`
  return { token, tokenHash: hashUploadToken(token), expiresAt: new Date(payload.exp * 1000) }
}

export type VerifyResult =
  | { ok: true; payload: UploadTokenPayload; tokenHash: string }
  | { ok: false; reason: "malformed" | "bad_signature" | "expired" }

export function verifyUploadToken(token: string, secret: string, now = Date.now()): VerifyResult {
  if (typeof token !== "string" || token.length > 512) return { ok: false, reason: "malformed" }
  const parts = token.split(".")
  if (parts.length !== 2 || !parts[0] || !parts[1]) return { ok: false, reason: "malformed" }
  const [body, sig] = parts as [string, string]
  if (!safeEqual(sig, sign(body, secret))) return { ok: false, reason: "bad_signature" }
  let parsed: unknown
  try {
    parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8"))
  } catch {
    return { ok: false, reason: "malformed" }
  }
  const res = payloadSchema.safeParse(parsed)
  if (!res.success) return { ok: false, reason: "malformed" }
  if (res.data.exp * 1000 < now) return { ok: false, reason: "expired" }
  return { ok: true, payload: res.data, tokenHash: hashUploadToken(token) }
}

/** We store only the hash in Neon, so a DB leak can't be replayed as upload tokens. */
export function hashUploadToken(token: string): string {
  return sha256Hex(token)
}
