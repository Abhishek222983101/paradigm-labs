// Creates the role accounts on Hedera testnet from the operator, associates testnet USDC
// with every account, and appends the new IDs/keys to .env. Idempotent: roles already in
// .env are only checked, not recreated.
// Run: pnpm hedera:setup
import { appendFileSync } from "node:fs"
import {
  AccountCreateTransaction,
  AccountId,
  Client,
  Hbar,
  PrivateKey,
  TokenAssociateTransaction,
  TokenId,
} from "@hiero-ledger/sdk"

const env = process.env
const operatorId = AccountId.fromString(must("HEDERA_OPERATOR_ID"))
const operatorKey = PrivateKey.fromStringECDSA(must("HEDERA_OPERATOR_KEY"))
const usdc = TokenId.fromString(env.HEDERA_USDC_TOKEN_ID ?? "0.0.429274")
const client = Client.forTestnet().setOperator(operatorId, operatorKey)

const ROLES = [
  { role: "BUYER", hbar: 40 }, // buyer agent: pays x402 requests
  { role: "MERCHANT", hbar: 20 }, // x402 payTo for the ADX endpoint
  { role: "CONTRIBUTOR_1", hbar: 10 }, // demo contributor (phone 1)
  { role: "CONTRIBUTOR_2", hbar: 10 }, // demo contributor (phone 2)
] as const

function must(name: string): string {
  const v = env[name]
  if (!v) throw new Error(`${name} missing in .env`)
  return v
}

// AccountBalanceQuery is deprecated in SDK 2.90 (throws), so ask the mirror node.
async function hasUsdc(id: AccountId): Promise<boolean> {
  const url = `https://testnet.mirrornode.hedera.com/api/v1/accounts/${id}/tokens?token.id=${usdc}`
  const res = await fetch(url)
  if (res.status === 404) return false // brand-new account not yet on the mirror node
  const body = (await res.json()) as { tokens?: unknown[] }
  return (body.tokens?.length ?? 0) > 0
}

async function associate(id: AccountId, key: PrivateKey) {
  if (await hasUsdc(id)) return "already associated"
  const tx = await new TokenAssociateTransaction()
    .setAccountId(id)
    .setTokenIds([usdc])
    .freezeWith(client)
    .sign(key)
  const res = await tx.execute(client)
  const receipt = await res.getReceipt(client)
  return `${receipt.status.toString()} tx ${res.transactionId.toString()}`
}

console.log("operator", operatorId.toString(), "USDC:", await associate(operatorId, operatorKey))

for (const { role, hbar } of ROLES) {
  const idVar = `HEDERA_${role}_ID`
  const keyVar = `HEDERA_${role}_KEY`
  if (env[idVar] && env[keyVar]) {
    const id = AccountId.fromString(env[idVar]!)
    const key = PrivateKey.fromStringECDSA(env[keyVar]!)
    console.log(role, id.toString(), "exists · USDC:", await associate(id, key))
    continue
  }
  const key = PrivateKey.generateECDSA()
  const res = await new AccountCreateTransaction()
    .setECDSAKeyWithAlias(key)
    .setInitialBalance(new Hbar(hbar))
    .setAccountMemo(`ADX ${role.toLowerCase()}`)
    .execute(client)
  const receipt = await res.getReceipt(client)
  const id = receipt.accountId!
  const evm = `0x${key.publicKey.toEvmAddress()}`
  appendFileSync(
    ".env",
    `${idVar}=${id.toString()}\n${keyVar}=0x${key.toStringRaw()}\nHEDERA_${role}_EVM=${evm}\n`,
    { mode: 0o600 },
  )
  console.log(role, "created", id.toString(), evm, "· USDC:", await associate(id, key))
}

client.close()
console.log("done. Fund USDC at https://faucet.circle.com (Hedera Testnet) for the BUYER account.")
