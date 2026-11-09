# Hedera — integration feedback (Paradigm, ETHGlobal Mumbai 2026)

**Tracks:** AI Agents That Pay (x402) and No Solidity.
**Raw log with timestamps:** [`session-logs/hedera-session.md`](session-logs/hedera-session.md) · **Proofs:** [`PROOFS.md`](PROOFS.md) HED-01…06

## What we built with Hedera (no Solidity anywhere)

| Piece | Hedera / x402 feature |
|---|---|
| Contributor payouts | **x402** (`@x402/next` 2.30.0 `withX402`) on our clip endpoint. `payTo` is the contributor's own Hedera account and the price comes from the Arkiv task. The decryption key is released only after settlement |
| The buying agent | `@x402/fetch` + `x402Client` + `createClientHederaSigner`, facilitator x402.org. Policy in code: auto-pay ≤ 5 USDC, World Agent Pass approval above that, hard cap 10, daily 20 |
| Contributor accounts | **Alias accounts** created from the person's wallet public key: `setECDSAKeyWithAlias` + `setMaxAutomaticTokenAssociations(-1)`, so USDC lands with no manual association |
| Agent audit trail | **HCS** topic `0.0.11343565`: every decision (paid, paused, approved, declined) with Claude's one-line note |
| Checks | **Mirror Node REST** to confirm every settlement |
| Agent tooling | **Hedera Agent Kit** 4.2.0 called from code (no LLM): the spend log goes through `submit_topic_message_tool`, and a USDC balance check (`get_account_token_balances`) runs before each payment. Only those two tools are loaded, so no transfer tool exists for a model to misuse |

**Proven live:**
- Autonomous 3 USDC sales to a real contributor.
- A 6 USDC sale approved by a human through World Agent Pass, then paid ([tx](https://hashscan.io/testnet/transaction/0.0.9185802@1794003438.891569019)).
- 76+ HCS messages.

## Issues we hit

| # | Severity | What happened | Repro | Our workaround | Suggested fix |
|---|---|---|---|---|---|
| H-1 | 🟠 Medium | **x402 client has a hidden $1 cap per payment.** The first real 3 USDC buy failed: "All payment requirements were rejected by spendControls.maxAmountPerPayment ($1, including USDC)". A sensible default, but every tutorial uses cents, so you only meet it in production | `x402Client` 2.30.0, pay any 402 priced above $1 | `setSpendControls({ maxAmountPerPayment: "$10" })`, which is our policy's hard cap | Mention the default in the quickstart and the Hedera x402 docs |
| H-2 | 🟠 Medium | **Facilitator sometimes returns an empty `402 {}`.** In 1 of 4 runs, after the payment header was sent, the response had no `payment-required` header and no reason. A retry minutes later settled, and no funds moved on the failed run | `pnpm test:x402` repeatedly against x402.org | Retry once, then mark the sale failed so the agent re-attempts with backoff (30 s / 2 min / 5 min) | Always return a reason (`invalidReason`) on a failed verify or settle |
| H-3 | 🟠 Medium | **`PublicKey.fromBytesECDSA` rejects the 65-byte uncompressed key** that viem and most wallets return: `BadKeyError: cannot decode ECDSA public key from this DER format`. It wants the 33-byte compressed form | `scripts/hedera/hedera-alias-spike.ts` with an uncompressed key | Compress (02/03 ‖ x) first (`packages/shared/src/hedera.ts`). The account was then created in 2.4 s | Accept both forms, or name the expected length in the error |
| H-4 | 🟡 Low | **`AccountBalanceQuery` is deprecated** in `@hiero-ledger/sdk` 2.90.1 (the version `@x402/hedera` pins) and throws, yet most tutorials still use it | `new AccountBalanceQuery().setAccountId(id).execute(client)` | Mirror Node REST for balances | Update the tutorials, and link the mirror query in the error |
| H-5 | 🟡 Low | **Circle's faucet rejects `0x…` addresses for Hedera**, even for ECDSA alias accounts. Only `0.0.x` works | faucet.circle.com → Hedera Testnet → paste the EVM address | Use the `0.0.x` id | Accept EVM aliases |
| H-7 | 🟠 Medium | **Agent Kit `HederaAgentAPI.run()` doesn't throw on a failed tool.** It returns a JSON string with `raw.status: "ERROR"`, so code that relies on try/catch treats a failed write as success | Run `submit_topic_message_tool` against a bad topic id and catch | Check `raw.status` in our wrapper (`apps/agent/src/hedera-kit.ts`) | Throw, or return a typed `{ ok: false }` |
| H-6 | 🟡 Low | `@x402/hedera` re-exports the Hiero SDK, so importing `@hiero-ledger/sdk` separately can produce duplicate-instance errors | Import both in one app | Import from one place only | Note it in the package README |

## What worked well

- **x402 on Hedera worked on the first try:** 402 → pay → 200 in 2.2 s on day one, and ~5 s per settlement in production.
- **Alias accounts with auto-association** mean a non-crypto user gets a Hedera account paid in USDC without seeing a wallet prompt.
- **HCS** is a cheap, readable, tamper-proof log for "why did the agent spend money".
- All three facilitators in the docs list `exact` on `hedera:testnet`, and the portal account plus 1000 HBAR took minutes.

## Asks

1. Document the $1 default spend cap (H-1).
2. A failure reason on every facilitator 402 (H-2).
3. Accept uncompressed ECDSA keys (H-3).
