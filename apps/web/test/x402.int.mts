// P5 acceptance with real testnet USDC on Hedera (0.05 per run) against a running web server.
// Fixture (namespace adx-test): a task priced 0.05, an encrypted clip on Swarm, an accepted job + submission,
// a contributor whose payout account is HEDERA_CONTRIBUTOR_1. The buyer agent pays over x402 with no human.
// Run: start web with ARKIV_NS=adx-test, then WEB_TEST_URL=http://localhost:3300 pnpm test:x402
import { claimsPrivate, clipKeys, contributors, dbPool, eq, jobs, payments, sql } from "@adx/db"
import { arkivPublic, S, safeCreate } from "@adx/shared/arkiv"
import { decrypt, encrypt, newClipKey, sha256Hex } from "@adx/shared/crypto"
import { TOWEL_RUBRIC } from "@adx/shared/rubric"
import { PUBLIC_GATEWAY, swarmDownload, swarmUpload } from "@adx/shared/swarm"
import { ExpirationTime } from "@arkiv-network/sdk"
import { bytes, dec, key as keyV, str, u64 } from "@arkiv-network/sdk/schema"
import { x402Client } from "@x402/core/client"
import { wrapFetchWithPayment } from "@x402/fetch"
import { createClientHederaSigner, PrivateKey } from "@x402/hedera"
import { ExactHederaScheme } from "@x402/hedera/exact/client"
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts"

if (!process.env.ARKIV_NS?.endsWith("-test")) throw new Error("run with ARKIV_NS=adx-test")
const WEB = process.env.WEB_TEST_URL ?? "http://localhost:3300"
const db = dbPool(2)
let failures = 0
const ok = (label: string, cond: boolean, extra = "") => {
  if (!cond) failures++
  console.log(`${cond ? "✓" : "✗"} ${label}${extra ? `  ${extra}` : ""}`)
}
const must = (k: string) =>
  process.env[k] ??
  (() => {
    throw new Error(`${k} missing`)
  })()

// ---- fixture ----
const rubricBytes = new TextEncoder().encode(JSON.stringify(TOWEL_RUBRIC))
const task = await safeCreate(
  "buyer",
  S.Task,
  {
    status: str("open"),
    skill: str("towel-fold"),
    reward: dec("0.05"),
    slots: u64(3),
    filled: u64(0),
    deadline: u64(Math.floor(Date.now() / 1000) + 3600),
    title: str("x402 test"),
    failureTag: str("test"),
    rubricRef: str("1".repeat(64)),
    rubricHash: str(sha256Hex(rubricBytes)),
    rubric: bytes(rubricBytes),
  },
  ExpirationTime.fromHours(1),
)
const clip = new TextEncoder().encode(`paradigm test clip ${Date.now()}`)
const aes = newClipKey()
const blob = encrypt(clip, aes)
const swarmRef = await swarmUpload(blob, { beeUrl: PUBLIC_GATEWAY })
const claimKey = `0x${"b".repeat(56)}${Date.now().toString(16).slice(-8)}`
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
const contributor = privateKeyToAccount(generatePrivateKey())
await db.insert(claimsPrivate).values({
  taskKey: task.entityKey,
  claimKey,
  nullifier: `test-${Date.now()}`,
  wallet: contributor.address.toLowerCase(),
  status: "submitted",
})
await db
  .insert(contributors)
  .values({ wallet: contributor.address.toLowerCase(), hederaAccount: must("HEDERA_CONTRIBUTOR_1_ID") })
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
const url = `${WEB}/api/x402/clip/${sub.entityKey}`

// ---- checks ----
ok(
  "unknown / not-accepted clip → 404, no payment asked",
  (await fetch(`${WEB}/api/x402/clip/0x${"9".repeat(64)}`)).status === 404,
)
const unpaid = await fetch(url)
ok("accepted clip, no payment → 402 Payment Required", unpaid.status === 402)

const signer = createClientHederaSigner(
  must("HEDERA_BUYER_ID"),
  PrivateKey.fromStringECDSA(must("HEDERA_BUYER_KEY")),
  { network: "hedera:testnet" },
)
const payFetch = wrapFetchWithPayment(
  fetch,
  new x402Client().register("hedera:*", new ExactHederaScheme(signer)),
)
const t0 = Date.now()
const res = await payFetch(url)
const raw = await res.text()
const body = (() => {
  try {
    return JSON.parse(raw) as { key?: string; swarmRef?: string }
  } catch {
    return {}
  }
})()
if (res.status !== 200) {
  console.log("   status", res.status, raw.slice(0, 300))
  for (const [k, v] of res.headers)
    if (/payment|x402|error/i.test(k))
      console.log(
        "   header",
        k,
        (() => {
          try {
            return Buffer.from(v, "base64").toString().slice(0, 400)
          } catch {
            return v
          }
        })(),
      )
  const pr = res.headers.get("payment-required")
  if (pr) console.log("   payment-required:", Buffer.from(pr, "base64").toString().slice(0, 400))
}
const settle = res.headers.get("payment-response")
const tx = settle
  ? (JSON.parse(Buffer.from(settle, "base64").toString()) as { transaction?: string }).transaction
  : undefined
ok(
  "agent pays automatically → 200 after settlement",
  res.status === 200 && !!tx,
  `${Date.now() - t0} ms, tx ${tx}`,
)
if (tx) console.log(`   https://hashscan.io/testnet/transaction/${tx}`)
const plain = body.key
  ? decrypt(await swarmDownload(body.swarmRef ?? ""), Buffer.from(body.key, "hex"))
  : null
ok("the released key decrypts the clip from Swarm", !!plain && plain.equals(Buffer.from(clip)))

// receipt + licence are written right after the response
let pay: typeof payments.$inferSelect | undefined
for (let i = 0; i < 40; i++) {
  ;[pay] = await db
    .select()
    .from(payments)
    .where(sql`lower(${payments.submissionKey}) = ${sub.entityKey.toLowerCase()}`)
  if (pay?.receiptKey && pay?.licenceKey) break
  await new Promise((r) => setTimeout(r, 1500))
}
ok("payment recorded as settled with the Hedera tx", pay?.status === "settled" && pay.hederaTx === tx)
const arkiv = arkivPublic()
const receipt = pay?.receiptKey
  ? await arkiv.getEntity(pay.receiptKey as `0x${string}`, S.Receipt).catch(() => null)
  : null
ok(
  "adx.receipt on Arkiv: mode live, real tx, contributor paid",
  receipt?.mode.value === "live" &&
    receipt?.hederaTx.value === tx &&
    receipt?.payTo.value === must("HEDERA_CONTRIBUTOR_1_ID"),
  pay?.receiptKey ?? "",
)
const licE = pay?.licenceKey ? await arkiv.getEntity(pay.licenceKey as `0x${string}`).catch(() => null) : null
ok(
  "adx.licence on Arkiv is owned by the contributor's wallet",
  !!licE && (licE as { $owner?: string }).$owner?.toLowerCase() === contributor.address.toLowerCase(),
  pay?.licenceKey ?? "",
)
ok("buying the same clip again → 409, never charged twice", (await fetch(url)).status === 409)

// cleanup private rows (public test entities expire in 1 h)
await db.delete(clipKeys).where(eq(clipKeys.submissionKey, sub.entityKey))
await db.delete(jobs).where(eq(jobs.claimKey, claimKey))
await db.delete(claimsPrivate).where(eq(claimsPrivate.claimKey, claimKey))
console.log(failures ? `\n${failures} failure(s)` : "\nall x402 checks passed")
process.exit(failures ? 1 : 0)
