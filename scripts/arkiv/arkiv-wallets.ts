// Creates one Arkiv signer per role (if missing) into .env, then tops each up with tGLM from the funder.
// Prints addresses only; private keys never leave .env.
// Run: pnpm arkiv:wallets
import { appendFileSync, readFileSync } from "node:fs"
import { createPublicClient, createWalletClient } from "@arkiv-network/sdk"
import { rabdi } from "@arkiv-network/sdk/chains"
import { formatEther, http, isHex, parseEther } from "viem"
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts"

const ROLES = ["ARKIV_PLATFORM_WEB_KEY", "ARKIV_PLATFORM_WORKER_KEY", "ARKIV_VERIFIER_KEY", "ARKIV_BUYER_KEY"]
const TARGET = parseEther(process.env.ARKIV_TOPUP ?? "1")

const envText = readFileSync(".env", "utf8")
for (const name of ROLES) {
  if (!new RegExp(`^${name}=0x[0-9a-fA-F]{64}$`, "m").test(envText)) {
    const k = generatePrivateKey()
    appendFileSync(".env", `\n${name}=${k}`)
    process.env[name] = k
    console.log(`created ${name}`)
  }
}

const chain = rabdi({ accessKey: process.env.ARKIV_ACCESS_KEY ?? "" })
const pub = createPublicClient({ chain, transport: http() })
const funderKey = process.env.ARKIV_FUNDER_PRIVATE_KEY
if (!funderKey || !isHex(funderKey)) throw new Error("ARKIV_FUNDER_PRIVATE_KEY missing")
const funder = createWalletClient({ chain, transport: http(), account: privateKeyToAccount(funderKey) })
console.log(
  "funder",
  funder.account.address,
  formatEther(await pub.getBalance({ address: funder.account.address })),
  "tGLM",
)

for (const name of ROLES) {
  const key = process.env[name]
  if (!key || !isHex(key)) throw new Error(`${name} not loaded`)
  const address = privateKeyToAccount(key).address
  const bal = await pub.getBalance({ address })
  if (bal < TARGET / 2n) {
    const hash = await funder.sendTransaction({ to: address, value: TARGET - bal })
    await pub.waitForTransactionReceipt({ hash })
    console.log(`${name.padEnd(26)} ${address}  funded → tx ${hash}`)
  } else {
    console.log(`${name.padEnd(26)} ${address}  ${formatEther(bal)} tGLM (ok)`)
  }
}
