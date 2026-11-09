# 02 — Technical Requirements Document (TRD)

> Companion doc. **Source of truth: `docs/build/SYSTEM-ARCHITECTURE.md`** (§6 stack, §8 diagrams, §9 modules). This is the condensed checklist of technical choices.

## Platforms
Web only (mobile-first, installable PWA). Tested on iOS Safari 18+, Android Chrome, desktop Chrome/Firefox.

## Frontend and hosting
Next.js 16.4.5 (App Router, React 19.3, React Compiler), Tailwind 4, shadcn/ui (Radix), Geist fonts. Hosted on Vercel (project `agentic-data-exchange`, https://adx-paradigm.vercel.app), Node runtime with fluid compute. Server Components for reads; client components only for recorder, IDKit, wallet, live feed.

## Backend and database
| Service | Runtime | Host |
|---|---|---|
| `apps/web` API routes (claims, upload tokens, SSE, x402 endpoint, licences) | Node 22 on Vercel | Vercel |
| `apps/worker` (upload endpoint + job runner: ffmpeg, sharp dHash, Gemini, AES-GCM, Swarm, Arkiv) | Node 22 + ffmpeg | Railway project `adx` |
| `apps/agent` (buyer agent: Claude Haiku text, policy, x402 client, Agent Pass, HCS) | Node 22 | Railway |
| `infra/bee` (Bee 2.8.3 light node, Sepolia) · `infra/rpc-router` | Docker | Railway, private network only |
| Private DB | Neon Postgres 18, `ap-southeast-1`, Drizzle ORM | Neon |

## Authentication and roles
| Actor | How they authenticate |
|---|---|
| Contributor | Embedded wallet (secp256k1, passkey PRF) signs requests; World ID IDKit (Selfie Check) to claim |
| Buyer's human | World ID Agent Pass (World IdP OIDC) for approvals; console protected by a bearer token for the demo |
| Buyer agent | Its own Hedera key (x402 payer) and Arkiv key (task owner) |
| Services | Per-role Arkiv signer keys; HMAC upload tokens; bearer token for agent status API |

## External services and APIs
| Provider | Purpose | Limits / notes | Credential |
|---|---|---|---|
| Arkiv Rabdi (`@arkiv-network/sdk` 1.0.1) | Shared records | ~7 s per write; limit 100 per page; no NOT/!=; testnet may reset | `ARKIV_ACCESS_KEY` + role keys |
| Swarm (our Bee node) | Encrypted clips | Batch `c0cc5436…` depth 20, ~2.9 days | `BEE_*`, `SWARM_BATCH_ID` |
| Hedera testnet (`@x402/*` 2.30.0, Hiero SDK 2.90.1) | x402 USDC, HTS, HCS, Mirror Node | Facilitator x402.org (Launa fallback); USDC `0.0.429274` | `HEDERA_*` |
| World IDKit 4.6 | One human per slot | v4 verify endpoint; enforce uniqueness ourselves | `WORLD_*` |
| World IdP (Agent Pass) | Fresh human approval | acr `orb` / `orb-face`; device code 20 min | `WORLD_AGENTPASS_*` |
| Gemini 3 Flash | Clip verifier (video + audio) | Inline ≤ 20 MB else Files API | `GEMINI_API_KEY` |
| Claude Haiku 5.5 | Agent task text | text only | `ANTHROPIC_API_KEY` |
| Neon | Private Postgres | pooler URL | `DATABASE_URL` |

## Architecture
See system architecture §8 (master diagram, deployment, data placement, sequences, state machines) and `docs/build/diagrams/00-architecture.png`.

## Security and privacy
Arkiv is public: only non-sensitive fields, every write through the guard. Nullifiers, clip keys, raw video never public. Clips encrypted (AES-256-GCM) before Swarm. Receipts and keys only after x402 settlement. Details: `08-SECURITY.md`.

## Performance and reliability targets
Board LCP < 1.5 s on 4G · recorder JS < 120 kB gz · pipeline p50 ≤ 20 s / p95 ≤ 30 s after upload · x402 purchase ≤ 4 s · idempotent writes, retries with backoff, human review on AI uncertainty.

## Environments and delivery
| Env | Where |
|---|---|
| Local | `pnpm dev` + cloudflared tunnel for phones; `.env` (git-ignored) |
| Preview | Vercel preview per push; Railway services from `main` |
| Production | adx-paradigm.vercel.app + Railway `adx` |
CI: GitHub → Vercel builds; typecheck/lint/test before push (no separate CI runner needed for the hackathon). Arkiv namespace via `ARKIV_NS` for reset recovery.

## Key technical decisions and tradeoffs
| Choice | Reason | Alternative rejected |
|---|---|---|
| TypeScript everywhere + native ffmpeg/libvips | Sponsor SDKs are TS; network dominates latency | Rust/Go workers (no real gain, slower to build) |
| Gemini single-call verifier, code decides | Sees video + hears audio; fewest moving parts; no silent accept | Claude + frames + Whisper (3 services) |
| Upload phone → worker | Vercel 4.5 MB body cap | Vercel route / S3 presign (CORS unknown) |
| Encrypt before Swarm, plain ciphertext ref on Arkiv | Satisfies the Swarm rule by construction | Swarm built-in encryption (key inside ref) |
| x402 for purchases | Pay and unlock in one request; required by Hedera | Manual transfer + watcher + refunds |
| Deterministic policy engine | Spending controls a prompt can't bypass | LLM deciding payments |
| Embedded wallet | Zero install | Mandatory external wallet |
| Postgres job queue (`SKIP LOCKED`) | One less service | Redis/queue service |
