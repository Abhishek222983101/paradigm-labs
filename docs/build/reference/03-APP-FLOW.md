# 03 — App Flow

> Companion doc. Step-by-step flows with loading/success/error states are in `docs/build/FLOWS.md`; sequences in system architecture §8. This file is the screen map and navigation.

## Entry points
- Contributor: shared link / QR to `https://adx-paradigm.vercel.app/tasks` (or a task deep link `/tasks/<key>`).
- Buyer's human: `/console` (bearer-token link) and the Agent Pass approval link pushed by the agent.
- Judges / outside agents: `/`, `/explorer`, `/proofs`, or the Arkiv RPC directly.

## Screen inventory
| Screen | Route | Purpose | Required data |
|---|---|---|---|
| Landing | `/` | What ADX is, the 7-step loop, live counters | Arkiv counts, Mirror Node totals |
| Task board | `/tasks` | Open tasks | `adx.task` status=open, ownedBy buyer |
| Task detail | `/tasks/[key]` | Rubric, reward, slots left, time left, Claim | `adx.task`, rubric JSON from Swarm, claim count |
| Claim sheet | modal on task detail | World ID (IDKit) | RP signature |
| Challenge card | after claim | "Say MANGO, hold up 3 fingers" + Record button | claim result |
| Recorder | `/record/[claim]` | Camera, countdown, 15–30 s, preview, retake, submit, upload progress | upload token |
| Live status | `/submissions/[key]` | Pipeline steps live, verdict with timestamps, links | SSE events, Arkiv entities |
| Me | `/me` | Wallet, Hedera account, earnings, licences, withdraw | `adx.licence` ownedBy me, Mirror Node |
| Buyer console | `/console` | Policy, live feed, tasks, approvals, spend log | Neon events, Arkiv, HCS via Mirror Node |
| Approve (fallback) | `/approve/[id]` | Browser approval if the device flow isn't used | approval row |
| Explorer | `/explorer` | Named Arkiv queries with code + raw results | Arkiv |
| Proofs | `/proofs` | Every on-chain proof with links | static + live |

## Primary journey (contributor)
`/tasks` → tap task → `/tasks/[key]` → **Claim** → World ID sheet → challenge card → **Record** → `/record/[claim]` → record 15–30 s → **Submit** → upload progress → `/submissions/[key]` → verdict ✅ → (after the agent pays) receipt + licence shown → `/me` lists the licence.

## Primary journey (buyer side)
Agent posts task (no UI) → console feed shows "task posted" → clips arrive → console shows verdicts → agent pays (feed: "paid 3 USDC · HashScan ↗") → bonus above threshold → console shows approval QR → human approves on phone → feed: "approved · paid".

## Alternate journeys
| Case | Result |
|---|---|
| Cancel World ID | Back to task detail, "No slot was taken" |
| Already claimed | Toast "You already hold a slot on this task", button changes to "Record your clip" |
| Slots full / task expired | Disabled Claim, "All slots taken" / "This task has closed" |
| Retake | Discard local recording, back to countdown |
| Upload fails | Auto-retry 3×, then "Try again" button (clip kept locally) |
| Rejected clip | Verdict card with the failed step/reason and "Claim another task" |
| Review | "A human is checking this clip" |
| Approval denied/expired (buyer) | Console: "Declined · nothing paid" |
| Withdraw licence | Confirm dialog → signing → "Licence withdrawn" |

## Per-action spec
Every action specifies trigger, validation, loading, success, error, next screen. Full table in `docs/build/FLOWS.md` (F1–F8).

## Navigation rules
Mobile bottom nav: **Tasks · Record · Me · Console**. Desktop: top nav with the same items + Explorer + Proofs. Back from recorder asks to discard. Deep links work for `/tasks/[key]`, `/submissions/[key]`, `/approve/[id]`. Theme toggle in the header.

## Empty and blocked states
No open tasks: "No open tasks right now. The agent posts new ones as its model finds gaps." · Camera denied: steps to allow it, per browser · Offline: banner, actions disabled · Arkiv slow: "Syncing with Arkiv…" (never fake data) · Wallet locked: "Unlock with your passkey".

## First-use journey
First visit to `/tasks` → short 3-card intro (what you do, how you're paid, you own your clip) → on first Claim: create embedded wallet with a passkey (one tap) → World ID → challenge. No email, no password, no app install.
