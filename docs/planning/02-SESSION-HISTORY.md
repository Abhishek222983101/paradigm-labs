> Source: `sources/session_history.md` (identical text to `sources/ETHGlobal_Session_History_Reconstructed.pdf`, 9 pages). Reconstructed from a ChatGPT session, not a verbatim export.

# ETHGlobal Mumbai - Session History (Reconstructed)

**Prepared:** 3 November 2026  
**Coverage:** This document captures the available conversation context about the ETHGlobal Mumbai project discussion, including the Skarl-inspired human-data exchange, Arkiv architecture, market research, sponsor-track strategy, the Take Rate alternative, and the user's request for an export.

> **Accuracy note:** This is a reconstructed session history from the conversation context available here, not a verbatim ChatGPT account export. Major user prompts and the substance of assistant responses are preserved in sequence. Some earlier assistant responses are summarized because the complete raw message text is not available in the current context. User-supplied Take Rate notes are summarized below. For a literal message-by-message export, use ChatGPT Settings -> Data Controls -> Export Data and provide the resulting ZIP or `conversations.json`.

---

## 1. Starting point: Skarl-inspired human-data economy

The conversation began with research into Skarl and whether its approach could inspire a strong ETHGlobal Mumbai project.

### Concept discussed

Build an AI-assisted platform to collect, verify, license and pay for human-generated real-world activity data, with robotics and embodied-AI training as potential use cases.

A typical workflow:

1. A buyer publishes a task with instructions, acceptance criteria, deadline and reward.
2. A contributor discovers the task and records a real-world activity.
3. The submission is uploaded and checked by AI against the task rubric.
4. The system creates timestamped evidence, confidence and an accept/reject/needs-review result.
5. A financial agent checks the buyer's budget and payout policy.
6. An approved payment is settled and linked to the task.
7. Accepted submissions are packaged into a dataset manifest with provenance and licensing references.

### Technical patterns taken as inspiration

- Multimodal AI/video verification, timestamped evidence and a human-review path.
- Finance-agent workflow with spending limits and authorization policies.
- Stablecoin settlement, distinct from paid API requests.
- Separate records for task, media, verification, acceptance, payable, payment and ledger.
- Private backend and media storage, with selected shared records on blockchain infrastructure.

A key caveat raised: a phone video is not automatically robotics-grade data. More demanding robotics workflows can require calibrated cameras, depth, pose, synchronized sensors, trajectories and robot action/state data. The first version should be positioned as real-world human activity data unless those data requirements are actually met.

The reference demo was treated cautiously: a payment screen is not proof of a completed live payout without a transaction and backend record.

---

## 2. ETHGlobal Mumbai sponsor-track research

The event in scope was ETHGlobal Mumbai, scheduled for 5-7 November 2026. The sponsor strategy focused on making each integration essential to one coherent product flow.

### Sponsor tracks considered

- **Hedera - AI Agents That Pay / x402:** an autonomous agent discovers and pays for a protected API request. Show a real transaction. This is separate from paying a human contributor.
- **World - IDKit:** use a privacy-preserving uniqueness check before a person claims a scarce paid task. It can reduce some Sybil abuse but does not prove task performance.
- **Chainlink CRE:** optional orchestration between external events/APIs and on-chain actions when genuinely needed.
- **Arkiv:** shared, wallet-owned, queryable task and coordination records. A user-facing feature should read from Arkiv; a write-only log is weak.
- **0G:** possible private-inference or physical-AI angle, but the inference/robotics requirements are substantial.
- **Arc:** alternative for programmable stablecoin settlement; the listed tracks required Arc Studio as the starting point.

The earlier recommendation was Hedera + World + Chainlink. After considering Arkiv's database and coordination role, the recommendation shifted to **Hedera + Arkiv + World**, with Chainlink as optional.

Official sponsor page: https://ethglobal.com/events/mumbai/prizes

---

## 3. Proposed project: Agentic Data Exchange

### Working positioning

An agent-native marketplace and settlement layer for human-generated real-world AI training data. Buyers describe what data they need; contributors capture it; AI evaluates submissions; policy-controlled agents coordinate procurement and payment; task, provenance and settlement references remain portable and queryable.

### One-line pitch

> A programmable marketplace where AI agents can source, verify and pay for human-generated real-world training data, with portable records of task requirements, provenance, licensing and settlement.

### End-to-end MVP flow

1. Buyer creates a task with reward, deadline, rubric and licensing terms.
2. Task is written to Arkiv and queried by an independent client or agent.
3. Contributor discovers and claims the task; an optional World ID check helps enforce one-person/one-claim rules.
4. Contributor uploads media to private storage. Arkiv stores a content hash and controlled reference, not raw video.
5. AI generates an evidence-linked result with timestamps, confidence and human-review path.
6. Payment workflow checks budget, recipient and spending policies.
7. Hedera x402 demonstrates an autonomous paid API request; contributor settlement is separately represented and verified.
8. A receipt links task, submission hash, verification record and payment transaction.

The advice was to demonstrate one complete transaction rather than several disconnected sponsor integrations.

---

## 4. Arkiv database architecture and blockchain justification

The recommendation was a hybrid database architecture, not replacing the full backend with Arkiv.

### Data placement

| Layer | Suggested responsibility |
|---|---|
| Arkiv | Public/shared task listings, claims, task status, verification summaries, dataset manifests and content hashes |
| Private backend (e.g. Convex or PostgreSQL) | Sessions, profiles, notifications, internal queues and operational state |
| Private object storage | Raw video/audio, access control and retention |
| Hedera | Stablecoin settlement and x402 paid-API transaction records |
| World ID | Optional uniqueness credential; do not publish sensitive identity material |

### Illustrative Arkiv entity types

- `task`: taskId, buyer wallet, category, reward, deadline, rubric hash, license reference and status.
- `claim`: taskId, contributor pseudonymous identifier or wallet, claimedAt and status.
- `submission`: taskId, media content hash, private storage reference and submittedAt.
- `verification`: submissionId, result, evidence hash, model version, confidence band and review status.
- `dataset_manifest`: datasetId, submission identifiers, schema version, content hashes and license references.
- `payout_receipt`: taskId, recipient, amount, token, chain and transaction hash.

### Why blockchain should not feel forced

The product should solve a real multi-party coordination problem. Independent buyers, contributors, data vendors and agents need to discover shared task state and verify references without relying on one private marketplace database as the sole source of truth.

Arkiv provides shared queryable state; AI generates verification evidence; Hedera handles payment rails. None of these proves that a recording is authentic or that an AI verdict is correct.

**Privacy rule:** raw videos, identity documents, access tokens and decryption keys must not be placed in public Arkiv entities. Hashes prove integrity of a referenced object, not consent, legal rights or data quality.

---

## 5. Competitors and market validation

The conclusion was that the market is real but crowded. The project should not claim to have invented crowdsourced training data, human demonstration collection or AI data QA.

Reference products identified in the discussion:

- **Waffle Video GRID** - https://grid.wafflevideo.ai/ - real-world video marketplace and capture partner workflows.
- **Taught** - https://www.taught.life/ - contributor experience, household-task capture and licensing/royalty ideas.
- **micro1** - https://www.micro1.ai/get-paid-to-record-tasks - skilled contributor onboarding and paid data capture.
- **Handkin** - https://handkin.ai/ - task board, capture, review and contributor payment experience.
- **Latent Energy** - https://latentenergy.com/ - funded orders, acceptance-based pricing and robotics data delivery.
- **Scale AI Physical AI** - https://scale.com/physical-ai - enterprise physical-AI data operations.
- **Figure AI Index** - https://www.figure.ai/news/introducing-index - large-scale human-data collection demand signal; company-reported figures should be labelled as such.
- **Awign** - https://awign.app/ - India-based workforce/data collection and physical-AI operations reference.
- **Troveo** - https://www.troveo.ai/ - real-world data sourcing and licensing marketplace.

### Differentiation proposed

- Agent-native data procurement and machine-readable task discovery.
- Portable verification records with evidence references.
- Policy-controlled agentic payments and transparent settlement receipts.
- Interoperability with existing collection providers rather than building a smaller copy of them.

Market metrics and competitor descriptions should be rechecked. Do not present vendor counts or market-size figures as definitive without a dated methodology.

---

## 6. Project brief PDF created earlier

A separate project brief was generated in this conversation as:

`Agentic_Data_Exchange_ETHGlobal_Mumbai_Project_Brief.pdf`

It covered the problem, product workflow, architecture, Arkiv schema, blockchain rationale, market references, sponsor strategy, MVP scope, team workstreams, risks and pitch.

---

## 7. Alternative idea supplied by the user: Take Rate

The user supplied a concept titled **Take Rate: Hidden-Fee Auditor for Uniswap v4 Hooks**, research date 1 November 2026.

### Concept in simple terms

Uniswap v4 hooks are smart contracts that can run during a swap. The concern is that a pool may display a 0% fee while a hook takes an additional amount through another mechanism. Take Rate would try to measure the difference between the displayed fee and the actual economic take, then store recent measurements as expiring Arkiv entities.

### Evidence supplied by user

- A Bitquery article dated 26 October 2026 reportedly analyzed Robinhood Chain logs from 4-8 September 2026.
- The supplied notes said one hook handled 74.5% of hooked swaps in the sample; pool records showed 0% fee while the measured effective take was about 2%; hook gas overhead and refused swaps were also reported.
- Bags documentation reportedly discloses a flat 2% fee on the ETH/WETH leg for its Robinhood Chain v4 hook, but the user noted that this was not confirmed to be the exact same contract measured by Bitquery.

### Proposed workflow

1. Index PoolManager Swap events on one chain.
2. Test the hypothesis that hook takes appear as balance movements to the hook address in the same transaction. Validate this before building around it.
3. Decode hook permission flags from the Uniswap v4 hook address.
4. Store pool, hook, chainId, displayed fee, effective fee, sample size and window start as Arkiv entities with seven-day expiry.
5. Frontend lets users paste a pool, compare displayed and effective fee, and filter pools where effective fee exceeds displayed fee.

### Risks

- It was unverified whether hook takes reliably appear as simple balance movements to the hook address. This is the core technical dependency and should be tested first.
- Measurements should be presented as reproducible observations, not accusations.
- Arkiv testnet availability and chain RPC reliability could affect the demo.

### Sponsor-track fit proposed by user

- **Uniswap - Build with Uniswap:** ecosystem tooling; open-source repo, feedback file and developer feedback form requirements.
- **Arkiv - Build on Arkiv from scratch:** measurement snapshots and expiration are central; requires testnet writes, user-facing reads, schema/friction/reach/why/how documentation and open licensing.

The user proposed the Arkiv from-scratch track rather than a Mirror track to avoid overlapping with Uniswap's existing hook registry.

---

## 8. ETHGlobal prior-project overlap and comparison

The subsequent research identified **TARE**, an ETHGlobal project from ETHOnline 2026, as a very close direct overlap with Take Rate.

The earlier response described TARE as having:

- Uniswap v4 hook fee measurement.
- Fork-based comparisons of swaps with a hook active and disabled.
- A large measurement corpus.
- AI/MCP agent support.
- Hedera x402 integration.
- A browser extension for transaction checking.
- A reported Uniswap prize at ETHOnline 2026.

The takeaway: Take Rate is a good problem, but the exact proposed implementation appears to overlap heavily with an existing ETHGlobal project. A basic dashboard plus Arkiv snapshots would struggle to differentiate.

### Related human-data projects found in the showcase search

The earlier search found at least these eight relevant or adjacent projects:

- Thenar - robot demonstration collection and contributor payment.
- isaac protocol - webcam-based human motion capture, quality scoring and rewards.
- HumanOS - tokenized human action data marketplace.
- Humonic - human-origin data verification.
- Datagraph Arena - human feedback/RLHF task marketplace.
- Loop - human validation bounties for AI output.
- Playback Network - decentralized human activity/screen recording data marketplace.
- No Cap - human-verified facts accessible to AI agents.

This was a search result count, not an exhaustive count of all ETHGlobal submissions. Some projects are adjacent rather than direct competitors.

### Qualitative project scores previously given

| Criteria | Agentic Data Exchange | Take Rate |
|---|---:|---:|
| Problem relevance | 9/10 | 9/10 |
| Market validation | 9/10 | 9/10 |
| Originality | 6.5/10 | 3/10 |
| Technical depth | 8/10 | 9/10 |
| Sponsor fit | 9/10 | 9/10 |
| Differentiation | 6.5/10 | 2.5/10 |
| Four-day feasibility | 6/10 | 8/10 |
| Overall assessment | 7.5/10 | 5.5/10 |

These are qualitative assessments, not judging predictions.

### Recommendation

Continue with the human-data idea only with a sharper open, agent-native procurement, verification and settlement layer. Do not submit Take Rate unchanged; revisit it only if a demonstrable weakness in TARE is identified.

---

## 9. Request for exact session export

The user asked for the entire session history in Markdown, including prompts and outputs. The assistant explained that the complete raw transcript was not available from the current context and suggested using ChatGPT Settings -> Data Controls -> Export Data, then uploading the ZIP or `conversations.json` to isolate the exact conversation.

The user then explicitly requested a PDF version. This document is that reconstructed session-history file.

**Important limitation:** This PDF does not contain every original assistant response word-for-word, all intermediate tool outputs, hidden system/developer instructions, or every attachment embedded in the conversation. It captures the major prompts, project decisions, technical analysis and recommendations available in the current chat context. For a literal message-by-message export, use ChatGPT's data export and provide the resulting ZIP.

---

## Useful links

- ETHGlobal Mumbai prizes: https://ethglobal.com/events/mumbai/prizes
- ETHGlobal Mumbai: https://ethglobal.com/events/mumbai
- Arkiv documentation: https://docs.arkiv.network/start-here/introduction/
- Hedera x402 docs: https://docs.hedera.com/solutions/ai/x402
- Uniswap v4 docs: https://docs.uniswap.org/contracts/v4/overview
- ETHGlobal showcase: https://ethglobal.com/showcase

---

*End of reconstructed session history.*
