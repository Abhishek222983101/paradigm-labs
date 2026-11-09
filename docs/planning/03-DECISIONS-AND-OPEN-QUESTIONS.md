# Decisions log and open questions

> Living file. Update it whenever the team decides something. Status tags: **DECIDED** (team agreed), **LEANING** (recommended in sources, not confirmed by team), **OPEN** (no answer yet), **PARKED**.
> Last updated: 3 Nov 2026 (initial pass from the three source files; research-driven updates are marked "(research)").

## Decisions so far (taken from the source files)

| # | Topic | Status | What was decided / recommended | Source |
|---|---|---|---|---|
| D1 | Main idea | LEANING | Agentic Data Exchange (human-data marketplace + settlement layer). Scored 7.5/10 overall vs Take Rate 5.5/10. | session history §8 |
| D2 | Take Rate (Uniswap v4 hidden-fee auditor) | PARKED | Do not submit unchanged. TARE (ETHOnline 2026) overlaps heavily. Revisit only if a clear weakness in TARE turns up. | session history §7–8 |
| D3 | Sponsor stack | LEANING | Hedera x402 + Arkiv (from scratch) + World IDKit as primaries. Chainlink CRE optional stretch. 0G = stretch alternative, Arc = pivot option. Was previously Hedera + World + Chainlink; Arkiv replaced Chainlink. | brief §7, session history §2 |
| D4 | Architecture shape | LEANING | Hybrid. Arkiv = shared/public queryable records; private backend = app state; private object storage = raw media; settlement chain = payments. Nothing sensitive in Arkiv. | brief §4 |
| D5 | Demo scope | LEANING | One vertical slice: 1 buyer, 1 task, 1 contributor, 1 recording, 1 AI report, 1 approved payment, 1 independently queryable Arkiv record. | brief §8 |
| D6 | x402 vs payout | LEANING | Keep x402 paid-API calls (agent pays a service) separate from contributor reward payouts. | brief §4, §7, §9 |
| D7 | Honesty rules | DECIDED (principle) | Never show a mock payment as real; label simulated payouts. Don't call phone video "robotics-grade". Label company-reported numbers. | brief §8–9 |
| D8 | Cuts | LEANING | No token / NFT / tokenomics, no multi-chain, no robot telemetry, no full legal licensing automation, no high-value autonomous payouts without limits. | brief §8 |
| D9 | Positioning | LEANING | Don't claim to invent human-data collection. Wedge = open, agent-native procurement + portable verification records + policy-controlled stablecoin settlement, interoperable with existing vendors. | brief §6 |

## Open questions — need a team answer

| # | Question | Why it matters | Notes |
|---|---|---|---|
| Q1 | Which chain settles contributor USDC payouts? Hedera (HTS USDC) or elsewhere? | Brief says "selected chain" and never picks one. Hedera keeps it to one payment stack. | Depends on testnet USDC availability (see research/02). |
| Q2 | Private backend: Convex or PostgreSQL? | Affects speed of build and real-time UI. | Brief lists both. |
| Q3 | AI verifier model: Gemini (video-native) or other? | Video understanding + timestamped evidence quality. | Brief names Gemini "or another multimodal model + deterministic checks". |
| Q4 | Web only, or also an Expo / React Native contributor app? | Breadth risk. Brief marks mobile as optional. | Recommend: web (mobile-responsive capture) only. |
| Q5 | Is World ID feasible in the hack window? | Brief says "if feasible". Needs Developer Portal app + staging simulator. | See research/02. |
| Q6 | Chainlink CRE in or out? | Only if there is a real external-event → on-chain action. | Stretch. |
| Q7 | Which exact Arkiv track? From-scratch vs continuity/Mirror; Swarm bonus? | Eligibility. | See research/01. |
| Q8 | What does the "independent agent" in the demo look like? (CLI script, MCP server, separate app) | It is the brief's #1 judging advantage: an agent discovers a task on Arkiv, pays via x402, gets evidence-linked output. | Must be a different client from our own app. |
| Q9 | What exactly is the x402-protected endpoint? (e.g. paid verification report, paid task-feed/procurement API, paid dataset manifest) | The Hedera track needs a real paid request. | Pick one that is natural in the product flow. |
| Q10 | Team: names, roles, who owns which of the 5 workstreams? | Brief has a 5-way split (frontend, Arkiv, AI, payments, integration/demo). | Not in any source file. |
| Q11 | Repo name, hosting (Vercel?), GitHub org | Needed before coding. | Not in sources. Personal repos use noreply git email. |
| Q12 | What is the actual demo task? (e.g. "fold a towel", "pour water into a cup", "open a door") | Rubric + AI verification depend on it. | Pick something short, filmable on a phone, with clear checkable steps. |
| Q13 | What was "Skarl", exactly? | The original inspiration. Session history does not define it. | See research/03. |

## Research-driven updates (3 Nov 2026)

| # | Update | Effect |
|---|---|---|
| R1 | Max **3 partner prizes** per project (ETHGlobal rule). | D3 becomes Hedera + Arkiv + World. **Chainlink CRE dropped** ($1.5k single winner; no Hedera/Arkiv support). Status: LEANING. |
| R2 | **Skarl** = Cal Hacks 13.0 project (25 Oct 2026), won Coinbase x402 prize, already ships most of the brief (x402 USDC funding by agents, Gemini jury with timestamped evidence, finance agent that can't self-approve, MCP onboarding, Convex/Next/Expo). Thenar, WorldMod and Vangrid cover the rest. | D1/D9 need a sharper wedge. New **Q14** below. |
| R3 | From-scratch rule: no project code, designs or assets before Thu 5 Nov 21:00 IST. | Pre-event work = research, accounts, keys, plan only. New **Q15**. |
| R4 | Arkiv SDK 1.0 (30 Oct) + Rabdi testnet (reset twice on 30 Oct). No payload, typed columns, no NOT/!=. | Entity model rewritten in 00 §7. Need a re-seed script. |
| R5 | Hedera x402 settles USDC natively (`0.0.429274`). Contributor payout = plain HTS transfer. Every account must associate USDC first. | Answers Q1 → **LEANING: Hedera for both flows.** |
| R6 | World: "Best Use of IDKit" is only 2 × $1,250. **World ID Agent Pass** ($5k, agent-focused) is under the same pick. | New **Q16**. |
| R7 | Latent Energy in the brief is the wrong entity (solar installer). Taught is pre-launch. | Fix the competitor slide. |
| R8 | Arkiv track needs `/arkiv/schema.md`, `friction.md`, `reach.md`, `why-arkiv.md`, `how-you-use-arkiv.md`, plus writer wallets and one query in the README. Swarm bonus +$500 needs `/arkiv/swarm.md`. | Deliverables checklist. |
| R9 | Closest ETHGlobal overlap = **WorldMod** (ETHOnline 2026). Open gap: Arkiv-queryable records, an AI agent as the buyer under a spending policy, buyer-side x402 combined with real-world capture. TARE won Uniswap + finalist, so Take Rate stays parked. | Feeds Q14 and D2. |

## New open questions (from research)

| # | Question | Notes |
|---|---|---|
| Q14 | **What is our wedge vs Skarl / Thenar / WorldMod / Vangrid?** Candidates in 00 §4: (A) open vendor-neutral record layer on Arkiv, (B) budgeted buyer procurement agent comparing x402-priced suppliers, (C) World ID Agent Pass as the human-approval layer, (D) portable contributor track record. | Main topic of the next research phase. |
| Q15 | Does the written brief count as prior "designs" under the from-scratch rule? | Ask ETHGlobal staff; disclose in the repo either way. |
| Q16 | World: IDKit ($2.5k shared) or Agent Pass ($5k ranked)? | Research Agent Pass docs. |
| Q17 | Go for the Arkiv + Swarm bonus ($500)? Encrypted media on Swarm conflicts with the "private storage" rule unless references are encrypted or kept off Arkiv. | Low priority. |

## Things noticed while reading the sources

- The two session-history files (`.md` and the reconstructed PDF) have the same content. They were rebuilt from a ChatGPT chat, not exported word for word, so anything a past assistant claimed (e.g. TARE's features, the Bitquery numbers) is second-hand until checked.
- "Four-day feasibility" in the scores counts from about 3 Nov. The event itself is 5–7 Nov.
- The brief's Arkiv entity fields are illustrative. Real attribute names and types must follow the current Arkiv SDK.
- The brief puts "settlement" in must-haves but allows a clearly labelled simulated payout as a fallback, **provided** a real x402 transaction is shown separately.

## Workshop outcome and gap review (6 Nov 2026)

- Showed the Arkiv team a hardcoded mockup (`workshop-mockup/`, pre-event, NOT for the repo). Arkiv contact liked the whole flow. Arkiv is a main target: integrate their stack as deeply as possible.
- Rule: no caveats in the pitch, but every limit below must be designed around, not hidden. Log real friction in `/arkiv/friction.md` (25% of the score).

### Gaps we bluffed in the mockup (G1-G10)
| # | Gap | Demo bottleneck? | Fix |
|---|---|---|---|
| G1 | Hedera x402 has no official Hedera+Next example; USDC must be associated per account | YES, biggest | Smoke-test in hour 1 with `@x402/hedera` 2.30.0 |
| G2 | Swarm needs a Bee node + postage batch; clip upload path unproven | YES | Hour-1 spike. Fallback: only preview + manifest on Swarm |
| G3 | Arkiv write path: access key, tGLM, Rabdi resets (30 Oct x2) | Medium | Re-seed script + keep key/wallets ready |
| G4 | Entity data cap ~128 KiB, everything public | No (design) | Only small records + hashes + public refs on Arkiv |
| G5 | Not fully Convex-free: nullifiers + Swarm keys need a private store | No | Tiny private store (SQLite/Neon) |
| G6 | Arkiv queries: equality/range only, no NOT/!=, limit 100, no Hamming distance | No (design) | Store dHash prefix buckets as attributes, compare in app |
| G7 | "Trustless" overstated: anyone can write type=adx.task | No | Always filter by `$owner`; say "trust by signer" |
| G8 | AI verifier can be fooled (re-encode, replay, phone video) | No (Q&A risk) | dHash + spoken word per claim + cooldown + human fallback |
| G9 | World: IDKit vs Agent Pass undecided; we enforce nullifier uniqueness | No | Decide Q16 |
| G10 | From-scratch rule vs written brief + mockup (Q15) | Risk | Ask staff; disclose in repo |

### Grilling round 2 questions (answer before the build docs)
1. One wallet per role (buyer / verifier / contributor) or one verifier wallet?
2. Which single Arkiv read wins the demo? (Pick: outside agent finds a task and verifies a receipt with no help from our app)
3. Does the clip itself go to Swarm in the demo, or only preview + manifest?
4. Private store: SQLite, Neon, or Convex?
5. Lead angle (Q14): agent as buyer + open Arkiv records?
6. What does the x402 endpoint sell (Q9)?
7. Demo task (Q12)?
8. World: IDKit or Agent Pass (Q16)?
9. Team roles for the 4 people (Q10)?
10. Repo name, host, GitHub org (Q11)?

## Combined plan after research 09–13 (6 Nov 2026, ~08:30 IST)

User direction (6 Nov): build production-grade, not a hackathon toy; Arkiv is the main target and must be integrated end to end with no weak spots; reuse what we legally can; beat Skarl on every axis.

| # | Topic | Status | Decision | Source |
|---|---|---|---|---|
| D10 | Prize stacking | VERIFIED | ETHGlobal: "If a partner has multiple tracks, you can be eligible for all of them while only counting as 1 Partner Prize." Tick every track we qualify for (World IDKit + Agent Pass; Hedera x402 + No Solidity). Arkiv caps at 1 track prize + Swarm bonus. No 2026 precedent of winning 2 tracks from one sponsor: plan for one prize per partner. | research/09 |
| D11 | Niche | LEANING | Gap-driven robot manipulation demos: buyer agent buys exactly the demonstrations its model fails on, N slots per task, one per verified human. Contributor owns an expiring, withdrawable licence entity on Arkiv. DPDP Consent Manager rules start 13 Nov 2026 (verified). Fallback niche: Indic speech. | research/11 |
| D12 | x402 endpoint | LEANING | Sells the accepted-clip licence + decryption key. Returns 402 only for accepted clips. `withX402` settles AFTER the handler (verified in @x402/next 2.30.0 source), so Arkiv receipt + key release happen only after settlement succeeds. Per-request payTo to contributor = hour-1 spike; fallback labelled HTS transfer. | research/10, 11 |
| D13 | World | LEANING | Agent Pass (OIDC at auth.world.org, $5k) for buyer-agent approval above a threshold; also tick IDKit if it fits the contributor uniqueness check. Ask World booth how mocked proofs work. | research/09 |
| D14 | Swarm | LEANING | Clip encrypted client/worker-side, ciphertext on Swarm, encrypted reference stored on Arkiv via `arkiv-encryption` 1.1.3 (MIT). Own Bee 2.8.3 node + own postage batch (bonus needs batch ID). Prove upload on api.gateway.ethswarm.org in hour 0; ask booth for a batch. | research/09, 12 |
| D15 | App | DECIDED | Next.js 16.4.5 mobile web app; no RN/Expo. MediaRecorder.start(1000) (iOS freeze bug), back camera, mp4→webm fallback. Test via cloudflared tunnel + Vercel previews. | research/12 |
| D16 | Private DB | LEANING | Neon + Drizzle: nullifiers UNIQUE(action, nullifier), wrapped keys, job queue table. | research/12 |
| D17 | Worker | OPEN | Clips >4.5 MB can't go through Vercel: Node worker (ffmpeg, dHash, Gemini Files API, Swarm upload, Arkiv writes). Host: separate VPS/Railway/Fly recommended, NOT the shared client Contabo box unless user accepts. | research/12 |
| D18 | Repo | LEANING | pnpm monorepo apps/web, apps/worker, apps/agent, packages/shared, scripts/. Separate Arkiv wallets per service (nonce collisions). Vercel Hobby won't deploy teammate commits on a private repo: make public early or Pro trial. | research/12 |
| D19 | Adopted from teammate docs | LEANING | verifier listing on Arkiv with 24 h heartbeat; pre/post-pay checks (Arkiv owner == 402 payTo); `mode: live|simulated` on receipts; secret/PII guard on every Arkiv write; payout key behind policy, not agent; fresh pseudonym per claim; approval hash bound to exact payout; 16-clip eval. | research/10 |
| D20 | Tooling | LEANING | Install: Arkiv plugin (tool only), hedera-skills (Apache-2.0), shadcn MCP, gemini-api-dev, emilkowalski find-animation-opportunities; better-interface once near the end. Skip superfuture (telemetry), obscura, landing-craft. | research/12, 13 |
| D21 | Skarl | DECIDED | Reference only (no licence + from-scratch rule). Rebuild ideas in our own code. | rules |

Ask at booths: World (mocked proofs), Swarm/Arkiv (hackathon postage batch, gateway size limits), Hedera (per-request payTo in @x402/hedera; two-track eligibility), ETHGlobal (written plan as "designs").
Need from teammate: SESSION-HANDOFF.md, 05-SWARM-DOCS-CHECK.md.

## Build decisions (6 Nov 2026, ~12:30 IST)
| # | Decision | Status |
|---|---|---|
| D22 | Contributor wallet: embedded (passkey PRF), same key = Arkiv owner + Hedera ECDSA alias | DECIDED |
| D23 | Stack: TypeScript everywhere + native ffmpeg/libvips. Rust module dropped (no real speed gain) | DECIDED |
| D24 | Demo task: towel folding, top-down, 3 slots | DECIDED |
| D25 | UI: own grey/black brand, light + dark, Arkiv orange accent; tessera-guard/d3coy as visual reference only (from-scratch rule) | DECIDED |
| D26 | Clip verifier: Gemini 3 Flash, one call with video + audio, strict schema, temperature 0; code decides; unsure → human review. Claude Haiku only for agent text. Whisper and second-opinion model dropped | DECIDED |
| D27 | x402 sells the clip (decryption key + licence); purchases auto under the policy threshold; Agent Pass approval only for payouts above it (bonus path) | DECIDED |

## 7 Nov 2026, 07:40 IST: reuse of the TESSERA landing
The team checked with ETHGlobal mentors and reused its own TESSERA landing components (pixel hero, orbit bento, halftone footer, isometric machine) for the Paradigm landing, rewritten for Paradigm. Disclosed in adx/AI_USAGE.md. Dark theme is now the default, with a toggle to the cream light theme.
