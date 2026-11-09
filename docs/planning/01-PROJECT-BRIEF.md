# Agentic Data Exchange — Team Project Brief (full transcription)

> Source: `sources/Agentic_Data_Exchange_ETHGlobal_Mumbai_Project_Brief.pdf` (10 pages, dated 1 Nov 2026).
> This is a section-by-section markdown transcription so it can be grepped and indexed by graft. Wording is kept as close to the PDF as possible. Nothing here is new analysis — see `00-SESSION-BRIEF.md` for synthesis and `research/` for web-verified facts.

**Subtitle:** Project concept, market validation, architecture & ETHGlobal Mumbai strategy
**Prepared for:** team alignment • 1 November 2026 • ETHGlobal Mumbai, 5–7 November 2026

**Working thesis:** Build an agent-native marketplace and settlement layer for human-generated real-world AI training data: buyers describe what they need, contributors capture it, AI evaluates submissions, and policy-controlled agents coordinate payment and licensing.

**Important positioning:** This is a proposed hackathon direction, not a claim that every component is already implemented or commercially validated. Competitors already operate in human-data collection and robotics-data markets. Our opportunity is to demonstrate a differentiated, interoperable agent workflow.

---

## 1. Executive overview

The project addresses a real operational need in AI and robotics: collecting, checking, licensing and paying for human-generated demonstrations and other real-world data. Robotics and embodied-AI teams need data captured in real environments, but sourcing contributors, enforcing capture instructions, reviewing quality, recording consent and settling compensation can be fragmented and expensive.

Our proposed product is not simply another crowdsourcing website. It is an **agent-native procurement and settlement layer** that allows buyers and their software agents to discover tasks, obtain submissions, inspect evidence-linked verification results and settle approved work under explicit spending policies.

### One-line pitch
> "A programmable marketplace where AI agents can source, verify and pay for human-generated real-world training data, with portable records of task requirements, provenance, licensing and settlement."

### What the first demo should prove
- **A buyer can publish a structured data task** with a reward, deadline and acceptance criteria.
- **A contributor can discover and claim it** and submit a real recording through a simple web/mobile flow.
- **AI can assess the submission** and produce a structured report with evidence timestamps and an explicit uncertainty/review path.
- **A policy-controlled payment workflow can settle an approved reward** and link the transaction to the task.
- **Another client can query shared task/verification metadata** without relying solely on our private application database.

**The hackathon demo should complete one end-to-end transaction rather than show many disconnected integrations.**

## 2. Problem and target users

| Participant | Need / pain point |
|---|---|
| AI / robotics buyer | A reliable supply of diverse real-world demonstrations, with clear capture instructions, quality evidence, usage rights and predictable cost. |
| Contributor / data collector | Understandable paid tasks, clear consent and licensing terms, transparent review status, fair dispute handling and timely payment. |
| Data operations provider | Contributor recruitment, task distribution, capture compliance, QA, rejection management, dataset packaging and reconciliation. |
| AI agent / developer | Machine-readable task discovery, pricing, acceptance criteria, provenance, licensing status and programmatic payment interfaces. |

**Initial customer wedge:** start with buyers who need structured human activity video or demonstrations for AI/robotics research. Avoid claiming that ordinary phone videos are automatically robotics-grade data. Some robotics use cases require calibrated cameras, depth, pose, synchronized sensors, trajectories or robot state/action data.

## 3. Product workflow (8 steps)

1. **Buyer creates a task** — Buyer specifies the activity, capture instructions, required metadata, acceptance rubric, reward, deadline, license terms and budget.
2. **Task becomes discoverable** — A structured public task record is written to Arkiv. A buyer dashboard and agent can query open tasks by category, reward, deadline and status.
3. **Contributor claims and captures** — Contributor completes the eligibility/uniqueness check, accepts consent and licensing terms, claims the task and records the activity.
4. **Submission is stored privately** — Video/audio and sensitive metadata go to private object storage. The shared record stores a content hash and controlled reference — not the raw media.
5. **AI evaluates the submission** — A verifier checks the task rubric, produces timestamped evidence and a confidence/result. Low-confidence or disputed cases go to human review.
6. **Payment policy authorizes settlement** — A finance agent checks buyer budget, task status, amount, recipient and policy limits. It proposes or executes only actions allowed by policy.
7. **Payment and receipts are linked** — Approved USDC settlement occurs on the selected chain. The task record links to the transaction and the contributor receives a receipt.
8. **Dataset is packaged** — Accepted submissions are grouped into a versioned manifest with hashes, schema, provenance and license references for the buyer.

## 4. Proposed technical architecture

Use a hybrid architecture. Do not attempt to put the whole application or raw media on-chain. Each component should have a specific job.

| Layer | Proposed technology | Responsibility |
|---|---|---|
| Frontend | Next.js web app; optional Expo/React Native contributor app | Buyer dashboard, task discovery, contributor capture/submission, review and receipts. |
| Private application backend | Convex or PostgreSQL + API layer | Sessions, user profiles, private task operations, notifications, review queues and internal workflow state. |
| Shared marketplace state | Arkiv | Queryable task listings, claims, public status, verification summaries, dataset manifests and content hashes. |
| Media storage | Private object storage (e.g. S3-compatible) | Raw video/audio, access controls, retention and secure download links. |
| AI verification | Gemini or another multimodal model + deterministic checks | Rubric checks, timestamped evidence, confidence and human-review escalation. |
| Agentic payments | Hedera x402 + USDC settlement/policy layer | Paid API access and controlled stablecoin settlement. Keep x402 service payments distinct from contributor payouts. |
| Human uniqueness | World ID / IDKit | Optional Sybil-resistance check before claiming scarce paid tasks; does not prove work quality. |
| Workflow orchestration | Chainlink CRE (optional) | Connect external verification/workflow events to on-chain actions where genuinely needed. |

### Data placement rule
**Arkiv:** public/shared, queryable records that benefit from independent discovery or verification. **Private backend:** application state and sensitive information. **Private object storage:** raw media. **Settlement chain:** payment transactions. **Never put identity documents, private recordings, access tokens or decryption keys in public Arkiv entities.**

### Suggested Arkiv entity types

| Entity | Illustrative fields |
|---|---|
| task | taskId, buyerWallet, category, reward, deadline, rubricHash, licenseTermsRef, status |
| claim | taskId, contributorWallet/pseudonymous ID, claimedAt, status |
| submission | taskId, mediaContentHash, privateStorageRef, submittedAt, captureMetadataHash |
| verification | submissionId, result, evidenceHash, modelVersion, confidenceBand, reviewStatus |
| dataset_manifest | datasetId, submissionIds, schemaVersion, contentHashes, licenseRefs |
| payout_receipt | taskId, recipientWallet, amount, token, chain, txHash |

*These are conceptual schemas, not a promise that Arkiv uses these exact field names or SQL semantics. Implement against the current Arkiv SDK and testnet documentation.*

## 5. Why blockchain is necessary — and where it is not

The blockchain rationale must come from a real multi-party coordination problem. Buyers, contributors, data vendors and independent agents may not want one marketplace operator to be the sole source of truth for task state, ownership, provenance and payment status.

### Useful blockchain roles
- **Arkiv:** shared, wallet-owned, queryable marketplace records and portable references to task, verification and dataset state.
- **Hedera:** stablecoin settlement and x402-based machine-to-machine paid API access, with transaction receipts.
- **World ID:** a privacy-preserving uniqueness signal to make duplicate-account abuse harder for limited paid tasks.
- **Chainlink CRE:** optional orchestration between off-chain events/APIs and on-chain workflows, if the demo genuinely needs it.

### What blockchain does NOT prove
- A transaction does not prove that a video is authentic or that the contributor performed the task correctly.
- An AI model's decision is not automatically correct because its hash is on-chain.
- A wallet address does not prove a contributor's legal identity or ownership of all rights in a recording.
- A public content hash does not establish consent, lawful licensing or data quality.

### Avoid the forced-blockchain trap
If a conventional database controlled by one trusted company is sufficient for the whole product, blockchain may be unnecessary. **The project must demonstrate an actual independent client/agent reading shared Arkiv state and a real on-chain settlement/payment flow.** Do not add extra chains merely to increase the number of logos in the architecture.

## 6. Market landscape and reference products

The market is real, but crowded. Existing companies already collect human demonstrations, provide contributor task flows, run quality checks and sell training data. Our differentiation cannot simply be "we have a marketplace and AI verification."

| Company / product | What to learn from it | Reference |
|---|---|---|
| Waffle Video GRID | Buyer demand, capture partners, task specifications and real-world video marketplace. | https://grid.wafflevideo.ai/ |
| Taught | Contributor experience, household-task capture and licensing/royalty model. | https://www.taught.life/ |
| micro1 | Skilled contributor recruitment, onboarding, task capture and payment. | https://www.micro1.ai/get-paid-to-record-tasks |
| Handkin | Task board, visible task prices, phone capture, review and contributor payouts. | https://handkin.ai/ |
| Latent Energy | Funded orders, acceptance-based pricing and robotics data delivery. | https://latentenergy.com/ |
| Scale AI | Enterprise physical-AI data operations and robotics data infrastructure. | https://scale.com/physical-ai |
| Figure AI — Index | Large-scale human data collection activity and demand-side signal. | https://www.figure.ai/news/introducing-index |
| Awign | India-based workforce/data collection and physical-AI operations reference. | https://awign.app/ |
| Troveo | Real-world data sourcing, ownership and licensing marketplace. | https://www.troveo.ai/ |

### Competitive positioning
Existing providers prove that data collection, QA and licensing are real commercial activities. **Our proposed wedge is the open, agent-native layer:** programmatic discovery and procurement, portable evidence-linked verification records, licensing/provenance references and policy-controlled stablecoin settlement that can work alongside existing data providers.

### Market validation talking points
- There are multiple operating vendors and products dedicated to human-generated real-world and robotics training data.
- The category includes both general human activity video and specialized robotics/teleoperation data; these are not interchangeable.
- Large AI/robotics companies have publicly described substantial investments in human data collection. Treat company-reported numbers as self-reported, not independently audited market sizing.
- Do not present a vendor count or market-size figure as definitive without a dated, independently checked methodology.

## 7. ETHGlobal Mumbai sponsor strategy

Event: ETHGlobal Mumbai, 5–7 November 2026. The following are the most strategically aligned tracks identified from the event sponsor prize page. Prize pools are sponsor-defined and subject to the official rules, eligibility and judging; they are not guaranteed awards.

| Priority | Sponsor / track | Why it fits | Target |
|---|---|---|---|
| 1 | Hedera — AI Agents That Pay: x402 | Demonstrate an autonomous agent paying for a protected service/API request; use budget limits, allowlists and an on-chain receipt. | Primary |
| 2 | Arkiv — Build on Arkiv (from scratch) | Make Arkiv a real shared/queryable marketplace layer: task discovery, claims, verification summaries or manifests. User-facing feature must read from Arkiv. | Primary |
| 3 | World — Best Use of IDKit | Use a verified uniqueness signal before a scarce paid task can be claimed; demonstrate success and failure paths. | Primary |
| Optional | Chainlink — CRE | Use only if external verification/workflow events genuinely need orchestrating into an on-chain action. | Stretch |
| Alternative | 0G — Private Computer | Potential AI inference angle, but the inference must be central to the product and requirements are demanding. | Stretch |
| Alternative | Arc — stablecoin/agent workflows | Could fit programmable stablecoin settlement, but Arc Studio is a mandatory starting point for its listed tracks. | Pivot option |

Sponsor prize page and rules: https://ethglobal.com/events/mumbai/prizes

**Track-selection caveat:** confirm exact current wording, submission requirements, eligibility and continuity restrictions directly on the official prize page. In particular, distinguish new-project Arkiv tracks from continuity-only tracks, and check any Arkiv + Swarm bonus requirements.

### How to make each integration count
- **Hedera:** make a real x402-protected endpoint part of the demo. The autonomous agent should discover and pay for at least one request. Show the resulting transaction on the appropriate explorer. Keep this distinct from contributor reward settlement if the bounty rules distinguish them.
- **Arkiv:** make a meaningful user-facing feature read from Arkiv. A write-only audit log is weak. Show query/filter and retrieval in the live demo.
- **World:** show the complete IDKit flow and server-side validation. Explain that uniqueness reduces Sybil abuse but does not prove task performance.
- **CRE:** if included, show the external event/API input and resulting on-chain workflow, not merely a logo or read-only oracle call.

## 8. Hackathon MVP: what to build and what to cut

**Recommended demo scope:** one buyer, one task, one contributor, one recording, one AI verification report, one approved payment and one independently queryable Arkiv record.

### Must-have features
- **Buyer page:** create a task with title, instructions, reward, deadline, acceptance rubric and budget.
- **Contributor page:** browse tasks, complete World ID check (if feasible), accept terms, claim task and upload a sample clip.
- **Private media upload:** store media securely and create a content hash.
- **AI verification:** return a structured result with timestamped evidence, confidence and needs-human-review state.
- **Arkiv:** write task and submission/verification summary; query open tasks and display the resulting record in the UI.
- **Hedera x402:** protected endpoint plus autonomous paid request; show transaction proof.
- **Settlement:** show a policy-authorized USDC payment or, if testnet limitations block it, a clearly labelled simulated payout plus a separately demonstrated real x402 transaction. **Never present a mock as a real transfer.**
- **Audit/receipt view:** connect task ID, submission hash, verification report hash and payment transaction reference.

### Cut or defer
- A large public two-sided marketplace with many categories and users.
- A custom token, speculative tokenomics or NFT collection.
- Multi-chain deployment without a real user need.
- Complex robot telemetry or claims of robotics-grade data unless you can actually capture it.
- Full legal licensing automation; implement clear consent/terms and a basic license record, then explain remaining legal work.
- Fully autonomous high-value payouts without safeguards, limits or a review/dispute mechanism.

### Suggested team split

| Workstream | Deliverable |
|---|---|
| Frontend / product | Buyer task creation, contributor flow, task detail, status and receipt UI. |
| Arkiv integration | Entity model, write/read/query, testnet transaction links and data lifecycle. |
| AI / verification | Capture rubric, video analysis, timestamped evidence, confidence and human-review fallback. |
| Payments / Web3 | Hedera x402 endpoint, agent client, policy checks, USDC settlement and explorer proof. |
| Integration / demo | End-to-end orchestration, seeded demo data, failure paths, pitch and architecture diagram. |

## 9. Risks, assumptions and honest claims

- **Market competition:** human-data collection is already served by established vendors. We must demonstrate a distinct agentic/interoperable workflow, not claim to invent the category.
- **Data quality:** AI video analysis can be wrong. Use evidence timestamps, confidence thresholds, human review and dispute handling.
- **Consent and licensing:** capture consent, usage scope, exclusivity, retention and deletion need clear treatment. A blockchain hash does not make an unlawful license valid.
- **Privacy:** raw video can reveal faces, homes, locations and personal information. Keep media private, minimize metadata and control access.
- **Sybil/fraud:** World ID can help establish uniqueness but does not stop collusion, replayed video or fabricated task completion.
- **Payments:** distinguish a paid x402 API call from a contributor payout. Show actual transaction evidence for anything described as on-chain.
- **Robotics suitability:** don't market ordinary phone videos as robot-action trajectories unless required sensors and metadata are captured.
- **Arkiv:** validate current testnet availability, SDK support, entity query/update/expiry behavior, fees, rate limits and data-retention semantics before committing the architecture.

## 10. What makes this winnable?

No project can be called a guaranteed winner. The idea is competitive if the team makes the sponsor integrations necessary to the product and demonstrates a complete, reliable workflow. **The biggest judging advantage would be a live experience where an independent agent discovers a task from Arkiv, pays for a protected verification/procurement endpoint through x402, receives evidence-linked output, and the accepted work is settled under a clear policy.**

**The biggest judging risk is breadth.** Trying to ship a marketplace, mobile app, AI verification stack, identity flow, multi-chain payments, dataset licensing and several sponsor integrations at once may result in a fragile demo. Prioritize a single vertical slice with excellent observability and clear failure handling.

### Recommended final pitch
> "AI labs need real-world human demonstrations, but today's sourcing, verification, licensing and payments are fragmented. Agentic Data Exchange lets software agents discover human data tasks, coordinate contributions, evaluate evidence and settle approved work. Arkiv provides shared queryable task and provenance records; AI produces evidence-linked verification; Hedera enables agentic paid requests and stablecoin settlement; World ID helps reduce duplicate contributors. We are building the open transaction layer for human-generated AI data."

## 11. Reference links & due diligence

**Primary event / sponsor:** ETHGlobal Mumbai prizes — https://ethglobal.com/events/mumbai/prizes · ETHGlobal Mumbai event page — https://ethglobal.com/events/mumbai

**Technology:** Arkiv docs — https://docs.arkiv.network/start-here/introduction/ · Hedera x402 — https://docs.hedera.com/solutions/ai/x402 · World ID / IDKit docs · Chainlink Runtime Environment (CRE) docs

**Market / competitor:** Waffle Video GRID · Taught · micro1 robotics data collection · Handkin · Latent Energy · Scale AI Physical AI · Figure AI Index announcement · Awign · Troveo (URLs in section 6)

*Research and accuracy note (from the PDF):* This brief consolidates the team's discussion and public product/sponsor references. Competitor feature descriptions are high-level summaries and should be rechecked on the linked sites. Company-reported metrics are not independently audited. Sponsor prize eligibility, track names and requirements can change; the official ETHGlobal prize page is authoritative. No partnership, customer, payment volume or product capability is implied unless the team independently demonstrates it.
