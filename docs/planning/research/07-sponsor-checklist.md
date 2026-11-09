# 07 — Sponsor and ETHGlobal compliance checklist

> Built 5 Nov 2026 from the official requirements copied verbatim in `research/01-event-and-prize-tracks.md`. Tick each box during the build. **Status** = what our current plan covers: ✅ planned and natural in the flow · ⚠️ planned but needs a decision or care · ❌ not covered yet.
> Picks: **Hedera + Arkiv + World** (3-partner maximum). Chainlink dropped.

## A. ETHGlobal rules (apply to everything)

| # | Requirement | Status | How we meet it |
|---|---|---|---|
| E1 | From scratch: all work starts after **Thu 5 Nov 21:00 IST**. No prior project code, designs or assets. | ⚠️ | Empty repo at 21:00. Ask staff at check-in whether our written plan counts (Q15). |
| E2 | Commit history: no giant single commits. | ⚠️ | Commit at least every hour, per person. |
| E3 | Clearly separate new from reused work (libraries and starter kits only). | ✅ | README "What we used" section. **No Skarl code** (it has no licence). |
| E4 | AI attribution: say which files or parts AI wrote or assisted. | ⚠️ | `AI_USAGE.md` kept up to date during the build. |
| E5 | All spec files, prompts and planning artifacts go in the repo. | ⚠️ | Copy `00`–`03` + `research/` into `/docs/planning/` in the repo. |
| E6 | Max 3 partner prizes. | ✅ | Hedera, Arkiv, World. Swarm bonus doesn't use a pick. |
| E7 | Submit before **Sat 7 Nov 09:00 IST** (no late entries). | ⚠️ | Feature freeze Fri 23:00. Video recorded by Sat 05:00. |
| E8 | Demo video 2–4 min, ≥720p, no speed-up, **no phone recording, no AI voiceover**. Sponsor caps stack: Hedera ≤5 min. | ⚠️ | Screen-record at 1080p, with a human voiceover by a teammate. Aim for 3:30. |
| E9 | Finalist slot: 4 min live demo + 3 min Q&A. | ⚠️ | Rehearse the live path. Keep a recorded backup. |
| E10 | For each partner, explain the integration and give feedback in the submission form. | ⚠️ | Draft the text Fri night. |

## B. Hedera — 🤖 AI Agents That Pay: x402 on Hedera ($6,500: 3k / 2k / 1.5k)

**Qualification (must have all):**

| # | Requirement (verbatim summary) | Status | Where it sits in our product |
|---|---|---|---|
| H1 | ≥1 x402-protected endpoint that settles on Hedera testnet via a docs-listed facilitator (x402.org, Launa/Ax402, Blocky402) or our own | ⚠️ | Decide what it sells (Q9). Options: paid task feed for agents, paid verification report, paid dataset/sample access. Use `@x402/next` or `@x402/express` v2. |
| H2 | An agent or client **finds** the endpoint and completes ≥1 paid request end to end, **with no human approving** | ⚠️ | The buyer agent (Q8) discovers the endpoint (via the Arkiv listing or a discovery doc) and pays automatically within its budget policy. |
| H3 | Public GitHub repo; README covers setup, architecture and payment flow, **including the Hedera tx ID of ≥1 settled payment** | ❌ | Paste the real tx ID into the README after the first settled payment. |
| H4 | Demo video ≤5 min showing a payment settling, **with a HashScan link** | ❌ | Show the HashScan page in the video. Our 2–4 min ETHGlobal video satisfies both limits. |

**Extra points (target those marked ⭐):**

| # | Extra | Status | Our plan |
|---|---|---|---|
| H5 ⭐ | Spending controls: budgets, per-merchant limits, allowlists, human-in-loop above a threshold | ✅ | This is the heart of our buyer agent: budget cap, per-task cap, allowlisted payees, and approval above a threshold (could use World). |
| H6 ⭐ | HCS topic as a tamper-evident audit log of agent spending | ⚠️ | Cheap to add: post each spend decision to an HCS topic. Decide whether it overlaps Arkiv (Arkiv = queryable records, HCS = ordered spend log). |
| H7 | Agent identity / reputation via HCS-14 or ERC-8004 | ❌ | Stretch. |
| H8 | Multi-agent negotiation (A2A/ACP) before payment | ❌ | Stretch. Only if the agent negotiates with a supplier agent. |
| H9 ⭐ | Settle in an HTS token such as **USDC** | ✅ | x402 defaults to testnet USDC `0.0.429274`. Contributor payouts are in USDC too. |
| H10 | Scheduled Transactions for recurring payments | ❌ | Skip. |
| H11 ⭐ | Use Hedera Agent Kit or Hedera MCP | ⚠️ | Agent Kit v4 for the payout tool + a custom spend `AbstractPolicy`. |

## C. Arkiv — 🧩 Build on Arkiv (from scratch) ($4,000: 3k / 1k) + 🐝 Swarm bonus ($500)

**Qualification:**

| # | Requirement | Status | Our plan |
|---|---|---|---|
| A1 | Built from scratch at ETHGlobal Mumbai | ⚠️ | See E1. |
| A2 | Writes to Arkiv's current testnet (**Rabdi**) with `@arkiv-network/sdk` or JSON-RPC | ✅ | Tasks, claims, verifications and receipts are written as entities (SDK 1.0.1). |
| A3 | **At least one user-facing feature reads its data from Arkiv** (not counted: SDK installed but never read, or a write-only log) | ✅ | The task board UI **and** the buyer/independent agent both query open tasks from Arkiv. The receipt page reads verification + receipt entities. |
| A4 | README: writer wallet address(es) + one runnable query | ❌ | Add after the first writes. Include a `curl` `arkiv_query` example. |
| A5 | `/arkiv/schema.md`: entities, queried fields, owners, expiry | ❌ | Write from the entity table (00 §7). |
| A6 | `/arkiv/friction.md`: feedback, what broke, repro steps | ❌ | Keep a running log during the build (e.g. SDK 1.0 docs being stale, testnet resets). |
| A7 | `/arkiv/reach.md`: who it's for, would they use it, can they try it today, will we keep building | ❌ | Write Fri night. |
| A8 | `/arkiv/why-arkiv.md`: what users lose if Arkiv were Postgres; what we kept off Arkiv and why | ❌ | Core argument: open, vendor-neutral, agent-readable records with owner-signed provenance and natural expiry. Media, PII and nullifiers stay off. |
| A9 | `/arkiv/how-you-use-arkiv.md`: do filters, ownership and expiry fit the app; does each feature change what users see | ❌ | Expiry = task deadline; claims expire with the claim window; ownership = who signs each record. |
| A10 | Public repo with an open-source licence; say how AI was used | ⚠️ | MIT licence + `AI_USAGE.md`. |
| A11 | Swarm bonus (optional): Arkiv + Swarm used meaningfully; `/arkiv/swarm.md` with entity key ↔ Swarm ref, postage batch ID, Bee node, files, steps, demo timestamp, friction. **Never put an encrypted Swarm ref raw in an entity.** | ❌ | Decide later (Q17). Candidate: put the dataset manifest or public sample previews on Swarm, never raw private video. |

**Judging (25% each):** friction feedback, reach, why Arkiv, how you use Arkiv. Past Arkiv winners made **expiry and ownership the core mechanic**, with a read side users can see.

## D. World — 🪪 Best Use of IDKit ($2,500, 2 × $1,250) **or** 🚀 World ID Agent Pass ($5,000: 2.5k / 1.5k / 1k)

Same partner pick. Decide in grilling (Q16).

**IDKit qualification:**

| # | Requirement | Status | Our plan |
|---|---|---|---|
| W1 | IDKit integrated in a working app | ✅ | Contributor verifies before claiming a paid task. IDKit 4.6 + backend RP signing. |
| W2 | ≥1 World ID credential, verified **server-side** or on-chain | ✅ | `POST /api/v4/verify/{rp_id}` from our backend. |
| W3 | Explain the trust moment and why this credential is the **minimum sufficient** assurance | ⚠️ | Trust moment: claiming a scarce paid task (one human = one claim / one payout). Credential choice: Selfie Check (any World App user, Sybil score) vs Proof of Human (Orb). Must justify. |
| W4 | Show success **and** one meaningful alternative path (cancel, unavailable credential, rejection, ineligible user) | ⚠️ | Demo a second claim attempt by the same human being rejected (duplicate nullifier). |
| W5 | Short integration debrief: time to first success, friction, missing docs, one biggest improvement | ❌ | Write during the build. |

**Agent Pass qualification (if chosen):** integrate the official World ID Agent Pass; full journey (request → user completes → validated result → **protected agent action**); a denied, expired or cancelled path where the action does not happen; backend validation; debrief. Fits "agent buyer needs a human approval above a threshold". **Research the Agent Pass docs before choosing.**

**Privacy rule:** the nullifier stays in our private DB with `UNIQUE(action, nullifier)`. It never goes on Arkiv. Portal v4 accepts nullifier reuse, so our DB enforces uniqueness.

## E. Pre-event account setup (allowed before 21:00)

- [ ] Arkiv: wallet → access key (hub.arkiv.network/access-keys) → faucet tGLM
- [ ] Hedera: Portal testnet accounts (ECDSA) for the buyer agent, the merchant `payTo` and 1–2 contributors → HBAR → associate USDC `0.0.429274` → Circle faucet USDC (20 per 2 h)
- [ ] World: Developer Portal app in `external` mode, RP + staging action; save the signing key (shown once); wait for `registered`
- [ ] Team: all 4 accepted and staked; GitHub org/repo name chosen (empty until 21:00)
