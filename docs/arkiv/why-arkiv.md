# Why Arkiv

## If we swapped Arkiv for Postgres, what would users lose?

**1. Agents from other teams couldn't find work or verify it without trusting us.**
The point of Paradigm is that *any* robot team's agent can post tasks, and any agent can check what it's buying. On Arkiv a task, a verdict or a receipt is a public record with a signing wallet. An outside agent queries it directly (see the `curl` in the [README](../../README.md#arkiv)), with no account, no API key and no permission from us. In Postgres that data would sit behind our API. If we went down or changed the rules, every agent depending on it would lose it.

**2. Contributors wouldn't own their licence.**
Each `adx.licence` is transferred to the wallet of the person who filmed the clip (`changeOwnership`). In Postgres the "licence" would be a row we could edit or delete. On Arkiv only the contributor can extend or delete it.

**3. Nobody could check a verdict or a payment independently.**
`adx.verification` carries the model, the rubric hash and the evidence JSON with its sha256. `adx.receipt` carries the Hedera transaction ID. A buyer, a contributor or a judge can recompute the hashes and open the payment on HashScan. In Postgres they would have to take our word for it.

**4. Duplicate detection would stop at our own walls.**
The worker checks fingerprint buckets against *every* submission on Arkiv, not just ours. If a second marketplace used the same schema and the same check, a clip sold on one couldn't be resold on the other. A private database can't give that guarantee across companies.

**5. Expired state would need cleanup code, and could rot.**
Tasks vanish at their deadline, abandoned claims after 2 h, dead verifier listings after 24 h. The data store enforces it, not a cron job that can fail silently.

## What can people do with our data on Arkiv that they can't do today?

Today, robot-training data is bought through closed vendors. You can't see who filmed a clip, how it was checked or what the person was paid. With Paradigm on Arkiv:
- anyone can list open, paid data tasks and their rubrics (`adx.task`, rubric bytes on-chain + sha256);
- anyone can see each verdict's evidence and the model that made it (`adx.verification`);
- anyone can see that a real payment happened, linked to Hedera (`adx.receipt`, `mode: live`);
- the person who filmed a clip holds the licence record for it (`adx.licence`, owned by them).

## What we kept off Arkiv, and why

| Kept off Arkiv | Where it lives | Why |
|---|---|---|
| World ID nullifiers | Neon Postgres, `UNIQUE(task, nullifier)` | A nullifier on a public chain would let anyone link one person's activity across tasks. Arkiv only sees a fresh random pseudonym per claim |
| Clip decryption keys | Neon, released only after Hedera settles | The key is what the buyer pays for |
| The video | Swarm, AES-256-GCM ciphertext only | Large, private. Arkiv holds the Swarm reference and the ciphertext's sha256, never a key-bearing reference |
| Wallet ↔ person, Hedera payout account ↔ person | Neon | Personal data |
| Reputation (checks left, reject streak) | Neon, keyed by nullifier | It would deanonymise people if public |

One guard (`packages/shared/src/arkiv/guard.ts`) sits in front of every write. It refuses anything that looks like a private key, a nullifier, an email, a phone number or a 128-hex Swarm reference with a key inside.

**Known limit we accept:** the Hedera payment itself is public. Anyone can see that account `0.0.x` received 3 USDC, and the receipt links that payment to a task. A per-claim one-time payout account would close it; that's future work.
