# 12 — Build stack and dev workflow (decision doc)

> **Written:** Fri 6 Nov 2026, early morning IST. About 26 h left; submissions close **Sat 7 Nov 09:00 IST**.
> **Inputs:** 00-SESSION-BRIEF §7/§8/§8b, research/02, 05 (Skarl stack), 08 (fast-track kit), `~/claude-toolkit/TOOLKIT.md`, decisions log G1–G10.
> **Checked live today:** npm registry (`npm view`, all versions below), GitHub API (licences, `pushed_at`), Vercel docs, WebKit Bugzilla, Swarm docs and gateway notes, Arkiv plugin README, and Next.js docs (context7). Anything I could not confirm is marked **UNVERIFIED**.
> **One-line answer:** build one **web-first Next.js 16 app on Vercel** for phone and desktop. Add a **small Node worker on Contabo** that receives the clip, runs ffmpeg, dHash and Gemini, uploads encrypted to Swarm through our own Bee node, and writes the verdict to Arkiv. Use **Neon Postgres** as the tiny private store. No React Native, no Capacitor.

---

## 1. Mobile: web-first. No Expo or React Native, no APK.

**Recommendation:** a responsive Next.js page at `/capture/[taskId]`. It uses `getUserMedia` + `MediaRecorder` in our own hook of about 80 lines. Add `app/manifest.ts` so the page can be installed, but **demo it in a normal browser tab**. Don't wrap it later: nothing in the product needs a native API.

| Option | Phone test loop | Capture UX | Verdict |
|---|---|---|---|
| **Web-first PWA (Next.js)** | Instant: save → the tunnel URL reloads (HMR), or push → Vercel preview URL in about 1–2 min. Judges just open a QR code. | Good enough for a 10–20 s clip. Full-screen `<video playsInline muted>` preview, back camera, big record button, countdown, words to read aloud. | **PICK** |
| Expo / React Native (Expo SDK 58) | Expo Go + QR is quick, but the IMU and camera libs, plus World IDKit on RN (IDKit 4.6 has an optional `expo-crypto` peer), mean a second codebase and a second build. EAS/APK for anything outside Expo Go. | Better camera control and an IMU | **Skip.** It's also exactly Skarl's split (Next + Expo + Convex), which hurts Originality. |
| Capacitor 8.6 wrap | Needs Android Studio / Xcode builds per change | Same web UI inside a WebView. Camera permissions inside the WebView need extra plumbing. | **Skip.** It only makes sense if a store listing is needed (it isn't). |
| Native | Days | Best | No |

The "RN is slow and laggy" worry doesn't matter here: there's no RN. The web capture page is a single `<video>` element plus a button.

### Browser support for camera capture (checked 6 Nov 2026)
- **Android Chrome:** `MediaRecorder` records `video/webm` (VP8/VP9) and, on most devices, `video/mp4` with H.264 (Chromium enabled H.264 MediaRecorder on Android in 2023 and an MP4 muxer later). `isTypeSupported` has been known to over-report on Android (crbug 41369340), so **probe, then fall back**.
- **iOS / macOS Safari:** MP4 recording since Safari 14.1. **WebM (VP8/VP9 + Opus) recording since Safari 18.4.** iOS 26/27 are current.
- **⚠ Must-know iOS bug (WebKit 315091, open, still reproduces on iOS 27.0):** an MP4 recording **started without a timeslice freezes its video after about 13–16 s**, while the audio keeps going. **Fix: always call `recorder.start(1000)`.** Testers confirmed this on iPhone, iPad and Mac up to 300 s. WebM recordings are not affected.
- **⚠ WebKit 323550 (iOS 26.6):** front-camera portrait MP4 has **no rotation metadata**. Use the **back camera** (`facingMode: {ideal: "environment"}`) and let the worker normalise orientation (ffprobe `rotate` / Gemini copes).
- `getUserMedia` needs **HTTPS**, or `localhost`. That rules out a plain LAN IP on the phone (see §6).

**Capture hook settings:** `{video: {facingMode: {ideal: "environment"}, width: {ideal: 1280}, height: {ideal: 720}, frameRate: {ideal: 30}}, audio: true}`. Mime preference: `video/mp4;codecs=avc1` → `video/mp4` → `video/webm;codecs=vp9,opus` → `video/webm`. Use `videoBitsPerSecond: 2_500_000` and `start(1000)`, and hard-stop at 20 s. A 15 s clip comes out at about 4–6 MB, so it can go inline to Gemini (limit 20 MB per request). Compute SHA-256 in the browser (`crypto.subtle.digest`) so the hash can be shown before upload. The worker recomputes it.

**Installable:** `app/manifest.ts` (built into Next) with name, icons, `display: "standalone"`, `theme_color`. **Skip the service worker / offline mode** (Serwist 9.5.13 if ever needed). Camera permission behaviour in an installed iOS web app has historically been flakier than in a Safari tab, so the demo runs in the tab.

---

## 2. Private DB: **Neon Postgres** (Vercel Marketplace) + Drizzle

**Pick Neon.** It gives:
- a **real `UNIQUE(action, nullifier)` constraint**, which is the cleanest answer for the World judges and their "Portal v4 accepts nullifier reuse" rule;
- an HTTP driver that is safe on serverless (`@neondatabase/serverless` 1.2.0) for Vercel routes;
- a normal TCP driver for the worker (`postgres` 4.1.0);
- one-click Vercel integration that injects `DATABASE_URL`;
- a free plan (100 projects, 1 GB each since 2 Oct 2026, scales to zero after 5 min, so the first query is a cold start of under 1 s).

| Option | Unique constraint | Serverless-safe | Job queue | Why not |
|---|---|---|---|---|
| **Neon + Drizzle** | native | yes (HTTP) | `FOR UPDATE SKIP LOCKED` table | **PICK** |
| Supabase | native | yes | same | Fine, but brings Auth/RLS/Storage we won't use. More dashboard. |
| Turso / libSQL (`@libsql/client` 0.18.0) | native | yes | DIY | Workable second choice. Smaller ecosystem, less Drizzle and Vercel glue. |
| Convex 1.49 | **no native unique** (index + check in a mutation) | yes | built-in scheduler | **Skarl's exact backend**, and a new paradigm for 3 of the 4 people. Its realtime isn't needed because the UI polls Arkiv. |
| SQLite file on the server | native | **no on Vercel** (ephemeral FS) | — | Only if every API route moved to Contabo. Don't. |
| Upstash Redis / Vercel KV | `SET NX` only | yes | lists | No relational data, so it's awkward for keys + jobs. Fine later as a rate limiter. |

**Tables (four is enough):**
- `nullifiers(action text, nullifier text, signal text, created_at, PRIMARY KEY(action, nullifier))`
- `media_keys(submission_id pk, swarm_ref_enc bytea, sha256 text, mime text, bytes int, created_at)`: the 128-hex encrypted Swarm reference, itself AES-GCM-encrypted with `MEDIA_KEK` (env, server-only). The Swarm ref contains the decryption key, so it **never goes to Arkiv in plain form and never goes in a gateway URL**.
- `jobs(id, kind, submission_id, status, attempts, locked_at, last_error, created_at)`: the worker polls every 1–2 s with `SELECT … FOR UPDATE SKIP LOCKED LIMIT 1`.
- `upload_tokens(jti pk, claim_id, expires_at, used_at)`: single-use tokens that let the phone upload to the worker.
- Sessions: **no table**. Use `iron-session` 9.0.1 sealed cookies (World ID verified → `{nullifierHash-free pseudonym, claimId}`). Buyer console: a demo passcode.

**Sponsor storage products (check done against research/01):**
- **0G Storage** would cost a partner pick. Not worth it.
- No other sponsor (Uniswap, 1inch, Whitechain, EF, ENS, Definitive, Arc, Chainlink) offers a database.
- The value-add that **doesn't use a pick** is inside the Arkiv pick itself:
  - **Swarm bonus ($500).**
  - **`arkiv-encryption` 1.1.3** (MIT, Arkiv DevRel, AES-256-GCM WebCrypto envelope for a `bytes` column, ≤100 kB). The Swarm bonus text explicitly allows an Arkiv entity to hold an encrypted Swarm reference *"encrypt it first or keep it off Arkiv"*. **Strong optional move:** the `adx.delivery` entity carries `swarmRefEnc` (`bytes`, encrypted with a per-delivery key), and the **x402-paid endpoint sells that per-delivery key** to the buyer agent. The agent can then fetch from Arkiv + Swarm with no help from our server. That's a direct answer to "what would users lose if you swapped Arkiv for Postgres". **Nullifiers still never go to Arkiv**, not even encrypted.

---

## 3. Hosting and long jobs

### Vercel limits that matter (vercel.com/docs/limits, checked today)
- **Request body: 4.5 MB per function call.** A 15 s phone clip is over or near that limit, so **the clip must not go through a Vercel route**.
- Duration (Fluid compute on by default): **Hobby 300 s max**; Pro 300 s default, 800 s max. Memory: Hobby 2 GB / 1 vCPU.
- Bundle 250 MB uncompressed. `ffmpeg-static` (about 70 MB) would fit, but see below.
- **⚠ Hobby + private GitHub repo + teammates' commits = deployments blocked** ("commit author does not have contributing access"). Choose one fix **now**:
  - (a) start a **Vercel Pro trial** on a team and add the other 3 people. Recommended.
  - (b) make the repo public early. It must be public for judging anyway, and the from-scratch rule doesn't care.
  - (c) have one person deploy everything. Bad for parallel work.
- Preview deployments are behind **Vercel Authentication** by default. Phones must be logged in to Vercel, **or** disable protection for previews. For Playwright, use **Protection Bypass for Automation** (`x-vercel-protection-bypass` header).

### Where the work runs
| Piece | Where | Why |
|---|---|---|
| UI, buyer console, capture page, Arkiv reads (server-proxied with the access key), World ID `rp-signature` + `verify` routes, **x402-paid routes** (`withX402` from `@x402/next`), upload-token minting | **Vercel** (`apps/web`) | Fast previews per push. All of these are small JSON requests. |
| **Clip upload endpoint**, SHA-256 check, ffprobe/ffmpeg frames, dHash, **Gemini verification**, **Swarm upload (encrypted)**, Arkiv `adx.submission` / `adx.verification` writes, policy-checked HTS payout + `adx.receipt` | **Node 22 worker** (`apps/worker`) in Docker on **Contabo** (the shared box already used for FCG; separate compose project, `mem_limit`, own subdomain via sslip.io + Caddy TLS). Fallback: Railway (CLI already on the machine). | No 4.5 MB cap and no 300 s cap. ffmpeg on the system, not a 70 MB static binary. It sits next to the Bee node, so Swarm uploads are Node-side and avoid browser CORS. It retries from the `jobs` table. |
| Bee light node (Swarm) | Same Contabo compose (`ethersphere/bee:2.8.3`) | Our own postage batch → the batch ID + wallet that `/arkiv/swarm.md` asks for. Only the worker can reach its API (don't expose 1633 publicly, or anyone can spend our batch). |
| Independent buyer agent | `apps/agent` CLI, run from a laptop in the demo | Has to be a *different client* that discovers tasks on Arkiv and pays x402 with no human approving (Hedera track). |

**Why not run verification in a Vercel function with Fluid compute?** It would fit in 300 s: a 15 s clip takes a few seconds of ffmpeg plus a 10–30 s Gemini call. But the bytes would first have to reach Vercel (4.5 MB limit), so you'd need a staging bucket and a second download. The worker already holds the bytes. Keep Vercel for JSON.

### Upload path (browser → worker → Swarm)
1. The contributor passes World ID → the Vercel route writes the nullifier (UNIQUE) → creates the `adx.claim` on Arkiv → mints a **single-use upload token** (HMAC JWT, 10 min, bound to `claimId` + max bytes 25 MB + allowed mimes).
2. The phone `PUT`s the Blob **directly to `https://adx-worker.<ip>.sslip.io/upload/:claimId`** with `Authorization: Bearer <token>`. The worker has CORS allow-list = prod + `*.vercel.app` preview pattern + tunnel host. It streams to `/tmp`, checks size, mime and SHA-256, marks the token used and inserts a `jobs` row.
3. The worker job:
   1. ffprobe (duration ≤ 25 s, has video + audio);
   2. ffmpeg `fps=1,scale=256:-1` → `sharp` 9×8 greyscale → dHash per frame, compared against previous dHashes (prefix buckets stored as Arkiv attributes, per G6);
   3. Gemini (`@google/genai` 2.32.0, inline base64, `processing:{type:"static", fps:2}`, JSON schema verdict with `MM:SS` evidence and transcribed words);
   4. **Swarm upload with encryption** (bee-js 13 `bee.file.upload(batchId, bytes, name, {encrypt:true})`-style call; **v13 namespaced the API**, `bee.data.upload` / `bee.storage.buy` in the README, so check the installed `.d.ts`, not older snippets);
   5. store the encrypted ref in `media_keys`;
   6. write `adx.submission` + `adx.verification` to Arkiv (verifier wallet);
   7. if the policy passes → HTS USDC transfer → `adx.receipt`.
4. The UI polls `GET /api/claims/:id/status` (Neon) + Arkiv every 2 s. No websockets.

**Swarm plan, in order, so it never blocks the demo (G2):**
- **Hour 0 (spike, 30 min):** upload from Node to the **public API gateway** `https://api.gateway.ethswarm.org` with `NULL_STAMP`. It stamps with its own batch. Use the API host, **not** `gateway.ethswarm.org`, which returns 200 HTML for every address and 405 on POST. That proves the code path. **Never put an encrypted ref in a gateway URL** (it contains the key, and gateways log URLs). Download with bee-js `downloadData`/`downloadFile`, which decrypts locally.
- **In parallel:** ask the **Swarm team at the venue for a postage batch / hackathon node**. Otherwise bring up `bee` on Contabo: fund it via `fund.ethswarm.org` (one tx from any EVM chain; costs **real** xDAI + xBZZ, a few dollars, **user-run, never Claude-held keys**), then `swarm-cli stamp buy`. Wait about 10 blocks before the first stamped upload.
- **Bonus evidence:** batch ID, buying wallet, node URL, one Arkiv entity key → Swarm ref (an unencrypted public preview frame or manifest can have an openable link; the encrypted clip can't).
- **Optional "browser-direct" path:** bee-js runs in the browser, and the public gateway's CORS refuses `Swarm-Pin`/`Swarm-Tag`/ACT headers. Bee ≥2.8.3 returns 403 to foreign origins unless `--cors-allowed-origins` is set. That's more surface for no demo gain, so it's a stretch only.

---

## 4. Final stack (exact versions, npm registry 6 Nov 2026)

| Layer | Package | Version | Notes |
|---|---|---|---|
| Runtime | Node | **22.23.2** (installed) | Arkiv needs ≥22.10 |
| Package manager | pnpm | 10.28.2 (installed) | workspaces + `overrides` |
| Framework | `next` / `create-next-app` | **16.4.5** | `@x402/next` needs ≥16.4.1. `proxy.ts` replaces middleware. |
| | `react` / `react-dom` | **19.3.1** | |
| | `tailwindcss` | 4.3.4 | |
| | `typescript` | npm `latest` is **7.0.2** | **UNVERIFIED** that every tool (typescript-language-server 6.0.3, drizzle-kit) is happy with TS 7. If anything breaks: `pnpm add -D typescript@~5.9` in that package. |
| UI | `shadcn` CLI | 4.23.0 | `init` then `add button card badge dialog sonner table tabs progress sheet` (+ `sidebar-07` for the buyer console) |
| | `motion` | 14.9.1 | verdict reveal only |
| | `qrcode.react` | 4.2.0 | QR to open the capture page on a phone |
| Arkiv | `@arkiv-network/sdk` | **1.0.1** | peer `viem ^2` |
| | `viem` | 2.57.16 | |
| | `arkiv-encryption` | 1.1.3 (MIT) | optional, for `swarmRefEnc` |
| Swarm | `@ethersphere/bee-js` | **13.2.0** (BSD-3-Clause, engines bee 2.8.3) | worker only |
| | `@ethersphere/swarm-cli` | 3.7.0 | ops: stamps, status |
| | Bee | 2.8.3 (Docker) | security release, 15 Oct |
| Hedera x402 | `@x402/core` `@x402/hedera` `@x402/fetch` `@x402/next` `@x402/paywall` | **2.30.0** | `@x402/hedera` **pins `@hiero-ledger/sdk` 2.90.1** + `@hiero-ledger/proto` 2.32.0 |
| Hedera SDK | `@hiero-ledger/sdk` | **2.90.1** | **Not `@hashgraph/sdk`** (2.81.0, last publish Mar 2026). Two SDK copies → `t.startsWith is not a function`. Root `pnpm.overrides: {"@hiero-ledger/sdk": "2.90.1"}`. |
| Agent Kit | `@hashgraph/hedera-agent-kit` | **4.2.0** | peer `@hiero-ledger/sdk ^2.90.1`. **Not** the old `hedera-agent-kit` 3.8.2 (deprecated). |
| | `@hashgraph/hedera-agent-kit-ai-sdk` | 2.1.0 | peer `ai ^7.0.37` |
| World ID | `@worldcoin/idkit` | **4.6.0** | includes `/signing`. `expo-crypto` peer is optional. |
| | `@worldcoin/idkit-server` | 1.2.0 | only if signing outside Next |
| Agent / LLM | `ai` | **7.0.163** | `ToolLoopAgent` for the buyer agent |
| | `@ai-sdk/google` | 4.0.112 | agent model |
| | `@google/genai` | **2.32.0** | verifier (Interactions API; model id `gemini-3.8-flash` per docs on 5 Nov, **re-check**) |
| | `zod` | 4.6.7 | |
| DB | `drizzle-orm` / `drizzle-kit` | 0.45.4 / 0.31.11 | |
| | `@neondatabase/serverless` | 1.2.0 | web (HTTP) |
| | `postgres` | 4.1.0 (Unlicense) | worker (TCP, SKIP LOCKED) |
| Session | `iron-session` | 9.0.1 | |
| Media | `sharp` | 0.35.5 | dHash |
| | ffmpeg | system package in the worker image (`apt-get install ffmpeg`) | not `ffmpeg-static`; avoids shipping the GPL binary in npm deps |
| Test | `@playwright/test` | 1.65.0 | |
| Debug | `eruda` | 3.4.3 (MIT) | in-page console on iPhone, loaded only with `?debug=1` |
| Optional MCP service | `@modelcontextprotocol/sdk` 1.32.2 + `@x402/mcp` 2.30.0 | | only if time allows. **Not** `mcp-handler` (clashes). |

**Not used:** Convex, Expo/RN, Capacitor 8.6, `ffmpeg.wasm`, `fluent-ffmpeg`, `@google/generative-ai`, v1 `x402-*`, Vercel Blob (fallback only, if the worker upload endpoint fails: `@vercel/blob` 2.8.2 client upload bypasses 4.5 MB).

### Repo structure (fits the existing `adx/` skeleton: `apps/ packages/ scripts/ docs/arkiv/ sponsor-logs/`)
```
adx/
  package.json            # pnpm workspaces, overrides { "@hiero-ledger/sdk": "2.90.1" }, engines node>=22.10
  pnpm-workspace.yaml
  apps/
    web/                  # Next 16 on Vercel (Root Directory = apps/web)
      app/(buyer)/…       # console: tasks, review queue, receipts (HashScan links)
      app/capture/[taskId]/  # phone capture flow
      app/api/world/{rp-signature,verify}/route.ts   # hard-coded rp_id + portal URL (fix the example's SSRF)
      app/api/paid/…      # withX402 routes (Hedera scheme) — what the agent buys
      app/api/claims/…    # claim, upload-token, status
      lib/{arkiv-read,db,session}.ts
    worker/               # Node 22 + Docker (ffmpeg, bee client, gemini, payouts)
      src/{server.ts,upload.ts,jobs.ts,verify/{ffmpeg,dhash,gemini}.ts,swarm.ts,payout.ts,arkiv-write.ts}
      Dockerfile  compose.yaml (worker + bee + caddy)
    agent/                # independent buyer agent CLI (AI SDK ToolLoopAgent + wrapFetchWithPayment + Arkiv reads)
  packages/
    shared/               # Arkiv defineSchema() for adx.*, zod verdict schema, drizzle schema, env parsing, constants
  scripts/
    seed-arkiv.ts         # idempotent; ARKIV_NS env lets you bump namespace after a Rabdi reset
    associate-usdc.ts     # user-run, imports SDK primitives from @x402/hedera
    smoke-x402.ts  smoke-swarm.ts  smoke-gemini.ts
  tests/e2e/              # Playwright
  docs/arkiv/  sponsor-logs/  docs/planning/  docs/AI_USAGE.md  THIRD-PARTY-NOTICES.md
```
- Use **three apps, not one**: the worker can't live on Vercel, and the agent has to be a separate client for the judging story.
- **No Turborepo.** `pnpm -r` and `pnpm --filter` are enough.
- **Give each writer process its own Arkiv wallet:** web = platform/buyer writer, worker = verifier writer. Two processes signing with one key collide on nonces. It also matches "trust by signer".

---

## 5. Claude Code tooling for this build

Already connected (user scope): **context7, Playwright MCP, Exa**, Trail of Bits skills, mattpocock-skills, frontend-design (example-skills). **typescript-lsp is not installed.**

Install at **project scope** inside `adx/`:

| Tool | Command | Licence / risk |
|---|---|---|
| **Arkiv plugin** 0.5.4 (skills + keyless read-only Mumbai MCP `https://mcp.arkiv.network/mumbai` until 10 Nov + SessionStart hook that checks the SDK version) | `claude plugin marketplace add Arkiv-Network/ai-plugin --scope project && claude plugin install arkiv@arkiv --scope project`, restart, then ask it to call `server_status` (expect profile `mumbai`) | **No LICENSE file** (repo pushed 3 Nov). Use as a tool only and **don't copy its code into the repo**. The hook runs Node and reads `package.json`/lockfile only, with no network access. **Don't also install `Arkiv-Network/skills` separately**: the plugin bundles them, and the README warns about duplicate connections. |
| **Hedera skills** | `/plugin marketplace add hedera-dev/hedera-skills` then `/plugin install agent-kit-plugin`, `/plugin install native-services-js` (HTS/HCS), `/plugin install hackathon-helper` | Apache-2.0, pushed 3 Sep 2026, so older than Agent Kit 4.2 / x402 2.30: trust package `.d.ts` over the skill text. Read each plugin's `hooks/` before enabling. |
| **Gemini API skill** | `npx skills add google-gemini/gemini-skills --skill gemini-api-dev` | Apache-2.0. Stops Claude writing legacy `generateContent` / `@google/generative-ai`. Set `DO_NOT_TRACK=1` (skills CLI telemetry). |
| **shadcn MCP** (official only) | `npx shadcn@latest mcp init --client claude` | Official. The "shadcn MCP" on shadcn.io is a paid third-party lookalike. |
| **World Simulator MCP** | `claude mcp add --transport http world-simulator https://simulator.worldcoin.org/api/mcp` (+ docs skill at `docs.world.org/world-id/SKILL`) | Lets Claude complete a **staging** proof during tests (`complete_test_request`). **UNVERIFIED** whether it needs auth. Staging only, never shown as a real proof. |
| **Swarm quickstart skills** | `git clone https://github.com/ethersphere/swarm-quickstart-skills ~/tools/swarm-qs` and run `claude` there; use `/swarm-setup-bee`, `/swarm-stamps` for the Bee node | **No licence** (pushed Jul 2026). Ops guidance only, kept outside the repo. `ethersphere/swarm-mcp` is a self-declared PoC with no licence: **skip**. |
| **typescript-lsp** | `npm i -g typescript-language-server typescript` then `/plugin install typescript-lsp@claude-plugins-official` | Official. Watch for TS 7 (see §4). |
| **graft / Trail-Code** | `graft init --agents claude` in `adx/` once code exists | Already on the machine. Index code only. |
| Security before submission | `/security-review`, `insecure-defaults:audit` on `apps/web/app/api` + `apps/worker` | Already installed. Focus on the upload token, CORS list, verify route, payout policy. |

**Skip for this sprint:** Superpowers/BMAD/Spec Kit (ceremony), Impeccable hooks, Hedera hosted MCP (needs wallet auth; we already use Agent Kit), Chrome DevTools MCP.
**Risk notes:**
- Plugins with SessionStart hooks add tokens every session. Keep it to Arkiv + Hedera.
- Put the TOOLKIT telemetry block in `adx/.claude/settings.json`.
- **No plugin or MCP gets a private key.** Keys live in `.env.local` / worker env, typed in by the user.

---

## 6. Fast test loop (phone + desktop, continuously)

**Three loops, from fastest to most real:**

1. **Local + tunnel (seconds; use for capture UI work).**
   - Run `pnpm --filter web dev`, then `cloudflared tunnel --url http://localhost:3000`. cloudflared is already installed at `~/.local/bin`.
   - That prints a `https://<random>.trycloudflare.com` URL, and HTTPS means the camera works on both iPhone and Android with no certificates.
   - Add to `next.config.ts`: `allowedDevOrigins: ['*.trycloudflare.com']` (and `experimental.serverActions.allowedOrigins` if using actions).
   - Put a `/dev/qr` page that renders the current origin as a QR code. Scan it once and HMR does the rest.
   - Debugging:
     - Android: USB + `chrome://inspect`.
     - iPhone without a Mac: `?debug=1` loads eruda.
   - The worker runs locally too (`pnpm --filter worker dev` + its own tunnel). Point the web env `WORKER_URL` at it.
   - `next dev --experimental-https` is fine on desktop. Phones won't trust the mkcert CA without manual installs, so use the tunnel.
2. **Vercel preview per push (1–2 min; use for integration).**
   - Every push to a branch gets a URL, plus a stable branch alias `adx-git-<branch>-<scope>.vercel.app`.
   - Fix the Hobby/private-repo block first (§3).
   - Either turn off preview protection or have teammates log in to Vercel on their phones.
   - Neon integration: use **one shared dev database** for previews. Turn off per-preview branching: an empty branch per PR means re-seeding each time, which wastes minutes.
   - The worker CORS list allows `https://adx-*-<scope>.vercel.app`.
3. **Production URL (main) = demo build.**
   - Protect `main`: merge only after the smoke test passes.
   - The demo phone uses the prod URL. Record the demo video from it.

**Automated checks (keep them few):**
- **Playwright smoke** (`tests/e2e/smoke.spec.ts`, Chromium project) runs on the GitHub `deployment_status` event against the preview URL, sending the `x-vercel-protection-bypass` header. It:
  - loads the buyer console and finds the seeded task from Arkiv;
  - runs the capture page with **fake camera flags**: `--use-fake-ui-for-media-stream --use-fake-device-for-media-stream --use-file-for-fake-video-capture=tests/fixtures/clip.y4m`. Record 3 s, upload to the worker and assert the job reaches `verified` or `review`;
  - checks that the x402 route returns **402** with Hedera `accepts` when there's no payment.
  - It doesn't run World ID in CI. Use a staging action with the Simulator, triggered by hand, and **never** stub a pass in production code paths.
  - WebKit can't fake a camera reliably, so **iPhone is a manual check**: 1 real recording per merge to main, ≥18 s long, to catch the WebKit 315091 freeze.
- **Scripts (all idempotent, `pnpm run <x>`):**
  - `seed:arkiv`: creates the demo buyer task(s) under `ARKIV_NS` (default `adx`). After a **Rabdi reset**, re-run it. If old entities linger, bump `ARKIV_NS=adx2`. All reads filter by `$owner`.
  - `smoke:x402`: the agent pays 1 request on `hedera:testnet` and prints the HashScan link (fallback facilitator from env).
  - `smoke:swarm`: uploads 1 KB encrypted, downloads it, compares.
  - `smoke:gemini`: sends a fixture clip and validates the verdict JSON.
  - `doctor`: checks env vars, the Arkiv access key, tGLM balance, USDC association + balance per account, Bee `/health` + stamp TTL, and the Neon connection.
- **Hourly rhythm** (also commit + push hourly, per CLAUDE.md):
  1. `pnpm -r typecheck && pnpm --filter web build`
  2. push
  3. smoke runs against the preview
  4. one real-phone pass
  5. merge
  6. add a `sponsor-logs/*` row for anything that broke

---

## 7. Hour-0 order of work (suggested split for 4 people + Claude)

| Who | First 90 min |
|---|---|
| A (web) | `create-next-app@16.4.5`, shadcn, capture hook (`start(1000)`), `/dev/qr`, tunnel. Get a phone recording to play back locally. |
| B (Hedera) | `associate-usdc.ts` (user-run), `smoke:x402` with `ExactHederaScheme` + `withX402` on one route. **G1, the biggest risk.** |
| C (Arkiv/World) | `packages/shared` schemas, `seed:arkiv`, read route. IDKit `rp-signature` + `verify` (hard-coded, UNIQUE insert). |
| D (worker/Swarm/AI) | worker skeleton + upload endpoint, `smoke:gemini`, `smoke:swarm` against the public API gateway. Start the Bee node / ask Swarm for a batch. |
| Claude | Install the §5 tooling, Neon + Vercel project wiring, Playwright smoke, `doctor` script. |

## Still UNVERIFIED (check on night 1)
- That the public API gateway accepts a 5–15 MB **encrypted** upload from Node without rate limiting.
- The Bee light node's sync time and funding cost on Gnosis today.
- TS 7.0.2 compatibility with drizzle-kit and typescript-language-server.
- The World Simulator MCP auth requirements.
- The Gemini model ID and quota.
- `withX402` + `ExactHederaScheme` in a Next 16.4.5 route (carried over from research/08).
