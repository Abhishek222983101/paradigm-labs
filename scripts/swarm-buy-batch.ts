// Buys our own Swarm postage batch directly on-chain (PostageStamp on Sepolia), owned by our Bee
// node's address, so the node picks it up from its postage sync. No Bee admin API needed.
// Run: pnpm swarm:buy-batch   [DEPTH=20] [SPEND_SBZZ=all]
import { createPublicClient, createWalletClient, formatUnits, http, keccak256, parseAbi, toHex } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { sepolia } from "viem/chains"

const RPC = process.env.SEPOLIA_RPC_URL ?? "https://ethereum-sepolia-rpc.publicnode.com"
const SBZZ = "0x543dDb01Ba47acB11de34891cD86B675F04840db"
const POSTAGE = "0xcdfdC3752caaA826fE62531E0000C40546eC56A6"
const DEPTH = Number(process.env.DEPTH ?? 20)
const BUCKET_DEPTH = 16
const BLOCK_SECONDS = 12

const acct = privateKeyToAccount(process.env.SWARM_FUNDER_PRIVATE_KEY as `0x${string}`) // == Bee node address
const pub = createPublicClient({ chain: sepolia, transport: http(RPC) })
const w = createWalletClient({ chain: sepolia, transport: http(RPC), account: acct })
const erc20 = parseAbi([
  "function balanceOf(address) view returns (uint256)",
  "function approve(address,uint256) returns (bool)",
])
const ps = parseAbi([
  "function lastPrice() view returns (uint64)",
  "function createBatch(address _owner,uint256 _initialBalancePerChunk,uint8 _depth,uint8 _bucketDepth,bytes32 _nonce,bool _immutable)",
  "event BatchCreated(bytes32 indexed batchId,uint256 totalAmount,uint256 normalisedBalance,address owner,uint8 depth,uint8 bucketDepth,bool immutableFlag)",
])

const bal = await pub.readContract({
  address: SBZZ,
  abi: erc20,
  functionName: "balanceOf",
  args: [acct.address],
})
const price = await pub.readContract({ address: POSTAGE, abi: ps, functionName: "lastPrice" })
const chunks = 1n << BigInt(DEPTH)
const perChunk = bal / chunks
const days = (Number(perChunk / price) * BLOCK_SECONDS) / 86400
console.log(`owner ${acct.address} · ${formatUnits(bal, 16)} sBZZ · price ${price}/chunk/block`)
console.log(`depth ${DEPTH} → ${perChunk} PLUR/chunk ≈ ${days.toFixed(2)} days`)

const approve = await w.writeContract({
  address: SBZZ,
  abi: erc20,
  functionName: "approve",
  args: [POSTAGE, perChunk * chunks],
})
await pub.waitForTransactionReceipt({ hash: approve })
const nonce = keccak256(toHex(`adx-${Date.now()}`))
const hash = await w.writeContract({
  address: POSTAGE,
  abi: ps,
  functionName: "createBatch",
  args: [acct.address, perChunk, DEPTH, BUCKET_DEPTH, nonce, true],
})
const rcpt = await pub.waitForTransactionReceipt({ hash })
const { parseEventLogs } = await import("viem")
const ev = parseEventLogs({ abi: ps, logs: rcpt.logs, eventName: "BatchCreated" })[0]
console.log(`batch created · https://sepolia.etherscan.io/tx/${hash}`)
console.log(`SWARM_BATCH_ID=${ev?.args.batchId.slice(2)}`)
