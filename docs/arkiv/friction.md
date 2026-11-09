# Arkiv — friction and feedback (Paradigm, ETHGlobal Mumbai 2026)

**Raw log with timestamps:** [`../docs/sponsors/session-logs/arkiv-session.md`](../sponsors/session-logs/arkiv-session.md) · **Proofs:** [`../docs/sponsors/PROOFS.md`](../sponsors/PROOFS.md) ARK-01…07 · **Schemas:** [`schema.md`](schema.md)

SDK `@arkiv-network/sdk` 1.0.1 on the Rabdi testnet. Every public record in Paradigm is an Arkiv entity, written by one wallet per role: buyer, worker, verifier, agent. Records cover the task, claim, submission (with Swarm ref and fingerprints), verification, receipt, licence and verifier heartbeat. We also read Arkiv to dedup clips across buyers.

## Issues we hit

| # | Severity | What happened | Repro | Our workaround | Suggested fix |
|---|---|---|---|---|---|
| A-1 | 🔴 High (security) | **The access key ended up in Next.js's disk cache.** The RPC URL carries the key in its path (`rpc.rabdi…/<key>`). Server-rendered reads through viem's fetch were cached by Next 16 under `.next/cache`, URL included | Next 16 with Cache Components, server component calls an SDK query, inspect `.next/cache` | `fetchOptions: { cache: "no-store" }` on the transport. Our own `"use cache"` layer caches only parsed results (`packages/shared/src/arkiv/client.ts`) | Next.js note in the SDK docs, or set `no-store` by default. Longer term, take the key as a header, not a path segment |
| A-2 | 🟠 Medium | **One wallet writes about 9 entities a minute.** `createEntity` resolves only after the receipt (~6.5 s on Rabdi). 10 queued writes on one signer took 65 s | `ARKIV_NS=adx-test pnpm arkiv:roundtrip` | One signer per role so roles write in parallel. `predictEntityKeys` gives the key before confirmation, so a dependent write (verification → submission) starts at once (~7 s instead of ~14 s) | A documented submit-now/confirm-later API, e.g. `createEntity(..., { wait: false })` returning `{ key, txHash, receipt }` |
| A-3 | 🟠 Medium | **`str()` values are capped at 128 bytes**, and longer values throw `InvalidValueError`. The cap is in `str()`'s JSDoc (`MAX_STRING_BYTES`) but not in the README's schema section | `str("x".repeat(129))` | Long JSON (rubric, evidence) goes in `bytes()` columns (≤ 128 KiB); `str()` is only for short indexed fields | Put the limits table (str, bytes, entity size) in the README schema section |
| A-4 | 🟡 Low | **The AI tools page is JS-rendered**, so the plugin install commands are invisible to fetch-based tools (curl, Exa, agents) until a section is expanded | Fetch hub.arkiv.network/ai-tools with curl: only headings | Read it in a real browser | Server-render the commands, or add a plain `llms.txt` |

## What worked well

- **`predictEntityKeys` + `salt`:** retries are idempotent. After an RPC timeout we look the entity up at the predicted key instead of writing a duplicate. This was the single most useful feature.
- **The query builder** (`select().from().where(and(eq(...))).ownedBy()`) made owner-filtered reads easy. Filtering by owner is what stops anyone else's writes from polluting our board.
- **Expiry per entity:** claims expire in 2 h, tasks at their deadline, verifications in 180 days. No cleanup jobs.
- Access key + faucet on hub.arkiv.network took minutes. The first write and read-back worked on the first try.
- The Claude plugin (`arkiv@arkiv` v0.5.4) installed cleanly.

## Asks

1. Default to `no-store`, or document the Next.js cache issue (A-1).
2. A non-blocking create that returns the key and tx hash immediately (A-2).
3. A limits table in the README (A-3).
