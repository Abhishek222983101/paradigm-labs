// pnpm seed:arkiv — publishes the verifier listing and the demo task ("Fold a towel, top-down").
// Idempotent: skips the task if an open one with the same failure tag already exists (pass --force to add another).
// Also the Arkiv reset drill: bump ARKIV_NS and rerun to rebuild the public state.

import { ARKIV_NS, links, openTasks, S, safeCreate, WRITERS } from "@adx/shared/arkiv"
import { sha256Hex } from "@adx/shared/crypto"
import { SHIRT_RUBRIC, TOWEL_RUBRIC } from "@adx/shared/rubric"
import { PUBLIC_GATEWAY, swarmUpload } from "@adx/shared/swarm"
import { ExpirationTime } from "@arkiv-network/sdk"
import { bytes, dec, str, u64 } from "@arkiv-network/sdk/schema"

const force = process.argv.includes("--force")
const HOURS = Number(process.env.SEED_TASK_HOURS ?? 24)
const merchant = process.env.HEDERA_MERCHANT_ID
if (!merchant) throw new Error("HEDERA_MERCHANT_ID missing")

console.log(`namespace ${ARKIV_NS}`)

// 1. Rubric JSON → Swarm (public, no secrets) and its hash.
const which = process.env.SEED_TASK === "shirt" ? "shirt" : "towel"
const SPEC =
  which === "shirt"
    ? {
        rubric: SHIRT_RUBRIC,
        title: "Fold a T-shirt, filmed from above",
        tag: "shirt-sleeves-lost",
        reward: "6",
        slots: 3,
      }
    : {
        rubric: TOWEL_RUBRIC,
        title: "Fold a towel, filmed from above",
        tag: "towel-crumpled-start",
        reward: "3",
        slots: 3,
      }
const rubricJson = JSON.stringify(SPEC.rubric)
const rubricBytes = new TextEncoder().encode(rubricJson)
const rubricHash = sha256Hex(rubricBytes)
const beeUrl = process.env.SEED_BEE_URL ?? PUBLIC_GATEWAY
const rubricRef = await swarmUpload(rubricBytes, {
  beeUrl,
  batchId: beeUrl === PUBLIC_GATEWAY ? undefined : process.env.SWARM_BATCH_ID,
})
console.log(`rubric on Swarm: ${links.swarm(rubricRef)}  sha256 ${rubricHash.slice(0, 12)}…`)

// 2. Verifier listing (24 h; the agent heartbeat extends it hourly from P6).
const v = await safeCreate(
  "verifier",
  S.Verifier,
  {
    skill: str(SPEC.rubric.skill),
    status: str("live"),
    price: dec("3"),
    endpoint: str("https://adx-paradigm.vercel.app/api/x402/clip"),
    payTo: str(merchant),
    model: str("gemini-3-flash-preview"),
  },
  ExpirationTime.fromHours(24),
)
console.log(
  `verifier listing  ${v.entityKey}\n  ${links.arkivEntity(v.entityKey)}\n  tx ${links.arkivTx(v.txHash)}`,
)

// 3. Demo task (buyer agent wallet), expires at its deadline.
const existing = (await openTasks()).filter((t) => t.failureTag === SPEC.tag)
if (existing.length && !force) {
  console.log(`task already open: ${existing[0]?.key} (use --force to add another)`)
} else {
  const deadline = Math.floor(Date.now() / 1000) + HOURS * 3600
  const t = await safeCreate(
    "buyer",
    S.Task,
    {
      status: str("open"),
      skill: str(SPEC.rubric.skill),
      reward: dec(SPEC.reward),
      slots: u64(SPEC.slots),
      filled: u64(0),
      deadline: u64(deadline),
      title: str(SPEC.title),
      failureTag: str(SPEC.tag),
      rubricRef: str(rubricRef),
      rubricHash: str(rubricHash),
      rubric: bytes(rubricBytes),
    },
    ExpirationTime.fromHours(HOURS),
  )
  console.log(
    `task              ${t.entityKey}\n  ${links.arkivEntity(t.entityKey)}\n  tx ${links.arkivTx(t.txHash)}  (${t.ms} ms)`,
  )
}

const open = await openTasks()
console.log(`\nopen tasks owned by buyer ${WRITERS.buyer}: ${open.length}`)
for (const t of open) console.log(`  ${t.key}  ${t.title}  ${t.reward} USDC  ${t.filled}/${t.slots}`)
