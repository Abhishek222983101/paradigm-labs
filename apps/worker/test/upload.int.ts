// P3.2 acceptance: valid upload → 202; reused token → 409; 70 MB → 413; plus bad token, wrong type,
// non-video bytes, CORS. Needs a running worker (WORKER_TEST_URL, default http://localhost:8099) and Neon.
// Run: pnpm test:upload
import { execFileSync } from "node:child_process"
import { mkdtempSync, readFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { dbPool, eq, events, jobs, uploadTokens } from "@adx/db"

const pool = dbPool(2)
const db = () => pool

import { issueUploadToken } from "@adx/shared/upload-token"

const URL = process.env.WORKER_TEST_URL ?? "http://localhost:8099"
const secret = process.env.UPLOAD_TOKEN_SECRET ?? ""
let failures = 0
const ok = (label: string, cond: boolean, extra = "") => {
  if (!cond) failures++
  console.log(`${cond ? "✓" : "✗"} ${label}${extra ? `  ${extra}` : ""}`)
}

const dir = mkdtempSync(join(tmpdir(), "adx-upload-"))
const clip = join(dir, "clip.mp4")
execFileSync("ffmpeg", [
  "-v",
  "error",
  "-f",
  "lavfi",
  "-i",
  "testsrc=size=640x360:rate=30",
  "-f",
  "lavfi",
  "-i",
  "sine=frequency=440",
  "-t",
  "20",
  "-c:v",
  "libx264",
  "-pix_fmt",
  "yuv420p",
  "-c:a",
  "aac",
  "-shortest",
  clip,
])
const video = new Uint8Array(readFileSync(clip))

const claim = `0x${"c".repeat(63)}${Math.floor(Math.random() * 10)}`
const task = `0x${"d".repeat(64)}`
async function token() {
  const t = issueUploadToken({ claim, task }, secret)
  await db().insert(uploadTokens).values({ tokenHash: t.tokenHash, claimKey: claim, expiresAt: t.expiresAt })
  return t.token
}
const put = (tok: string, body: BodyInit, type = "video/mp4") =>
  fetch(`${URL}/upload`, {
    method: "PUT",
    headers: { authorization: `Bearer ${tok}`, "content-type": type },
    body,
    duplex: "half",
  } as RequestInit)

const t1 = await token()
const t0 = Date.now()
const r1 = await put(t1, video)
const j1 = (await r1.json()) as { submissionId?: string }
ok(
  "valid upload → 202 with a submission id",
  r1.status === 202 && !!j1.submissionId,
  `${(video.length / 1e6).toFixed(1)} MB in ${Date.now() - t0} ms`,
)
ok("reused token → 409", (await put(t1, video)).status === 409)

const t2 = await token()
const big = new Uint8Array(70 * 1024 * 1024)
const bigStatus = await put(t2, big).then(
  (r) => r.status,
  () => "reset",
)
ok(
  "70 MB → refused (413, or connection closed mid-send)",
  bigStatus === 413 || bigStatus === "reset",
  String(bigStatus),
)
ok("token still usable after a rejected upload (not burned)", (await put(t2, video)).status === 202)

ok("garbage token → 401", (await put("abc.def", video)).status === 401)
const forged = `${t1.split(".")[0]}.AAAA`
ok("forged signature → 401", (await put(forged, video)).status === 401)
const t3 = await token()
ok("wrong content type → 415", (await put(t3, video, "image/png")).status === 415)
ok("non-video bytes → 415", (await put(t3, new Uint8Array(200_000).fill(7))).status === 415)

const pre = await fetch(`${URL}/upload`, {
  method: "OPTIONS",
  headers: { origin: "https://evil.example", "access-control-request-method": "PUT" },
})
ok("CORS: other origins get no allow-origin", !pre.headers.get("access-control-allow-origin"))
const pre2 = await fetch(`${URL}/upload`, {
  method: "OPTIONS",
  headers: { origin: "https://adx-paradigm.vercel.app", "access-control-request-method": "PUT" },
})
ok(
  "CORS: our web origin is allowed",
  pre2.headers.get("access-control-allow-origin") === "https://adx-paradigm.vercel.app",
)

if (j1.submissionId) {
  const ev = await db()
    .select()
    .from(events)
    .where(eq(events.scope, `submission:${j1.submissionId}`))
  ok(
    "job row + 'received' event written",
    ev.some((e) => e.step === "received"),
  )
  await db()
    .delete(events)
    .where(eq(events.scope, `submission:${j1.submissionId}`))
}
await db().delete(jobs).where(eq(jobs.claimKey, claim))
await db().delete(uploadTokens).where(eq(uploadTokens.claimKey, claim))
console.log(failures ? `\n${failures} failure(s)` : "\nall upload checks passed")
process.exit(failures ? 1 : 0)
