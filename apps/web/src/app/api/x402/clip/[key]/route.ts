// GET /api/x402/clip/:submissionKey: buy one accepted clip with x402 on Hedera.
//   not accepted / unknown → 404 (never asks for payment)   already sold → 409
//   otherwise 402 → agent pays USDC to the contributor's own Hedera account → settlement → 200 with the
//   decryption key. withX402 settles only after our handler succeeds and only then sends the body; the
//   receipt + licence are written after that, so nothing is recorded unless money actually moved.

import { HTTPFacilitatorClient } from "@x402/core/server"
import { ExactHederaScheme } from "@x402/hedera/exact/server"
import { withX402, x402ResourceServer } from "@x402/next"
import { after, type NextRequest, NextResponse } from "next/server"
import {
  approvedByAgentPass,
  markFailed,
  recordSettled,
  reserveSale,
  type Sale,
  saleFor,
} from "@/lib/server/sales"

const NETWORK = "hedera:testnet"
const FACILITATOR = process.env.FACILITATOR_URL ?? "https://x402.org/facilitator"

const server = new x402ResourceServer(new HTTPFacilitatorClient({ url: FACILITATOR })).register(
  NETWORK,
  new ExactHederaScheme(),
)

// The sale looked up for this request, keyed by path, so price/payTo/handler agree on one snapshot.
const current = new Map<string, Sale>()
const keyOf = (path: string) => path.split("/").pop() ?? ""

const paid = withX402(
  async (req: NextRequest): Promise<NextResponse<unknown>> => {
    const sale = current.get(keyOf(req.nextUrl.pathname))
    if (!sale)
      return NextResponse.json({ error: { code: "not_found", message: "No such clip" } }, { status: 404 })
    // Reserve before settlement; a parallel buyer gets 409 and is never charged (status ≥ 400 = no settle).
    if (!(await reserveSale(sale))) {
      return NextResponse.json(
        { error: { code: "already_sold", message: "This clip was already bought" } },
        { status: 409 },
      )
    }
    return NextResponse.json({
      submissionKey: sale.submissionKey,
      swarmRef: sale.swarmRef,
      cipherSha256: sale.cipherSha256,
      key: sale.aesKeyHex, // AES-256-GCM key; released only after settlement
      cipher: "aes-256-gcm iv(12)|ciphertext|tag(16)",
    })
  },
  {
    "/api/x402/clip/[key]": {
      accepts: {
        scheme: "exact",
        network: NETWORK,
        payTo: (ctx) => current.get(keyOf(ctx.path))?.payTo ?? (process.env.HEDERA_MERCHANT_ID as string),
        price: (ctx) => `$${current.get(keyOf(ctx.path))?.priceUsd ?? "0"}`,
        maxTimeoutSeconds: 120,
      },
      description: "One verified robot-training clip (decryption key + licence)",
      mimeType: "application/json",
    },
  },
  server,
)

export async function GET(req: NextRequest) {
  const submissionKey = keyOf(req.nextUrl.pathname)
  const lookup = await saleFor(submissionKey)
  if (!lookup.ok) {
    return NextResponse.json(
      { error: { code: lookup.code, message: lookup.message } },
      { status: lookup.status },
    )
  }
  const sale = lookup.sale
  current.set(submissionKey, sale)
  try {
    const res = await paid(req)
    const settleHeader = res.headers.get("payment-response") ?? res.headers.get("x-payment-response")
    if (res.status === 200 && settleHeader) {
      const settle = JSON.parse(Buffer.from(settleHeader, "base64").toString("utf8")) as {
        transaction?: string
        success?: boolean
      }
      if (settle.success !== false && settle.transaction) {
        // Never trust a client header for this: "agent-pass" only if an approved Agent Pass record exists.
        const approval = (await approvedByAgentPass(sale.submissionKey)) ? "agent-pass" : "auto"
        after(() =>
          recordSettled(sale, settle.transaction as string, approval).catch((e) =>
            console.error("[x402] record failed", e),
          ),
        )
      }
    } else if (req.headers.get("payment-signature") || req.headers.get("x-payment")) {
      await markFailed(sale.submissionKey, `status ${res.status}`)
    }
    return res
  } finally {
    current.delete(submissionKey)
  }
}
