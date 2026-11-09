# 11 — Niche and use case: where Agentic Data Exchange is sharpest

> **Written:** Fri 6 Nov 2026, about 06:40 IST, during the hack. Timebox about 40 min. Exa search and fetch, plus files 00, 01, 03, research/03, 04, 05 and 07.
> **Labels:** **(CR)** = company-reported. **(2nd)** = secondary source that links its primaries. **(inference)** = our reasoning, not a sourced fact. Every link below was fetched or returned by Exa on 6 Nov 2026 with the date shown.
> **Bottom line:** the sharpest niche is **gap-driven, diversity-quota robot manipulation demos**. The buyer is the lab's own procurement agent. It buys only the slices its policy fails on, at one clip per verified human, and every accepted clip carries a **contributor-owned, expiring licence on Arkiv** that buyer agents must re-check before they train. See §3.

---

## 0. What the evidence changed in our thinking (read this if nothing else)

1. **Buyers price and judge data per *accepted* unit, and by diversity, not by volume.**
   - EGXO: "Compare cost per accepted, rights-eligible, ingestible hour or episode". Its page also has a route "for human and automated procurement".
   - Dovra: "a human QA gate that rejects footage before you pay for it, and pricing per approved hour".
   - Firsthand bills "per validated hour".
   - Encord: "Diversity matters more than volume… operator demographics… scripted failure scenarios".
   - Figure Index reports "per 1,000 hours… 373 unique tasks, 1,146 unique manipulated objects, 116 unique environments" and runs "fraud review" and "rebalancing" stages.
   - **Takeaway: "pay only for accepted episodes" and "count distinct humans" are what buyers already want.** x402 and World ID map onto both directly.
2. **Account farming breaks dataset diversity, not just payouts.** Didit (29 Oct 2026, a KYC vendor, so it has a commercial interest): "A lab buying ten thousand hours… is paying for thousands of different people… If a few hundred people sit behind thousands of accounts, the dataset is duplicated and skewed in ways nobody sees on a dashboard."
   - **Takeaway: World ID is a dataset-quality primitive ("N unique humans"), not only an anti-double-pay check.** That is a stronger pitch to World judges than "one human, one payout".
3. **Consent is becoming a live, revocable thing, and India is the timely place to say so.**
   - The DPDP Rules were notified 13–14 Nov 2025.
   - **Consent Manager registration (Rule 4) commences 13 Nov 2026, one week after this hackathon.** The main Data Fiduciary duties commence 13 May 2027 (TruePrivacy, 1 Nov 2026).
   - Predusk (16 Jun 2026) on AI teams: they need "consent lineage per record" and "withdrawal propagation… which dataset versions… which model checkpoints".
   - Indian egocentric collection is already under scrutiny. Scroll (20 May 2026) quotes factory workers who did not know what they were filmed for. Bloomberg (12 Aug 2026) and Inc42 (1 Jul 2026) report similar cases.
   - **Takeaway: an Arkiv entity that the contributor owns, that expires, and that the contributor can delete is a licence a buyer agent can actually check.** This makes Arkiv ownership and expiry the core mechanic, which is what Arkiv's past winners did.
   - Honesty line: we are **not** a DPDP Consent Manager. That is a regulated role for an Indian company with ₹2 crore net worth. We produce per-record consent lineage that such a system could consume.
4. **x402 v2 supports dynamic `payTo`**, a function per request intended for marketplaces (Canteen x402 v2 release notes, 1 Dec 2025; Alchemy, 10 Apr 2026).
   - **Takeaway: the buyer agent's x402 payment can go straight to the contributor's Hedera account, with no platform custody.** Skarl had to admit "do not call it noncustodial escrow". On Hedera, `payTo` must be a real `0.0.x` account associated with USDC `0.0.429274` (research/02 §x402 #3, #10).
   - We have not yet confirmed that the Hedera scheme accepts a function `payTo`. **Smoke-test it in the x402 spike.**
5. **Vangrid already lets agents commission captures over x402** (research/03). "The agent posts a bounty and pays over x402" is therefore not new on its own. What nobody else has is the combination of: (a) the agent *deciding* what to buy from its own eval gaps, (b) unique-human quotas anyone can audit, (c) licences the contributor owns and that expire, and (d) open records that any vendor can publish to.

---

## 1. Candidate niches (6)

Sponsor-fit scores run 1–5. **Hedera** = is x402 natural, with an agent paying and no human approving? **Arkiv** = are expiry and ownership the core mechanic, with user-facing reads? **Swarm** = does encrypted media on Swarm make sense? **World** = is "one human" essential to the value?

### N1. Gap-driven robot manipulation demos with unique-human quotas — **RECOMMENDED** (§3)

- **What it is.** A lab's procurement agent reads its policy's eval failures, for example "pour into a steel tumbler: 3/10 success" or "left-handed grasp of a transparent cup: 2/10". It posts micro-tasks for exactly those slices, with a quota such as "8 accepted clips from 8 distinct humans, by 18:00". Humans film 10–20 s first-person clips on a phone. It pays per accepted clip.
- **Who pays (named, with evidence):**
  - **Figure**: Index app, "$15M paid to Creators", "committed to spend >$1B on data and compute" (figure.ai, 25 Aug 2026, CR). Figure says vendors "couldn't hit the throughput, diversity, or quality bar".
  - **Physical Intelligence**: showed human-to-robot transfer emerging at scale from egocentric human video (pi.website, 16 Dec 2025). Midcentury post-trained π0.5 on egocentric data (29 Oct 2026). PI pays robot operators $25/h (Ashby, 6 Aug 2026, via RobotTraining.jobs).
  - **Tesla Optimus**: data collection operators at $22.73–31.05/h in Littleton (28 Oct 2026 listing) and $30/h plus stock in Palo Alto (recruiter post, 14 May 2026).
  - **Sunday Robotics**: "up to $60 per hour of approved data" for remote household demos (19 Nov 2025). **1X** $28–36/h. **Dyna** $30–32/h. **DoorDash Tasks** $15/h (WIRED, 21 Mar 2026). **micro1** $15–50/h. **Claru** $5/h in Asia including India (26 May 2026). All of these are via RobotTraining.jobs (2nd).
  - **Scale AI Physical AI**: "100,000+ production hours"; customers PI, Generalist, Cobot (CR).
  - **Encord**: runs an egocentric capture operation (TechCrunch, 26 Jul 2026; Encord Data Labs, 20 Oct 2026).
- **Buyer prices:**
  - $90/h unlabelled household ego 1080p, 10 h minimum (Robotics Center list price, 18 Oct 2026).
  - $30–49 per *accepted* hour for custom VR ego (EXYLOS, 18 Sep 2026).
  - $15–22 raw / $30–40 annotated per finished hour (DexSet via EGXO, 5 Oct 2026).
  - India annotated ego $15–50/h, and Human Archive $1–10/h (Inc42, 1 Jul 2026).
  - Programs run about $60K–$400K+ (LXT via EGXO).
- **Why the three primitives matter *here*:**
  - **Agent buyer:** the procurement decision *is* a model output: eval fails → slice → task. Doing it per slice, many times a day, is a machine loop and not work for a human buyer (inference). Figure already "rebalances" diversity algorithmically.
  - **One human per claim:** "operator and demographic diversity: different body sizes, hand shapes, dominant hands" (Encord). The quota "8 distinct humans" is only meaningful if 8 accounts are not one person (Didit). The World nullifier, scoped per campaign, makes "distinct humans" a guarantee instead of a dashboard guess.
  - **Open Arkiv records:**
    - The task listing expires at its deadline.
    - The claim is a 3-minute reservation entity whose expiry doubles as the anti-pre-render window (see fraud below).
    - Verdicts, receipts and the manifest's "unique humans" count can be queried by anyone, including a second vendor that wants to fill the same quota.
    - The licence entity is owned by the contributor (`changeOwnership`) and expires.
- **Demo-ability on a phone at the venue: 5/5.** Pouring water into a cup, opening a bottle, plugging in a charger, or "knock the cup over and recover it" (N2) all take about 15 s and need no props beyond a cup.
- **Fraud surface:**
  - Account farms and rented accounts: World ID at claim. Renting a *real* verified human is still possible, so re-verify at every claim and say so honestly.
  - Replay and re-encode: dHash buckets on the submission entity enable cross-vendor duplicate lookups.
  - **AI-generated video:** a random challenge (spoken word plus finger count) is issued *at claim time*, and the claim entity expires in about 3 min. You cannot pre-render a clip for a challenge you have not seen. Real-time generation inside 3 min is hard but not impossible, so label the check "raises cost, not proof".
  - Off-task clips: the model observes, deterministic code decides (Skarl idea #1, re-implemented), with a human-review band.
- **Sponsor fit:** Hedera **5** · Arkiv **5** · Swarm **4** (accepted clips encrypted on Swarm, key released on purchase) · World **5**.

### N2. Failure-and-recovery demonstrations (a premium task family inside N1)

- **What it is.** Humans stage a small failure (dropped object, misgrasp, spill) and film the correction.
- **Evidence of need:**
  - Research shows success-only demos plateau and recovery data is scarce and hard to collect by teleop: RaC (arXiv 2509.07953, Sep 2025), **EgoRecovery** (arXiv 2607.19745, 22 Jul 2026, explicitly *human* recovery demos), RePO-VLA (May 2026).
  - EGXO lists "hard cases, failures, and recovery behavior" as a price driver. Encord lists "scripted failure scenarios".
  - We did **not** find a published per-hour price for recovery data specifically. Present it as a premium tier (inference).
- **Why it matters:** this is the slice an eval-driven agent asks for most, because it is exactly where policies fail. Verification is also more convincing: the verifier must find a failure event *and* a correction, with timestamps.
- **Demo:** the most memorable clip on stage. Knock a paper cup over, right it, refill it. **Fraud** and **sponsor fit** are the same as N1. **Recommendation: use it as the second task in the N1 demo, not as a separate product.**

### N3. Indic-language speech: code-mixed voice commands with unique-speaker quotas

- **Who pays:**
  - **Karya** pays speakers about $5/h, roughly ₹455 (NDTV, 18 Feb 2026; Forbes India, 16 Jun 2025). It has 30,000+ workers in 25+ states (CR) and sells to big-tech buyers (NITI frontier-tech page, 19 Jun 2025).
  - **Project Vaani** (IISc, ARTPARK, Google, Bhashini) has 31,255 h from 156,000 speakers across 165 districts (HF blog, 24 Apr 2026) and targets about 1M speakers.
  - **Shunya Labs** Vak trained on Vaani (ET, 11 May 2026).
  - Call-centre audio in 12 Indian languages is being actively sourced (LinkedIn, 1 Sep 2026).
- **Prices:**
  - Custom-recorded speech has a median of **$124 per audio hour**. Catalogue speech is $119 commercial or $15 research. Completed sales went for $73. Speakers are paid a median of $25 per approved hour (AIData.Broker, 26 Oct 2026, 2nd).
  - Hindi datasets are priced partly on "how many distinct speakers you need" (aidataservices.in, 1 Aug 2026).
- **Why the primitives matter:**
  - **Unique speakers is *the* quality metric** in speech corpora. Common Voice has known speaker-heterogeneity problems per client ID (Interspeech 2025). World ID makes speaker count honest.
  - The agent buyer is an ASR training pipeline filling dialect gaps.
  - Arkiv: the same task, quota and licence pattern.
- **Demo-ability: 5/5.** A 5-second Marathi or Hindi phrase at the venue. Verification is the **most measurable**: WER against the prompt, a speaker-embedding dedup and a TTS detector. We could ship a real accuracy table.
- **Fraud:** voice cloning and TTS, and one speaker on many accounts.
- **Sponsor fit:** Hedera 5 · Arkiv 4 · Swarm 3 · World 5.
- **Why not the lead:** it drops the robotics/video story that the Arkiv contact liked (03, workshop outcome). Speech data is a mature, cheap market with less "wow", and SonicIP-style voice-data projects exist. **Best fallback** if video verification proves too flaky in the build.

### N4. Indian Sign Language (ISL) video

- **Who pays:** **Talksign** Marketplace (launched 24 Aug 2026) pays signers **$10–30/h** across 7 sign languages (Founderland, 29 Aug 2026). Otherwise mostly academic or community efforts, such as Project Sanket and student ISL datasets on GitHub. This is a small, grant-driven market.
- **Why the primitives matter:** signer diversity is essential, and one-human-per-claim fits. Contributors are a vulnerable group, so licences they own and can revoke are a strong ethical story.
- **Demo: 2/5.** We need a real ISL signer, and our AI cannot verify sign correctness. Without a human reviewer, the verifier would be faking it.
- **Fraud:** low volume, and verification itself is the risk. **Sponsor fit:** Hedera 3 · Arkiv 4 · Swarm 3 · World 5. Good mission, bad hackathon demo.

### N5. Retail shelf and price audits (perishable ground truth)

- **Who pays:** CPG brands and quick-commerce price-intel teams. **$20 per completed, verified store visit** (PlanoIQ, 9 Oct 2026). Third-party shelf audits run **$20–50 per store visit** (VisionGroup, 6 Apr 2026). Field Agent, clickworker and, in India across 500 districts, Anaxee (30 Oct 2026).
- **Why the primitives matter:** **Arkiv expiry is perfect**, because a shelf observation is stale within hours. x402 is natural: an agent pays per fresh observation. **World is weak**, though. What matters is presence at the store (GPS, venue), not personhood, and one auditor can legitimately do many stores.
- **Demo: 3/5.** Use the venue café counter as the "shelf". It is not AI-training data, so it drifts from the concept and the competitor research.
- **Fraud:** GPS spoofing and photo reuse. **Sponsor fit:** Hedera 4 · Arkiv 5 · Swarm 2 · World 2.

### N6. Street-level and venue mapping (considered, rejected)

- **Already crowded:**
  - **Vangrid**: agent x402 bounties for 3D captures.
  - **Bee Maps/Hivemapper**: USDC rewards became the default in Aug 2026 (beemaps.com, 16 Jul 2026), plus a pay-as-you-go data API (6 Mar 2026).
  - **NATIX**.
- Value comes from devices and coverage, not unique humans. **Sponsor fit:** Hedera 4 · Arkiv 4 · Swarm 3 · World 1. Skip.

### Score table

| Niche | Real buyers + prices | Primitives essential? | Venue demo | Verifiability | Hedera | Arkiv | Swarm | World | Total /20 |
|---|---|---|---|---|---|---|---|---|---|
| **N1 + N2 gap-driven manipulation + recovery** | Strong (Figure, PI, Tesla, Sunday, Scale, Encord; $30–90/accepted h) | All three | 5 | Medium (LLM + rules, human band) | 5 | 5 | 4 | 5 | **19** |
| N3 Indic speech | Strong (Karya, Vaani, $124/h custom) | All three | 5 | **High** (WER) | 5 | 4 | 3 | 5 | 17 |
| N4 ISL | Weak (Talksign) | World strong | 2 | Low | 3 | 4 | 3 | 5 | 15 |
| N5 shelf audit | Medium ($20–50/visit) | World weak | 3 | Medium | 4 | 5 | 2 | 2 | 13 |
| N6 mapping | Crowded | World ≈ none | 3 | Medium | 4 | 4 | 3 | 1 | 12 |

---

## 2. What the x402 endpoint sells, per niche (natural, not forced)

Hedera requires an agent or client that **finds** the endpoint and pays it with **no human approving**. In every niche below, discovery happens through an Arkiv query. The accepted-submission entity carries `endpoint` (str ≤128 B) and `price` (dec) attributes, so the agent never uses a hard-coded URL.

| Niche | x402 resource (what is bought) | Price shape | `payTo` | Paying agent | Why it is natural |
|---|---|---|---|---|---|
| **N1/N2** | **`GET /episodes/{submissionKey}/licence`** returns a licence grant (signed JSON) plus the Swarm reference and a decryption key wrapped to the agent's public key. It answers **402 only if the verdict is `accept`**, and 409 for `review` or `reject`, so the agent *cannot* pay for a reject. | Bounty per accepted episode (demo 0.50 USDC; recovery tier 1.00) | **The contributor's own `0.0.x` account** via dynamic `payTo`, so the lab pays the human directly and the platform holds no funds | The lab's **procurement agent**, with a signed budget policy (cap, per-clip max, payee allowlist = contributors on accepted Arkiv verdicts signed by our verifier) | This is "price per approved hour, don't pay for rejects", the unit buyers already ask for (§0.1), made atomic |
| N1/N2 (2nd resource) | **`POST /verify`**: verification-as-a-service. Any vendor's agent submits a clip hash plus a Swarm reference and a task key. We run the rubric and write an `adx.verification` entity signed by our verifier wallet. | Small fee (0.05) | Platform | A **second vendor's agent** (e.g. a script acting as "Vendor B") | Proves the open-layer claim: other suppliers buy our verifier's signature and fill the same quota |
| N1/N2 (stretch) | `POST /licences/{key}/renew` pays a renewal royalty before the licence entity expires. The contributor (owner) then extends it with one tap. | 0.10 per renewal | Contributor | Procurement agent at its pre-training licence check | Expiry plus ownership become a revenue line for contributors (Taught-style royalty, research/03) |
| N3 speech | `GET /utterances/{key}/licence` (audio plus transcript), and a `POST /asr-check` WER report | 0.05–0.20 per accepted utterance | Speaker | The ASR team's dataset agent filling dialect quotas | Same accept-gated purchase |
| N4 ISL | `GET /signs/{key}/licence` | Per clip | Signer | Sign-recognition research agent | Same; verification needs a human reviewer |
| N5 shelf | `GET /observations/{store}/{sku}`. The price decays with the age of the observation, and expired entities are not sold. | 0.02–0.20 | Auditor | Brand pricing or stock-out agent | Freshness-priced data is a very natural x402 fit; World is not |
| (avoid) | A paid **task feed** | — | — | — | Contradicts Arkiv: tasks are public and free to query. Don't sell what Arkiv gives away. |

**Spend controls (Hedera extra points):**
- A custom Agent Kit `AbstractPolicy`: budget cap, per-episode max, a payee allowlist built *from Arkiv* (only `payTo` accounts on accept verdicts signed by our verifier), and campaign expiry.
- Above the threshold, a **human-in-the-loop** approval. This can be World ID Agent Pass or human-in-the-loop (`docs.world.org/agents/human-in-the-loop`), which is a candidate for the World pick (Q16).
- An HCS topic as the spend log (optional).

---

## 3. Recommendation

### One-line pitch
> **"Your robot's agent buys exactly the demonstrations its model fails on, one per verified human, and pays each person directly on Hedera. Every clip's licence lives on Arkiv, owned by the person who filmed it, and expires unless they renew it."**

Shorter, for the deck: **"Gap-driven robot data, one human per clip, licences the human owns."**

### Demo flow (interactive, about 3:00)

Rules from research/07 apply: screen-recorded, with phone screens mirrored. No phone *recording* of the video itself, and a human voiceover.

| Time | What the judge sees | Sponsor proof |
|---|---|---|
| 0:00–0:15 | Hook. "Figure says vendors couldn't hit its diversity bar. A KYC vendor says a few hundred people can sit behind thousands of accounts. Here's a lab agent that buys only what its robot fails at, and can prove how many *different* humans it paid." | — |
| 0:15–0:40 | **Buyer agent** (a terminal pane, separate from our web app) loads `eval.json` (illustrative policy failures: "pour into steel tumbler 3/10", "recover knocked-over cup 1/10"). It turns them into two tasks, signs its budget policy (cap 2 USDC, 0.50 per episode, quota 3 distinct humans, deadline 2 h) and writes `adx.task` and `adx.policy` to Arkiv. | Arkiv write (Rabdi explorer link) · expiry = deadline |
| 0:40–1:05 | **Phone A** (teammate, or a judge if they're willing). The task board *reads Arkiv* and shows a deadline countdown. Tap claim → **World ID** (staging simulator or Selfie Check) → an `adx.claim` entity appears with a **3-minute expiry** and a challenge: "Say 'mango forty-two', show three fingers, then do the task." | World trust moment · Arkiv expiry as the reservation |
| 1:05–1:35 | Record about 12 s. The clip is encrypted and uploaded to **Swarm**; the hash and dHash buckets go to an `adx.submission` entity. The verifier returns per-criterion `supported / contradicted / unobservable` with timestamps and writes `adx.verification` = accept. | Swarm ref (not raw on Arkiv) · verifier-signed entity |
| 1:35–1:50 | **Alternative path:** the same human tries to claim again for the same campaign → nullifier already used → "already counted toward this quota". Optionally, a claim left idle expires on screen and the slot reopens. | World failure path · Arkiv expiry visible |
| 1:50–2:20 | **Buyer agent** polls Arkiv, finds the accept verdict, reads `endpoint` and `price`, and calls it → **402** → the policy checks cap, allowlist and price → pays 0.50 USDC through the facilitator → **directly to the contributor's `0.0.x`** → gets the licence plus the Swarm key and decrypts. Show the **HashScan** link, then the `adx.receipt` on Arkiv. No human touched it. | Hedera qualification (agent finds endpoint, pays, no human approval) · USDC · spend policy |
| 2:20–2:40 | **Phone A, "My licences"** reads `adx.licence` entities **owned by her wallet**: "expires in 30 days · Renew · Withdraw". She taps **Withdraw**, which calls `deleteEntity` from her key. | Arkiv ownership as the core mechanic, user-facing read |
| 2:40–2:55 | **Buyer agent** runs its pre-training licence check: an Arkiv query over manifest clips, owned by the contributors and still live. The withdrawn clip drops out and the manifest moves to v2. Dataset card: "unique humans 2 · live licences 1 · spent 1.00 USDC". A **third laptop** runs the same `curl arkiv_query` and gets the same answer with no help from our app. | Independent read · "swap Arkiv for Postgres and you lose this" |
| 2:55–3:00 | Close. "Tasks, claims, verdicts, receipts and licences are open records. Our app is just one client of them." | — |

### Why it beats the four prior projects

| | Skarl (Cal Hacks 13.0) | WorldMod (ETHOnline 26) | Thenar (ETHOnline 26) | Vangrid (live product) | **Us** |
|---|---|---|---|---|---|
| Who decides what to buy | Human buyer ("ask your human") | Human buyer escrows | Lab budget wallet; agents buy *existing* recordings | Agent commissions a capture | **Agent derives tasks from its own eval failures** |
| Capture | Real phone video | Real phone video | **Simulated** MuJoCo teleop | 3D scans of places | Real phone video, manipulation and recovery |
| One human per claim | None (Google OAuth) | Selfie Check | Selfie Check | None | World ID per campaign → **"N distinct humans" is a public dataset property** |
| Pay for rejects? | Prepaid treasury, payout loop never closed | Escrow, CRE threshold | Escrow | Escrow, accept via API | **Can't: x402 returns 402 only on accept, paid straight to the contributor** |
| Records | Private Convex + EAS hashes | Sepolia/Hedera registry | HCS sale log | Own API + Base attestations | **Open Arkiv entities any vendor or agent can query and publish** |
| Licence | Custodial Solana NFT | Hedera bond (platform) | Security token (platform) | — | **Owned by the contributor on Arkiv, expires, can be withdrawn; buyer agent must re-check** |

Source rows: research/03 §1, §3; research/04 §3–4; research/05 §11.

### Build implications (for the grilling round)

- Answers the open questions in 03:
  - **Q12**: demo tasks = "pour into a cup" + "recover a knocked-over cup".
  - **Q9**: x402 sells the accept-gated episode licence, `payTo` = contributor.
  - **Q8**: the independent agent = a CLI procurement agent plus a third-laptop `curl`.
  - **Grilling Q2**: the winning read = the licence check plus the "unique humans" count.
- **New entities:** `adx.policy` (signed budget, buyer-owned) and `adx.licence` (created by the platform, then `changeOwnership` to the contributor in the same `executeBatch`; expiry = licence term).
- **Contributor wallets need a little tGLM** to withdraw or renew. Pre-fund the demo wallets and log it in `docs/arkiv/friction.md`.
- **Privacy:** only per-campaign HMAC pseudonyms go on Arkiv, never the nullifier. Coarse dHash buckets only.
- **Risks to spike in hour 1:**
  - (a) dynamic `payTo` with `@x402/hedera` 2.30.0. Fallback: static `payTo` = platform, then an HTS transfer to the contributor written as a receipt, honestly labelled.
  - (b) every contributor account must be USDC-associated.
  - (c) a Rabdi reset would wipe licence ownership demo state. Keep the re-seed script.
- **Honesty lines for the README:**
  - The eval failures are illustrative.
  - Phone video is not robotics-grade; it is egocentric RGB for human-to-robot transfer research.
  - The anti-generation challenge raises cost but is not proof.
  - We are not a DPDP Consent Manager.
  - Show a measured accept/reject table on about 20 clips, or say "unmeasured".

---

## 4. Market evidence links (verified via Exa, 6 Nov 2026)

**Robotics and egocentric demand and buyers**
- Figure, *Introducing Index* (25 Aug 2026, CR): $15M paid, >$1B data and compute commitment, five-stage pipeline including fraud review and dedup, diversity per 1,000 h. https://www.figure.ai/news/introducing-index · Forbes coverage (26 Aug 2026): https://www.forbes.com/sites/johnkoetsier/2026/08/26/figure-launches-gig-platform-to-get-humans-to-do-work-to-train-robots-will-spend-1-billion/
- Physical Intelligence, *Emergence of Human to Robot Transfer in VLAs* (16 Dec 2025): https://www.pi.website/research/human_to_robot · Midcentury, *Post-training π0.5 on egocentric data* (29 Oct 2026): https://www.midcentury.xyz/blog/post-training-pi05
- Scale AI, *Expanding our Data Engine for Physical AI* (24 Sep 2025, CR): https://scale.com/blog/physical-ai
- Encord, *Egocentric data collection for robotics* (diversity dimensions, failure scenarios; updated 27 Oct 2026): https://encord.com/blog/egocentric-data-collection-for-robotics/ · *Encord Data Labs / EMG-1* (20 Oct 2026): https://encord.com/data-labs/introducing-encord-data-labs/ · TechCrunch on Encord's capture warehouse (26 Jul 2026): https://techcrunch.com/2026/07/26/are-brain-waves-the-next-unlock-for-physical-ai/
- Tesla Optimus Data Collection Operator, Littleton, $22.73–31.05/h (28 Oct 2026): https://www.justjobs.com/career/18781349/Data-Collection-Operator-Optimus-Colorado-Littleton · Palo Alto hiring event, $30/h plus stock (14 May 2026): https://www.linkedin.com/posts/mark-a-collantes_data-collection-operator-optimus-tesla-activity-7460830437024628736-sZmX
- Business Insider, startups (Encord, micro1, Scale) paying people to film chores (10 Oct 2025): https://www.businessinsider.com/ai-startups-robotics-pay-film-chores-encord-micro1-scale-2025-10
- The Verge, *Tech companies desperately want to film you doing chores* (29 May 2026): https://www.theverge.com/ai-artificial-intelligence/940007/ai-companies-will-pay-for-robot-training-data

**Prices (buyer side and contributor side)**
- RobotTraining.jobs, 50 published prices (checked 18 Oct 2026, 2nd, CC BY 4.0): $1,200/h humanoid teleop, $450/h VR arm, $90/h household ego, $60–150/h UMI; contributor pay from Sunday $30–60 per approved hour to Claru $5/h in Asia. https://robottraining.jobs/research/robot-training-data-prices
- EGXO, *Egocentric dataset price guide* (5 Oct 2026): per-accepted-hour framing, EXYLOS $30–49 per accepted hour, DexSet $15–40, LXT $60K–400K+ programs. https://egxodata.com/resources/egocentric-dataset-price
- EXYLOS, *VR egocentric pricing per accepted hour* (18 Sep 2026, CR): https://www.exylos.ai/blog/exylos-vr-egocentric-dataset-pricing/
- Dovra, *10 questions to ask an egocentric vendor* (29 Sep 2026): pay per approved hour, consent per clip, business owner can stop recording. https://dovra.ai/insights/egocentric-video-data-vendor-checklist/
- Firsthand, *validated egocentric video data*, billing per validated hour (5 Oct 2026, CR): https://www.ifirsthand.com/custom-collection/validated-egocentric-video-data

**India supply side and consent context**
- CNBC Inside India, "less than $4 for every hour" (25 Jun 2026): https://www.cnbc.com/2026/06/25/inside-india-newsletter-humans-are-teaching-robots-to-do-ai.html
- TechCrunch, Human Archive and Indian gig workers (26 May 2026): https://techcrunch.com/2026/05/26/human-archive-taps-into-indias-services-startups-to-collect-data-for-physical-ai/
- Inc42, *India trains the world's robots, but at what cost?* (1 Jul 2026): https://inc42.com/features/india-trains-the-worlds-robots-but-at-what-cost/ · Scroll (20 May 2026): https://scroll.in/article/1092960/how-big-tech-is-harnessing-the-data-of-indian-factory-workers-to-train-robots · Bloomberg (12 Aug 2026): https://www.bloomberg.com/news/features/2026-08-12/thousands-of-india-workers-are-helping-ai-firms-train-robots-to-replace-them
- DPDP Consent Manager registration opens 13 Nov 2026; main duties 13 May 2027 (TruePrivacy, 1 Nov 2026): https://trueprivacy.io/blog/dpdp-consent-manager-registration · Rules notified 13–14 Nov 2025 (Legal 500): https://www.legal500.com/intelligence/india/privacy/operationalising-india's-data-protection-regime-analysing-the-newly-notified-dpdp-rules-2025 · Consent lineage and withdrawal propagation for AI teams (Predusk, 16 Jun 2026): https://predusk.ai/resources/blog/dpdp-training-data-consent

**Fraud**
- Didit, *AI labs are buying human data. Fraud rings are selling it.* (29 Oct 2026; KYC vendor, so it has an interest): https://didit.me/blog/ai-labs-human-data-fraud-rings/
- MTurk "puppeteers" controlling multiple accounts (arXiv 2511.00195, Oct 2025): https://arxiv.org/abs/2511.00195

**Recovery data (N2)**
- EgoRecovery (arXiv 2607.19745, 22 Jul 2026): https://arxiv.org/html/2607.19745v1 · RaC (arXiv 2509.07953): https://arxiv.org/pdf/2509.07953

**Speech (N3)**
- Karya $5/h (NDTV, 18 Feb 2026): https://www.ndtv.com/india-news/ndtv-ai-summit-2026-why-manu-chopras-ai-startup-karya-pays-rs-450-an-hour-to-villagers-11052268 · Forbes India (16 Jun 2025): https://www.forbesindia.com/article/ai-special-2025/why-karyas-manu-chopra-safiya-husain-pay-people-handsomely-to-speak-local-languages/96181/1
- Vaani, 31,255 h, 156k speakers (HF, 24 Apr 2026): https://huggingface.co/blog/ARTPARK-IISc/vaani-utility
- Speech data cost medians, $124/h custom (AIData.Broker, 26 Oct 2026, 2nd): https://aidata.broker/guides/speech-data-cost

**Sign language (N4)**
- Talksign Marketplace, $10–30/h to signers (Founderland, 29 Aug 2026): https://www.founderland.ai/articles/talksign-launches-marketplace-for-sign-language-ai-datasets-mte3i9ci

**Shelf audit (N5)**
- PlanoIQ, $20 per verified store visit (9 Oct 2026): https://www.planoiq.com/blog/how-much-do-retail-shelf-audits-cost · VisionGroup, $20–50 per visit (6 Apr 2026): https://visiongroupretail.com/blog/retail-audit-software-comparison-2026

**Mapping (N6)**
- Bee Maps USDC rewards default from Aug 2026: https://beemaps.com/blog/get-paid-in-usdc-to-map-your-city

**x402 dynamic payTo**
- x402 v2 release notes (1 Dec 2025): https://thecanteenapp.com/releases/2025/12/01/x402-v2-release.html · Alchemy explainer (10 Apr 2026): https://www.alchemy.com/blog/how-x402-brings-real-time-crypto-payments-to-the-web · Security notes on dynamic payTo (dev.to, 8 Feb 2026): https://dev.to/mkmkkkkk/x402-v2-security-deep-dive-new-attack-vectors-in-ai-agent-payments-2cp2

**Not verified / gaps**
- No published per-hour price for *recovery* demos specifically.
- Figure Index's per-minute rate is unpublished.
- We have not confirmed that `@x402/hedera` accepts a function `payTo`; spike it.
- Several price pages are vendor or broker content marketing (EGXO, EXYLOS, AIData.Broker, RobotTraining.jobs): treat them as list prices, not completed sales.
