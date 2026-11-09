// World ID (IDKit 4) on the server: RP request signing and proof verification.
// Verification is hard-wired to developer.world.org and our own RP ID; nothing about it comes from the client.
import "server-only"
import { hashSignal } from "@worldcoin/idkit/hashing"
import { signRequest } from "@worldcoin/idkit-server"
import { z } from "zod"
import { fail } from "./api"

const worldEnv = z.object({
  WORLD_APP_ID: z.string().startsWith("app_"),
  WORLD_RP_ID: z.string().startsWith("rp_"),
  WORLD_SIGNING_KEY: z.string().regex(/^(0x)?[0-9a-fA-F]{64}$/),
  WORLD_ACTION: z.string().min(1).default("claim-task"),
  WORLD_ENV: z.enum(["production", "staging"]).default("staging"),
})

export function world() {
  const r = worldEnv.safeParse(process.env)
  if (!r.success) {
    console.error("[world] env missing:", r.error.issues.map((i) => i.path.join(".")).join(", "))
    fail(503, "world_unconfigured", "World ID isn't configured on this deployment yet")
  }
  return r.data
}

export function rpContext() {
  const w = world()
  const { sig, nonce, createdAt, expiresAt } = signRequest({
    signingKeyHex: w.WORLD_SIGNING_KEY.replace(/^0x/, ""),
    action: w.WORLD_ACTION,
    ttl: 300,
  })
  return { rp_id: w.WORLD_RP_ID, nonce, created_at: createdAt, expires_at: expiresAt, signature: sig }
}

/** Minimal structural check of the IDKit result before we forward it. */
export const idkitResultSchema = z
  .object({
    protocol_version: z.enum(["3.0", "4.0"]),
    nonce: z.string().min(1).max(200),
    action: z.string().max(200).optional(),
    environment: z.string().max(20).optional(),
    responses: z
      .array(
        z
          .object({ identifier: z.string().max(40), signal_hash: z.string().max(80).optional() })
          .passthrough(),
      )
      .min(1)
      .max(4),
  })
  .passthrough()
export type IdkitResult = z.infer<typeof idkitResultSchema>

/**
 * Check what the Developer Portal does NOT check for us (action, environment, signal binding), then
 * forward the result unmodified to POST /api/v4/verify/{rp_id}. Returns the verified nullifier.
 */
export async function verifyClaimProof(result: IdkitResult, expectedSignal: string): Promise<string> {
  const w = world()
  if (result.action !== w.WORLD_ACTION)
    fail(400, "wrong_action", "This World ID proof was made for a different action")
  if ((result.environment ?? "production") !== w.WORLD_ENV) {
    fail(400, "wrong_environment", "This World ID proof comes from the wrong environment")
  }
  const expectedHash = hashSignal(expectedSignal).toLowerCase()
  const bound = result.responses.every((r) => (r.signal_hash ?? "").toLowerCase() === expectedHash)
  if (!bound) fail(400, "signal_mismatch", "This World ID proof isn't for this task and wallet")

  const res = await fetch(`https://developer.world.org/api/v4/verify/${w.WORLD_RP_ID}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(result),
    signal: AbortSignal.timeout(15_000),
  }).catch(() => fail(503, "world_unreachable", "World ID verification is unreachable. Try again."))

  const body = (await res.json().catch(() => ({}))) as {
    success?: boolean
    nullifier?: string
    action?: string
    environment?: string
    code?: string
    detail?: string
    results?: Array<{ success?: boolean; nullifier?: string; code?: string }>
  }
  if (!res.ok || body.success !== true) {
    console.warn("[world] verify rejected", res.status, body.code)
    const code = body.code ?? body.results?.find((r) => r.code)?.code ?? "verification_failed"
    if (code === "max_verifications_reached")
      fail(409, "already_verified", "You already hold a slot on this task")
    fail(400, "world_rejected", "World ID couldn't verify this proof. Try again from the start.")
  }
  if (body.environment && body.environment !== w.WORLD_ENV)
    fail(400, "wrong_environment", "Wrong World ID environment")
  if (body.action && body.action !== w.WORLD_ACTION) fail(400, "wrong_action", "Wrong World ID action")
  const nullifier = body.nullifier ?? body.results?.find((r) => r.success && r.nullifier)?.nullifier
  if (!nullifier) fail(502, "no_nullifier", "World ID returned no nullifier")
  return nullifier.toLowerCase()
}
