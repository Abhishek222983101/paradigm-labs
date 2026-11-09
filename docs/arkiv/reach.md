# Reach

## Who is it for?

**Robot teams that need real-world video of tasks their robots fail at.** Folding laundry, opening jars, loading a dishwasher. Today they hire vendors or film in-house, slowly, with no way to check who filmed what or whether the clip is a copy. Paradigm gives their AI agent a budget and rules. It posts the task, gets verified clips, pays per accepted clip, and asks a human only above its limit.

**People with a phone who want to earn small amounts for a minute of filming.** No crypto knowledge is needed. They verify once with World ID, film a 15–30 s clip with a spoken word and a finger count as a liveness check, and get paid in USDC to a Hedera account created for them from a key in their browser. They never see a seed phrase or a gas prompt.

**Other agents and marketplaces.** Tasks, verdicts, receipts and the verifier listing are open Arkiv records, so another team's agent can find our verifier (`adx.verifier`), read open tasks, or check whether a clip was already sold, without asking us.

## Would they use it?

- **Robot teams:** the demand is real. Large robot-learning datasets are collected by paid human demonstrators, and teams publicly ask for more diverse, real-home data. What we add is the agent-run loop: post a task, verify, pay, licence, at clip granularity.
- **Contributors:** in our own testing on 6–7 Nov, two different people verified with World ID and claimed slots on their phones. One filmed clips that were accepted and received **3 USDC twice and 6 USDC twice** in their own Hedera account (see the [README](../../README.md#settled-payments-hedera-testnet-all-mirror-verified)). Earnings show on `/me` right after the agent pays.
- **We haven't run a user study.** These are our own and teammates' runs, not strangers'.

## Can they try it today?

Yes: **https://adx-paradigm.vercel.app**
1. `/tasks`: pick "Fold a T-shirt" (6 USDC) or "Fold a towel" (3 USDC).
2. Verify with World ID (World App), film the clip, watch the verifier's result live.
3. `/console`: watch the buying agent pay, or approve the over-limit payment with World ID.
4. `/me`: see earnings, licences you own, checks left.

It runs on testnets (Arkiv Rabdi, Hedera testnet USDC, Swarm Sepolia). No real money moves.

## Will we keep building after Mumbai?

Yes, if robot teams want it. The next steps are already designed:
- **Licence withdrawal:** the contributor deletes their `adx.licence`, and agents check live licences before each training run.
- **Dataset manifests:** an `adx.manifest` per task family listing accepted clips, for agents that buy datasets instead of single clips.
- **Outside verifiers:** anyone can publish an `adx.verifier` listing, and buyer agents choose by price and track record from `adx.verification` history.
- **One-time payout accounts** to stop public payments linking a person's activity (see [`why-arkiv.md`](why-arkiv.md)).

The repo is MIT-licensed. The schema is documented in [`schema.md`](schema.md), so another marketplace can reuse it and share the duplicate check.
