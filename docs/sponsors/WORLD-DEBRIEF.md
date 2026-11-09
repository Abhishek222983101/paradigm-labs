# World — integration debrief (Paradigm, ETHGlobal Mumbai 2026)

**Tracks:** World ID with IDKit, and World Agent Pass (World IdP device authorization).
**Raw log with timestamps:** [`session-logs/world-session.md`](session-logs/world-session.md) · **On-chain / live proofs:** [`PROOFS.md`](PROOFS.md) WLD-01…05

## What we built with World

| Where | World product | What it does in Paradigm |
|---|---|---|
| Claiming a task slot | **IDKit 4.6** (`deviceLegacy` preset, `allow_legacy_proofs`), verified server-side at `developer.world.org/api/v4/verify/{rp_id}` | One verified human per task slot. The proof's signal is bound to `task:wallet`; we recompute the signal hash server-side. Nullifier is `UNIQUE(task, nullifier)` in Postgres, never published |
| Approving a big payment | **World IdP device authorization grant** (`/api/v1/device_authorization` → poll `/api/v1/token`) | When the buying agent wants to pay more than 5 USDC, it opens a World approval and pays only after a fresh World ID approval. id_token checked for issuer, audience, RS256 via JWKS, `acr` in our allow-list and `auth_time` < 5 min |

**Why IDKit uses `deviceLegacy`:** Selfie Check was the plan, but World App answers "Feature unavailable" for our app (issue W-2), so any verified World ID is accepted for claims.

**Proven live:** 2 different real humans claimed slots, and the same person was refused a second slot (WLD-03). The agent paused a 6 USDC payment, a human approved with World ID (`acr = …/orb`), and the agent paid on Hedera ([tx](https://hashscan.io/testnet/transaction/0.0.9185802@1794003438.891569019), WLD-05). Expired and denied requests paid nothing.

## Issues we hit (most painful first)

| # | Severity | What happened | Repro | Our workaround | Suggested fix |
|---|---|---|---|---|---|
| W-1 | 🔴 High | **World ID proof succeeds, approval never completes.** World ID app shows success, the device code stays `authorization_pending`, and the page drops back to "Continue with a passkey". Cause: a separate **World IdP account** is needed. The only hint is a small grey line, "First time here? Create an account first, then start this connection again". The interstitial "This proof of human is not linked to any account" appeared only once | Fresh World ID with no IdP account → open any device-flow `verification_uri` → Continue with World ID → approve in app | Create the account once at auth.world.org → "First time here? Create an account" → "Create with World ID", then start a new device request | When a valid proof has no account, offer "Create account and continue" inline, in the same transaction |
| W-2 | 🔴 High | **Selfie Check is in the public SDK but disabled per app.** `selfieCheck({ signal })` → World App: "Feature unavailable: Contact your World PoC to enable Selfie Check for your app" | IDKit 4.6, production app, `selfieCheck` preset, scan with World App | Fall back to `deviceLegacy`. Keep Selfie Check behind `NEXT_PUBLIC_WORLD_PRESET=selfie` | Self-serve toggle in the Developer Portal, or a note in the SDK docs for the preset |
| W-3 | 🔴 High | **The default approval needs a face match and hides the World ID button.** With no `acr_values`, the page says "Requires: Orb with face check" and offers only passkey or Deny. Desktop Chrome first opens its own passkey picker. World App Face Auth then failed: "Could not match you". Our portal default was set to Selfie Check (row 06 Nov 08:02), yet the page showed Orb with face check | `POST /api/v1/device_authorization` with `client_id`, `scope=openid` only → open `verification_uri_complete` | Send an essential acr claim for Orb **without** face: `claims={"id_token":{"acr":{"essential":true,"values":["https://world.org/oidc/acr/orb"]}}}`. The page then shows "Continue with World ID" | Always show "Continue with World ID" when the person's credential can satisfy the class. Make the portal default visible on the approval page and in the client settings |
| W-4 | 🟠 Medium | **A failed attempt removes the World ID option from that transaction.** After the W-1 bounce, refreshing the same `transaction_id` shows only passkey / Deny | Fail once (W-1), refresh the same link | Supersede the request and start a new device code | Let a transaction retry World ID until it expires |
| W-5 | 🟠 Medium | **The approver can't see what they approve.** `binding_message` is unsupported in the device flow (documented). The human sees "Paradigm" and a code, not "pay 6 USDC to 0.0.11339643". `nonce`, `prompt` and `max_age` are also ignored | Send `binding_message` → not shown on the page, not in the id_token | Bind it on our side: approval row holds `binding_hash` of (submission, amount, payTo), checked again before paying. The console shows the amount next to the code | Support a short action message on the approval page, signed into the id_token. That is the core of "agent asks a human" |
| W-6 | 🟠 Medium (security) | **The official IDKit Next.js example trusts the client for where to verify.** The verify route takes `rp_id` and `devPortalBaseUrl` from the request body, so a client can point verification at its own server | `js/examples/nextjs` verify route | Hard-code both server-side. Recompute `hashSignal(task:wallet)` and compare before forwarding (`apps/web/src/lib/server/world.ts`) | Read both from server env in the example |
| W-7 | 🟠 Medium | **Personal Gmail can't open the IdP portal.** `{"error":"account_not_eligible"}` on the Google callback. The page says "enterprise Google account", and any Google Workspace domain works | auth.world.org/portal → Continue with Google → @gmail.com | Used a college Workspace account | Say "Google Workspace account (not @gmail.com)" on the prize page and the login page |
| W-8 | 🟡 Low | **Selfie classes are listed in docs but not offered.** Discovery `acr_values_supported` = orb, orb-face only. Requesting orb **and** selfie still shows "Requires: Orb" | `curl https://auth.world.org/.well-known/openid-configuration`; device request with both values | Request Orb only | Show which classes a client may use, and why one is dropped |
| W-9 | 🟡 Low | "Open World ID app" on the desktop approval page opens the world.org marketing site | Open any `verification_uri` on a laptop, click the button | Tell people to scan the QR on desktop | On desktop, hide the button or show the QR bigger |
| W-10 | 🟡 Low | `IDKitRequestWidget` closing calls `onOpenChange(false)` without `onError` | Open the widget, close it | Treat close as cancel in our code | Document it, or call `onError("cancelled")` |

## What worked well

- **Device authorization grant** is the right primitive for agents. No callback URL, just a code and a link. Once the account existed, approval → id_token → payment took about 10 s.
- **id_token** carries `acr`, `amr` and `auth_time`, so we can enforce "fresh, Orb-level human" in code, not just trust a redirect.
- **IDKit server verification** with signal binding and nullifiers made "one human per slot" a one-line database constraint.
- The docs at auth.world.org/docs (step-up, id-token, OIDC device profile) answered every protocol question once we found the right page.

## Asks

1. Inline account creation inside an approval transaction (W-1).
2. Self-serve Selfie Check, or at least a clear "not enabled for this app" error from the API (W-2).
3. A signed, displayed action message for device approvals (W-5).
4. Always offer World ID when it can satisfy the class, and let a transaction retry (W-3, W-4).

## For the demo (how a judge can reproduce)

1. Approver: create a World IdP account once (auth.world.org → First time here? Create an account → Create with World ID).
2. Record an accepted clip on the 6 USDC task. The agent opens an approval within seconds (console: "Waiting for you").
3. Console → **Open World's approval page** → **Continue with World ID** → scan with World ID app → approve. The agent pays and the HashScan link appears.
