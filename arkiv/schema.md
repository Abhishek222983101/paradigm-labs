# Arkiv schema

Paradigm (code name ADX) defines eight entity types and writes seven of them in production to the Arkiv **Rabdi** testnet (chain 7794095) with `@arkiv-network/sdk` 1.0.1. Every entity is defined once with `defineSchema()` in `packages/shared/src/arkiv/schemas.ts`. All values are public, so a write guard blocks secrets and personal data before any write.

**Trust rule:** anyone can write an entity named `adx.task`. Readers trust a record only through its `$owner` (or `$creator`) wallet, so every query in our app and our docs filters by owner.

**Query rules we design around:** filters support equality and ranges, combined with `and`/`or`, with no `NOT` or `!=`. So every status is a positive value, and "open" is queried directly instead of "not closed". Pages hold at most 100 rows and are paged by `$key`.

## Writer wallets

| Role | Address |
|---|---|
| Buyer agent (tasks, manifests) | [`0x0F00CFF8dae364c5d7c0840A2C92DFc7d087Dcc6`](https://rabdi.explorer.arkiv.network/address/0x0F00CFF8dae364c5d7c0840A2C92DFc7d087Dcc6) |
| Platform web (claims, licence creation) | [`0x2dEc12a23ec38830f7f314B33b144D4d1fe4D98C`](https://rabdi.explorer.arkiv.network/address/0x2dEc12a23ec38830f7f314B33b144D4d1fe4D98C) |
| Worker (submissions) | [`0xCDFa94802dEEAaf2ce7E694F2d16BE2628d52A51`](https://rabdi.explorer.arkiv.network/address/0xCDFa94802dEEAaf2ce7E694F2d16BE2628d52A51) |
| Verifier (verdicts, receipts, verifier listing) | [`0x0C736210492F8d86A1Fe4297cD7A5804ed48F421`](https://rabdi.explorer.arkiv.network/address/0x0C736210492F8d86A1Fe4297cD7A5804ed48F421) |
| Smoke test (first write) | `0x4aEC505abaFc1EC58A38529e29A1164314deC3f7` |

## Entities

### `adx.verifier`: verifier listing (service discovery)
Lets any buyer agent find a verifier and its paid endpoint without knowing about us.

| Column | Type | Indexed | Meaning |
|---|---|---|---|
| `skill` | str | ✓ | Task family it verifies, e.g. `manipulation` |
| `status` | str | ✓ | `live` |
| `price` | dec | ✓ | USDC per accepted clip |
| `endpoint` | str | | x402 base URL |
| `payTo` | str | | Hedera account that receives payment |
| `model` | str | | Verifier model, e.g. `gemini-3-flash-preview` |

- **Owner:** verifier wallet. **Expiry:** 24 h, extended (`extendEntity`) by the agent's heartbeat. If the verifier goes down, its listing disappears by itself.

### `adx.task`: a paid data task
| Column | Type | Indexed | Meaning |
|---|---|---|---|
| `status` | str | ✓ | `open`, `filled` |
| `skill` | str | ✓ | e.g. `towel-fold` |
| `reward` | dec | ✓ | USDC per accepted clip |
| `slots` | u64 | ✓ | Distinct humans wanted |
| `filled` | u64 | ✓ | Slots accepted so far |
| `deadline` | u64 | ✓ | Unix seconds |
| `title` | str | | Short human title |
| `failureTag` | str | | Which model failure this targets |
| `rubricRef` | str | | Swarm ref of the public rubric JSON |
| `rubricHash` | str | | sha256 of the rubric, so anyone can check it |
| `rubric` | bytes | | The rubric JSON itself (`str()` caps at 128 bytes), so the board and the verifier never depend on a gateway |

- **Owner:** buyer agent wallet. **Expiry:** the task deadline. When it passes, the task vanishes from every board with no cleanup job.

### `adx.claim`: one human holds one slot
| Column | Type | Indexed | Meaning |
|---|---|---|---|
| `task` | key | ✓ | The task entity key |
| `status` | str | ✓ | `active` |
| `slot` | u64 | ✓ | Slot number |
| `claimant` | str | | Fresh pseudonym per claim (hash of a random salt). **Never** the nullifier |
| `challenge` | str | | Liveness challenge shown to the contributor (spoken word + finger count) |

- **Owner:** platform wallet. **Expiry:** 2 h (the claim window). An abandoned claim frees its slot by itself; the board counts live claims from Arkiv.

### `adx.submission`: a recorded clip
| Column | Type | Indexed | Meaning |
|---|---|---|---|
| `task` | key | ✓ | Task |
| `claim` | key | ✓ | Claim |
| `status` | str | ✓ | `pending`, `accepted`, `rejected`, `review` |
| `dhashA`, `dhashB`, `dhashC` | str | ✓ | First 4 hex of the perceptual hash of three frames (start, middle, end): near-duplicate lookup across all buyers |
| `dhash` | str | | The three full 64-bit hashes, `a|b|c` |
| `swarmRef` | str | | 64-hex Swarm reference of the **ciphertext** (no key inside) |
| `cipherSha256` | str | | sha256 of the ciphertext |
| `durationMs` | u64 | | Clip length |

- **Owner:** worker wallet. **Expiry:** 30 days.

### `adx.verification`: the AI verdict
| Column | Type | Indexed | Meaning |
|---|---|---|---|
| `submission` | key | ✓ | Submission |
| `task` | key | ✓ | Task |
| `verdict` | str | ✓ | `accept`, `reject`, `review` |
| `score` | u64 | ✓ | 0–100 |
| `model` | str | | Model and version |
| `rubricHash` | str | | Rubric the verdict was made against |
| `evidence` | bytes | | Small JSON: per-step timestamps and reasons |
| `evidenceHash` | str | | sha256 of `evidence`, so anyone can recompute it |

- **Owner:** verifier wallet. **Expiry:** 180 days.

### `adx.receipt`: a settled payment
| Column | Type | Indexed | Meaning |
|---|---|---|---|
| `task` | key | ✓ | Task |
| `submission` | key | ✓ | Submission paid for |
| `mode` | str | ✓ | `live` or `simulated` (every receipt says which) |
| `network` | str | ✓ | `hedera:testnet` |
| `hederaTx` | str | | Transaction ID, opens on HashScan |
| `usdc` | dec | | Amount |
| `payTo` | str | | Hedera account paid |
| `approval` | str | | `auto` (under threshold) or `agent-pass` (human approved) |

- **Owner:** verifier wallet. **Expiry:** 180 days. Written only in the x402 after-settle hook, so a receipt can't exist for a payment that didn't settle.

### `adx.licence`: the contributor's licence for one clip
| Column | Type | Indexed | Meaning |
|---|---|---|---|
| `submission` | key | ✓ | Clip |
| `task` | key | ✓ | Task |
| `licensee` | addr | ✓ | Buyer agent wallet allowed to use the clip |
| `status` | str | ✓ | `granted` |
| `scope` | str | | e.g. `robot-training` |
| `termsHash` | str | | sha256 of the licence terms |

- **Creator:** platform wallet. **Owner:** the contributor's wallet, set with `changeOwnership` right after creation. **Expiry:** the licence term (90 days), renewable by the contributor.
- **Withdrawal (designed, not built):** the contributor deletes the entity (only the owner can), and buyer agents query live licences before each use, so a withdrawn clip drops out.

### `adx.manifest`: a dataset
| Column | Type | Indexed | Meaning |
|---|---|---|---|
| `skill` | str | ✓ | Task family |
| `version` | u64 | ✓ | Manifest version |
| `samples` | u64 | | Accepted clips |
| `humans` | u64 | | Distinct verified humans in the dataset |
| `swarmRef` | str | | Swarm ref of the public manifest JSON |

- **Owner:** buyer agent wallet. **Expiry:** 180 days.

## Never on Arkiv
World ID nullifiers, decryption keys, encrypted Swarm references that carry a key, raw video, names, emails, phone numbers, IP addresses, session tokens.

## Example query (runnable)
Open tasks paying at least 2 USDC, trusted only from our buyer agent:

```ts
publicClient.select({ $key: true, title: true, reward: true, deadline: true })
  .from(Task)
  .where(and(eq("status", "open"), gte("reward", dec("2"))))
  .ownedBy(BUYER_AGENT_ADDRESS)
  .limit(50)
  .fetch()
```

A `curl` version against the public Rabdi JSON-RPC (no key needed) is in the [README](../README.md#arkiv).
