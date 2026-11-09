// Paying over x402. Only callable with a policy decision that says "pay" (or an approval bound to the same
// payment). Discovery first: the 402 tells us the real price and payee, and that's what the policy judges.

import type { Decision } from "@adx/shared/policy"
import { x402Client } from "@x402/core/client"
import { wrapFetchWithPayment } from "@x402/fetch"
import { createClientHederaSigner, PrivateKey } from "@x402/hedera"
import { ExactHederaScheme } from "@x402/hedera/exact/client"

const USDC_DECIMALS = 6

export type Offer = { amountUsd: number; payTo: string; network: string; asset: string }

/** GET without paying: read the price + payee from the 402 challenge. null = not for sale. */
export async function discover(url: string): Promise<Offer | null> {
  const res = await fetch(url, { signal: AbortSignal.timeout(20_000) })
  if (res.status !== 402) return null
  const header = res.headers.get("payment-required")
  if (!header) return null
  const pr = JSON.parse(Buffer.from(header, "base64").toString("utf8")) as {
    accepts?: Array<{ amount?: string; payTo?: string; network?: string; asset?: string }>
  }
  const a = pr.accepts?.find((x) => x.network === "hedera:testnet")
  if (!a?.amount || !a.payTo) return null
  return {
    amountUsd: Number(a.amount) / 10 ** USDC_DECIMALS,
    payTo: a.payTo,
    network: a.network ?? "",
    asset: a.asset ?? "",
  }
}

let payFetch: typeof fetch | undefined
function client(): typeof fetch {
  if (payFetch) return payFetch
  const id = process.env.HEDERA_BUYER_ID
  const key = process.env.HEDERA_BUYER_KEY
  if (!id || !key) throw new Error("HEDERA_BUYER_ID / HEDERA_BUYER_KEY not set")
  const signer = createClientHederaSigner(id, PrivateKey.fromStringECDSA(key), { network: "hedera:testnet" })
  // The x402 client caps each payment at $1 by default. Our own policy (packages/shared/policy.ts) is the
  // real limit, so the client-side cap is set to the policy's hard cap, not removed.
  const hardCap = process.env.AGENT_HARD_CAP ?? "10"
  payFetch = wrapFetchWithPayment(
    fetch,
    new x402Client()
      .register("hedera:*", new ExactHederaScheme(signer))
      .setSpendControls({ maxAmountPerPayment: `$${hardCap}` }),
  )
  return payFetch
}

export type PaidClip = { tx: string; key: string; swarmRef: string; cipherSha256: string; ms: number }

/**
 * Pay for one clip. Requires a decision with action "pay", or "needs_human" plus a valid approval.
 * Retries once if settlement comes back unconfirmed (the facilitator occasionally answers an empty 402;
 * no funds move in that case).
 */
export async function payFor(
  url: string,
  decision: Decision,
  approval: "auto" | "agent-pass",
): Promise<PaidClip> {
  if (decision.action === "skip") throw new Error("policy said skip")
  if (decision.action === "needs_human" && approval !== "agent-pass") throw new Error("approval required")
  const t0 = Date.now()
  let last = ""
  for (let attempt = 1; attempt <= 2; attempt++) {
    const res = await client()(url, {
      headers: { "x-paradigm-approval": approval },
      signal: AbortSignal.timeout(90_000),
    })
    const settle = res.headers.get("payment-response")
    if (res.status === 200 && settle) {
      const s = JSON.parse(Buffer.from(settle, "base64").toString("utf8")) as { transaction?: string }
      const body = (await res.json()) as { key: string; swarmRef: string; cipherSha256: string }
      return {
        tx: s.transaction ?? "",
        key: body.key,
        swarmRef: body.swarmRef,
        cipherSha256: body.cipherSha256,
        ms: Date.now() - t0,
      }
    }
    last = `status ${res.status}`
    if (res.status === 404 || res.status === 409) break
    await new Promise((r) => setTimeout(r, 3000))
  }
  throw new Error(`payment not settled (${last})`)
}
