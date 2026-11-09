# 07 — Code Style

## Language and tooling
- TypeScript strict everywhere (`strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, ESM only).
- Biome for lint + format (`pnpm lint`, `pnpm format`). Line width 110, 2 spaces, double quotes, trailing commas.
- pnpm workspaces; internal packages `@adx/shared`, `@adx/db`. Sponsor SDKs pinned with `--save-exact`.
- Node 22. One copy of `@hiero-ledger/sdk` (import Hiero classes via `@x402/hedera` re-exports where possible).

## Structure
- One responsibility per file; pipeline stages are separate files (`probe.ts`, `fingerprint.ts`, `dedup.ts`, `verify.ts`, `rules.ts`, `encrypt.ts`, `swarm.ts`, `publish.ts`).
- Pure logic (policy, rules, guard, crypto) has no I/O and is unit-tested.
- I/O at the edges: API routes, runner, agent loop.
- Shared types and Arkiv schemas live only in `packages/shared`; never redefine an entity shape in an app.

## Conventions
- Validate every external input with zod at the boundary; types come from `z.infer`.
- Errors: throw typed errors (`class UnsafeArkivWrite extends Error`), map to `{error:{code,message}}` in routes. Never leak stack traces or secrets.
- Every write carries an idempotency key; every step emits an event (`packages/shared/src/events.ts`).
- Async: `Promise.all` for independent calls; per-signer queues for Arkiv writes (never `Promise.all` writes on one signer).
- Money: amounts as strings/`bigint` in smallest units (USDC 6 decimals); never floats.
- Time: Unix seconds (`u64`) on Arkiv; `timestamptz` in Neon; display in IST/local.
- Naming: `camelCase` vars, `PascalCase` components/types, `kebab-case` files for components, `SCREAMING_SNAKE` env.
- React: Server Components by default; `"use client"` only where needed; no data fetching in client components except SSE/EventSource and the wallet.
- Comments explain *why*, not *what*. Every file that touches a sponsor SDK has a one-line header naming the SDK version.

## Commits
Conventional style: `feat(worker): …`, `fix(web): …`, `docs: …`, `chore: …`. One sub-phase per commit (or a few). Always end with the Co-Authored-By line. Never commit `.env`, keys, clips or editor files.

## Verified commands
| Command | What |
|---|---|
| `pnpm dev` | web dev server |
| `pnpm typecheck` · `pnpm lint` · `pnpm test` | checks |
| `pnpm doctor` | env + connectivity (P0.2) |
| `pnpm db:push` | Neon schema (P0.3) |
| `pnpm seed:arkiv` | verifier listing + demo task (P1.4) |
| `pnpm arkiv:smoke` · `pnpm x402:smoke` · `pnpm swarm:smoke` | existing smoke tests ✅ |
| `pnpm eval` | 16-clip evaluation (P9) |
