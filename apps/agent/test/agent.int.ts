// P6 acceptance: runs the real agent process against a local web server (namespace adx-test).
//   clip A (0.05 USDC, under the limit)  → paid automatically, HCS spend-log entry, receipt on Arkiv
//   clip B (6 USDC, over the 5 USDC limit) → NOT paid; a World Agent Pass approval is opened (real device code)
// Approving / declining B needs a phone with World App; that part is the manual demo step.
// Run: start web on :3300 with ARKIV_NS=adx-test, then pnpm test:agent
import { spawn } from "node:child_process"
import {
  approvals,
  claimsPrivate,
  clipKeys,
  contributors,
  dbPool,
  eq,
  events,
  jobs,
  payments,
  sql,
} from "@adx/db"
import { S, safeCreate } from "@adx/shared/arkiv"
import { encrypt, newClipKey, sha256Hex } from "@adx/shared/crypto"
import { TOWEL_RUBRIC } from "@adx/shared/rubric"
import { PUBLIC_GATEWAY, swarmUpload } from "@adx/shared/swarm"
import { ExpirationTime } from "@arkiv-network/sdk"
import { bytes, dec, key as keyV, str, u64 } from "@arkiv-network/sdk/schema"
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts"

if (!process.env.ARKIV_NS?.endsWith("-test")) throw new Error("run with ARKIV_NS=adx-test")
const db = dbPool(2)
let failures = 0
const ok = (label: string, cond: boolean, extra = "") => {
  if (!cond) failures++
  console.log(`${cond ? "✓" : "✗"} ${label}${extra ? `  ${extra}` : ""}`)
}

async function fixture(reward: string) {
  const rb = new TextEncoder().encode(JSON.stringify(TOWEL_RUBRIC))
  const task = await safeCreate(
    "buyer",
    S.Task,
    {
      status: str("open"),
      skill: str("towel-fold"),
      reward: dec(reward),
      slots: u64(3),
      filled: u64(0),
      deadline: u64(Math.floor(Date.now() / 1000) + 3600),
      title: str(`agent test ${reward}`),
      failureTag: str("test"),
      rubricRef: str("1".repeat(64)),
      rubricHash: str(sha256Hex(rb)),
      rubric: bytes(rb),
    },
    ExpirationTime.fromHours(1),
  )
  const aes = newClipKey()
  const blob = encrypt(new TextEncoder().encode(`agent clip ${reward} ${Date.now()}`), aes)
  const swarmRef = await swarmUpload(blob, { beeUrl: PUBLIC_GATEWAY })
  const claimKey = `0x${"c".repeat(54)}${Date.now().toString(16).slice(-10)}`
  const sub = await safeCreate(
    "worker",
    S.Submission,
    {
      task: keyV(task.entityKey),
      claim: keyV(claimKey as `0x${string}`),
      status: str("accepted"),
      dhashA: str("0000"),
      dhashB: str("0000"),
      dhashC: str("0000"),
      dhash: str(`${"0".repeat(16)}|${"0".repeat(16)}|${"0".repeat(16)}`),
      swarmRef: str(swarmRef),
      cipherSha256: str(sha256Hex(blob)),
      durationMs: u64(18000),
    },
    ExpirationTime.fromHours(1),
  )
  const wallet = privateKeyToAccount(generatePrivateKey()).address.toLowerCase()
  await db.insert(claimsPrivate).values({
    taskKey: task.entityKey,
    claimKey,
    nullifier: `agent-${Date.now()}-${reward}`,
    wallet,
    status: "submitted",
  })
  await db
    .insert(contributors)
    .values({ wallet, hederaAccount: process.env.HEDERA_CONTRIBUTOR_2_ID as string })
    .onConflictDoNothing()
  await db.insert(jobs).values({
    claimKey,
    taskKey: task.entityKey,
    path: "/dev/null",
    status: "accepted",
    submissionKey: sub.entityKey,
  })
  await db
    .insert(clipKeys)
    .values({ submissionKey: sub.entityKey, aesKey: aes, swarmRef, cipherSha256: sha256Hex(blob) })
  return { submissionKey: sub.entityKey.toLowerCase(), claimKey }
}

const A = await fixture("0.05")
const B = await fixture("6")
console.log("fixtures ready; starting the agent")

const agent = spawn("npx", ["tsx", "src/main.ts"], {
  env: {
    ...process.env,
    AGENT_TARGET_URL: process.env.WEB_TEST_URL ?? "http://localhost:3300",
    AGENT_TICK_MS: "3000",
  },
  stdio: ["ignore", "pipe", "pipe"],
})
let log = ""
agent.stdout.on("data", (d) => (log += d))
agent.stderr.on("data", (d) => (log += d))

const find = async (key: string, step: string) => {
  const r = await db.execute(
    sql`select data from events where scope = 'agent' and step = ${step} and lower(data->>'submissionKey') = ${key} order by id desc limit 1`,
  )
  return r.rows[0] as { data: Record<string, unknown> } | undefined
}
let paidA: { data: Record<string, unknown> } | undefined
let askB: { data: Record<string, unknown> } | undefined
const t0 = Date.now()
for (let i = 0; i < 60 && !(paidA && askB); i++) {
  await new Promise((r) => setTimeout(r, 2000))
  paidA ??= await find(A.submissionKey, "paid")
  askB ??= await find(B.submissionKey, "needs_human")
}
agent.kill("SIGTERM")

ok(
  "under the limit: agent paid on its own over x402",
  !!paidA?.data.tx,
  `${paidA?.data.amount} USDC, tx ${paidA?.data.tx} (${Math.round((Date.now() - t0) / 1000)} s)`,
)
ok("the decision is on the Hedera spend log (HCS)", !!paidA?.data.hcsTx, String(paidA?.data.hcsTx ?? ""))
ok(
  "Claude wrote a plain one-line note for the human",
  typeof paidA?.data.note === "string" && (paidA.data.note as string).length > 10,
  String(paidA?.data.note ?? ""),
)
const [payB] = await db
  .select()
  .from(payments)
  .where(sql`lower(${payments.submissionKey}) = ${B.submissionKey}`)
ok("over the limit: NOT paid", !payB || payB.status !== "settled")
const [ap] = await db
  .select()
  .from(approvals)
  .where(sql`lower(${approvals.submissionKey}) = ${B.submissionKey}`)
ok(
  "over the limit: a World Agent Pass approval is waiting (real device code)",
  !!askB && ap?.status === "pending" && !!ap.verificationUri?.startsWith("https://auth.world.org/"),
  ap?.userCode ?? "",
)
if (!paidA || !askB) console.log(log.split("\n").slice(-15).join("\n"))

// cleanup: close the test approval so the live console isn't cluttered
if (ap)
  await db.update(approvals).set({ status: "expired", decidedAt: new Date() }).where(eq(approvals.id, ap.id))
for (const f of [A, B]) {
  await db.delete(clipKeys).where(sql`lower(${clipKeys.submissionKey}) = ${f.submissionKey}`)
  await db.delete(jobs).where(eq(jobs.claimKey, f.claimKey))
  await db.delete(claimsPrivate).where(eq(claimsPrivate.claimKey, f.claimKey))
  await db.delete(events).where(sql`scope = 'agent' and lower(data->>'submissionKey') = ${f.submissionKey}`)
}
console.log(failures ? `\n${failures} failure(s)` : "\nall agent checks passed")
process.exit(failures ? 1 : 0)
