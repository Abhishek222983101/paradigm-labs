# Paradigm — Product

*Paradigm (Agentic Data Exchange). "ADX" below is the internal code name.*

## One line
A robot company's AI agent buys exactly the demonstrations its model fails on, one per verified human. It pays each person directly in USDC on Hedera, and every clip's licence lives on Arkiv, owned by the person who filmed it.

## The problem
- Embodied-AI teams need real-world manipulation video, and they need **diversity** more than volume (Encord: "diversity matters more than volume"; Figure says vendors "couldn't hit the diversity bar").
- Today the data comes from closed vendors with private databases. Buyers can't check who filmed what, how many distinct people are in a dataset, or whether a clip was sold twice.
- Fake accounts don't just steal payouts: a few hundred people behind thousands of accounts silently skew a dataset.
- Contributors have no say once a clip is sold. India's DPDP Consent Manager rules start 13 Nov 2026; consent that can be checked and withdrawn is becoming a requirement.

## Who it's for
| User | What they do | What they get |
|---|---|---|
| **Buyer agent** (robotics team's AI) | Reads its model's failure cases, posts paid tasks, pays for accepted clips | Exactly the data it needs, with a public count of distinct humans and checkable licences |
| **Buyer's human** | Sets the budget and approves spends above a threshold on their phone | Control without babysitting the agent |
| **Contributor** (anyone with a phone) | Claims a task, films a 15–30 s clip, gets paid | USDC per accepted clip, and ownership of their clip's licence |
| **Any outside agent / auditor** | Queries Arkiv directly | Open, signed, expiring records without asking us for access |

## How it works (one task, end to end)
1. **Post.** The buyer agent turns a failure case into a task ("fold a towel, top-down, 3 attempts") with N slots, a reward and a deadline. It's written to Arkiv as `adx.task`, expiring at the deadline.
2. **Claim.** A contributor opens the task on their phone and proves they're a unique human with World ID (IDKit, Selfie Check). One human, one slot per task. The claim is an `adx.claim` entity that expires when the claim window closes.
3. **Record.** The phone records the clip in the browser, with a random spoken word and finger count as a liveness challenge. The clip is encrypted on our side and uploaded to Swarm through our own Bee node.
4. **Verify.** The worker checks the clip: duplicate check (perceptual hash against every submission on Arkiv, across all buyers), then AI review (Gemini 3 Flash watches the full clip with sound) against the task rubric with timestamped evidence; plain code makes the final accept/reject/review decision. The verdict is an `adx.verification` entity signed by the verifier wallet.
5. **Pay.** The buyer agent finds the paid endpoint and pays it over x402 on Hedera, with no human approving, within its spending policy. Above the threshold it pauses and asks its human to approve with World ID Agent Pass (Orb + fresh face check). After settlement the decryption key is released, and an `adx.receipt` entity links the HashScan transaction.
6. **Own.** The contributor holds an `adx.licence` entity for their clip. Before using a clip, the buyer agent checks that the licence is still live. If the contributor withdraws it, the clip drops out of the dataset, and anyone can see that on Arkiv.

## Why this beats what exists
| | Skarl (Cal Hacks 13.0) | WorldMod | Vangrid | **ADX** |
|---|---|---|---|---|
| Buyer is an AI agent under a spend policy | No (human buyer) | No | Partly | **Yes** |
| Real contributor payout | No (never closed the loop) | Yes | Yes | **Yes, x402 on Hedera with a HashScan proof** |
| One human per slot | No | Yes | No | **Yes (World ID) + public "N distinct humans" count** |
| Open records any agent can query | No (private DB) | No | No | **Yes (Arkiv)** |
| Contributor-owned, withdrawable licence | No | No | No | **Yes (Arkiv ownership + expiry)** |
| Cross-buyer duplicate detection | Per-buyer only | Per-app | No | **Across all buyers, on open records** |

## In scope for the hackathon
- Web app (mobile-first, installable): task board, claim, record, my earnings, my licences
- Buyer console: budget and policy, live tasks, spend log, approvals
- Buyer agent (Node, Claude Haiku for task text): posts tasks, discovers and pays the x402 endpoint, checks licences
- Worker: duplicate check, AI verification, Swarm upload, Arkiv writes
- Outside-agent proof: a `curl` / CLI query against Arkiv that shows the same state as our app
- All sponsor deliverables: `/arkiv/*.md`, README with tx IDs, World debrief, AI usage

## Out of scope
No token or NFT, no native mobile app, no multi-chain, no robot telemetry, no legal licence automation, no high-value payouts without a human approval.

## Success criteria
- One full task runs live: post, claim with World ID, record, verify, pay over x402, receipt, licence check, withdrawal.
- A second claim by the same human is rejected; a cancelled approval blocks the payment.
- Every record the app shows can be fetched from Arkiv with a query we print in the README.
- Measured verifier accuracy on a 16-clip test set, reported honestly.
