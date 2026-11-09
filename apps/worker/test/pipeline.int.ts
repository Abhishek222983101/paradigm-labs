// P4 acceptance against live services in the adx-test namespace: real ffmpeg + Gemini + Swarm (public
// gateway locally) + Arkiv. A generated test video has no towel, so the verdict must NOT be "accept";
// what matters is that every stage runs and the records land. Then the same video is uploaded again and
// must be caught as a duplicate via Arkiv fingerprints.
// Run: pnpm test:pipeline
import { execFileSync } from "node:child_process"
import { copyFileSync, mkdtempSync, readFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { asc, clipKeys, dbPool, eq, events, jobs } from "@adx/db"
import { arkivPublic, S, safeCreate } from "@adx/shared/arkiv"
import { decrypt, sha256Hex } from "@adx/shared/crypto"
import { TOWEL_RUBRIC } from "@adx/shared/rubric"
import { PUBLIC_GATEWAY, swarmDownload } from "@adx/shared/swarm"
import { ExpirationTime } from "@arkiv-network/sdk"
import { bytes, dec, str, u64 } from "@arkiv-network/sdk/schema"
import { processJob } from "../src/pipeline/run"

if (!process.env.ARKIV_NS?.endsWith("-test")) throw new Error("run with ARKIV_NS=adx-test")
const db = dbPool(2)
let failures = 0
const ok = (label: string, cond: boolean, extra = "") => {
  if (!cond) failures++
  console.log(`${cond ? "✓" : "✗"} ${label}${extra ? `  ${extra}` : ""}`)
}

const rubricBytes = new TextEncoder().encode(JSON.stringify(TOWEL_RUBRIC))
const task = await safeCreate(
  "buyer",
  S.Task,
  {
    status: str("open"),
    skill: str("towel-fold"),
    reward: dec("3"),
    slots: u64(3),
    filled: u64(0),
    deadline: u64(Math.floor(Date.now() / 1000) + 3600),
    title: str("pipeline test"),
    failureTag: str("test"),
    rubricRef: str("1".repeat(64)),
    rubricHash: str(sha256Hex(rubricBytes)),
    rubric: bytes(rubricBytes),
  },
  ExpirationTime.fromHours(1),
)

const dir = mkdtempSync(join(tmpdir(), "adx-pipe-"))
const src = join(dir, "src.mp4")
execFileSync("ffmpeg", [
  "-v",
  "error",
  "-f",
  "lavfi",
  "-i",
  `life=s=640x360:mold=10:r=30:ratio=0.5:seed=${Math.floor(Math.random() * 1e9)}`,
  "-f",
  "lavfi",
  "-i",
  "sine=frequency=330",
  "-t",
  "18",
  "-c:v",
  "libx264",
  "-pix_fmt",
  "yuv420p",
  "-c:a",
  "aac",
  "-shortest",
  src,
])

async function runOnce(label: string) {
  const path = join(dir, `${label}.mp4`)
  copyFileSync(src, path)
  const claimKey = `0x${"a".repeat(56)}${Date.now().toString(16).slice(-8)}`
  const [job] = await db
    .insert(jobs)
    .values({
      claimKey,
      taskKey: task.entityKey,
      path,
      bytes: 1,
      mime: "video/mp4",
      challenge: "mango:3",
      status: "processing",
    })
    .returning()
  if (!job) throw new Error("no job")
  const t0 = Date.now()
  const status = await processJob(
    db,
    { beeUrl: PUBLIC_GATEWAY, geminiKey: process.env.GEMINI_API_KEY ?? "" },
    job,
  )
  const evs = await db
    .select()
    .from(events)
    .where(eq(events.scope, `submission:${job.id}`))
    .orderBy(asc(events.id))
  return { job, status, evs, ms: Date.now() - t0 }
}

const first = await runOnce("first")
const steps = first.evs.map((e) => `${e.step}${e.ok ? "" : "✗"}`).join(" → ")
ok(
  "pipeline ran every stage",
  ["probe", "fingerprint", "dedup", "verdict", "encrypt", "store", "publish", "done"].every((s) =>
    first.evs.some((e) => e.step === s),
  ),
  `${steps} (${first.ms} ms)`,
)
const verdictEv = first.evs.find((e) => e.step === "verdict")
const summary = (verdictEv?.data as { summary?: { verdict: string; reason: string; liveness: unknown } })
  ?.summary
ok(
  "Gemini answered in the strict schema and code decided (no towel → not accepted)",
  !!summary && summary.verdict !== "accept",
  summary ? `${summary.verdict}: ${summary.reason} (${verdictEv?.ms} ms)` : "",
)
const pub = first.evs.find((e) => e.step === "publish")?.data as
  | { submissionKey?: `0x${string}`; verificationKey?: `0x${string}` }
  | undefined
const arkiv = arkivPublic()
const subE = pub?.submissionKey
  ? await arkiv.getEntity(pub.submissionKey, S.Submission).catch(() => null)
  : null
const verE = pub?.verificationKey
  ? await arkiv.getEntity(pub.verificationKey, S.Verification).catch(() => null)
  : null
ok("adx.submission on Arkiv (worker wallet)", !!subE, pub?.submissionKey ?? "")
ok(
  "adx.verification on Arkiv (verifier wallet) points at the submission",
  !!verE && verE.submission.value.toLowerCase() === pub?.submissionKey?.toLowerCase(),
  pub?.verificationKey ?? "",
)

const [ck] = await db
  .select()
  .from(clipKeys)
  .where(eq(clipKeys.submissionKey, pub?.submissionKey ?? ""))
if (ck) {
  const cipher = await swarmDownload(ck.swarmRef)
  const plain = decrypt(cipher, ck.aesKey)
  ok(
    "Swarm copy downloads and decrypts back to the original clip",
    sha256Hex(cipher) === ck.cipherSha256 && plain.equals(readFileSync(src)),
    ck.swarmRef,
  )
} else ok("clip key stored", false)

const second = await runOnce("second")
ok(
  "the same clip uploaded again is caught as a duplicate via Arkiv fingerprints",
  second.status === "duplicate",
  `${second.status} (${second.ms} ms)`,
)

for (const r of [first, second]) {
  await db.delete(events).where(eq(events.scope, `submission:${r.job.id}`))
  await db.delete(jobs).where(eq(jobs.id, r.job.id))
}
console.log(failures ? `\n${failures} failure(s)` : "\nall pipeline checks passed")
process.exit(failures ? 1 : 0)
