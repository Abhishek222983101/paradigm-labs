# 05 — Backend Schema

> Companion doc. Canonical code-level definitions: system architecture §10 (Arkiv `defineSchema` + Neon SQL). Judge-facing Arkiv description: `arkiv/schema.md`.

## Entities
**Public (Arkiv, Rabdi):**
| Entity | Represents | Owner | Expiry |
|---|---|---|---|
| `adx.verifier` | A verifier service listing (endpoint, price, payTo) | verifier wallet | 24 h, heartbeat-extended |
| `adx.task` | A paid data task | buyer agent | task deadline |
| `adx.claim` | One human holding one slot | platform-web | 2 h → 24 h on submit |
| `adx.submission` | A recorded clip (fingerprints, Swarm ciphertext ref) | platform-worker | 30 d |
| `adx.verification` | AI verdict with evidence | verifier | 180 d |
| `adx.receipt` | A settled payment | verifier | 180 d |
| `adx.licence` | Contributor's licence for one clip | **contributor** (created by platform-web) | 90 d, renewable |
| `adx.manifest` | Dataset summary (samples, distinct humans) | buyer agent | 180 d |

**Private (Neon):** `claims_private`, `contributors`, `upload_tokens`, `jobs`, `clip_keys`, `payments`, `approvals`, `events`.

## Fields, types, indexes
Arkiv columns and indexed fields: system architecture §10.1. Neon tables, constraints and indexes: §10.2. Key constraints:
- `claims_private UNIQUE (task_key, nullifier)` — one human per task.
- `payments UNIQUE (submission_key)` — never pay twice for one clip.
- `clip_keys PRIMARY KEY (submission_key)`.
- `jobs (status, created_at)` index for the queue; `events (scope, id)` index for SSE.

## Relationships
task 1—N claim (Arkiv `claim.task` key) · claim 1—1 submission · submission 1—1 verification · submission 1—0..1 receipt · submission 1—0..1 licence · task N—1 manifest (by skill). Neon rows reference Arkiv entity keys as text.

## User ownership
Arkiv `$owner` is the authority: tasks/manifests → buyer agent; claims/submissions → platform wallets; verifications/receipts/verifier → verifier; licences → the contributor's embedded wallet after `changeOwnership`. Neon `contributors.wallet` links a wallet to its Hedera account.

## Authentication flow
Contributor: create embedded wallet (passkey) → sign request messages (`claim:<taskKey>:<nonce>`) → World ID per claim. No sessions or passwords. Buyer human: World IdP (Agent Pass) per approval. Services: role keys from env.

## Authorization rules
| Entity | Read | Create | Update | Delete |
|---|---|---|---|---|
| All Arkiv entities | anyone | owner wallet only (Arkiv enforces) | owner only | owner only |
| `adx.licence` | anyone | platform-web | contributor (extend) | **contributor (withdraw)** |
| Neon tables | server only | server only | server only | server only |
| `/api/claims` | — | wallet signature + valid World ID proof | — | — |
| `/api/x402/clip/:key` | — | valid x402 payment | — | — |

## Data validation
zod on every API input. Clip: 15–35 s, video+audio, ≤ 60 MB. Task reward 0.01–10 USDC, slots 1–20, deadline ≤ 7 days. Arkiv `str` values ≤ 128 bytes; guard rejects secret-looking values. Wallet signatures verified with viem `verifyMessage`.

## Retention and deletion
Raw video deleted after encryption. Clip keys kept while the licence lives (purge job deletes keys for expired/withdrawn licences after 7 days). Arkiv entities expire per the table above (no cleanup jobs). Events kept 7 days.

## Migration and seed data
`pnpm db:push` (Drizzle) for Neon. `pnpm seed:arkiv` writes the verifier listing + the towel-folding demo task (+ rubric JSON on Swarm). Arkiv reset → bump `ARKIV_NS` and re-seed.
