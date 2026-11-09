# 03 — Market and competitors (primary-source check)

**Accessed:** 3 Nov 2026. Every claim below comes from a page fetched on this date (Exa fetch/search, curl, GitHub API).
**Labels:** **(CR)** = company-reported, not independently verified. **UNVERIFIED** = could not be confirmed from a primary source. "Not found" means it was not found in the pages reviewed, not that it does not exist.
**Scope:** landscape only. No product design here.

---

## 1. Skarl

**Verdict: Skarl is a hackathon project.** It is not a funded startup. It was built at **Cal Hacks 13.0** (Devpost, created 25 Oct 2026) and won **"[Coinbase] Best Use of x402 by Coinbase"**. It is the "human-data economy / AI-verified real-world tasks paid in stablecoin" thing, and it already implements most of the agent-native and onchain-settlement pieces in our pitch.

| Item | Detail | Source |
|---|---|---|
| Devpost | "skarl. Real-world data, verified by AI, paid out instantly." Submitted to Cal Hacks 13.0. Winner label: [Coinbase] Best Use of x402 | https://devpost.com/software/skarl |
| Repo | `stephenhungg/skarl`, "verified human data and autonomous payouts", TypeScript, created 25 Oct 2026, last push 27 Oct 2026, 1 star, no licence | https://github.com/stephenhungg/skarl |
| Live demo | https://skarl.devshardat.work (HTTP 200 on 3 Nov 2026). Testnet and test USDC only (README) | README |
| Video | https://www.youtube.com/watch?v=mSNAkI_mGPY | Devpost embed |
| Team (Devpost) | Stephen Hung, Joshua Lin, Silas Wu, Matthew Kim | Devpost |

**Workflow (from Devpost and README):**
1. The buyer web console posts a task with plain-language checks (e.g. "pick up the can"), a clip count and a per-clip price.
2. The buyer funds the order in **USDC over x402** (Base Sepolia, also Solana devnet). Funding can come from Coinbase Wallet or **directly from the buyer's own AI agent**. The buyer sets a signed **auto-pay policy**: release only if every check passes, capped at the per-clip price.
3. The contributor uses an Expo/React Native phone app with Google sign-in, sees the pay before filming and accepts the licence terms. On-screen steps guide the recording. The contributor narrates and reads **three random words aloud** as a liveness check. The phone also records IMU data.
4. Verification: FFmpeg extracts and hashes frames and audio. A **two-model Gemini "silent video jury"** must agree, and disagreements go to a human. Audio is transcribed separately and checked against what the camera saw. A **copy check** uses aligned frame hashes, so trimmed or re-encoded duplicates are caught. The output is **timestamped evidence per check** plus a review queue with reasons.
5. **Finance agents** (Claude with 24 typed ledger tools, and a Gemini agent) draft payouts and explain holds. **They can never approve their own payments.** Approval comes from the buyer's signed policy or the buyer. A **Coinbase CDP wallet policy cap** and an allowlist of signature-verified contributor addresses act as a second, independent limit. Per the team, the cap rejected an over-cap send and a send to an unknown address in testing.
6. Records: Convex double-entry ledger (integer micro-USDC), CDP webhooks, a reconciliation page (order, ledger, chain, Capital One Nessie mock bank). Each verification report is attested on **Base Sepolia via EAS** ("eleven so far", per the team). Each delivery mints a **one-of-one Solana Token-2022 licence** whose metadata hashes the dataset manifest, licence terms and contributor consent receipt.
7. Export: **LeRobot v2.1** dataset, with hand keypoints mapped to joint targets for an SO-101 arm. The team itself calls these "advisory".
8. **Agent discovery: an MCP server, `/skill.md` and llms.txt.** A personal agent can "onboard itself in one call" and buy data or do the work. A rate-limited testnet USDC faucet is included. Note: `https://skarl.devshardat.work/llms.txt` returned 404 on 3 Nov 2026. The README links `/skill.md` in `convex/lib/onboardingSteps.ts`.

**Stack (Devpost "Built with"):** Next.js 16, Tailwind, Expo/React Native, Convex (+Convex Auth, Workflow), Gemini, Claude, Coinbase CDP, x402, Base, Solana, EAS, viem, FFmpeg, MCP, Atlassian Forge/Jira ("Skarl Guard"), Capital One Nessie, Vercel.

**What the team says is not done (Devpost "What's next"):** no measured accuracy of the video checks yet; device-only wallet key; no ARKit depth/pose or head-mount mode; testnet only; no bank cash-out; no pilot with a data company yet.

**Other things named "Skarl":**
- **SKARL / "skarl_ai" token** on Robinhood chain (Pons V2). Tagline: "Turning human actions into robot training data". About $3.3K market cap, 2 holders, "Age 6 hours" when crawled. Link to the Cal Hacks team: **UNVERIFIED**. It looks like a copycat token. https://www.geckoterminal.com/robinhood/pools/0x5ec84adf30fc2925a2669ec158eee66b130f0619
- The other results are unrelated: Star Wars, Neopets "King Skarl", Lord Dunsany's *Gods of Pegana*, and a gamer handle.

---

## 2. The nine references

| # | Name / URL | Exists? | What it actually does | Who pays whom | Pricing / payout (public) | Funding / volume |
|---|---|---|---|---|---|---|
| 1 | **Waffle Video GRID** — https://grid.wafflevideo.ai/ | Yes | B2B marketplace for video data. Buyers post briefs (new capture or existing footage). Vetted **production partners** (capture companies) bid with capacity and a rate. Buyers start with a sample or pilot. Optional capture in the Waffle app, which locks resolution, orientation and sensors (IMU, LiDAR) and records consent. Every check is labelled by method (metadata / partner-declared / not checked) | Buyer pays the partner, with Waffle fees "confirmed before committing" | Free to submit a request. Project pricing agreed with the partner. Not public | "390,000+ contributors as declared by partners" (CR). Backed by Mucker Capital (MuckerLab 2025) and Hallstone Ventures (CR, wafflevideo.ai/about). Hallstone investment reported 11 Jun 2026 (postPerspective) |
| 2 | **Taught** — https://www.taught.life/ | Yes, **pre-launch** (early access, US only, 18+) | Consumer app: film first-person "Lessons" of chores. A quick automated check, then **human review**. Accepted Lessons licensed to robotics buyers. There is also a "for robotics" page for commissioned Campaigns | Robotics buyer pays Taught. Taught pays the "Teacher" a base award plus a royalty share | Base award in "Gold", redeemable for gift cards. **Royalty share 40% (Level 1) to 70% (Level 5)** of licensing revenue on non-exclusive Lessons. Buyer-funded Exclusive Lessons pay a one-time award. Example awards 65–140 Gold | No funding found. Taught's own Index says it "has not launched its marketplace and has no observed Teacher earnings" (24 Sep 2026) |
| 3 | **micro1 "get paid to record tasks"** — https://www.micro1.ai/get-paid-to-record-tasks | Yes | Recruits skilled trades workers (plumbers, electricians, carpenters) to record real job-site tasks on a wearable camera or phone, for robotics/AI customers | Customer pays micro1. micro1 pays contributors "for approved recordings" | Page: **Plumbers $20–$30/hour**. MIT Tech Review (1 Apr 2026): a Nigeria-based Micro1 recorder earns $15/h | Series A $35M at $500M valuation (TechCrunch, 12 Sep 2025). Over $100M at $4B (Forbes ME, 26 Sep 2026). "Surpassed $1B annual run rate" (micro1 blog, 12 Oct 2026, CR) |
| 4 | **Handkin** — https://handkin.ai/ | Yes | Task board: film first-person, hands-in-frame episodes (head strap required, reimbursed). Also browser labelling and AI-feedback tasks. **Human reviewer** per episode, with rejection reasons. Curated, face-blurred datasets for its own and partner models. Also signs up businesses (restaurants, cleaners) whose staff record on shift | Data customers pay Handkin. Handkin pays contributors | Per task and per region, e.g. **$4.20 per "fold laundry" task**, **$0.45 per usable minute** for free-form sessions, short tasks $2.60–$4.20, labelling $1.10–$3.20. Payouts **on the 7th and 21st**, no minimum. 70% quality threshold | Site counters (CR): **$10M+ paid to contributors, 10,000+ people, 2M+ episodes approved**. No funding found |
| 5 | **Latent Energy** — https://latentenergy.com/ | Yes, but **it is not a data marketplace** | latentenergy.com is a **Puerto Rico solar and battery installer** (Spanish-language site, priced systems $1,999–$39,900). Sister site **latentenergy.ai**: "physical intelligence, as a service", a vertically integrated robotics company. Its own solar crews record installs with head-mounted stereo and handheld grippers to train future machines. Data is "owned end to end" | Not a buyer↔contributor market. Solar customers pay Latent | Not applicable | None found. **The earlier session note ("funded orders, acceptance-based pricing and robotics data delivery") is not supported by either site: UNVERIFIED / likely wrong entity** |
| 6 | **Scale AI Physical AI** — https://scale.com/physical-ai | Yes | Enterprise "Physical AI Data Engine": data factories, at-home distributed collectors, in-field deployments. Teleop bimanual rigs plus a robotless egocentric "Scale Harness". Annotations. Datasets fine-tuned and evaluated by Scale before listing. SOC 2 / ISO 27001 | Robotics labs pay Scale (white-glove contracts) | Not public | "1000+ hours of demonstration data ... every day" (page, CR). "More than 100,000 production hours" (Scale blog, 24 Sep 2025, CR). Named customers: Generalist, Physical Intelligence, Cobot (CR). Meta investment valuing Scale at $29B+ (Scale blog, 12 Jun 2025). Reuters/TechCrunch: about $14.3B for 49% |
| 7 | **Figure AI "Index"** — https://www.figure.ai/news/introducing-index | Yes (25 Aug 2026) | Figure-exclusive consumer app ("Creators") filming home and workplace tasks for its Helix model. Pipeline: filtering, fraud review, embedding dedup, rebalancing, captioning. Figure says vendors "couldn't hit the throughput, diversity, or quality bar", so it built this in-house | Figure pays Creators directly | Paid per minute. Rate not published (per Taught Index) | (CR, 25 Aug 2026) 264K downloads, 108 countries, 44K WAU, 16M+ videos, **$15M paid to Creators**, **committed to spend >$1B on data and compute over the next 12 months**. Update via Humanoid Robot Geek (24 Oct 2026) citing the 22 Oct all-hands: 37.5M videos, 1.26M downloads, about $8.1M spent on data collection in one week (CR, secondary report) |
| 8 | **Awign** — https://awign.app/ (also https://www.awign.com/) | Yes | India "Work-as-a-Service" gig platform. Lists "Egocentric Video Data for Robotics": 4K first-person capture, head-mounted cameras, annotation and QA. Also runs annotation, audits and field staffing | Enterprise clients pay Awign. Awign pays its workforce via its app ("99.5% paid every 7 days") | Not public | Site (CR): 1.5M+ workforce, 30M+ tasks, **1000+ h/day egocentric video**. An Awign exec on LinkedIn (18 Aug 2026, CR) says **10,000+ h/day for major US robotics labs**. Majority-owned by Mynavi (Mynavi release 2 May 2024; Entrackr 5 Jul 2024: $24.5M Series C, Mynavi 73%) |
| 9 | **Troveo** — https://www.troveo.ai/ | Yes | Licensing marketplace: aggregates **existing** footage (creators' unused "dark content", publishers, studios) and licenses curated, metadata-tagged, BIPA/CUBI-checked datasets to AI labs ("Mag 7" clients, CR). Not task-based capture | AI labs pay Troveo. Troveo pays content owners **only when footage is licensed** (support KB) | Per deal. CEO: AI companies pay "**up to $1,000 per hr**" for premium, multi-camera, annotated video (Media & the Machine, 27 May 2026, CR) | $4.5M seed (Hollywood Reporter / CDP Institute, Nov 2024). "Paid out over $20M to content owners", 8M h video, 4M h audio (CEO, 27 May 2026, CR). Site: 1M+ hours delivered to one client (CR) |

**Notes**
- **None of the nine mentions stablecoins, x402, MCP or agent APIs** on the pages fetched. The term grep returned nothing, and GRID, Handkin and Troveo have no llms.txt (404). Taught has an llms.txt, but it is an SEO-style index, not a procurement interface. Payout rails are fiat or gift cards.
- Verification today is **human review** (Taught, Handkin, Figure analysts) or **method-labelled checks** (Waffle). Figure runs automated filters, then human fraud audit and embedding dedup. AI-only acceptance is not the incumbent norm.
- Waffle's "Waffle Standard" check labels ("metadata, a hash, or a declaration is not proof of originality, of rights, or of usefulness") are the closest thing among the nine to a portable verification-record convention. They are off-chain and platform-specific.
- Waffle appears to have moved from a consumer "missions" app to a B2B platform plus GRID. RobotTraining.jobs says WIRED (May 2026) saw missions paying $25/h of video. **UNVERIFIED** at WIRED itself. A "30% revenue share" claim (startuply.vc, 24 Sep 2026) cites a "Perplexity Sonar" brief: **UNVERIFIED**.

---

## 3. Other players (2025–2026), crypto and agent-native first

| # | Name | What it is | Agent-native / onchain? | Source (date) |
|---|---|---|---|---|
| 1 | **Vangrid** | Ground-level 3D capture data for physical AI. **Agents commission captures in one HTTP call: x402 pays a USDC bounty on Base or Arc into onchain escrow. A person films it, the agent accepts via API, escrow releases, and the GLB is delivered.** Also x402 pay-per-request for captures "already attested on Base" | **Yes, both, live docs** | https://docs.vangrid.io/api/agent-bounties ; https://docs.vangrid.io/api/pay-per-request ; Crypto Briefing (30 Sep 2026) on Circle Arc |
| 2 | **Thenar** (ETHOnline 2026) | Browser teleop of a 6-axis arm with a MuJoCo physics score, paid in USDC from Arc escrow. World ID Selfie Check per wallet. Lab budget in a policy-capped Privy wallet. **Recordings sold to AI agents over x402 on Hedera**, with the sale hash logged to HCS. Corpus tokenised via Hedera Asset Tokenization Studio | **Yes** (Hedera x402 + World + Arc), testnet | https://ethglobal.com/showcase/thenar-n0ma1 (no prize shown) |
| 3 | **WorldMod** (ETHOnline 2026) | Phone-web capture of 15-second tasks for robot training. Buyer escrows USDC. World ID Selfie Check. Device-side hashing and signing, gyro-vs-video replay check, dedup. **Buyer's acceptance threshold checked in a Chainlink CRE Confidential Workflow.** Dataset registry on Sepolia and Hedera, tokenised as a Hedera bond | Onchain yes. Agent-native not stated | https://ethglobal.com/showcase/worldmod-ydh8h (no prize shown) |
| 4 | **Hands Unchained** (ETHGlobal Lisbon 2026) | Permissionless remote teleop labour market, SO-101 or MuJoCo rigs. World ID gate. Only AI-graded work is paid. Outputs LeRobot episodes | Onchain yes. **Finalist, World 1st, 0G 2nd** | https://ethglobal.com/showcase/hands-unchained-6kdf3 |
| 5 | **BitRobot – SeeSaw SN/02** (by Virtuals) | Subnet where contributors record short real-life "quests". Validated by BitRobot's "Verifiable Robotic Work" and **rewarded onchain** | Onchain token rewards. Not agent-procured | https://bitrobot.ai/publications/introducing-sn-05-seesaw-by-virtuals (22 Oct 2025) |
| 6 | **OpenRoboto Shift** (Bittensor SN80) | Egocentric workplace video. Subnet emissions reward **accepted recording hours**. Buyers commission proprietary datasets. OR-S1 stereo head device at $699 | Onchain (emissions) | tao.media (22 Sep 2026) |
| 7 | **PrismaX** | Teleop and egocentric robotics data service, "VLA Foundry" operator earnings. $11M round led by a16z crypto CSX | Crypto-backed coordination layer. Settlement details not reviewed | https://prismax.ai/ ; The Robot Report (18 Jun 2025) |
| 8 | **ZenO** | Egocentric audio, video and images from smart glasses and phones, anonymised and structured for physical AI. Built on **Story** L1 (IP/licensing). Public beta 6 Feb 2026 | Onchain (Story) | Chainwire (6 Feb 2026); https://zen-o.xyz/ |
| 9 | **HumanOps** | Generic "hire humans for AI agents" API plus **MCP server (16 tools)**. Includes photo capture and field inspection. "AI verifies proof, **USDC settles instantly on Base**", with escrow and KYC operators | **Yes, both** (general tasks, not training data) | https://humanops.io/ |
| 10 | **Open Bounty** | "First x402-native marketplace for humans and agents." Agents post bounties, an **independent quorum** verifies evidence, x402 USDC settles before delivery unlocks | **Yes, both** (general tasks) | https://openbounty.app/ |

**Also seen, not reviewed in depth:**
- Crypto or agent-to-human: RentAHuman.ai (about 110K sign-ups, USDC; KuCoin flash, 5 Feb 2026, secondary), Execution Market (38 MCP tools, multi-chain escrow), HumanEndpoint (x402 on Base), WURK (x402 + Tempo MPP), Embra (USDC rewards for robotics data), Sapien, KGeN, HUMAN Protocol, Robotin, Vader, Caspius, Reborn.
- Hackathon precedents: GeoTruth (Stellar x402 hackathon: agent pays humans for GPS-verified photos), HumanOS (ETHGlobal NY 2025, Hedera 2nd), isaac protocol (ETHOnline 2025), Dashmint (HackMoney 2026, Story), DataNexus (Solana x402: agents buy datasets).
- Non-crypto egocentric vendors: Mecka AI, Claru, Firsthand, EgoVista, ActiScale, Bender, Loopuman, DataClue, Maxinsights, Objectways, Human Archive, Mercor Robotics, DoorDash Tasks, Kinetic Blocks (humanoid-data marketplace beta, 1 Sep 2026).

---

## 4. Demand evidence (source and date on every line)

**Lab and big-company programmes**
- **Figure**: Index launch. $15M paid to Creators and a commitment to spend >$1B on data and compute in 12 months (figure.ai, **25 Aug 2026**, CR). Later: 37.5M videos and about $8.1M data-collection spend in one week (Humanoid Robot Geek on Figure's 22 Oct all-hands, **24 Oct 2026**, CR).
- **Figure / Brookfield "Project Go-Big"**: egocentric human video across Brookfield's 100K+ residential units (figure.ai, **18 Sep 2025**, CR).
- **DoorDash Tasks**: pays couriers to film household tasks for AI and robotics (DoorDash newsroom and TechCrunch, **19 Mar 2026**). WIRED reported $15/h (**21 Mar 2026**, via RobotTraining.jobs).
- **Scale AI**: 100,000+ production hours; customers Generalist and Cobot (scale.com/blog, **24 Sep 2025**, CR).
- **micro1**: robotics programmes. A 360° vehicle-recording programme at $15–20/h per approved video (job post, **4 Oct 2026**, via RobotTraining.jobs).
- **Reka**: released RekaDaily-10k, 10,000+ h of first-person household video collected via Claru, Apache 2.0 (**6 Aug 2026**, via RobotTraining.jobs).
- **LG Electronics**: targets 100,000 h of humanoid data in-house by end of 2026 (Korea Herald, **18 Aug 2026**, via RobotTraining.jobs).

**Contract volumes (CR)**
- RoboX: "first contract covering more than 1 million hours of egocentric video" (LinkedIn, **27 Aug 2026**).
- Maxinsights: supplied all 200,000 h behind Genesis AI's GENE-26.5 (The Next Web, **23 Oct 2026**).
- Mecka AI: run-rate above $100M in June 2026 (BetaKit, **7 Oct 2026**).
- Robo.ai (NASDAQ: AIIO): first order for 30,000 h of embodied-AI data (PR Newswire, **12 Feb 2026**).
- Noitom: single-customer orders growing "from tens of thousands of hours toward a million hours" (China Securities Journal, **19 Oct 2026**).

**Prices**
- **Buyer side, per hour of data** (RobotTraining.jobs compilation of 11 published buyer prices, checked **18 Oct 2026**, secondary with linked primaries):
  - Robotics Center list prices: $90/h for unlabelled household egocentric 1080p, $450/h for VR-teleop arm episodes, $1,200/h for humanoid bimanual dexterous teleop (10 h minimum).
  - Pantheon: about $60/h off-the-shelf and up to $150/h custom UMI data (**6 Oct 2026**).
  - Construction Physics: $60–100/h (**15 Oct 2026**).
  - Inc42: India annotated egocentric $15–50/h, Human Archive about $1–10/h (**1 Jul 2026**).
  - China: 200–500 yuan/h (The Paper, **6 May 2026**).
- Other price quotes:
  - DataClue: "from $20/h raw; $30–40/h annotated", 1.5M+ h in stock (dataclue.app, CR, undated).
  - ActiScale: "from $8/hr" (actiscale.ai, CR).
  - Robotics Summit write-up: general non-exclusive egocentric "settling around $40–60 per hour" (Nexus Data Strategy, **28 May 2026**, opinion).
  - Troveo CEO: "up to $1,000 per hr" for premium video (**27 May 2026**, CR).
- **Contributor side:**
  - Taught Index: TaskVerse $4 per approved hour, Mercor $12–18 per approved hour paid to the business, EgoVista €7–20/h, Firsthand $38 per session hour, Dexmate $20–30/h, Tesla Optimus $30/h plus equity. "0 programs" promise relicensing royalties (taught.life, **24 Sep 2026**).
  - RobotTraining.jobs: median stated US pay $25.25/h across 26 rates (**18 Oct 2026**).
  - India: ₹250–400/h (TechCrunch, **26 May 2026**). Objectways about $2.60/h in Karur (NPR, **14 Oct 2026**).

**Pain points other sources raise (relevant to verification and payout)**
- Skarl's own research (Devpost, Oct 2026): App Store reviews complain about payouts pending for weeks and clips rejected without reasons. One vendor estimates about 90% of bulk footage is discarded for a specific robot task. Duplicate re-uploads under new filenames. These are the team's claims and the underlying sources are not named: **UNVERIFIED**.
- Figure: "Uploaded is not the same as usable"; cleaning and labelling is "a big job of its own" (24 Oct 2026, secondary).

---

## 5. Implications for our differentiation (factual)

1. **The "agent-native + onchain settlement" wedge is already shipped in several places.**
   - **Skarl** (Cal Hacks 13.0, 25 Oct 2026) already has: x402 USDC funding by a buyer's agent, MCP/skill-file agent onboarding, a finance agent that proposes but cannot approve, policy plus wallet-cap enforcement, EAS attestations of verification reports, a Token-2022 licence per delivery and LeRobot export. It won Coinbase's x402 prize.
   - **Vangrid** runs production docs for agent-commissioned, x402-funded, escrowed human captures on Base and Arc.
   - Generic agent-to-human USDC task markets (HumanOps, Open Bounty, RentAHuman) exist.
2. **Our sponsor combination has been done at ETHGlobal within the last few months.**
   - **Thenar** and **WorldMod** (ETHOnline 2026) both combine robot-training data capture with World ID Selfie Check and USDC escrow.
   - Thenar sells data to agents via **Hedera x402**. WorldMod uses **Chainlink CRE** for acceptance and Hedera tokenisation.
   - **Hands Unchained** (Lisbon 2026) was a finalist with World and 0G.
   - Judges may have seen these.
3. **Gap not found in what was reviewed:**
   - No open, vendor-neutral task and verification-record format that **existing** vendors (GRID, Handkin, Taught, Awign, Troveo) publish to or consume.
   - None of the nine incumbents exposes agent/x402 procurement or onchain settlement.
   - Every crypto entrant above is a vertically integrated marketplace with its own supply, not an interoperability layer. Waffle's method-labelled checks are the nearest incumbent analogue, and they are off-chain.
   - "Works alongside existing vendors" is therefore the part of our claim not contradicted by evidence. "Agent-native" and "stablecoin settlement" on their own are not differentiators.
4. **Supply and price context:** incumbents operate at 1,000–10,000+ h/day (CR) and contributor rates of about $1–$50/h. Buyer list prices for plain egocentric video start in single or low double digits per hour. A hackathon build cannot compete on supply, so evidence quality and record portability are the defensible axes.
5. **Verification caveat:** incumbents rely on human review plus dedup. Skarl itself says it has no measured accuracy for its AI checks. Any "AI-verified" claim we make should come with a measured false-accept / false-reject number, or be labelled as unmeasured.
