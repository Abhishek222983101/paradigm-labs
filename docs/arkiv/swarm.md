# Swarm × Arkiv

**Arkiv holds the record, Swarm holds the bytes.** Every accepted clip is encrypted by our worker and stored on Swarm through **our own Bee node** with **our own postage batch**. The `adx.submission` entity on Arkiv holds the Swarm reference and the ciphertext's sha256. The decryption key stays private until the buyer agent pays over x402 on Hedera.

## What is where

| Thing | Where | Value |
|---|---|---|
| Encrypted clip (AES-256-GCM, `iv(12) ‖ ciphertext ‖ tag(16)`) | Swarm (Sepolia testnet, network 10) | 64-hex reference, e.g. `46ef228b3117ef88dc41aa68a5b2d8f8f6ef239d63cd2d7c1800e5c7be648906` |
| Swarm reference + sha256 of the ciphertext | Arkiv `adx.submission` (`swarmRef`, `cipherSha256`), worker wallet `0xCDFa…2A51` | public |
| Task rubric JSON | Swarm (public gateway) + bytes on the `adx.task` entity, with `rubricHash` | ref `2a6ba126…0e81` |
| Decryption key | Neon Postgres (private) | released in the x402 response, after settlement only |
| Raw upload | worker disk | deleted right after encryption |

**Entity key ↔ Swarm ref:** read any submission and take `swarmRef`. Fetch the ciphertext and check its sha256 against `cipherSha256`.

```bash
# 1. submissions written by our worker, with their Swarm refs
curl -s https://rpc.rabdi.db-chain.testnet.arkiv.network -H 'content-type: application/json' -d '{"jsonrpc":"2.0","id":1,"method":"arkiv_query","params":["arkiv.schema = str('\''adx.submission'\'') AND $owner = addr(0xCDFa94802dEEAaf2ce7E694F2d16BE2628d52A51)",{"select":{"key":true,"attributes":{"swarmRef":true,"cipherSha256":true,"status":true}},"limit":"0x32"}]}'
# 2. fetch that ciphertext from Swarm through our node and compare the hash
curl -s https://worker-production-e76e.up.railway.app/swarm/<swarmRef>/bytes | sha256sum
```

We never put a key-bearing Swarm reference (128-hex) on Arkiv. We encrypt ourselves, so the reference carries no key, and the Arkiv write guard refuses 128-hex values.

## Our node and batch

| | |
|---|---|
| Bee | 2.8.3 light node on Railway (`ethersphere/bee:2.8.3`), Sepolia, private network only ([`infra/bee/`](../../infra/bee/)) |
| Node wallet / buyer of the batch | [`0xCEfca762D3Cdc231B20220dA681021b562afF694`](https://sepolia.etherscan.io/address/0xCEfca762D3Cdc231B20220dA681021b562afF694) |
| Chequebook | [`0x6f045e3A46048c77F3555AA87b78CD665Dd891bB`](https://sepolia.etherscan.io/address/0x6f045e3A46048c77F3555AA87b78CD665Dd891bB) |
| Postage batch | `c0cc54366a3a337d4a84ab78af74a26440d122eb3af5952d65734d8221332665`, depth 20, bought on-chain with [`createBatch`](https://sepolia.etherscan.io/tx/0x515df5c447f6c91d81c8391019f3a3702cb0a47b08968867ea43de5c2ee520d1) (0.2175 sBZZ) |
| sBZZ | swapped from Sepolia ETH on Uniswap v3 ([tx](https://sepolia.etherscan.io/tx/0x1b1d97ee93a32a3479e03b65e8309932e7cc43aad262a4b514ce5d4892b3c3f2)); no faucet exists |
| Health | `GET https://worker-production-e76e.up.railway.app/health` → `beeVersion`, `batchUsable` |

## Files

- `packages/shared/src/swarm.ts`: `swarmUpload` (with our batch header) / `swarmDownload`
- `packages/shared/src/crypto.ts`: AES-256-GCM encrypt / decrypt
- `apps/worker/src/pipeline/run.ts`: encrypt → Swarm → Arkiv submission
- `apps/worker/src/main.ts`: `/swarm/:ref/bytes` read-back through our node
- `apps/web/src/app/api/x402/clip/[key]/route.ts`: key released after Hedera settlement
- `scripts/swarm/swarm-fund.ts`, `swarm-fund-node.ts`, `swarm-buy-batch.ts`, `infra/rpc-router/`

## Steps (what happens to one clip)

1. The phone uploads the clip to the worker with a one-time token.
2. Gemini checks it and code decides. If accepted, the worker encrypts with a fresh 32-byte key.
3. The ciphertext is uploaded to our Bee node with our batch, which returns a 64-hex reference.
4. The worker writes `adx.submission` with the reference and sha256, and deletes the raw file.
5. The buyer agent pays over x402, and the response carries the key. Whoever holds the key fetches the ciphertext from Swarm, checks its sha256 against Arkiv and decrypts it. We ran this check by hand for SWM-06; the agent itself stops at receiving the key.

**Proof (07 Nov 00:40 IST, PROOFS SWM-06):** a real 5,693,110-byte ciphertext was fetched back from Swarm. Its sha256 equals the Arkiv `cipherSha256`, and it decrypts with the paid key to the original 5,693,082-byte MP4.

## Friction

Full list with repro steps: [`../docs/sponsors/SWARM-FEEDBACK.md`](../sponsors/SWARM-FEEDBACK.md). The big ones:
- the slim Bee image has no CA certificates;
- free Sepolia RPCs are pruned, so we built an RPC router;
- the public gateway is mainnet-only, so testnet clips are served through our node;
- there's no sBZZ faucet;
- synchronous upload timed out on a light node.
