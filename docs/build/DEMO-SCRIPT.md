# ADX — Demo script

Target 3:30 (ETHGlobal limit 2–4 min, Hedera ≤5 min). Screen recording at 1080p, human voiceover, no speed-up, no phone camera recording of the screen. Live finalist version: 4 min + 3 min Q&A, same order.

| Time | On screen | Voiceover (short) | Sponsor proof |
|---|---|---|---|
| 0:00–0:20 | Title + one line | "Robots fail on real-world tasks. Their agents need exactly the demonstrations they fail on, from real, distinct humans." | — |
| 0:20–0:45 | Buyer console: agent reads a failure case, posts "fold a towel, top-down", 3 slots | "Our buyer agent turns a failure into a paid task. The task is an Arkiv entity that expires at its deadline." | Arkiv explorer link to `adx.task` |
| 0:45–1:15 | Phone: task board → Claim → World ID → challenge "say mango, 3 fingers" | "One verified human per slot, proved with World ID. No identity on-chain." | IDKit success |
| 1:15–1:25 | Same phone claims again → "You already hold a slot" | "Same person, second try: rejected." | IDKit alternative path |
| 1:25–1:55 | Record → upload → live status: duplicate check, AI review with timestamps, stored on Swarm, recorded on Arkiv | "The clip is encrypted on our side and stored on Swarm through our own node. Only the ciphertext reference goes on Arkiv." | Swarm ref + batch ID, Arkiv verdict |
| 1:55–2:25 | Agent finds the endpoint, gets 402, pays automatically → HashScan | "Under its budget, the agent pays over x402 on Hedera. No human, no checkout." | HashScan tx |
| 2:25–2:50 | Bonus payout above threshold → approval on the human's phone → approved → paid. Then a second one cancelled → "nothing paid" | "Above the limit, the agent has to ask a human, freshly verified with World ID." | Agent Pass success + denied path |
| 2:50–3:10 | Contributor → My licences → Withdraw. Agent's licence check drops the clip | "The contributor owns the licence on Arkiv. Withdraw it, and every buyer agent sees it." | Arkiv `$owner` = contributor |
| 3:10–3:30 | Second laptop: `curl` against Arkiv shows the same tasks, verdicts, receipts, licences | "Every record is open. Any agent can query it without asking us." | Outside-agent query |

**Before recording:** seed fresh demo tasks, top up buyer USDC, check the Bee node and batch, open HashScan/Arkiv explorer tabs, phones on Wi-Fi, World Simulator ready.
**Backup:** a full pre-recorded run in case the venue network fails during the live demo.
