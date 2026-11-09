// Phone-emulated check of the live claim journey up to World App (the part a machine can do):
// tasks → task → Claim → passkey wallet (virtual PRF authenticator) → World ID sheet opens → cancel = no slot.
// Run: WEB_TEST_URL=https://adx-paradigm.vercel.app pnpm test:claim-ui
import { chromium, devices } from "playwright-core"

const WEB = process.env.WEB_TEST_URL ?? "http://localhost:3200"
let failures = 0
const ok = (label: string, cond: boolean, extra = "") => {
  if (!cond) failures++
  console.log(`${cond ? "✓" : "✗"} ${label}${extra ? `  ${extra}` : ""}`)
}

const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome-stable", headless: true })
const ctx = await browser.newContext({ ...devices["Pixel 7"] })
const page = await ctx.newPage()
const errors: string[] = []
page.on("pageerror", (e) => errors.push(e.message))
const cdp = await ctx.newCDPSession(page)
await cdp.send("WebAuthn.enable")
await cdp.send("WebAuthn.addVirtualAuthenticator", {
  options: {
    protocol: "ctap2",
    transport: "internal",
    hasResidentKey: true,
    hasUserVerification: true,
    isUserVerified: true,
    hasPrf: true,
    automaticPresenceSimulation: true,
  },
})

const rp = page
  .waitForResponse((r) => r.url().endsWith("/api/world/rp-signature"), { timeout: 30_000 })
  .catch(() => null)
await page.goto(`${WEB}/tasks`)
const card = page.getByRole("link", { name: /Fold a towel/ }).first()
ok("task board shows the live towel task", await card.isVisible({ timeout: 15_000 }).catch(() => false))
await card.tap()
await page.waitForURL("**/tasks/0x**")
const claim = page.getByRole("button", { name: "Claim with World ID" })
await claim.waitFor({ timeout: 15_000 })
const box = await claim.boundingBox()
const vh = page.viewportSize()?.height ?? 0
ok(
  "claim button is within thumb reach (bottom third, full width)",
  !!box && box.y > vh * 0.6 && box.width > 300,
  box ? `y=${Math.round(box.y)} w=${Math.round(box.width)}` : "",
)
await claim.tap()
const res = await rp
const body = res ? ((await res.json()) as { environment?: string; action?: string }) : {}
ok(
  "server signs a World ID request (production, claim-task)",
  res?.status() === 200 && body.environment === "production" && body.action === "claim-task",
  JSON.stringify(body).slice(0, 80),
)
const sheet = page.getByText("Connect your World ID")
ok(
  "World ID sheet opens",
  await sheet.waitFor({ timeout: 20_000 }).then(
    () => true,
    () => false,
  ),
)
ok(
  "sheet offers Open World ID App",
  (await page.getByRole("button", { name: /Open World ID App/ }).count()) > 0 ||
    (await page.getByText(/Open World ID App/).count()) > 0,
)
await page.screenshot({ path: "/home/arch-nitro/.playwright-mcp/claim-ui-sheet.png" })
await page.getByRole("button", { name: /close/i }).first().tap()
const toast = await page
  .getByText("No slot was taken")
  .first()
  .waitFor({ timeout: 5000 })
  .then(
    () => true,
    () => false,
  )
ok("closing World ID takes no slot and says so", toast)
ok("button returns to Claim with World ID", await claim.isEnabled({ timeout: 5000 }).catch(() => false))
const wallet = await page.evaluate(
  () =>
    new Promise<number>((r) => {
      const q = indexedDB.open("paradigm")
      q.onsuccess = () => {
        const tx = q.result.transaction("wallet", "readonly").objectStore("wallet").count()
        tx.onsuccess = () => r(tx.result)
      }
      q.onerror = () => r(0)
    }),
)
ok("wallet was created and sealed on the phone", wallet === 1)
ok("no page errors", errors.length === 0, errors.slice(0, 2).join(" | "))
await browser.close()
console.log(failures ? `\n${failures} failure(s)` : "\nall claim UI checks passed")
process.exit(failures ? 1 : 0)
