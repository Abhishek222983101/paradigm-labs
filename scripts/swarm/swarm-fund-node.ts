// Sends Sepolia ETH (gas) and all sBZZ from our Swarm funding wallet to the Bee node's wallet.
// Run: BEE_NODE_ADDRESS=0x... pnpm swarm:fund-node   [NODE_ETH=0.04]
import {
  createPublicClient,
  createWalletClient,
  formatEther,
  formatUnits,
  http,
  parseAbi,
  parseEther,
} from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { sepolia } from "viem/chains"

const RPC = process.env.SEPOLIA_RPC_URL ?? "https://ethereum-sepolia-rpc.publicnode.com"
const SBZZ = "0x543dDb01Ba47acB11de34891cD86B675F04840db"
const node = process.env.BEE_NODE_ADDRESS as `0x${string}`
if (!node) throw new Error("BEE_NODE_ADDRESS missing")
const funder = privateKeyToAccount(process.env.SWARM_FUNDER_PRIVATE_KEY as `0x${string}`)
const pub = createPublicClient({ chain: sepolia, transport: http(RPC) })
const w = createWalletClient({ chain: sepolia, transport: http(RPC), account: funder })
const erc20 = parseAbi([
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address,uint256) returns (bool)",
])

const eth = await w.sendTransaction({ to: node, value: parseEther(process.env.NODE_ETH ?? "0.04") })
await pub.waitForTransactionReceipt({ hash: eth })
console.log(`ETH -> node · https://sepolia.etherscan.io/tx/${eth}`)
const bal = await pub.readContract({
  address: SBZZ,
  abi: erc20,
  functionName: "balanceOf",
  args: [funder.address],
})
const tx = await w.writeContract({ address: SBZZ, abi: erc20, functionName: "transfer", args: [node, bal] })
await pub.waitForTransactionReceipt({ hash: tx })
console.log(`${formatUnits(bal, 16)} sBZZ -> node · https://sepolia.etherscan.io/tx/${tx}`)
console.log(
  "node:",
  formatEther(await pub.getBalance({ address: node })),
  "SepETH,",
  formatUnits(
    await pub.readContract({ address: SBZZ, abi: erc20, functionName: "balanceOf", args: [node] }),
    16,
  ),
  "sBZZ",
)
