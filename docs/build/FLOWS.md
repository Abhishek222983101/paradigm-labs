# ADX — Flows

Every user-facing step, with what triggers it, what the user sees while it runs, on success and on error. "Arkiv" = Rabdi testnet. All Arkiv writes go through the write guard.

## F1. Buyer agent posts a task
| Step | Actor | What happens | Arkiv / chain |
|---|---|---|---|
| 1 | Agent | Reads a failure case from `failures.json` (e.g. "towel corners missed, top-down view") and drafts a task with Claude Haiku: title, rubric, slots, reward, deadline | — |
| 2 | Agent | Policy check: reward × slots ≤ remaining budget | — |
| 3 | Agent | Uploads the rubric JSON to Swarm (public) and hashes it | Swarm ref |
| 4 | Agent | Writes the task | `adx.task` (owner buyer, expires at deadline) |
| 5 | Console | Task appears in the buyer console and on the public board | read: `adx.task` where status=open, ownedBy buyer |

- **Error:** budget exceeded → agent logs "skipped: over budget" to the spend log and doesn't post.

## F2. Contributor claims a slot (World IDKit)
| Step | Screen | Loading | Success | Error |
|---|---|---|---|---|
| 1 | Task board (reads Arkiv) | Skeleton cards | Open tasks with reward, slots left, time left (from `$expiresAt`) | "Can't reach Arkiv, retrying" |
| 2 | Task detail → **Claim** | — | IDKit sheet opens (Selfie Check) | — |
| 3 | World App / Simulator proof | "Waiting for World ID…" | Backend verifies `POST /api/v4/verify/rp_15b590932690a33e`, inserts nullifier into Neon `UNIQUE(task, nullifier)` | **Cancelled:** "Verification cancelled. No slot was taken." |
| 4 | Backend writes claim | "Reserving your slot…" | `adx.claim` (2 h expiry), liveness challenge shown: "Say **'mango'** and hold up **3** fingers" | **Same human again:** "You already hold a slot on this task." · **Slots full:** "All slots are taken." |

## F3. Record and upload
| Step | Screen | Loading | Success | Error |
|---|---|---|---|---|
| 1 | Recorder (back camera, 15–30 s, countdown) | — | Preview with retake / submit | Camera blocked → instructions to allow it |
| 2 | Upload | Progress bar (presigned PUT to Neon storage) | "Uploaded. Checking your clip…" | Network drop → resumable retry |
| 3 | Status card | Live steps: duplicate check → AI review → stored on Swarm → recorded on Arkiv | Verdict card with score and timestamped reasons | — |

Notes: `MediaRecorder.start(1000)` (iOS freeze bug), mp4 with webm fallback, max 30 s.

## F4. Worker verifies (no UI, drives F3 status)
1. Pull the job from Neon; the raw clip is already on the worker's disk from the upload.
2. ffprobe: duration 15–35 s, video + audio present.
3. In parallel: (a) ffmpeg 3 frames → sharp dHash → Arkiv `adx.submission` bucket query across all buyers → Hamming < 10 = duplicate → reject "matches an existing clip"; (b) Gemini 3 Flash watches the full clip with audio against the rubric and liveness challenge, strict JSON schema, temperature 0.
4. Code rules: wrong word or finger count → reject; missing step → reject; not_visible / low confidence / impossible timestamps → `review`; else accept.
5. AES-256-GCM encrypt → upload ciphertext to our Bee node with batch `c0cc5436…` → plain 64-hex ref.
6. Store the key in Neon. Delete the raw clip.
7. Write `adx.submission` (platform) and `adx.verification` (verifier) in parallel. Patch the claim to `submitted`.

## F5. Buyer agent pays (Hedera x402) — auto path
| Step | What happens |
|---|---|
| 1 | Agent watches `adx.verification` where verdict=accept, task in its tasks, ownedBy our verifier |
| 2 | Agent finds the verifier's endpoint from `adx.verifier` (status=live) and checks: listing owner = verifier wallet, `payTo` in the 402 = listing `payTo` |
| 3 | `GET /api/x402/clip/:submission` → **402** with price (only if verdict = accept; rejected clips return 404) |
| 4 | Policy: price ≤ per-clip cap, daily spend ≤ budget, payee on allowlist, price ≤ approval threshold → pay automatically |
| 5 | Facilitator settles USDC on Hedera → after-settle hook writes `adx.receipt` (`approval=auto`, `mode=live`), creates `adx.licence` and transfers it to the contributor, logs the spend to HCS |
| 6 | Response: decryption key + Swarm ref. Agent downloads, decrypts, checks `cipherSha256` against Arkiv |

## F6. Above threshold — human approval (World Agent Pass)
| Step | Agent | Buyer's human (phone) |
|---|---|---|
| 1 | Price > threshold (e.g. bonus payout $50) → creates a pending approval bound to exact amount + payee + clip (hash), starts a device authorization at auth.world.org | — |
| 2 | Shows / pushes the approval link with the user code | Opens the link: "ADX agent wants to pay **50 USDC** to **contributor #2** for **clip T-042/2**" |
| 3 | Polls the token endpoint | Approves with World ID (Orb + face check, fresh) |
| 4 | Backend validates the id_token (iss, aud, acr = orb-face, auth_time ≤ 5 min, approver on allowlist, hash matches) → pays → receipt `approval=agent-pass` | Sees "Approved · paid" with the HashScan link |
| **Denied / cancelled / expired** | `access_denied` / `expired_token` (20 min) → no payment, status "Approval denied, nothing paid" logged to HCS | Sees "You declined. Nothing was paid." |

## F7. Licence check and withdrawal
1. Contributor opens **My licences**: each clip's `adx.licence` (owned by their embedded wallet) with licensee, term and time left.
2. **Withdraw** → their wallet deletes the entity (signed in the browser, gas pre-funded).
3. Before building its dataset, the buyer agent queries live licences for each clip it holds. A missing licence → the clip is dropped, and the manifest `humans`/`samples` counts update.
4. Outside proof: `scripts/ops/outside-agent.ts` (and a `curl`) shows the same licence list straight from Arkiv.

## F8. Outside agent (independent read)
A separate script, sharing no code or API with our app beyond the public schema names, queries Arkiv for: open tasks from our buyer, verdicts owned by our verifier, receipts, live licences. It prints the same state our UI shows, with explorer links.

## Cross-cutting rules (apply to every flow)

### State machines
| Object | States (positive values only, so Arkiv can filter without NOT) | Who moves it |
|---|---|---|
| Task | `open` → `filled` (or expires at deadline) | Buyer agent |
| Claim | `active` → `submitted` (or expires after 2 h) | Platform |
| Submission | `pending` → `accepted` / `rejected` / `review` | Worker |
| Payment (Neon) | `quoted` → `approving` → `settling` → `settled` / `failed` / `denied` | Payment service |
| Licence | `granted` (exists) → deleted (withdrawn) or expired | Contributor |

### Idempotency and retries
- Every write has an idempotency key (`task:slot`, `submission:id`, `payment:submission`). Re-running a step never creates a duplicate entity or a double payment.
- Arkiv writes are serialised per signer wallet (one queue per wallet) so nonces never collide. Uncertain outcomes (timeout after send) are reconciled by querying for the idempotency key before retrying.
- Worker jobs use `SELECT … FOR UPDATE SKIP LOCKED`, with 3 attempts and exponential backoff, then `review` with the error recorded.
- x402: the handler is pure until settlement. Receipt, licence and key release happen only in the after-settle hook. A failed settlement leaves the payment `failed`, and the agent may retry with a new quote.

### Edge cases we handle
| Case | Behaviour |
|---|---|
| Task expires while a contributor is recording | Upload still accepted for 10 min grace; verdict written; no payment if the task is gone |
| Arkiv testnet reset | `pnpm seed:arkiv` re-creates the verifier listing and demo tasks under a bumped namespace; UI reads the namespace from env |
| Arkiv RPC slow / rate-limited | Reads cached for 5 s server-side; writes queued; UI shows "syncing" instead of failing |
| Clip too short / no audio / wrong orientation | Rejected before AI review with a specific reason |
| Duplicate clip from another buyer's platform | Rejected: "matches an existing clip" with the matching submission key |
| AI provider down | Gemini retry once → `review` (human queue), never a silent accept |
| Swarm upload fails | Retry 3×; raw clip kept in staging until success; status shows "storing" |
| Settlement fails | Payment `failed`, no receipt, no key, agent notified; budget not consumed |
| Approval approved by the wrong account | id_token `sub` not on the approver allowlist → treated as denied |
| Contributor withdraws after payment | Licence gone → buyer's next licence check drops the clip; payment is not reversed (documented in terms) |

### Observability
- Every step emits a structured event (`flow`, `step`, `entityKey`, `txId`, `ms`, `ok`) to the console feed and the logs.
- The buyer console shows the live event feed, so the demo narrates itself.
- Spend decisions (paid, skipped, approval requested, denied) go to the HCS topic as the tamper-evident spend log.
