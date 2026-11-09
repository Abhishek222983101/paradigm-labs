# ETHGlobal Mumbai 2026: event facts and sponsor prize tracks

- **Accessed:** 3 Nov 2026 (prize-page data snapshot timestamped 2026-11-03 ~16:25 UTC)
- **Scope:** facts only. This is not a product design.
- **Legend:** **VERIFIED** means read on the cited primary page on the access date. **UNVERIFIED** means secondary source, inferred, or not found.
- **Method:** I read `https://ethglobal.com/events/mumbai/prizes` two ways: (1) the Exa crawler's rendered text, and (2) a direct HTTP fetch, decoding the page's embedded Next.js data (sponsor and prize JSON: names, amounts, per-place splits, category `building-from-scratch` / `continuity-track`). The two agree. Crawlers got HTTP 500 from the main event page `https://ethglobal.com/events/mumbai`, but a direct fetch still returned its embedded data (event object, schedule, FAQ), and that data is what I cite below. `/info/start` and `/info/details` rendered normally.
- **Primary URLs:**
  - Event: https://ethglobal.com/events/mumbai
  - Prizes: https://ethglobal.com/events/mumbai/prizes (per sponsor: `/prizes/<slug>`)
  - Hacker guide: https://ethglobal.com/events/mumbai/info/start
  - Submission/judging rules: https://ethglobal.com/events/mumbai/info/details

---

## 1. Event facts

All times are IST (UTC+5:30), converted from the event's UTC schedule data.

| Fact | Value | Status / source |
|---|---|---|
| Name / format | ETHGlobal Mumbai 2026. In-person hackathon (`"type":"hackathon","medium":"physical"`) | VERIFIED: event page data |
| Dates | Thu 5 Nov – Sat 7 Nov 2026 | VERIFIED: event page data (`startTime 2026-11-05`, `endTime 2026-11-07`); ETHGlobal X post 6 Oct: "join us in Mumbai, November 5–7" (https://xitter.cf/ETHGlobal/status/2107532042393330107) |
| Venue | Jio World Convention Centre, Jio World Centre, G Block, Bandra Kurla Complex, Bandra East, Mumbai, Maharashtra 400098 | VERIFIED: event page data (`venueLocation`) |
| Context | FAQ: "a 36-hour hackathon … Taking place alongside Devcon 8 India in the same venue … Build something new or take an existing project further through the Continuity Track!" Pragma Mumbai (summit) is a child event on Fri 6 Nov. | VERIFIED: event page FAQ/data |
| Registration opens | Thu 5 Nov, 13:00 | VERIFIED: event schedule |
| Partner workshops | Thu 5 Nov, 15:30–18:00 (see table below) | VERIFIED: event schedule + prizes page |
| Opening ceremony | Thu 5 Nov, 20:00 (Main Stage) | VERIFIED: event schedule |
| **Hacking begins** | **Thu 5 Nov, 21:00** | VERIFIED: event schedule ("Hacking Begins!" 15:30 UTC) |
| Registration closes | Thu 5 Nov, 22:00 | VERIFIED: event schedule |
| **Submission deadline** | **Sat 7 Nov, 09:00.** "Late submissions won't be accepted" | VERIFIED: /info/details and /info/start ("Saturday, November 7th 2026 at 09:00 am IST"); event data `submissionDeadline 2026-11-07T03:30Z` |
| Hacking hours | 36 h (Thu 21:00 → Sat 09:00) | VERIFIED: FAQ "36-hour hackathon" + schedule arithmetic |
| Judging | Main Finalist Judging and Partner Prize Judging, both Sat 7 Nov 09:30, 180 min (to ~12:30) | VERIFIED: event schedule |
| Finalists notified | Sat 7 Nov, 15:15 | VERIFIED: event schedule |
| Closing ceremony | Sat 7 Nov, 15:30 (partner winners announced here) | VERIFIED: event schedule; /info/details "Partner prize winners will be announced during the closing ceremony" |
| Event ends | Sat 7 Nov, 18:00 | VERIFIED: event schedule |
| Team size | "Each team can have up to a maximum of **five** members in total. Everyone on a team needs to apply and stake separately as an individual." Solo hacking allowed | VERIFIED: event FAQ; /info/start "Teams can have up to 5 people" |
| One project per person | "Can I join two teams/projects?" → "No." | VERIFIED: event FAQ |
| In-person only | "This event is strictly in-person … We do not facilitate online participation" | VERIFIED: event FAQ |
| Applications | Closed. FAQ: "Applications are closed for ETHGlobal Mumbai 2026 as we are at venue capacity. You will not be able to walk-in." Late staking also refused ("Even if you are part of a team, you will not be able to stake."). Event data `signupDeadline` = Tue 3 Nov 23:59 IST; schedule also shows a "Deadline to Apply" marker on Fri 30 Oct 23:59 IST | VERIFIED: event FAQ + data. **Every team member must already be individually accepted and staked.** |
| Stake | Small ETH stake, returned within ~4 weeks if you submit a project ("or even a partial project"). Amount not published | VERIFIED: /info/start, FAQ. Amount UNVERIFIED |
| Total prizes | Sum of the 12 sponsor pools on the prize page = **$144,500** (my arithmetic; the page shows no total). ETHGlobal's X promo said "$175,000+ in prizes … 12 partners". The ~$30.5k gap (presumably the ETHGlobal finalist pool) is not itemised on any page I read | Partner sum VERIFIED (prizes page); $175k+ VERIFIED as a promo claim; finalist pool UNVERIFIED |

**Partner workshops, Thu 5 Nov (VERIFIED: event schedule; rooms from schedule/prize page)**

| IST | Workshop Room 1 | Workshop Room 2 |
|---|---|---|
| 15:30 | 0G: "One API, All of AI: Building on 0G Private Computer" | Hedera: "Hedera X Claude Code - AI Skills for Hackathon Builders" |
| 16:00 | ENS: "ENSv2 - Identity for Apps, Agents & Beyond" | Arkiv Workshop |
| 16:30 | Uniswap: "How to Navigate the Uniswap Stack" | Whitechain: "How to Win on Whitechain, Tracks and Tips" |
| 17:00 | Arc: "Build Apps Powered by Smart Contracts with Arc Studio" | Ethereum Foundation Workshop |
| 17:30 | World Workshop | 1inch: "Reimagining the AMM with 1inch Aqua" |

---

## 2. ETHGlobal-wide rules that apply to every project

### 2.1 Tracks: Classic (from scratch) vs Continuity

- **Classic / From Scratch** (VERIFIED, /info/details): "If you're entering the Classic "From Scratch" track, all work on your project must begin after the hackathon officially starts. Any prior project-specific code, designs, or assets are not allowed unless they're from public libraries or starter kits. Projects built before the event may still participate but won't qualify for partner prizes or the Finalist category."
- FAQ wording (VERIFIED, event page): "You should not work on your project before the event officially begins. This includes coding, designing assets etc. … if there is a situation where a project / team are porting or continuing existing projects then the result is that you may continue to participate but you won't be eligible for being an ETHGlobal Finalist." A second FAQ answer says partners "are able to award prizes to any project submitted on their technology and that meets the requirements of that prize bounty." (This is softer than /info/details on partner prizes. Treat /info/details as the binding text.)
- FAQ "Can I start working on my project before the event?" (VERIFIED): "**Track 1 — From Scratch**. **No**. You must begin your project during the hackathon. … start building from an empty repo." (The FAQ says "Show up on Friday", which looks like leftover text: hacking starts Thursday 21:00.)
- **Continuity Track** (VERIFIED, /info/details + FAQ): "Extend Open Source" (an existing OSS repo you already maintain) or "Ship a Feature" (an existing private/commercial product; the new feature "must be newly created during the hackathon and shipped as open source"). "**IMPORTANT**: You can not start working on the new Feature before the Hackathon." "Continuity submissions must clearly document pre-existing work … eligibility for partner prizes may vary by event and partner." The FAQ says continuing an existing project makes you ineligible for ETHGlobal Finalist.
- Many sponsors have separate prizes marked "🆕 This prize is only available to Continuity Track participants". Arkiv's text refers to "ETHGlobal's Continuity batch". How a team gets into the Continuity batch is UNVERIFIED (the linked page was not captured).

### 2.2 Submission, partner-prize limit, video, judging

- **Max partner prizes** (VERIFIED, FAQ + /info/details): "You can apply for a maximum of **3** Partner Prizes for your project. … If a Partner has multiple tracks, you can be eligible for all of them, but they still count as just 1 Partner Prize. **Note:** The ETHGlobal Finalist Track is separate and does not count as a Partner Prize." Also: "Please ensure to select these prizes carefully as it is the only way for partners to assess your project." For each partner you must "explain how you've used or integrated their tools, provide feedback, and share some comments."
- **Two submission modes** (VERIFIED, /info/details): (1) "Finalist and Partner Prizes": you present to judges in the Finalist session. (2) "Partner Prizes Only".
- **Finalist presentation** (VERIFIED, /info/details): "Each team has 7 minutes to present: 4 minutes for the demo, followed by 3 minutes for Q&A with the judges."
- **Finalist criteria** (VERIFIED, /info/details): Technicality, Originality, Practicality, Usability (UI/UX/DX), WOW Factor.
- **Partner judging** (VERIFIED, /info/details): "Partners will judge submissions based on the project materials you submit. Visiting partner booths to present your project is optional … not required for partner judging." **Conflict:** /info/start says "For partner prizes, you'll present your project at the partner booths in the venue." Ask on Discord which one applies.
- **Demo video** (VERIFIED, /info/details): "While optional, we strongly encourage you to include a 2-4 minute demo video". "Must be between 2 and 4 minutes: Videos under 2 minutes or over 4 minutes will be automatically rejected during upload." Not below 720p, no speed-up, no music-only/text-only videos, **no phone recording**, **no text-to-speech / AI voiceover**. Sponsor limits stack on top of this: 0G "under 3 mins", EF CROPS "3 minutes max", Hedera "5 minutes or less", Whitechain "2 to 4 minutes". Arc and Hedera require a video.
- **Version control** (VERIFIED, /info/details): "Submissions with large single commits or missing histories may be disqualified." 1inch and Whitechain repeat this in their own requirements.
- **Include everything** (VERIFIED, /info/details): "Your submission should include a GitHub Repo, Figma files, or equivalent, proving the work was done during the hackathon. Clearly distinguish between what's new and what's reused."
- **Open source:** ETHGlobal's general pages do not explicitly require an open-source licence for Classic projects (UNVERIFIED that none exists). "Ship a Feature" work must be "shipped as open source" (VERIFIED, FAQ). Most sponsor tracks require a public repo, and Arkiv/EF require an open-source licence (see sponsor sections).
- **AI tools** (VERIFIED, /info/details + FAQ): allowed, with "**Attribution:** Clearly document in your submission where and how AI tools were used … specifying which parts of the code, specific files, or assets were generated or assisted by AI." "Submissions that rely entirely on AI without meaningful contributions from team members may not be eligible for partner prizes or finalist consideration." "**Spec-Driven Development:** … If you use one, you must include all spec files, prompts, and planning artifacts in your submission repository."
- **After the deadline** (VERIFIED, FAQ): "Once projects have been submitted and submission has officially closed, you should not be working on your project again until PRIZES have been officially paid out / distributed".
- **Project details** (VERIFIED, FAQ): name, description etc. can be edited "as many times as you like up until submission deadline."
- **Prize currency** (VERIFIED, prize data): every prize is listed in USDC. Whitechain adds: "Prizes are paid by ETHGlobal in USDC under standard event eligibility rules."

---

## 3. Quick reference: the sponsors the team named

All rows VERIFIED from the prize page, except where a row says otherwise.

| Sponsor | Track the team named | Actual name on page | $ / split | Points to note |
|---|---|---|---|---|
| Arkiv | "Build on Arkiv from scratch" | 🧩 Build on Arkiv (from scratch) | $4,000: 1st $3,000, 2nd $1,000 | A different track, "Build on Arkiv (existing projects)", is **Continuity-only**. "Mirror something Ethereum depends on" ($4,000, 3k/1k) is a **from-scratch** track (not a continuity track), for mirroring public data. Only **one Arkiv track prize per team**. The Swarm bonus ($500, single winner) can be won on top of it and "does not use another of your three picks". |
| Hedera | "AI Agents That Pay / x402" | 🤖 AI Agents That Pay: x402 on Hedera | $6,500: 3,000 / 2,000 / 1,500 | The paid request must complete "with no human approving". README needs a Hedera tx ID. Video ≤5 min with a HashScan link. USDC settlement is "Extra points", not required. |
| World | "Best Use of IDKit" | 🪪 Best Use of IDKit | $2,500: up to 2 teams × $1,250 (no ranked places) | The same World pick also covers 🚀 **World ID Agent Pass** ($5,000: 2,500 / 1,500 / 1,000, from scratch, "especially interested in agentic products"). Both need a failure/alternative path and an integration debrief. |
| Chainlink | "CRE" | 🔗 Best workflow with CRE | **$1,500, single winner** | Simulation via the CRE CLI is enough. The other Chainlink track (CCIP 2.0, $3,500, 2 × $1,750) requires CCIP inside contracts. |
| 0G | "Private Computer" | ♾️ Build with 0G PC | $5,000: 2,500 / 1,500 / 1,000 | Must be a **consumer app** where AI on 0G is the product. "Not wanted: Generic chat wrappers". Request IDs required. **Demo video under 3 min**. |
| Arc (Circle's L1) | "Arc Studio requirement" | 5 tracks, $3,000 each, **single winner each** | 4 from scratch + 1 Continuity | "**Every Arc prize requires using Arc Studio as the starting point.**" Needs a shareable Arc Studio project URL, Studio shown in the demo, working frontend + backend, and an architecture diagram. Circle is not a separate sponsor. |
| Uniswap Foundation | "Build with Uniswap" | 🦄 Build with Uniswap | $10,000: 4,000 / 3,000 / 2,000 / 1,000 | Public open-source GitHub repo + `FEEDBACK.md` + completed form at https://developers.uniswap.org/hackathon-feedback that links the `FEEDBACK.md`. README must point to contracts and lines of code. (The form URL returned HTTP 200 on 3 Nov; I did not inspect its contents.) |

---

## 4. Sponsor prize tracks (all 12 sponsors on the prize page)

Order: the seven sponsors the team named first, then the rest. Amounts and splits come from the page's prize data and match the rendered text. Requirement text is copied verbatim from the page (markdown as authored). For the seven named sponsors, track descriptions are included too, because some sponsors (0G especially) put hard "Must show" and submission requirements in the description. For other sponsors' tracks, and for Continuity-only tracks other than Arkiv's, only the qualification text is reproduced. See the URL for the full description.

### Arkiv — $15,000 total

Source: https://ethglobal.com/events/mumbai/prizes/arkiv (VERIFIED, read 3 Nov 2026). Sponsor tier on ETHGlobal: Core.

Sponsor note (verbatim):

> **Arkiv is the Web3 database**, an Ethereum-aligned DB-Chain. Your app's data lives in Arkiv entities: each one is owned by a wallet, can be queried with SQL-like filters, and expires when you choose.
>
> Most prizes are for projects built from scratch. Build on Arkiv and the Arkiv + Swarm bonus also have a prize for existing projects that add Arkiv at the event. RPC: https://rpc.rabdi.db-chain.testnet.arkiv.network · Explorer: https://rabdi.explorer.arkiv.network · Indexer: https://indexer.rabdi.db-chain.testnet.arkiv.network · Faucet: https://hub.arkiv.network/faucet · Access keys: https://hub.arkiv.network/access-keys · Chain ID: 7794095

| Track | ETHGlobal category | Total | Split |
|---|---|---|---|
| 🪞 Mirror something Ethereum depends on | Building from scratch | $4,000 USDC | 1st place $3,000; 2nd place $1,000 |
| 🧩 Build on Arkiv (from scratch) | Building from scratch | $4,000 USDC | 1st place $3,000; 2nd place $1,000 |
| 🧩 Build on Arkiv (existing projects) | Continuity Track only | $4,000 USDC | 1st place $3,000; 2nd place $1,000 |
| 🛠️ Node tooling | Building from scratch | $2,000 USDC | single winner $2,000 |
| 🐝 Arkiv + Swarm bonus (from scratch) | Building from scratch | $500 USDC | single winner $500 |
| 🐝 Arkiv + Swarm bonus (existing projects) | Continuity Track only | $500 USDC | single winner $500 |

#### 🪞 Mirror something Ethereum depends on — $4,000

- Eligibility: Building from scratch — VERIFIED (https://ethglobal.com/events/mumbai/prizes/arkiv)
- Split: 1st place $3,000; 2nd place $1,000 — VERIFIED

Track description (verbatim):

> Pick public data that Ethereum apps and developers rely on, and mirror it into Arkiv entities that anyone can query without asking you for access.
>
> **Example:** Sourcify's API looks up its 7.9 million verified Ethereum mainnet contracts by address. We mirrored them to Arkiv at [sourcify.arkiv.network](https://sourcify.arkiv.network), and now anyone can filter them by name, ABI, compiler version, deployer and more.
>
> **Ideas:** token lists, chain and RPC registries, address labels, wallet ratings, function signatures.
>
> **How we judge:**
> - **Arkiv feedback (25%):** `/arkiv/friction.md`
>   - What should we improve today to make Arkiv better: something that got in your way, or something we don't have yet that would make building easier?
>   - When something broke, what did you expect, what happened, and how can we reproduce it?
> - **Reach (25%):** `/arkiv/reach.md`
>   - How many people or projects already use or depend on this data?
>   - Who would use your copy on Arkiv after Mumbai, and for what?
> - **Why Arkiv (25%):** `/arkiv/why-arkiv.md`
>   - If this data sat in Postgres or any other database instead of Arkiv, what could people no longer do?
>   - What can people do with your copy on Arkiv that they can't do with the original source today?
> - **Data quality (25%):** `/arkiv/data-quality.md`
>   - Is the data up to date, and how does your import keep it that way?
>   - Can people filter it the way they actually search for it?

Qualification requirements (verbatim):

> - Built from scratch at ETHGlobal Mumbai, following ETHGlobal's rules.
> - The data's license allows republishing. Link it in your README.
> - Not Sourcify data, from any chain.
> - Your import script is in the repo, and we can re-run it.
> - Your project writes to Arkiv's current testnet (see the docs) with `@arkiv-network/sdk` or the JSON-RPC API, and a feature or query people use reads the data from Arkiv.
> - In your README: the wallet address(es) that wrote your entities, and one query we can run.
> - `/arkiv/schema.md`: your entities, the fields you query, who owns them and when they expire. `/arkiv/friction.md`: your feedback.
> - One file per criterion in How we judge, at the path next to it, answering its questions with links, numbers or a query we can run.
> - A public repo with an open-source license. Say how you used AI, as ETHGlobal's rules require.
> - Each team can win one Arkiv track prize; the Arkiv + Swarm bonus can come on top of it.

#### 🧩 Build on Arkiv (from scratch) — $4,000

- Eligibility: Building from scratch — VERIFIED (https://ethglobal.com/events/mumbai/prizes/arkiv)
- Split: 1st place $3,000; 2nd place $1,000 — VERIFIED

Track description (verbatim):

> Build a new app whose data lives in Arkiv. You query its entities with SQL-like filters, and each one has an owner wallet and an expiration you choose.
>
> Some directions:
> - **Agents:** ephemeral coordination state: tasks, bids and claims that agents share, query and let expire.
> - **Markets:** listings or offers that expire at their deadline.
> - **Publishing and media:** posts, profiles and follows that any app can read.
> - **Names and identity:** profiles or service directories keyed by ENS names.
>
> **How we judge:**
> - **Arkiv feedback (25%):** `/arkiv/friction.md`
>   - What should we improve today to make Arkiv better: something that got in your way, or something we don't have yet that would make building easier?
>   - When something broke, what did you expect, what happened, and how can we reproduce it?
> - **Reach (25%):** `/arkiv/reach.md`
>   - Who is it for, and would they use it?
>   - Can they try it today, and will you keep building it after Mumbai?
> - **Why Arkiv (25%):** `/arkiv/why-arkiv.md`
>   - If you swapped Arkiv for Postgres or any other database, what would your users lose?
>   - What did you keep off Arkiv, and why?
> - **How you use Arkiv (25%):** `/arkiv/how-you-use-arkiv.md`
>   - Do the things you filter on, who can edit each entity, and when it expires fit what your app does?
>   - Does each Arkiv feature you use change something your users see?

Qualification requirements (verbatim):

> - Built from scratch at ETHGlobal Mumbai, following ETHGlobal's rules.
> - Your app writes to Arkiv's current testnet (see the docs) with `@arkiv-network/sdk` or the JSON-RPC API, and at least one feature users see reads its data from Arkiv.
> - In your README: the wallet address(es) that wrote your entities, and one query we can run.
> - `/arkiv/schema.md`: your entities, the fields you query, who owns them and when they expire. `/arkiv/friction.md`: your feedback.
> - One file per criterion in How we judge, at the path next to it, answering its questions with links, numbers or a query we can run.
> - A public repo with an open-source license. Say how you used AI, as ETHGlobal's rules require.
> - Not counted: the SDK installed but never used to read, or Arkiv used only as a log that nothing reads.
> - Each team can win one Arkiv track prize; the Arkiv + Swarm bonus can come on top of it.

#### 🧩 Build on Arkiv (existing projects) — $4,000

- Eligibility: Continuity Track only (page: "This prize is only available to Continuity Track participants") — VERIFIED (https://ethglobal.com/events/mumbai/prizes/arkiv)
- Split: 1st place $3,000; 2nd place $1,000 — VERIFIED

Track description (verbatim):

> Already building a product? Bring it to ETHGlobal Mumbai and move part of its data into Arkiv. You query Arkiv entities with SQL-like filters, and each one has an owner wallet and an expiration you choose.
>
> Some directions:
> - **Data your users own:** profiles, posts or settings that stay with each user's wallet and that other apps can read.
> - **Shared state:** listings, orders or tasks that several parties query, and that expire when they are done.
> - **Agents:** ephemeral coordination state that your agents share, query and let expire.
>
> **How we judge:**
> - **Arkiv feedback (25%):** `/arkiv/friction.md`
>   - What should we improve today to make Arkiv better: something that got in your way, or something we don't have yet that would make adding Arkiv easier?
>   - When something broke, what did you expect, what happened, and how can we reproduce it?
> - **Reach (25%):** `/arkiv/reach.md`
>   - Who uses your product today, and will they use the part on Arkiv?
>   - Will it ship to them after Mumbai?
> - **Why Arkiv (25%):** `/arkiv/why-arkiv.md`
>   - If this data stayed in your current database, what would your users lose?
>   - What did you keep off Arkiv, and why?
> - **How you use Arkiv (25%):** `/arkiv/how-you-use-arkiv.md`
>   - Do the things you filter on, who can edit each entity, and when it expires fit what your product does?
>   - Does each Arkiv feature you use change something your users see?

Qualification requirements (verbatim):

> - An existing project in ETHGlobal's Continuity batch, following ETHGlobal's rules.
> - The Arkiv part is new work done at ETHGlobal Mumbai. In your README, say what existed before the event and what you added; we judge only what you added.
> - Your app writes to Arkiv's current testnet (see the docs) with `@arkiv-network/sdk` or the JSON-RPC API, and at least one feature users see reads its data from Arkiv.
> - In your README: the wallet address(es) that wrote your entities, and one query we can run.
> - `/arkiv/schema.md`: your entities, the fields you query, who owns them and when they expire. `/arkiv/friction.md`: your feedback.
> - One file per criterion in How we judge, at the path next to it, answering its questions with links, numbers or a query we can run.
> - A public repo with an open-source license. Say how you used AI, as ETHGlobal's rules require.
> - Not counted: the SDK installed but never used to read, or Arkiv used only as a log that nothing reads.
> - Each team can win one Arkiv track prize; the Arkiv + Swarm bonus can come on top of it.

#### 🛠️ Node tooling — $2,000

- Eligibility: Building from scratch — VERIFIED (https://ethglobal.com/events/mumbai/prizes/arkiv)
- Split: single winner $2,000 — VERIFIED

Track description (verbatim):

> Build a tool for the people who run Arkiv nodes. Two directions:
> - **Operator dashboard:** a collector that runs next to a node and shows how many days are left before the disk is full (with an alert), requests and latency per method, peers, sync, CPU and memory.
> - **Slow query finder:** load data into your own node and measure which query shapes are slow. Run it only on your own node, never on a public endpoint.
>
> **For reference:** [nodes.arkiv.network](https://nodes.arkiv.network) shows Arkiv's community nodes from the outside. You don't have to rebuild it: use it as a guide, and show what only a tool next to the node can see.
>
> **How we judge:**
> - **Arkiv feedback (25%):** `/arkiv/friction.md`
>   - What should we improve today to make running or querying an Arkiv node better: something that got in your way, or something we don't have yet?
>   - When something broke, what did you expect, what happened, and how can we reproduce it?
> - **Real use (25%):** `/arkiv/real-use.md`
>   - Would people who run Arkiv nodes, or Arkiv's engineers, actually use this?
>   - What does it tell them that they need to know?
> - **What's new (25%):** `/arkiv/whats-new.md`
>   - What does it show or find that the node's built-in tools don't?
>   - Is it more than putting an existing dashboard together?
> - **Easy to run (25%):** `/arkiv/easy-to-run.md`
>   - Can someone else install and run it from your README in a few minutes?
>   - Does the README say what it needs and what to do when it fails?

Qualification requirements (verbatim):

> - Built from scratch at ETHGlobal Mumbai: a new repo that runs next to the node. A pull request to an existing repo is not from scratch.
> - It works against an Arkiv node in your demo. A node on your own machine is enough.
> - In your README: which node you used, and how to reproduce the demo. If your tool writes Arkiv entities, also the wallet address(es) that wrote them and a `/arkiv/schema.md`.
> - `/arkiv/friction.md`: your feedback on running and querying the node.
> - One file per criterion in How we judge, at the path next to it, answering its questions with links, numbers or a query we can run.
> - Slow query shapes you find go to us privately (we will share how at the Arkiv booth), never into your public repo, `/arkiv/friction.md` or demo.
> - A public repo with an open-source license. Say how you used AI, as ETHGlobal's rules require.
> - Each team can win one Arkiv track prize; the Arkiv + Swarm bonus can come on top of it.

#### 🐝 Arkiv + Swarm bonus (from scratch) — $500

- Eligibility: Building from scratch — VERIFIED (https://ethglobal.com/events/mumbai/prizes/arkiv)
- Split: single winner $500 — VERIFIED

Track description (verbatim):

> Use Swarm ([ethswarm.org](https://www.ethswarm.org)) in your project in a meaningful way, and you are also in the running for $500. For example, keep the files your users see on Swarm and point to them from your Arkiv entities, or upload them encrypted so only the people who get the reference can open them. The most useful integration wins. It comes on top of any track prize: you can win a track and this bonus.
>
> **To enter:** when you submit a from-scratch project to Mirror, Build on Arkiv or Node tooling, also select this bonus. Arkiv's prizes count as one partner prize on ETHGlobal, so it does not use another of your three picks. Existing projects have their own Arkiv + Swarm bonus.

Qualification requirements (verbatim):

> - Your project uses both Arkiv and Swarm. A project that uses only Swarm does not qualify.
> - `/arkiv/swarm.md` in your repo, with:
>   - What you keep on Swarm, what you keep on Arkiv, and which entity field holds the Swarm reference or feed.
>   - One Arkiv entity key and the Swarm reference it points to, with a link we can open.
>   - The postage stamp batch ID you uploaded with and the wallet that bought it (or who gave you the batch), and the Bee node or service you uploaded through.
>   - The files in your repo that upload to Swarm and read from it.
>   - Steps to run one upload and one read yourself, what they need, and what we should see.
>   - The moment in your demo video where Swarm is used.
>   - What got in your way with Swarm.
> - Careful: an encrypted Swarm reference contains its key, and Arkiv entities are public. Never store one in an entity as it is: encrypt it first or keep it off Arkiv.

#### 🐝 Arkiv + Swarm bonus (existing projects) — $500

- Eligibility: Continuity Track only (page: "This prize is only available to Continuity Track participants") — VERIFIED (https://ethglobal.com/events/mumbai/prizes/arkiv)
- Split: single winner $500 — VERIFIED

Track description (verbatim):

> Use Swarm ([ethswarm.org](https://www.ethswarm.org)) in what you add to your product at ETHGlobal Mumbai, and you are also in the running for $500. For example, keep the files your users see on Swarm and point to them from your Arkiv entities, or upload them encrypted so only the people who get the reference can open them. The most useful integration wins. It comes on top of the Build on Arkiv prize for existing projects: you can win both.
>
> **To enter:** when you submit your project to Build on Arkiv (existing projects), also select this bonus. Arkiv's prizes count as one partner prize on ETHGlobal, so it does not use another of your three picks.

Qualification requirements (verbatim):

> - An existing project in ETHGlobal's Continuity batch that uses both Arkiv and Swarm. A project that uses only Swarm does not qualify.
> - How Swarm works with your Arkiv entities is new work done at ETHGlobal Mumbai. In `/arkiv/swarm.md`, say what existed before the event; we judge only what you added.
> - `/arkiv/swarm.md` in your repo, with:
>   - What you keep on Swarm, what you keep on Arkiv, and which entity field holds the Swarm reference or feed.
>   - One Arkiv entity key and the Swarm reference it points to, with a link we can open.
>   - The postage stamp batch ID you uploaded with and the wallet that bought it (or who gave you the batch), and the Bee node or service you uploaded through.
>   - The files in your repo that upload to Swarm and read from it.
>   - Steps to run one upload and one read yourself, what they need, and what we should see.
>   - The moment in your demo video where Swarm is used.
>   - What got in your way with Swarm.
> - Careful: an encrypted Swarm reference contains its key, and Arkiv entities are public. Never store one in an entity as it is: encrypt it first or keep it off Arkiv.


### Hedera — $15,000 total

Source: https://ethglobal.com/events/mumbai/prizes/hedera (VERIFIED, read 3 Nov 2026). Sponsor tier on ETHGlobal: Core.

| Track | ETHGlobal category | Total | Split |
|---|---|---|---|
| 🤖 AI Agents That Pay: x402 on Hedera | Building from scratch | $6,500 USDC | 1st place $3,000; 2nd place $2,000; 3rd place $1,500 |
| 🪙 Tokenize Anything with Hedera Studios | Building from scratch | $5,000 USDC | 1st place $2,500; 2nd place $1,500; 3rd place $1,000 |
| 🚫 "No Solidity Allowed": Build with Hedera SDKs | Building from scratch | $2,000 USDC | up to 2 teams × $1,000 |
| ♻️ Built on Hedera (Continuity Track) | Continuity Track only | $1,500 USDC | up to 2 teams × $750 |

#### 🤖 AI Agents That Pay: x402 on Hedera — $6,500

- Eligibility: Building from scratch — VERIFIED (https://ethglobal.com/events/mumbai/prizes/hedera)
- Split: 1st place $3,000; 2nd place $2,000; 3rd place $1,500 — VERIFIED

Track description (verbatim):

> AI agents can reason, plan, and call tools, but most still can't pay for what they use. x402 gives them a way: it brings back the HTTP 402 Payment Required status code so a server can quote a price and a client can pay inside an ordinary request. There's no checkout page, signup, or API key.
>
> On Hedera, an x402 payment settles in HBAR or HTS tokens (including USDC) with low, fixed fees and fast finality. The facilitator pays the network fee, so the paying agent doesn't need to hold HBAR for gas. That makes it practical to charge per call, per token, or per second.
>
> Build the economy that agents run on: services that charge for each request, and agents that discover, compare, and pay for those services on their own.
>
> Ideas
>
> *   A pay-per-call AI inference or data API: model access, translation, OCR, market data, or regional-language speech-to-text, priced per request.
> *   An agent marketplace where agents hire other agents for subtasks and pay each one through x402.
> *   A metered MCP server whose tools charge per call.
> *   A research agent that works within a budget: it compares the prices of paid sources, chooses which ones to use, and reports what it spent.
> *   Micropaywalls for creators: pay a few cents per article, image, or dataset query instead of a subscription.
> *   An open-source Hedera x402 facilitator with its own safety checks and replay protection.

Qualification requirements (verbatim):

> - At least one x402-protected endpoint that settles on Hedera testnet or mainnet through any facilitator listed in the Hedera docs (Official x402, Ax402, or Blocky402), or through a facilitator you run yourself.
> - An agent or client that finds the endpoint and completes at least one paid request end to end, with no human approving.
> - A public GitHub repo with a README that covers setup, architecture, and the payment flow, including the Hedera transaction ID of at least one settled payment.
> - A demo video of 5 minutes or less that shows a payment settling and links to it on HashScan.
>
> Extra points
> - Spending controls for agents: budgets, per-merchant limits, allowlists, or a human-in-the-loop approval above a set amount.
> - Agent identity and reputation through HCS-14 or ERC-8004
> - An HCS topic used as a tamper-evident audit log of each agent's spending.
> - Multi-agent negotiation (A2A or ACP) before the payment is made.
> - Settling in an HTS token such as USDC, or using HTS custom fees to split revenue.
> - Recurring or subscription-style payments through Scheduled Transactions.
> - Use of the Hedera Agent Kit or Hedera Network MCP.

#### 🪙 Tokenize Anything with Hedera Studios — $5,000

- Eligibility: Building from scratch — VERIFIED (https://ethglobal.com/events/mumbai/prizes/hedera)
- Split: 1st place $2,500; 2nd place $1,500; 3rd place $1,000 — VERIFIED

Track description (verbatim):

> Use Hedera's open-source studios to put a real-world asset or payment flow on-chain. Asset Tokenization Studio (ATS) covers the full lifecycle of security tokens, bonds, and equities, and supports ERC-3643 and ERC-1400. Stablecoin Studio covers minting and managing fiat-backed stablecoins, with admin and reserve controls built in.
>
> Pick something that exists today in finance, trade, or commerce, and show how it works when it's issued, managed, and settled on Hedera.
>
> Ideas
> - Fractional ownership of invoices or receivables for small businesses, sold to investors.
> - Tokenized bonds with on-chain coupon schedules.
> - Fractional ownership of gold, real estate, or warehouse receipts.
> - A stablecoin for cross-border remittances, with compliance controls.
> - A secondary market or order book for ATS assets.
> - An x402 service that sells data about tokenized assets, such as NAV or price feeds (this also links to Track 1).

Qualification requirements (verbatim):

> - Use ATS or Stablecoin Studio (SDK, contracts, web app, or a combination) to issue or manage a tokenized asset or stablecoin.
> - Deploy and demo on Hedera testnet.
> - A public GitHub repo, with contracts verified on HashScan where applicable.
> - A demo video of 5 minutes or less that covers issuance, configuration, and at least one lifecycle operation (for example a coupon payment, redemption, freeze, or reserve update).
>
> Extra points
> - Compliance controls: KYC, freezes, transfer restrictions, pauses.
> - Custom fees and distributions.
> - Oracle pricing or NAV feeds.
> - Scheduled Transactions for coupons, vesting, or recurring payouts.
> - Contributions back to ATS or Stablecoin Studio.

#### 🚫 "No Solidity Allowed": Build with Hedera SDKs — $2,000

- Eligibility: Building from scratch — VERIFIED (https://ethglobal.com/events/mumbai/prizes/hedera)
- Split: up to 2 teams × $1,000 — VERIFIED

Track description (verbatim):

> Build a complete app on Hedera without writing a single smart contract. Hedera's native services cover tokens (HTS), verifiable messaging and data (HCS), scheduled and multi-signature transactions, and accounts, all through the SDKs. Show what you can ship when the network does the heavy lifting.

Qualification requirements (verbatim):

> - Use the Hedera JavaScript/TypeScript SDK or Python SDK, with no Solidity smart contracts.
> - Use at least two native Hedera services (for example, HTS and HCS).
> - A public GitHub repo with a README covering setup and usage.
> - A demo video of 5 minutes or less.
>
> Extra points
> - A coherent end-to-end user experience.
> - Integration with the Hedera Mirror Node REST API.
> - Creative use of HCS for data integrity, logging, or messaging.
> - The Hedera Agent Kit for AI-driven workflows.
> - A thoughtful security approach (key management, access controls).

#### ♻️ Built on Hedera (Continuity Track) — $1,500

- Eligibility: Continuity Track only (page: "This prize is only available to Continuity Track participants") — VERIFIED (https://ethglobal.com/events/mumbai/prizes/hedera)
- Split: up to 2 teams × $750 — VERIFIED

Qualification requirements (verbatim):

> - The project was built for a previous hackathon or already exists on Hedera.
> - Substantive new work from this event: new features, new Hedera services, or a major architectural change.
> - A public GitHub repo with a README that separates what existed before from what's new, ideally with commit history or a diff.
> - A demo video of 5 minutes or less that focuses on the new work.


### World — $12,500 total

Source: https://ethglobal.com/events/mumbai/prizes/world (VERIFIED, read 3 Nov 2026). Sponsor tier on ETHGlobal: Presenter.

Sponsor note (verbatim):

> World’s developer stack helps builders create products for verified humans and AI-assisted interactions. World ID enables apps to confirm someone is a unique human without revealing their identity.

| Track | ETHGlobal category | Total | Split |
|---|---|---|---|
| 💿 World ID Agent Pass | Continuity Track only | $2,500 USDC | 1st place $1,500; 2nd place $1,000 |
| 🚀 World ID Agent Pass | Building from scratch | $5,000 USDC | 1st place $2,500; 2nd place $1,500; 3rd place $1,000 |
| 🪪 Best Use of IDKit | Building from scratch | $2,500 USDC | up to 2 teams × $1,250 |
| 🎉 [Cont] Best IDKit Use Case | Continuity Track only | $2,500 USDC | up to 2 teams × $1,250 |

#### 💿 World ID Agent Pass — $2,500

- Eligibility: Continuity Track only (page: "This prize is only available to Continuity Track participants") — VERIFIED (https://ethglobal.com/events/mumbai/prizes/world)
- Split: 1st place $1,500; 2nd place $1,000 — VERIFIED

Qualification requirements (verbatim):

> - Integrate with the official World ID Agent Pass.
> - Demonstrate the complete journey: identity or verification request, user completion, validated result, and the protected application or agent action.
> - Demonstrate a denied, expired, cancelled, or otherwise unsuccessful path where the protected action does not occur.
> - Validate identity results in a secure backend; do not expose client secrets or treat an unvalidated client response as authorization.
> - Include a short integration debrief/feedback: time to first success, friction encountered, missing capability or documentation, and the one improvement with the greatest impact.

#### 🚀 World ID Agent Pass — $5,000

- Eligibility: Building from scratch — VERIFIED (https://ethglobal.com/events/mumbai/prizes/world)
- Split: 1st place $2,500; 2nd place $1,500; 3rd place $1,000 — VERIFIED

Track description (verbatim):

> ![We are mocking proofs now, so you don't need sandbox app anymore]!
>
> Build an application using World ID Agent Pass. We are especially interested in agentic products, but any compelling use case is eligible.
>
> Show what becomes possible when an application can ask a person to authenticate or complete a fresh verification at the moment. 
>
> Strong submissions will show a meaningful action that needs a human identity or approval layer, not simply a login screen added to an existing product.
>
> NOTE: Proofs are using fake identities, DO NOT rely in them for production

Qualification requirements (verbatim):

> - Integrate with the official World ID Agent Pass.
> - Demonstrate the complete journey: identity or verification request, user completion, validated result, and the protected application or agent action.
> - Demonstrate a denied, expired, cancelled, or otherwise unsuccessful path where the protected action does not occur.
> - Validate identity results in a secure backend; do not expose client secrets or treat an unvalidated client response as authorization.
> - Include a short integration debrief/feedback: time to first success, friction encountered, missing capability or documentation, and the one improvement with the greatest impact.

#### 🪪 Best Use of IDKit — $2,500

- Eligibility: Building from scratch — VERIFIED (https://ethglobal.com/events/mumbai/prizes/world)
- Split: up to 2 teams × $1,250 — VERIFIED

Track description (verbatim):

> Build a product that uses IDKit to solve a real trust moment: an event where a product needs to know something meaningful about a person before it grants access, completes an action, or changes a user’s experience.
>
> Use the credential that is proportionate to your use case—such as Proof of Human, Passport/NFC, or Selfie Check (Now live with Sybil score). We are not rewarding the most credentials used. We are rewarding the best decision about which credential is needed, why it is needed, and how it improves a real product experience.
>
> Strong examples could include fair access to a scarce benefit, a privacy-preserving eligibility check, recovery or protection of an important account action, or a workflow that becomes safer or simpler because it can verify the right level of human trust.

Qualification requirements (verbatim):

> - Integrate IDKit in a functioning application, mini app, or onchain flow.
> - Use at least one supported World ID credential and verify the result on the server or onchain as appropriate.
> - Clearly explain the specific product event requiring trust and why the chosen credential is the minimum sufficient assurance.
> - Demonstrate a successful verification and one meaningful alternative path, such as cancellation, unavailable credential, rejection, or an ineligible user.
> - Include a short integration debrief/feedback: time to first success, friction encountered, missing capability or documentation, and the one improvement with the greatest impact.

#### 🎉 [Cont] Best IDKit Use Case — $2,500

- Eligibility: Continuity Track only (page: "This prize is only available to Continuity Track participants") — VERIFIED (https://ethglobal.com/events/mumbai/prizes/world)
- Split: up to 2 teams × $1,250 — VERIFIED

Qualification requirements (verbatim):

> - Integrate IDKit in a functioning application, mini app, or onchain flow.
> - Use at least one supported World ID credential and verify the result on the server or onchain as appropriate.
> - Clearly explain the specific product event requiring trust and why the chosen credential is the minimum sufficient assurance.
> - Demonstrate a successful verification and one meaningful alternative path, such as cancellation, unavailable credential, rejection, or an ineligible user.
> - Include a short integration debrief/feedback: time to first success, friction encountered, missing capability or documentation, and the one improvement with the greatest impact.


### Chainlink — $5,000 total

Source: https://ethglobal.com/events/mumbai/prizes/chainlink (VERIFIED, read 3 Nov 2026). Sponsor tier on ETHGlobal: Ruby.

| Track | ETHGlobal category | Total | Split |
|---|---|---|---|
| 🔗 Best workflow with CRE | Building from scratch | $1,500 USDC | single winner $1,500 |
| 🏆 Best use of Chainlink CCIP 2.0 | Building from scratch | $3,500 USDC | up to 2 teams × $1,750 |

#### 🔗 Best workflow with CRE — $1,500

- Eligibility: Building from scratch — VERIFIED (https://ethglobal.com/events/mumbai/prizes/chainlink)
- Split: single winner $1,500 — VERIFIED

Track description (verbatim):

> *Build your workflow with CRE!* Chainlink Runtime Environment (CRE) is an all-in-one orchestration layer that enables developers to build institutional-grade smart contracts — data-connected, compliance-ready, privacy-preserving, and interoperable across blockchains and traditional systems. With CRE, you can connect blockchains to external APIs, enterprise systems, data sources, LLMs, or AI agents.

Qualification requirements (verbatim):

> 📍*Requirements:*
>
> ✅ *Goal:*
>  Build, simulate, or deploy a CRE Workflow that’s used as an orchestration layer within your project. *Note*: It is NOT mandatory to deploy it during the hackathon, simulation is enough!
>
> ✅ *Your workflow should:*
> - Integrate at least one blockchain with an external API, system, data source, LLM, or AI agent.
> - Demonstrate a successful simulation (via the CRE CLI) or a live deployment on the CRE network.
> - Be meaningfully used in your project

#### 🏆 Best use of Chainlink CCIP 2.0 — $3,500

- Eligibility: Building from scratch — VERIFIED (https://ethglobal.com/events/mumbai/prizes/chainlink)
- Split: up to 2 teams × $1,750 — VERIFIED

Track description (verbatim):

> Build something awesome using Chainlink CCIP 2.0! The Chainlink Cross-Chain Interoperability Protocol (CCIP) provides a single simple interface through which applications can securely meet all their cross-chain needs, including token transfers and arbitrary messaging. CCIP 2.0 begins a new era for the digital asset industry by laying the rails for hundreds of trillions of dollars in capital from existing financial systems to flow onchain.
>
> Possible use cases: Cross-chain DeFi app with liquidity across multiple chains Cross Chain DeFi yield aggregator Token bridge powered by CCIP Multihop CCIP Router. You want to send cross-chain message from blockchain A to blockchain B without worrying if the lane between them exists.
>
> Use our CCIP Local Simulator to speed up your development on your local Hardhat, Foundry or Remix network, then use our Faucet to easily get testnet funds when you're ready for testnet. Links to both at the bottom in the 'Resources' Section!

Qualification requirements (verbatim):

> Each project must use Chainlink CCIP in some form to make a state change on a blockchain, otherwise it will not be eligible for the Chainlink core prizes. This means that a front end simply reading from Chainlink Data Feeds doesn't count. Using Chainlink CCIP inside your smart contracts is required, though you are encouraged to utilize Chainlink Runtime Environment (CRE), Chainlink Data Feeds, Chainlink Data Streams and Chainlink VRF.


### 0G — $15,000 total

Source: https://ethglobal.com/events/mumbai/prizes/0g (VERIFIED, read 3 Nov 2026). Sponsor tier on ETHGlobal: Core.

Sponsor note (verbatim):

> 0G is the trust layer for AI. Private compute, encrypted storage and an AI-native EVM L1 chain in one stack, so every AI action is verified and audited. **0G Private Computer** gives you one OpenAI-compatible API for 100+ models, with verified runs, privacy on demand and proof of which model produced every result. **0G Storage** holds AI datasets, model weights and live state, and **0G Chain** settles every model run, payment and ownership record onchain.

| Track | ETHGlobal category | Total | Split |
|---|---|---|---|
| ♾️ Build with 0G PC | Building from scratch | $5,000 USDC | 1st place $2,500; 2nd place $1,500; 3rd place $1,000 |
| 🤖 Physical AI: Agents with a Body | Building from scratch | $5,000 USDC | 1st place $2,500; 2nd place $1,500; Best build on real hardware $1,000 |
| 🚀 Keep Building on 0G | Continuity Track only | $3,000 USDC | up to 2 teams × $1,500 |
| 🃏 Agents That Pay for Themselves | Building from scratch | $2,000 USDC | up to 2 teams × $1,000 |

#### ♾️ Build with 0G PC — $5,000

- Eligibility: Building from scratch — VERIFIED (https://ethglobal.com/events/mumbai/prizes/0g)
- Split: 1st place $2,500; 2nd place $1,500; 3rd place $1,000 — VERIFIED

Track description (verbatim):

> **0G Private Computer** gives you one OpenAI-compatible API for 100+ models, with verified runs and privacy on demand. If you've used the OpenAI SDK, you already know how to build on it.
>
> Build a consumer app where AI on 0G *is* the product: something people open, use, and come back to tomorrow. Creative image, video, and voice apps are welcome here.
>
> Every participating team gets **0G compute credits** to build and test with.
>
> ### Models to play with
>
> | Category | Models |
> |---|---|
> | Image | `seedream`, `hy-image`, `z-image` |
> | Video | `seedance`, `minimax-h3` |
> | Speech | `whisper-large-v3` |
> | Multimodal | `qwen omni`, `qwen vision` |
> | 0G native | `0gm-1.0` |
>
> ### ⭐ Bonus points: plug into iAI
>
> iAI holders get fresh 0G compute credits every day: **1.271 credits per staked iAI**, refreshed at **00:00 UTC**. Unused credits expire, so thousands go to waste daily. These users already hold credits and need good apps to spend them on.
>
> If your app lets users **sign in with their 0G account and spend their own daily credits**, it scores higher with judges. Standout apps may be invited to discuss a **revenue share with 0G** after the hackathon.
>
> **How:**
> - We'll share 0G's credit balance for building
> - You don't need to buy or mint iAI. Test with the 0G credits we give your team.
>
> ### Not wanted
>
> - Generic chat wrappers
> - Apps where the AI call could be removed without anyone noticing

Qualification requirements (verbatim):

> ### ✅ Must show
>
> - Inference on **0G Private Computer** in your main user flow, with **request IDs**
> - A working app a judge can try, with a clear reason someone comes back tomorrow
> - One sentence on what breaks if 0G is removed
> - **For the iAI bonus:** a user signing in with their 0G account and their credit balance going down as they use your app
>
> ### 📦 Submission requirements
>
> - Project name and a short description
> - Public GitHub repo (README + setup instructions)
> - Demo video (under 3 mins) and a live demo link
> - Contract deployment addresses (if any)
> - Team member names and contact info (Telegram and X)

#### 🤖 Physical AI: Agents with a Body — $5,000

- Eligibility: Building from scratch — VERIFIED (https://ethglobal.com/events/mumbai/prizes/0g)
- Split: 1st place $2,500; 2nd place $1,500; Best build on real hardware $1,000 — VERIFIED

Track description (verbatim):

> A robot, drone, wearable or pocket device whose decisions run on 0G. You don't need hardware: simulated builds are eligible for every prize, and one prize is held for the best build on real hardware. 0G is the brain, not the spinal cord: motion stays on the device, while 0G makes the decisions at key checkpoints and keeps the record.
>
> **Lanes:**
> - **Robots and machines:** arms, rovers, drones, in simulation or hardware
> - **Personal devices:** an open, verifiable alternative to Meta's Muse assistant, on glasses, a pocket device or a desktop companion, with the user's memory on 0G Storage and sealed inference
>
> **Build without hardware:** start from zerobot, 0G's open-source robot control SDK, which includes a mock robot so you can build and test with no hardware (it currently targets the Unitree Go2 on 0G Galileo testnet). Or bring your own simulator: MuJoCo, PyBullet, Gazebo + ROS 2 or LeRobot.
>
> **Not wanted:** a chatbot with a robot avatar, pre-recorded motion, 0G used only for logs.

Qualification requirements (verbatim):

> **Must show:**
> - A 0G call inside the decision loop: vision, voice or decision model
> - An episode log on 0G Storage with a request id per decision
> - A replayable simulation, or a live hardware demo at the 0G booth
> - A safe-stop fallback if 0G is unreachable. A fallback that fakes the decision disqualifies.
>
> **Submission requirements:**
> - Project name and a short description
> - Public GitHub repo (README + setup instructions)
> - Demo video (under 3 mins) and a live demo link
> - Contract deployment addresses
> - Team member names and contact info (Telegram and X)
>
> *Prizes are paid at 0G's discretion. We only pay out to projects that meet our quality threshold, so not every place is guaranteed to be awarded.*

#### 🚀 Keep Building on 0G — $3,000

- Eligibility: Continuity Track only (page: "This prize is only available to Continuity Track participants") — VERIFIED (https://ethglobal.com/events/mumbai/prizes/0g)
- Split: up to 2 teams × $1,500 — VERIFIED

Qualification requirements (verbatim):

> **Must show:**
> - A link to prior state: a dated commit hash or the previous submission page marking where you started
> - A dated changelog of work done during the Mumbai hackathon window
> - 0G in the new work: a 0G Compute request id, a 0G Storage root hash or a 0G Chain contract address from this hackathon
> - A short "What's next" statement to show trajectory
>
> **Submission requirements:**
> - Project name and a short description
> - Public GitHub repo (README + setup instructions)
> - Demo video (under 3 mins) and a live demo link
> - Contract deployment addresses
> - Team member names and contact info (Telegram and X)
>
> *Prizes are paid at 0G's discretion. We only pay out to projects that meet our quality threshold, so not every place is guaranteed to be awarded.*

#### 🃏 Agents That Pay for Themselves — $2,000

- Eligibility: Building from scratch — VERIFIED (https://ethglobal.com/events/mumbai/prizes/0g)
- Split: up to 2 teams × $1,000 — VERIFIED

Track description (verbatim):

> Most agents stop running the day their owner stops paying the API bill. Build one that earns its keep. It should make money, and that money should pay for its own inference on **0G Compute** without a human topping it up.
>
> ### Recommended path: comfy
>
> **comfy** is the token launchpad on 0G, and it's built for exactly this loop:
>
> 1. **Register your agent** with the comfy CLI. This mints its onchain identity on 0G.
> 2. **Launch its token and keep the compute share on.** Part of the creator fees from every trade lands as credit in the agent's 0G compute account.
> 3. **Mint a capped compute key.** The agent pays for its own model calls with it, and comfy never holds the key.
>
> Other ways of earning count too, such as charging for a service or getting paid by other agents. The money just has to reach 0G Compute **without a human in the loop**.
>
> ### What we'd love to see
>
> - Agents that do a job worth paying for or trading on, not a mascot with a token
> - **Budget-aware agents** that read their own balance and adapt, for example by switching to a cheaper model, slowing down, or pausing when funds run low
> - Agents that hire or pay other agents
>
> ### Not wanted
>
> - A token launch with a chatbot attached
> - "Revenue" that only exists because the team trades its own token
> - An agent whose wallet a human refills

Qualification requirements (verbatim):

> ### Must show
>
> - **The full loop:** money in, credit landing in the agent's 0G compute account, and inference paid from that balance, with **tx hashes** and **request IDs**
> - The agent running on its own during the demo with **no manual top-up**
> - A **spend cap**, and what the agent does when funds run low (it should degrade gracefully, not crash)
> - **If using comfy:** your agent ID, its token address, and the token's fees tab showing compute delivered
>
> ### Submission requirements
>
> - Project name and a short description
> - Public GitHub repo (README + setup instructions)
> - Demo video (under 3 mins) and a live demo link
> - Contract deployment addresses
> - Team member names and contact info (Telegram and X)


### Arc — $15,000 total

Source: https://ethglobal.com/events/mumbai/prizes/arc (VERIFIED, read 3 Nov 2026). Sponsor tier on ETHGlobal: Core.

Sponsor note (verbatim):

> Arc is Circle’s purpose-built, EVM-compatible L1 blockchain and the Economic OS for the internet. Arc Studio is the fastest way to build and deploy on it. Describe the onchain app you want, and Arc Studio works out what it needs in one place, including writing and testing any smart contracts, then builds the app around them. It has access to Arc and Circle products (USDC, EURC, Gateway, CCTP, Wallets) and other onchain skills, and you can bring your own skills into Arc Studio too.
> Every Arc prize requires using Arc Studio as the starting point. Please state which bounty you’re submitting for in your submission.

| Track | ETHGlobal category | Total | Split |
|---|---|---|---|
| 🏆 Best DeFi / Onchain Finance App Built End to End in Arc Studio | Building from scratch | $3,000 USDC | single winner $3,000 |
| 🏆 Best Mobile Web Consumer Agent Using the Marketplace Discovery API | Building from scratch | $3,000 USDC | single winner $3,000 |
| 🏆 Best Smart Contracts with Advanced Stablecoin Logic, In Arc Studio | Building from scratch | $3,000 USDC | single winner $3,000 |
| 🏆 Best Use of Bridge Kit for Non-USDC Assets, Built in Arc Studio | Building from scratch | $3,000 USDC | single winner $3,000 |
| 🏆 Arc Studio Continuity Track: Bring Your Project to Arc | Continuity Track only | $3,000 USDC | single winner $3,000 |

#### 🏆 Best DeFi / Onchain Finance App Built End to End in Arc Studio — $3,000

- Eligibility: Building from scratch — VERIFIED (https://ethglobal.com/events/mumbai/prizes/arc)
- Split: single winner $3,000 — VERIFIED

Track description (verbatim):

> Build a DeFi or onchain finance application on Arc, using USDC or EURC for settlement. Prompt Arc Studio with the app you want. If it needs smart contracts, Arc Studio writes and tests them for you.
>
> **What we’re looking for:**
>
> *   Trading apps, including trading with tokenized real-world assets (RWAs)
> *   Lending and borrowing, credit, and collateral systems
> *   Payments and liquidity infrastructure (for example, a credit co-op)
> *   Neobanks for consumers or businesses

Qualification requirements (verbatim):

> Submissions will be evaluated based on the following parameters. Please be clear what bounty you are submitting for as part of your submission.
> - **Built in Arc Studio.** Include a shareable Arc Studio project URL that judges can open, and show Studio in your demo.
> - **Functional MVP and diagram:** Projects must demonstrate a working frontend and backend plus an architecture diagram.
> - **Video demonstration + presentation:** Succinctly outline the project's core functions and its effective use of Arc Studio and Circle's developer tools, supported by detailed documentation.
> - **Link to GitHub/Replit repo**

#### 🏆 Best Mobile Web Consumer Agent Using the Marketplace Discovery API — $3,000

- Eligibility: Building from scratch — VERIFIED (https://ethglobal.com/events/mumbai/prizes/arc)
- Split: single winner $3,000 — VERIFIED

Track description (verbatim):

> Build the best mobile web consumer agent experience using our marketplace discovery API. Use Arc Studio to build a web app where a consumer’s agent discovers services through the API and pays for them in USDC on Arc, with no crypto knowledge needed from the user. 
>
> **What we’re looking for:**
> - An agent that finds and selects services through the marketplace discovery API
> - Per-use payments with Nanopayments
> - Consumer controls such as spend limits, approvals, and a history of what the agent bought
> - A mobile-first experience a non-crypto user could pick up immediately

Qualification requirements (verbatim):

> Submissions will be evaluated based on the following parameters. Please be clear what bounty you are submitting for as part of your submission.
> - **Built in Arc Studio.** Include a shareable Arc Studio project URL that judges can open, and show Studio in your demo.
> - **Functional MVP and diagram:** Projects must demonstrate a working frontend and backend plus an architecture diagram.
> - **Video demonstration + presentation:** Succinctly outline the project's core functions and its effective use of Arc Studio and Circle's developer tools, supported by detailed documentation.
> - **Link to GitHub/Replit repo**

#### 🏆 Best Smart Contracts with Advanced Stablecoin Logic, In Arc Studio — $3,000

- Eligibility: Building from scratch — VERIFIED (https://ethglobal.com/events/mumbai/prizes/arc)
- Split: single winner $3,000 — VERIFIED

Track description (verbatim):

> Write, test, and deploy smart contracts in Arc Studio that demonstrate advanced programmable logic using USDC or EURC, such as conditional flows, onchain automation, or multi-step settlement. Then connect them to a web or mobile app, new or existing, without leaving Studio.
>
> **What we’re looking for:**
> - Conditional escrow with onchain dispute and automatic release
> - Programmable payroll or vesting in USDC or EURC
> - Treasury management and payment splitting, such as revenue splits and team or DAO payouts
> - Software-to-software payments, where one service or agent pays another
> - Crosschain “conditional transfer” (escrow on source, release on destination via Circle Forwarder) 
> - Bonus consideration for contracts designed to be reused by other builders

Qualification requirements (verbatim):

> Submissions will be evaluated based on the following parameters. Please be clear what bounty you are submitting for as part of your submission.
> - **Built in Arc Studio.** Include a shareable Arc Studio project URL that judges can open, and show Studio in your demo.
> - **Functional MVP and diagram:** Projects must demonstrate a working frontend and backend plus an architecture diagram.
> - **Video demonstration + presentation:** Succinctly outline the project's core functions and its effective use of Arc Studio and Circle's developer tools, supported by detailed documentation.
> - **Link to GitHub/Replit repo**

#### 🏆 Best Use of Bridge Kit for Non-USDC Assets, Built in Arc Studio — $3,000

- Eligibility: Building from scratch — VERIFIED (https://ethglobal.com/events/mumbai/prizes/arc)
- Split: single winner $3,000 — VERIFIED

Track description (verbatim):

> Use Arc Studio to build an application, protocol, or developer tool that uses CCTP via Bridge Kit for non-USDC assets to make assets meaningfully crosschain. 
>
> **What we’re looking for:**
> - Applications that move non-USDC assets across chains in a single, simple user flow
> - Protocols or developer tools that make a new asset crosschain
> - Crosschain flows that settle or pair with USDC or EURC on Arc

Qualification requirements (verbatim):

> Submissions will be evaluated based on the following parameters. Please be clear what bounty you are submitting for as part of your submission.
> - **Built in Arc Studio.** Include a shareable Arc Studio project URL that judges can open, and show Studio in your demo.
> - **Functional MVP and diagram:** Projects must demonstrate a working frontend and backend plus an architecture diagram.
> - **Video demonstration + presentation:** Succinctly outline the project's core functions and its effective use of Arc Studio and Circle's developer tools, supported by detailed documentation.
> - **Link to GitHub/Replit repo**

#### 🏆 Arc Studio Continuity Track: Bring Your Project to Arc — $3,000

- Eligibility: Continuity Track only (page: "This prize is only available to Continuity Track participants") — VERIFIED (https://ethglobal.com/events/mumbai/prizes/arc)
- Split: single winner $3,000 — VERIFIED

Qualification requirements (verbatim):

> Submissions will be evaluated based on the following parameters. Please be clear what bounty you are submitting for as part of your submission.
> - **Built in Arc Studio.** Include a shareable Arc Studio project URL that judges can open, and show Studio in your demo.
> - **Functional MVP and diagram:** Projects must demonstrate a working frontend and backend plus an architecture diagram.
> - **Video demonstration + presentation:** Succinctly outline the project's core functions and its effective use of Arc Studio and Circle's developer tools, supported by detailed documentation.
> - **Link to GitHub/Replit repo**


### Uniswap Foundation — $15,000 total

Source: https://ethglobal.com/events/mumbai/prizes/uniswap-foundation (VERIFIED, read 3 Nov 2026). Sponsor tier on ETHGlobal: Core.

Sponsor note (verbatim):

> The Uniswap Protocol is one of the largest decentralized exchange protocol for swapping value onchain across Ethereum and other supported blockchains. The Uniswap ecosystem has evolved into a full stack platform for onchain finance, including smart contracts such as v2, v3, and v4, developer tools, APIs, and emerging infrastructure like Unichain. This enables developers to build applications on top of shared, permissionless liquidity.

| Track | ETHGlobal category | Total | Split |
|---|---|---|---|
| 🦄 Build with Uniswap | Building from scratch | $10,000 USDC | 1st place $4,000; 2nd place $3,000; 3rd place $2,000; 4th place $1,000 |
| 🦄 Build with Uniswap | Continuity Track only | $5,000 USDC | 1st place $1,250; 2nd place $1,250; 3rd place $1,250; 4th place $1,250 |

#### 🦄 Build with Uniswap — $10,000

- Eligibility: Building from scratch — VERIFIED (https://ethglobal.com/events/mumbai/prizes/uniswap-foundation)
- Split: 1st place $4,000; 2nd place $3,000; 3rd place $2,000; 4th place $1,000 — VERIFIED

Track description (verbatim):

> Build on or integrate any part of the Uniswap stack, including the Uniswap API, the Uniswap AMM (v2, v3, or v4), CCA, or any other Uniswap protocol. This also includes new v4 hooks, extensions or improvements to official Uniswap repositories, and tooling or solutions built for the broader ecosystem.

Qualification requirements (verbatim):

> A public GitHub repository with open-source code, a FEEDBACK.md file, and a completed submission to the Uniswap Developer Feedback Form (https://developers.uniswap.org/hackathon-feedback) that includes the link to your FEEDBACK.md file.
>
> Submissions without it will be reviewed and audited before winners are finalized. Make sure your README clearly points to the relevant contracts and lines of code so we can verify your integration.

#### 🦄 Build with Uniswap — $5,000

- Eligibility: Continuity Track only (page: "This prize is only available to Continuity Track participants") — VERIFIED (https://ethglobal.com/events/mumbai/prizes/uniswap-foundation)
- Split: 1st place $1,250; 2nd place $1,250; 3rd place $1,250; 4th place $1,250 — VERIFIED

Qualification requirements (verbatim):

> A public GitHub repository with open-source code, a FEEDBACK.md file, and a completed submission to the Uniswap Developer Feedback Form (https://developers.uniswap.org/hackathon-feedback) that includes the link to your FEEDBACK.md file.
>
> Submissions without it will be reviewed and audited before winners are finalized. Make sure your README clearly points to the relevant contracts and lines of code so we can verify your integration.


### 1inch — $7,000 total

Source: https://ethglobal.com/events/mumbai/prizes/1inch (VERIFIED, read 3 Nov 2026). Sponsor tier on ETHGlobal: Presenter.

| Track | ETHGlobal category | Total | Split |
|---|---|---|---|
| 💧 Build an Aqua App | Building from scratch | $5,000 USDC | 1st place $2,500; 2nd place $1,500; 3rd place $1,000 |
| 💦 Build an Aqua App - Continuity Track | Continuity Track only | $2,000 USDC | 1st place $1,500; 2nd place $500 |

#### 💧 Build an Aqua App — $5,000

- Eligibility: Building from scratch — VERIFIED (https://ethglobal.com/events/mumbai/prizes/1inch)
- Split: 1st place $2,500; 2nd place $1,500; 3rd place $1,000 — VERIFIED

Qualification requirements (verbatim):

> - Official Aqua/SwapVM contracts must be used (redeployments of a modified SwapVM contract is allowed)
> - Onchain execution of token transfers should be presented during the final demo (local forks are ok)
> - Proper Git commit history (no single-commit entries on the final day)

#### 💦 Build an Aqua App - Continuity Track — $2,000

- Eligibility: Continuity Track only (page: "This prize is only available to Continuity Track participants") — VERIFIED (https://ethglobal.com/events/mumbai/prizes/1inch)
- Split: 1st place $1,500; 2nd place $500 — VERIFIED

Qualification requirements (verbatim):

> - Official Aqua/SwapVM contracts must be used (redeployments of a modified SwapVM contract is allowed)
> - Onchain execution of token transfers should be presented during the final demo (local forks are ok)
> - Proper Git commit history (no single-commit entries on the final day)


### Whitechain — $15,000 total

Source: https://ethglobal.com/events/mumbai/prizes/whitechain (VERIFIED, read 3 Nov 2026). Sponsor tier on ETHGlobal: Core.

| Track | ETHGlobal category | Total | Split |
|---|---|---|---|
| 💳 Operate · Stablecoin Payments for Business | Building from scratch | $5,000 USDC | 1st place $2,500; 2nd place $1,500; 3rd place $1,000 |
| 🏦 Tokenize · Real World Finance on Whitechain | Building from scratch | $4,000 USDC | 1st place $2,500; 2nd place $1,500 |
| ⚡ Scale · Payments Nobody Notices | Building from scratch | $3,000 USDC | 1st place $2,000; 2nd place $1,000 |
| 🔁 Continuity · Bring Your Product to Whitechain | Building from scratch (as filed; text is for existing products) | $3,000 USDC | 1st place $1,500; 2nd place $1,500 |

#### 💳 Operate · Stablecoin Payments for Business — $5,000

- Eligibility: Building from scratch — VERIFIED (https://ethglobal.com/events/mumbai/prizes/whitechain)
- Split: 1st place $2,500; 2nd place $1,500; 3rd place $1,000 — VERIFIED

Qualification requirements (verbatim):

> 1. Contracts deployed on Whitechain Sepolia (chain ID 1874) and verified on the Whitechain explorer
> 2. At least one payment in USDT (0xcedfB56113143d55b2358b8CFbB0dEB5Ad2f55a7) settled on Whitechain in your main flow, with the explorer link in your README. Payments in a test token you minted yourself won't count
> 3. A line in your README on why this flow needs onchain stablecoin settlement on Whitechain and what a regular payment rail couldn't do here
> 4. A public GitHub repo that shows steady progress through the hackathon rather than one big upload at the end, with a README that explains setup, architecture and current limitations
> 5. A demo video of 2 to 4 minutes that shows each party involved
> 6. A WHITECHAIN_FEEDBACK.md in your repo, a few honest lines on what worked, where you got stuck and what our docs were missing
>
> **Good to know before you build**
> Test tokens (WBT, USDT) have no monetary value. Prizes are paid by ETHGlobal in USDC under standard event eligibility rules.
>
> Free Ankr RPC for hackers, 1,500 requests per second for 7 days. [Activate it here](https://www.ankr.com/rpc/?utm_referral=Whitechain2026) when you start building.

#### 🏦 Tokenize · Real World Finance on Whitechain — $4,000

- Eligibility: Building from scratch — VERIFIED (https://ethglobal.com/events/mumbai/prizes/whitechain)
- Split: 1st place $2,500; 2nd place $1,500 — VERIFIED

Qualification requirements (verbatim):

> 1. Contracts deployed on Whitechain Sepolia (chain ID 1874) and verified on the Whitechain explorer
> 2. At least one payment in USDT (0xcedfB56113143d55b2358b8CFbB0dEB5Ad2f55a7) settled on Whitechain in your main flow, with the explorer link in your README. Payments in a test token you minted yourself won't count
> 3. A line in your README on why this flow needs onchain stablecoin settlement on Whitechain and what a regular payment rail couldn't do here
> 4. A public GitHub repo that shows steady progress through the hackathon rather than one big upload at the end, with a README that explains setup, architecture and current limitations
> 5. A demo video of 2 to 4 minutes that shows each party involved
> 6. A WHITECHAIN_FEEDBACK.md in your repo, a few honest lines on what worked, where you got stuck and what our docs were missing
>
> **Good to know before you build**
> Test tokens (WBT, USDT) have no monetary value. Prizes are paid by ETHGlobal in USDC under standard event eligibility rules.
>
> Free Ankr RPC for hackers, 1,500 requests per second for 7 days. [Activate it here](https://www.ankr.com/rpc/?utm_referral=Whitechain2026) when you start building.

#### ⚡ Scale · Payments Nobody Notices — $3,000

- Eligibility: Building from scratch — VERIFIED (https://ethglobal.com/events/mumbai/prizes/whitechain)
- Split: 1st place $2,000; 2nd place $1,000 — VERIFIED

Qualification requirements (verbatim):

> 1. Contracts deployed on Whitechain Sepolia (chain ID 1874) and verified on the Whitechain explorer
> 2. At least one payment in USDT (0xcedfB56113143d55b2358b8CFbB0dEB5Ad2f55a7) settled on Whitechain in your main flow, with the explorer link in your README. Payments in a test token you minted yourself won't count
> 3. A line in your README on why this flow needs onchain stablecoin settlement on Whitechain and what a regular payment rail couldn't do here
> 4. A public GitHub repo that shows steady progress through the hackathon rather than one big upload at the end, with a README that explains setup, architecture and current limitations
> 5. A demo video of 2 to 4 minutes that shows each party involved
> 6. A WHITECHAIN_FEEDBACK.md in your repo, a few honest lines on what worked, where you got stuck and what our docs were missing
>
> **Good to know before you build**
> Test tokens (WBT, USDT) have no monetary value. Prizes are paid by ETHGlobal in USDC under standard event eligibility rules.
>
> Free Ankr RPC for hackers, 1,500 requests per second for 7 days. [Activate it here](https://www.ankr.com/rpc/?utm_referral=Whitechain2026) when you start building.

#### 🔁 Continuity · Bring Your Product to Whitechain — $3,000

- Eligibility: ETHGlobal's data files this under "Building from scratch" and the page shows no Continuity-only banner, but the text asks for an existing product ("Already have a product with users? Add Whitechain to it during the hackathon."). Whether a Classic team can enter is UNVERIFIED; ask Whitechain. (https://ethglobal.com/events/mumbai/prizes/whitechain)
- Split: 1st place $1,500; 2nd place $1,500 — VERIFIED

Qualification requirements (verbatim):

> 1. Contracts deployed on Whitechain Sepolia (chain ID 1874) and verified on the Whitechain explorer
> 2. At least one payment in USDT (0xcedfB56113143d55b2358b8CFbB0dEB5Ad2f55a7) settled on Whitechain in your main flow, with the explorer link in your README. Payments in a test token you minted yourself won't count
> 3. A line in your README on why this flow needs onchain stablecoin settlement on Whitechain and what a regular payment rail couldn't do here
> 4. Proof of your starting point, for example a dated commit from before the hackathon or the page of your earlier submission
> 5. A short "before and during" part in your README so judges can tell the old code from the Whitechain work added at this hackathon
> 6. A public GitHub repo that shows steady progress through the hackathon rather than one big upload at the end, with a README that explains setup, architecture and current limitations
> 7. A demo video of 2 to 4 minutes that shows each party involved
> 8. A WHITECHAIN_FEEDBACK.md in your repo, a few honest lines on what worked, where you got stuck and what our docs were missing


### Ethereum Foundation — $15,000 total

Source: https://ethglobal.com/events/mumbai/prizes/ethereum-foundation (VERIFIED, read 3 Nov 2026). Sponsor tier on ETHGlobal: Core.

| Track | ETHGlobal category | Total | Split |
|---|---|---|---|
| 🕶️ Best Use of Anon-RPC | Building from scratch | $5,000 USDC | 1st place $2,500; 2nd place $1,500; 3rd place $1,000 |
| 🧩 Best use of the Frame Transaction Alternative Mempool | Building from scratch | $5,000 USDC | 1st place $2,500; 2nd place $1,500; 3rd place $1,000 |
| 🌾 Best CROPS App: Censorship Resistant, Open Source, Private, Secure | Building from scratch | $3,500 USDC | 1st place $2,000; 2nd place $1,000; 3rd place $500 |
| 🌾 Best CROPS Upgrade to an Existing Project | Continuity Track only | $1,500 USDC | single winner $1,500 |

#### 🕶️ Best Use of Anon-RPC — $5,000

- Eligibility: Building from scratch — VERIFIED (https://ethglobal.com/events/mumbai/prizes/ethereum-foundation)
- Split: 1st place $2,500; 2nd place $1,500; 3rd place $1,000 — VERIFIED

Qualification requirements (verbatim):

> Your app routes its RPC reads through Anon-RPC by default. If you're building a worker or the harness, a simple demo app is enough.

#### 🧩 Best use of the Frame Transaction Alternative Mempool — $5,000

- Eligibility: Building from scratch — VERIFIED (https://ethglobal.com/events/mumbai/prizes/ethereum-foundation)
- Split: 1st place $2,500; 2nd place $1,500; 3rd place $1,000 — VERIFIED

Qualification requirements (verbatim):

> Show real alt mempool usage: a link to your admitted transaction on the devnet explorer, or code that submits one. Your team must be able to explain the design, the code and the trade-offs.

#### 🌾 Best CROPS App: Censorship Resistant, Open Source, Private, Secure — $3,500

- Eligibility: Building from scratch — VERIFIED (https://ethglobal.com/events/mumbai/prizes/ethereum-foundation)
- Split: 1st place $2,000; 2nd place $1,000; 3rd place $500 — VERIFIED

Qualification requirements (verbatim):

> 1. Public repo under a free and open-source license (MIT, Apache-2.0, GPL, MPL or similar), with a README a judge can run it from.
> 2. The README has a section titled CROPS, one or two lines per letter:
>    - C: what you control that the user depends on (domain, server, RPC, relayer) and what happens if it goes away or refuses them
>    - O: the license, and whether a user can build and run it from the repo alone
>    - P: what each third party (your server, RPC provider, analytics, indexers) learns about the user
>    - S: how keys and user data are protected, and the trust assumptions
> 3. A demo video (3 minutes max) that shows the lead property working end to end, including the moment it matters: for example you switch off your backend, swap the RPC provider, or show server logs with nothing identifying in them.
> 4. No third-party trackers or analytics in the client. If the project handles keys or personal data, they stay on the user's device, or the README says why not.
> 5. One EF prize per project. You can submit to anon-rpc, the alt mempool and CROPS, but you will be placed in at most one. EF judges decide where it fits best.

#### 🌾 Best CROPS Upgrade to an Existing Project — $1,500

- Eligibility: Continuity Track only (page: "This prize is only available to Continuity Track participants") — VERIFIED (https://ethglobal.com/events/mumbai/prizes/ethereum-foundation)
- Split: single winner $1,500 — VERIFIED

Qualification requirements (verbatim):

> 1. Public repo under a free and open-source license (MIT, Apache-2.0, GPL, MPL or similar), with a README a judge can run it from.
> 2. The README has a section titled CROPS, one or two lines per letter:
>    - C: what you control that the user depends on (domain, server, RPC, relayer) and what happens if it goes away or refuses them
>    - O: the license, and whether a user can build and run it from the repo alone
>    - P: what each third party (your server, RPC provider, analytics, indexers) learns about the user
>    - S: how keys and user data are protected, and the trust assumptions
> 3. The README states what the project looked like before the hackathon and which property is new.
> 4. A demo video (3 minutes max) showing the before and after, including the moment the new property matters.
> 5. No third-party trackers or analytics in the client. Keys and personal data stay on the user's device, or the README says why not.
> 6. One EF prize per project. EF judges decide where it fits best.


### ENS — $10,000 total

Source: https://ethglobal.com/events/mumbai/prizes/ens (VERIFIED, read 3 Nov 2026). Sponsor tier on ETHGlobal: Core.

| Track | ETHGlobal category | Total | Split |
|---|---|---|---|
| 🧬 Best Use of ENSv2 | Building from scratch | $7,000 USDC | 1st place $3,000; 2nd place $2,000; 3rd place $1,000; 3rd place $1,000 |
| 🔗 Best Integration of ENSv2 into an Existing Project | Continuity Track only | $3,000 USDC | 1st place $2,000; 2nd place $1,000 |

#### 🧬 Best Use of ENSv2 — $7,000

- Eligibility: Building from scratch — VERIFIED (https://ethglobal.com/events/mumbai/prizes/ens)
- Split: 1st place $3,000; 2nd place $2,000; 3rd place $1,000; 3rd place $1,000 — VERIFIED (the page lists "3rd place" twice; the second is presumably 4th place, UNVERIFIED)

Qualification requirements (verbatim):

> Project must be built on ENSv2 on Ethereum mainnet or Sepolia. ENSv2 features should be central to the product, not a cosmetic add-on. Your demo must be functional and not just include hard-coded values. Upon submission, your project showcase must have a link to a live demo and the code needs to be open source and accessible on Github or a similar platform.

#### 🔗 Best Integration of ENSv2 into an Existing Project — $3,000

- Eligibility: Continuity Track only (page: "This prize is only available to Continuity Track participants") — VERIFIED (https://ethglobal.com/events/mumbai/prizes/ens)
- Split: 1st place $2,000; 2nd place $1,000 — VERIFIED

Qualification requirements (verbatim):

> Integration must use ENSv2 on Ethereum mainnet and integrate it into an existing project. It should be clear how ENSv2 improves the project, not just a cosmetic add-on. Your demo must be functional and not just include hard-coded values. Upon submission, your project showcase must have a link to a live demo and the code needs to be open source and accessible on Github or a similar platform.


### Definitive — $5,000 total

Source: https://ethglobal.com/events/mumbai/prizes/definitive (VERIFIED, read 3 Nov 2026). Sponsor tier on ETHGlobal: Ruby.

| Track | ETHGlobal category | Total | Split |
|---|---|---|---|
| 🏆 Best Use of Flash Advanced Orders in a Social App | Building from scratch | $2,500 USDC | single winner $2,500 |
| 💡 Most Creative Use of Definitive Flash Advanced Orders | Continuity Track only | $2,500 USDC | single winner $2,500 |

#### 🏆 Best Use of Flash Advanced Orders in a Social App — $2,500

- Eligibility: Building from scratch — VERIFIED (https://ethglobal.com/events/mumbai/prizes/definitive)
- Split: single winner $2,500 — VERIFIED

Qualification requirements (verbatim):

> -  A working trading flow powered by Flash API or Flash MCP advanced orders (DCA, Limit, Stop, Stop Loss, Take Profit, TWAP).
> -  Onchain execution shown in the final demo.
> -  Submit a short demo video on both Discord and X featuring your product. Tag @DefinitiveFi on X.

#### 💡 Most Creative Use of Definitive Flash Advanced Orders — $2,500

- Eligibility: Continuity Track only (page: "This prize is only available to Continuity Track participants") — VERIFIED (https://ethglobal.com/events/mumbai/prizes/definitive)
- Split: single winner $2,500 — VERIFIED

Qualification requirements (verbatim):

> -  A working trading flow powered by Flash API or Flash MCP advanced orders (DCA, Limit, Stop, Stop Loss, Take Profit, TWAP).
> -  Onchain execution shown in the final demo.
> -  Submit a short demo video on both Discord and X featuring your product. Tag @DefinitiveFi on X.


---

## 5. Could not verify / open questions

1. **ETHGlobal finalist prize amount.** No finalist cash prize appears on the pages read. The only figure is the X promo "$175,000+ in prizes", against $144,500 of listed partner prizes. UNVERIFIED.
2. **Continuity Track mechanics.** How a team joins the "Continuity batch" (Arkiv's wording), whether it had to be chosen at application time, and whether Continuity teams can also enter `building-from-scratch` prizes (or the reverse). The prize page's "Continuity Track participants →" link target was not captured. UNVERIFIED.
3. **Pre-event planning documents under Classic rules.** /info/details bans "prior project-specific code, designs, or assets". Whether a written brief or architecture plan (no code) counts as "designs" is not addressed. The spec-driven rule requires "all spec files, prompts, and planning artifacts" to be in the repo. Ask ETHGlobal staff before the hack starts. UNVERIFIED.
4. **Whether partner booth presentations are required.** /info/details says optional; /info/start says "you'll present your project at the partner booths". Conflicting primary text.
5. **Whitechain "Continuity · Bring Your Product to Whitechain".** Filed under `building-from-scratch` in the page data, with no Continuity-only banner, but written for existing products. Eligibility UNVERIFIED.
6. **ENS "Best Use of ENSv2" split.** Lists "3rd place $1,000" twice (likely a 4th place). UNVERIFIED.
7. **Stake amount.** Not published. Also not verified (and not checkable from here): whether every team member is accepted and staked. This matters because applications and staking are closed.
8. **Page stability.** Prize data shows `status: finalized`, but EF's CROPS tracks say "(tbc: final review pending)". World's Agent Pass notes "We are mocking proofs now". Sponsors may edit tracks before or during the event; re-check the prize page on 5 Nov.
9. **Sponsor infrastructure facts not independently checked:** Arkiv "current testnet" (Rabdi, chain ID 7794095, endpoints quoted from the sponsor note); Hedera's facilitator list (Official x402, Ax402, Blocky402); Whitechain Sepolia (chain 1874) and its USDT address; Arc Studio access. All are quoted from the prize page only, not tested.
10. **Sponsor blog/X posts on Mumbai bounties** were not reviewed in depth, because the primary prize page was fully readable. Secondary pages (hashtagweb3.com/ethglobalmumbai, coindaro.com/events/ethglobal-mumbai-2026, hacklist.io) agree with the primary data: 5–7 Nov, 36 h, $144,500 across 12 sponsors, 3 partner picks, 4+3 min finalist slot, 2–4 min video.
