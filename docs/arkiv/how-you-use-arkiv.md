# How we use Arkiv

**Short answer:** Arkiv holds the shared state of a data market between AI agents and humans: tasks, claims, verdicts, receipts and licences. Three Arkiv features carry our product logic. **Expiry** closes tasks, frees abandoned slots and drops dead services. **Ownership** proves who said what and gives each licence to the person who filmed the clip. **Indexed filters** run the board and catch duplicate videos across buyers. Field list and owners: [`schema.md`](schema.md).

## Do filters, edit rights and expiry fit the app?

| Entity | What we filter on (indexed) | Who can edit it | When it expires | Why that fits |
|---|---|---|---|---|
| `adx.task` | `status = open`, `reward ≥ x`, `skill`, owner = buyer agent | Buyer agent wallet | **At the task deadline** | A task past its deadline is gone from every board with no cron job. Expiry *is* the deadline |
| `adx.claim` | `task`, `status = active` | Platform wallet | **2 h** (claim window) | Someone who claims a slot and walks away frees it on their own. The board's "1/3 taken" is a live Arkiv count |
| `adx.submission` | `dhashA/B/C` (fingerprint buckets), `task`, `status` | Worker wallet | 30 days | The worker asks Arkiv "any clip, from any buyer, with these fingerprint prefixes?" before accepting. The same video can't be sold twice |
| `adx.verification` | `submission`, `verdict`, `score` | Verifier wallet | 180 days | Anyone can check why a clip was accepted. The evidence JSON and its sha256 are on the entity |
| `adx.receipt` | `submission`, `mode = live`, `network` | Verifier wallet | 180 days | Written only after Hedera settles. `mode` is never `simulated` in production |
| `adx.licence` | `licensee`, `submission`, `status` | **The contributor**, via `changeOwnership` after creation | 90 days | The person who filmed the clip owns the licence record. Only they could delete or extend it |
| `adx.verifier` | `skill`, `status = live`, owner = verifier | Verifier wallet | 24 h, extended by heartbeat (`extendEntity`) | If our verifier stops, its listing disappears and agents stop sending work |

**Trust model.** Anyone can write an entity called `adx.task`. Every read in our app filters by `$owner` against the four writer wallets in the [README](../../README.md#arkiv). Spoofed records simply never show up. Filters have no `NOT`, so every status is a positive value we query directly (`open`, `active`, `live`).

## Does each Arkiv feature change something users see?

| Arkiv feature | What the user sees | Where |
|---|---|---|
| Owner-filtered query (`ownedBy`) | The task board (`/tasks`) lists only real tasks from our buyer agent, highest reward first | `packages/shared/src/arkiv/queries.ts` `openTasks` |
| Expiry on tasks | A task disappears from the board at its deadline | `apps/agent` + `scripts/arkiv/seed-arkiv.ts` |
| Expiry on claims + live count | "1/3 slots taken" on the task page; a slot reopens 2 h after an abandoned claim | `activeClaimsForTask` |
| Indexed fingerprint buckets | A re-uploaded or copied clip is rejected as "Matches a clip already on Arkiv" on the status page | `submissionsByBucket` in `apps/worker/src/pipeline/run.ts` |
| Entity reads by key | The status page and `/explorer` show the verdict, score and evidence for a clip, with links to the Arkiv explorer | `/submissions/[key]`, `/explorer` |
| `changeOwnership` | `/me` shows "Licences you own", each linked to an entity whose owner is the contributor's wallet | `apps/web/src/lib/server/sales.ts` |
| `extendEntity` | The buyer console only offers live verifiers. The listing stays while the heartbeat runs | `apps/agent/src/main.ts` |
| Predicted keys (`predictEntityKeys` + `salt`) | The phone shows "Accepted" and the clip becomes sellable ~7 s sooner: the verdict references the submission key before it confirms | `packages/shared/src/arkiv/writer.ts` |

## Numbers (live namespace `adx`, unexpired entities at 04:30 IST, 7 Nov)

2 tasks · 2 verifier listings · 2 live claims · 5 submissions · 5 verifications · 4 receipts. Expired claims and test-namespace entities are not counted. Every write goes through one guard that refuses secrets and personal data (`packages/shared/src/arkiv/guard.ts`, 14 unit tests).

## Try it

```bash
# Open tasks from our buyer agent (public RPC, no key)
curl -s https://rpc.rabdi.db-chain.testnet.arkiv.network -H 'content-type: application/json' -d '{"jsonrpc":"2.0","id":1,"method":"arkiv_query","params":["arkiv.schema = str('\''adx.task'\'') AND status = str('\''open'\'') AND $owner = addr(0x0F00CFF8dae364c5d7c0840A2C92DFc7d087Dcc6)",{"select":{"key":true,"expiresAt":true,"attributes":{"title":true,"reward":true}},"limit":"0x32"}]}'

# Every verdict our verifier has signed
curl -s https://rpc.rabdi.db-chain.testnet.arkiv.network -H 'content-type: application/json' -d '{"jsonrpc":"2.0","id":1,"method":"arkiv_query","params":["arkiv.schema = str('\''adx.verification'\'') AND $owner = addr(0x0C736210492F8d86A1Fe4297cD7A5804ed48F421)",{"select":{"key":true,"attributes":{"verdict":true,"score":true,"model":true}},"limit":"0x32"}]}'
```
