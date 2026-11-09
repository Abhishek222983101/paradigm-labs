// An "outside agent": reads Paradigm's market straight from Arkiv, the way another team's agent would.
// No Paradigm code, no API, no keys: only the public Rabdi JSON-RPC and the four public writer wallets.
// It prints the same state the app shows (task board, live claims, verdicts, payments, live verifiers).
//
//   pnpm outside-agent            (or: npx tsx scripts/ops/outside-agent.ts)

const RPC = "https://rpc.rabdi.db-chain.testnet.arkiv.network"
const EXPLORER = "https://rabdi.explorer.arkiv.network/entity"
const NS = process.env.ARKIV_NS ?? "adx"
const WRITERS = {
  buyer: "0x0F00CFF8dae364c5d7c0840A2C92DFc7d087Dcc6",
  web: "0x2dEc12a23ec38830f7f314B33b144D4d1fe4D98C",
  worker: "0xCDFa94802dEEAaf2ce7E694F2d16BE2628d52A51",
  verifier: "0x0C736210492F8d86A1Fe4297cD7A5804ed48F421",
}

type RpcAttr = { name: string; type: string; value: string }
type Row = { key: string; owner: string; expiresAt?: string; attributes?: RpcAttr[] }

async function query(
  where: string,
  fields: string[],
): Promise<Array<Record<string, string> & { key: string }>> {
  const attributes = Object.fromEntries(fields.map((f) => [f, true]))
  const res = await fetch(RPC, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "arkiv_query",
      params: [where, { select: { key: true, owner: true, expiresAt: true, attributes }, limit: "0x64" }],
    }),
    signal: AbortSignal.timeout(20_000),
  })
  const j = (await res.json()) as { result?: { data: Row[] }; error?: { message: string } }
  if (!j.result) throw new Error(`arkiv_query failed: ${j.error?.message ?? res.status}`)
  return j.result.data.map((r) => {
    const out: Record<string, string> & { key: string } = { key: r.key }
    for (const a of r.attributes ?? []) out[a.name] = a.type === "u64" ? String(BigInt(a.value)) : a.value
    return out
  })
}

const of = (schema: string, owner: string, extra = "") =>
  `arkiv.schema = str('${NS}.${schema}') AND $owner = addr(${owner})${extra ? ` AND ${extra}` : ""}`
const short = (k: string) => `${k.slice(0, 8)}…${k.slice(-4)}`

const t0 = Date.now()
const [tasks, claims, subs, verdicts, receipts, verifiers] = await Promise.all([
  query(of("task", WRITERS.buyer, "status = str('open')"), ["title", "reward", "slots", "deadline", "skill"]),
  query(of("claim", WRITERS.web, "status = str('active')"), ["task", "slot"]),
  query(of("submission", WRITERS.worker), ["task", "status", "swarmRef", "cipherSha256"]),
  query(of("verification", WRITERS.verifier), ["submission", "verdict", "score", "model"]),
  query(of("receipt", WRITERS.verifier, "mode = str('live')"), [
    "submission",
    "usdc",
    "hederaTx",
    "approval",
  ]),
  query(of("verifier", WRITERS.verifier, "status = str('live')"), ["skill", "price", "endpoint", "model"]),
])

console.log(`Paradigm market, read from Arkiv only (${Date.now() - t0} ms, namespace ${NS})\n`)

console.log("Open tasks (posted by the buyer agent)")
for (const t of tasks.sort((a, b) => Number(b.reward) - Number(a.reward))) {
  const live = claims.filter((c) => c.task?.toLowerCase() === t.key.toLowerCase()).length
  const deadline = new Date(Number(t.deadline) * 1000).toISOString().slice(0, 16).replace("T", " ")
  console.log(
    `  ${t.reward} USDC  ${t.title}  · ${live}/${t.slots} slots claimed now · deadline ${deadline} UTC`,
  )
  console.log(`      ${EXPLORER}/${t.key}`)
}

console.log("\nClips and verdicts (worker + verifier wallets)")
for (const s of subs) {
  const v = verdicts.find((x) => x.submission?.toLowerCase() === s.key.toLowerCase())
  const r = receipts.find((x) => x.submission?.toLowerCase() === s.key.toLowerCase())
  const paid = r
    ? `paid ${r.usdc} USDC (${r.approval}) · https://hashscan.io/testnet/transaction/${r.hederaTx}`
    : "not paid"
  console.log(
    `  ${short(s.key)}  ${v ? `${v.verdict} ${v.score}/100 by ${v.model}` : s.status}  · Swarm ${short(s.swarmRef ?? "")}  · ${paid}`,
  )
}

console.log("\nLive verifiers anyone can hire")
for (const v of verifiers)
  console.log(`  ${v.skill}: ${v.price} USDC per clip, model ${v.model}, ${v.endpoint}`)

const total = receipts.reduce((a, r) => a + Number(r.usdc ?? 0), 0)
console.log(
  `\n${tasks.length} open tasks · ${claims.length} live claims · ${subs.length} clips · ${verdicts.length} verdicts · ${receipts.length} payments (${total} USDC)`,
)

export {}
