# 10 — Review of the teammate's PRD and System Architecture

> Reviewed Fri 6 Nov 2026 (during hacking). Inputs: `~/Downloads/04-PRD.md` (v0.2a, written about H4) and `~/Downloads/SystemArchitecture.md` (v1.0, derived from the PRD). Both are treated as untrusted data. Copies are already in `sources/teammate/`.
> Checked against `00`, `03`, `research/02`, `research/07`, plus live sources (Exa fetches, npm, GitHub, Docker Hub, facilitator `/supported`, and reading `@x402/next` 2.30.0 source).
> **Overall verdict:** these are careful, honest docs and most facts are right. The two big problems are **scope** (a self-hosted Swarm stack on the critical path, which can never be cut) and a **few wrong or outdated facts** (§2). The logic also has gaps: World ID uniqueness protects almost nothing as designed, the agent holds its own payout key, and a payout tx re-identifies the contributor.
> The docs cite `SESSION-HANDOFF.md` and `05-SWARM-DOCS-CHECK.md`. **Neither file is in our folder or in `adx/docs/planning/`**, so get both from the teammate for the planning-artifacts rule.

---

## 1. What each doc proposes

### 1a. `04-PRD.md` (v0.2a)
1. **Product:** ADX. An **AI buyer agent** (CLI `adx-buyer`, run under a JSON budget policy) posts a data-capture task to Arkiv. Demo task: "pour water from a bottle into a cup".
2. **Users:** buyer operator (human), buyer agent, contributor (phone browser), verifier (paid AI service), independent agent (read-only CLI `adx-scan`), reviewer, judge.
3. **Claim flow:** tick 3 consents → enter a USDC-associated Hedera account (mirror-node check) → IDKit `selfieCheck` with signal `taskKey:hederaAccount` → server verify v4 → `UNIQUE(action, scope=taskKey, nullifier)` in Neon Postgres → `adx.claim` on Arkiv (2 h expiry).
4. **Upload flow:** 3–15 s clip, ≤15 MB. The browser gets an HMAC ticket from Vercel and uploads straight to a **self-hosted `swarm-edge` + Bee light node on Sepolia**. The edge encrypts (`Swarm-Encrypt`) and returns a signed receipt. The 64-hex address goes on Arkiv and the 128-hex ref (which holds the key) stays in Postgres.
5. **Verify flow:** the buyer discovers an `adx.verifier` listing on Arkiv (24 h expiry, heartbeat) → checks price cap, allowlist and `wallet == $owner` → pays $0.01 over x402 (`@x402/next` 2.30.0, Hedera testnet USDC) → Gemini + deterministic checks → `adx.verification` with evidence bytes. The buyer then re-checks `evidenceHash` against Arkiv.
6. **Payout:** a plain HTS USDC transfer by the buyer agent. ≤$1.00 is auto-approved by policy. >$1.00 needs a **World Agent Pass OIDC step-up** (`auth.world.org`, `max_age=0`, essential `acr`). The receipt goes on Arkiv with `mode=live|simulated`.
7. **Key release:** the buyer gets the 128-hex ref only after the payout has settled ("pay to unlock").
8. **Swarm bonus:** rubric and licence are uploaded as public Swarm files. `adx.task` holds `rubricRef`, `licenseRef` and `rubricHash`, and the independent agent re-hashes them.
9. **Stack:** Next.js on Vercel, Neon Postgres, Node 22 CLIs, `packages/core`, Bee 2.8.3, `swarm-gateway` 0.1.6 + Caddy, `@google/genai`, `@hiero-ledger/sdk` 2.90.1.
10. **Honesty:** 16-clip eval with false-accept/false-reject rates, otherwise the label "unmeasured". Receipts carry `mode`. The word "robotics" is never used.
11. **Plan:** gate G1 (5 smoke checks by Fri 05:00), a cut order, feature freeze Sat 00:00, submit Sat 07:30. **The Swarm storage (S-03, S-16) is "never cut", and "never S3".**

### 1b. `SystemArchitecture.md` (v1.0)
1. It is the same system, expanded into 11 modules (M1–M11) and 7 sequence flows (F1–F7).
2. **Three tiers of truth:** Arkiv (public), Postgres (private), Swarm (ciphertext plus public artifacts).
3. **Boundary-check ledger B1–B11:** each hand-off is checked against something the sender can't forge (for example, the 402 `payTo` must equal the listing wallet).
4. It adds the host topology (Caddy, swarm-edge, swarm-gateway and Bee in Docker; API port 1633 never published), the ticket and receipt codecs, and the postage batch lifecycle.
5. **Data placement table** plus the `assertPublicSafe()` guard on every Arkiv write. The guard blocks 128-hex strings, PII, tokens, video magic bytes and free text.
6. **Threat model X1–X20,** plus 13 gaps G-01…G-13 against the PRD. The important ones: G-02 (no auth on `/review`, `/approvals`), G-03 (approver identity is not bound), G-01 (the buyer can't use a released key), G-12 (the key passes through the contributor's browser), G-13 (Gemini's free-text summary must stay off Arkiv).
7. Policy engine pseudo-code, payout and approval state machines, the idempotency and reconciliation rules, and a config matrix.
8. Lanes for 4 people, gates, a test strategy and the repo layout.

---

## 2. Claims checklist

Legend: **CORRECT**, **WRONG**, **OUTDATED**, **UNVERIFIED**. "Arch" = SystemArchitecture.md.

### Arkiv
| Claim (where) | Verdict | Fact / source |
|---|---|---|
| SDK `@arkiv-network/sdk` 1.0.1: no payload, no NOT/!=, `str` ≤128 B, expiry required (PRD §2) | CORRECT | npm 1.0.1 (2 Nov). research/02 §A |
| Rabdi chain 7794095, `eth_chainId` 0x76edaf (PRD App. D) | CORRECT | research/02. 0x76edaf = 7794095 |
| "Each schema stays under 31 attributes" (PRD §6.1) | CORRECT | The limit is 32 attributes, or 31 with a named schema (the tag uses 1). research/02 §A |
| `dec` = 18 dp, passed as strings (PRD §6.1) | CORRECT | research/02 §A |
| Evidence as `bytes` ≤16 KiB on the verification entity (PRD D-16) | CORRECT (fits) | `bytes` ≤128 KiB per create or patch in total. The tGLM cost is unmeasured (A4) |
| Raw query `arkiv.schema = str('adx.task') AND status = str('open') AND $owner = addr(0x…)` and `price <= dec(0.02)` (App. C) | CORRECT syntax | research/02 §A raw syntax. Untested against our schema |
| Only the owner can patch, so "a write from the wrong wallet fails" (FR-ARK-03) | CORRECT | research/02 §A ownership |
| Trust only by filtering on `$owner` (§6.1, Arch B9) | CORRECT | Arkiv docs: "Arkiv is public". research/02 |
| Max lifetime ~182.5 days, so "4 months" for verifications and receipts (Arch §5.6) | CORRECT | research/02 |
| Arkiv nonce collisions from concurrent serverless writes (Arch G-07) | UNVERIFIED but plausible | viem picks nonces per call, so two lambdas on one wallet can collide. Test early |

### Swarm
| Claim | Verdict | Fact / source |
|---|---|---|
| An encrypted upload returns 128 hex = 64-hex address (safe to share) + 64-hex key. Losing the key loses the data (PRD §6.1, Arch §4.3) | CORRECT | docs.ethswarm.org/docs/develop/tools-and-features/store-with-encryption |
| "Never use public gateways with full encrypted references"; encryption is off on gateways (PRD §5) | CORRECT | Same page ("danger Never use public gateways…", "Encryption is disabled by default on all Swarm gateways") |
| Light nodes can upload and download. Ultra-light can't upload. Full nodes take part in storage incentives (D-23) | CORRECT | docs.ethswarm.org/docs/bee/working-with-bee/node-types |
| Sepolia testnet: `mainnet: false` + a Sepolia RPC. Sepolia ETH from faucets. **sBZZ only by buying on Uniswap in testnet mode** (no faucet) (D-25, §12.7) | CORRECT | …/installation/fund-your-node and …/working-with-bee/configuration. **Thin liquidity is a real risk (R-19)** |
| **R-16: "Use `xdai.fairdatasociety.org`"** as the archival RPC for the Sepolia node | **WRONG** | That is a **Gnosis-chain** archival RPC (the config page uses it for mainnet). A Sepolia node needs a **Sepolia** RPC that serves historical logs from the postage-contract deploy block |
| Depth 20 encrypted, no erasure coding: ~682 MB effective (D-24) | CORRECT | Postage-stamps page, "Encrypted - NONE" table: depth 20 = 4.29 GB theoretical, 682.21 MB effective |
| Batch cost = 2^depth × amount ÷ 10^16; amount = price ÷ block time × seconds (§12.7) | CORRECT | Postage-stamps page (12-day worked example) |
| Bee v2.8.3 | CORRECT | GitHub release v2.8.3, 15 Oct 2026 |
| `@ethersphere/bee-js` 13.2.0 | CORRECT | npm, 27 Oct 2026 |
| **`ethersphere/swarm-gateway:0.1.6`** | **OUTDATED** | Docker Hub: 0.1.6 is from **27 Mar 2026**. The latest tags are **0.4.0 (29 Oct)**, 0.3.1 and 0.3.0. Pin 0.4.0 and re-read its README |
| Gateway env `AUTH_SECRET`, `SOFT_AUTH=true` (auth on POST only), `BEE_API_URL`, `HOSTNAME`, `DATABASE_CONFIG` (FR-SWM-08) | CORRECT (master README) | github.com/ethersphere/swarm-gateway README. The gateway also has `POSTAGE_AMOUNT/DEPTH` settings, so check whether it buys stamps itself |
| bee-factory = 5 Bee nodes + Anvil chain 1337, no real tokens (FR-SWM-10) | CORRECT | github.com/ethersphere/bee-factory README (pushed 4 Nov) |
| "Unencrypted content stamped by an expired batch cannot be re-uploaded" (§12.7, Arch §4.7) | UNVERIFIED | Not found in the postage-stamps page we read. Likely a misreading. Don't repeat it in `/arkiv/swarm.md` without a source |
| "A third-party gateway returned 404, so use our own" (App. D) | UNVERIFIED (team observation) | This is a reasonable call, but it is the reason the whole VPS exists. Re-test once with a fresh public upload |

### Hedera / x402
| Claim | Verdict | Fact / source |
|---|---|---|
| `@x402/*` 2.30.0 only; v1 has no Hedera code (PRD §2) | CORRECT | npm `@x402/next`, `fetch` and `hedera` 2.30.0 (4 Nov) |
| `@x402/hedera` pins `@hiero-ledger/sdk` 2.90.1 | CORRECT | `npm view @x402/hedera@2.30.0 dependencies` |
| `@x402/next` 2.30.0 requires Next ≥16.4.1 | CORRECT (implied) | peerDeps `next >=16.4.1` |
| Facilitators x402.org (fee payer 0.0.9185802) and Blocky402 (0.0.7162784) list `hedera:testnet` (§5) | CORRECT | Live `/supported` today. Launa (`testnet.facilitator.launa.dev`, fee payer 0.0.9839454) is a third backup they didn't list |
| `wrapFetchWithPayment` from `@x402/fetch` (FR-BUY-03) | CORRECT | Package source |
| **"The x402 middleware may charge before the handler runs… no refund" (Arch §7.2 [RISK], Part 11)** | **WRONG for the default** | In `@x402/next` 2.30.0 `withX402`, the order is verify → **handler** → settle. If the handler throws or returns ≥400, settlement is **cancelled** (`handleSettlement`: `if (response.status >= 400) cancel`). Settle-before-handler is opt-in (`beforeHandlerSettlement`). **The real risk is the opposite:** the handler writes `adx.verification` to Arkiv and **then** settlement can fail. The verification is then public for free, and the buyer's "skip if a verification exists" rule means nobody ever pays. Also, the handler **cannot put the settlement tx id in its body or in Arkiv**. The buyer reads it from the `PAYMENT-RESPONSE` header (`decodePaymentResponseHeader`, field `transaction`) |
| USDC `0.0.429274`, 6 dp; every account (buyer, `payTo`, contributor) must be associated (Arch §7.1) | CORRECT | research/02 §B. Circle page |
| Circle faucet 20 USDC / 2 h / address | CORRECT | research/02 §B |
| A1: one secp256k1 key can be both the Hedera ECDSA account and the Arkiv writer | UNVERIFIED, likely true | A Hedera ECDSA account's EVM alias is the keccak address of the same key. Test at G1. Low risk |
| The payout is a plain HTS `TransferTransaction`, not x402 (D-04) | CORRECT | Matches our D6/R5 |
| Video ≤5 min with a HashScan link; README needs a tx id | CORRECT | research/07 H3/H4 |

### World
| Claim | Verdict | Fact / source |
|---|---|---|
| IDKit 4.6.0. `signRequest` from `@worldcoin/idkit-core/signing`. Verify at `POST developer.world.org/api/v4/verify/{rp_id}`, payload unmodified (FR-WLD-01/03) | CORRECT | npm 4.6.0 (21 Oct). research/02 §C lists `/signing` subpaths and `idkit-server` 1.2.0 |
| Portal v4 accepts nullifier reuse, so the DB enforces `UNIQUE` (Arch X5) | CORRECT | research/02 §C |
| Nullifier stored as `NUMERIC(78,0)` | CORRECT-ish | v4 returns the nullifier as a `0x…` hex string (World HITL sample regex `^0x[0-9a-f]{1,64}$`). Storing canonical lowercase hex `text` is simpler and avoids conversion bugs |
| A3: `selfieCheck` works in the staging simulator | UNVERIFIED, **risky** | research/02: the simulator identities hold "Human, Passport, ID, Device". Selfie is not listed, and `selfieCheck` is Beta. Plan for `proofOfHuman` in staging |
| Agent Pass = World IdP OIDC at `auth.world.org`, discovery `/.well-known/openid-configuration`, `max_age=0`, essential `acr` `https://world.org/oidc/acr/orb` or `/selfie`, validate `acr`/`amr`/`auth_time` (FR-AP-02/03) | CORRECT | auth.world.org/docs/guides/step-up, /id-token, /oidc. The issuer is `https://auth.world.org` |
| `client_secret_basic` is the portal default | CORRECT | auth.world.org/docs/guides/oidc ("portal default `client_secret_basic` or `private_key_jwt`") |
| **G-03: Agent Pass proves *a* fresh human, not *the operator*. Add an `(iss, sub)` allowlist** | CORRECT, and **required, not optional** | auth.world.org HITL guide: "the returned `(iss, sub)` must match the account awaiting approval" |
| A5/R-06: the sandbox needs a TestFlight invite and about 1 h before the identity works | CORRECT per docs, but **possibly moot** | auth.world.org/docs sandbox page says exactly this. **But** the ETHGlobal Agent Pass track says "We are mocking proofs now, so you don't need sandbox app anymore" (research/01). Ask the World booth which issuer and portal the mock uses before burning time |
| "Agent Pass" really means `auth.world.org` OIDC | UNVERIFIED (naming) | The track text ("ask a person to authenticate or complete a fresh verification at the moment") matches World IdP step-up. World also ships `@worldcoin/human-in-the-loop` 0.2.1 (IDKit-based HITL, docs.world.org/agents/human-in-the-loop). **Confirm with World staff which one counts as "official Agent Pass".** |
| IDKit and Agent Pass are both under one World pick (PRD §11.5) | CORRECT | research/01: several tracks from one partner = 1 pick |

### Gemini / AI / platform
| Claim | Verdict | Fact / source |
|---|---|---|
| G-06: a 15 MB clip inline (~20 MB as base64) may exceed the inline limit, so use the Files API | CORRECT in practice (the docs disagree) | ai.google.dev/gemini-api/docs/video-understanding: the table says inline "< 100MB", but the prose says "Always use the Files API when the total request size … is larger than 20 MB". **15 MB + base64 sits right on 20 MB. Use the Files API, or cap clips at 10 MB** |
| Evidence steps with sub-second timestamps (`start_s: 0.4`) (Arch §8.3) | **MISLEADING** | Gemini samples video at **1 FPS by default**, so a 3–15 s clip is 3–15 frames. Either raise the fps in the video metadata or round the timestamps to whole seconds and say why |
| "Confirm the current video model name on day 0" | CORRECT | Today's video doc samples use `gemini-3.8-flash`. Put the model id in env, as planned |
| `@google/genai` SDK | CORRECT | npm 2.32.0 (29 Oct) |
| Vercel body cap 4.5 MB. Hobby maxDuration 300 s, Pro 800 s | CORRECT | vercel.com/docs/functions/limitations (memory: Hobby 2 GB, Pro up to 4 GB) |

---

## 3. Ideas worth keeping (stronger than our current plan)

1. **The verifier as a discoverable, priced supplier.** An `adx.verifier` listing on Arkiv with a 24 h expiry and a 12 h heartbeat. This answers our Q9 neatly. It gives Hedera "an agent finds the endpoint", and it uses Arkiv expiry as a liveness signal (a dead verifier disappears). Adopt it. Add a second, pricier listing (S-18) only if there is time: it makes the procurement story visible.
2. **Boundary checks B4–B6 before and after paying.** Before paying, check that the listing `wallet == $owner`, the 402 `payTo == listing wallet`, and the 402 price equals the listed price. After paying, check that the response `evidenceHash` equals the Arkiv record owned by the verifier. This is the best "agent under policy" story we have, and every check is cheap. Each refusal is logged with a reason in the JSONL run log, which is good video material.
3. **Evidence bytes on Arkiv** (labels and timestamps, no free text, ≤16 KiB), so `adx-scan` can recompute `evidenceHash` with no access to our DB. This makes "independently verifiable" literally true.
4. **`mode: live|simulated` on every receipt** as a machine-readable honesty flag. It matches our D7 and costs nothing.
5. **`assertPublicSafe()` guard** on every Arkiv write (blocks 128-hex refs, nullifiers, JWTs, video magic bytes, free text), with one unit test per class. This is a direct answer to Arkiv's "what did you keep off Arkiv and why", and it stops privacy leaks.
6. **Pay to unlock (data escrow) with Swarm encryption.** The ciphertext is public, the address goes on Arkiv, and the key is released only after the payout receipt exists. The buyer can't take the data without paying, and the contributor is paid only after verification. This is the most "useful" Swarm integration available and it fits the bonus text exactly ("upload them encrypted so only the people who get the reference can open them"). Keep the *idea* even if the hosting changes (see §5).
7. **Public rubric and licence files on Swarm, with `rubricHash` on Arkiv, re-hashed by `adx-scan`.** This is the cheapest judge-openable Swarm link, and it works even if clips never touch Swarm. **Make this the bonus core**, because it is low risk.
8. **`action_hash` binding**: the approval covers exact amount, payee, task, submission and nonce, and is consumed once. Combine it with the **G-03 `(iss, sub)` approver allowlist**. Both are needed to meet the Agent Pass "validate in a secure backend" rule.
9. **Agent proposes, human or policy disposes** (FR-BUY-11): the buyer token cannot approve. This also scores Hedera's "human-in-loop above a threshold" extra.
10. **Write ordering (G-08):** open the Postgres transaction, then write to Arkiv, then commit. An orphan entity simply expires (2 h claim). This is a neat use of expiry as cleanup, so write it into `how-you-use-arkiv.md`.
11. **Three writer wallets (buyer, verifier, platform)** so `$owner` means something per role. This answers grilling Q1.
12. **Failure fixtures as demo beats:** duplicate claim (409), price over cap (refused before paying), tampered response (hash mismatch), denied/expired approval, empty-bottle reject. Each one also meets a sponsor's "alternative path" requirement.
13. **16-clip eval** (6 good, 4 bad, 3 duplicates, 3 short) with false-accept and false-reject rates, labelled "small-n". If it isn't done, show the label "AI verdicts unmeasured". This is our honesty rule, made concrete.
14. **G-13:** keep Gemini's free-text `summary` out of the public, hashed evidence, because it can describe a person.
15. **G-02:** put an `OPERATOR_TOKEN` on `/review` and `/approvals`. Otherwise anyone can force a review-accept that then auto-pays under $1.
16. **The demo script timing (§13)** and the **G1 five-check gate** are well shaped. The order buyer post → claim → upload → x402 → payout → checkpoint → failure → independent read is right.
17. **The IDKit contingency:** if the RP is not `registered`, use Agent Pass sign-in at claim time, with `(iss, sub)` as a per-task uniqueness key. It is a good fallback to keep in our pocket.

New ideas this review adds (not in either doc):
- **Make World uniqueness matter: N slots per task, one per human.** As designed, `claims.task_key UNIQUE` allows **one claim per task in total**, so the per-task nullifier only stops the same person re-claiming after their own 2 h claim expires. That makes the World trust moment nearly empty. Training-data buyers want **many distinct humans** ("20 pour clips from 20 different people"). So model `adx.task.slots` (u64) and `slotsFilled`, keep `UNIQUE(action, scope=task, nullifier)`, and drop the single-claim-per-task constraint. Now the credential defends **dataset diversity**, which is a "minimum sufficient credential" story judges will understand. Optional: a per-human daily cap across all tasks, using one global action.
- **Make the human checkpoint cryptographic, not advisory.** In the docs, the buyer agent holds `BUYER_PRIVATE_KEY` and executes the HTS transfer itself, so it can simply ignore `/api/payouts`. Options: (a) the treasury key lives server-side and the web app executes after policy or approval; (b) Hedera **threshold KeyList** (agent + platform co-sign); (c) Hedera **Scheduled Transaction** that the approver's service signs. (c) also earns Hedera extra H10. Cost of (b) and (c) is UNVERIFIED; (a) is simplest.
- **Cheap HCS spend log (H6)** is cut as S-15, but it is about 20 lines with the Agent Kit or the SDK and is an explicit extra. Reconsider after G1.

---

## 4. Things to drop or fix, and why

| # | Item | Why |
|---|---|---|
| 1 | **R-16 "use `xdai.fairdatasociety.org`"** | Wrong chain (Gnosis). A Sepolia light node would never sync. Use a Sepolia archival or historical-logs RPC |
| 2 | **`swarm-gateway:0.1.6` pin** | Outdated (Mar 2026). Use 0.4.0 and re-check the env vars |
| 3 | **"x402 may charge before the handler"** risk text, and the "no refund" framing | Wrong for `withX402` defaults (§2). Replace it with the real risk (verification written, then settlement fails) and fix the flow: write `adx.verification` with the buyer-visible result only **after** settlement succeeds (for example, write it in `onAfterSettle`, or let the buyer write the receipt and only count verifications that have a matching `x402-verify` receipt) |
| 4 | **"Never cut S-03/S-16" + "never S3" + "fail closed, no fallback"** | One self-hosted Bee node (needs Sepolia sBZZ from thin Uniswap liquidity, an archival Sepolia RPC, sync, batch propagation and a second-node retrieval test) becomes a single point of failure for the **whole demo**, including the $6.5k Hedera and $4k Arkiv cores, for a **$500 single-winner bonus**. Our G2 plan already had a fallback (preview and manifest only on Swarm). See §5 C1 |
| 5 | **Stable contributor pseudonym on Arkiv + payout `txId` on a public receipt** | **Privacy leak.** The HTS payout tx on HashScan shows the contributor's Hedera account. The `adx.receipt` links tx → task → claim → pseudonym, so one person's whole earnings and task history become public and linkable. Fix: a **fresh random pseudonym per claim**. Accept and say that the payee account is public on Hedera, or pay through a per-claim one-time account (UNVERIFIED cost). Write this in `why-arkiv.md` as a known limit |
| 6 | **Sub-second evidence timestamps** | Gemini samples at 1 FPS by default, so this is fake precision. Round to seconds or raise the fps |
| 7 | **Inline 15 MB clips to Gemini** | Too close to the 20 MB total-request rule. Use the Files API, or cap clips at ~10 MB |
| 8 | **G-01 download ticket, G-11 daily-spend cross-check against Arkiv, Caddy path allowlist, two subdomains, CORS per origin, edge-signed receipts** | Each is sound, but together they are a production storage gateway built in 36 h. For the demo: one edge host, tickets plus signed receipts (keep those, because they stop forged refs), and the key release returned to the buyer CLI, which downloads through the edge with the same server token. Mark the rest as "designed, not built" |
| 9 | **The "unencrypted content can't be re-uploaded after expiry" claim** | No source found. Don't put it in judge-facing docs |
| 10 | **Gnosis mainnet price-oracle numbers in §12.7** | Irrelevant to Sepolia and invites confusion. Read the Sepolia price, or drop it |
| 11 | **`selfieCheck` as the staging credential (A3)** | Probably unavailable in the simulator. Use `proofOfHuman` in staging and justify Selfie Check for production in `docs/world.md` |
| 12 | **The Agent Pass TestFlight sandbox plan (A5/R-06)** | The ETHGlobal track says the proofs are mocked and no sandbox app is needed. Confirm with World before spending an hour on TestFlight |
| 13 | **Arkiv `adx.task.deadline` stored-only while the board shows the deadline** | Fine, but then "open and not past the deadline" relies on expiry alone. That is OK because expiry *is* the deadline, so say so explicitly in `how-you-use-arkiv.md` (it scores) |

No from-scratch problems: both docs were written after 21:00 Thu and are disclosed planning artifacts. **But** they depend on `SESSION-HANDOFF.md` and `05-SWARM-DOCS-CHECK.md`, which must also go in `adx/docs/planning/`. No conflicts with sponsor rules: 3 picks, and the Swarm bonus rides on Arkiv.

---

## 5. Conflicts with our plan that need a team decision

| # | Conflict | Teammate says | We had | Recommendation |
|---|---|---|---|---|
| C1 | **Media storage and Swarm scope** | Swarm only, self-hosted Bee light node on Sepolia plus edge and gateway on a VPS. Never cut, never S3 | G2: hour-1 Swarm spike, fallback = only preview and manifest on Swarm; private object storage for raw media (00 §7) | Keep the pay-to-unlock design, but **put a fallback in the plan**: if G1 #5 isn't green by H8, clips go to private storage (labelled), and Swarm keeps the rubric, licence and a public sample clip (still bonus-eligible). Decide who provides the VPS. The user already has a Contabo box, but it hosts the FCG prod stack, so check resources and isolation first. Or find a hosted Bee or stamp service (UNVERIFIED) |
| C2 | **World track priority** | IDKit for claims (P0). Agent Pass step-up for payouts (P1, first to drop at Fri 15:00) | Q16 open. 00 §3 notes that Agent Pass is the bigger prize ($5k ranked vs 2 × $1.25k) and is agent-focused | Agent Pass fits "agent action needs a human" exactly. **Consider swapping priorities:** make Agent Pass P0 for the >$1 payout and keep IDKit claims. Or at least don't cut Agent Pass before the review path and the mirror-node check. Ask World which "Agent Pass" counts and how the mocking works |
| C3 | **What World uniqueness protects** | One claim per task, plus a per-task nullifier | "One human = one claim / one payout" (07 W3) | Adopt N slots per task, one per human (§3). Otherwise the IDKit trust story is weak |
| C4 | **Who holds the payout key** | The buyer agent holds the key and executes the HTS transfer after the web API approves | 00 §7: a policy-checked HTS transfer, or Agent Kit behind a custom `AbstractPolicy` | Move execution server-side (or use a threshold key or scheduled tx), so "the agent can never approve its own payout" is enforced, not trusted. That is also the Skarl lesson we cite |
| C5 | **Hedera Agent Kit (extra H11)** | Not used | Planned for the payout tool + `AbstractPolicy` | Decide. If C4 moves execution server-side, an Agent Kit tool with a spend-cap policy there scores H11 cheaply |
| C6 | **What x402 sells (Q9)** | Per-call verification by a separately listed verifier (D-03) | Open: paid task feed, verification report, or sample | Accept the teammate's choice, but note that the verifier is our own route. Make the listing and wallet clearly a separate "supplier" (its own wallet and listing). A second listing would show real procurement |
| C7 | **Private store** | Neon Postgres | Q2/G5: SQLite, Neon or Convex | Accept Neon (`UNIQUE` constraints carry the design) |
| C8 | **Demo task (Q12)** | Pour water into a cup. Backup: place an object on a shelf | Open | Accept. It is clear, has checkable steps and suits 1 FPS sampling |
| C9 | **Writers** | 3 wallets (buyer, verifier, platform) | Grilling Q1 open | Accept |
| C10 | **Timeline** | G1 by Fri 03:00–05:00, freeze Sat 00:00, submit 07:30 | 07 E7: freeze Fri 23:00, video by Sat 05:00 | Pick one. The repo has only a skeleton commit so far (`d020cb4`), so G1 is already behind the PRD's dates |
| C11 | **Independent agent form (Q8)** | CLI (MCP is a stretch) | Open | Accept the CLI. The printed raw `arkiv_query` strings are judge-friendly |
| C12 | **Missing source docs** | Cites `SESSION-HANDOFF.md`, `05-SWARM-DOCS-CHECK.md`, "grill close-out, you approved" | Not in our folder | Get both files and confirm the "user decision, 6 Nov" items (D-13 Swarm only, D-25 Sepolia) really came from the user |
