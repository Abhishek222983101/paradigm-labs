// Acceptance for P1.1 + P1.2 + P1.3 against the live Rabdi testnet, in a throwaway namespace.
//   P1.1: create + read back every one of the 8 schemas through the guarded writer
//   P1.2: a write with a secret-looking value is refused before it reaches the chain
//   P1.3: 10 parallel creates on ONE signer all land (the queue serialises nonces)
// Run: ARKIV_NS=adx-test pnpm arkiv:roundtrip     (entities expire after 1 h)

import { arkivPublic, makeSchemas, safeCreate, UnsafeArkivWrite, WRITERS } from "@adx/shared/arkiv"
import { ExpirationTime } from "@arkiv-network/sdk"
import { addr, bytes, dec, key, str, u64 } from "@arkiv-network/sdk/schema"
import type { Hex } from "viem"

const ns = process.env.ARKIV_NS ?? ""
if (!ns.endsWith("-test"))
  throw new Error("run with ARKIV_NS=adx-test (refusing to write test data to the live namespace)")
const S = makeSchemas(ns)
const pub = arkivPublic()
const exp = ExpirationTime.fromHours(1)
const h = (c: string) => c.repeat(64)
const fake = `0x${"ab".repeat(32)}` as Hex
let failures = 0
const ok = (label: string, cond: boolean, extra = "") => {
  if (!cond) failures++
  console.log(`${cond ? "✓" : "✗"} ${label}${extra ? `  ${extra}` : ""}`)
}

const t0 = Date.now()
const results = await Promise.all([
  safeCreate(
    "verifier",
    S.Verifier,
    {
      skill: str("towel-fold"),
      status: str("live"),
      price: dec("3"),
      endpoint: str("https://example.test/x402"),
      payTo: str("0.0.11333308"),
      model: str("gemini-3-flash-preview"),
    },
    exp,
  ).then((r) => ["Verifier", r, S.Verifier] as const),
  safeCreate(
    "buyer",
    S.Task,
    {
      status: str("open"),
      skill: str("towel-fold"),
      reward: dec("3"),
      slots: u64(3),
      filled: u64(0),
      deadline: u64(Math.floor(Date.now() / 1000) + 3600),
      title: str("roundtrip task"),
      failureTag: str("test"),
      rubricRef: str(h("1")),
      rubricHash: str(h("2")),
      rubric: bytes(new TextEncoder().encode('{"v":1}')),
    },
    exp,
  ).then((r) => ["Task", r, S.Task] as const),
  safeCreate(
    "web",
    S.Claim,
    {
      task: key(fake),
      status: str("active"),
      slot: u64(1),
      claimant: str("c_test"),
      challenge: str("mango:3"),
    },
    exp,
  ).then((r) => ["Claim", r, S.Claim] as const),
  safeCreate(
    "worker",
    S.Submission,
    {
      task: key(fake),
      claim: key(fake),
      status: str("accepted"),
      dhashA: str("abcd"),
      dhashB: str("ef01"),
      dhashC: str("2345"),
      dhash: str(`${"a".repeat(16)}|${"b".repeat(16)}|${"c".repeat(16)}`),
      swarmRef: str(h("3")),
      cipherSha256: str(h("4")),
      durationMs: u64(21000),
    },
    exp,
  ).then((r) => ["Submission", r, S.Submission] as const),
])
// Second wave on the verifier/web signers (exercises the queue across schemas too).
const wave2 = await Promise.all([
  safeCreate(
    "verifier",
    S.Verification,
    {
      submission: key(fake),
      task: key(fake),
      verdict: str("accept"),
      score: u64(91),
      model: str("gemini-3-flash-preview"),
      rubricHash: str(h("2")),
      evidence: bytes(new TextEncoder().encode('{"steps":[]}')),
      evidenceHash: str(h("5")),
    },
    exp,
  ).then((r) => ["Verification", r, S.Verification] as const),
  safeCreate(
    "verifier",
    S.Receipt,
    {
      task: key(fake),
      submission: key(fake),
      mode: str("simulated"),
      network: str("hedera:testnet"),
      hederaTx: str("0.0.1@1.1"),
      usdc: dec("3"),
      payTo: str("0.0.11333310"),
      approval: str("auto"),
    },
    exp,
  ).then((r) => ["Receipt", r, S.Receipt] as const),
  safeCreate(
    "web",
    S.Licence,
    {
      submission: key(fake),
      task: key(fake),
      licensee: addr(WRITERS.buyer),
      status: str("granted"),
      scope: str("train-eval"),
      termsHash: str(h("6")),
    },
    exp,
  ).then((r) => ["Licence", r, S.Licence] as const),
  safeCreate(
    "buyer",
    S.Manifest,
    { skill: str("towel-fold"), version: u64(1), samples: u64(0), humans: u64(0), swarmRef: str(h("7")) },
    exp,
  ).then((r) => ["Manifest", r, S.Manifest] as const),
])
console.log(`8 creates across 4 signers in ${Date.now() - t0} ms`)
for (const [name, r, schema] of [...results, ...wave2]) {
  const back = await pub.getEntity(r.entityKey, schema as never).catch((e: Error) => e)
  ok(`P1.1 ${name.padEnd(12)} create + read back`, !(back instanceof Error), r.entityKey)
}

// P1.2 guard refuses before any network call.
try {
  await safeCreate(
    "buyer",
    S.Task,
    {
      status: str("open"),
      skill: str("x"),
      reward: dec("1"),
      slots: u64(1),
      filled: u64(0),
      deadline: u64(1),
      title: str(`0x${h("f")}`),
      failureTag: str("x"),
      rubricRef: str(h("1")),
      rubricHash: str(h("2")),
      rubric: bytes(new Uint8Array()),
    },
    exp,
  )
  ok("P1.2 guard refuses 64-hex in title", false)
} catch (e) {
  ok("P1.2 guard refuses 64-hex in title", e instanceof UnsafeArkivWrite, (e as Error).message)
}

// P1.3: 10 parallel creates on one signer.
const t1 = Date.now()
const burst = await Promise.allSettled(
  Array.from({ length: 10 }, (_, i) =>
    safeCreate(
      "worker",
      S.Submission,
      {
        task: key(fake),
        claim: key(fake),
        status: str("review"),
        dhashA: str("0000"),
        dhashB: str("0000"),
        dhashC: str(i.toString(16).padStart(4, "0")),
        dhash: str("burst"),
        swarmRef: str(h("8")),
        cipherSha256: str(h("9")),
        durationMs: u64(i),
      },
      exp,
    ),
  ),
)
const landed = burst.filter((b) => b.status === "fulfilled").length
const keys = new Set(burst.flatMap((b) => (b.status === "fulfilled" ? [b.value.entityKey] : [])))
ok(
  "P1.3 10 parallel creates on one signer",
  landed === 10 && keys.size === 10,
  `${landed}/10 landed, ${keys.size} unique keys, ${Date.now() - t1} ms`,
)
for (const b of burst) if (b.status === "rejected") console.log("   ", String(b.reason).slice(0, 160))

console.log(failures ? `\n${failures} failure(s)` : "\nall roundtrip checks passed")
process.exit(failures ? 1 : 0)
