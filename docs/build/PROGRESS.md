# Paradigm: build progress (live)

> A plain-language record of what is being built, why, and where we are. It's updated after every sub-phase, so anyone (teammate, manager, judge) can follow along without reading code.
> Technical source of truth: [`SYSTEM-ARCHITECTURE.md`](SYSTEM-ARCHITECTURE.md). Live checklist: [`BUILD-PLAN.md`](BUILD-PLAN.md).

**Live app:** https://adx-paradigm.vercel.app · **Repo:** https://github.com/Abhishek222983101/agentic-data-exchange

---

## Where we are right now

| Phase | What it gives us | Status |
|---|---|---|
| P0 Foundation | Monorepo, env checks, private database, design system + app shell | ✅ done |
| P1 Arkiv core | Public data layer: 8 record types, safety guard, write queue, seed task, live task board + explorer | ✅ done |
| P-UI | Every screen in final design, clickable on a phone | ✅ done |
| P2 Identity | Embedded wallet (passkey), World ID claim, one-human-per-slot | ✅ done (real-phone World ID test pending) |
| P3 Capture & upload | In-browser camera recorder, worker upload server on Railway | ✅ done (tested on a real Android phone) |
| P4 AI check + Swarm + Arkiv verdict | Gemini watches the clip, code decides, clip encrypted to Swarm, verdict on Arkiv, duplicates caught, reputation | ✅ done |
| P5 x402 payments | Agent pays the contributor directly in USDC; key, receipt and licence only after settlement | ✅ done |
| P6 Buyer agent + Agent Pass | Spending rules, automatic payments, human approval above the limit, Hedera spend log | ✅ done (phone approve/deny to film) |

**Shipping rule:** nothing reaches `main` unless `pnpm verify` passes (typecheck + lint + unit tests + production build). Each phase ends with one push to `main`, which Vercel deploys.

---

## The idea in one minute

Robot companies train their robots on videos of humans doing tasks. They need **many short clips from many different people** of exactly the tasks their robot fails at (for example "fold a crumpled towel"). Today they buy bulk footage from closed vendors and can't check who filmed it, whether it was sold twice, or whether the person still consents.

**Paradigm** is a marketplace where:
1. The robot team's **AI agent** posts a paid task ("fold a towel, 3 USDC, 3 slots").
2. A person proves they are a **unique human with World ID** and claims one slot (one person per slot, so the dataset is genuinely diverse).
3. They **film 15–30 s on their phone** in the browser, including a random spoken word and a finger count, so the clip is live and not a replay.
4. An **AI verifier (Gemini)** watches the clip and returns timestamped evidence. Plain code, not the AI, decides accept or reject.
5. The clip is **encrypted and stored on Swarm** (decentralised storage).
6. The buyer's agent **pays automatically in USDC on Hedera** using the x402 "pay per request" standard. Above a spending threshold, a human must approve on their phone with **World Agent Pass**.
7. The contributor receives a **licence they own and can withdraw**.

Every task, verdict, receipt and licence is a public record on **Arkiv**, so anyone can audit the marketplace without asking us.

### Sponsors and what each one does for us
| Sponsor | Role in Paradigm | Why it matters |
|---|---|---|
| **Arkiv** | Public database of every task, claim, verdict, receipt, licence | Open, queryable, expiring records: data that's checkable by anyone |
| **Swarm** (Arkiv bonus) | Stores the encrypted video clips | Private until paid; our own node and storage batch |
| **Hedera** | USDC payments via x402 | Machine-to-machine payments in ~2 s, no checkout |
| **World** | IDKit (one human per slot) + Agent Pass (human approves big payments) | Stops fake accounts; keeps humans in control of AI spending |

---

## Glossary (plain words)
- **Entity (Arkiv):** one public record, like a row in a public spreadsheet, with an owner and an expiry date.
- **Owner-filtered query:** we only trust records written by *our* wallets, so nobody can inject fake tasks.
- **Wallet / signer:** a cryptographic key that signs writes. We use a separate one per job (web, worker, verifier, buyer) so a leak in one place can't impersonate another.
- **Nullifier (World ID):** an anonymous number that's the same every time the same human claims the same task. It lets us block duplicates without knowing who the person is. Kept private in our database, never public.
- **x402:** an HTTP standard. The server answers "402 Payment Required", the agent pays, and the server releases the data.
- **Settlement:** the payment actually landing on Hedera. We release keys and write receipts only after it.
- **Swarm batch:** prepaid storage capacity on Swarm. Ours is `c0cc5436…2665`.
- **Neon:** our private Postgres database, for things that must not be public.

---

## Phase log

### P0 Foundation ✅ (Fri 6 Nov, 15:15–15:45 IST)

**Goal:** a clean base every later phase plugs into.

**What was built**
| Piece | File(s) | What it does, in plain words |
|---|---|---|
| Monorepo tooling | `package.json`, `tsconfig.base.json`, `biome.json`, `vitest.config.ts` | One repo, several apps sharing code. Strict TypeScript, one linter/formatter (Biome), one test runner (Vitest). |
| Shared package | `packages/shared/` | Code used by the website, the worker and the agent: Arkiv schemas, safety guard, crypto, env checks. |
| Env validation | `packages/shared/src/env.ts` | Each service lists the settings it needs. A missing setting makes it fail at start-up with the *name* (never the value). |
| Health check | `scripts/doctor.ts` → `pnpm run doctor` | One command checks every outside service and prints a ✓/✗ table. |
| Private database | `packages/db/src/schema.ts` | 9 tables in Neon: private claim records (World ID nullifiers), upload tokens (hashed), clip encryption keys, payments, approvals, a live event log, rate limits. |
| Design system | `apps/web/src/app/globals.css`, `components/ui/*` | Grey/black base, light + dark themes, one accent colour (Arkiv orange `#FE7446`) for main actions and on-chain moments. shadcn/ui components on Radix. |
| App shell | `apps/web/src/app/layout.tsx`, `components/shell/*` | Header with logo and theme toggle; a phone-style bottom bar (Tasks · Record · Me · Console); PWA manifest, so it can be added to the home screen. |
| Security headers | `apps/web/next.config.ts` | Camera/mic allowed only for our own site, no framing, strict HTTPS, no MIME sniffing. |

**Proof it works**
- `pnpm run doctor`: all 14 live checks green (Arkiv RPC + 4 role wallets funded, Neon 9 tables, Hedera operator 913 HBAR, buyer 19.99 USDC, x402 facilitator supports `hedera:testnet`, World Agent Pass discovery, Gemini 3 Flash available, Anthropic reachable, Swarm gateway healthy).
- `pnpm verify`: typecheck, lint, 20 unit tests and production build all pass.

**Security pass (P0)**
- `.env` and `.env.local` are git-ignored; the repo only has `.env.example` (names only).
- Error messages from env checks and the Arkiv guard never include values.
- Each role has its own Arkiv wallet (`web`, `worker`, `verifier`, `buyer`). Public addresses are in `packages/shared/src/arkiv/wallets.ts`; keys stay in `.env`.
- Supply chain: all versions pinned. The new `cn` dependency was checked (maintained by shadcn).

**Decisions made in P0**
- Arkiv text fields are capped at **128 bytes** (found in the SDK source), so the full task rubric is stored as a `bytes` field on the task entity *and* on Swarm. The task board then never depends on a gateway being up.
- Upload tokens are stored as **hashes** only: a database leak can't be replayed as uploads.

### P1 Arkiv core ✅ (Fri 6 Nov, 15:45–16:15 IST)

**Goal:** the public data layer every other phase writes to, and the first real screens.

**Concepts**
- **8 record types** on Arkiv: verifier listing, task, claim, submission, verification (AI verdict), receipt (payment), licence, manifest (dataset summary). Each has typed fields; some are *indexed* so they can be searched.
- **Expiry is a feature:** a task disappears at its deadline, a claim after 2 h if unused, a licence after 90 days. Nobody has to clean up.
- **One wallet per role:** the website signs claims, the worker signs submissions, the verifier signs verdicts and receipts, the buyer agent signs tasks. Reads only trust these four owners.
- **The write guard:** before anything goes public it's scanned for things that look like secrets (private keys, World ID nullifiers, API keys, emails, phone numbers, encrypted refs). A match blocks the write.
- **The write queue:** one wallet can only send one transaction at a time without clashing nonces, so writes per wallet go in a line, with retries. If the network times out after accepting a write, we look the record up at its *predicted* key rather than writing it twice.

**What was built**
| Piece | File(s) | Plain words |
|---|---|---|
| Schemas | `packages/shared/src/arkiv/schemas.ts` | The 8 record types; namespace from `ARKIV_NS` so a testnet reset is one variable |
| Guard | `packages/shared/src/arkiv/guard.ts` | Blocks secret-looking data from becoming public; error messages never repeat the value |
| Queue + writer | `queue.ts`, `writer.ts` | The only way the code writes to Arkiv: guard → per-wallet line → retry/reconcile |
| Named queries | `queries.ts` | Every read the app makes, by name (open tasks, task by key, active claims, duplicate check, live verifiers, totals) |
| Seed | `scripts/seed-arkiv.ts` → `pnpm seed:arkiv` | Publishes the verifier listing and the towel task; rubric goes on Swarm too |
| Roundtrip test | `scripts/arkiv-roundtrip.ts` | Live test of all 8 types, the guard, and 10 parallel writes |
| Task board | `apps/web/src/app/tasks/page.tsx` | Open tasks read straight from Arkiv, refreshed every ~5 s |
| Task detail | `apps/web/src/app/tasks/[key]/page.tsx` | Summary, numbered steps, setup tips, slots, countdown, links to the Arkiv record and the rubric on Swarm |
| Explorer | `apps/web/src/app/explorer/page.tsx` | Judges pick a query, see the exact SDK code and the live JSON, and click through to the Arkiv explorer |

**Design notes**
- The **slot rail** (small squares, filled in orange as people claim) echoes the logo: one square = one verified human. It shows scarcity at a glance.
- The claim button sits **docked above the bottom bar** on phones (thumb reach), and in a sidebar on desktop.
- If Arkiv is slow, pages say "Syncing with Arkiv…" instead of showing fake data.

**Proof it works**
- `pnpm arkiv:roundtrip`: 8/8 types created and read back, guard refusal ✓, 10/10 parallel writes on one wallet ✓.
- `pnpm seed:arkiv`: verifier `0x1ff9…64cb` and task `0x59f8…a69e` live on Rabdi (PROOFS ARK-03).
- Production build: `/tasks` and `/tasks/[key]` render the live task; `/explorer` returns the same key.

**Security pass (P1)**
- Scanned the whole build output for every secret value in `.env`. Found the Arkiv access key in Next's *server-side* fetch cache (the RPC URL contains it). Fixed by marking Arkiv RPC calls `no-store`; rescanned after live requests: 0 files contain any secret.
- Page data modules import `server-only`, so they can't be pulled into the browser bundle.
- User input (task key in the URL, explorer query name) is validated against a strict pattern or an allow-list before use.
- Arkiv error details are logged server-side only; users see a plain message.

**Known limits / next**
- Each Arkiv write takes ~6.5 s (it waits for confirmation). The claim screen will show progress so this feels intentional.
- The live URL needs the server env vars on Vercel. **One-time step for Abhishek:** run `bash scripts/vercel-env.sh` (copies names from `.env` to Vercel without printing values). Until then the live board says "Syncing with Arkiv…" rather than breaking.

### P-UI Every screen ✅ (Fri 6 Nov, 16:15–16:45 IST)

**Goal:** the whole app clickable on a phone in its final look, so later phases only swap data sources.

| Screen | Route | Data today |
|---|---|---|
| Landing | `/` | **Real**: live task card + totals counted on Arkiv |
| Task board / detail | `/tasks`, `/tasks/[key]` | **Real** (Arkiv) |
| Record (no claim yet) | `/record` | Real empty state |
| Live status + verdict | `/submissions/[key]` | Sample data (P4 makes it live) |
| Me: earnings + licences | `/me` | Sample data (P2 wallet, P7 licences) |
| Buyer console | `/console` | Sample data (P6) |
| Approve a payment | `/approve/[id]` | Sample data (P6, World Agent Pass) |
| Explorer | `/explorer` | **Real** (Arkiv) |
| Proofs | `/proofs` | **Real** links from PROOFS.md |

Every sample region carries a dashed **"Sample data"** badge, so nothing pretends to be real.
Shared pieces: `PipelineSteps` (live check list, screen-reader announced), `VerdictCard` (each step with the second it happened and an evidence line), `ProofLink` (every on-chain thing is clickable), `SlotRail`, `Countdown`.

### P2 Identity ✅ (Fri 6 Nov, 16:45–17:15 IST)

**Goal:** a contributor claims one slot in under a minute, with no account, and we can prove each slot is a different human.

**Concepts**
- **Embedded wallet:** the phone creates its own key. It's locked with a **passkey** (Face ID / fingerprint) using the WebAuthn *PRF* extension: the passkey produces a secret that unlocks the wallet, and nothing usable sits on the phone by itself. Browsers without PRF fall back to a key the browser keeps but can't export.
- **One key, three jobs:** the same key owns the contributor's licences on Arkiv, receives USDC on Hedera, and signs the claim.
- **World ID claim:** the phone asks World App for a proof that "a unique human is claiming *this task* for *this wallet*". The task and wallet are baked into the proof (the *signal*), so it can't be replayed elsewhere.
- **Nullifier:** World returns a number that's the same every time the same person claims. We store it privately in Neon with a "unique per task" rule. That's how a second claim by the same person is refused, without us ever knowing who they are.
- **No overbooking:** slots are reserved inside a database transaction that locks the task, so two people tapping at the same moment can't both get the last slot.

**What was built**
| Piece | File(s) | Plain words |
|---|---|---|
| Wallet vault | `apps/web/src/lib/wallet/vault.ts`, `use-wallet.ts` | Create, seal (passkey PRF or device key), unlock, sign |
| World ID server | `apps/web/src/lib/server/world.ts` | Signs requests for our one action; checks action, environment and signal *before* asking World; then verifies with World |
| Claim service | `apps/web/src/lib/server/claims.ts` | Wallet signature → World proof → locked slot reservation → public claim on Arkiv → challenge + upload token |
| API routes | `app/api/world/rp-signature`, `app/api/claims`, `app/api/contributor` | Rate-limited, one error format, inputs validated |
| Claim flow UI | `components/tasks/claim-flow.tsx`, `challenge-card.tsx` | One button that says what's happening ("Opening your wallet…", "Waiting for World ID…", "Saving your slot on Arkiv…"), then the big challenge card |
| Hedera payout account | `packages/shared/src/hedera.ts` | After a claim, creates the contributor's Hedera account from their wallet key so USDC can arrive with no extra step |
| Wallet card | `components/wallet/wallet-card.tsx` on `/me` | Address, how it's protected, links to licences and payouts |

**Proof it works**
- `pnpm test:claims` (live Neon + Arkiv, World stubbed): 11/11. First claim ✓, same person again → resume / refused ✓, bad signature ✓, task full ✓, simultaneous claims ✓, forged proofs (wrong action / environment / task) ✓, private rows only in Neon ✓.
- Browser: passkey wallet created with a virtual PRF authenticator and kept after reload; claim opens World's sheet; closing it says "No slot was taken".
- Hedera spike: account `0.0.11337694` created from a phone-style key in 2.4 s and received USDC with no association (PROOFS HED-03).

**Security pass (P2)**
- The official IDKit example lets the client choose which server verifies the proof; ours is hard-coded.
- World checks the proof against whatever signal hash the client sends, so we recompute and compare it ourselves.
- Rate limits per IP and per wallet on claims; RP signing only for our action.
- The nullifier, wallet and upload tokens (hashed) stay in Neon; Arkiv gets a random pseudonym like `c_3f9a1b2c4d`.
- If the Arkiv write fails, the reserved slot is released, so nobody is locked out.

**Manual step for the team:** claim the towel task once from a real phone with World App (or simulator.worldcoin.org in staging), then again with the same World ID to see "You already hold a slot".

### P3 Capture and upload ✅ (Fri 6 Nov, 17:15–17:50 IST)

**Goal:** after claiming, the contributor films 15–30 s in the browser and the clip reaches our worker safely.

**Concepts**
- **No app install:** the browser records with `MediaRecorder` (MP4/H.264 on iPhone and Chrome, WebM elsewhere). It records in 1-second chunks, which avoids a known iPhone freeze after ~15 s.
- **Liveness on screen:** the word and finger count stay pinned at the top while filming, so the clip proves it was made live, for this claim.
- **Upload token:** each claim gets a one-time pass valid for 15 minutes. It's sent in a header (never in the link, so it never lands in logs). It's used up only when an upload fully succeeds, so a dropped connection can retry.
- **Worker:** a small server on Railway receives the clip, checks it really is a video, caps it at 60 MB, and queues it for checking (P4).

**What was built**
| Piece | File(s) | Plain words |
|---|---|---|
| Recorder | `apps/web/src/components/recorder/recorder.tsx`, `lib/recorder.ts` | Full-screen camera, 3-2-1, timer ring (orange until 15 s, then green), stop only after 15 s, auto-stop at 30 s, playback, Retake / Submit |
| Upload with progress | `lib/recorder.ts` (`uploadWithRetry`) | Real progress bar; reconnects up to 3 times; clear messages for "already uploaded" or "window passed" |
| Record routes | `app/record/[claim]`, `app/record` | `/record` jumps straight to the claim held on this phone |
| Worker upload server | `apps/worker/src/upload.ts`, `main.ts` | Token check → stream to disk with a size cap → video check → token used up atomically → job queued + "Clip received" event |
| Container | `apps/worker/Dockerfile` | Node 22 + ffmpeg, runs as a non-root user; refuses to start if settings are missing (lists names only) |

**Proof it works**
- `pnpm test:upload` (live worker + Neon): 11/11. Valid → accepted; reused → refused; 70 MB → refused; garbage or forged token → refused; wrong type or not a video → refused; CORS allows only our site.
- `pnpm test:record` (real Chrome with a fake camera and mic): 9/9. Camera opens, stop is locked before 15 s, a 17 s MP4 is recorded, uploaded in ~1.3 s, the status page opens, and the job is queued in Neon.
- The worker image builds and boots; it's deployed on Railway at `worker-production-e76e.up.railway.app`.

**Security pass (P3)**
- Upload tokens are single-use, expire after 15 min, are HMAC-signed, are stored hashed, and travel in a header.
- Size capped both by header and while streaming; the first bytes must be a real MP4/WebM header.
- Clips are saved with random names (no user input in paths), owner-only permissions, inside a container running as a non-root user.
- After an early rejection the worker closes the connection, so a half-sent upload can't confuse the next request.
- CORS only allows the Paradigm site.

**Live deployment (done 17:20)**
- Worker secrets set on Railway; the worker is up, reaches our Bee node privately, and our Swarm batch is **usable** (PROOFS SWM-05).
- Website secrets set on Vercel and redeployed: https://adx-paradigm.vercel.app/tasks shows the live Arkiv task; World ID signing works.
- Same tests rerun against production: `test:upload` 11/11 on the Railway worker, `test:record` 9/9 from the live site to the live worker.

**Still manual:** on a real iPhone and an Android phone: claim with World App (or the staging simulator) → record ≥ 18 s → submit; then claim again with the same World ID.

### P4 AI check, Swarm storage, verdict on Arkiv ✅ (Fri 6 Nov, 23:00 – Sat 00:00 IST)

**Concepts**
- **The AI watches, the code decides.** Gemini 3 Flash watches the clip *with sound* and fills a strict form: which word it heard, how many fingers, and for each step done / not done / not visible, with the second it happened. Plain code then decides: wrong word or fingers → rejected; a step not done → rejected; anything unclear → a person checks; otherwise accepted. The AI is never told the expected word, so it can't be nudged into saying "yes".
- **Duplicates across all buyers.** Each clip gets a fingerprint (3 frames turned into 64-bit hashes). We search Arkiv for clips with similar fingerprints, from any buyer, so the same video can't be sold twice.
- **Private until paid.** The clip is encrypted (AES-256) before it goes to our Swarm node; only the encrypted bytes are stored. The key stays in our private database until someone pays.
- **Reputation.** Each verified person gets 10 free checks; an accepted clip earns its check back. 5 rejections in a row, or under 40 % accepted after 6 clips, and that World ID can't claim anymore. Keyed by World ID, so new wallets don't reset it (answers the Arkiv team's "garbage data" concern).

**Proof:** `pnpm test:pipeline` ran every stage live (verdict in ~19 s), published the submission + verdict to Arkiv (PROOFS ARK-05), downloaded the Swarm copy and decrypted it back to the original, and caught the same clip uploaded again as a duplicate.

### P5 x402 payments ✅ (Sat 00:00 – 00:15 IST)

**Concepts**
- **x402** turns "buy this clip" into one HTTP request: the server answers *402 Payment Required* with a price; the agent pays USDC on Hedera; the server answers again with the clip's key.
- **The contributor is paid directly**: the payee in the 402 is the contributor's own Hedera account (created automatically when they first claimed).
- **Nothing before settlement**: the key is only sent after Hedera confirms the payment, and the receipt + licence are only written after that. A clip that isn't accepted never gets a price (404). A clip can't be sold twice (409).
- **The licence belongs to the contributor**: it's created on Arkiv and then ownership moves to their wallet, so only they can withdraw it.

**Proof:** `pnpm test:x402` with real testnet USDC: settled in ~6 s, key decrypted the clip from Swarm, receipt `mode: live` + contributor-owned licence on Arkiv (PROOFS HED-04, ARK-06). One of four runs hit a silent facilitator failure (no money moved); the agent now retries once.

### P6 Buyer agent, spending rules, World Agent Pass ✅ (Sat 00:15 – 00:45 IST)

**Concepts**
- **The agent pays on its own, but only within rules written in code**: up to 5 USDC per clip automatically, never above 10, at most 20 a day. The AI part (Claude Haiku) only writes a one-line explanation for the human; it can't move money.
- **Above the limit, a human must approve with World ID** (World Agent Pass). The agent opens an approval; the console shows a QR; the human scans it and confirms on their phone. The approval is tied to that exact amount, payee and clip, and must be fresh (≤ 5 minutes). Declined or expired → nothing is paid.
- **Every decision is public on Hedera** (Consensus Service topic `0.0.11343565`), so anyone can audit what the agent spent and why.

**Proof:** `pnpm test:agent` ran the real agent: a 0.05 USDC clip was paid with no human (with its HCS entry and Claude note), and a 6 USDC clip was **not** paid; a real Agent Pass approval was opened instead (PROOFS HED-05, WLD-04).

**Live now:** worker (checks clips) and agent (pays) run on Railway; the site is on Vercel. Two tasks: towel (3 USDC, paid automatically) and T-shirt (6 USDC, needs your approval).

---

## How to check things yourself
```bash
pnpm run doctor     # every outside service ✓/✗
pnpm test           # unit tests (guard, tokens, crypto, challenge, rubric)
pnpm seed:arkiv     # publish the verifier listing + demo task (idempotent)
ARKIV_NS=adx-test pnpm arkiv:roundtrip   # live test of all 8 record types
pnpm test:claims    # live claim rules: one human per slot, no overbooking, forged proofs refused
pnpm worker:dev     # run the worker locally on :8099
pnpm test:upload    # upload rules against the running worker
pnpm test:record    # real Chrome + fake camera: record → upload → status page
pnpm test:pipeline  # AI check + Swarm + Arkiv verdict + duplicate catch (test namespace)
pnpm test:x402      # real USDC: agent buys a clip, key + receipt + licence
pnpm test:agent     # the agent pays under the limit and asks a human above it
pnpm verify         # the full gate that runs before every push to main
pnpm dev            # run the website locally on http://localhost:3000
```
