# ADX — Payments (Hedera x402 + spending policy)

## Two money flows
| Flow | Rail | Who pays whom |
|---|---|---|
| **Clip purchase** | x402 on Hedera testnet, USDC `0.0.429274`, `exact` scheme | Buyer agent → contributor (per-request `payTo` if supported; otherwise merchant, then an HTS transfer to the contributor in the after-settle hook) |
| **Bonus / large payout** | Same x402 call, gated by a World Agent Pass approval | Buyer agent → contributor, only after a fresh human approval |

## The paid endpoint
`GET /api/x402/clip/:submissionKey` on `apps/web` (Next.js 16.4.5, `@x402/next` 2.30.0, `ExactHederaScheme`).

| Condition | Response |
|---|---|
| Submission not accepted, or unknown | `404` (an agent can never pay for a rejected clip) |
| Accepted, no payment | `402` with `accepts: [{ scheme: "exact", network: "hedera:testnet", asset: "0.0.429274", price, payTo }]` |
| Paid and settled | `200` `{ swarmRef, key, cipherSha256, licenceKey }` |
| Settlement fails | Error from the middleware; no receipt, no key |

- **Facilitator:** `https://x402.org/facilitator` (primary), Launa as fallback. Both verified live on `hedera:testnet`.
- **Price** comes from the task's `reward` on Arkiv, never from the request.
- **After-settle hook** (only runs on success): write `adx.receipt`, create and transfer `adx.licence`, store the payment row, log to HCS.

## Spending policy (enforced outside the model)
The agent's LLM proposes; a deterministic policy module decides. The Hedera key is only reachable through this module.

| Rule | Default |
|---|---|
| Per-clip cap | 5 USDC |
| Daily budget | 20 USDC |
| Payee allowlist | Only `payTo` values that match a live `adx.verifier` listing owned by our verifier wallet |
| Approval threshold | Any single payment > 5 USDC needs a World Agent Pass approval |
| Freshness | Approval `auth_time` within 5 minutes, `acr` = `https://world.org/oidc/acr/orb-face` |
| Binding | Approval is tied to a hash of (amount, payee, submission). Any change voids it |

Every decision (paid, skipped, approval requested, approved, denied, expired) is written to the HCS spend-log topic and shown in the buyer console.

## Accounts
| Role | Account |
|---|---|
| Buyer agent | `0.0.11333306` |
| Merchant (fallback payTo) | `0.0.11333308` |
| Contributors (demo phones) | `0.0.11333310`, `0.0.11333312` |
| Operator (fees, HCS topic admin) | `0.0.11332739` |

All USDC-associated. First settled payment: `0.0.9185802@1793933035.147018991`.

## Open item
Per-request `payTo` straight to the contributor with `@x402/hedera`: to be tested first thing in the build. If it works, contributors are paid in the same transaction. If not, the fallback is the merchant-then-HTS-transfer route, logged as a second transaction ID on the receipt.
