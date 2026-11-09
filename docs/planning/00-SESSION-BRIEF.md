# ETHGlobal Mumbai 2026 — Master Session Brief (READ FIRST)

> **Purpose:** the single context file for long build sessions. It merges the team's project brief, the reconstructed ChatGPT session history and web research verified on 3 Nov 2026.
> **Last updated:** 5 Nov 2026 (Thu, early morning). **Hacking starts TODAY, Thu 5 Nov, 21:00 IST.**
> **Rule for anyone (human or AI) reading this:** facts marked (VERIFIED) were checked against a primary source on 3 Nov 2026. Everything in the original brief that research contradicted is called out in §5 and §6. Do not trust pre-30-Oct-2026 tutorials or model memory for Arkiv, IDKit or x402 (see §8).

## 0. Folder map and read order

| File | What it is |
|---|---|
| `00-SESSION-BRIEF.md` | **This file.** Synthesis plus all the decisions you need to start. |
| `01-PROJECT-BRIEF.md` | Full markdown transcription of the team PDF brief (1 Nov 2026). It is the original thesis and is now partly outdated (see §5). |
| `02-SESSION-HISTORY.md` | The reconstructed ChatGPT session: Skarl inspiration, sponsor reasoning, Take Rate alternative, scores. |
| `03-DECISIONS-AND-OPEN-QUESTIONS.md` | Living decisions log and open questions. Update it as the team decides. |
| `research/01-event-and-prize-tracks.md` | Event facts, rules and **every sponsor track verbatim** (12 sponsors, $144.5k). |
| `research/02-tech-stack-due-diligence.md` | Arkiv / Hedera x402 / World IDKit / Chainlink CRE: current packages, gotchas and doc snippets. |
| `research/03-market-and-competitors.md` | Skarl, the 9 reference companies (corrected), 10+ other players, demand and price evidence. |
| `research/04-prior-projects-and-overlap.md` | Prior ETHGlobal projects: TARE, human-data projects, past sponsor-track winners. |
| `research/05-skarl-teardown.md` | Skarl's code module by module, with file:line refs: what's real vs mocked, weaknesses, 15 ideas to rebuild our way. |
| `research/06-skarl-demo-and-site.md` | Skarl's demo video shot by shot, live-site tour (backend now dead), demo lessons for us. |
| `research/07-sponsor-checklist.md` | **Tick-box compliance list** for the ETHGlobal rules, Hedera, Arkiv and World. |
| `research/08-fast-track-kit.md` | Licensed starters and components we may legally reuse, per module. |
| `skarl-study/` | Read-only clone of Skarl, demo frames and site screenshots (git-ignored, **never copy code from it**). |
| `sources/` | Original PDFs and markdown, plus `pdftotext` extracts. Never edit these. |

## 1. The project in one paragraph (as the team wrote it)

**Agentic Data Exchange:** an agent-native marketplace and settlement layer for human-generated, real-world AI training data. Buyers (or their agents) post a structured capture task with a reward, deadline, rubric, licence and budget. A contributor discovers it, passes a uniqueness check, accepts the terms, claims it and records a clip. The media stays in private storage, and only a hash plus a controlled reference is shared. An AI verifier produces a report with timestamped evidence, a confidence band and a human-review path. A policy-bound finance agent settles USDC. Shared task, claim, verification, manifest and receipt records live on Arkiv, where an independent client or agent can query them.

Original pitch: *"A programmable marketplace where AI agents can source, verify and pay for human-generated real-world training data, with portable records of task requirements, provenance, licensing and settlement."*

The demo the brief wants is one vertical slice: 1 buyer → 1 task → 1 contributor → 1 recording → 1 AI report → 1 approved payment → 1 independently queryable Arkiv record. Its biggest judging advantage: **an independent agent discovers a task on Arkiv, pays an x402-protected endpoint, gets evidence-linked output, and accepted work settles under a clear policy.** Its biggest risk is **breadth**.

## 2. Hard event facts and rules (VERIFIED, research/01)

| Item | Fact |
|---|---|
| Event | ETHGlobal Mumbai 2026, in person only, at Jio World Convention Centre, BKC, alongside Devcon 8 |
| Dates | Thu 5 – Sat 7 Nov 2026 |
| Thu 5 Nov | Registration 13:00 · partner workshops 15:30–18:00 · opening 20:00 · **hacking starts 21:00 IST** |
| Sat 7 Nov | **Submissions close 09:00 IST (no late entries)** · judging 09:30–12:30 · finalists told 15:15 · closing ceremony 15:30 |
| Hacking time | 36 h |
| Team | Up to 5. **Applications and staking are closed**, so every member must already be accepted and staked. One project per person. |
| Partner prizes | **Max 3 partners per project.** Several tracks from one partner count as 1 pick. The finalist track is separate. |
| Finalists | 7 min: 4 min demo + 3 min Q&A. Criteria: Technicality, Originality, Practicality, Usability, WOW. |
| Video | 2–4 min (enforced at upload), ≥720p, no speed-up, **no phone recording, no AI voiceover**. Sponsor limits stack (Hedera ≤5 min, 0G <3 min). |
| Git | Commit steadily. Large single commits or missing history can disqualify. |
| AI use | Must document where and how AI was used (files and parts). **All spec files, prompts and planning artifacts must go in the repo**, and that includes this folder. |
| Workshops worth attending (Thu) | 15:30 Hedera "Hedera × Claude Code – AI Skills" (Room 2) · 16:00 Arkiv (Room 2) · 17:30 World (Room 1) |

### ⚠️ The from-scratch rule — this decides what we can do before Thursday 21:00
> "all work on your project must begin after the hackathon officially starts. Any prior project-specific code, designs, or assets are not allowed unless they're from public libraries or starter kits." Breaking it means no partner prizes and no finalist slot.

- **OK now:** research, reading docs, picking libraries, creating accounts and keys, getting faucet funds, writing the plan.
- **Not OK now:** project repo code, UI designs or mockups, project assets. Do throwaway SDK smoke tests outside any project folder, keep them generic, and never copy them into the repo.
- **Ask ETHGlobal staff (Discord or at check-in)** whether the written brief and plan count as "designs". Either way, disclose them in the repo, since the AI rule requires planning files there.

## 3. Sponsor shortlist — real numbers and requirements (VERIFIED, research/01)

Only 3 partner picks are allowed, so the brief's "Hedera + Arkiv + World + optional Chainlink" has to become 3.

| Pick | Track | Prize | What qualifies (short) | Fit |
|---|---|---|---|---|
| **Hedera** | 🤖 AI Agents That Pay: x402 on Hedera | **$6,500** (3k / 2k / 1.5k) | x402 endpoint settling on Hedera testnet via a listed facilitator. **An agent finds it and completes ≥1 paid request with no human approving.** README includes a Hedera tx ID. Video ≤5 min with a HashScan link. *Extra points:* budgets, allowlists, human-in-loop above a threshold, HCS spend audit log, HCS-14/ERC-8004 identity, A2A/ACP negotiation, **USDC settlement**, Agent Kit / Hedera MCP. | Core |
| **Arkiv** | 🧩 Build on Arkiv (from scratch) | **$4,000** (3k / 1k) + optional 🐝 Swarm bonus **$500** (doesn't use a pick) | Writes to the **Rabdi** testnet via `@arkiv-network/sdk` or JSON-RPC, and **a user-facing feature reads from Arkiv** (a write-only log or SDK-installed-but-unread does not count). README lists writer wallet(s) and one runnable query. Repo needs `/arkiv/schema.md`, `/arkiv/friction.md`, `/arkiv/reach.md`, `/arkiv/why-arkiv.md`, `/arkiv/how-you-use-arkiv.md`. Public repo with an OSS licence. Judging is 25% each: feedback, reach, why Arkiv, how you use Arkiv. The track text literally suggests *"Agents: ephemeral coordination state: tasks, bids and claims that agents share, query and let expire"* and *"Markets: listings that expire at their deadline"*. | Core, and a near-perfect match to the track text |
| **World** | 🪪 Best Use of IDKit **or** 🚀 World ID Agent Pass (same pick) | IDKit **$2,500** (2 × $1,250, no ranks). Agent Pass **$5,000** (2.5k / 1.5k / 1k), "especially interested in agentic products" | IDKit: real trust moment, the minimum sufficient credential (Proof of Human / Passport / Selfie Check with Sybil score), server-side verification, success path **plus** an alternative path, integration debrief. Agent Pass: full journey (request → user completes → validated → protected agent action), plus a denied, expired or cancelled path, backend validation, debrief. Proofs are mocked now, so no sandbox app is needed. | Core. **Agent Pass needs research** (higher prize, fits agents) |
| ~~Chainlink~~ | 🔗 Best workflow with CRE | $1,500, single winner | Simulation via the CRE CLI is enough, but **CRE supports neither Hedera nor Arkiv**, so it adds a Sepolia contract. | **Drop** (4th pick, small prize, extra chain) |
| (alt) 0G | ♾️ Build with 0G PC / 🤖 Physical AI | $5,000 each | Consumer app where 0G inference *is* the product, with request IDs and a video under 3 min. | Not our shape |
| (alt) Arc | 5 tracks × $3,000, single winners | — | Must start in Arc Studio. | Pivot only |
| (fallback idea) Uniswap | 🦄 Build with Uniswap | $10,000 (4k / 3k / 2k / 1k) | Public repo + `FEEDBACK.md` + feedback form. | Only for Take Rate (parked) |

**Recommended trio: Hedera + Arkiv (+ Swarm bonus if cheap) + World.** Maximum partner upside ≈ $3k + $3k (+$0.5k) + $2.5k (Agent Pass) or $1.25k (IDKit), plus the finalist track.

## 4. Reality check: Skarl and prior work overlap our brief heavily (VERIFIED, research/03 & 04)

**Skarl, the original inspiration, is a Cal Hacks 13.0 hackathon project (25 Oct 2026) that won Coinbase "Best Use of x402".** Links: devpost.com/software/skarl · github.com/stephenhungg/skarl · live at skarl.devshardat.work. It already ships most of our brief:
- buyer web console (Next.js 16) + contributor phone app (Expo) + **Convex** backend, the exact stack our brief proposes
- buyer funds orders in **USDC over x402** (Base Sepolia), from a wallet or **directly from the buyer's own AI agent**; signed auto-pay policy
- a **two-model Gemini "jury"** with timestamped evidence per check; human review on disagreement; spoken random words for liveness; aligned frame-hash duplicate detection; IMU trace
- **a finance agent that drafts but can never approve its own payments**, plus a CDP wallet cap and an address allowlist as a second limit
- EAS attestation of every verification report; a Solana Token-2022 licence per delivery; LeRobot v2.1 export
- **MCP server + skill file for agent self-onboarding**

Others already doing the "agent-native + onchain settlement" part:
- **Vangrid**: live docs. Agents commission captures in one HTTP call, x402 USDC bounty into escrow on Base or Arc, accept via API.
- **Thenar** (ETHOnline 2026): World ID + Arc USDC escrow + **recordings sold to agents over Hedera x402**.
- **WorldMod** (ETHOnline 2026): phone capture + World ID + **Chainlink CRE acceptance check** + Hedera.
- **Hands Unchained** (ETHGlobal Lisbon 2026): finalist, World 1st, 0G 2nd.
- HumanOps, Open Bounty and RentAHuman are generic "agents hire humans, pay USDC" markets.

**From research/04 (prior ETHGlobal projects):**
- **Closest overlap is WorldMod** (ETHOnline 2026): a USDC bounty in escrow, a phone capture inside World App after Selfie Check, a server-side score (hands in frame, gyro-vs-camera motion, dedup), a Chainlink acceptance check, a USDC payout and a dataset tokenised on Hedera. No prize shown; its repo returns 404.
- Hands Unchained was the only clear winner in this space (World 1st, 0G 2nd, finalist).
- There are 10+ "agents hire verified humans" projects; Legwork is the only confirmed prizewinner.
- Arkiv's August ideathon already listed unbuilt training-data marketplace ideas.
- **Arkiv has never had an ETHGlobal track before Mumbai.** Its own past winners make **expiry the core mechanic**.
- **Past winners (research/04 §5b):**
  - **Hedera agentic-payments winners** were agent marketplaces or commerce infrastructure: Accrue (Finalist), MARS, GlassBox402 (Finalist), DIVE (Finalist) and Turnstile. Many plain "agent pays an API" entries at ETHOnline won nothing.
  - **World winners** were fair access to scarce things for unique humans (Proof-of-Human Drops 1st, Equitas, VEIL) and human-backed agents (AgentGate: x402 on Hedera + World AgentKit, 1st at Cannes).
  - Both patterns fit "agent buyer + one-human-per-scarce-paid-task".
- **The gap still open after the showcase search:**
  - nobody keeps task, claim, verification and receipt records on Arkiv where other agents can query them
  - nobody has **an AI agent as the buyer who posts the task under a spending policy**
  - nobody combines buyer-side x402 with real-world video capture

**Consequences:**
1. Building the brief as written means rebuilding Skarl with Arkiv and Hedera swapped in. Judges (and the finalist "Originality" criterion) may notice, and Thenar and WorldMod used our exact sponsor mix months ago.
2. **"Agent-native" and "stablecoin settlement" alone are no longer differentiators.**
3. **The gap research did not find anyone filling:** an **open, vendor-neutral shared record layer** (task, claim, verification, receipt) that *existing* vendors (Handkin, Waffle GRID, Awign, Taught, Troveo…) and independent buyer agents can all publish to and query. None of the 9 incumbents expose agent, x402 or stablecoin rails, and every crypto entrant is a closed, vertically integrated marketplace. This is the brief's own "works alongside existing data providers" line, and it lines up exactly with Arkiv's judging question: *"If you swapped Arkiv for Postgres, what would your users lose?"*
4. **Do not reuse Skarl's code** (public, no licence) or copy its design. It is fine to cite it as prior art.
5. Verification honesty: Skarl itself has no measured accuracy. If we claim "AI-verified", show a measured false-accept / false-reject number on a small test set, or label it unmeasured.

**Next step (the user's planned "in-depth ETHGlobal research"):** sharpen the wedge. Candidate directions, none decided yet:
- **A. Open record layer / protocol-first:** Arkiv schemas as a public standard for data-task listings, claims, verification attestations and receipts. Our app is just one client. Several "vendor" publishers plus a separate buyer agent prove interoperability.
- **B. Buyer-side procurement agent:** an agent with a budget compares several supplier endpoints (each priced by x402), buys verification or sample previews, and picks a supplier. This matches Hedera's own idea list ("research agent that works within a budget, compares prices of paid sources, reports what it spent").
- **C. World ID Agent Pass as the human-approval layer** for agent purchases above a threshold, or as a "fresh human" check at claim time.
- **D. Portable, privacy-preserving contributor track record** across vendors (nullifier-scoped pseudonym → verification history on Arkiv). Watch the privacy rules carefully.

## 5. Corrections to the original brief

| Brief says | Research says |
|---|---|
| Latent Energy = "funded orders, acceptance-based pricing, robotics data delivery" | **Wrong entity.** latentenergy.com is a Puerto Rico solar installer. latentenergy.ai is a robotics company recording its own crews. **Drop from the slide.** |
| Taught = licensing/royalty model | Real, but **pre-launch**: its marketplace isn't live and it has no observed earnings (24 Sep 2026). |
| 4 sponsor targets (Hedera, Arkiv, World, Chainlink) | **Max 3 partner picks.** |
| Chainlink CRE as an optional stretch | $1.5k single winner, and it doesn't support Hedera or Arkiv. **Drop.** |
| World "Best Use of IDKit" | Only 2 × $1,250. **World ID Agent Pass ($5k)** sits under the same pick and is agent-focused. |
| Arkiv entity fields (taskId, reward…) as a payload | Arkiv SDK 1.0 has **no payload**: up to 32 typed columns, `str` ≤128 bytes, no NOT/!= queries (see §7). |
| x402 + USDC settlement on "the selected chain" | Hedera x402 natively settles **USDC (testnet token `0.0.429274`)**. Contributor payouts are a plain HTS transfer, not x402. |
| Gemini verifier, finance agent, Next.js + Convex + Expo | Exactly Skarl's stack and pattern (see §4). |
| Differentiation = agent-native + verification records + stablecoin settlement | The first and last are taken. Only **vendor-neutral interoperability** is open. |

## 6. Take Rate (fallback idea) — status: PARKED

A Uniswap v4 hook hidden-fee auditor: the pool shows 0% fee, but a hook takes ~2% (Bitquery, Robinhood Chain, 4–8 Sep 2026; Bags discloses a 2% hook fee). Measurements would be stored as 7-day-expiring Arkiv entities. Targets: Uniswap ($10k) + Arkiv. It overlaps heavily with **TARE** (ethglobal.com/showcase/tare-ozced, ETHOnline 2026). TARE has fork-based hook on/off measurement, 125,072 measurements, an MCP agent, Hedera x402 and a browser extension, and **won Uniswap Best Stack Contribution + finalist**. TARE's gaps:
- Base only, at one pinned block, with no time series and no Robinhood Chain
- it measures quotes, not users' real swaps
- about half its rows have no value
- its paid endpoint doesn't work live
- no Arkiv

But CULET, Hookshade and Crius already track Robinhood Chain hook fees, and the Bitquery data can't be tied to Bags' 2% hook. The previous scores were ADX 7.5 vs Take Rate 5.5. Stays parked. Details: research/04.

## 7. Architecture as it stands (brief + research corrections)

**Data placement (unchanged principle):** Arkiv = public/shared, queryable coordination records · private backend = app state, sessions, PII, review queues · private object storage = raw media · Hedera = payments · World = uniqueness proof (nullifier stored privately with a UNIQUE constraint). **Never put raw video, identity data, access tokens, decryption keys or encrypted Swarm references in Arkiv** (everything there is public).

**Arkiv entity sketch, re-expressed for SDK 1.0 typed columns** (illustrative, to be finalised at build time):

| Schema | Indexed columns (filterable) | Stored-only | Expiry idea | Owner |
|---|---|---|---|---|
| `adx.task` | `status` str (`open`/`claimed`/`closed`; positive values only), `category` str, `reward` dec, `deadline` u64, `buyer` addr | `rubricHash` str, `licenseRef` str, `title` str | at the deadline (Arkiv's expiry *is* the listing lifetime) | buyer or platform wallet |
| `adx.claim` | `task` key, `status` str, `claimant` str (pseudonym, never a nullifier) | `claimedAt` u64 | short (claim window) | platform wallet |
| `adx.submission` | `task` key, `status` str | `mediaHash` str (hex ≤64 B), `storageRef` str (opaque) | weeks | platform wallet |
| `adx.verification` | `submission` key, `result` str (`accept`/`reject`/`review`), `confidence` str (band) | `evidenceHash` str, `model` str | months | verifier wallet |
| `adx.receipt` | `task` key, `chain` str | `txId` str, `amount` dec, `token` str | months | platform wallet |
| `adx.manifest` | `dataset` str | `hashes` bytes, `schemaVersion` str | months | buyer or platform wallet |

- Trust comes **only from filtering by `$owner`/`$creator`**, because anyone can write entities with our schema tag.
- Max lifetime is ~182.5 days and expiry emits no event.

**Payments, two separate flows:**
1. **x402 (Hedera track):** agent → x402-protected endpoint (e.g. a paid task feed, paid verification report or paid sample) → facilitator settles USDC on Hedera testnet → tx ID to HashScan. No human approval.
2. **Contributor payout:** after verification, a policy-checked HTS `TransferTransaction` of USDC (or Agent Kit `TRANSFER_FUNGIBLE_TOKEN_TOOL` behind a custom `AbstractPolicy`) → receipt entity on Arkiv. If blocked, a **clearly labelled** simulated payout. Never present a mock as real.

**Stack defaults (not yet decided; see 03 Q1–Q4):** Next.js web (mobile-responsive capture, no native app) · TypeScript throughout (the Arkiv Python SDK is stale, and Hedera x402 is TS-only) · Node 22.10+ · private DB (Convex or Postgres) · S3-compatible storage · multimodal LLM verifier + deterministic checks (hash, duration, dedup).

## 8. Tech cheat sheet — things that WILL bite (VERIFIED, research/02)

**Arkiv (changed 5 days ago; don't trust older code or memory)**
- Testnet **Rabdi**, chain `7794095`
  - RPC `https://rpc.rabdi.db-chain.testnet.arkiv.network/<ACCESS_KEY>`
  - explorer `rabdi.explorer.arkiv.network`
  - faucet and access keys at `hub.arkiv.network`
  - gas in tGLM, 2 s blocks
- Created 29 Oct and **reset twice on 30 Oct**, so a mid-event reset is possible. **Keep a re-seed script.**
- `@arkiv-network/sdk` **1.0.1** (2 Nov), a breaking rewrite. The following are **gone**: `payload`, `contentType`, `annotations`, `btl`/`expiresIn`, `ne`/`not`, cursors, `atBlock`.
- Entities = ≤32 typed attributes: `bool i32 u64 u256 dec str(≤128B) addr key bytes(≤128KiB)`. Mark filter fields `.indexed()`. Schemas via `defineSchema("adx.task", {...})`.
- Writes:
  - `createEntity(schema, values, { expiration: ExpirationTime.fromHours(n) })` (expiration is required)
  - `patchEntity`, `extendEntity`, `deleteEntity`
  - `executeBatch` is atomic
- Queries:
  - `select().from(S).where(and(eq(...), gt(...))).ownedBy(addr).orderBy(...).limit(≤100).offset(n).fetch()`
  - **no NOT/!=**, so model state with positive values and use `or()`
  - to page fully, sort by `$key`
  - `watchEntityEvents` polls, has no `fromBlock`, and its events carry no attributes
- Public RPC is heavily rate limited, so **get a free access key** (one per wallet). Never put the keyed chain object in a user wallet.
- Reserved names: don't call a column `order`, `by`, `not`, etc.
- The docs are partly stale. Trust the SDK `CHANGELOG.md` and source.
- Arkiv offers a Claude Code plugin (`claude plugin marketplace add Arkiv-Network/claude-plugin`) and skills (`npx skills add https://github.com/Arkiv-Network/skills --skill arkiv-best-practices`).

**Hedera x402**
- Use **only v2 packages**: `@x402/core|hedera|fetch|next|express` **2.30.0** (released 4 Nov; `@x402/next` needs Next ≥16.4.1). Official x402 examples don't use Hedera, so swap in `ExactHederaScheme` and smoke-test it in hour 1 (research/08). v1 `x402-*` has no Hedera code.
- Network id `hedera:testnet`. Scheme `exact`. Default asset = **testnet USDC `0.0.429274`** (6 decimals; Circle confirms).
- Facilitators (live, no key, they pay gas):
  - `https://x402.org/facilitator`
  - `https://testnet.facilitator.launa.dev`
  - `https://api.testnet.blocky402.com`
- **Every account that touches USDC must be associated with `0.0.429274` first**: the agent, `payTo` and each contributor wallet. Otherwise you get `TOKEN_NOT_ASSOCIATED_TO_ACCOUNT`.
- Circle faucet: 20 USDC per 2 h per address. Create agent accounts in the Hedera Portal with **ECDSA** keys and avoid hollow accounts.
- The settlement response field is `transaction` (not `transactionId`). HashScan: `https://hashscan.io/testnet/transaction/<id>` (SPA, so curl gets a 404).
- Keep a single `@hiero-ledger/sdk` (2.90.x). Duplicates throw `t.startsWith is not a function`.
- Agent Kit `@hashgraph/hedera-agent-kit` 4.2.0 has **no x402 plugin and no budget policy**, so write a custom `AbstractPolicy`.

**World ID 4.0 / IDKit 4.6.0**
- `@worldcoin/idkit` 4.6.0 + `@worldcoin/idkit-server` (`signRequest`). v2/v3 code (`IDKitWidget`, `verifyCloudProof`, `/api/v2/verify`) is legacy.
- The backend signs an RP request (`rp_id` + server-only `signing_key`, shown **once**).
- The client opens `IDKitRequestWidget`. The backend forwards the result unmodified to `POST https://developer.world.org/api/v4/verify/{rp_id}`.
- **Portal v4 accepts nullifier reuse**, so enforce `UNIQUE(action, nullifier)` in our DB. Bind the contributor wallet or claim ID as the `signal`.
- Testing: Simulator (`simulator.worldcoin.org`) + `environment: "staging"` + a staging action. A mismatch silently gives zero proofs.
- Real phones without an Orb → `selfieCheck` (Beta).
- App mode (`external`) is fixed at creation. RP registration starts `pending`, so **create the Portal app before the event** (account setup, not project code).

**Chainlink CRE (dropped):** CLI v1.39 and TS SDK 1.23 (needs Bun). There is no Hedera or Arkiv support, simulation is enough for the prize, and deploying needs approval.

## 8b. Fast-track starters (research/08, licences checked 5 Nov)
- Arkiv: SDK `sample/` scripts (MIT) + DevRel workshop app `SantiagoDevRel/mumbai-ethglobal` (MIT, Next 16, SDK 1.0). Claude plugin `Arkiv-Network/ai-plugin` (no licence: install and use as a tool, don't copy code from it).
- x402: official `examples/typescript/fullstack/next` (Apache-2.0) with the Hedera scheme swapped in.
- Agent Kit budget policy: `blockydevs/wad2026-x402-workshop` `spend-cap-policy.ts` (Apache-2.0). HCS audit hook from the official Agent Kit examples.
- IDKit: `worldcoin/idkit` `js/examples/nextjs` (MIT). Hard-code the portal URL and RP ID server-side and add `UNIQUE(action, nullifier)`.
- UI: shadcn blocks + Magic UI (MIT). Dedup: ffmpeg as a separate process + `sharp` + our own dHash. AI SDK v7 for the agent.

## 9. Pre-event checklist (allowed before Thu 21:00 IST)

- [ ] Confirm the team list: all members accepted and staked (Q10).
- [ ] Ask ETHGlobal whether the written brief counts as prior "designs" under the from-scratch rule.
- [ ] Arkiv: wallet → Hub access key → faucet tGLM.
- [ ] Hedera: Portal testnet accounts (ECDSA) for the agent, merchant `payTo`, and 1–2 contributor wallets → HBAR → associate USDC `0.0.429274` → Circle faucet USDC.
- [ ] World: Developer Portal app (mode `external`), RP + staging action. Store the signing key safely and wait for `registered`.
- [ ] Read up on World ID Agent Pass before choosing between IDKit and Agent Pass.
- [ ] Pick the demo task (Q12) and the shape of the x402 endpoint (Q9) and the independent agent (Q8).
- [ ] Prepare the honesty rules: label simulations, label company-reported numbers, never call phone video "robotics-grade".
- [ ] At the event, run `graft init` in the new repo so the code graph rides along in Claude Code. graft indexes code only, not these markdown docs (tested on 3 Nov).

## 10. Glossary

- **x402:** an HTTP 402 "Payment Required" standard. The server quotes a price, the client pays inside the request, and a facilitator settles on-chain.
- **Facilitator:** the service that verifies and settles x402 payments and pays the network fee.
- **HTS / HCS:** Hedera Token Service / Hedera Consensus Service (topic messages, usable as an audit log).
- **Arkiv:** an "Ethereum-aligned DB-chain" (formerly Golem DB). Wallet-owned, queryable, expiring entities, with gas paid in GLM.
- **Rabdi:** Arkiv's current public testnet.
- **IDKit:** World's SDK for World ID proofs. **Nullifier:** a per-(person, app, action) unique value that proves "this human hasn't done this action before" without revealing who they are.
- **World ID Agent Pass:** World's flow for a human to authenticate or approve an agent action on the spot. Being researched.
- **Continuity track:** ETHGlobal's track for existing projects. We are **Classic / from scratch**.
- **EAS:** Ethereum Attestation Service (used by Skarl).
- **LeRobot:** Hugging Face robotics dataset format.
- **Egocentric video:** first-person, head-mounted footage, the main human-data category for robot learning.
