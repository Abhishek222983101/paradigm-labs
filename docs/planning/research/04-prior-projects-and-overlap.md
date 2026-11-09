# 04 — Prior ETHGlobal projects and overlap

**Accessed:** 3 Nov 2026 (ETHGlobal showcase pages pulled with curl, Exa search/fetch, GitHub API).
**Scope:** Overlap check only. This file does not design our product.
**Convention:** If a field says "none shown", the showcase page has no "Winner of" block. **UNVERIFIED** means I did not confirm it from a primary source within the time available.

ETHGlobal event dates (from the showcase's own event list): HackMoney 2026 (30 Jan–11 Feb), Cannes 2026 (3–5 Apr), Open Agents (24 Apr–6 May), New York 2026 (12–14 Jun), Lisbon 2026 (24–26 Jul), ETHOnline 2026 (4–16 Sep), Tokyo 2026 (25–27 Sep). Pages labelled just "ETHGlobal New Delhi" are from 26–28 Sep 2025. "ETHGlobal San Francisco" is 18–20 Oct 2024.

---

## 1. TARE (ETHOnline 2026)

- Showcase: https://ethglobal.com/showcase/tare-ozced
- Live demo: https://tare-hooks.tech · Repo: https://github.com/JeanBaptisteDurand/ETH_Online_2026 (Apache-2.0, created 4 Sep 2026, last push 16 Sep 2026)
- **Prizes:** Uniswap Foundation – *Best Uniswap Stack Contribution*, plus the **ETHOnline 2026 Finalist** badge. No Hedera prize is shown.
- **What it does:** measures what each Uniswap v4 hook actually takes from a swap. It argues the official hook registry has no field for a quantity. Of 1,559 hooks seen in 200k Base blocks, only 9 emit the HookSwap/HookFee events Uniswap recommends.
- **Measurement method:** yes, it is fork-based with the hook switched on and off. It pins an anvil fork of **Base at block 50,614,000** and quotes a swap through V4Quoter. It then uses `anvil_setCode` to replace the hook's bytecode with an inert 89-byte stub (same poolId, liquidity and slot0), quotes again, and takes the difference as the hook's take. "Gate A4" re-ran **3** real swaps and matched the quotes to the wei.
- **Corpus:** 125,072 rows covering 7,817 pools, 112 hooks, 8 sizes and both directions. Breakdown: 63,156 MEASURED, 61,466 NOT_QUOTABLE, 450 NOT_MEASURABLE. Headline: 39 hooks take 0–18% on pools whose stored LP fee is zero (median 100 bps, max 1,800.99 bps). 78 of the 112 hooks are missing from the official registry.
- **AI/MCP agent:** 14 named tools in three groups (collect, analyse, act). Four of them are served over MCP to Claude Desktop, offline, from the committed corpus.
- **Hedera x402:** a new measurement costs 0.001 USDC over x402 on Hedera testnet, settled through the Blocky402 facilitator and checked on the mirror node. The agent has an HCS-14 identity and its usage log is anchored to an HCS topic.
- **Browser extension:** an offline MV3 extension that reads Universal Router calldata before you sign. If a cheaper route exists it builds a replacement transaction through Permit2, but never broadcasts it. It reports that no cheaper route exists for 99.71% of rows.
- **Other parts:** Ledger Key Ring and EIP-712 clear-signing, a React site with the 8.3 MB corpus embedded (no backend), and 1,230 tests.

**Weaknesses and gaps a Take Rate entry could target. All are taken from TARE's own README:**
1. **One chain, one block.** The data is Base only, at a single pinned block. There is no time series and no monitoring. Its README and the repo code search find **no mention of Robinhood Chain** (GitHub code search for "robinhood" returned 0 hits; the index may be incomplete).
2. **It measures quotes, not real trades.** The numbers are what the hook would take on a quoted swap. Only 3 swaps were actually executed to check them. It does not read what users actually paid from historical logs.
3. **About half the rows have no value.** 61,466 of 125,072 rows are NOT_QUOTABLE. Hooks with custom accounting (where the hook itself holds the liquidity) are NOT_MEASURABLE by design.
4. **The paid measurement doesn't work live.** The x402 paywall is hosted, but the measurement engine does not run on that server, so "a fresh measurement cannot be delivered there yet". No database is configured, so account routes return 503.
5. **On-chain attestations are mostly unwritten:** 16 of 99 computed. The subscription contract is not deployed on a public network.
6. **No Arkiv.** GitHub code search for "arkiv" returned 0. Results are a static corpus inside the page, not shared records that expire.

---

## 2. Take Rate evidence

### Bitquery article
- https://bitquery.io/investigations/uniswap-v4-hooks-robinhood-chain. Title: "The Uniswap hook that shows a 0% fee and takes about 2%".
- Page metadata: `datePublished 2026-09-08`, `dateModified 2026-10-26`. The text says "On-chain figures verified 26 October 2026" and carries a **correction dated 26 Oct**: the first version said ~1%, and by value it is ~2%.
- Findings:
  - 74.5% of v4 trades on Robinhood Chain go through a hook.
  - One hook carries about three quarters of hooked swaps, and the top 5 carry more than 90%.
  - About 1 in 6 hooks with pools has never handled a trade.
  - The largest hook shows a 0% fee but takes a **fixed 1% plus a second cut set per pool (0–10%)**, through `afterSwapReturnsDelta`.
  - Weighted by value, that is ~2%: a sample of 11,349 swaps worth $1.6M yielded $30,936.
  - afterSwap median gas is 40,075. beforeSwap fails 1.174% of the time.
- **The window is 4–8 Sep 2026** for the swap counts and 4–7 Sep for the fee sample. It is only four days because the chain's archive keeps a few rolling days.
- Hook addresses appear only truncated: `0xe5e70264` (described as a "toll booth": $6.1M received, 1,181,743 transfers, kept 5.3%), `0x24cd6d9e` (vault), `0x127b3f3b` (pass-through). The text implies the toll booth is the largest hook but never states it outright. **UNVERIFIED.**

### Bags docs
- https://docs.bags.fm/robinhood/overview and https://docs.bags.fm/robinhood/contracts
- "A flat 2% fee is charged on the ETH/WETH leg of every trade, in both phases." It is split 1% to the creator and 1% to the protocol, and a partner can take part of the protocol half.
- `BagsV4Hook` = `0x2380aBf72C17aABAb76480244759AC7E2932EEcC`. It is a CREATE2 singleton, not upgradeable, and shared by all Bags pools. It emits `HookFeeTaken(poolId, amount)`, where gross WETH volume = amount × 50. Pools use the dynamic-fee flag `0x800000`. Protocol deploy block: 7,887,312.

### Can the two be tied to the same contract? **No. The evidence points the other way.**
- **Address prefixes don't match.** Bags' hook starts `0x2380aB…`. None of the three prefixes Bitquery prints match it.
- **Fee structures don't match.** Bitquery's largest hook takes a fixed 1% plus a per-pool 0–10% cut. Bags is a flat 2% on the WETH leg.
- Bags' price API mentions "V1, V2, or V3" deployments, so older Bags hooks may exist. I did not check those. **UNVERIFIED.**
- Conclusion: present them as two separate data points. Do not describe Bags as "the hook Bitquery measured".

### Other public Robinhood Chain hook-fee tools (not ETHGlobal, but relevant to Take Rate)
- **CULET Census:** https://culetlab.com/census. Every v4 pool on Robinhood Chain, a rolling 24h count of swaps that paid more than 50%, the 25 largest hooks, and raw JSON you can rebuild.
- **Hookshade:** https://www.hookshade.com/pools. Hook permissions decoded per pool (snapshot at block 96,027,693).
- **Crius:** https://docs.crius.sh/concepts/uniswap-v4-hooks/ (updated 28 Oct 2026). Rates every Robinhood Chain hook by permissions, code and owner, observed pool behaviour, and code family.
- **couchdicks.org report:** https://couchdicks.org/robinhood/v4-fee-traps/evidence/report.md (14 Aug 2026). Finds 16,949 pools with 85–99.99% static LP fees, almost all with no hook, i.e. route-poisoning spam.
- Also on ETHGlobal: **Klamp** (Tokyo 2026, no prize shown; issuers declare a canonical v4 pool in ENSv2) https://ethglobal.com/showcase/klamp-6taw1 · **Sworn** (Tokyo 2026, no prize shown; a router that makes quote and trade one transaction so hooks can't quote low and charge more) https://ethglobal.com/showcase/sworn-f9svn · **HookRank** https://ethglobal.com/showcase/hookrank-ym97n and **HookLens** https://ethglobal.com/showcase/hooklens-sc1r0 (hook dashboards; event and prizes **UNVERIFIED**, pages did not load).

---

## 3. Human-data projects (the eight from earlier)

| Project | Event | One line | Prizes won | Stack (Arkiv / x402 / World ID / Hedera) | GitHub |
|---|---|---|---|---|---|
| [Thenar](https://ethglobal.com/showcase/thenar-n0ma1) | ETHOnline 2026 | People drive a simulated robot arm in the browser (MuJoCo, scored 55/25/20). Accepted runs are paid in USDC from an escrowed bounty, and recordings are sold to AI agents. | none shown | Arkiv: no. **x402: yes** (Hedera, 0.5 HBAR, Blocky402). **World ID: yes** (IDKit 4 Selfie Check, plus AgentKit/AgentBook for buying agents). **Hedera: yes** (x402, sale log on HCS, ATS security token for the corpus). Also Arc testnet USDC payouts, a Privy server wallet with a spend policy (lab budget, max 1 USDC), and a Merkle CorpusManifest. | https://github.com/nickthelegend/thenar-io |
| [isaac protocol](https://ethglobal.com/showcase/isaac-protocol-p9qv6) | ETHOnline 2025 | Webcam pose capture (TF/MediaPipe, no video stored), scored and rewarded by quality. Claims zk verification. | none shown | none of the four | https://github.com/mayur-samrutwar/isaacprotocol |
| [HumanOS](https://ethglobal.com/showcase/humanos-mk20p) | ETHGlobal New York 2025 | Users upload first-person videos of daily actions and get ERC20 "action tokens". Companies fund pools and burn tokens to access the data. | Hedera – AI on Hedera **2nd**; Walrus – best storage app | **Hedera: yes** (testnet deploy). Walrus storage, Llama Vision classifier, Uniswap V2. No x402, World ID or Arkiv. | https://github.com/zalatar242/HumanOS |
| [Humonic](https://ethglobal.com/showcase/humonic-7nv6t) | ETHGlobal Cannes 2026 | "SSL for human-origin data": a World ID-verified worker gets an on-chain certificate for each task output. | none shown | **World ID: yes** (4.0 via idkit-server, nullifier per task). **x402: yes, but Circle/Arc** (x402-batching nanopayments, 0.001 USDC per certificate). ENS + ERC-8004 reputation. No Hedera, no Arkiv. | https://github.com/pbudlong/humonic |
| [Datagraph Arena](https://ethglobal.com/showcase/datagraph-arena-2y437) | ETHGlobal New Delhi (2025) | World App mini app: verified humans do RLHF tasks and earn WLD. | none shown | **World ID: yes** (MiniKit). Supabase backend. No x402, Hedera or Arkiv. | https://github.com/xAGI-labs/Datagraph_World |
| [Loop](https://ethglobal.com/showcase/loop-yjppn) | ETHGlobal San Francisco (2024) | On-chain RLHF: developers post bounties for checking a model's outputs, and users earn by validating ("validate-to-earn"). | Hedera – EVM Starter Bounty; AirDAO – AI in AirDAO **2nd** | **Hedera: yes** (one of 9+ testnets). No x402, World ID or Arkiv. | https://github.com/shreybirmiwal/eth-sf |
| [PlayBack Network](https://ethglobal.com/showcase/playback-network-xrqtm) | HackFS 2024 | Marketplace for screen recordings of people completing tasks, to train "large action models". ChatGPT Vision on Galadriel sets a token value per recording. | Galadriel – best on-chain AI agent **1st**; CoopHive – best use cases | none of the four (Galadriel, S3/DynamoDB) | https://github.com/playback-network/playback-network |
| [No Cap](https://ethglobal.com/showcase/no-cap-io7rw) | ETHGlobal New Delhi (2025) | Knowledge base of facts verified by World ID humans through staked voting, with a REST API/SDK for AI agents. | none shown | **World ID: yes**, plus World Chain contracts and Walrus. No x402, Hedera or Arkiv. | https://github.com/adipundir/no-cap |

---

## 4. More overlaps found in the showcase

| Project | Event | One line | Prizes won |
|---|---|---|---|
| [**WorldMod**](https://ethglobal.com/showcase/worldmod-ydh8h) | ETHOnline 2026 | **Closest match to ADE.** A buyer posts and escrows a USDC bounty for a short real-world task. A contributor records 15 s of first-person phone video inside World App, after a Selfie Check. The server scores hands in frame, gyro vs optical flow (replay check) and near-duplicates. The buyer's acceptance threshold is checked inside a TEE by a Chainlink CRE Confidential Workflow, then USDC is paid. Accepted episodes go to an IPFS dataset registry, and Hedera ATS bonds handle dataset licensing. Contracts are on Sepolia and Hedera testnet. | none shown. Repo https://github.com/fabianferno/worldmod returned **404** on 3 Nov. Page shows no x402 or Arkiv; repo code search returned 0 (repo inaccessible). |
| [Hands Unchained](https://ethglobal.com/showcase/hands-unchained-6kdf3) | ETHGlobal Lisbon 2026 | Verified humans teleoperate real or simulated robot arms. A TEE model on 0G grades each episode, and only work it passes is paid. Operators stake to book a slot. World Identity Check (age 18+) gates access. Output is LeRobot episodes. | 0G – Best AI Product on 0G **2nd**; World – **1st place** (track name not shown on page); Lisbon 2026 **Finalist** |
| [Legwork](https://ethglobal.com/showcase/legwork-qnywe) | ETHOnline 2026 | Agents hire World ID-verified humans for real-world checks, with USDC escrow on Base Sepolia, an MCP server and a subgraph. | Bazantic – Agentify a new API **3rd** |
| [OpenBook](https://ethglobal.com/showcase/openbook-8ngw6) | ETHOnline 2026 | Data marketplace for AI agents where the contract refunds stale data ("fresh data or your money back"). Market data, not human data. | The Graph **3rd**; Arc – Best Agentic Economy App w/ Circle Agent Stack; ETHOnline 2026 **Finalist** |
| [Carpool](https://ethglobal.com/showcase/carpool-f4bez) | ETHOnline 2026 | AI agents buy research someone has already done, and the author is paid in USDC. | Has a prize in the listing data; sponsor and track **UNVERIFIED** |
| [FieldProof402](https://ethglobal.com/showcase/fieldproof402-btphu) | ETHOnline 2026 | AI agents pay people over x402 to verify real-world facts, with Hedera receipts. | none in scrape (**UNVERIFIED**) |
| [Levantate Bridge](https://ethglobal.com/showcase/levantate-bridge-urkyw) | ETHOnline 2026 | Agents post tasks, verified humans bid and deliver, paid in USDC on Arc. | none shown |
| [AgentBounty](https://ethglobal.com/showcase/agentbounty-vkjoi) | ETHOnline 2026 | Agents with ENSv2 identities and on-chain spend limits pay for data and complete bounties. | none shown |
| [Execution Market](https://ethglobal.com/showcase/execution-market-xc51v) | ETHGlobal Cannes 2026 | Agents post bounties over MCP/REST and humans do them. World ID 4.0, own x402 facilitator (20 chains incl. Hedera), ENS. | none shown |
| [Open Human](https://ethglobal.com/showcase/open-human-er4dy) / [Human as a Service](https://ethglobal.com/showcase/human-as-a-service-3jd8e) / [EdgeBind](https://ethglobal.com/showcase/edgebind-sst2y) | ETHGlobal Cannes 2026 | Agents hire World ID-verified humans with Hedera escrow or settlement and payouts on proof. | none shown |
| [Ward](https://ethglobal.com/showcase/ward-5gugp) | ETHGlobal New York 2026 | An agent hires humans and pays USDC on Arc. Settlement depends on sensor proof, and the escrow enforces per-job and daily caps. | none shown |
| [Data Bounties](https://ethglobal.com/showcase/data-bounties-nc79r) | ETHGlobal New York 2026 | Companies post bounties for photos. Each submission is checked (not AI-generated, matches the prompt, unique) before an HBAR payout. | none shown |
| [Ask2Human](https://ethglobal.com/showcase/ask2human-v59qt) | ETHGlobal Tokyo 2026 | Agents with an owner-set budget hire Selfie Check-verified humans for real-world tasks, paid in USDC on Sui. | none shown |
| [hands for ai](https://ethglobal.com/showcase/hands-for-ai-n9q6n) / [Dashmint](https://ethglobal.com/showcase/dashmint-09gei) | HackMoney 2026 | Agents hire humans for physical tasks with gasless x402 deposits / dashcam footage for AI research with Story IP registration. | none shown |
| [Data Context Market](https://ethglobal.com/showcase/data-context-market-02545) | ETHGlobal Buenos Aires (Nov 2025) | Dataset marketplace where agents buy data over x402, with encrypted files on Filecoin. | Filecoin **2nd**; sqd – Best Pipes SDK project |
| [scale.fun](https://ethglobal.com/showcase/scale-fun-x5nsb) | ETHGlobal Buenos Aires | Launchpad for datasets built by zk-verified humans. | Self – Best onchain SDK **1st** |
| [Lablr](https://ethglobal.com/showcase/lablr-1s6tg) | ETHGlobal Brussels (2024) | Swipe-style data labelling with World ID login, paid in USDC. | Filecoin **3rd**; Worldcoin Pool Prize; Web3Auth |

Earlier, smaller precedents (no prize unless noted): [Navio](https://ethglobal.com/showcase/navio-kpu3j) (roadside video, NY 2023), [SonicIP](https://ethglobal.com/showcase/sonicip-beu07) (voice data, New Delhi), [Kippu](https://ethglobal.com/showcase/kippu-r5xya) (image tagging, Taipei), [Trade](https://ethglobal.com/showcase/trade-bw0cg) (AI training data market, ETHOnline 2025), [MeterX402](https://ethglobal.com/showcase/meterx402-8i147) (metered Hedera x402 for any API or dataset, ETHOnline 2026).

**Arkiv in the showcase:** only [SureX](https://ethglobal.com/showcase/surex-9gct3) turned up in search (Walrus + Arkiv; event and prizes **UNVERIFIED**, page did not load). No human-data or hook-fee project on ETHGlobal was found using Arkiv.

**Arkiv's own ideathon** (https://github.com/Arkiv-Network/arkiv-ideathon, SHOWCASE.md, Aug 2026, ideas only) already contains unawarded ideas close to ours: *Freshdata* (AI training dataset market where Arkiv expiry enforces freshness), *Verified AI Data Licensing Market*, *Quaerium* (request-for-quote answers from private datasets) and *Skillport* (robot skills). On the Take Rate side, *Chorus* (signed, expiring DeFi observations) **won DeFi 1st**.

---

## 5. Past sponsor-track winners

**Arkiv.** It has no track at any ETHGlobal event before Mumbai. I checked the sponsor lists on the prize pages for ETHOnline 2026, Tokyo, Lisbon, New York and Cannes 2026, HackMoney 2026, Open Agents, Buenos Aires, ETHOnline 2025 and New Delhi, and none include Arkiv or Golem. Its winners come from its own events (https://hub.arkiv.network/ecosystem: "116 projects, 27 prize winners, 6 events"):
- Sub0 / Devconnect Buenos Aires, Nov 2025: **MentorGraph**, a wallet-owned mentorship network with expiring asks and offers (https://arkiv.network/blog/ideas-that-buidl).
- Builders Challenge, Mar 2026: **Agora** (event platform, RSVPs and waitlist) 1st and **Ocean** (user-owned knowledge base) 2nd.
- ETHNS / Network School, May 2026: **Cortex** (agent memory that expires unless used) and **Ark Hive** (agent memory on Arkiv with ERC-8004).
- PunaTech: **Susurro** (encrypted wellness memory where expiry is the access control), **Licita Verify** (public-tender log with MCP bot), **NotarIA**, **Mediation Rooms**.
- Ideathon, Aug 2026: Tried That, Tideland, Still Yours, Chorus and others.
- Pattern: the winners make Arkiv's expiry and ownership the core mechanic, and the read side is visible to users.
- Devfolio "Global Tour Stop" (9–18 Oct 2026, Best Indian Use Case track): winners **UNVERIFIED**.

**Hedera "AI & Agentic Payments" / x402.** This track ran at Cannes, New York and Lisbon 2026, and at ETHOnline 2026 as "AI & Agentic Payments on Hedera". Mumbai calls it "AI Agents That Pay: x402 on Hedera".
- I could not confirm the 2026 winners. The listing data gives a sponsor id but not the track name, and the scrape was cut short. **UNVERIFIED.**
- Confirmed Hedera prizes on human-data projects: HumanOS (AI on Hedera 2nd, NY 2025) and Loop (EVM Starter, SF 2024).
- TARE and Thenar both used Hedera x402, but neither page shows a Hedera prize.

**World (IDKit / World ID / AgentKit / Selfie Check).** Tracks changed by event: Cannes 2026 had AgentKit, World ID 4.0 and MiniKit 2.0. NY 2026 had Tracks A–D. Lisbon 2026 had AgentKit, Selfie Check and Identity Check. ETHOnline 2026 had AgentKit Continuity and Selfie Check. Tokyo 2026 had Best Use of IDKit and World ID for Agents. Mumbai has World ID Agent Pass ×2, Best Use of IDKit, and [Cont] IDKit.
- Confirmed World winners:
  - **Hands Unchained**: World 1st, Lisbon 2026. An identity gate for robot teleoperation that is paid only when AI grading passes.
  - **WorldAgent.ID**: World Pool Prize, Cannes 2025. Links agents to verified humans.
  - **ProofOfTruth**: Best Mini App 1st, Bangkok.
  - **Lablr**: Pool Prize, Brussels.
  - **CapyData**: Mini App honourable mention, Prague.
- Tokyo 2026 and ETHOnline 2026 World winners: **UNVERIFIED**.

### 5b. Confirmed 2026 Hedera and World winners (added 5 Nov 2026, from showcase "Winner of" fields)

Read from each project's ethglobal.com/showcase page, using the "Winner of" text in the HTML. VERIFIED.

**Hedera "AI & Agentic Payments on Hedera" (the predecessor of Mumbai's "AI Agents That Pay: x402")**

| Project | Event | What it is | Other prizes |
|---|---|---|---|
| Accrue (`/showcase/accrue-racfy`) | New York 2026 | Monetises the attention spent waiting on AI spinners | **ETHGlobal Finalist** |
| MARS (`/showcase/mars-ua1qc`) | New York 2026 | "Marketplace for Audited, Reputable Skills": a trust layer for agents installing skills, tools and MCPs | Arc Agentic Economy 1st, World AgentKit 2nd |
| GlassBox402 (`/showcase/glassbox402-qyepd`) | Lisbon 2026 | Turns any API into an x402 endpoint | **ETHGlobal Finalist** |
| DIVE (`/showcase/dive-5hxbp`) | Cannes 2026 | Oracle and prediction-market "truth" verification engine | World MiniKit 1st, 0G 2nd, **Finalist** |
| Turnstile (`/showcase/turnstile-ovks1`) | ETHOnline 2026 | Marketplace where AI agents buy and sell onchain analysis one call at a time | The Graph AI 2nd |

Related Hedera wins: AgentRouter (Lisbon 2026, `/showcase/agentrouter-deqhv`), an x402 inference exchange where agents pay HBAR per request, won "No Solidity Allowed". These ETHOnline 2026 x402 agent projects show **no prize**: Alt Agent, Koven (credit and policy for x402 agents), Ledger-of-Work, AgentPay, Inference Exchange, Wayfare (x402 service discovery).

**Pattern:** Hedera x402 winners are **agent marketplaces or agent-commerce infrastructure** (buy and sell per call, skills trust, API-to-x402). Several were also finalists. Plain "an agent pays an API" is crowded: many ETHOnline entries won nothing. A *real-world human data* x402 buyer has not appeared among the winners.

**World (World ID 4.0 / AgentKit / IDKit), 2026**

| Project | Event | Prize | What it is |
|---|---|---|---|
| AgentGate (`/showcase/agentgate-scs65`) | Cannes 2026 | Best use of AgentKit **1st** | x402 pay-per-call API gateway for agents on Hedera plus World AgentKit |
| Groundtruth (`/showcase/groundtruth-mz4us`) | Cannes 2026 | AgentKit 2nd | Map where humans and agents report and validate events |
| VEIL VPN (`/showcase/veil-vpn-c643n`) | Cannes 2026 | World ID 4.0 **1st** (+ ENS 1st) | Pay-as-you-go VPN that proves it keeps no logs |
| Equitas (`/showcase/equitas-rzw7i`) | Cannes 2026 | World ID 4.0 3rd | SNAP benefits that only go to unique, qualifying humans |
| Proof-of-Human Drops (`/showcase/proof-of-human-1cg2d`) | New York 2026 | Track A (AgentKit) **1st** | Bot-proof scarce-goods drops |
| Novi Corpus (`/showcase/novi-corpus-0qdc8`) | Lisbon 2026 | Identity Check Beta (Continuity) 1st | Gives an AI agent a legal existence |
| Hands Unchained | Lisbon 2026 | World 1st | (see §3) |

**Pattern:** World rewards (a) **fair access to scarce things** for unique humans (drops, benefits), which is exactly our "one person per scarce paid task", and (b) **human-backed agents** (AgentKit, which became "Agent Pass" at Mumbai). An agent that pays via x402 and is tied to a World-verified human won AgentKit 1st at Cannes (AgentGate).

Still UNVERIFIED: Tokyo 2026 and ETHOnline 2026 World winners (no "Winner of" text found in the pages searched).

---

## What this means for differentiation (factual)

- **Agentic Data Exchange is not new as a whole.**
  - WorldMod (ETHOnline 2026) already does buyer-posted escrowed bounties, phone video capture, a Selfie Check, automated plausibility scoring, USDC payout and Hedera dataset tokenisation.
  - Thenar (ETHOnline 2026) already does World ID-gated paid demonstrations, a policy-limited buyer wallet, and agents buying the data over Hedera x402 with an HCS receipt.
  - Hands Unchained won World 1st for paying only for AI-graded demonstrations.
  - Neither WorldMod nor Thenar shows a prize.
- **Gaps I found no project covering:**
  - Task, claim, verification and manifest records held in **Arkiv**, readable by other clients or agents.
  - An **AI agent acting as the buyer**, posting the data task itself, with payout limited by a policy.
  - Hedera x402 used on the *procurement* side combined with real-world video capture.
  - Thenar's capture is a simulation, and WorldMod has no x402 or agent buyer.
  - Arkiv's own ecosystem page lists "Pay-Per-Query Data Commons" as unbuilt.
- **Take Rate:**
  - TARE covers the fork-based method, the agent, Hedera x402 and the extension, on **Base at one block**.
  - Not covered by TARE: Robinhood Chain; continuous or expiring measurements over time; takes measured from **real swap logs** rather than quotes; hooks TARE marks NOT_QUOTABLE or NOT_MEASURABLE; Arkiv storage.
  - On Robinhood Chain, CULET, Hookshade, Crius and Bitquery already publish hook data, so a dashboard alone would not be new there either.
