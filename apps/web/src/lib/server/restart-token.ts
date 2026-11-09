// One-time "start over" pass. Issued only right after a person proved their World ID and was recognised as
// already holding a slot, so Start over doesn't need a second World ID proof. Bound to task + wallet + the
// previous claim row, expires in 2 minutes, HMAC-signed with a key derived from UPLOAD_TOKEN_SECRET.
import "server-only"
import { createHmac, timingSafeEqual } from "node:crypto"

const TTL_S = 120
type Payload = { t: string; w: string; r: string; e: number }

function key(): Buffer {
  const s = process.env.UPLOAD_TOKEN_SECRET
  if (!s || s.length < 32) throw new Error("UPLOAD_TOKEN_SECRET missing")
  return createHmac("sha256", s).update("paradigm/restart-token/v1").digest()
}
const sign = (body: string) => createHmac("sha256", key()).update(body).digest("base64url")

export function issueRestartToken(taskKey: string, wallet: string, priorRowId: string): string {
  const p: Payload = {
    t: taskKey.toLowerCase(),
    w: wallet.toLowerCase(),
    r: priorRowId,
    e: Math.floor(Date.now() / 1000) + TTL_S,
  }
  const body = Buffer.from(JSON.stringify(p)).toString("base64url")
  return `${body}.${sign(body)}`
}

/** Returns the previous claim row id if the pass is genuine, fresh, and for this task + wallet. */
export function verifyRestartToken(token: string, taskKey: string, wallet: string): string | null {
  if (typeof token !== "string" || token.length > 400) return null
  const [body, sig] = token.split(".")
  if (!body || !sig) return null
  const expected = Buffer.from(sign(body))
  const got = Buffer.from(sig)
  if (expected.length !== got.length || !timingSafeEqual(expected, got)) return null
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Payload
    if (p.e < Math.floor(Date.now() / 1000)) return null
    if (p.t !== taskKey.toLowerCase() || p.w !== wallet.toLowerCase()) return null
    return /^[0-9a-f-]{36}$/i.test(p.r) ? p.r : null
  } catch {
    return null
  }
}
