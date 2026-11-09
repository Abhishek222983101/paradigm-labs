// pnpm doctor — checks every external dependency and prints one ✓/✗ table. Never prints secret values.

import { db, sql } from "@adx/db"
import { arkivPublic, WRITERS } from "@adx/shared/arkiv"
import { formatEther } from "viem"

type Row = { check: string; ok: boolean | null; detail: string; ms: number }
const rows: Row[] = []

async function check(name: string, fn: () => Promise<string>, opts: { skip?: string } = {}) {
  if (opts.skip) {
    rows.push({ check: name, ok: null, detail: opts.skip, ms: 0 })
    return
  }
  const t0 = Date.now()
  try {
    const detail = await Promise.race([
      fn(),
      new Promise<string>((_, rej) => setTimeout(() => rej(new Error("timeout 15s")), 15_000)),
    ])
    rows.push({ check: name, ok: true, detail, ms: Date.now() - t0 })
  } catch (e) {
    rows.push({
      check: name,
      ok: false,
      detail: String((e as Error).message).slice(0, 90),
      ms: Date.now() - t0,
    })
  }
}

const has = (n: string) => Boolean(process.env[n])
const MIRROR = "https://testnet.mirrornode.hedera.com/api/v1"
async function json(url: string, init?: RequestInit) {
  const r = await fetch(url, init)
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return r.json() as Promise<Record<string, unknown>>
}

const required = [
  "ARKIV_ACCESS_KEY",
  "ARKIV_PLATFORM_WEB_KEY",
  "ARKIV_PLATFORM_WORKER_KEY",
  "ARKIV_VERIFIER_KEY",
  "ARKIV_BUYER_KEY",
  "DATABASE_URL",
  "WORLD_APP_ID",
  "WORLD_RP_ID",
  "WORLD_SIGNING_KEY",
  "WORLD_AGENTPASS_CLIENT_ID",
  "WORLD_AGENTPASS_CLIENT_SECRET",
  "HEDERA_OPERATOR_ID",
  "HEDERA_OPERATOR_KEY",
  "HEDERA_BUYER_ID",
  "HEDERA_BUYER_KEY",
  "HEDERA_MERCHANT_ID",
  "HEDERA_USDC_TOKEN_ID",
  "GEMINI_API_KEY",
  "ANTHROPIC_API_KEY",
  "SWARM_BATCH_ID",
  "UPLOAD_TOKEN_SECRET",
]
await check("env: required names", async () => {
  const missing = required.filter((n) => !has(n))
  if (missing.length) throw new Error(`missing: ${missing.join(", ")}`)
  return `${required.length} present`
})

const pub = arkivPublic()
await check("arkiv: rabdi rpc", async () => `block ${await pub.getBlockNumber()}`)
for (const [role, address] of Object.entries(WRITERS)) {
  await check(`arkiv: ${role} wallet gas`, async () => {
    const bal = await pub.getBalance({ address })
    if (bal === 0n) throw new Error(`${address} has 0 tGLM`)
    return `${Number(formatEther(bal)).toFixed(3)} tGLM`
  })
}

await check("neon: select 1 + tables", async () => {
  const r = await db().execute(
    sql`select count(*)::int as n from information_schema.tables where table_schema='public'`,
  )
  return `${(r.rows[0] as { n: number }).n} tables`
})

await check("hedera: operator account", async () => {
  const a = await json(`${MIRROR}/accounts/${process.env.HEDERA_OPERATOR_ID}`)
  const hbar = Number((a.balance as { balance: number }).balance) / 1e8
  return `${hbar.toFixed(1)} HBAR`
})
await check("hedera: buyer USDC", async () => {
  const token = process.env.HEDERA_USDC_TOKEN_ID
  const t = await json(`${MIRROR}/accounts/${process.env.HEDERA_BUYER_ID}/tokens?token.id=${token}`)
  const bal = (t.tokens as Array<{ balance: number }>)[0]?.balance ?? 0
  return `${(bal / 1e6).toFixed(2)} USDC`
})
await check("hedera: x402 facilitator", async () => {
  const s = await json("https://x402.org/facilitator/supported")
  const kinds = (s.kinds as Array<{ network: string }>) ?? []
  if (!kinds.some((k) => k.network === "hedera:testnet")) throw new Error("hedera:testnet not listed")
  return "hedera:testnet supported"
})

await check("world: Agent Pass OIDC discovery", async () => {
  const d = await json("https://auth.world.org/.well-known/openid-configuration")
  return `issuer ${d.issuer}`
})

await check("ai: Gemini models", async () => {
  const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=200", {
    headers: { "x-goog-api-key": process.env.GEMINI_API_KEY ?? "" },
  })
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  const j = (await r.json()) as { models: Array<{ name: string }> }
  const hit = j.models.some((m) => m.name.includes("gemini-3-flash"))
  return hit ? "gemini-3-flash available" : "reachable (gemini-3-flash not listed)"
})
await check("ai: Anthropic models", async () => {
  const r = await fetch("https://api.anthropic.com/v1/models", {
    headers: { "x-api-key": process.env.ANTHROPIC_API_KEY ?? "", "anthropic-version": "2023-06-01" },
  })
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return "reachable"
})

await check("swarm: public gateway", async () => {
  const r = await fetch("https://api.gateway.ethswarm.org/health")
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return "healthy"
})
const worker = process.env.WORKER_PUBLIC_URL
await check(
  "worker: /health (incl. Bee + batch)",
  async () => {
    const h = await json(`${worker}/health`)
    if (!h.ok) throw new Error(JSON.stringify(h).slice(0, 80))
    return `bee ${(h.bee as string) ?? "?"}, batch usable ${String(h.batchUsable)}`
  },
  { skip: worker ? undefined : "WORKER_PUBLIC_URL not set yet (P3.2)" },
)

const icon = (ok: boolean | null) => (ok === null ? "–" : ok ? "✓" : "✗")
const w = Math.max(...rows.map((r) => r.check.length))
console.log(`\n  ${"check".padEnd(w)}   ${"result".padEnd(52)}  ms`)
for (const r of rows) console.log(`${icon(r.ok)} ${r.check.padEnd(w)}   ${r.detail.padEnd(52)}  ${r.ms}`)
const failed = rows.filter((r) => r.ok === false).length
console.log(failed ? `\n${failed} check(s) failed` : "\nall checks passed")
process.exit(failed ? 1 : 0)
