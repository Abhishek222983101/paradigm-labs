# 01 — Product Requirements Document (PRD)

> Companion doc. **Source of truth: `docs/build/SYSTEM-ARCHITECTURE.md`.** If anything here conflicts with it, the system architecture wins; flag the conflict instead of guessing.

## Product name and one-sentence idea
**Paradigm (Agentic Data Exchange; code name ADX):** robot teams' AI agents buy exactly the real-world demonstrations their models fail on, one per verified human, paying each person in USDC on Hedera, with every task, verdict, receipt and licence as an open Arkiv record.

## Target users
| User | Who | What they need |
|---|---|---|
| Buyer agent | A robotics/embodied-AI team's AI | Targeted, diverse, verifiable training clips without vendor contracts |
| Buyer's human | The team lead who owns the budget | Control over spend without approving every purchase |
| Contributor | Anyone with a phone (students, gig workers) | Quick paid tasks, fair payment, control over their own footage |
| Outside agent / auditor | Other buyers, researchers, regulators | Checkable records without asking us |

## Problem and current workaround
Robot teams need many short demonstrations from **different** people for the exact tasks their model fails at. Today they sign bulk contracts with closed data vendors, pay upfront for hours of footage, and can't verify who filmed what, how many distinct people are in the set, whether a clip was sold twice, or whether consent still holds. Fake accounts quietly skew datasets.

## Goal and success measure
- **Goal:** one full, real loop at the hackathon: agent posts → human claims with World ID → records → AI verifies → agent pays over x402 → contributor owns the licence → anyone can query it on Arkiv.
- **Success signals:** at least one settled x402 payment with a HashScan link; every record in the UI fetchable by a public Arkiv query; duplicate claim and denied approval both blocked; measured verifier accuracy on 16 clips; all sponsor checklists ticked (system architecture §20).

## Core features
| # | Feature | User benefit | Priority |
|---|---|---|---|
| F1 | Agent posts tasks from failure cases (Arkiv `adx.task`, expires at deadline) | Buyers get exactly the data they lack | P0 |
| F2 | Task board read live from Arkiv | Contributors see real, open, paid work | P0 |
| F3 | Claim with World ID (one human per slot) | Fair access; diverse datasets | P0 |
| F4 | In-browser recorder with liveness challenge | No app install; no replayed videos | P0 |
| F5 | AI verification (Gemini, code decides) with timestamped evidence and live status | Fast, explainable accept/reject | P0 |
| F6 | Cross-buyer duplicate detection via Arkiv fingerprints | Buyers never pay twice for the same clip | P0 |
| F7 | Encrypted clip storage on Swarm (our node, our batch) | Clips stay private until paid | P0 |
| F8 | x402 purchase on Hedera, automatic under policy | Agents pay per clip, no checkout | P0 |
| F9 | Spending policy + Agent Pass approval above threshold | Spend control a prompt can't bypass | P0 |
| F10 | Contributor-owned licence entity + withdrawal | Consent that's checkable and revocable | P0 |
| F11 | Outside-agent query script + explorer page | Proof the data is open | P0 |
| F12 | Buyer console (policy, live feed, approvals, HCS spend log) | One place to watch the agent | P1 |
| F13 | Embedded wallet with passkey | Zero-install onboarding | P1 (fallback: device key) |
| F14 | Dataset manifest with distinct-human count | Diversity becomes a public number | P1 |
| F15 | HCS-14 agent identity profile | Agent reputation | P2 (stretch) |

## Out of scope for version one
Native mobile app · tokens/NFTs · multi-chain · robot telemetry · legal licence automation · training models · payouts above threshold without human approval · mainnet.

## User stories
- As a **buyer agent**, I want to post a task for a failure case, so I can collect exactly the demonstrations my model lacks.
- As a **buyer agent**, I want to pay automatically for accepted clips within my budget, so I can work without a human approving every purchase.
- As a **buyer's human**, I want any payment above my threshold to wait for my approval on my phone, so the agent can't overspend.
- As a **contributor**, I want to claim a task by proving I'm human without creating an account, so I can start in under a minute.
- As a **contributor**, I want to see why my clip was accepted or rejected with timestamps, so I trust the result.
- As a **contributor**, I want to own and withdraw the licence for my clip, so I stay in control of my footage.
- As an **outside agent**, I want to query tasks, verdicts, receipts and licences directly, so I don't depend on ADX's API.

## Acceptance criteria
- Given an open task, when the agent posts it, then it appears on the board within 10 s and on the Arkiv explorer.
- Given a contributor who already holds a slot, when they claim the same task again with World ID, then they see "You already hold a slot on this task" and no claim is written.
- Given a recorded 15–30 s clip, when it's uploaded, then the status page shows each check live and a verdict with timestamped steps within ~30 s.
- Given a re-encoded copy of an accepted clip, when uploaded, then it's rejected as a duplicate with the matching submission key.
- Given an accepted clip priced at or under the threshold, when the agent requests it, then it pays over x402 with no human, receives the key, and a receipt + licence appear on Arkiv after settlement.
- Given a payout above the threshold, when the human denies or lets the approval expire, then no payment happens and the console says why.
- Given a contributor's licence, when they withdraw it, then it disappears from Arkiv and the agent drops the clip on its next pass.
- Given the outside-agent script, when run on another machine, then it prints the same records the UI shows.

## Open questions
Tracked in `~/ethglobal-mumbai/03-DECISIONS-AND-OPEN-QUESTIONS.md` and the 🧪 spikes in the system architecture (per-request payTo, dynamic x402 price, Hedera alias auto-associations, Agent Pass device flow, Bee batch usability). Team roles: parked.
