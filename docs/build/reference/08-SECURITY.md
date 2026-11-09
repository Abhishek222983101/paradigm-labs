# 08 — Security

> Threat model: system architecture §15. This file is the rulebook the code must follow.

## Sensitive data and where it may live
| Data | Allowed in | Never in |
|---|---|---|
| World ID nullifier | Neon `claims_private` | Arkiv, logs, client |
| Clip AES key | Neon `clip_keys`; the x402 200 response after settlement | Arkiv, logs, URLs |
| Raw clip | worker `/tmp` until encrypted | Swarm, Arkiv, Vercel |
| Contributor private key | the contributor's device (sealed by passkey) | our servers, logs |
| Service keys (Arkiv roles, Hedera, World, AI, DB) | env vars on the service that needs them | code, docs, Arkiv, client bundles |
| Encrypted Swarm refs that carry a key | nowhere (we never create them) | Arkiv |

## Rules
1. **Every Arkiv write goes through `guard.ts`** (`safeCreate/safePatch/safeExtend/safeChangeOwner/safeDelete`). No direct `createEntity` calls elsewhere.
2. **Server-side validation of identity:** IDKit results are forwarded unmodified to World's v4 verify endpoint; Agent Pass id_tokens are validated (iss, aud, signature via JWKS, acr, auth_time ≤ 300 s, nonce, approver allowlist). A client claim of success is never authorisation.
3. **Money only through the policy:** `pay.ts` accepts only a decision object produced by `policy.ts` and checks its binding hash. The LLM has no payment tool.
4. **Receipts/keys only after settlement:** side effects run in `onAfterSettle`; handler code before settlement is pure.
5. **Trust by signer:** every Arkiv read used for a decision filters by our owner wallets (exception: cross-buyer dedup reads, which are intentionally unfiltered and only ever cause a reject).
6. **Uploads:** HMAC single-use tokens (15 min), 60 MB cap, content-type and duration checks, per-wallet rate limit, CORS limited to the web origin.
7. **Private infrastructure:** Bee and rpc-router have no public domain; agent status API requires a bearer token.
8. **Secrets hygiene:** `.env` git-ignored; `.env.example` lists names only; logs never print env values; error responses never echo secrets.
9. **Dependencies:** sponsor SDKs pinned exact; run `supply-chain-risk-auditor` before submission.
10. **Abuse:** cooldown per wallet between uploads; claim slots limited by World ID uniqueness.

## Authorization matrix
See `05-BACKEND-SCHEMA.md` → Authorization rules.

## Pre-submission security pass (P9)
- Trail of Bits skills: `insecure-defaults` on the repo, `sharp-edges` on `policy.ts`, `guard.ts`, upload tokens and the x402 route.
- Manual: try to (a) claim twice, (b) reuse an upload token, (c) fetch the clip key without paying, (d) approve with a stale id_token, (e) write a secret through the guard. All must fail.
