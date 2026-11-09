// P3 end-to-end in real Chrome with a fake camera + mic: recorder → upload to the worker → status page.
// Needs: web on WEB_TEST_URL (default http://localhost:3200), worker on WORKER_TEST_URL (default
// http://localhost:8099) with WEB_ORIGIN including the web URL. Run: pnpm test:record
import { dbPool, eq, events, jobs, uploadTokens } from "@adx/db"
import { issueUploadToken } from "@adx/shared/upload-token"
import { chromium } from "playwright-core"

const WEB = process.env.WEB_TEST_URL ?? "http://localhost:3200"
const WORKER = process.env.WORKER_TEST_URL ?? "http://localhost:8099"
const db = dbPool(2)
let failures = 0
const ok = (label: string, cond: boolean, extra = "") => {
  if (!cond) failures++
  console.log(`${cond ? "✓" : "✗"} ${label}${extra ? `  ${extra}` : ""}`)
}

const claimKey = `0x${"e".repeat(60)}${Date.now().toString(16).slice(-4)}`
const taskKey = `0x${"f".repeat(64)}`
const t = issueUploadToken({ claim: claimKey, task: taskKey }, process.env.UPLOAD_TOKEN_SECRET ?? "")
await db.insert(uploadTokens).values({ tokenHash: t.tokenHash, claimKey, expiresAt: t.expiresAt })
const local = {
  claimKey,
  taskKey,
  challenge: { word: "mango", fingers: 3 },
  slot: 1,
  resumed: false,
  upload: { url: `${WORKER}/upload`, token: t.token, expiresAt: t.expiresAt.toISOString() },
  title: "Fold a towel, filmed from above",
  savedAt: Date.now(),
}

const browser = await chromium.launch({
  executablePath: "/usr/bin/google-chrome-stable",
  headless: true,
  args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"],
})
const ctx = await browser.newContext({
  viewport: { width: 393, height: 852 },
  permissions: ["camera", "microphone"],
})
const page = await ctx.newPage()
const consoleErrors: string[] = []
page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()))
await page.goto(`${WEB}/record`)
await page.evaluate((c) => localStorage.setItem("paradigm.claims.v1", JSON.stringify([c])), local)

// /record should jump to the live claim.
await page.goto(`${WEB}/record`)
await page.waitForURL(`**/record/${claimKey}`, { timeout: 10_000 })
ok("/record jumps to this phone's live claim", page.url().endsWith(claimKey))
ok(
  "challenge is pinned on screen",
  await page
    .getByText("mango")
    .first()
    .waitFor({ timeout: 5000 })
    .then(
      () => true,
      () => false,
    ),
)

await page.getByRole("button", { name: "Open the camera" }).click()
await page.getByRole("button", { name: "Start recording" }).waitFor({ timeout: 10_000 })
const mime = await page.evaluate(() =>
  ["video/mp4;codecs=avc1", "video/webm;codecs=vp9,opus"].find((m) => MediaRecorder.isTypeSupported(m)),
)
ok("camera opens and a recorder format is available", !!mime, mime ?? "")
await page.getByRole("button", { name: "Start recording" }).click()
const stopBtn = page.getByRole("button", { name: "Stop recording" })
await stopBtn.waitFor({ timeout: 6000 })
ok("stop is disabled before 15 s", await stopBtn.isDisabled())
await page.screenshot({ path: "/home/arch-nitro/.playwright-mcp/p3-recording.png" })
await page.waitForTimeout(16_500)
await stopBtn.click()
await page.getByRole("button", { name: "Submit clip" }).waitFor({ timeout: 10_000 })
await page.screenshot({ path: "/home/arch-nitro/.playwright-mcp/p3-review.png" })
const meta = await page.getByText(/seconds, .* MB/).innerText()
ok("review shows the clip length and size", /1[5-9] seconds/.test(meta), meta)
const t0 = Date.now()
await page.getByRole("button", { name: "Submit clip" }).click()
await page.waitForURL("**/submissions/**", { timeout: 60_000 })
const submissionId = page.url().split("/submissions/")[1] ?? ""
ok(
  "upload completes and opens the status page",
  /^[0-9a-f-]{36}$/.test(submissionId),
  `${submissionId} (${Date.now() - t0} ms)`,
)
const [job] = await db.select().from(jobs).where(eq(jobs.id, submissionId))
ok(
  "worker stored the clip and queued a job",
  job?.status === "queued" && (job?.bytes ?? 0) > 100_000,
  `${job?.mime} ${(Number(job?.bytes) / 1e6).toFixed(2)} MB`,
)
const left = await page.evaluate(() => localStorage.getItem("paradigm.claims.v1"))
ok("the used claim is cleared from the phone", left === "[]")
ok("no console errors", consoleErrors.length === 0, consoleErrors.slice(0, 2).join(" | "))

await db.delete(events).where(eq(events.scope, `submission:${submissionId}`))
await db.delete(jobs).where(eq(jobs.claimKey, claimKey))
await db.delete(uploadTokens).where(eq(uploadTokens.claimKey, claimKey))
await browser.close()
console.log(failures ? `\n${failures} failure(s)` : "\nall recorder checks passed")
process.exit(failures ? 1 : 0)
