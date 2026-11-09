# 06 — Implementation Plan

> Companion doc. **The detailed plan is system architecture §19** (phases P0–P10 with sub-phases, steps, acceptance and "what you'll see"). This file maps it onto milestones and the task format so progress is easy to track. Live checklist: `docs/build/BUILD-PLAN.md`.

## Milestones → phases
| Milestone | Phases | Window (IST) |
|---|---|---|
| 1. Project setup | P0 Foundation | Fri ~12:00–12:45 |
| 2. Data and auth | P1 Arkiv core · P2 Identity | Fri ~12:45–16:00 |
| 3. Core user journey | P3 Capture · P4 Verification · P5 Payments | Fri ~14:00–20:00 |
| 4. Secondary features | P6 Agent + approvals · P7 Licences + outside agent | Fri ~19:00–23:30 |
| 5. Quality | P8 Console + polish · P9 Eval + hardening | Fri 23:30–Sat 03:00 |
| 6. Release | P10 Docs, video, submission | Sat 03:00–07:00 (deadline 09:00) |

## Task format
| Task | Owner | Inputs | Output | Definition of done | Depends on |
|---|---|---|---|---|---|
| P0.1 Workspace + tooling | agent | repo | Biome, tsconfig, shared/db packages | `pnpm typecheck && pnpm lint` pass | — |
| P0.2 Env validation + doctor | agent | `.env` | `env.ts`, `scripts/doctor.ts` | doctor table all ✓ | P0.1 |
| P0.3 Database | agent | §10.2 | Drizzle schema, tables | `\dt` shows tables | P0.1 |
| P0.4 Design tokens + shell | agent | 04-UI-UX | themed shell, PWA manifest | shell visible on phone, both themes | P0.1 |
| P1.1 Schemas + role wallets | agent | §10.1 | `schemas.ts`, wallets in `.env` | create+read test on `adx-test` ns | P0 |
| P1.2 Write guard | agent | 08-SECURITY | `guard.ts` + tests | tests pass | P1.1 |
| P1.3 Signer queue | agent | — | `queue.ts` | 10 parallel writes, no nonce errors | P1.1 |
| P1.4 Queries + seed | agent | rubric | `queries.ts`, `seed-arkiv.ts` | keys + explorer links printed, PROOFS row | P1.3 |
| P1.5 Board + explorer | agent | — | `/tasks`, `/explorer` | seeded task visible live | P1.4 |
| P2.1 Embedded wallet | agent | §13.1 | `lib/wallet/` | survives reload on iOS + Android | P0.4 |
| P2.2 IDKit RP + widget | agent | World app IDs | rp-signature route, ClaimButton | Simulator proof returns | P0.4 |
| P2.3 Claim API | agent | §9.2 | `/api/claims` | T-WLD-1 passes | P1, P2.1, P2.2 |
| P2.4 Contributor Hedera account 🧪 | agent | operator key | account per wallet | HashScan account + test transfer | P2.3 |
| P3.1 Recorder | agent | §9.1 | `/record/[claim]` | 30 s iPhone clip, no freeze | P0.4 |
| P3.2 Worker upload server | agent | — | `apps/worker` on Railway | upload/reuse/oversize tests | P0.3 |
| P3.3 Upload UX | agent | — | progress + retry | redirect to status | P3.1, P3.2 |
| P4.0 Spikes 🧪 | agent | — | logged results | Bee batch usable, Gemini latency known | P3.2 |
| P4.1–P4.5 Pipeline | agent | §11 | probe, fingerprint, dedup, Gemini verdict, rules, encrypt, Swarm, publish, SSE | T-VER-1/2, T-SWM-1 | P4.0, P1 |
| P5.1–P5.3 Payments 🧪 | agent | §12 | x402 route, hooks, payout routing | T-PAY-1/2 | P4 |
| P6.1–P6.4 Agent | agent | §9.4, §13.3 | policy, loop, approvals, HCS | T-AGT-1..4, T-WLD-2/3 | P5 |
| P7.1–P7.3 Licences/outside/manifest | agent | — | `/me`, `outside-agent.ts`, manifest | T-LIC-1, T-E2E-1 | P6 |
| P8 Console + polish | agent + you | 04-UI-UX | console, landing, states | §16 targets, teammate test | P7 |
| P9 Eval + hardening | you (record clips) + agent | 16 clips | eval report, security fixes | confusion matrix in README | P8 |
| P10 Docs + video | you + agent | session logs | arkiv/*.md, README, debrief, video | §20 all ticked, submitted | P9 |

## Before moving on (every sub-phase)
1. Run the app and the sub-phase's acceptance check for real.
2. Mark it Passed/Failed in `BUILD-PLAN.md`; add any on-chain proof to `PROOFS.md`.
3. Log sponsor-tool friction in `docs/sponsors/session-logs/`.
4. Commit (feature-sized message) and push.
5. Record any unresolved issue in `03-DECISIONS-AND-OPEN-QUESTIONS.md`.
