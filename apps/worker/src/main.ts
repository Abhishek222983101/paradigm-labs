// Paradigm worker: upload server now (P3); the verification pipeline joins in P4.

import { dbPool } from "@adx/db"
import { loadEnv, workerEnvSchema } from "@adx/shared/env"
import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { bodyLimit } from "hono/body-limit"
import { cors } from "hono/cors"
import { secureHeaders } from "hono/secure-headers"
import { startRunner } from "./pipeline/runner"
import { MAX_BYTES, uploadHandler } from "./upload"

const env = loadEnv("worker", workerEnvSchema)
const db = dbPool(5)
const origins = env.WEB_ORIGIN.split(",").map((s) => s.trim())

const app = new Hono()
app.use("*", secureHeaders())
app.use(
  "/upload",
  cors({
    origin: (o) => (origins.includes(o) ? o : null),
    allowMethods: ["PUT", "OPTIONS"],
    allowHeaders: ["authorization", "content-type"],
    maxAge: 600,
  }),
)

app.put(
  "/upload",
  bodyLimit({
    maxSize: MAX_BYTES,
    onError: (c) => {
      c.header("connection", "close")
      return c.json({ error: { code: "too_large", message: "This clip is over 60 MB." } }, 413)
    },
  }),
  uploadHandler({ db, secret: env.UPLOAD_TOKEN_SECRET, clipDir: env.CLIP_DIR }),
)

/** Health, including whether our Bee node is up and our postage batch is usable (P4.0 spike). */
app.get("/health", async (c) => {
  const probe = async (path: string) => {
    try {
      const r = await fetch(`${env.BEE_URL}${path}`, { signal: AbortSignal.timeout(3000) })
      return r.ok ? ((await r.json()) as Record<string, unknown>) : { status: r.status }
    } catch {
      return null
    }
  }
  const [bee, stamp] = await Promise.all([probe("/health"), probe(`/stamps/${env.SWARM_BATCH_ID}`)])
  return c.json({
    ok: true,
    bee: bee ? String(bee.status ?? "up") : "unreachable",
    beeVersion: bee?.version ?? null,
    batchUsable: stamp ? Boolean(stamp.usable) : null,
    batchTtlS: stamp?.batchTTL ?? null,
  })
})

/**
 * Swarm proof for a reference stored by our node: peer count, and Bee's own network-retrievability check
 * (stewardship). POST re-pushes the chunks if they aren't retrievable yet. Read-only data, plain refs only.
 */
app.get("/swarm/:ref", async (c) => {
  const ref = c.req.param("ref")
  if (!/^[0-9a-f]{64}$/.test(ref))
    return c.json({ error: { code: "invalid", message: "Not a Swarm reference" } }, 400)
  const get = async (path: string) => {
    try {
      const r = await fetch(`${env.BEE_URL}${path}`, { signal: AbortSignal.timeout(30_000) })
      return { status: r.status, body: (await r.json().catch(() => ({}))) as Record<string, unknown> }
    } catch (e) {
      return { status: 0, body: { error: (e as Error).message } }
    }
  }
  const [peers, steward, local] = await Promise.all([
    get("/peers"),
    get(`/stewardship/${ref}`),
    get(`/chunks/${ref}`),
  ])
  return c.json({
    ref,
    peers: Array.isArray(peers.body.peers) ? peers.body.peers.length : null,
    storedOnOurNode: local.status === 200,
    retrievableOnNetwork: steward.body.isRetrievable ?? null,
    gateway: `https://api.gateway.ethswarm.org/bytes/${ref}`,
  })
})

/** Fetch a reference from Swarm testnet through our Bee node (clips are AES-encrypted: this is ciphertext). */
app.get("/swarm/:ref/bytes", async (c) => {
  const ref = c.req.param("ref")
  if (!/^[0-9a-f]{64}$/.test(ref))
    return c.json({ error: { code: "invalid", message: "Not a Swarm reference" } }, 400)
  // Time out only while waiting for Bee to start answering; the body itself may stream slowly from peers.
  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), 45_000)
  const r = await fetch(`${env.BEE_URL}/bytes/${ref}`, { signal: ctl.signal }).catch(() => null)
  clearTimeout(timer)
  if (!r?.ok || !r.body) return c.json({ error: { code: "not_found", message: "Not found on Swarm" } }, 404)
  const len = Number(r.headers.get("content-length") ?? 0)
  if (len > 70 * 1024 * 1024) return c.json({ error: { code: "too_large", message: "Too large" } }, 413)
  return new Response(r.body, {
    headers: {
      "content-type": "application/octet-stream",
      "content-disposition": `attachment; filename="${ref.slice(0, 12)}.encrypted"`,
      "x-swarm-network": "testnet (Sepolia, network 10)",
      "access-control-allow-origin": "*",
      "cache-control": "public, max-age=3600",
    },
  })
})

app.post("/swarm/:ref/push", async (c) => {
  const ref = c.req.param("ref")
  if (!/^[0-9a-f]{64}$/.test(ref))
    return c.json({ error: { code: "invalid", message: "Not a Swarm reference" } }, 400)
  const r = await fetch(`${env.BEE_URL}/stewardship/${ref}`, {
    method: "PUT",
    headers: { "swarm-postage-batch-id": env.SWARM_BATCH_ID },
    signal: AbortSignal.timeout(120_000),
  }).catch((e: Error) => ({ status: 0, text: async () => e.message }))
  return c.json({ ref, repushStatus: r.status, detail: (await r.text()).slice(0, 200) })
})

app.notFound((c) => c.json({ error: { code: "not_found", message: "Not found" } }, 404))
app.onError((e, c) => {
  console.error("[worker]", e)
  return c.json({ error: { code: "internal", message: "Worker error" } }, 500)
})

serve({ fetch: app.fetch, port: env.PORT, hostname: "::" }, (i) =>
  console.log(`worker listening on ${i.port}`),
)

if (env.GEMINI_API_KEY && process.env.WORKER_PIPELINE !== "off") {
  startRunner(db, { beeUrl: env.BEE_URL, batchId: env.SWARM_BATCH_ID, geminiKey: env.GEMINI_API_KEY })
  console.log("pipeline runner started")
} else {
  console.log("pipeline runner disabled (no GEMINI_API_KEY or WORKER_PIPELINE=off)")
}
