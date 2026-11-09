# Paradigm — Agentic Data Exchange

Built by team **Paradigm** at ETHGlobal Mumbai 2026 · **Live:** https://adx-paradigm.vercel.app · **Proofs:** [`docs/sponsors/PROOFS.md`](docs/sponsors/PROOFS.md)

Robots learn from videos of people doing everyday tasks. Paradigm lets a robot team's **AI buying agent** post a paid task (for example, "fold a T-shirt, filmed from above"). A **verified human** films it on their phone, an **AI verifier** checks the clip, and the agent **pays the person in USDC on Hedera over x402**. Above its limit, the agent asks its human to approve with **World ID** first. Every task, verdict, receipt and licence is an open record on **Arkiv**. The clip itself sits **encrypted on Swarm**, and the buyer only gets the key after paying.

No Solidity. No wallet pop-ups for contributors.

## How it works

```
Contributor (phone)                      Paradigm                                   Networks
───────────────────                      ────────                                   ────────
1 opens a task  ─────────────────────▶  web (Next.js, Vercel)  ◀── reads tasks ──  Arkiv: adx.task (buyer agent's wallet)
2 World ID check (IDKit) ────────────▶  verify proof server-side; one human per slot ─▶ Arkiv: adx.claim
3 films 15–30 s with a word + finger challenge ─▶ worker (Railway)
                                         probe → fingerprint + dedup ∥ Gemini watches the clip
                                         code decides (AI never decides alone)
                                         AES-256-GCM encrypt ─▶ our Bee node ─────▶ Swarm (ciphertext only)
                                         ─────────────────────────────────────────▶ Arkiv: adx.submission + adx.verification
Buyer agent (Railway)
4 finds accepted clips, GET /api/x402/clip/:key ─▶ 402 (price from the task, payTo = contributor's own Hedera account)
5 policy in code: ≤ 5 USDC pay · > 5 ask a human (World Agent Pass) · > 10 never · 20/day
6 pays over x402 ─▶ facilitator settles USDC on Hedera ─▶ only then: key released, Arkiv receipt + licence
7 every decision ─▶ Hedera Consensus Service spend log (with a one-line note written by Claude)
```

Details: [`docs/sponsors/ARCHITECTURE.md`](docs/sponsors/ARCHITECTURE.md) · [`docs/sponsors/PRODUCT.md`](docs/sponsors/PRODUCT.md) · [`docs/build/SYSTEM-ARCHITECTURE.md`](docs/build/SYSTEM-ARCHITECTURE.md)

| Part | Runs on | What it does |
|---|---|---|
| `apps/web` | Vercel (Next.js 16) | Task board, World ID claim, phone recorder, status page, earnings (`/me`), buyer console, explorer, the **x402 endpoint** |
| `apps/worker` | Railway (Node 22 + ffmpeg) | Upload, verification pipeline, encryption, Swarm upload, Arkiv writes, Swarm read-back (`/swarm/:ref/bytes`) |
| `apps/agent` | Railway | The buying agent: discovers price and payee from the 402, applies the policy, pays, opens World Agent Pass approvals, writes the HCS spend log |
| `infra/bee` | Railway (private network) | Our own Bee 2.8.3 light node (Sepolia) with our own postage batch |
| `packages/shared` | — | Arkiv schemas + write guard, policy, verdict rules, crypto, Hedera and Swarm helpers |

## Sponsor tracks

| Sponsor | Track | Where to look |
|---|---|---|
| Hedera | AI Agents That Pay (x402) | [Payment flow](#payment-flow-hedera-x402) below · [`HEDERA-FEEDBACK.md`](docs/sponsors/HEDERA-FEEDBACK.md) |
| Hedera | No Solidity | Hedera SDK only: alias accounts with auto-association, USDC transfers, Consensus Service log, Mirror Node |
| Arkiv | Build on Arkiv (+ Swarm bonus) | [Arkiv](#arkiv) below · [`arkiv/`](arkiv/) (schema, friction, reach, why, how, swarm) |
| World | Agent Pass + World ID (IDKit) | [`WORLD-DEBRIEF.md`](docs/sponsors/WORLD-DEBRIEF.md) |

## Payment flow (Hedera x402)

1. The agent calls `GET /api/x402/clip/<submissionKey>`. Unknown or not-accepted clips return **404**, so nothing is for sale until the verifier accepts it.
2. An accepted clip returns **402** via `withX402` (`@x402/next` 2.30.0). The **price** comes from the Arkiv task. **`payTo`** is the contributor's own Hedera account, created from their phone wallet's key (alias + unlimited auto-association).
3. The agent (`@x402/fetch` + `x402Client`, x402.org facilitator) checks the policy. That's deterministic code in `packages/shared/src/policy.ts`, not an LLM. Under 5 USDC it pays. Above 5 it opens a **World Agent Pass** approval and pays only after a verified human approval. The approval is bound to the exact clip, amount and payee.
4. The facilitator settles USDC (`0.0.429274`) on Hedera. **Only after settlement** does the response deliver the clip's AES key, and only then are the Arkiv receipt (`mode: live`, with the Hedera tx) and the licence written. The licence is then transferred to the contributor's wallet.
5. Each decision (paid, paused, approved, declined) goes to the HCS topic [`0.0.11343565`](https://hashscan.io/testnet/topic/0.0.11343565).

### Settled payments (Hedera testnet, all mirror-verified)

| When (IST) | Amount | To | Approved by | Hedera tx |
|---|---|---|---|---|
| 06 Nov 08:25 | 0.01 USDC | merchant | agent (smoke test) | [0.0.9185802@1793933035.147018991](https://hashscan.io/testnet/transaction/0.0.9185802@1793933035.147018991) |
| 06 Nov 23:45 | 0.05 USDC | contributor 0.0.11333310 | agent (under limit) | [0.0.9185802@1793988295.049547956](https://hashscan.io/testnet/transaction/0.0.9185802@1793988295.049547956) |
| 07 Nov 00:25 | **3 USDC** | **real contributor 0.0.11339643** (towel clip filmed on a phone) | agent (under limit) | [0.0.9185802@1793991330.634664318](https://hashscan.io/testnet/transaction/0.0.9185802@1793991330.634664318) |
| 07 Nov 02:13 | 3 USDC | 0.0.11339643 | agent (under limit) | [0.0.9185802@1793997829.041959715](https://hashscan.io/testnet/transaction/0.0.9185802@1793997829.041959715) |
| 07 Nov 03:47 | **6 USDC** | 0.0.11339643 | **human, World ID (Agent Pass, acr orb)** | [0.0.9185802@1794003438.891569019](https://hashscan.io/testnet/transaction/0.0.9185802@1794003438.891569019) |
| 07 Nov 04:00 | 6 USDC | 0.0.11339643 | human, World ID (Agent Pass) | [0.0.9185802@1794004233.343699894](https://hashscan.io/testnet/transaction/0.0.9185802@1794004233.343699894) |

Expired approvals paid nothing; the HCS log records each one as "declined".

## Arkiv

**Writer wallets (one per role).** Trust a record only if its `$owner` is one of these:

| Role | Address | Writes |
|---|---|---|
| Buyer agent | [`0x0F00CFF8dae364c5d7c0840A2C92DFc7d087Dcc6`](https://rabdi.explorer.arkiv.network/address/0x0F00CFF8dae364c5d7c0840A2C92DFc7d087Dcc6) | `adx.task` |
| Platform (web) | [`0x2dEc12a23ec38830f7f314B33b144D4d1fe4D98C`](https://rabdi.explorer.arkiv.network/address/0x2dEc12a23ec38830f7f314B33b144D4d1fe4D98C) | `adx.claim`, `adx.licence` (then transferred to the contributor) |
| Worker | [`0xCDFa94802dEEAaf2ce7E694F2d16BE2628d52A51`](https://rabdi.explorer.arkiv.network/address/0xCDFa94802dEEAaf2ce7E694F2d16BE2628d52A51) | `adx.submission` (Swarm ref, sha256, fingerprints) |
| Verifier | [`0x0C736210492F8d86A1Fe4297cD7A5804ed48F421`](https://rabdi.explorer.arkiv.network/address/0x0C736210492F8d86A1Fe4297cD7A5804ed48F421) | `adx.verification`, `adx.receipt`, `adx.verifier` listing |

**Runnable query** (public RPC, no key needed): open tasks posted by our buyer agent:

```bash
curl -s https://rpc.rabdi.db-chain.testnet.arkiv.network -H 'content-type: application/json' -d '{
  "jsonrpc":"2.0","id":1,"method":"arkiv_query",
  "params":["arkiv.schema = str('\''adx.task'\'') AND status = str('\''open'\'') AND $owner = addr(0x0F00CFF8dae364c5d7c0840A2C92DFc7d087Dcc6)",
            {"select":{"key":true,"owner":true,"expiresAt":true,"attributes":{"title":true,"reward":true,"slots":true}},"limit":"0x32"}]}'
```

The same query with the SDK is in [`arkiv/schema.md`](arkiv/schema.md). Arkiv docs: [`schema.md`](arkiv/schema.md) · [`friction.md`](arkiv/friction.md) · [`reach.md`](arkiv/reach.md) · [`why-arkiv.md`](arkiv/why-arkiv.md) · [`how-you-use-arkiv.md`](arkiv/how-you-use-arkiv.md) · [`swarm.md`](arkiv/swarm.md)

**Never on Arkiv:** World ID nullifiers, decryption keys, raw video, names, emails. Every write goes through one guard (`packages/shared/src/arkiv/guard.ts`) that refuses anything secret-looking.

## The verifier (what the AI actually does)

Gemini 3 Flash watches the clip **without being told the expected answer**. It reports what it sees: which task steps happened, the spoken word, the finger count, signs of a screen or replay. **Plain code** (`packages/shared/src/verdict.ts`) compares that report with the task's rubric and the random challenge, then decides accept, review or reject. Fingerprints (dHash) are checked against every clip already on Arkiv, so the same video can't be sold twice to different buyers. Each person gets 10 free checks, and an accepted clip refunds its check. Repeated rejects block the person (keyed by their World ID, not their wallet).

Real phone clips verified in production so far: 4 accepted (towel and T-shirt folds, confidence up to 100), 1 rejected (wrong task / wrong challenge). One upload was lost to a worker redeploy and recorded as failed. Evidence for each verdict is on its `adx.verification` entity.

## Setup

Requirements: Node 22+, pnpm 10, ffmpeg (worker), accounts listed in [`.env.example`](.env.example).

```bash
pnpm install
cp .env.example .env          # fill in values; never commit .env
pnpm doctor                   # live check of every key and service
pnpm db:push                  # create the private Postgres tables
pnpm seed:arkiv               # verifier listing + demo task on Arkiv
pnpm dev                      # web on :3000
pnpm worker:dev               # worker on :8099
pnpm --filter @adx/agent dev  # buying agent
pnpm outside-agent           # what any outside agent sees, from Arkiv only
pnpm sponsor:check            # live ✅/⏳/❌ against Hedera, Arkiv, Swarm, World, the repo
```

**Tests.** `pnpm verify` runs typecheck, lint, unit tests and build. It must pass before every commit. Live integration tests use real networks in the `adx-test` namespace: `pnpm test:claims`, `test:upload`, `test:record`, `test:pipeline`, `test:x402`, `test:agent`.

## What we used

Public libraries and official starters only. No code from prior projects.
- **Arkiv:** `@arkiv-network/sdk` 1.0.1
- **Hedera:** `@x402/next`, `@x402/fetch`, `@x402/hedera` 2.30.0, `@hiero-ledger/sdk` 2.90.1, `@hashgraph/hedera-agent-kit` 4.2.0 (spend log + balance check, called from code; no transfer tools loaded)
- **World:** `@worldcoin/idkit` 4.6 + `@worldcoin/idkit-server` 1.2 (the verify route started from the official Next.js example, hardened), World IdP OIDC device grant, `jose`
- **Swarm:** Bee 2.8.3 (`ethersphere/bee`), plain HTTP API
- **AI:** `@google/genai` 3.0 (Gemini 3 Flash), Anthropic Messages API (Claude Haiku, notes only)
- **App:** Next.js 16, Tailwind 4, shadcn/ui + Radix, Hono, Drizzle + Neon, viem, zod, Biome, Vitest

## Not built (honest scope)

- Licence withdrawal (contributor deletes their licence and the clip drops out): designed in `arkiv/schema.md`, not built.
- Selfie Check: World must enable it for our app. We accept any verified World ID instead.
- A 16-clip accuracy benchmark: raw clips are deleted after checking, by design, so we list real production verdicts instead.

## AI usage

See [`AI_USAGE.md`](AI_USAGE.md). All planning, specs and prompts are in [`docs/`](docs/).
