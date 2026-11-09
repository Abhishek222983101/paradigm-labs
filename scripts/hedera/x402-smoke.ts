// Hedera x402 smoke test: a local x402-protected endpoint (merchant) and an agent client (buyer)
// that discovers the price from the 402 response and pays in testnet USDC with no human step.
// Run: pnpm x402:smoke   [FACILITATOR_URL=https://testnet.facilitator.launa.dev]

import { x402Client } from "@x402/core/client"
import { HTTPFacilitatorClient } from "@x402/core/server"
import { paymentMiddleware, x402ResourceServer } from "@x402/express"
import { wrapFetchWithPayment } from "@x402/fetch"
import { createClientHederaSigner, PrivateKey } from "@x402/hedera"
import { ExactHederaScheme as HederaClientScheme } from "@x402/hedera/exact/client"
import { ExactHederaScheme as HederaServerScheme } from "@x402/hedera/exact/server"
import express from "express"

const must = (k: string) => {
  const v = process.env[k]
  if (!v) throw new Error(`${k} missing in .env`)
  return v
}
const FACILITATOR = process.env.FACILITATOR_URL ?? "https://x402.org/facilitator"
const PORT = 4021
const NETWORK = "hedera:testnet"

// ---- merchant (resource server) ----
const resourceServer = new x402ResourceServer(new HTTPFacilitatorClient({ url: FACILITATOR })).register(
  "hedera:*",
  new HederaServerScheme(),
)
const app = express()
app.use(
  paymentMiddleware(
    {
      "GET /api/sample/:id": {
        accepts: [{ scheme: "exact", price: "$0.01", network: NETWORK, payTo: must("HEDERA_MERCHANT_ID") }],
        description: "ADX smoke test: one verified clip licence",
      },
    },
    resourceServer,
  ),
)
app.get("/api/sample/:id", (req, res) => {
  res.json({ clip: req.params.id, licence: "demo", note: "released only after settlement" })
})
const srv = app.listen(PORT)

// ---- buyer agent (client) ----
const signer = createClientHederaSigner(
  must("HEDERA_BUYER_ID"),
  PrivateKey.fromStringECDSA(must("HEDERA_BUYER_KEY")),
  {
    network: NETWORK,
  },
)
const client = new x402Client().register("hedera:*", new HederaClientScheme(signer))
const payFetch = wrapFetchWithPayment(fetch, client)

try {
  const url = `http://localhost:${PORT}/api/sample/T-042`
  const first = await fetch(url)
  console.log("unpaid request →", first.status)
  const t0 = Date.now()
  const res = await payFetch(url)
  console.log("paid request →", res.status, `${Date.now() - t0} ms`, await res.text())
  for (const [k, v] of res.headers) {
    if (/payment-response/i.test(k)) {
      const settle = JSON.parse(Buffer.from(v, "base64").toString("utf8"))
      console.log("settlement:", settle)
      if (settle.transaction)
        console.log(`HashScan: https://hashscan.io/testnet/transaction/${settle.transaction}`)
    }
  }
} finally {
  srv.close()
}
