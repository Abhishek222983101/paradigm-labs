// Tiny Sepolia JSON-RPC router for our Bee node (Railway private network only).
// Free Sepolia RPCs each fail differently: publicnode prunes old logs, Tenderly serves full
// eth_getLogs history but rate-limits (429). We send eth_getLogs to the history RPC, everything
// else to the general RPC, and retry 429/5xx with exponential backoff so Bee never sees them.
import http from "node:http"

const GENERAL = (process.env.RPC_GENERAL ?? "https://ethereum-sepolia-rpc.publicnode.com").split(",")
const HISTORY = (process.env.RPC_HISTORY ?? "https://sepolia.gateway.tenderly.co,https://gateway.tenderly.co/public/sepolia").split(",")
const PORT = Number(process.env.PORT ?? 8545)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let rr = 0

async function forward(upstreams, body) {
  let delay = 250
  for (let attempt = 0; attempt < 10; attempt++) {
    const url = upstreams[rr++ % upstreams.length]
    try {
      const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body })
      const text = await res.text()
      if (res.status === 429 || res.status >= 500 || /-32005|rate limit|too many requests/i.test(text)) throw new Error(`${res.status} ${text.slice(0, 80)}`)
      return text
    } catch (e) {
      console.warn(`retry ${attempt + 1} ${url}: ${e.message}`)
      await sleep(delay)
      delay = Math.min(delay * 2, 8000)
    }
  }
  throw new Error("all upstreams failed")
}

async function handleOne(req) {
  const up = req.method === "eth_getLogs" ? HISTORY : GENERAL
  return JSON.parse(await forward(up, JSON.stringify(req)))
}

http
  .createServer(async (req, res) => {
    if (req.method !== "POST") return res.writeHead(200).end("ok")
    let raw = ""
    for await (const chunk of req) raw += chunk
    try {
      const payload = JSON.parse(raw)
      const out = Array.isArray(payload) ? await Promise.all(payload.map(handleOne)) : await handleOne(payload)
      res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify(out))
    } catch (e) {
      res.writeHead(502, { "content-type": "application/json" }).end(JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32603, message: String(e.message) } }))
    }
  })
  .listen(PORT, "::", () => console.log(`rpc-router on :${PORT}`))
