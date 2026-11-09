// P2.3 acceptance against live Neon + Arkiv (namespace adx-test), with the World verifier stubbed so it
// runs without a phone. The real verifier's own checks (action / environment / signal binding) are tested
// separately below with forged payloads; those never reach World.
// Run from repo root: pnpm test:claims

import { claimsPrivate, db, eq } from "@adx/db"
import { S, safeCreate } from "@adx/shared/arkiv"
import { claimMessage } from "@adx/shared/claim"
import { ExpirationTime } from "@arkiv-network/sdk"
import { bytes, dec, str, u64 } from "@arkiv-network/sdk/schema"
import type { Hex } from "viem"
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts"
import { ApiFail } from "../src/lib/server/api"
import { claimSlot } from "../src/lib/server/claims"
import { type IdkitResult, verifyClaimProof } from "../src/lib/server/world"

if (!process.env.ARKIV_NS?.endsWith("-test")) throw new Error("run with ARKIV_NS=adx-test")
let failures = 0
const ok = (label: string, cond: boolean, extra = "") => {
  if (!cond) failures++
  console.log(`${cond ? "✓" : "✗"} ${label}${extra ? `  ${extra}` : ""}`)
}
async function code(p: Promise<unknown>): Promise<string> {
  try {
    await p
    return "ok"
  } catch (e) {
    return e instanceof ApiFail ? `${e.status} ${e.code}` : `throw ${(e as Error).message}`
  }
}

// A fresh 2-slot task in the test namespace.
const task = await safeCreate(
  "buyer",
  S.Task,
  {
    status: str("open"),
    skill: str("towel-fold"),
    reward: dec("3"),
    slots: u64(2),
    filled: u64(0),
    deadline: u64(Math.floor(Date.now() / 1000) + 3600),
    title: str("claims test"),
    failureTag: str("test"),
    rubricRef: str("1".repeat(64)),
    rubricHash: str("2".repeat(64)),
    rubric: bytes(new TextEncoder().encode('{"v":1}')),
  },
  ExpirationTime.fromHours(1),
)
const taskKey = task.entityKey.toLowerCase() as Hex
console.log("test task", taskKey)

const human = (n: string) => ({ verify: async () => `0xnull${n}` })
async function attempt(
  acct: ReturnType<typeof privateKeyToAccount>,
  nullifier: string,
  opts: { badSig?: boolean } = {},
) {
  const nonce = `0x${Math.random().toString(16).slice(2)}`
  const idkit = {
    protocol_version: "4.0",
    nonce,
    action: "claim-task",
    responses: [{ identifier: "selfie" }],
  } as IdkitResult
  const message = claimMessage(taskKey, acct.address, opts.badSig ? "other-nonce" : nonce)
  const signature = await acct.signMessage({ message })
  return claimSlot({ taskKey, wallet: acct.address, signature, idkit }, human(nullifier))
}

const A = privateKeyToAccount(generatePrivateKey())
const A2 = privateKeyToAccount(generatePrivateKey())
const B = privateKeyToAccount(generatePrivateKey())
const C = privateKeyToAccount(generatePrivateKey())

const t0 = Date.now()
const first = await attempt(A, "A")
ok(
  "first claim succeeds with a slot, challenge and upload token",
  first.res.slot === 1 && !!first.res.challenge.word && first.res.upload.token.length > 50,
  `${first.res.claimKey} (${Date.now() - t0} ms)`,
)
const again = await attempt(A, "A")
ok(
  "same human + same wallet again → resumes the same claim",
  again.res.resumed && again.res.claimKey === first.res.claimKey,
)
const moved = await attempt(A2, "A")
ok(
  "same human, new wallet → gets the same slot back (moved to the new wallet)",
  moved.res.resumed && moved.res.claimKey === first.res.claimKey,
)
ok("bad wallet signature → 401", (await code(attempt(B, "B", { badSig: true }))) === "401 bad_signature")
process.env.DEMO_RESTART = "true"
async function restartAttempt(acct: ReturnType<typeof privateKeyToAccount>, nullifier: string) {
  const nonce = `0x${Math.random().toString(16).slice(2)}`
  const idkit = {
    protocol_version: "4.0",
    nonce,
    action: "claim-task",
    responses: [{ identifier: "selfie" }],
  } as IdkitResult
  const signature = await acct.signMessage({ message: claimMessage(taskKey, acct.address, nonce) })
  return claimSlot({ taskKey, wallet: acct.address, signature, idkit, restart: true }, human(nullifier))
}
const redo = await restartAttempt(A2, "A")
ok(
  "start over: same human gets a fresh claim, still one slot",
  !redo.res.resumed && redo.res.claimKey !== first.res.claimKey && redo.res.slot === 1,
)
// Restart pass: after a submitted clip, the 409 carries a one-time pass; Start over needs no second World proof.
await db()
  .update(claimsPrivate)
  .set({ status: "submitted" })
  .where(eq(claimsPrivate.claimKey, redo.res.claimKey))
let pass: string | undefined
try {
  await attempt(A2, "A")
} catch (e) {
  pass = (e as ApiFail).details?.restartToken as string | undefined
}
ok("already submitted → 409 with a one-time restart pass", typeof pass === "string" && pass.length > 40)
const passMsg = (acct: ReturnType<typeof privateKeyToAccount>) =>
  claimMessage(taskKey, acct.address, `restart:${(pass as string).slice(-24)}`)
const noWorld = {
  verify: async () => {
    throw new Error("World must not be called")
  },
}
const viaPass = await claimSlot(
  {
    taskKey,
    wallet: A2.address,
    signature: await A2.signMessage({ message: passMsg(A2) }),
    restartToken: pass,
  },
  noWorld,
)
ok(
  "start over with the pass: fresh claim, no second World ID proof",
  !viaPass.res.resumed && viaPass.res.claimKey !== redo.res.claimKey,
)
ok(
  "the same pass can't be used twice",
  (await code(
    claimSlot(
      {
        taskKey,
        wallet: A2.address,
        signature: await A2.signMessage({ message: passMsg(A2) }),
        restartToken: pass,
      },
      noWorld,
    ),
  )) === "409 restart_used",
)
ok(
  "the pass is useless to another wallet",
  (await code(
    claimSlot(
      {
        taskKey,
        wallet: C.address,
        signature: await C.signMessage({ message: passMsg(C) }),
        restartToken: pass,
      },
      noWorld,
    ),
  )) === "401 restart_expired",
)
const second = await attempt(B, "B")
ok("second human gets slot 2", second.res.slot === 2)
ok("third human → 409 task_full", (await code(attempt(C, "C"))) === "409 task_full")

// Race: two humans at once for a full task must not overbook (advisory lock).
const race = await Promise.all([
  code(attempt(privateKeyToAccount(generatePrivateKey()), "D")),
  code(attempt(privateKeyToAccount(generatePrivateKey()), "E")),
])
ok(
  "concurrent claims on a full task are both refused",
  race.every((r) => r === "409 task_full"),
  race.join(", "),
)

// Real verifier: our own checks run before anything is sent to World.
const base = {
  protocol_version: "4.0" as const,
  nonce: "0x1",
  action: "claim-task",
  environment: process.env.WORLD_ENV ?? "staging",
}
ok(
  "verifier: wrong action → 400",
  (await code(
    verifyClaimProof(
      { ...base, action: "other", responses: [{ identifier: "selfie", signal_hash: "0x0" }] },
      "x",
    ),
  )) === "400 wrong_action",
)
ok(
  "verifier: wrong environment → 400",
  (await code(
    verifyClaimProof(
      { ...base, environment: "sandbox", responses: [{ identifier: "selfie", signal_hash: "0x0" }] },
      "x",
    ),
  )) === "400 wrong_environment",
)
ok(
  "verifier: proof bound to another task/wallet → 400",
  (await code(
    verifyClaimProof({ ...base, responses: [{ identifier: "selfie", signal_hash: "0xdeadbeef" }] }, "x"),
  )) === "400 signal_mismatch",
)

// Neon holds the private link; Arkiv never sees the nullifier or wallet.
const rows = await db().select().from(claimsPrivate).where(eq(claimsPrivate.taskKey, taskKey))
ok(
  "Neon keeps 2 live claims + 2 released (history kept on every start over)",
  rows.filter((r) => r.status !== "released").length === 2 &&
    rows.filter((r) => r.status === "released").length === 2,
)
await db().delete(claimsPrivate).where(eq(claimsPrivate.taskKey, taskKey))

console.log(failures ? `\n${failures} failure(s)` : "\nall claim checks passed")
process.exit(failures ? 1 : 0)
