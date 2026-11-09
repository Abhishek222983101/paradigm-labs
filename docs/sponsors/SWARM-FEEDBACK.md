# Swarm — integration feedback (Paradigm, ETHGlobal Mumbai 2026)

**Track:** Arkiv × Swarm bonus.
**Raw log with timestamps:** [`session-logs/swarm-session.md`](session-logs/swarm-session.md) · **Proofs:** [`PROOFS.md`](PROOFS.md) SWM-01…06

## What we built with Swarm

- Our **own Bee 2.8.3 light node** on Railway (Sepolia, network 10) with **our own postage batch** `c0cc5436…2665` (depth 20).
- Every accepted clip is encrypted by the worker (AES-256-GCM, `iv | ciphertext | tag`) and uploaded to Swarm through our node. The plain 64-hex reference and the ciphertext's sha256 go on the Arkiv submission entity.
- The key stays private until the buyer pays over x402. Clips are served through our node at `worker…/swarm/:ref/bytes`.
- **Proven:** a 5.8 MB real clip was fetched back from Swarm. Its sha256 matches the value on Arkiv and it decrypts to the original MP4.

## Issues we hit

| # | Severity | What happened | Repro | Our workaround | Suggested fix |
|---|---|---|---|---|---|
| S-1 | 🔴 High | **Bee slim image crashes on any HTTPS RPC:** "tls: failed to verify certificate … /etc/ssl/certs/ca-certificates.crt: not a directory". The slim image has no CA bundle | `ethersphere/bee:2.8.3-slim` with `--blockchain-rpc-endpoint=https://…` | Use `ethersphere/bee:2.8.3` (non-slim) | Ship CA certs in slim, or document it |
| S-2 | 🔴 High | **Free Sepolia RPCs can't sync postage.** "could not get blockchain log: pruned history unavailable". The light node needs full `eth_getLogs` history. publicnode is pruned, drpc is paid only, 1rpc allows 50 blocks, blockpi needs a key, blastapi is shut down. Tenderly serves history but returned 429 during chequebook init | Bee light node with `https://ethereum-sepolia-rpc.publicnode.com` | Built `infra/rpc-router`: `eth_getLogs` → Tenderly with backoff, everything else → publicnode | Name a working testnet RPC in the docs, or let Bee use a separate RPC for logs |
| S-3 | 🔴 High (for judges) | **The public gateway can't show testnet data.** `api.gateway.ethswarm.org` serves mainnet, so a clip stored on Sepolia returns 404, and we found no public testnet gateway | Upload via a testnet node → GET `/bytes/<ref>` on the gateway | Serve testnet refs through our own node (worker `/swarm/:ref/bytes`) | A public testnet gateway, or state the mainnet-only limit on the gateway page |
| S-4 | 🟠 Medium | **No sBZZ faucet any more.** The docs say to swap Sepolia ETH on Uniswap | Look for a faucet | Found the WETH/sBZZ 0.3 % pool `0x88A3…eC1b` and scripted a SwapRouter02 swap (0.06 SepETH → 0.297 sBZZ) | A faucet, or a ready-made swap link in the docs |
| S-5 | 🟠 Medium | **Synchronous upload is impractical on a light node.** With `swarm-deferred-upload: false`, 5–6 MB uploads timed out at 120 s. `GET /stewardship/:ref` also timed out | Upload a 5 MB file to a light node with deferred upload off | Back to the default deferred upload. The worker retries only the store step and serves through our node | Docs on expected push times for light nodes, and a way to poll push progress for one reference |
| S-6 | 🟠 Medium | **The gateway ignores `swarm-postage-batch-id`** and stamps with its own batch, so a gateway upload can't prove which batch paid | `POST /bytes` on the gateway with our batch header | Upload through our own node with our batch | Reject or echo the header so it's clear |
| S-7 | 🟡 Low | **Buying a batch with only the wallet.** We called PostageStamp `createBatch` on Sepolia directly from the node's wallet. Depth 20 is the practical minimum (bucket depth 16): 0.2175 sBZZ for 2.9 days | `pnpm swarm:buy-batch` | Script | A small cost calculator in the docs (depth × days → sBZZ) |

## What worked well

- Plain `POST /bytes` / `GET /bytes/:ref` is easy to use from any language. We encrypt client-side, so no key-bearing 128-hex reference ever reaches Arkiv.
- 1, 10 and 30 MB round trips through the gateway were fine (~1 MB/s up, ~3.4 MB/s down) with matching hashes.
- Once synced, the node was stable through the whole event (18 peers, batch usable, 51 h left at the last check).

## Asks

1. A public testnet gateway (S-3).
2. CA certs in the slim image (S-1).
3. A recommended history-serving Sepolia RPC (S-2).
