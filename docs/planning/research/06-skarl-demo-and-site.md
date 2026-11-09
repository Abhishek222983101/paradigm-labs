# 06 — Skarl: what judges saw (demo video, live site, Devpost)

> Researched 5 Nov 2026 (before the 21:00 IST start, so research only, no project work). Prior art only: **do not copy Skarl's code, design or assets** (public repo, no licence).
> Sources: local copy of the demo video (`skarl-study/video/skarl-demo.mp4`, copied from `~/Downloads/skarl-demo-SnapYT.App.mp4`), the YouTube transcript, the live site (browsed public pages only, no sign-in, no wallet), the Devpost page (Exa fetch), Skarl's public repo docs (`skarl-study/repo/docs/status.md`, `demo-script.md`), and Base Sepolia Blockscout (read-only lookups).
> Frames: `skarl-study/video/frames/` (`f_NNNs.jpg` = a frame every 3 s at second NNN; `scene_*.jpg` = hard cuts; `zoom_*.png` = upscaled crops). Contact sheets with timecodes: `skarl-study/video/sheets/sheet_01..13.jpg`. Site screenshots: `skarl-study/site/`.

## 0. Is the file the YouTube video?

Yes. YouTube `mSNAkI_mGPY` "skarl demo" was uploaded by **Matthew Kim** (a Skarl teammate) on **25 Oct 2026, 08:40 PDT**. It lists `lengthSeconds: 147` (the file is 147.49 s), and the transcript matches the on-screen captions line for line. It had 102 views on 5 Nov. The local file is a 640×360 re-download (SnapYT), so the original upload resolution is unknown. The YouTube thumbnail (`skarl-study/video/yt-thumb-hq.jpg`) is a polished render of a red cup, a phone and evidence cards that never appears in the video. It looks AI-generated or designed.

---

## 1. Shot-by-shot breakdown

There are 366 narration words in 147 s, about 150 wpm, which is dense. The music bed never stops (mean −16.8 dB, no silence until the last 0.6 s). Hard cuts fall at 4.2, 14.1, 16.7, 47.2 and 88.0 s. Everything else is a soft transition: zoom, slide or cross-fade.

| Time | On screen | Narration (transcript) | Frames |
|---|---|---|---|
| 0:00–0:04 | Cream background, kinetic type: "Robots learn from [robot thumbnail chip]". | "Robots learn from people." | `f_000s` |
| 0:04–0:09 | Phone-on-tripod photos fan out → big word **"Unusable."** with a lime glow → a "Payout · Pending" card with a Mon–Sat strip and "Unpaid for w[eeks]" sliding in. | "But most of that footage is unusable, unprovable, and the people behind it wait weeks to get paid." | `scene_4.4`, `f_003s`, `f_006s` |
| 0:09–0:14 | Skarl logo, then "One real task, from request to receipt." | "So, we built Skarl. Let's follow one real task from request to receipt." | `f_009s`, `f_012s` |
| 0:14–0:17 | Browser frame of the live landing page (dark hero, sponsor logo strip: Gemini, x402, coinbase, base, convex). Caption "It starts with a buyer." | "It starts with a buyer." | `scene_14.3`, `f_015s` |
| 0:17–0:22 | `/orders/new` "Post a task" form (Base Sepolia · test USDC only). The "Auto-pay override when every check passes" checkbox and the max-payout field are highlighted. An iPhone mockup slides in with the contributor app's Tasks list. | "A robotics team asks for one simple demonstration. Pick up the can and set it next to the hat. They lock the rubric, price each clip at 1.875 USDC, and sign an auto pay rule capped at exactly that." | `scene_16.9`, `f_018s`, `f_021s` |
| 0:22–0:29 | Phone task page "Can-to-hat narrated demonstrations": 1.875 USDC/video, 10–30 s, 4 of 4 spots, 3 steps, "Start recording". Big left type "1.875 test USDC per clip", then the chip "Auto-pay cap · 1.875 test USDC". | (continues) | `f_024s`, `f_027s` |
| 0:29–0:38 | Console `/dashboard/proof/payments`: highlight "10.00 USDC funded on Base Sepolia". x402 timeline cards: 402 challenge ("issuance is not persisted") → Buyer signed → Facilitator settled ("receipt and timestamp are not persisted") → CDP webhook ("No matching CDP webhook receipt") → On chain (BaseScan). Agent wallet (CDP) panel: cap 2.00 USDC, two refused sends (over cap 2.000001 → 403; recipient not on allowlist 0.10 → 403). Then `/dashboard/reconciliation` with the Funding row highlighted (Order / Ledger / Chain / Mock bank all "Match"). Chips: "BaseScan 0x4d2…7087", "x402 · coinbase · Base Sepolia". | "Then they fund it. 10 test USDC moves over x402 on Base through Coinbase and lands in the order before anyone records a thing." | `f_030s`, `f_033s`, `f_036s`, `zoom_30s.png` |
| 0:38–0:47 | A chat box types "Connect yourself to Skarl, a marketplace f…". Then a split: dark terminal showing MCP calls `skarl_onboard()` (steps: connect a wallet, get address, add test USDC, pick a task, create an order, pay with x402, track delivery), `skarl_wallet_status`, `skarl_list_tasks_public` (JSON of tasks/criteria), next to the payments page. Caption "Every Skarl action is an MCP tool. Hosted on Convex." Chips "coinbase x402 · CDP facilitator", "Solana Devnet rail". | "And agents can do all of this on their own because every Skarl action is an MCP tool hosted on Convex." | `f_039s`, `f_042s`, `f_045s` |
| 0:47–0:59 | Section "Anyone with a phone can earn." A left checklist builds (Pick a task → Give consent → Say the words on screen → Record it). Phone: Tasks list → consent sheet "Before you record" (only I am seen/heard; licence to buyer for training, demo-consent-v1, original kept private; paid in USDC after a person approves; share motion data, no location) → Capture screen with the overlay **"SAY FIRST boat · button · goat"**, step prompts, a timer (8.4 s → 14.5 s), a "Steady" badge and "Next step". Real footage of a hand moving a seltzer can next to a cap. Chip "Real take · Can-to-hat · uploaded to Convex · Needs review". Phone clock 7:36–7:40. | "Now, the contributor. Silas opens the app, picks the can-to-hat task, and gives consent. He records it on his phone and says the words on screen so we know it's really him, live." | `scene_47.4`, `f_048s`, `f_051s`, `f_054s`, `f_057s` |
| 0:59–1:08 | Split screen: phone capture (left) and console `/dashboard/submissions` clip `mn71p7hy` (right) with video player, Video/Audio/Motion lanes and a Witnesses list. Chip "Gemini vision + audio jury". Tabs Vision / Audio / Copy / Consent pulse. Caption "Every clip gets witnesses." **When zoomed, this console clip is scored against the *red-cup* rubric** ("Pick up the red cup, not the blue cup: Unobservable"). It shows "Needs review", "No video evidence", and a narration transcript "Snow field piano". | "Seconds later, the witnesses get to work. Two Gemini models watch the video. A separate model listens, and every claim is tied to a timestamp." | `f_060s`, `f_063s`, `f_066s`, `zoom_061s_console.png` |
| 1:08–1:17 | Phone "Take GZ8NK": "Recommended for acceptance", VIDEO/AUDIO evidence bars, Can pickup / Hat placement / Narration alignment all **Supported** with ms-level timestamps ("A hand grasps the can… at 8951 ms…"). Left text builds: "AI recommends acceptance. The buyer decides." + "Spoken liveness · Matched". When zoomed, the liveness evidence says the issued words were **"honey paper ocean"**, not the "boat button goat" seen at capture. Phone clock 8:15. | "Can pick up supported. Hat placement supported. Narration supported. The AI recommends acceptance, but it doesn't decide." | `f_069s`, `f_072s`, `f_075s`, `zoom_075s_liveness.png` |
| 1:17–1:21 | "Missing" fades, then phone "Take GZJRB · Waiting on a person" with every check "Unobservable". | "When evidence is missing, a person decides." | `f_078s` |
| 1:21–1:27 | Console clip `mn79eef6`, video blurred, red banner "Suspected copy of clip mn7…, similarity 100%… No payable can be created while this stands". Caption **"A copy never gets paid twice."** | "And when someone resubmits a copy, it's caught. A copy never gets paid twice." | `f_081s`, `f_084s` |
| 1:27–1:29 | Submissions table: 6 clips, **1 Accepted** (`mn71jant`, uploaded Oct 25 8:14 AM, analysis 1:02) and 5 "Needs review". | "Silas' clip is accepted…" | `scene_88.3`, `f_087s` |
| 1:29–1:32 | `/dashboard/ledger` journal: Funding entry, USDC cash Dr 10.00 / Customer prepayments Cr 10.00, "Balanced 10.00 = 10.00". Caption "One payable. Books that balance." (The entry shown is the funding entry, not a payable.) | "…and it becomes one payable in books that always balance." | `f_090s` |
| 1:32–1:41 | `/dashboard/agent`, "Claude · finance agent" chat (questions about the books, cited tool results). Then `/dashboard/scenarios` card "Agent approves itself", badge **"Blocked · Simulated"**, header "Isolated lab order · no funds move". Caption "It tries to approve itself. **Blocked.**" | "Next, Claude reads the books and proposes the payout. It even tries to approve itself. Blocked." | `f_093s`, `f_096s`, `f_099s` |
| 1:41–1:50 | Motion graphic (not a real wallet popup): a Coinbase-branded "Signature request · Auto-pay rule" card (Signed by Buyer · Cap 1.875 test USDC per clip · Checks: all required · Execution: CDP wallet cap enforced · "Signed"), with a flow building on the right: Agent proposes payout → Rule checks: within cap → Buyer's signed rule: approved → "CDP cap guards execution". Caption **"Agents propose. Humans approve."** | "Instead, the buyer's signed rule approves it within its cap, and a Coinbase wallet cap guards the transfer. Agents propose, humans approve." | `f_102s`, `f_105s`, `f_108s` |
| 1:50–1:59 | Reconciliation with the Payout row highlighted (Order ✓, Ledger ✓, Chain ✓ 1.875, Mock bank "Missing: bank record missing"; header "1 of 2 agree on all four"). Big chip **"Paid 1.875 test USDC on Base Sepolia"**, sub-chips "BaseScan 0xd873…d2c4", "Silas's wallet · Base Sepolia". A side panel "Payout receipt · Reconciled · Base Sepolia log 0". | "Then 1.875 USDC lands in Silas' wallet on Base, and order, ledger, and chain all agree on it." | `f_111s`, `f_114s`, `f_117s`, `zoom_117s.png` |
| 1:59–2:05 | "Video receipt" page (3D wireframe blob, Origin cards with a globe, capture and contributor). Chips Evidence · Consent · License · EAS attestation · Base. Then the contributor "Overview": latest clip `mn71jant` Paid, a stepper Uploaded → AI checked → Reviewed → Accepted → Paid, "Reviewer: Buyer-signed policy accepted all stored verification checks", Earned 1.875 / Paid 1.875. Caption "Silas sees exactly what he was paid." | "The clip ships with its receipt attested on Base, and Silas can see exactly what he was paid. Every claim is on the record." | `f_120s`, `f_123s`, `zoom_121s_receipt.png` |
| 2:05–2:19 | **Sponsor roll-call** over cropped `/dashboard/proof/*` headers: "Proof · ⚠ **Not demo ready · 35 of 37 checks pass**", "Anthropic Claude · Finance agent · 12 runs, none tried to approve", "EAS on Base · Attestations · 7 of 7 clips attested on Base Sepolia", "Atlassian Jira · Guard · **0 exceptions eligible for Jira**. Jira cannot approve money.", then `/dashboard/integrations` (Agents connect over MCP: Live, 4 keyless tools; spend policy: 2 sends refused; "Real vs simulated: **6 live, 4 simulated**"; "Pending: Contributor payout"; that snapshot is dated 04:40 PDT, before the payout). | "Coinbase pays, Gemini judges, Claude reads the books, Solana licenses, a mock bank checks, Base attests, Convex runs it, and Atlassian guards it." | `f_126s`, `f_129s`, `f_132s`, `f_135s`, `f_138s`, `zoom_138s_b.png` |
| 2:19–2:24 | `dataset-lerobot.out` JSON (`"schema": "skarl.lerobot-v2-manifest.v1"`, `"target": "LeRobot v2"`, **`"directly_loadable": false`**, reason "Metadata and private video references only…", `"robot_type": "human_video"`). Buttons Download JSONL/JSON; chips LeRobot v2 · RLDS · JSONL · JSON. | "And the buyer gets what they came for, a data set that exports for LeRobot and RLDS with its receipt attached." | `f_141s` |
| 2:24–2:27 | Logo end card. | "Skarl, every claim has a witness." | `f_144s` |

### Editing style and rules check
- **Style:** a product-launch explainer, not a screen walk-through. Cream canvas (#FDFDFA-like) with a soft lime radial glow behind each focus element. Screens are shown inside floating browser frames and iPhone mockups, never full-screen. There is constant slow zoom/pan to the highlighted row, a lime highlight ring on the exact field being narrated, and kinetic headline type that echoes the voiceover ("Unusable.", "Blocked.", "Agents propose. Humans approve."). Pill chips name the sponsor or tx hash ("BaseScan 0xd873…d2c4", "x402 · coinbase · Base Sepolia") so the sponsor logo is on screen when its feature is mentioned. It looks like a Screen Studio / After Effects or Remotion-style edit, and the recordings were clearly made separately and composited.
- **Pacing:** a new visual roughly every 3 s, with no dead air and no live cursor wandering. Nothing waits on loading, and model inference ("Seconds later") is cut out. The phone capture plays at about real time (the timer shows 8.4 s → 24.5 s across ~12 s of video, with cuts).
- **Music:** a continuous upbeat bed under the voice.
- **Voiceover:** a single calm, scripted narrator. From frames and level analysis alone I cannot tell whether it is a human read or TTS: it is evenly paced at ~150 wpm with only 19 short pauses, and the closing "Skarl, every claim has a witness" was transcribed as "Carl…". **Someone on the team should listen to the first 20 s before we copy the format.** Either way, **ours must be a human voice** (ETHGlobal bans AI voiceover).
- **Against ETHGlobal rules:** 2:27 fits 2–4 min ✓. No phone *recording of a screen* (the phone UI is a screen capture inside a mockup; the product's own footage is filmed on a phone, which is content, not presentation) ✓. ≥720p cannot be confirmed from our 360p copy. Captions are effectively burned in. There is no speed-up beyond cuts. **Their own `docs/demo-script.md` told them to put LIVE / RECORDED / SIMULATED labels on every segment; the final video does that only once (the "Simulated" badge) plus "test USDC".**

---

## 2. Story structure and why it works

1. **Problem hook (0:00–0:14):** three one-word pains (unusable, unprovable, unpaid for weeks) in 9 s. Then the promise: "one real task, from request to receipt".
2. **Buyer (0:14–0:29):** one concrete, slightly funny task (can next to the hat), one price (1.875), one rule (cap = price).
3. **Funding (0:29–0:38):** money arrives *before* work: x402 → Base → reconciliation row matches.
4. **Agent-native aside (0:38–0:47):** "every action is an MCP tool", with a paste-a-prompt moment.
5. **Contributor (0:47–0:59):** a named human ("Silas", a teammate), consent sheet, liveness words, real footage.
6. **Verification (0:59–1:27):** witnesses with timestamps → AI recommends, doesn't decide → the missing-evidence path → the copy-detected path. The happy path and two failure paths fit in 28 s.
7. **Finance agent (1:27–1:50):** books balance → Claude proposes → tries to self-approve → **Blocked** → the buyer's signed rule approves → CDP cap.
8. **Payout (1:50–1:59):** a big "Paid 1.875 test USDC on Base Sepolia" plus a tx-hash chip.
9. **Receipt (1:59–2:05):** the receipt page plus the contributor's own earnings screen.
10. **Sponsor roll-call (2:05–2:19):** one sentence naming eight sponsors with a verb each ("Coinbase pays, Gemini judges…").
11. **Buyer payoff (2:19–2:24):** LeRobot/RLDS export. **Tagline (2:24).**

**Why it works for judges:**
- It follows **one object (one clip, one 1.875 payment) end to end**, so judges never lose the thread.
- Every abstract claim has a visual: rule → signature card, verification → timestamped evidence, payment → tx chip.
- It shows failure paths (missing evidence, duplicate, self-approval), which signals seriousness.
- The sponsor-track judge hears their sponsor's verb at the moment the feature is on screen, so each sponsor judge can tick their box in 2 s.
- The tagline "every claim has a witness" ties verification and accounting into one idea.
- The Coinbase x402 judges got exactly their story: an agent-payable endpoint, a CDP facilitator, a CDP wallet policy, and the CDP webhook reconciled into books.

---

## 3. Real on-chain evidence vs claimed

**Verified by us on Base Sepolia (Blockscout, read-only):**

| What | Tx / address | Notes |
|---|---|---|
| Funding shown in the video ("BaseScan 0x4d2…7087") | `0xa4d2598e29673b2f6b203889acd3723396e00bc0058da31d991e8b8f52ad7087` | 10 USDC, buyer `0xa54DABc8…` → treasury `0x8408A922eA400aF33d7C2080a9Edd5D3495B695f`, **2026-10-25 15:17:45 UTC (08:17 PDT)** |
| Payout shown in the video ("BaseScan 0xd873…d2c4") | `0xd8733d646f3465779aa00d15b0cee702f69f0498738de15c415cd7365d14d2c4` | 1.875 USDC from CDP agent wallet `0x0A9EfDF66c58543538824906aE267B969Ed651c5` → contributor `0x975e1455…`, **15:18:12 UTC, 27 s after the funding and 22 min before the YouTube upload** |
| Earlier x402 funding (public facilitator) | `0x28b3f88d…d757` | 10 USDC, 01:38 PDT (repo `status.md`) |
| x402 via CDP facilitator + signed webhook | `0x20c9252f…390d` | 0.01 USDC |
| Agent faucet funding (MCP `skarl_request_testnet_usdc`) | `0x7e97cbbc…89b7` + 3 more | CDP faucet → agent wallet |
| EAS schema / attestor | schema `0x1ea6e2d3…804f`, attestor `0xbc1e…F26B` | Repo says 11 attested reports. The video says "7 of 7 clips". |
| CDP Policy Engine refusals | no tx (HTTP 403 `policy_violation`, correlation IDs in `status.md`) | Real API refusals, shown in the video as a list, not live |

**Shown in the video only as abbreviated chips:** tx hashes are never opened on BaseScan, no EASScan page is shown, and no wallet signature popup appears (the "Coinbase · Signature request" card is a motion graphic).

**Claimed or simulated, not demonstrated as real:**
- **Self-approval "Blocked":** a **simulated** lab scenario ("Isolated lab order · no funds move").
- **Solana Token-2022 licence per delivery:** per their status doc only one devnet smoke mint existed. No licence for this delivery is shown, only a "Solana Devnet rail" chip and "Solana licenses" in the roll-call.
- **Mock bank:** Capital One Nessie sandbox, and the payout row says "bank record missing".
- **Atlassian Guard:** "0 exceptions eligible for Jira", so nothing happened.
- **Coinbase Wallet MCP plugin purchase:** their own `demo-script.md` lists it as unverified.
- **LeRobot export with SO-101 joint targets:** the manifest shown says `directly_loadable: false`, metadata only.
- **IMU/motion check:** "Pending" in the witnesses list. **Object detector:** "Missing".
- **Gemini jury accuracy:** "accuracy unmeasured" (their integrations page and Devpost "What's next").
- **"Proof · Not demo ready · 35 of 37 checks pass"** appears in their own video.

---

## 4. Live site tour (5 Nov 2026, public pages only)

**Headline: 11 days after the event, only the static landing page works.** Their Convex deployment `keen-marmot-986` is unreachable:
- the WebSocket to `wss://keen-marmot-986.convex.cloud` fails and keeps reconnecting
- `https://keen-marmot-986.convex.site/mcp`, `/llms.txt` and `/skill.md` all return **404**
- `/api/health` returns **503** `{"status":"degraded","databaseConnected":false,"inference":false,"payments":false,"demoOnly":true}`

| Page | What it shows | State | Screenshot |
|---|---|---|---|
| `/` landing | Dark hero with a particle "dust" animation: "Get paid to record short task videos for AI teams." CTAs "Record a demonstration" / "Fund a request". A "Skarl is built on" marquee (Convex, Gemini, Claude, x402, Coinbase Wallet MCP, Base Sepolia, Solana, Capital One Nessie, Atlassian). "From task to payout" photo carousel (Record / Check / Approve / Pay). "How Skarl checks a clip": an animated terminal with tabs Held / Paid / Copy / Review (a red-cup example, labelled `gemini-3.8-flash`, a canned animation, not live). "How Skarl pays out a test order": a 6-step accounting walkthrough with a live-updating journal (prepay 100 → accept → payable 7.50 → refund 90 → cash 2.50). "Connect your agent": a copyable agent prompt plus tabs for Claude Code / Cursor / VS Code / Claude.ai-ChatGPT / Pay with Coinbase Wallet (`claude mcp add --transport http skarl https://keen-marmot-986.convex.site/mcp`). Footer links to GitHub, docs, architecture, Devpost. | Works (static). The MCP URL it advertises is dead. | `01-home.png`, `01-home-full.png` |
| `/contribute` | Contributor shell: Overview / My clips / Earnings sidebar, "Capture with the Skarl app" (install Expo Go, open the team's project link). | Skeleton loaders forever (no backend). The phone app is distributed only via Expo Go, not the App Store. | `02-contribute.png`, `12-contribute_earnings.png` |
| `/orders/new` → `/dashboard/post`, `/dashboard`, `/dashboard/reconciliation`, `/dashboard/proof`, `/dashboard/integrations`, `/dashboard/submissions` | Buyer console (seen in the video) | Stuck on "Checking access…" | `03`, `04`, `07`–`10` |
| `/signin` | | Stuck on "Checking your account…" | `11-signin.png` |
| `/proof`, `/integrations` (top-level) | | 404 (they live under `/dashboard/`) | `05`, `06` |
| `/skill.md`, `/llms.txt` (web domain) | | **404**. The landing page points agents to `keen-marmot-986.convex.site/llms.txt`, also 404. The repo `status.md` says `/skill.md` was deployed during the event. | n/a |

**Design language:**
- **Colour:** near-black ink `#10120E`, warm off-white `#FDFDFA` with grey-green panels `#EFF1ED`, and **one lime accent** used for highlights, glows and primary buttons.
- **Type:** **PP Neue Montreal-style grotesk** ("montrealBook/Regular/Medium") at weight 400 even for headlines, plus a mono ("fono") for code and IDs.
- **Layout:** generous whitespace, thin 1 px borders, rounded cards, a muted shadcn-like console with a left sidebar.
- **Tone:** restrained "fintech/Linear" aesthetic, very consistent between the video, the site and the app. Their repo even ships a design-system skill ("Glaze").
- **Weaknesses:**
  - the landing copy contradicts itself on approval: "A person on the team signs off on each payout" vs "the buyer's rule approves"
  - a stock-looking "Record" photo
  - the demo terminal is a canned animation

---

## 5. Devpost (devpost.com/software/skarl)

**Tagline:** "Real-world data, verified by AI, paid out instantly." Submitted to Cal Hacks 13.0. **Winner: [Coinbase] Best Use of x402.** Their write-up also addresses Hyphenate (finance-agent track), Gemini, Claude, Capital One Nessie, Atlassian and Solana.

**Inspiration:**
- Figure's reported $1B data+compute plan and $15M paid to contributors (company-reported)
- App Store reviews complaining about pending payouts and unexplained rejections
- "~90% of bulk footage is thrown out" (vendor estimate)
- duplicate uploads

**What it does:**
- **Buyer web console:** post a task with plain-language checks, clip count and price.
- **Funding:** fund in USDC on Base via x402 from Coinbase Wallet *or the buyer's own AI agent*, and set an auto-pay rule (all checks pass, ≤ per-clip price).
- **Review:** each submission shows timestamped evidence, and failures go to a review queue with the reason.
- **Finance agent:** drafts but cannot approve. A CDP wallet cap is a second limit.
- **Ledger page:** lines up order, double-entry books and chain.
- **Export:** LeRobot v2.1, with hand keypoints mapped to SO-101 joint targets.
- **Phone app:** Google sign-in, see the pay, consent to the licence, step-by-step capture with narration plus 3 random spoken words, motion trace.
- **Server-side checks:** Gemini watches, transcription listens, a copy check compares against earlier clips.
- **Contributor wallet:** one-tap device wallet, no seed phrase.

**How we built it:**
- **Stack:** pnpm monorepo; Next.js 16 + Tailwind; Expo/React Native; Convex (transactions, integer micro-USDC everywhere, scheduler/crons, Workflow component holds payments awaiting approval, live queries).
- **Verification:** FFmpeg frames+audio, hashed. Two vision models (Gemini "Argon" + Flash) must agree, otherwise a person reviews. Separate transcription. Aligned frame-hash copy detection (catches trims and re-encodes). An EAS attestation per report on Base Sepolia.
- **Wallet:** device key in the iOS keychain. Ownership is proven with a signed one-time message (SIWE-like) before the address joins the payout allowlist.
- **Coinbase:** x402 via the CDP facilitator; signed CDP webhooks before booking; CDP wallet policy (cap + allowlist, really rejected over-cap and unknown-address sends); a Coinbase Wallet MCP plugin; MCP tools + skill file for agent self-onboarding; a rate-limited testnet USDC faucet.
- **Claude:** finance agent with 24 typed ledger tools that can explain, draft and write exception notes but cannot approve. Also a contributor "coach". Gemini runs a second finance agent.
- **Nessie:** mock-bank reconciliation (a 10 USDC order matched on all four).
- **Atlassian:** "Skarl Guard" Forge app (triage, quarantines instruction-like text, caps agent actions, logs, safe undo).
- **Solana:** one-of-one Token-2022 licence per delivery (supply 1, mint authority revoked, metadata hashes of manifest, licence and consent; signed via CDP). Also a Solana devnet x402 funding rail (1 USDC end to end).

**Challenges:**
- keeping phone, console and chain in sync (Convex as the single decider; a transfer counts only when the CDP webhook and an on-chain lookup agree)
- device-wallet ownership proofs (lazy curve imports broke in Convex, so they bundled the curve)
- stopping silent wallet replacement
- a verifier hard-coded to "red cup on coaster" until a second task forced rubric-driven checks at dawn

**Accomplishments:**
- real testnet money over real rails, with the ledger balanced to the micro-USDC
- CDP refusals held
- finance agents ran live against the ledger
- 11 EAS-attested reports
- a whole product across two apps

**Learned:**
- payment trust is mostly about knowing a payment happened and never double-paying
- two models from one family are not independent opinions
- separating propose from approve made it safe to give the agent useful access

**What's next:**
- **measure verifier accuracy** on a hand-labelled set (false accept/reject)
- Coinbase embedded wallets (survive a lost phone)
- ARKit hand pose, depth, camera pose; head-mounted mode
- validate the SO-101 export on a real arm
- mainnet, bank cash-out, and a pilot with a human-data company

**Built with:** atlassian-forge, base, capital-one-nessie, claude, coinbase-developer-platform, convex, convex-auth, ethereum-attestation-service, expo.io, ffmpeg, gemini, google-oauth, jira, model-context-protocol, next.js, pnpm, react, react-native, solana, tailwindcss, typescript, usdc, vercel, viem, x402.

**Team (4):** Stephen Hung, Joshua Lin, Silas Wu (the "Silas" contributor in the video; started the Devpost project 25 Oct 11:47 EDT), Matthew Kim (uploaded the video).

---

## 6. Gaps and weak spots a judge could poke at

1. **The "one real task" is stitched from several takes:**
   - the capture shows liveness words "boat · button · goat" (phone clock 7:40)
   - the accepted take GZ8NK / `mn71jant` matched "honey paper ocean"
   - the console clip shown during "every clip gets witnesses" (`mn71p7hy`) has narration "Snow field piano", **is scored against the red-cup rubric, and is "Needs review" with "No video evidence"**, while the voice says "Can pick up supported"
   - Not dishonest about money, but "let's follow one real task" is an edit.
2. **Event order differs from the narration:**
   - the narration says funding lands "before anyone records a thing"
   - on chain, the order shown was funded at 08:17:45 PDT, after the 7:40 capture and after `mn71jant` was uploaded (8:14)
   - the payout followed 27 s later, 22 min before upload
   - This looks like a scripted golden-path run done just before recording.
3. **Agent autonomy is mostly claimed:**
   - MCP calls appear as a terminal overlay and the paste-a-prompt is typed for show
   - no agent is seen discovering, paying and getting a result end to end
   - the self-approval "Blocked" is a **simulated** scenario
   - The Claude finance agent is read-only/draft-only, which is safe but not autonomous.
4. **Centralisation:**
   - Convex decides everything
   - the treasury, CDP agent wallet and attestor are all team-controlled
   - the buyer's "signed rule" lives in their DB (the signature card is a motion graphic)
   - there is no escrow contract and no on-chain enforcement of the rule
   - EAS only attests that a verdict existed, not that it was right
   - When the backend died, everything died, including the agent endpoint they told judges was the point.
5. **No sybil resistance:**
   - Google sign-in plus a device wallet
   - three spoken words prove liveness, not uniqueness or identity
   - one person can run many accounts and devices
   - Copy detection only catches re-uploads of the *same* footage, not cheap staged takes.
6. **Verification quality is unmeasured:** two same-family models ("can be wrong together", in their own words); IMU pending; object detector missing; no accuracy number.
7. **Sponsor breadth over depth:** Solana licence (one smoke mint), Nessie (mock, payout "missing"), Atlassian (0 exceptions), Wallet MCP purchase (unverified). All of these are named in the roll-call but not shown working.
8. **Self-flagged unreadiness on screen:** "Not demo ready · 35 of 37 checks pass", "6 live, 4 simulated", "Pending: contributor payout" (an older snapshot). A sharp judge will pause on these frames.
9. **Data value:** a phone on a table filming a can is not robotics-grade, and the LeRobot manifest says `directly_loadable: false`.
10. **Live site after the event:** the dashboard, MCP, llms.txt and skill.md are all dead, so a judge checking later finds a shell.

---

## 7. Demo lessons for our ETHGlobal video and live demo

**Copy in spirit (not in design):**
1. **One object, end to end.** Pick one task and one clip/payment and follow it from request to receipt. Keep the title card promise ("one real task").
2. **Three-beat problem hook in under 10 s**, then the product name. Use our own words and visuals, not theirs.
3. **Show two failure paths for every happy path** (rejected/duplicate/over-budget/expired), each in 3–5 s.
4. **Name each sponsor with a verb as its feature is on screen**, but only for the **3 partners we actually use** (Hedera, Arkiv, World). Skip the 8-logo roll-call: depth beats breadth.
5. **Highlight the exact field being narrated** (a ring or zoom) and keep screens framed. Viewers should never hunt for the cursor.
6. **End on a one-line thesis** of our own (e.g. about open, shared records), not theirs.

**Do better:**
1. **Truly one take.** Record the golden path in one continuous session and keep the same liveness challenge, clip ID and tx visible from capture → verdict → payout. If we must splice, label the cut ("replayed take, same clip ID").
2. **Open the explorer.** Click through to HashScan for the Hedera x402 tx and the payout, and to the Arkiv explorer (`rabdi.explorer.arkiv.network`) for the entity. Hedera requires a HashScan link anyway. Show the full tx ID once on screen and in the README.
3. **A real wallet or approval moment, not a motion graphic.** If World ID Agent Pass or IDKit is our human-approval layer, show the actual World App/simulator prompt and the server-side verify result, plus the **denied/expired path** that the World track requires.
4. **Prove agent autonomy live:** an independent agent process (separate terminal, separate wallet) that *queries Arkiv* for open tasks, pays our x402 endpoint on Hedera with no human click, and gets evidence-linked output. Show its log streaming in real time (no cut). This is exactly what the Hedera track scores.
5. **Show the independent read.** Run a second client (CLI or another agent) that reads our task/claim/verification/receipt records straight from Arkiv by `$owner`, to answer "what would users lose with Postgres?" Skarl has no equivalent; this is our originality beat.
6. **Label honestly on screen:** a small persistent "TESTNET · test USDC" badge, plus "SIMULATED" wherever something is. Never show a "Not demo ready" frame. Have one measured verifier number ("n=20 labelled clips: X false accepts, Y false rejects") or say "unmeasured".
7. **Sybil story:** a World ID nullifier gate at claim time ("one human, one claim per task"), shown with a second attempt refused. This directly fixes Skarl's biggest gap.
8. **Keep infra alive through judging and after:** a health endpoint, a seeded Arkiv re-seed script (Rabdi resets), a recorded fallback clip labelled "RECORDED LIVE TESTNET", and `llms.txt` / `skill.md` served from our own domain, not a dev backend URL.
9. **Video rules:**
   - 2:30–3:30 target; ≥720p (record at 1080p, export 1080p)
   - **human voiceover** recorded by a teammate (a calm ~140 wpm read; script it, and do several takes)
   - music bed low
   - no speed-ups (use cuts instead)
   - no phone-filmed screens: use screen capture and the device's own screen recording in a mockup
   - check the Hedera ≤5 min limit
   - burned-in captions help judges watching muted
10. **Live 4-min finalist demo:** run the agent → Arkiv → x402 → verification → payout path live with a pre-funded account, and keep the video cued as a fallback. Pre-associate all USDC accounts (`0.0.429274`) and pre-warm the verifier so nothing waits on screen.
