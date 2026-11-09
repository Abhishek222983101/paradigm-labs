# 02 — Tech stack due diligence (Agentic Data Exchange, ETHGlobal Mumbai 5–7 Nov 2026)

- **Accessed:** 3 Nov 2026. All facts come from official docs, SDK repos and changelogs, npm/PyPI, ETHGlobal prize pages, and live read-only probes (RPC calls, facilitator `/supported`, Hedera mirror node).
- **Rule:** anything not confirmed from a primary source is marked **UNVERIFIED**. Nothing here was filled in from memory.
- **Scope:** research only. No app code. The snippets are copied from the docs.

## Architecture flags (read first)

| # | Flag | Impact on plan |
|---|---|---|
| 1 | **Arkiv moved to a new testnet and a breaking SDK in the last 5 days.** The Rabdi testnet (chain `7794095`) was created 29 Oct and reset twice on 30 Oct. `@arkiv-network/sdk` 1.0.0 shipped 30 Oct and 1.0.1 on 2 Nov. Payload and content type are gone (typed columns instead). `NOT`/`!=`, cursors and historical reads are gone. Max lifetime is about 182.5 days. You need a free access key, because the public RPC is heavily rate limited. | Architecture still holds. Every entity must be designed as a typed schema with positive-valued status fields. Don't trust any pre-30-Oct tutorial or AI memory. Python SDK is stale, so do Arkiv in TS. Get an access key, tGLM and a smoke-test write on day 0. A testnet reset mid-event is possible: keep a re-seed script. |
| 2 | **Arkiv prize requires specific repo files.** These are `/arkiv/schema.md`, `friction.md`, `reach.md`, `why-arkiv.md` and `how-you-use-arkiv.md`. The README must list the writer wallet(s) and one runnable query. A user-facing feature must read from Arkiv. | Deliverables checklist. Our planned task-board read from Arkiv satisfies the "read" rule. |
| 3 | **Hedera x402 is fine for USDC.** v2 `@x402/hedera` 2.29.0 defaults to testnet USDC `0.0.429274` (confirmed by Circle). Three public testnet facilitators are live and need no key: x402.org, Launa, Blocky402. The facilitator pays gas. | No change. Use **v2 `@x402/*` only**, since v1 `x402-*` packages have no Hedera support. Payer, `payTo` and **every contributor payout account must be associated with USDC** before transfers. Circle faucet caps at 20 USDC per 2 h per address. The contributor payout is a normal HTS transfer, not x402. |
| 4 | **Hedera Agent Kit has no budget policy and no x402 plugin.** | Write a custom `AbstractPolicy` for spend limits. Pair Agent Kit with `@x402/fetch` the way the official PoC does. |
| 5 | **World ID 4.0 / IDKit 4.6.0 is a breaking redesign.** You need `rp_id` plus a server-only signing key. The backend must sign RP requests. Verify by POSTing to `/api/v4/verify/{rp_id}`. Code using `IDKitWidget`, `verifyCloudProof` or `/api/v2/verify` is legacy. | Add a backend `/rp-signature` route. Create the Portal app **today**: on-chain RP registration starts `pending`, and the signing key is shown only once. |
| 6 | **World ID Portal v4 accepts nullifier reuse.** | One-person-one-claim must be enforced by our own `UNIQUE(action, nullifier)` store. |
| 7 | **World ID testing without an Orb uses the Simulator** with `environment: "staging"` and a staging action. A mismatch fails silently. | No blocker. Whether app review is needed for production verification is UNVERIFIED; no doc requires it for staging. |
| 8 | **Chainlink CRE supports neither Hedera nor Arkiv.** Deploy needs approval. | CRE would add a third chain (Sepolia/Base Sepolia) and conflicts with the brief's "no extra chains". Simulation alone qualifies for the $1.5k CRE prize. Keep it as a stretch goal only. |

Runtime notes: the Arkiv SDK docs ask for Node 22.10+ or Bun. CRE TS workflows need Bun 1.2.21+ and run in QuickJS/WASM, so no Node SDKs run inside a workflow. x402 and Agent Kit use `@hiero-ledger/sdk` 2.90.x; keep a single copy installed.


## A. Arkiv

> Big picture: Arkiv moved to a new testnet (**Rabdi**, live since 30 Oct 2026) and shipped a **breaking SDK 1.0** (30 Oct, then 1.0.1 on 2 Nov 2026). Any tutorial, blog post, starter repo or AI-generated code that uses `payload`, `contentType`, `annotations`, `stringAnnotations`/`numericAnnotations`, `btl`/`expiresIn`, `kaolin`/`mendoza`/`braga`/`tiramisu`, `ne`/`not`, cursors or `atBlock` is out of date and will not work against Rabdi.

### Key facts

**What it is**
- "Arkiv is a Web3 database. It stores your data as entities that you can query by indexed attributes, that your wallet owns, and that expire when you say so." It speaks Ethereum JSON-RPC. Writes are signed Ethereum transactions, reads are `arkiv_query` calls. Gas is paid in GLM (`tGLM` on testnet). [intro]
- Relation to Golem: the official blog post "From Golem DB to Arkiv" (7 Oct 2025) says "Golem DB is evolving into Arkiv". Arkiv is "Powered by $GLM" (the Golem Network token). Golem Base / GolemDB is the earlier name; the old docs are still up at docs.golemdb.io. The network registry describes Rabdi as "Public testnet on the GolemDB node". [blog, arkiv.network, db-chain-networks]
- Node: a custom reth execution client that hosts the Arkiv entity engine, plus a Lighthouse beacon node. Stock reth cannot follow the chain. [db-chain-networks/rabdi README] The harness README notes about the executor: "smart contracts not supported", so do not plan to deploy Solidity contracts on Arkiv. (This comes from the repo README, not the user docs.)

**Network: Rabdi (current public testnet)** [networks/rabdi, ETHGlobal Arkiv prize page]

| Property | Value |
|---|---|
| Chain ID | `7794095` (`0x76edaf`). Live check on 3 Nov 2026: `eth_chainId` returned `0x76edaf` |
| HTTP RPC | `https://rpc.rabdi.db-chain.testnet.arkiv.network` (add `/<ACCESS_KEY>` to the path) |
| WebSocket RPC | `wss://rpc.rabdi.db-chain.testnet.arkiv.network` |
| Gas token | tGLM |
| Block time | 2 s |
| Faucet | https://hub.arkiv.network/faucet |
| Access keys | https://hub.arkiv.network/access-keys |
| Explorer | https://rabdi.explorer.arkiv.network |
| Indexer (prize page) | https://indexer.rabdi.db-chain.testnet.arkiv.network (on 3 Nov this served the same "Arkiv BlockExplorer" UI) |
| Arkiv precompile address | `0x4400000000000000000000000000000000000044` (the same on every Arkiv chain). All writes go here as `execute(...)` calldata with `value = 0` |

- Retired or replaced networks: Tiramisu (chain 7738577, replaced by Rabdi), Braga (retired 12 Aug 2026), Kaolin (retired 15 May 2026). "Entities don't carry over between networks." [networks/older-networks]
- Liveness check on 3 Nov 2026 (my own read-only calls): block `0x292ee` (about 168.7k), `arkiv_getBlockTiming` reported `duration: 2`, base fee `0x3b9aca00` (1 gwei in tGLM), block gas limit 30M. About 1,492 live entities on the chain. Explorer, faucet and access-keys pages all returned HTTP 200.
- **Testnet age and stability:** the registry shows Rabdi was created on 29 Oct 2026, then deleted and recreated twice on 30 Oct (current genesis is 30 Oct about 18:40 UTC). The README talks about "a wipe that restarted it from a new genesis time". The testnet is about 4 days old and has already been reset. A reset during the hackathon is possible (this is an inference from the history, not an announcement).

**Data model (SDK 1.0, Rabdi)** [intro, schemas/define, schemas/column-types, CHANGELOG 1.0.0]
- An entity is a set of up to 32 named, typed **attributes** (31 if you use a named schema, because the tag uses one slot). Each attribute is either **indexed** (you can filter on it, but every write costs more) or **stored only**.
- **There is no longer a payload or content type.** The 1.0 changelog says: "An entity is no longer a payload plus indexed attributes." Store blobs in `bytes` columns (never indexed, 128 KiB per create or patch in total) and text in `str` (at most 128 bytes of UTF-8).
- 9 types: `bool`, `i32`, `u64`, `u256`, `dec` (18 decimal places, pass it as a string), `str` (≤128 B), `addr`, `key` (a reference to another entity, not checked for existence), `bytes` (≤128 KiB). The old "string vs numeric annotations" split and the `bytes32` type are gone.
- System fields (prefixed with `$`): `$key` (32 bytes), `$owner`, `$creator` (never changes), `$createdAt`, `$updatedAt`, `$expiresAt` (all block numbers), `$creationFlags`. You can filter and sort on `$key`, `$owner`, `$creator` and `$expiresAt`. You cannot sort on `$createdAt` or `$updatedAt`.
- **Schemas** are SDK-side only: `defineSchema("my-app.tasks", { col: str().indexed(), ... })`. A named schema adds an indexed `arkiv.schema = str('<name>')` tag, and queries through it filter on that tag automatically. Modifiers: `.indexed()`, `.optional()`, `.default(v)`.
- **Ownership:** the creator owns the entity. Only the owner can patch, extend (unless the `permissionlessExtension` flag is set), transfer or delete it.
- **Creation flags** (fixed for life): `readonly` (attributes can never change) and `permissionlessExtension` (anyone can extend).
- **Entity key** = `keccak256(chainId, arkivAddress, owner, entityNonce, salt)`. By default the salt is 128 random bits. `predictEntityKeys` lets one batch create entities that reference each other.

**Writes** [writing/create, writing/change, writing/expiration, writing/batches]
- `walletClient.createEntity(schema, values, { expiration, flags?, salt? })` returns `{ entityKey, txHash, expiresAt }`. `expiration` is **required**.
- `patchEntity(schema, key, { set, unset })`. There is no `updateEntity`.
- `extendEntity({ entityKey, expiration })`, `changeOwnership({ entityKey, newOwner })`, `deleteEntity({ entityKey })`.
- `executeBatch({ creates, patches, extensions, ownershipChanges, deletes })` is atomic: every operation applies or none does.
- Every write takes optional tx fields (`gas`, `nonce`, fee fields). SDK 1.0.1 adds a 25% gas buffer, capped at 2^24 gas per transaction.

**Expiry (the old "BTL")** [writing/expiration, reference/limits]
- Time is counted in **blocks**, and a block is **2 s**. Use helpers instead of a raw number: `ExpirationTime.fromSeconds(n)` (must be a multiple of 2), `fromMinutes`, `fromHours`, `fromDays`, `fromWeeks`, `fromMonths` (30 days each), `fromBlocks`, `atBlock`, `atDate(date, { atLeast })`, `max()`.
- **Maximum lifetime: 7,884,000 blocks (about 182.5 days)**, counted from the block the create or extend lands in. `ExpirationTime.permanent()` was removed in 1.0, and anything longer throws `InvalidExpiryError`.
- `extendEntity` counts from *now*, not from the current expiry. A new expiry earlier than the current one is rejected.
- Arkiv emits **no event when an entity expires**. Expired entities simply stop showing up in queries.

**Query language and operators** [reference/query-language, querying/filter, querying/paginate, querying/sort, CHANGELOG]
- SDK builder: `publicClient.select({...}).from(Schema).where(...).ownedBy(addr).createdBy(addr).orderBy(asc|desc(...)).limit(n).offset(n).withCount().fetch()`. Other calls: `client.count()...fetch()` returns a bigint, `getEntity(key, schema?)`, and `query(conditionOrRawString, opts)`.
- Conditions from `@arkiv-network/sdk/query`: `eq`, `gt`, `gte`, `lt`, `lte`, `between`, `startsWith` (only on `str`), `exists`, `hasType`, `and`, `or`.
- Raw syntax: `=`, `<`, `<=`, `>`, `>=`, `BETWEEN a AND b`, `STARTSWITH`, `EXISTS(x)`, `TYPEOF(x) = type`, `AND`, `OR`, parentheses, and `ORDER BY name:type ASC|DESC` (one key only). Values carry their type, for example `str('news')`, `u64(…)`, `dec(4.5)`, `addr(0x…)`. A bare number means `i32`.
- **No `NOT` and no `!=` on Rabdi.** These were removed in SDK 1.0 and Rabdi does not support them. Model state as positive values (e.g. `status = 'open'`) and use `or()` across the values you want to keep.
- A comparison also checks the type: `score = i32(4)` does not match a `dec` score. Filters only see indexed attributes. A sort can read stored-only attributes.
- **Owner filters:** `.ownedBy(address)` and `.createdBy(address)`, or `$owner = addr(0x…)` in raw syntax.
- **Pagination:** `limit` from 1 to 100 (default and maximum 100) plus `offset`. Cursors, `next()`, `for await` and historical `atBlock` reads were removed: "Rabdi doesn't keep past blocks, so every read is of the latest block". For a stable full scan, page by key with `orderBy(asc("$key"))` and `where(gt("$key", key(last)))`.
- A query that has no schema tag must have at least one condition.

**Subscriptions and events** [querying/watch-events, json-rpc/mutating-entities]
- `publicClient.watchEntityEvents({ onEntityCreated, onEntityPatched, onExpiryExtended, onOwnershipTransferred, onEntityDeleted, onEvent, onError, pollingInterval })` polls every half block by default.
- Events carry no attributes, so to see what changed you re-read the entity. `fromBlock` was removed, so a watcher only sees events from the moment it starts.
- On-chain events come from `0x44…44`: `EntityCreated`, `EntityPatched`, `ExpiryExtended`, `OwnershipTransferred` and `EntityDeleted`. Arkiv has no `arkiv_subscribe*` method, so use `eth_getLogs` or `eth_subscribe`.

**JSON-RPC read methods** [json-rpc/querying-data]
- `arkiv_query(queryString, { select, limit, offset })`. `select` is a set of booleans: `key`, `owner`, `creator`, `createdAt`, `updatedAt`, `expiresAt`, `creationFlags`, `attributes` (or `{attributes:{name:true}}`), `attributeSchema`, `count`.
- `arkiv_getEntity(key)` returns the entity, or `null` if it is expired or deleted.
- `arkiv_getBlockTiming()`.
- Query error codes: -32001 parse, -32002 type, -32003 literal, -32004 limits, -32602 bad limit.

**How a second, independent client reads our data**
- Anyone can create a public client (no wallet, and the chain needs only an access key or `""`) and run the same query. Without the SDK, they can `curl` `arkiv_query` with the raw string, e.g. `arkiv.schema = str('<our-name>') AND $owner = addr(0x<our backend wallet>)`.
- The docs stress that "Arkiv is public": anyone can write entities that use our schema tag. **Trust comes only from filtering by owner or creator.** The schema tag only keeps out other projects' data by accident.

**"Mirror" concept**
- No "mirror" feature appears in the docs. "Mirror" is an **ETHGlobal Mumbai Arkiv prize track**, "Mirror something Ethereum depends on" ($4k): publish a licensed copy of a public Ethereum dataset to Arkiv, with a re-runnable import script and no Sourcify data. Their example is sourcify.arkiv.network. This track does not fit our project. Ours fits "**Build on Arkiv (from scratch)**" ($4k: 1st $3k, 2nd $1k). [ETHGlobal prize page]

**ETHGlobal Mumbai Arkiv qualification (from-scratch track)** [ETHGlobal prize page]. This affects deliverables:
- The app must write to Arkiv's current testnet with `@arkiv-network/sdk` or JSON-RPC, and at least one feature users see must read from Arkiv. "Not counted: the SDK installed but never used to read, or Arkiv used only as a log that nothing reads."
- The README must give the writer wallet address(es) and one query judges can run.
- Required repo files: `/arkiv/schema.md` (entities, queried fields, owners, expiry), `/arkiv/friction.md`, `/arkiv/reach.md`, `/arkiv/why-arkiv.md`, `/arkiv/how-you-use-arkiv.md`. Each judging criterion is 25%: feedback, reach, why Arkiv, how you use Arkiv.
- The repo must be public and open source, and the README must say how AI was used. A team can win one Arkiv track. The Arkiv + Swarm bonus ($500, needs `/arkiv/swarm.md`) can be added on top.
- The prize page links "AI tools (MCP + plugin)" at hub.arkiv.network/ai-tools. That page offers a Claude Code plugin `arkiv@arkiv` and official agent skills (`npx skills add https://github.com/Arkiv-Network/skills --skill arkiv-best-practices`).

### Packages & versions

| Package | Version | Published | Notes |
|---|---|---|---|
| `@arkiv-network/sdk` (TS) | **1.0.1** (`latest`) | 2026-11-02 | 1.0.0 was released 2026-10-30. Peer deps: `viem ^2`, `typescript >=5`. `engines.node >=18`, but the docs and README say **Node 22.10+ or Bun**. Subpath exports: `/schema`, `/query`, `/chains`, `/entity`, `/types`, `/utils`. `/chains` exports only `rabdi({accessKey})` and `localhost` (1337). Other dist-tags: `next` 0.9.0-next.5, `dev` 1.0.0-dev.2, `advanced` 0.8.0-advanced.3 |
| `arkiv-sdk` (Python, PyPI) | 1.0.0b3.dev0 | 2026-05-07 | **Not updated for Rabdi or SDK 1.0.** The README still points at Mendoza/Kaolin (retired), and the docs do not list a Python SDK. For Python, call raw JSON-RPC (`arkiv_query`) and build `execute` calldata yourself (UNVERIFIED whether the old Python SDK works against Rabdi; assume it does not) |
| `viem` | ^2 (peer) | n/a | Required |
| Claude Code plugin `arkiv@arkiv` | 0.2.0 (hub page) | n/a | `claude plugin marketplace add Arkiv-Network/claude-plugin` |

Many community packages on npm (`arkiv-sync`, `arkiv-graph`, `arkiv-encryption`, `create-arkiv-app` and others) are **not official** and may target old APIs. Avoid them.

### Gotchas / limits

- **Rate limits and access keys:** the public RPC is "heavily rate limited". You get one free key per wallet per network from the Hub (sign in with a wallet, captcha). Each key has a monthly quota counted in "cost units". `rabdi({ accessKey })` puts the key in the RPC URL path. You can also send it as `X-API-KEY` or `Authorization: Bearer`. An unknown key gets HTTP 401. Without a key you get a per-IP budget and then HTTP 429 with `RateLimit` and `Retry-After` headers. Observed headers on 3 Nov without a key: `ratelimit: limit=2000, remaining=1999, reset=10` and `arkiv-cost: 10` for one count query. The exact quota numbers are not documented (UNVERIFIED).
- **A browser key is public.** Add your site to the key's Origins (this is attribution only) and add server IPs to the IP allowlist (real access control). **Never add a chain object that contains the key to a user's wallet**: use `rabdi({ accessKey: "" })` for `addChain` and wagmi wallet chains.
- **Fees:** writes cost tGLM gas. The base fee seen on 3 Nov was 1 gwei, and the node has a "minimum-base-fee rule" (repo README). The docs say only qualitatively that "a shorter lifetime costs less" and "an index costs extra on every write". **No fee schedule or per-entity cost is published** (UNVERIFIED). Budget with the faucet and measure real costs on day 1.
- **Size limits:** 32 attributes per entity (31 with a named schema). Attribute names are at most 32 bytes. `str` is at most 128 bytes: store URIs and hashes as `str` (a lowercase hex hash fits up to 64 bytes) and keep larger content in `bytes` or off-chain. All `bytes` in one create or patch share a 128 KiB budget. Pages hold at most 100 rows. The node also limits query length and nesting depth.
- **Reserved attribute names** include `and`, `or`, `not`, `between`, `order`, `by`, `asc`, `desc`, `startswith`, `exists`, `typeof` and type names (`str`, `u64`, …), plus `arkiv.schema`. Names cannot contain `--`. Check our planned fields, e.g. do not name a column `order`.
- **No NOT and no `!=`**, so a field like `status` must be modelled as an indexed `str` with positive values. Queries such as "open tasks not claimed by me" have to be expressed as an `or()` of allowed values.
- **Retention:** the longest lifetime is about 182.5 days, and you must extend before expiry. Expiry emits no event. Testnet state does not move between networks, and Rabdi has already been wiped twice. Historical reads are not supported.
- **Everything is public.** Never put PII, tokens or decryption keys in entities (the brief already says this). The Swarm bonus page warns the same about encrypted Swarm references.
- **The docs are partly stale after the 1.0 rewrite.** Trust `CHANGELOG.md` and the SDK source over these pages:
  - `schemas/column-types` still says indexed columns take `ne`, but SDK 1.0.1 does not export `ne` or `not`.
  - `llms.txt` still lists `ne`, `not`, `next`, `for await`, `cursor` and `atBlock`.
  - `json-rpc/mutating-entities` still documents the `$payload`/`$contentType` system attributes and signs examples for the Tiramisu chain ID 7738577. The 1.0 changelog says the new protocol has "no `$payload`/`$contentType`" and puts the indexed flag in bit 7 of `typeId`.
- The network registry still describes Tiramisu as "the network external developers join", but the docs and the ETHGlobal prize page both say Rabdi. **Use Rabdi.**
- `watchEntityEvents` polls, and its `onError` matters in production: "a watcher that stops receiving events looks the same as a quiet chain".
- The query builder skips entities that do not fit the schema (`onMismatch: "skip"` by default, reported in `skipped`). Use `"throw"` when you page by key.

### Minimal snippet (from docs)

Verbatim from https://docs.arkiv.network/start-here/first-entity/ (source file `Arkiv-Network/arkiv-starlight-docs/src/content/docs/start-here/first-entity.mdx`):

```ts
import { addr, bytes, dec, defineSchema, str } from "@arkiv-network/sdk/schema"

const Posts = defineSchema("my-app.posts", {
  author: addr().indexed(),
  category: str().indexed(),
  score: dec().indexed(),
  title: str(),
  body: bytes(),
  summary: str().optional(),
})
```

```ts
import { createPublicClient, createWalletClient } from "@arkiv-network/sdk"
import { rabdi } from "@arkiv-network/sdk/chains"
import { http, type Hex } from "viem"
import { privateKeyToAccount } from "viem/accounts"

const chain = rabdi({ accessKey: process.env.ARKIV_ACCESS_KEY ?? "" })
const account = privateKeyToAccount(process.env.PRIVATE_KEY as Hex)
const publicClient = createPublicClient({ chain, transport: http() })
const walletClient = createWalletClient({ chain, transport: http(), account })
```

```ts
import { ExpirationTime } from "@arkiv-network/sdk"
import { stringToBytes } from "viem"

const { entityKey } = await walletClient.createEntity(
  Posts,
  {
    author: addr(account.address),
    category: "intro",
    score: dec("4.5"),
    title: "Hello, Arkiv",
    body: stringToBytes("My first entity."),
  },
  { expiration: ExpirationTime.fromDays(1) },
)
console.log("Created", entityKey)
```

```ts
import { hexToString } from "viem"

const { entities } = await publicClient
  .select({ $key: true, title: true, body: true })
  .from(Posts)
  .ownedBy(account.address)
  .fetch()

for (const post of entities) {
  console.log(post.$key, post.title.value, hexToString(post.body.value))
}
```

Filter, verbatim from https://docs.arkiv.network/querying/filter/:

```ts
import { and, eq, gt } from "@arkiv-network/sdk/query"
import { dec } from "@arkiv-network/sdk/schema"

const { entities } = await publicClient
  .select({ $key: true, title: true })
  .from(Posts)
  .where(and(eq("category", "news"), gt("score", dec("4"))))
  .fetch()
```

Raw JSON-RPC read for an independent client (from https://docs.arkiv.network/json-rpc/querying-data/):

```bash
curl "https://rpc.rabdi.db-chain.testnet.arkiv.network/$ARKIV_ACCESS_KEY" \
  -H "content-type: application/json" \
  --data @- <<'EOF'
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "arkiv_query",
  "params": [
    "arkiv.schema = str('my-app.posts') AND category = str('news')",
    { "select": { "key": true, "attributes": true }, "limit": "0xa" }
  ]
}
EOF
```

### Sources (accessed 3 Nov 2026)

- https://docs.arkiv.network/start-here/introduction/
- https://docs.arkiv.network/llms.txt
- https://docs.arkiv.network/networks/rabdi/ · https://docs.arkiv.network/networks/older-networks/
- https://docs.arkiv.network/start-here/first-entity/ · /start-here/clients/ · /start-here/access-keys/ · /start-here/agent-skill/
- https://docs.arkiv.network/schemas/define/ · /schemas/column-types/
- https://docs.arkiv.network/writing/create/ · /writing/expiration/ · /writing/change/ · /writing/batches/
- https://docs.arkiv.network/querying/filter/ · /querying/paginate/ · /querying/sort/ · /querying/watch-events/ · /querying/without-schema/
- https://docs.arkiv.network/reference/query-language/ · /reference/limits/ · /reference/errors/
- https://docs.arkiv.network/json-rpc/querying-data/ · /json-rpc/mutating-entities/
- https://docs.arkiv.network/guides/react/
- https://github.com/Arkiv-Network/arkiv-sdk-js (CHANGELOG.md, releases v1.0.0 and v1.0.1) and the npm tarball `@arkiv-network/sdk@1.0.1` (`src/chains/rabdi.ts`, `src/query/index.ts`, `src/consts.ts`)
- https://github.com/Arkiv-Network/db-chain-networks (README, networks/testnet/rabdi/README.md, commit history)
- https://github.com/Arkiv-Network/arkiv (README) · https://github.com/Arkiv-Network/arkiv-sdk-python (README, CHANGELOG) · https://pypi.org/project/arkiv-sdk/
- https://arkiv.network/blog/from-golem-db-to-arkiv
- https://ethglobal.com/events/mumbai/prizes/arkiv
- https://hub.arkiv.network/ai-tools
- Live JSON-RPC probes against the Rabdi public RPC on 3 Nov 2026: `eth_chainId`, `eth_blockNumber`, `arkiv_getBlockTiming`, `eth_gasPrice`, `eth_getBlockByNumber`, and an `arkiv_query` count

---

## B. Hedera x402

Accessed 3 Nov 2026. Sources: docs.hedera.com, the x402-foundation/x402 monorepo (raw files on `main`), npm registry, live facilitator `/supported` endpoints, Hedera testnet mirror node, HashScan (rendered in a browser), and the ETHGlobal Mumbai Hedera prize page.

### Key facts

- **What x402 is.** An open standard that reuses HTTP `402 Payment Required`. The server quotes a price, the client pays, and the client retries the same request. It is stateless, works per request, and is not custodial. It is not meant for streaming or multi-hop payments. The **canonical repo is now `github.com/x402-foundation/x402`**. `coinbase/x402` is now a fork of it (GitHub API reports `fork: true, parent: x402-foundation/x402`). The packages' npm author is "x402 Foundation".
- **Protocol version.** Hedera support exists only in **x402 v2** (`x402Version: 2`). The legacy v1 npm packages (`x402`, `x402-fetch`, `x402-express`, … at 1.2.x) contain no Hedera code: I grepped the `x402@1.2.0` tarball and found zero matches.
- **Scheme.** `exact`. It pays a precise amount of **native HBAR (asset id `"0.0.0"`, amount in tinybars, 1 HBAR = 10^8)** or **any HTS fungible token (by entity id, smallest unit)**. **USDC is supported.** `@x402/hedera` defaults to USDC (`HEDERA_TESTNET_USDC = "0.0.429274"`, mainnet `0.0.456858`, 6 decimals). A server price given as `"$0.001"` therefore resolves to testnet USDC automatically.
- **Network ids (CAIP-2).** `hedera:testnet` and `hedera:mainnet`. The old `hedera-testnet` string belongs to the v1 fork (`hedera-dev/x402-hedera`, last pushed Dec 2025) and should not be used with v2 packages.
- **Mechanics.** The client builds a `TransferTransaction` (client to `payTo`) and sets `transactionId.accountId = extra.feePayer` (the facilitator). It partially signs, Base64-encodes, and sends the result. The resource server calls the facilitator's `POST /verify`, then `POST /settle`. The facilitator co-signs as fee payer and submits to Hedera. The scheme has no ScheduleCreate wrapping. A second method, `transferExecutor`, exists for contract-held funds. The default is `cryptoTransfer`.
- **Who pays fees.** The facilitator pays them as `feePayer`. **The paying agent needs no HBAR for gas**, but it must hold the token being paid. On HashScan the **"Payer Account" is the facilitator**. The agent shows up only as the negative entry under Token Transfers.
- **HTTP headers (v2 transport spec).** `PAYMENT-REQUIRED` (server to client, base64 PaymentRequired), `PAYMENT-SIGNATURE` (client to server, base64 PaymentPayload), and `PAYMENT-RESPONSE` (server to client, base64 SettlementResponse). The Hedera "Pay" page still says `X-Payment` "(or equivalent)", which is v1 naming.
- **Public facilitators that support `hedera:testnet`.** I checked each one live with `GET /supported` on 3 Nov 2026:

  | Facilitator | Base URL | `hedera:testnet` feePayer (live) | Key needed |
  |---|---|---|---|
  | Official x402 | `https://x402.org/facilitator` | `0.0.9185802` | none |
  | Launa (formerly Ax402) | `https://testnet.facilitator.launa.dev` | `0.0.9839454` | none (testnet) |
  | Blocky402 | `https://api.testnet.blocky402.com` | `0.0.7162784` | none |

  Mainnet options: Blocky402 at `https://api.blocky402.com` (feePayer `0.0.10571514`), and Launa through a dedicated subdomain that requires signup. x402.org says it is intended for quickstart and testnet use.
- **Live evidence that USDC settlement works today.** The mirror node shows the x402.org fee payer `0.0.9185802` submitting successful `CRYPTOTRANSFER` transactions that move token `0.0.429274`, the latest at 2026-11-03 16:30 UTC. Sample: `0.0.9185802@1793723395.737998589`. HashScan shows it as SUCCESS: payer 0.0.9185802, charged fee 0.01567538 HBAR (about $0.0011), USDC transfer of 0.08, valid duration 2 min. The fee payer held about 10,023 testnet HBAR.
- **Settlement response.** The facilitator returns `{ success, transaction: "<hedera tx id e.g. 0.0.x@secs.nanos>", network, payer }`. HashScan URL form, per the docs and confirmed in a browser: `https://hashscan.io/testnet/transaction/<transactionId>`. The `@` form renders correctly. Mirror node JSON uses the dash form: `https://testnet.mirrornode.hedera.com/api/v1/transactions/0.0.x-secs-nanos`.
- **USDC token id on Hedera testnet is `0.0.429274`. CONFIRMED** from three places: Circle's own USDC contract-address page ("Hedera Testnet | 0.0.429274"; mainnet `0.0.456858`), the `@x402/hedera` constants.ts, and the mirror node (name "USD Coin", symbol USDC, decimals 6, FUNGIBLE_COMMON, **has a freeze_key**, no KYC key, no custom fees).
- **Test funds.**
  - USDC comes from `https://faucet.circle.com`. It lists "Hedera Testnet" and gives **20 USDC per 2 hours, per address, per chain**. The account must already be associated with `0.0.429274`.
  - HBAR comes from the Hedera Portal (`https://portal.hedera.com`, gives a stable account id and keys) or from the faucet, which auto-creates a **hollow** account from an EVM address and pays 100 testnet HBAR.
- **Token association is mandatory.** **Both payer and payee** must be associated with the HTS token (or have a free auto-association slot). Otherwise the transfer fails with `TOKEN_NOT_ASSOCIATED_TO_ACCOUNT`. HBAR needs no association.
- **Hedera Agent Kit.**
  - JS package is `@hashgraph/hedera-agent-kit` v4. The old `hedera-agent-kit` package is deprecated. The Python package is `hedera-agent-kit`.
  - **It has no built-in x402 plugin.** I found no x402 file in the `hashgraph/hedera-agent-kit-js` tree. The official pattern, from `hedera-dev/x402-inference-pay-per-request-poc`, is to use Agent Kit for Hedera tools and `@x402/fetch` + `@x402/hedera` for payment.
  - Relevant to our "policy-controlled agent": Agent Kit has **Hooks & Policies**. Built-ins are `MaxRecipientsPolicy`, `RejectToolPolicy`, `HcsAuditTrailHook` and `HolAuditTrailHook`. There is **no built-in budget or max-amount policy**, so we would write a custom `AbstractPolicy`.
  - Tools exist for `TRANSFER_FUNGIBLE_TOKEN_TOOL`, `ASSOCIATE_TOKEN_TOOL`, `AIRDROP_FUNGIBLE_TOKEN_TOOL`, `GET_TRANSACTION_RECORD_QUERY_TOOL` and HCS submit.
- **ETHGlobal Mumbai Hedera track "AI Agents That Pay: x402 on Hedera" ($6,500: $3k / $2k / $1.5k).** Qualification requirements:
  - At least one x402-protected endpoint that settles on Hedera testnet or mainnet, through a docs-listed facilitator (Official x402, Ax402/Launa, Blocky402) or our own.
  - An agent that finds the endpoint and completes at least one paid request **end to end with no human approving**.
  - A public repo whose README includes **the Hedera tx ID of at least one settled payment**.
  - A video of 5 minutes or less showing settlement **with a HashScan link**.

  Extra points for: spending controls (budgets, allowlists, human-in-the-loop above a threshold), an HCS audit log of spending, HCS-14/ERC-8004 identity, A2A/ACP negotiation, **settling in USDC**, scheduled transactions, and use of Agent Kit or the Hedera MCP.

### Packages & versions (npm registry, checked 3 Nov 2026)

| Package | Version | Published | Notes |
|---|---|---|---|
| `@x402/core` | 2.29.0 | 2026-10-28 | `x402Client`, `x402ResourceServer`, `HTTPFacilitatorClient`, `x402Facilitator` |
| `@x402/hedera` | 2.29.0 | 2026-10-28 | First published 2026-05-25. Subpaths `exact/client`, `exact/server`, `exact/facilitator`. Pins `@hiero-ledger/sdk` 2.90.1 and `@hiero-ledger/proto` 2.32.0 |
| `@x402/fetch` | 2.29.0 | 2026-10-28 | `wrapFetchWithPayment`, re-exports `x402Client` |
| `@x402/express` | 2.29.0 | 2026-10-28 | `paymentMiddleware`. Peer deps: express ^4.22.3 or ^5.3.0, `@x402/paywall` ^2.29.0 |
| `@x402/next` | 2.29.0 | 2026-10-28 | Next.js middleware |
| `@x402/hono` | 2.29.0 | 2026-10-28 | |
| `@x402/axios` | 2.29.0 | 2026-10-28 | |
| `@x402/paywall` | 2.29.0 | 2026-10-28 | Peer dep of `@x402/express` |
| `@x402/mcp` | 2.29.0 | 2026-10-28 | MCP transport |
| `@x402/evm` | 2.29.0 | 2026-10-28 | Not needed for Hedera |
| `x402`, `x402-fetch`, `x402-express`, `x402-next`, `x402-hono` | 1.2.0 | 2026-04-16 | **Legacy v1, no Hedera support. Do not use.** |
| `x402-axios` | 1.2.1 | 2026-05-29 | Legacy v1 |
| `@hiero-ledger/sdk` | 2.90.1 | 2026-10-15 | The Hedera JS SDK now used by x402 and Agent Kit |
| `@hashgraph/sdk` | 2.81.0 | 2026-03-13 | Older name. Not deprecated on npm, but x402 and Agent Kit v4 use `@hiero-ledger/sdk` |
| `@hashgraph/hedera-agent-kit` | 4.2.0 | 2026-10-28 | Peer dep `@hiero-ledger/sdk` ^2.90.1. Subpaths `/plugins`, `/hooks`, `/policies` |
| `@hashgraph/hedera-agent-kit-ai-sdk` | 2.1.0 | 2026-10-28 | Vercel AI SDK toolkit (`HederaAIToolkit`) |
| `@hashgraph/hedera-agent-kit-langchain` | 2.1.0 | 2026-10-28 | |
| `@hashgraph/hedera-agent-kit-mcp` | 1.2.0 | 2026-10-28 | |
| `hedera-agent-kit` | 3.8.2 | 2026-03-21 | **Deprecated** ("use @hashgraph/hedera-agent-kit (v4)") |
| `@hashgraph/hedera-agent-kit-x402` | not found | — | No such package exists |

### Gotchas / limits

1. **Use v2 `@x402/*` packages only.** Older blog posts and tutorials use v1 (`x402-express`, the `hedera-testnet` network string, the `hedera-dev/x402-hedera` fork), and these do not interoperate with v2 facilitators.
2. **The docs' merchant snippet uses placeholder token ids** (`"hedera:testnet": { asset: "0.0.6001" }`). Copying it verbatim gates on a token that does not exist. Pass `new ExactHederaScheme({})` (defaults to USDC `0.0.429274`) or set `asset: "0.0.429274", decimals: 6`.
3. **Association.** The agent (payer) **and** the `payTo` account must both be associated with `0.0.429274` before the first USDC payment. The Portal UI cannot associate tokens. Use `TokenAssociateTransaction` (re-exported by `@x402/hedera`) or Agent Kit's `ASSOCIATE_TOKEN_TOOL`. The same applies to **contributor payout accounts**: each contributor wallet needs USDC association, otherwise the payout fails.
4. **Hollow accounts.** The EVM-address faucet creates hollow accounts with no key on record. The facilitator **verifies the payer's signature against the on-chain account key** (spec rule 6). Inference: a hollow payer account would likely fail `/verify` until the account is "completed" by signing a transaction as fee payer. UNVERIFIED by test. Safer: create agent accounts in the Hedera Portal and use **ECDSA** keys (the official integration tests assume `0x`-prefixed ECDSA keys).
5. **Valid duration and timeouts.** HashScan shows a 2-minute valid duration on x402.org settlements, and the docs examples use `maxTimeoutSeconds: 180`. The signed transfer must be settled inside that window. Do not pre-sign and hold payloads.
6. **Settlement timing.** `paymentMiddleware` verifies, then settles. The hedera-dev PoC describes settlement as async relative to serving the response. If the facilitator cannot fetch the record it may return `settlement_pending` with `success:false` and a tx id. Reconcile through the mirror node before retrying, and do not double-pay.
7. **Docs vs code naming.** The Hedera exact-scheme docs page shows the settlement field as `transactionId`, but the v2 core shape and the actual `@x402/hedera` facilitator code return `transaction`. Read `transaction`.
8. **Dependency duplication.** Import Hedera SDK classes from `@x402/hedera`'s re-exports (or keep exactly one `@hiero-ledger/sdk` version). Duplicate SDK installs throw `t.startsWith is not a function`. Agent Kit 4.2.0 peers on `@hiero-ledger/sdk` ^2.90.1, which matches `@x402/hedera`'s pin today.
9. **Language support.** The official monorepo has a Hedera mechanism **only for TypeScript**. I found no `hedera` path under its Python or Go trees. Any Python agent would need its own signer, so plan the paying agent in TS.
10. **Alias policy.** The reference facilitator's default `aliasPolicy` is `reject`, so `payTo` must be a real `0.0.x` account id, not an EVM alias.
11. **Testnet USDC is capped** at 20 per 2 hours per address on the Circle faucet. Fund the agent wallet early and keep demo prices small (for example $0.001 to $0.10).
12. **USDC on Hedera has a freeze key** (mirror node), so Circle can freeze accounts. This is irrelevant for the demo but true.
13. **x402 does not do the contributor payout.** x402 is the request/pay/response for the agent's paid API call. Paying a contributor after AI verification is an ordinary HTS `TransferTransaction` (or an Agent Kit `TRANSFER_FUNGIBLE_TOKEN_TOOL` call guarded by a custom policy), and the agent pays its own HBAR fee for it. Our brief already separates these two flows.
14. **HashScan returns HTTP 404 to curl.** It is a SPA. It renders correctly in a browser (verified), so do not treat curl's 404 as a broken link.
15. **No privacy.** Amounts and accounts are public on the ledger.

### Minimal snippet (from docs)

Client / agent, verbatim from https://docs.hedera.com/solutions/ai/x402/pay-with-x402 (identical in the `@x402/hedera` README):

```ts
import { x402Client } from "@x402/core/client";
import { createClientHederaSigner } from "@x402/hedera";
import { ExactHederaScheme } from "@x402/hedera/exact/client";
import { PrivateKey } from "@hiero-ledger/sdk";

const signer = createClientHederaSigner(
  "0.0.1111",
  PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY!),
  { network: "hedera:testnet" }
);

// Register the scheme for any Hedera network and let the client
// auto-handle 402 responses by signing and retrying.
const client = new x402Client().register(
  "hedera:*",
  new ExactHederaScheme(signer)
);
```

Server, verbatim from https://docs.hedera.com/solutions/ai/x402/merchant-integration. **The asset ids are placeholders; see gotcha 2.**

```ts
import { x402ResourceServer } from "@x402/core/server";
import { ExactHederaScheme } from "@x402/hedera/exact/server";

const server = new x402ResourceServer(facilitatorClient);

server.register(
  "hedera:*",
  new ExactHederaScheme({
    defaultAssets: {
      "hedera:testnet": { asset: "0.0.6001", decimals: 6 },
      "hedera:mainnet": { asset: "0.0.9001", decimals: 6 },
    },
  })
);
```

Working end-to-end wiring, verbatim excerpts from the official `hedera-dev/x402-inference-pay-per-request-poc` (`packages/service/src/x402.ts`, `server.ts`, `packages/agent/src/x402-client.ts`):

```ts
// service: facilitator + Express gate
import { HTTPFacilitatorClient, x402ResourceServer } from '@x402/core/server';
import { ExactHederaScheme } from '@x402/hedera/exact/server';
import { paymentMiddleware } from '@x402/express';

const facilitatorClient = new HTTPFacilitatorClient({ url: 'https://x402.org/facilitator' });
const testnetRS = new x402ResourceServer(facilitatorClient).register('hedera:*', new ExactHederaScheme({}));

app.use(paymentMiddleware(
  {
    'POST /v1/testnet/usdc/chat/completions': {
      accepts: [{ scheme: 'exact', price: '$0.001', network: 'hedera:testnet', payTo: TESTNET_SERVICE_ACCOUNT }],
      description: 'LLM inference — testnet USDC',
      mimeType: 'application/json',
    },
  },
  testnetRS,
));

// agent: fetch wrapper that auto-pays 402s
import { wrapFetchWithPayment, x402Client } from '@x402/fetch';
const sharedClient = new x402Client().register('hedera:testnet', new ExactHederaScheme(testnetSigner));
const paidFetch = wrapFetchWithPayment(fetch, sharedClient);
```

Token association, verbatim from the `@x402/hedera` README:

```ts
import { AccountId, Client, PrivateKey, TokenAssociateTransaction, TokenId } from "@x402/hedera";

const client = Client.forTestnet().setOperator(
  AccountId.fromString(accountId),
  PrivateKey.fromStringECDSA(privateKey),
);
await new TokenAssociateTransaction()
  .setAccountId(AccountId.fromString(accountId))
  .setTokenIds([TokenId.fromString("0.0.429274")]) // testnet USDC
  .execute(client)
  .then(response => response.getReceipt(client));
client.close();
```

Agent Kit policies, verbatim from `hedera-agent-kit-js/docs/HOOKS_AND_POLICIES.md`:

```ts
import { HcsAuditTrailHook } from '@hashgraph/hedera-agent-kit/hooks';
import { MaxRecipientsPolicy, RejectToolPolicy } from '@hashgraph/hedera-agent-kit/policies';

const context = {
  hooks: [
    new HcsAuditTrailHook(['transfer_hbar_tool'], '0.0.12345'),
    new MaxRecipientsPolicy(5),
    new RejectToolPolicy(['delete_account_tool']),
  ],
};
```

### Sources

- https://docs.hedera.com/solutions/ai/x402 (overview)
- https://docs.hedera.com/solutions/ai/x402/how-it-works
- https://docs.hedera.com/solutions/ai/x402/exact-scheme
- https://docs.hedera.com/solutions/ai/x402/pay-with-x402
- https://docs.hedera.com/solutions/ai/x402/merchant-integration
- https://docs.hedera.com/solutions/ai/x402/facilitators
- https://docs.hedera.com/solutions/ai/agent-kit
- https://docs.hedera.com/evm/quickstart/get-test-hbar
- https://docs.hedera.com/native/quickstart/javascript (HashScan URL form)
- https://github.com/x402-foundation/x402: `specs/schemes/exact/scheme_exact_hedera.md`, `specs/transports-v2/http.md`, `typescript/packages/mechanisms/hedera/{README.md,package.json,src/constants.ts,src/defaultAssets.ts,src/exact/facilitator/scheme.ts}`
- https://api.github.com/repos/coinbase/x402 (shows fork of x402-foundation/x402)
- https://x402.org/facilitator/supported, https://testnet.facilitator.launa.dev/supported, https://api.testnet.blocky402.com/supported (queried live 3 Nov 2026)
- https://developers.circle.com/stablecoins/usdc-contract-addresses (Hedera Testnet `0.0.429274`, mainnet `0.0.456858`)
- https://faucet.circle.com (lists Hedera Testnet; 20 USDC / 2 h / address / chain)
- https://testnet.mirrornode.hedera.com/api/v1/tokens/0.0.429274 and `/api/v1/transactions?account.id=0.0.9185802`
- https://hashscan.io/testnet/transaction/0.0.9185802@1793723395.737998589 (rendered in a browser)
- https://github.com/hashgraph/hedera-agent-kit-js (`README.md`, `docs/HOOKS_AND_POLICIES.md`, `docs/HEDERAPLUGINS.md`, `docs/HEDERATOOLS.md`)
- https://github.com/hedera-dev/x402-inference-pay-per-request-poc (official Agent Kit + x402 + USDC PoC)
- https://github.com/hedera-dev/x402-hedera (legacy v1 fork, for context only)
- https://ethglobal.com/events/mumbai/prizes/hedera (track requirements)
- https://ax402.io/ ("Ax402 is now Launa")
- npm registry (`npm view <pkg> version time --json`, `deprecated`, `peerDependencies`) for every package in the table

---

## C. World ID / IDKit

Accessed 3 Nov 2026. Sources are docs.world.org (Mintlify, `.md` variants), the `worldcoin/idkit` and `worldcoin/developer-portal` and `worldcoin/simulator` GitHub repos, and the npm registry.

### Key facts

- **World ID 4.0 is the current protocol, and IDKit 4.x is the current SDK.** Docs: "New apps should start with IDKit 4.x". IDKit 4.x "introduces major breaking changes":
  1. `rp_context` is required on every request (`rp_id`, `nonce`, `created_at`, `expires_at`, `signature`).
  2. The response shape changed. You no longer reshape the payload or compute `signal_hash`.
  3. The verify endpoint is now `POST /api/v4/verify/{rp_id}`.
  4. `@worldcoin/idkit-standalone` is discontinued.
  (https://docs.world.org/world-id/4-0-migration)
- **Don't use v2/v3 samples.** The official agent guide says: "DO NOT pin SDKs to `^2.x` or `^3.x` — those examples litter the public internet and will not work with v4. The API was redesigned." The v3 type names `ISuccessResult` and `IRpContext` were removed and are now `IDKitResult` and `RpContext`. The v4 widget is controlled through `open`/`onOpenChange` and takes no render-prop child. (https://docs.world.org/world-id/SKILL)
- **Version history on npm.** `@worldcoin/idkit` went from 2.4.2 (2 Oct 2025) straight to 4.0.1 (17 Feb 2026). npm has no stable 3.x. The old repo `worldcoin/idkit-js` is **archived**. Code now lives in the monorepo `worldcoin/idkit` (JS, Go, Swift, Kotlin).
- **Developer Portal setup.**
  - Create an app at https://developer.world.org (legacy domain developer.worldcoin.org). Keep `app_id` (`app_...`), `rp_id` (`rp_...`) and `signing_key` (a server-only secret).
  - The signing key is returned **exactly once** and cannot be recovered. Losing it means rotating, which invalidates the old signer.
  - RP registration is **on-chain and asynchronous**. Status starts as `pending` and must reach `registered`. Verify returns `not_registered` / `rp` errors while it is pending.
  - Testing with the simulator requires **both** `production_status` and `staging_status` to be `registered`.
  - A new Portal RP gets a random ID, so nullifiers change if you switch RPs.
  (https://docs.world.org/world-id/SKILL ; https://github.com/worldcoin/developer-portal/blob/main/web/api/mcp/SKILL.md)
- **App mode is fixed when the app is created.** Use `external` for IDKit and `mini-app` for MiniKit. The wrong mode makes World ID config fail, and the only fix is to create a new app. (SKILL)
- **There is a Developer Portal MCP.** Endpoint `https://developer.world.org/api/mcp` (streamable-http), auth `Authorization: Bearer api_<base64(id:secret)>` using a team API key. Tools include `create_app`, `configure_world_id`, `create_world_id_action`, `get_world_id_registration_status` and `rotate_world_id_signing_key`. (https://docs.world.org/model-context-protocol/developer-portal)
- **RP signatures** are generated on your backend.
  - Algorithm: secp256k1 ECDSA over an EIP-191 digest of a 49- or 81-byte message (version byte, nonce, created_at, expires_at, and optionally `hash_to_field(action)`). Default TTL is 300 s.
  - Helpers: `signRequest` from `@worldcoin/idkit-core/signing`, `@worldcoin/idkit/signing` or `@worldcoin/idkit-server`, plus the Go module `github.com/worldcoin/idkit/go/idkit`.
  - Docs: "Never generate RP signatures on the client."
  (https://docs.world.org/world-id/idkit/signatures)
- **The verify flow has 6 steps.**
  1. Install IDKit 4.x.
  2. Set up the Portal app, RP and action.
  3. The backend signs the RP request.
  4. The client opens `IDKitRequestWidget` / `useIDKitRequest` (React) or `IDKit.request(...).preset(...)` + `connectorURI` + `pollUntilCompletion()` (core). The user scans a QR code or follows a deep link with the World ID App.
  5. The backend forwards the IDKit result **unmodified** to `POST https://developer.world.org/api/v4/verify/{rp_id}`, then checks `success === true` and that `environment` matches what it expects.
  6. The backend stores the nullifier.
  (https://docs.world.org/world-id/idkit/integrate)
- **Verify endpoint body (v4).** Fields: `protocol_version` (`"3.0"` or `"4.0"`), `nonce`, `action`, `responses[]`, optional `environment` (`production` | `staging` | `sandbox`, default `production`), `integrity_bundle` and `user_presence_completed`.
  - A v4 `responses[]` entry carries `identifier` (e.g. `proof_of_human`), `issuer_schema_id`, `nullifier`, `expires_at_min`, `proof` (5 elements) and `signal_hash`. v3 entries carry `merkle_root`, `nullifier`, `proof`, `signal_hash` and `max_age`.
  - Errors include `app_not_migrated` ("Please use the v2 verify endpoint") and `all_verifications_failed`. 404 means the app was not found.
  - The path takes `rp_id`; `app_id` is still accepted.
  (https://docs.world.org/api-reference/developer-portal/verify ; https://docs.world.org/openapi/developer-portal.json)
- **The legacy endpoint still exists.** `POST /api/v2/verify/{app_id}` takes `nullifier_hash`, `merkle_root`, `proof`, `verification_level` and `action`, with legacy errors `already_verified` and `exceeded_max_verifications`. The migration guide says to "Replace `verifyCloudProof(...)` with a backend POST to …/api/v4/verify/{rp_id}", so treat `verifyCloudProof` as legacy. (https://docs.world.org/api-reference/developer-portal/verify-legacy ; https://docs.world.org/world-id/from-idkit-standalone)
- **Nullifier semantics.** The nullifier is derived from (user's World ID, app/RP, action). The same person on the same action always gets the same nullifier, and nullifiers can't be linked across apps or actions.
  - "The Developer Portal confirms the proof is cryptographically valid, but **your backend must check that the nullifier hasn't been used before**."
  - Store it as `NUMERIC(78,0)` with `UNIQUE (nullifier, action)`.
  - The Portal MCP skill states: "Portal v4 currently accepts nullifier reuse — a repeat verification succeeds with a message noting the reuse."
  - The v2-era per-action `max_verifications` setting (still in the `create-action` API, default 1) is therefore **not** your anti-replay mechanism in v4. Your database is.
- **Uniqueness vs session proofs (new in 4.0).** Uniqueness proofs are "one-time per action for each user". Session proofs (`IDKitSessionWidget` / `useIDKitSession`, `IDKit.createSession` / `proveSession`) give a stable `session_id` for returning users, with `session_nullifier` as per-proof replay protection. Rule of thumb: "use `nullifier` for one-time uniqueness and `session_id` for continuity". (4-0-migration)
- **Actions.**
  - The simulator guide and the Portal MCP skill say: "Actions need no pre-registration — the v4 verify endpoint lazy-creates them on first verification."
  - The docs SKILL instead lists "action not found" as a symptom of an action that was not created in the environment IDKit points at.
  - **Conflicting sources. Create the action explicitly in each environment you use** (dashboard or `create_world_id_action`).
  - "Incognito action" survives only as the legacy v2 `POST /api/v2/create-action/{app_id}` API, which needs a team API key.
- **Credentials and verification levels in 4.0**:
  - `proofOfHuman`: Orb, `issuer_schema_id` 1. Includes legacy Orb fallback.
  - `passport`: NFC document, 9303. Includes legacy Document fallback.
  - `selfieCheck`: Proof of Presence, 11, **Beta**. Medium/low assurance, anyone with the World ID App, returns `sybil_score`.
  - `identityCheck`: **preview, "contact us"**.
  - Legacy v3-only presets: `orbLegacy`, `secureDocumentLegacy`, `documentLegacy`, and `deviceLegacy`, which is "Deprecated … For new integrations, use Selfie Check".
  - The legacy `verification_level` enum is `orb`, `secure_document`, `document`, `device`, `face`/`selfie`.
  - The request field `allow_legacy_proofs` is **required**. `require_user_presence` adds an optional liveness check.
  (https://docs.world.org/world-id/idkit/credentials ; credentials/11)
- **Testing without an Orb, using the Simulator.**
  - https://simulator.worldcoin.org is live (HTTP 200 today). It offers test identities that "hold every credential on the World ID staging network" (Human, Passport, ID, Device).
  - Set IDKit `environment: "staging"`. The action must be staging, and the environment, action and simulator-vs-real-app choice must all match. "A staging action with the production World ID app will silently produce zero proofs."
  - A Simulator MCP (`https://simulator.worldcoin.org/api/mcp`, no key) has one tool, `complete_test_request { connect_url }`, which completes a native v4 Proof of Human uniqueness request.
  - The reference app is https://idkit-js-example.vercel.app/ (source `js/examples/nextjs`).
  (https://github.com/worldcoin/simulator/blob/main/docs/mcp.md ; SKILL)
- **Sandbox.** This is a separate production-like environment (`environment: "sandbox"`) using special World ID app builds through TestFlight or a private Play track. It needs a tester-access **request and approval** in the Developer Portal. It is optional; the simulator does not need it. (https://docs.world.org/world-id/sandbox/sandbox-access)
- **App review.** `submit_app_for_review` exists, and it requires store metadata (logo, showcase image, countries, languages, description). The docs tie it to app-store listing and include it as the last step of the external-app MCP flow. **No primary source says review is required before an external IDKit app can verify proofs. Whether an unreviewed external app can verify production proofs is UNVERIFIED.** The staging/simulator path needs no review in any doc found.
- **On-chain (brief).**
  - v3: `WorldIDRouter.verifyProof` (e.g. World Chain mainnet `0x17B354dD2595411ff79041f930e491A4Df39A278`, Base Sepolia `0x42FF98C4E85212a5D31358ACbFe76a621b50fC02`, `groupId = 1` Orb only).
  - v4: `WorldIDVerifier.verify(...)`. Production proxy on World Chain is `0x00000000009E00F9FE82CfeeBB4556686da094d7`; staging on World Chain is `0x703a6316c975DEabF30b637c155edD53e24657DB`. Arc production is `0x304E14e4…E394`.
  - No Hedera deployment is listed, so we should use cloud (`/api/v4/verify`) verification. (https://docs.world.org/world-id/idkit/onchain-verification)

### Packages & versions

From `npm view` on 3 Nov 2026:

| Package | Latest | Published | Notes |
| --- | --- | --- | --- |
| `@worldcoin/idkit` (React widgets + hooks) | 4.6.0 | 2026-10-21 | deps `@worldcoin/idkit-core@4.6.0`, `qrcode`. Peers `react >=18`, `react-dom >=18` (optional), `expo-crypto ^57` (optional). Subpaths `/signing`, `/hashing`, `/hooks`. Recent releases 4.3.0 (Sep 23), 4.4.0 (Oct 3), 4.5.0 (Oct 20), 4.6.0 (Oct 21). |
| `@worldcoin/idkit-core` (vanilla JS/TS) | 4.6.0 | 2026-10-21 | deps include `@worldcoin/idkit-server@1.2.0`. Subpaths `/signing`, `/hashing`. |
| `@worldcoin/idkit-server` (JS RP signing) | 1.2.0 | 2026-10-20 | `signRequest`. |
| Go `github.com/worldcoin/idkit/go/idkit` | v1.2.0 | 2026-10-20 (GitHub release) | RP signing only. |
| `@worldcoin/idkit-standalone` | 2.2.5 | 2025-10-02 | **npm-deprecated / discontinued.** Do not use. |
| `@worldcoin/idkit-react` | n/a | n/a | **Does not exist on npm (404).** |
| `@worldcoin/minikit-js` | 2.0.3 | 2026-04-06 | Only for World App Mini Apps. Docs: "World ID verification has moved to IDKit". Not needed for us. |

### Gotchas / limits

1. **Tutorials and LLM memory are wrong.** Most of them show IDKit 2.x (`IDKitWidget`, `verification_level`, `handleVerify(ISuccessResult)`, `verifyCloudProof`, `/api/v2/verify`). That code will not work with v4. Pin `^4.6.0`.
2. **The backend signing endpoint is mandatory.** You need a route that returns `{sig, nonce, created_at, expires_at}` for the requested action. `RP_SIGNING_KEY` must never be a `NEXT_PUBLIC_*` variable.
3. **On-chain RP registration can sit in `pending`.** Create the Portal app early (today) and confirm both production and staging are `registered` before the hackathon.
4. **Environment mismatch is the #1 silent failure.** Simulator demo means `environment: "staging"` plus a staging action. Real phones mean `production`. The backend should assert the expected `environment` in both the request and the verify response.
5. **Uniqueness is enforced by our database, not by World.** Portal v4 accepts nullifier reuse. Use `UNIQUE(action, nullifier)` and reject duplicates; don't upsert.
6. **One proof per user per action.** For one-claim-per-task, the action could be task-scoped (e.g. `claim-task-<id>`), which our design would use, and the RP signature binds the action. For one-account-per-person across all tasks, use a single action such as `contributor-signup` and map nullifier to contributor. Because the lazy-create vs "action not found" docs conflict, test dynamic actions in staging first. Docs say switching credential "means a new action".
7. **Bind the payout wallet into the proof.** Use `signal` (e.g. the contributor's wallet address or claim ID). The backend must enforce the same value; `hashSignal` is in `/hashing`.
8. **Real-user demo constraint.** `proofOfHuman` in production needs an Orb-verified user. Judges and teammates without an Orb would need `selfieCheck` (Beta, any World ID App user) or the staging simulator.
9. **Forward the IDKit result byte-for-byte.** Mutated payloads cause `invalid_proof` / `verification_failed`. Nullifiers are 0x hex strings of 256-bit integers.
10. **iOS cold installs lose the QR context.** `IDKitInviteCodeRequestWidget` / `IDKit.requestWithInviteCode` solves this with a 6-char code and a 15-minute TTL.
11. **Docs and repo disagree on WASM.** The simulator MCP doc (written against idkit-core 4.2.1) says the browser global bundle needs `idkit_wasm_bg.wasm` served alongside it. The current React README says the "JavaScript core with no WASM build or runtime dependency". Expect a non-issue on 4.6.0 with a bundler. **UNVERIFIED for the global-script build.**
12. **The `CHANGELOG.md` in the repo is stale** (last entry 3.0.5). Use npm versions plus the docs, not the changelog.

### Minimal snippet (from docs)

Backend RP signature route, verbatim from https://docs.world.org/world-id/idkit/integrate (Step 3):

```ts
import { NextResponse } from "next/server";
import { signRequest } from "@worldcoin/idkit-core/signing";

export async function POST(request: Request): Promise<Response> {
  const { action } = await request.json();

  const { sig, nonce, createdAt, expiresAt } = signRequest({
    signingKeyHex: process.env.RP_SIGNING_KEY!,
    action,
  });

  return NextResponse.json({
    sig,
    nonce,
    created_at: createdAt,
    expires_at: expiresAt,
  });
}
```

Client (React), verbatim from the same page (Step 4):

```tsx
import {
  IDKitRequestWidget,
  orbLegacy,
  type RpContext,
} from "@worldcoin/idkit";

const rpSig = await fetch("/api/rp-signature", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ action: "my-action" }),
}).then((r) => r.json());

const rp_context: RpContext = {
  rp_id: "rp_xxxxx", // Your app's `rp_id` from the Developer Portal
  nonce: rpSig.nonce,
  created_at: rpSig.created_at,
  expires_at: rpSig.expires_at,
  signature: rpSig.sig,
};

// ...
 
<IDKitRequestWidget
  open={open}
  onOpenChange={setOpen}
  app_id="app_xxxxx" // Your app's `app_id` from the Developer Portal
  action="my-action"
  rp_context={rp_context}
  allow_legacy_proofs={true}
  preset={orbLegacy({ signal: "local-election-1" })}
  handleVerify={async (result) => {
    const response = await fetch("/api/verify-proof", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        rp_id: rp_context.rp_id,
        idkitResponse: result,
      }),
    });

    if (!response.ok) {
      throw new Error("Backend verification failed");
    }
  }}
  onSuccess={(result) => {
    // Runs after `handleVerify` succeeds. Update app state/UI here.
  }}
/>;
```

The comments are trimmed slightly. For the v4 credential, swap `orbLegacy(...)` for `proofOfHuman({ signal })` from the same package (https://docs.world.org/world-id/idkit/credentials). For the simulator, add `environment="staging"` (https://docs.world.org/world-id/idkit/react).

Server verify, verbatim from https://docs.world.org/world-id/idkit/integrate (Step 5):

```ts
import { NextResponse } from "next/server";
import type { IDKitResult } from "@worldcoin/idkit";

export async function POST(request: Request): Promise<Response> {
  const { rp_id, idkitResponse } = (await request.json()) as {
    rp_id: string;
    idkitResponse: IDKitResult;
  };

  const expectedEnvironment = "production";

  if (idkitResponse?.environment !== expectedEnvironment) {
    return NextResponse.json({ error: "Verification failed" }, { status: 400 });
  }

  const response = await fetch(
    `https://developer.world.org/api/v4/verify/${rp_id}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...idkitResponse,
        environment: expectedEnvironment,
      }),
    },
  );

  if (!response.ok) {
    return NextResponse.json({ error: "Verification failed" }, { status: 400 });
  }

  const verification = await response.json();

  if (
    verification?.success !== true ||
    verification?.environment !== expectedEnvironment
  ) {
    return NextResponse.json({ error: "Verification failed" }, { status: 400 });
  }

  // Uniqueness: store the nullifier (Step 6).
  return NextResponse.json({ success: true });
}
```

The docs' Step 6 table is `CREATE TABLE nullifiers (nullifier NUMERIC(78, 0) NOT NULL, action TEXT NOT NULL, verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE (nullifier, action));`

### Sources

- https://docs.world.org/world-id/idkit/integrate
- https://docs.world.org/world-id/4-0-migration
- https://docs.world.org/world-id/idkit/react
- https://docs.world.org/world-id/idkit/javascript
- https://docs.world.org/world-id/idkit/signatures
- https://docs.world.org/world-id/idkit/credentials
- https://docs.world.org/world-id/credentials/11
- https://docs.world.org/world-id/idkit/verification-flows
- https://docs.world.org/world-id/idkit/error-codes
- https://docs.world.org/world-id/idkit/onchain-verification
- https://docs.world.org/world-id/concepts
- https://docs.world.org/world-id/SKILL
- https://docs.world.org/world-id/from-idkit-standalone
- https://docs.world.org/world-id/sandbox/what-is-sandbox
- https://docs.world.org/world-id/sandbox/sandbox-access
- https://docs.world.org/api-reference/developer-portal/verify
- https://docs.world.org/api-reference/developer-portal/verify-legacy
- https://docs.world.org/api-reference/developer-portal/create-incognito-action
- https://docs.world.org/openapi/developer-portal.json
- https://docs.world.org/model-context-protocol/developer-portal
- https://docs.world.org/llms.txt
- https://github.com/worldcoin/idkit (README, js/packages/react/README.md, js/packages/core/CHANGELOG.md, releases)
- https://github.com/worldcoin/idkit-js (archived)
- https://github.com/worldcoin/developer-portal/blob/main/web/api/mcp/SKILL.md
- https://github.com/worldcoin/simulator/blob/main/docs/mcp.md
- https://simulator.worldcoin.org (live, checked 3 Nov 2026)
- npm registry: `@worldcoin/idkit`, `@worldcoin/idkit-core`, `@worldcoin/idkit-server`, `@worldcoin/idkit-standalone`, `@worldcoin/minikit-js`, `@worldcoin/idkit-react` (404)

---

## D. Chainlink CRE

Accessed 3 Nov 2026. All facts below come from docs.chain.link/cre (pages fetched as `.md`), GitHub `smartcontractkit/*`, npm, the Go module proxy, and the ETHGlobal Mumbai Chainlink prize page. Anything not confirmed from one of those is marked **UNVERIFIED**.

### Key facts

- **What it is.** The Chainlink Runtime Environment is an "orchestration layer". You write a *workflow* with the CRE SDK (Go or TypeScript), and the CLI compiles it to a **WASM binary**. Once deployed, a **Workflow DON** watches for triggers and runs your callback on every node. The workflow calls **capability DONs** (HTTP, EVM read/write, …), and each capability result goes through BFT consensus. (cre/overview, last updated 2026-09-16)
- **Status.** CRE went live on 4 Nov 2025. "Build and simulate" is open to anyone with a free Chainlink Platform account. **Deploying to a DON requires approval** (Early Access): you request it with `cre account access`, which offers "Hackathon" as a purpose option. Approval is granted per organization, and the Chainlink team replies "via email". No turnaround time is stated. (release-notes, deploy-access)
- **Programming model.** Each `handler(trigger, callback)` pair links one trigger to one callback. Callbacks are **stateless**, and every trigger fire is an independent execution. Capability calls return promises, and you call `.result()` to get the consensus-verified value. The final step is optionally `runtime.report()` (a DON-signed report) followed by a write.
- **Triggers.** **Cron** (fastest interval 30 s), **HTTP**, **EVM Log**, and Solana Log. A workflow can have only **one HTTP trigger**. A deployed HTTP trigger needs `authorizedKeys` (EVM addresses of type `KEY_TYPE_ECDSA_EVM`), and callers send a signed/JWT JSON-RPC POST to the CRE gateway. In simulation, an empty `trigger({})` config is allowed.
- **Capabilities.** HTTP client (GET/POST with consensus aggregation), **Confidential HTTP** (runs in an enclave and injects secrets), EVM Read & Write, Solana Read & Write, Secrets (from `.env`/`secrets.yaml` in simulation, Vault DON when deployed), consensus-safe randomness (`Math.random()` override), DON time via `runtime.now()`, and Confidential Workflows (TEE, added in SDK 1.18).
- **Consensus helpers (TS).** `consensusMedianAggregation`, `consensusIdenticalAggregation`, `consensusCommonPrefix/SuffixAggregation`, and `ConsensusAggregationByFields({ f: median | identical | commonPrefix })`.
- **All nodes run your HTTP calls.** For POST requests or anything that isn't idempotent, the docs require `cacheSettings: { readFromCache: true, maxAgeMs }` so that only one node makes the real call. Chainlink's own Gemini prediction-market demo calls the LLM with `cacheSettings` (60 s) plus `consensusIdenticalAggregation`. Use the same pattern for any AI or verification API call.
- **How on-chain writes work.** The flow is `runtime.report({encodedPayload, encoderName:"evm", signingAlgo:"ecdsa", hashingAlgo:"keccak256"})` and then `evmClient.writeReport(runtime, {receiver, report, gasConfig})`. The DON sends the signed report to Chainlink's **`KeystoneForwarder`**. The forwarder checks the signatures and calls **`onReport(bytes metadata, bytes report)`** on your consumer contract, which must implement `IReceiver` and ERC165. The recommended base contract is `ReceiverTemplate`: you pass the forwarder address to its constructor and override `_processReport(bytes)`. The tx `to` address is the forwarder, not your contract.
- **Reports can also be delivered off-chain.** `sendReport()` POSTs a DON-signed report to any HTTP endpoint. The receiver has to check the signatures against the on-chain Capability Registry.
- **Local simulation (`cre workflow simulate`) needs no deploy access.**
  - It compiles to WASM and runs on your machine as a **single node**, so consensus is only simulated.
  - It makes **real calls** to live HTTP APIs and public testnets. Cron and HTTP triggers fire immediately when you pick them.
  - `--non-interactive --trigger-index N --http-payload @file.json` is for scripted runs. `--listen` starts a local server on **port 2000**, and each POST re-runs the workflow.
  - Writes are a **dry run by default** and return a zero tx hash. **`--broadcast` sends real testnet transactions** through a **`MockKeystoneForwarder`**, signed by `CRE_ETH_PRIVATE_KEY` from `.env`, which must hold testnet gas.
  - The Getting Started Part 4 tutorial shows the consumer contract's on-chain state updating on Sepolia after `simulate --broadcast`.
- **Deploy registries (after approval).** There are two choices:
  - `deployment-registry: "private"`: Chainlink-hosted, authorized by CLI login, no wallet or gas, **3 workflows per org**.
  - `"onchain:ethereum-mainnet"`: needs `cre account link-key` and **mainnet ETH for registry gas**. One linked key per org, 3 workflows per key. As of CLI v1.38 the docs warn that linking a key is permanent.
- **Supported testnets (TS SDK table, updated 2026-10-19).** Ethereum Sepolia, Base Sepolia, Arbitrum Sepolia, OP Sepolia, Avalanche Fuji, BNB testnet, Polygon Amoy, World Chain Sepolia, Ink, Linea, Mantle, Unichain, ZKSync Era Sepolia, Celo Sepolia, Monad Testnet, Ethereum Hoodi, and others, plus Solana Devnet. **Hedera is NOT listed** (zero mentions anywhere in the 1.37 MB TS `llms-full.txt` or on the Go supported-networks page). **Arkiv is NOT listed.** `cre workflow supported-chains` shows the chains enabled for your tenant, which is the authoritative list.
- **Forwarder addresses for Ethereum Sepolia** (forwarder directory):
  - Simulation MockForwarder `0x15fC6ae953E024d975e77382eEeC56A9101f9F88`
  - Production KeystoneForwarder `0xF8344CFd5c43616a4366C34E3EEE75af79a74482`
- **Forwarder addresses for Base Sepolia:**
  - Mock `0x82300bd7c3958625581cc2f77bc6464dcecdf3e5`
  - Production `0xF8344CFd5c43616a4366C34E3EEE75af79a74482`
- **The prize can be won with simulation alone.** ETHGlobal Mumbai "Best workflow with CRE" ($1,500) says "It is NOT mandatory to deploy it during the hackathon, simulation is enough!" The workflow must:
  - integrate at least one blockchain with an external API/LLM/agent
  - show a successful CLI simulation or a live deployment
  - be meaningfully used in the project

  (Separately, CCIP has $3,500 and requires CCIP in contracts; that is out of scope for us.)
- **An official x402 + CRE pattern exists.** The template `smartcontractkit/x402-cre-price-alerts` (docs page dated 2026-02-13) works like this: an x402-paid API (USDC on **Base Sepolia**) produces a payload, the payload goes to a CRE HTTP trigger, and the workflow does `writeReport` to a contract. The doc runs the demo with `cre workflow simulate alerts --broadcast` and a hand-pasted JSON payload, so it does not need deploy access.

### Packages & versions

| Item | Name | Latest (stable) | Date | Notes |
|---|---|---|---|---|
| CLI | `cre` (GitHub `smartcontractkit/cre-cli`) | **v1.39.0** | 2026-10-21 | Install: `curl -sSL https://app.chain.link/cre/install.sh \| bash` puts it in `$HOME/.cre`. Linux assets are `cre_linux_amd64.tar.gz`, plus `_ldd2-35` builds for glibc ≤ 2.35. Self-updates with `cre update`. |
| TS SDK | `@chainlink/cre-sdk` (npm) | **1.23.0** | 2026-09-29 | Also `1.24.0-alpha.1` (2026-10-19) and dist-tag `solana`. Requires **Bun ≥ 1.2.21**. Deps include `viem ^2.54.2`, `zod 3.25.76`, `@chainlink/cre-sdk-javy-plugin 1.7.0`. The template's postinstall runs `bunx cre-setup`. |
| Go SDK | `github.com/smartcontractkit/cre-sdk-go` | **v1.21.0** | 2026-09-17 | `v1.22.0-beta.0` (2026-10-15). Go ≥ 1.25.3 per the Go getting-started guide. |
| Javy plugin | `@chainlink/cre-sdk-javy-plugin` | 1.7.0 | (n/a) | TS compiles to WASM and runs in **QuickJS, not Node.js**. |
| Templates | `smartcontractkit/cre-templates` | repo pushed 2026-10-20 | (n/a) | Building blocks: `kv-store`, `read-data-feeds`, `indexer-*`, `solana-read-write`, … Starters: `custom-data-feed`, `prediction-market`, `event-reactor`, `confidential-workflows`, … |
| Min versions for Sepolia / Base Sepolia | (n/a) | CLI v1.0.0+, TS SDK v1.0.1+, Go v1.0.0+ | (n/a) | Supported-networks table |

### Gotchas / limits

1. **The chain mismatch is the big one.** CRE cannot write to **Hedera** or **Arkiv**: neither is a supported chain, and EVM write only goes through the Keystone (Mock)Forwarder on supported chains. To use CRE's on-chain write we would have to **add a CRE-supported EVM testnet**, most practically Ethereum Sepolia or Base Sepolia, holding a small consumer contract. That conflicts with the brief's rule "Do not add extra chains merely to increase the number of logos". Writing to Hedera or Arkiv by signing raw transactions inside a workflow via HTTP is not documented. **UNVERIFIED and not recommended.**
2. **Deploy needs approval** (`cre account access` → Hackathon). The turnaround is not documented, so **plan for simulation only**, which the prize explicitly accepts. In simulation nothing runs on a DON. Our backend or the operator has to invoke `cre workflow simulate` (CLI) itself. There is **no hosted HTTP endpoint** unless the workflow is deployed. `--listen` gives a local `localhost:2000` endpoint instead.
3. **A Chainlink Platform account plus `cre login` is required even to simulate** (browser login; `CRE_API_KEY` is available for headless use). Each teammate needs an account or an invite to the org (up to 40 users per org).
4. **`onReport()` in simulation: the docs contradict themselves.**
   - The Onchain Write overview (TS, updated 2026-09-18) says simulate uses a MockForwarder that "does **not** call your consumer contract's `onReport()`", so `receiverContractExecutionStatus` is always SUCCESS in simulation.
   - Getting Started Part 4 and the Consumer Contracts guide show state updating through the MockForwarder with `--broadcast`.

   Treat the **real** `onReport` execution in `--broadcast` simulation as **UNVERIFIED** until a 10-minute smoke test (`simulate --broadcast`, then read the contract state on Etherscan).
5. **MockKeystoneForwarder provides no workflow metadata.** Do not call `setExpectedWorkflowId/Author/Name` on the consumer while simulating, or the writes fail. Deploy the consumer with the **Mock** forwarder address for simulation and switch to the production KeystoneForwarder (`setForwarderAddress`) only if you ever deploy.
6. **Reverted reports are not marked used,** so they can be replayed. Put a nonce or timestamp in the payload and reject stale reports in the consumer.
7. **Non-determinism breaks consensus.** Use `runtime.now()` instead of `Date.now()`. For LLM or verification calls, use `cacheSettings` together with `identical` aggregation. The best design is for the workflow to fetch an **already-stored** verification result by ID rather than re-running the model. Use `bigint` for Solidity ints and `parseUnits` for USDC's 6 decimals.
8. **TS runs in QuickJS/WASM, not Node.** npm packages that use `node:crypto` or `node:fs` will not work (Noble crypto is suggested). This means **no Hedera SDK, Arkiv SDK or World ID SDK inside the workflow**; reach those over HTTP only.
9. **Quotas** (service-quotas, 2026-09-16):
   - HTTP trigger rate is **1 per 30 s, burst 1** (deployed).
   - 15 HTTP calls per execution. Responses up to 250 KB, requests up to 120 KB.
   - 15 EVM reads per execution.
   - Report size up to 50 KB; gas up to 10M per tx.
   - Execution timeout 5 min.
   - Consensus observation up to 25 KB.
   - Secrets: 5 fetches per execution, 2 KB each.
   - Cron fastest interval 30 s.
   - Private registry: 3 workflows per org.

   `--limits` applies the production quotas during simulation.
10. **Doc nit on HTTP-trigger simulation input.** The HTTP trigger overview table says "`--input` flag", but the simulation guide documents **`--http-payload`**. Use `--http-payload`.
11. **Off-chain signature checks on simulated reports.** Reports sent via `sendReport()` must be checked against the Capability Registry. Whether a **single-node simulated** report passes that check is **UNVERIFIED** (probably not), so do not build the demo on off-chain report verification in simulation mode.
12. **Ethereum Glamsterdam (Q4 2026).** On-chain writes "may fail for roughly 30 minutes before and after each upgrade". The Hoodi and mainnet dates are TBC, and Sepolia timing is not stated. Low risk for 5–7 Nov, but check status on the day.

**Realistic minimal use for us (if we do it at all).** Use one HTTP-triggered TS workflow:
1. Input: `{ submissionId, taskId }`.
2. `HTTPClient.sendRequest` GETs our `/verifications/:submissionId`. This returns the stored AI verdict (score, verdict, evidence hash) and does not re-run the model. Use `cacheSettings` + `ConsensusAggregationByFields({ verdict: identical, score: median, evidenceHash: identical })`.
3. `encodeAbiParameters(taskId, submissionId, verdict, score, evidenceHash, nonce)`.
4. `runtime.report()`.
5. `writeReport` to a `VerificationAttestation is ReceiverTemplate` contract on **Base Sepolia or Ethereum Sepolia**.
6. Run it with `cre workflow simulate --non-interactive --trigger-index 0 --http-payload @payload.json --broadcast`.
7. Show the Etherscan/Basescan tx (to = MockForwarder) and the attestation event or state.

The Hedera payout agent can then check the attestation over an EVM RPC read before paying. This meets the prize ("blockchain + external API/AI, simulated, meaningfully used") and the brief's "show the external event/API input and resulting on-chain workflow".

**Honest assessment.** It costs about 3–5 h for one person (account, CLI, Bun, consumer contract deploy, Sepolia gas, and wiring the attestation check into the payout policy). It adds a **third chain**, Sepolia/Base Sepolia, purely for CRE, and the attestation duplicates what Arkiv's verification entity already provides. Only worth it if the team is chasing the $1,500 CRE prize *and* the Arkiv/Hedera/World core is already working by about hour 24. Otherwise drop it, as the brief already marks it "Stretch".

### Minimal snippet (from docs)

HTTP trigger handler, verbatim from https://docs.chain.link/cre/guides/workflow/using-triggers/http-trigger/configuration-ts:

```typescript
import { HTTPCapability, handler, type Runtime, type HTTPPayload, Runner } from "@chainlink/cre-sdk"

type Config = {
  authorizedEVMAddress: string
}

// Callback function that runs when an HTTP request is received
const onHttpTrigger = (runtime: Runtime<Config>, payload: HTTPPayload): string => {
  runtime.log(`HTTP trigger received: ${payload.input.length} bytes`)
  // Your logic here...
  return "Request processed"
}

const initWorkflow = (config: Config) => {
  const httpTrigger = new HTTPCapability()

  return [
    handler(
      httpTrigger.trigger({
        authorizedKeys: [
          {
            type: "KEY_TYPE_ECDSA_EVM",
            publicKey: config.authorizedEVMAddress,
          },
        ],
      }),
      onHttpTrigger
    ),
  ]
}

export async function main() {
  const runner = await Runner.newRunner<Config>()
  await runner.run(initWorkflow)
}
```

Signed report + on-chain write, verbatim from https://docs.chain.link/cre/getting-started/part-4-writing-onchain-ts:

```typescript
  // Step 1: Generate a signed report using the consensus capability
  const reportResponse = runtime
    .report({
      encodedPayload: hexToBase64(reportData),
      encoderName: "evm",
      signingAlgo: "ecdsa",
      hashingAlgo: "keccak256",
    })
    .result()

  // Step 2: Submit the report to the consumer contract
  const writeReportResult = evmClient
    .writeReport(runtime, {
      receiver: evmConfig.calculatorConsumerAddress,
      report: reportResponse,
      gasConfig: {
        gasLimit: evmConfig.gasLimit,
      },
    })
    .result()
```

Consumer contract, verbatim from https://docs.chain.link/cre/guides/workflow/using-evm-client/onchain-write/building-consumer-contracts:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;
import {ReceiverTemplate} from "./ReceiverTemplate.sol";

contract MyConsumer is ReceiverTemplate {
  uint256 public s_storedValue;
  event ValueUpdated(uint256 newValue);

  // Constructor requires forwarder address
  constructor(
    address _forwarderAddress
  ) ReceiverTemplate(_forwarderAddress) {}

  // Implement your business logic here
  function _processReport(
    bytes calldata report
  ) internal override {
    uint256 newValue = abi.decode(report, (uint256));
    s_storedValue = newValue;
    emit ValueUpdated(newValue);
  }
}
```

Simulation with a real testnet write, from https://docs.chain.link/cre/guides/operations/simulating-workflows:

```bash
cre workflow simulate my-workflow --non-interactive --trigger-index 1 --http-payload @./http_trigger_payload.json --target staging-settings
cre workflow simulate my-workflow --broadcast --target staging-settings
```

### Sources

- https://docs.chain.link/cre/overview (updated 2026-09-16)
- https://docs.chain.link/cre/llms.txt (index)
- https://docs.chain.link/cre/release-notes (updated 2026-10-22; CLI v1.39.0 on 2026-10-21; launch on 2025-11-04)
- https://docs.chain.link/cre/supported-networks-ts (updated 2026-10-19) and https://docs.chain.link/cre/supported-networks-go
- https://docs.chain.link/cre/guides/workflow/using-evm-client/forwarder-directory-ts (updated 2026-09-18)
- https://docs.chain.link/cre/guides/operations/simulating-workflows (updated 2026-10-19)
- https://docs.chain.link/cre/guides/operations/deploying-workflows (updated 2026-05-12)
- https://docs.chain.link/cre/guides/operations/deploy-access (updated 2026-10-09)
- https://docs.chain.link/cre/service-quotas (updated 2026-09-16)
- https://docs.chain.link/cre/capabilities, https://docs.chain.link/cre/capabilities/triggers
- https://docs.chain.link/cre/guides/workflow/using-triggers/http-trigger/overview-ts, .../configuration-ts, .../testing-in-simulation
- https://docs.chain.link/cre/guides/workflow/using-http-client/get-request-ts, .../post-request-ts, https://docs.chain.link/cre/reference/sdk/consensus-ts
- https://docs.chain.link/cre/guides/workflow/using-http-client/submitting-reports-http-ts, .../verifying-reports-offchain-ts
- https://docs.chain.link/cre/guides/workflow/using-evm-client/onchain-write/overview-ts (updated 2026-09-18)
- https://docs.chain.link/cre/guides/workflow/using-evm-client/onchain-write/building-consumer-contracts
- https://docs.chain.link/cre/getting-started/part-1-project-setup-ts, https://docs.chain.link/cre/getting-started/part-4-writing-onchain-ts, https://docs.chain.link/cre/getting-started/before-you-build-ts
- https://docs.chain.link/cre/getting-started/cli-installation/macos-linux
- https://docs.chain.link/cre/guides/workflow/secrets
- https://docs.chain.link/chainlink-platform/creating-an-account, https://docs.chain.link/cre/guides/cli/cli-login
- https://docs.chain.link/cre/templates, https://github.com/smartcontractkit/cre-templates
- https://docs.chain.link/cre/demos/prediction-market and https://github.com/smartcontractkit/cre-gcp-prediction-market-demo (`gemini.ts`: cacheSettings + identical aggregation)
- https://github.com/smartcontractkit/documentation/blob/main/src/content/cre-templates/x402-price-alerts.mdx and https://github.com/smartcontractkit/x402-cre-price-alerts
- https://github.com/smartcontractkit/cre-cli/releases (v1.39.0, 2026-10-21)
- `npm view @chainlink/cre-sdk` (1.23.0, 2026-09-29); https://proxy.golang.org/github.com/smartcontractkit/cre-sdk-go/@latest (v1.21.0, 2026-09-17)
- https://ethglobal.com/events/mumbai/prizes/chainlink (Best workflow with CRE, $1,500; simulation is enough)
