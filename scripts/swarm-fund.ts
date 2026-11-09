// Funds our Swarm stack on Sepolia, all self-serve:
//   1. moves Sepolia ETH from the donor wallet to our Swarm funding wallet
//   2. swaps Sepolia ETH -> sBZZ on Uniswap v3 (WETH/sBZZ 0.3% pool) from the funding wallet
// Run: pnpm swarm:fund   [SWAP_ETH=0.06] [KEEP_DONOR_ETH=0.005]
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
const WETH = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14"
const SBZZ = "0x543dDb01Ba47acB11de34891cD86B675F04840db"
const ROUTER = "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E" // Uniswap SwapRouter02 (Sepolia)
const QUOTER = "0xEd1f6473345F45b75F8179591dd5bA1888cf2FB3" // Uniswap QuoterV2 (Sepolia)
const FEE = 3000

const pub = createPublicClient({ chain: sepolia, transport: http(RPC) })
const donor = privateKeyToAccount(process.env.SEPOLIA_DONOR_PRIVATE_KEY as `0x${string}`)
const funder = privateKeyToAccount(process.env.SWARM_FUNDER_PRIVATE_KEY as `0x${string}`)
const erc20 = parseAbi(["function balanceOf(address) view returns (uint256)"])

// 1. donor -> funder
const keep = parseEther(process.env.KEEP_DONOR_ETH ?? "0.005")
const donorBal = await pub.getBalance({ address: donor.address })
if (donorBal > keep + parseEther("0.001")) {
  const w = createWalletClient({ chain: sepolia, transport: http(RPC), account: donor })
  const gas = 21000n * ((await pub.getGasPrice()) * 2n)
  const value = donorBal - keep - gas
  const hash = await w.sendTransaction({ to: funder.address, value })
  await pub.waitForTransactionReceipt({ hash })
  console.log(`moved ${formatEther(value)} SepETH donor -> funder · https://sepolia.etherscan.io/tx/${hash}`)
}
console.log(
  "funder",
  funder.address,
  formatEther(await pub.getBalance({ address: funder.address })),
  "SepETH",
)

// 2. swap ETH -> sBZZ (router wraps ETH sent as value)
const amountIn = parseEther(process.env.SWAP_ETH ?? "0.06")
const quoter = parseAbi([
  "function quoteExactInputSingle((address tokenIn,address tokenOut,uint256 amountIn,uint24 fee,uint160 sqrtPriceLimitX96)) returns (uint256 amountOut,uint160,uint32,uint256)",
])
const { result } = await pub.simulateContract({
  address: QUOTER,
  abi: quoter,
  functionName: "quoteExactInputSingle",
  args: [{ tokenIn: WETH, tokenOut: SBZZ, amountIn, fee: FEE, sqrtPriceLimitX96: 0n }],
})
const quoted = result[0]
console.log(`quote: ${formatEther(amountIn)} SepETH -> ${formatUnits(quoted, 16)} sBZZ`)

const router = parseAbi([
  "function exactInputSingle((address tokenIn,address tokenOut,uint24 fee,address recipient,uint256 amountIn,uint256 amountOutMinimum,uint160 sqrtPriceLimitX96)) payable returns (uint256)",
])
const fw = createWalletClient({ chain: sepolia, transport: http(RPC), account: funder })
const hash = await fw.writeContract({
  address: ROUTER,
  abi: router,
  functionName: "exactInputSingle",
  args: [
    {
      tokenIn: WETH,
      tokenOut: SBZZ,
      fee: FEE,
      recipient: funder.address,
      amountIn,
      amountOutMinimum: (quoted * 97n) / 100n, // 3% slippage guard
      sqrtPriceLimitX96: 0n,
    },
  ],
  value: amountIn,
})
await pub.waitForTransactionReceipt({ hash })
const sbzz = await pub.readContract({
  address: SBZZ,
  abi: erc20,
  functionName: "balanceOf",
  args: [funder.address],
})
console.log(`swapped · https://sepolia.etherscan.io/tx/${hash}`)
console.log(
  "funder now:",
  formatEther(await pub.getBalance({ address: funder.address })),
  "SepETH,",
  formatUnits(sbzz, 16),
  "sBZZ",
)
