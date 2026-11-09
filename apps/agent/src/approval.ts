// World Agent Pass approvals (system architecture §13.3): OAuth device authorization grant against
// auth.world.org. The agent asks; a human opens the link on their phone and approves with World ID; the agent
// gets a signed id_token. We verify it ourselves (issuer, audience, RS256 via JWKS, acr, fresh auth_time).
// Denied, expired or invalid → nothing is paid. A server error is never treated as approval.
import { createRemoteJWKSet, jwtVerify } from "jose"

const ISSUER = "https://auth.world.org"
const DEVICE = `${ISSUER}/api/v1/device_authorization`
const TOKEN = `${ISSUER}/api/v1/token`
const JWKS = createRemoteJWKSet(new URL(`${ISSUER}/.well-known/jwks.json`))
// Orb-verified humans only (the face variant is also accepted if World upgrades the check).
const ACCEPTED_ACR = ["https://world.org/oidc/acr/orb", "https://world.org/oidc/acr/orb-face"]

function creds() {
  const id = process.env.WORLD_AGENTPASS_CLIENT_ID
  const secret = process.env.WORLD_AGENTPASS_CLIENT_SECRET
  if (!id || !secret) throw new Error("WORLD_AGENTPASS_CLIENT_ID / _SECRET not set")
  return { id, auth: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}` }
}

export type DeviceRequest = {
  deviceCode: string
  userCode: string
  verificationUri: string
  verificationUriComplete: string
  expiresIn: number
  interval: number
}

export async function startApproval(message: string): Promise<DeviceRequest> {
  const { id, auth } = creds()
  const res = await fetch(DEVICE, {
    method: "POST",
    headers: { authorization: auth, "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: id,
      scope: "openid",
      // Essential Orb class (no face check): World offers "Continue with World ID" (one tap in World App) next
      // to passkey. Without it, World falls back to our portal default "Orb with face check", which hides the
      // World ID button and needs a selfie match. The returned acr is checked below.
      claims: JSON.stringify({ id_token: { acr: { essential: true, values: ACCEPTED_ACR } } }),
      max_age: "0",
      binding_message: message.slice(0, 120),
    }),
    signal: AbortSignal.timeout(15_000),
  })
  if (!res.ok) throw new Error(`device_authorization ${res.status}`)
  const j = (await res.json()) as Record<string, string | number>
  return {
    deviceCode: String(j.device_code),
    userCode: String(j.user_code),
    verificationUri: String(j.verification_uri),
    verificationUriComplete: String(j.verification_uri_complete ?? j.verification_uri),
    expiresIn: Number(j.expires_in ?? 1200),
    interval: Number(j.interval ?? 5),
  }
}

export type PollResult =
  | { state: "pending" }
  | { state: "approved"; sub: string; acr: string; authTime: Date }
  | { state: "denied" | "expired" | "invalid"; reason: string }

export async function pollApproval(deviceCode: string): Promise<PollResult> {
  const { id, auth } = creds()
  const res = await fetch(TOKEN, {
    method: "POST",
    headers: { authorization: auth, "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:device_code",
      device_code: deviceCode,
      client_id: id,
    }),
    signal: AbortSignal.timeout(15_000),
  }).catch(() => null)
  if (!res) return { state: "pending" } // network blip: try again next tick, never "approve"
  const j = (await res.json().catch(() => ({}))) as { error?: string; id_token?: string }
  if (!res.ok) {
    if (j.error === "authorization_pending" || j.error === "slow_down") return { state: "pending" }
    if (j.error === "access_denied") return { state: "denied", reason: "The approver declined" }
    if (j.error === "expired_token") return { state: "expired", reason: "Nobody approved within 20 minutes" }
    if (res.status >= 500) return { state: "pending" }
    return { state: "invalid", reason: j.error ?? `token ${res.status}` }
  }
  if (!j.id_token) return { state: "invalid", reason: "No id_token" }
  try {
    const { payload } = await jwtVerify(j.id_token, JWKS, {
      issuer: ISSUER,
      audience: id,
      algorithms: ["RS256"],
    })
    const acr = String(payload.acr ?? "")
    if (!ACCEPTED_ACR.includes(acr))
      return { state: "invalid", reason: `World ID level not accepted: ${acr || "none"}` }
    const authTime = new Date(Number(payload.auth_time ?? payload.iat ?? 0) * 1000)
    if (Date.now() - authTime.getTime() > 5 * 60_000)
      return { state: "invalid", reason: "The World ID check is too old" }
    return { state: "approved", sub: String(payload.sub), acr, authTime }
  } catch (e) {
    return { state: "invalid", reason: `id_token rejected: ${(e as Error).message.slice(0, 80)}` }
  }
}
