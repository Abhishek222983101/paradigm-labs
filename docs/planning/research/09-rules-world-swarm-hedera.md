# 09 — Prize-stacking rules, World ID Agent Pass, Swarm, Hedera x402 (re-check)

> Researched Fri 6 Nov 2026, 00:45–01:40 IST (during hacking). Primary sources only; every fact has a URL. **UNVERIFIED** marks anything not confirmed from a primary source or a live probe. Live probes were run from this machine on 6 Nov 2026.

## TL;DR verdicts

| Question | Verdict |
|---|---|
| Several tracks of one partner? | **You can enter all of them; they count as one partner pick** (ETHGlobal text). Neither ETHGlobal nor the World or Hedera pages say whether you can *win* more than one. Arkiv is the only partner that caps it (one Arkiv track + Swarm bonus). Our scan of 49 past 2026 winners found **no team with two tracks from one sponsor**, so plan on one prize per partner. |
| World: IDKit + Agent Pass both? | Enter both (one pick). Whether you can win both is **UNVERIFIED**, so ask at the World booth. **Build for Agent Pass** ($5k, 3 places, "especially interested in agentic products"). Add IDKit only if the contributor-claim uniqueness check is cheap. |
| Hedera: x402 + No Solidity both? | Enter both (one pick). One build can meet both: x402 USDC = HTS, plus an HCS audit log, JS SDK, zero contracts. Nothing on the page caps the wins. |
| Agent Pass = ? | **World IdP: a standard OIDC provider at `https://auth.world.org`** (auth code + PKCE, or Device Authorization Grant), with step-up (`max_age=0`, `acr`) and "human checkpoints" for agents. **There is no World SDK**: use any OIDC library (e.g. `openid-client` 6.8.9). |
| Swarm without our own node | The **Swarm Foundation public API gateway `https://api.gateway.ethswarm.org` accepted uploads (201) and returned an encrypted 128-hex ref in our probe**. But it ignores your batch ID, so you can't report a batch for `/arkiv/swarm.md`. Ask the Swarm/Arkiv booth for a batch or gateway. ACT is not usable from a browser or the gateway. |
| Hedera x402 | `@x402/*` **2.30.0** (4 Nov). `@x402/hedera` pins `@hiero-ledger/sdk` 2.90.1. All 3 testnet facilitators are live. The hedera-dev x402 PoC **has no licence** (read-only reference). Workshop plugin = **`hedera-dev/hedera-skills`** (Apache-2.0). |

---

## 1. ETHGlobal prize rules: multiple tracks from one partner

**Primary text** (https://ethglobal.com/events/mumbai/info/details, fetched 6 Nov):
> "💰 Partner Prizes: On the last step of the submission form, you can select up to 3 Partner Prizes to apply for. **If a partner has multiple tracks, you can be eligible for all of them while only counting as 1 Partner Prize.**"

| Partner | Page text on per-team caps | Verdict |
|---|---|---|
| World (https://ethglobal.com/events/mumbai/prizes/world) | Nothing about a per-team cap. IDKit = "up to 2 teams × $1,250". Agent Pass = 1st/2nd/3rd. | **(a)** Eligible for both, one pick. Winning both: **not prohibited in writing; UNVERIFIED in practice.** Ask the World team. |
| Hedera (https://ethglobal.com/events/mumbai/prizes/hedera) | Nothing about a per-team cap. Tracks cross-reference each other ("an x402 service … this also links to Track 1" in Tokenize). No Solidity = "up to 2 teams × $1,000". | **(b)** Eligible for both, one pick. A single build can meet both: x402 settles as an **HTS** transfer, add **HCS** spend audit log, `@hiero-ledger/sdk` JS, zero Solidity. |
| Arkiv (https://ethglobal.com/events/mumbai/prizes/arkiv) | "Each team can win one Arkiv track prize; the Arkiv + Swarm bonus can come on top of it." "Arkiv's prizes count as one partner prize on ETHGlobal, so it does not use another of your three picks." | **(c)** Confirmed: max one Arkiv track + the Swarm bonus, all inside one pick. The bonus asks for the Swarm batch ID and the wallet that bought it, **"(or who gave you the batch)"**, plus the Bee node or service used. |

**Past-event precedent** (showcase "Winner of" fields):
- Many winners hold prizes from **different** sponsors. Examples:
  - DIVE won World MiniKit 1st, Hedera Agentic Payments, 0G 2nd and Finalist (https://ethglobal.com/showcase/dive-5hxbp).
  - CaaS won World AgentKit 3rd and 0G Wildcard (https://ethglobal.com/showcase/caas-ivt4s).
- Teams do **submit** to several tracks of one sponsor. Vocaid Hub targeted 3 World + 2 0G + 2 Hedera tracks at Cannes 2026 (https://github.com/Vocaid/vocaid-hub/blob/main/SUBMISSION.md).
- Practical rule: tick every track you genuinely qualify for (it costs nothing), but write each track's required evidence separately in the submission form.

### 1a. Same-sponsor double-win scan result
- **What we scanned** (6 Nov): the "Winner of" field on ~560 showcase pages:
  - the first 4 listing pages of Cannes, New York and Lisbon 2026
  - every Hedera- or World-tagged project from Cannes, NY, Lisbon, ETHOnline and Tokyo 2026
- **Result:**
  - 49 prize-winning projects. 12 of them won Hedera or World prizes.
  - **None held two tracks from the same sponsor.** Two examples:
    - AgentRouter, an x402 inference exchange, won only Hedera "No Solidity Allowed", not the agentic-payments track (https://ethglobal.com/showcase/agentrouter-deqhv).
    - Human Attention Token won only "World ID 4.0 2nd" (https://ethglobal.com/showcase/humanattentiontoken-q09yz).
- **Reading:** the sample is small, so this is not proof of a rule. It does hint that sponsors usually spread their tracks across different teams.
- **Plan:** count on **one prize per partner**. Treat a second track as upside only.
- The script and raw output stayed in the session scratchpad and are not committed.

---

## 2. World ID Agent Pass (= World IdP OIDC)

### 2.1 What it is (VERIFIED)
- The ETHGlobal prize page links "World ID Agent Pass" → `https://auth.world.org/`, "Agent Pass Docs" → `https://auth.world.org/docs` and "Agent Pass Portal" → `https://auth.world.org/portal` (https://ethglobal.com/events/mumbai/prizes/world). The docs themselves never use the words "Agent Pass". They call it **World IdP / World ID "human continuity"**.
- It is an **OpenID Connect provider**. People authenticate with a World ID proof (Orb or Selfie Check) or an enrolled passkey, and "World IdP makes the authentication result available through OpenID Connect (OIDC), keeping the underlying World identity and proof private" (https://auth.world.org/docs).
- Identity = a **pairwise `sub`**: stable per World ID account per *sector*. Store `(iss, sub)` (https://auth.world.org/docs/guides/id-token).
- Agent features:
  - **step-up**: "fresh authentication at the moment" via `max_age=0` + an essential `acr` claim
  - **human checkpoints**: pause the agent workflow, resume after the backend validates
  - **Device Authorization Grant** for headless agents
  - MCP authorization, and Cross-App Access (XAA, refresh tokens via `offline_access`)
  - Sources: https://auth.world.org/docs/guides/getting-started, https://auth.world.org/docs/guides/step-up
- **No SDK.** The docs say to use any OIDC library. Recommended: `openid-client` **6.8.9** (npm, 2 Nov 2026) on the backend. *Library choice is ours; World names none.*
- Live discovery (`https://auth.world.org/.well-known/openid-configuration`, fetched 6 Nov):

| Item | Value |
|---|---|
| Endpoints | authorize `/api/v1/authorize`, token `/api/v1/token`, device `/api/v1/device_authorization`, userinfo, revoke, jwks `/.well-known/jwks.json` |
| Grants | `authorization_code` and `urn:ietf:params:oauth:grant-type:device_code` only. No refresh outside XAA, no client credentials. |
| Scope | `openid` (optionally `email`) |
| Claims | `iss, sub, aud, exp, iat, jti, nonce, auth_time, acr, amr` |
| `acr_values_supported` | `https://world.org/oidc/acr/orb`, `…/orb-face`. Docs also define `…/selfie`, `…/selfie-face`, but **they are not in live discovery**. |
| PKCE | S256 required (also for confidential clients) |
| Client auth | `client_secret_basic` (portal default), `client_secret_post`, `private_key_jwt` (RS256). Secrets start `worldidp_client_secret_` and are shown once. |
| ID token | RS256. `amr: ["pop"]` = World proof; `["pop","face","user"]` = with Face Auth; `["pop","user","mfa"]` = passkey, **not a fresh proof** |

- **Registration**: in the portal, signing in with **Google**. Self-service eligibility can be restricted (`account_not_eligible`). Use an exact HTTPS callback URL, with no wildcards. The client-auth method is fixed for the client's lifetime (https://auth.world.org/docs/guides/app-registration).
- **Optional coding-agent MCP**: `claude mcp add --transport http --scope user world-id-developer https://auth.world.org/mcp/developer`, then `/mcp` to log in (https://auth.world.org/docs/guides/coding-agent-setup). OAuth playground: https://oauth-playground.toolsforhumanity.dev/.

### 2.2 Mocked proofs at this event
- Prize page: "We are mocking proofs now, so you don't need sandbox app anymore" and "Proofs are using fake identities, DO NOT rely in them for production" (https://ethglobal.com/events/mumbai/prizes/world).
- Normally, testing needs `https://sandbox.auth.world.org`, a TestFlight sandbox World ID app (on request) and a ~1 h identity issuance wait (https://auth.world.org/docs/guides/testing).
- **UNVERIFIED**: exactly how the mock surfaces (production issuer with mock proofs? which app?). **Ask at the World booth in the first hour.** Also confirm:
  - your Google account is allowed to register in the portal
  - that `acr=orb` is returned for mock identities

### 2.3 Flow mapped to the track requirements

| Track requirement | World IdP mechanism (source: step-up and oidc guides) |
|---|---|
| Request | The backend saves a **pending operation**: account, linked `(iss,sub)`, exact action/amount/destination, expiry, `state`, `nonce`, PKCE verifier. Then it redirects to `/api/v1/authorize` with `max_age=0` and `claims={"id_token":{"acr":{"essential":true,"value":"https://world.org/oidc/acr/orb"}}}`. **Headless agent:** POST `/api/v1/device_authorization` and show the human `user_code` / `verification_uri_complete`. |
| User completion | The person approves in World App, or with a passkey. |
| Validated result | Backend checks: callback `state`, `iss`, one-time code redemption (codes live 5 min), ID token signature/aud/exp/nonce, `acr` ∈ accepted, `amr` (reject passkey-only if a fresh proof is required), `auth_time` belongs to this attempt, `(iss,sub)` matches the linked identity. |
| Protected action | Mark the approval used **in the same DB transaction** that authorizes the spend. Then execute. |
| Denied / expired / cancelled | Browser: an authorization error redirect (with `iss`). Device poll: `access_denied`, `expired_token` (device code lives **20 min**), `invalid_grant` → stop. `503` is **never** approval. Wrong account → mismatch → blocked. Checking status must not extend the expiry. |
| Backend validation | ID token never trusted from the client; secret stays server-side; keep tokens/`sub` out of model messages (id-token guide). |

**Limits to know:**
- `binding_message` / action text is **not** shown on the approval page or signed into the token. Show the action in our own UI and record approval ourselves (oidc guide, device profile table).
- RFC 9470 challenge (`WWW-Authenticate: Bearer error="insufficient_user_authentication", max_age="300", acr_values=…`) is documented for an API/MCP resource that needs a fresh human (step-up guide).

### 2.4 Integration sketches

**A. Buyer agent needs fresh human approval above a threshold** (fits Hedera "human-in-loop above a threshold" extra points; sub-threshold x402 calls stay fully autonomous, as the Hedera track requires)
```ts
// server: policy check before any spend
if (amountUsd > POLICY.autoApproveMaxUsd) {
  const att = await db.approvals.insert({ buyerId, action: {kind:"payout", amount, payTo, taskKey},
    status: "pending", expiresAt: now()+10*60e3 });
  const dev = await post(DISCOVERY.device_authorization_endpoint,
    { scope: "openid", claims: JSON.stringify({id_token:{acr:{essential:true,value:"https://world.org/oidc/acr/orb"}}}) },
    clientAuth);                                           // device grant: nonce/max_age ignored, always fresh
  await db.approvals.update(att.id, { deviceCode: enc(dev.device_code) });
  notifyBuyer(att.id, dev.verification_uri_complete, dev.user_code, att.action); // UI shows exact action
  return { status: "awaiting_human", approvalId: att.id };   // agent pauses
}
// poller: authorization_pending → wait; slow_down → +5s; access_denied|expired_token|invalid_grant → mark denied/expired, action never runs
// on tokens: validate id_token (iss=https://auth.world.org, aud=client_id, RS256 via jwks), acr==orb, amr includes "pop",
// (iss,sub) == buyer.linkedWorldId; then in ONE tx: approvals.status='used' + reserve spend → execute HTS transfer
```

**B. Contributor must be a unique human before claiming a paid task**
- Agent Pass gives a stable pairwise `sub`, not a one-use nullifier. **OIDC authentication stays repeatable**, and World says to "enforce your own rule with atomic consumption" (getting-started).
- Steps:
  1. Browser auth-code flow with `acr=orb` (or orb+selfie if lower assurance is acceptable; Selfie "does not provide a strict one-person-one-account guarantee", id-token guide).
  2. Validate the token.
  3. `INSERT INTO claims(task_id, world_iss, world_sub) … UNIQUE(task_id, world_iss, world_sub)`, plus a global `UNIQUE(world_iss, world_sub)` on contributor accounts. That gives one account per human and one claim per human per task.
- Put only a salted pseudonym on Arkiv, never `sub`.

### 2.5 Agent Pass vs IDKit 4.x for ADX

| | Agent Pass (World IdP OIDC) | IDKit 4.6.0 (`@worldcoin/idkit` + `@worldcoin/idkit-server` 1.2.0, research/02) |
|---|---|---|
| Primitive | Repeatable authentication, pairwise `sub`, `auth_time`/`acr` freshness | One-use ZK proof; nullifier per (app, action); optional `signal` binding |
| Best ADX moment | **Buyer approval of agent spend** (step-up / device grant), returning-contributor recognition | **Contributor claim uniqueness** (`UNIQUE(action,nullifier)`, signal = claim id) |
| Integration | Plain OIDC + Google-registered portal client; device grant for agents | RP signing key + widget + forward to `developer.world.org/api/v4/verify/{rp_id}` |
| Prize | **$5,000, 3 places**, agent-focused | $2,500 split 2 × $1,250 |
| Mock note | Proofs mocked; no sandbox app needed | Simulator + staging action |

**Recommendation: Agent Pass.**
- It fits ADX's differentiator ("an AI agent as buyer under a spending policy") and pays twice as much with three places.
- Use it for both moments: device-grant checkpoint for buyer spends above the threshold, and auth-code sign-in + `UNIQUE(task, sub)` for contributor claims.
- Submit to both World tracks only if IDKit is genuinely used for something (e.g. a one-use nullifier at claim). Don't bolt it on.

---

## 3. Swarm for a production-style app

### 3.1 bee-js (VERIFIED from the npm tarball)
- `@ethersphere/bee-js` **13.2.0** (latest, npm modified 27 Oct 2026). Engines: Bee **2.8.3**, Bee API 8.2.0. Ships a browser bundle (`dist/index.browser.min.js`). Network option: `'gnosis' | 'sepolia'` (TTL maths only).
- **v13 uses namespaces.** Ignore older doc snippets that use `bee.uploadFile` / `bee.buyStorage` (still shown on https://docs.ethswarm.org/docs/develop/upload-and-download). The namespaces are:
  - `bee.file.upload|download|downloadReadable`
  - `bee.data.upload|download`
  - `bee.collection.upload|uploadFromFileList|stream`
  - `bee.storage.buy|getCost|extendSize|extendDuration`
  - `bee.grantee.create|get|patch`
  - `bee.feed.makeWriter|makeReader|createManifest|fetchLatestUpdate`
  - `bee.rollingFeed`
  - (from `dist/types/modules/*.d.ts`; docs at https://bee-js.ethswarm.org/docs/upload-download/)
- `UploadOptions`: `encrypt?`, `act?`, `actHistoryAddress?`, `deferred?`, `redundancyLevel?`.
- **Encryption:** `encrypt: true` returns a **128-hex reference = 64-hex address + 64-hex decryption key**. "Anyone who holds the full 128-character reference can decrypt" (https://docs.ethswarm.org/docs/develop/tools-and-features/store-with-encryption).
  - Swarm docs: "Never use public gateways when requesting full encrypted references… Run your own node" (same page).
  - Docs also say encryption is "disabled by default on all Swarm gateways", but **our live probe got a 128-hex ref back from `api.gateway.ethswarm.org` with `Swarm-Encrypt: true` (6 Nov)**.
  - Decryption happens in the Bee node/gateway that you send the full ref to, so **a gateway download hands the key to the gateway operator**.

### 3.2 Postage batches: testnet vs mainnet

| | Testnet | Mainnet |
|---|---|---|
| Chain | **Sepolia** (sBZZ + Sepolia ETH) | Gnosis Chain (xBZZ + xDAI gas) |
| Getting tokens | "sBZZ: Buy on Uniswap (Sepolia testnet selected…)" (https://docs.ethswarm.org/docs/bee/installation/fund-your-node/) | xBZZ from exchanges (same page) |
| Requires | Your **own Bee node** on testnet (light node) | Own node, **or** Beeport (buys BZZ cross-chain + stamps, but it is a Next.js app you run against your *own* Bee node: https://github.com/ethersphere/beeport) |
| Cost | Testnet tokens | Example: `bee.storage.getCost(1 GB, 1 day)` ≈ **0.325 BZZ** "at time of writing" (https://bee-js.ethswarm.org/docs/storage/). swarm-cli example: depth 20 / amount 1e8 ≈ 0.010 BZZ, 4 GB, ~5.8 h (https://docs.ethswarm.org/docs/develop/tools-and-features/buy-a-stamp-batch). Min depth 17. Min amount = 24 h of storage. **Live price UNVERIFIED**: call `getCost` at build time. |

### 3.3 Hosted options without our own Bee node
- **Swarm Foundation API gateway `https://api.gateway.ethswarm.org`** (live probe, 6 Nov 2026):
  - `POST /bytes` with a dummy `swarm-postage-batch-id` → **201** + reference. The gateway stamps uploads **with its own batch** and ignores yours.
  - Read-back via `GET /bytes/<ref>` → 200.
  - CORS: `Access-Control-Allow-Origin: *`. Allowed headers include `Swarm-Encrypt`, `Swarm-Collection`, `Swarm-Postage-Batch-Id`, `swarm-deferred-upload`. **No ACT headers, no `Swarm-Pin`**, so browser-direct upload works but ACT doesn't.
  - Matches the third-party write-up https://swarm.snaha.net/docs/public-gateway/ (Swarm ID, measured 15 Sep 2026): no `/stamps` or `/node` endpoints, retention unknown, shared and rate-limited, "use it for development, demos and hackathons".
  - **Size limit for 10–50 MB: UNVERIFIED** (we only uploaded ~50 B). **Problem for the bonus:** `/arkiv/swarm.md` must name "the postage stamp batch ID… and the wallet that bought it (or who gave you the batch)", and through the gateway we don't know the batch.
- **ETHGlobal Mumbai hackathon batch or gateway: UNVERIFIED.** We found nothing published. The Arkiv bonus wording "(or who gave you the batch)" suggests the booth hands batches out. **Ask the Arkiv/Swarm booth first.**
- Fallback: run a Bee light node ourselves (Docker on the shared Contabo box), fund it (Gnosis xDAI + xBZZ, or Sepolia sBZZ for testnet), buy one small batch, and point bee-js at it. Docs and a `/swarm` Claude skill pack cover it: https://github.com/ethersphere/swarm-quickstart-skills (via https://docs.ethswarm.org/docs/develop/tools-and-features/ai-agent-skills). There is also `ethersphere/swarm-mcp` (https://github.com/ethersphere/swarm-mcp), not evaluated.

### 3.4 ACT (sharing with one buyer)
- **Requirements:**
  - "A Bee light node running with synced postage batch data"
  - grantees are **Bee node public keys**
  - the downloader passes `act-publisher`, `act-history-address` and `timestamp` *to a Bee node that holds a grantee key*
  - Sources: https://bee-js.ethswarm.org/docs/act/, https://docs.ethswarm.org/docs/develop/act
- Revocation is **not retroactive**.
- ACT works on `/bzz` and `/bytes` only (not `/chunks` or `/soc`, as of Bee 2.8.3).
- **Verdict:** ACT needs both the publisher and the buyer to run Bee nodes, and the public gateway's CORS refuses ACT headers. Not viable for a browser buyer in 36 h.
- **Recommended pattern instead:**
  1. Our backend encrypts the clip with AES-256-GCM using a per-clip key.
  2. Upload the **ciphertext unencrypted** (plain 64-hex ref, safe to put in Arkiv `storageRef`).
  3. Wrap the per-clip key to the buyer's public key (ECIES/X25519) and deliver it off-Arkiv after x402 payment.
  4. Optionally put only the *wrapped* key on Arkiv. That is allowed ("encrypt it first"), but off-Arkiv is simpler.
- This meets the Arkiv rule: **never put a raw 128-hex encrypted Swarm reference in a public entity** (https://ethglobal.com/events/mumbai/prizes/arkiv).

### 3.5 Upload size and speed, browser, feeds
- **Size/speed for 10–50 MB clips: UNVERIFIED.** No official numbers found. A benchmark tool exists (https://github.com/ethswarm-tools/bee-bench). Measure a 10 MB upload in hour 1.
- Batch utilisation: a batch counts as full when any bucket fills, so buy depth ≥ 20 for comfort (buy-a-stamp-batch page).
- **Browser:** `bee.file.upload(batchId, file)` accepts a browser `File`, and `uploadFromFileList` is browser-only (bee-js upload docs). Browser → gateway works (CORS `*`). Browser → our own node needs CORS + auth in front, never an open node.
- **Feeds:** `bee.feed.makeWriter(topic, signer)` / `makeReader(topic, owner)` + `createManifest` give a stable reference that can be updated, e.g. a per-dataset manifest. Put the feed's manifest ref in Arkiv (https://docs.ethswarm.org/docs/develop/tools-and-features/feeds). Feed writes through the public gateway are **UNVERIFIED** (Swarm ID issue #516 asks the same: https://github.com/snaha/swarm-id/issues/516).
- **Suggested ADX use of Swarm (cheap, honest):** encrypted-ciphertext clips (or public sample previews) + a dataset manifest feed. The Arkiv `adx.submission.storageRef` holds only the plain 64-hex ref of the ciphertext.

---

## 4. Hedera x402, current state (re-verified 6 Nov)

| Item | Value | Source |
|---|---|---|
| `@x402/core`, `/hedera`, `/fetch`, `/next`, `/express` | **2.30.0** (published 4 Nov 2026) | `npm view`. Changelog: deps-only bump: https://github.com/x402-foundation/x402/blob/main/typescript/packages/mechanisms/hedera/CHANGELOG.md |
| Hedera scheme package | `@x402/hedera`, subpaths `exact/client`, `exact/server`, `exact/facilitator`, class `ExactHederaScheme`, network `hedera:testnet`. Deps: `@x402/core ~2.30.0`, **`@hiero-ledger/sdk` 2.90.1 (pinned)**, `@hiero-ledger/proto` 2.32.0 | npm; https://github.com/x402-foundation/x402/tree/main/typescript/packages/mechanisms/hedera |
| `@hiero-ledger/sdk` latest | 2.90.1, matches the pin | npm |
| `@hashgraph/hedera-agent-kit` | 4.2.0 (28 Oct) | npm |
| Facilitators, live `GET /supported` 6 Nov (x402 v2, `exact`, `hedera:testnet`) | `https://x402.org/facilitator` (feePayer `0.0.9185802`) · `https://testnet.facilitator.launa.dev` (`0.0.9839454`) · `https://api.testnet.blocky402.com` (`0.0.7162784`) | live probe; listed at https://docs.hedera.com/solutions/ai/x402/facilitators |
| Official x402 example repos with Hedera | **None** in x402-foundation (Hedera appears only in the package, spec and e2e config) | GitHub tree of x402-foundation/x402 |
| hedera-dev example | `hedera-dev/x402-inference-pay-per-request-poc` (pushed 15 Jul 2026, uses `@x402/*` ^2.18) has **no licence**, so read it, don't copy it. `hedera-dev/tutorial-a2a-x402-trustless-agent` (Dec 2025, older). | https://github.com/hedera-dev/x402-inference-pay-per-request-poc |
| Hedera Skills plugin (the Thursday workshop "Hedera X Claude Code – AI Skills", Pathorn Teng, video https://www.youtube.com/watch?v=ZL3n_m8VWus) | Repo **`hedera-dev/hedera-skills`** (Apache-2.0, pushed 3 Sep 2026). Install: `/plugin marketplace add hedera-dev/hedera-skills` then e.g. `/plugin install native-services-js` (or `npx skills@latest add hedera-dev/hedera-skills`). Plugins: `agent-kit-plugin` 2.0.0 (includes `agent-kit-policy`, `agent-kit-hook`), `native-services-js` (HTS + HCS), `hackathon-helper` (`hackathon-prd`, `validate-submission`), `system-contracts`, `oracles`, `cross-chain`, `hiero-cli`, `hedera-harness`, `dev-intelligence`. **No x402 skill.** | https://github.com/hedera-dev/hedera-skills, `.claude-plugin/marketplace.json`; https://hedera.com/blog/hedera-mcp-agent-skills/ |
| Hedera hosted MCP (also in the workshop) | `claude mcp add --transport http hedera-testnet https://agentic-testnet-mcp.hedera.com/mcp` | https://docs.hedera.com/solutions/ai/hosted-mcp-server |

The workshop transcript confirms the "plugin marketplace add Hedera skills" flow and an MCP connection. That the MCP shown was the hosted one is **UNVERIFIED** (the auto-transcript is noisy).

---

## 5. Actions for the team (first hour)
1. **World booth:**
   - How do mocked proofs work (issuer, app)?
   - Can our Google account register?
   - Can one project win both IDKit and Agent Pass?
2. **Arkiv/Swarm booth:** is there a hackathon postage batch or a gateway? What upload size limit does it have?
3. Smoke test: a World IdP device grant from a Node script with `openid-client`. Test the success, deny and expire paths.
4. Smoke test: a 10 MB ciphertext upload to the chosen Swarm endpoint. Time it.
5. Install `hedera-skills` (`native-services-js`, `agent-kit-plugin`) in `adx/`.
