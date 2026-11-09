# 09 — Testing

> Acceptance IDs (T-…) match system architecture §2.7 and §19. Mark results only after actually running them.

## Layers
| Layer | Tool | What |
|---|---|---|
| Unit | Vitest | guard, policy, rules (verdict decisions incl. bad timestamps / not_visible), crypto round-trip, dHash properties, upload token signing, zod schemas |
| Integration | scripts (`tsx`/Node strip-types) | `arkiv:smoke`, `x402:smoke`, `swarm:smoke`, `seed:arkiv`, `doctor`, `outside-agent` |
| E2E | Playwright (Chromium, fake camera `--use-fake-device-for-media-stream --use-file-for-fake-video-capture=eval/sample.y4m`) | claim (World staging/Simulator) → upload → verdict on the preview URL |
| Manual devices | real iPhone (Safari) + Android (Chrome) | ≥ 18 s recording, upload, status, withdraw |
| Evaluation | `pnpm eval` | 16 labelled clips → FAR/FRR, duplicate catch rate, latency |

## Acceptance tests
| ID | Test | Phase |
|---|---|---|
| T-ARK-2 | Board + explorer show the seeded task read from Arkiv | P1 |
| T-WLD-1 | Claim ok; duplicate claim → 409; cancel → no claim | P2 |
| T-VER-1 | Re-encoded copy rejected as duplicate | P4 |
| T-VER-2 | Good fold accept (≥ 3 timestamped steps); wrong word reject; ambiguous review | P4 |
| T-SWM-1 | Gateway download decrypts to the same sha256 | P4 |
| T-PAY-1 | 402 → pay → 200 on the deployed route; HashScan tx | P5 |
| T-PAY-2 | Forced settlement failure → no receipt, no key, payment failed | P5 |
| T-AGT-1 | Agent posts a task and auto-pays an accepted clip | P6 |
| T-AGT-2/3, T-WLD-2/3 | Above threshold: approve → paid; deny/expire → nothing paid | P6 |
| T-AGT-4 | HCS topic shows each decision | P6 |
| T-LIC-1 | Withdrawal removes licence; agent drops the clip | P7 |
| T-E2E-1 | Outside agent prints the same state as the UI | P7 |

## Test data
- Arkiv namespace `adx-test` for automated tests (never the demo namespace).
- Hedera: 0.01 USDC test payments only.
- World: staging environment + Simulator for automated/IDKit tests.
- Clips: `eval/` (git-ignored media, committed manifest with labels).

## Reporting
Results go into `docs/build/BUILD-PLAN.md` (Not run / Passed / Failed) with the date and what was run. Eval numbers go into the README. Never report a test as passed without running it.
