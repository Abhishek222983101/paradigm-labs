// P2.4 spike: create a contributor account from a fresh viem key (as the phone would), with unlimited
// auto-associations, then send it 0.01 USDC from the merchant with no association step.
// Run: pnpm hedera:alias-spike
import { ensureContributorAccount, MIRROR, operatorClient } from "@adx/shared/hedera"
import { AccountId, PrivateKey, TokenId, TransferTransaction } from "@hiero-ledger/sdk"
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts"

const acct = privateKeyToAccount(generatePrivateKey())
console.log("wallet", acct.address)
const t0 = Date.now()
const { accountId, txId } = await ensureContributorAccount(acct.publicKey, acct.address)
console.log(`account ${accountId} (${Date.now() - t0} ms) create tx ${txId}`)
console.log(`  https://hashscan.io/testnet/account/${accountId}`)

const merchant = AccountId.fromString(process.env.HEDERA_MERCHANT_ID ?? "")
const merchantKey = PrivateKey.fromStringECDSA(process.env.HEDERA_MERCHANT_KEY ?? "")
const usdc = TokenId.fromString(process.env.HEDERA_USDC_TOKEN_ID ?? "0.0.429274")
const c = operatorClient()
const tx = await new TransferTransaction()
  .addTokenTransfer(usdc, merchant, -10_000)
  .addTokenTransfer(usdc, AccountId.fromString(accountId), 10_000)
  .freezeWith(c)
  .sign(merchantKey)
const res = await tx.execute(c)
const receipt = await res.getReceipt(c)
console.log(`0.01 USDC → ${accountId}: ${receipt.status} tx ${res.transactionId}`)
console.log(`  https://hashscan.io/testnet/transaction/${res.transactionId}`)
await new Promise((r) => setTimeout(r, 5000))
const bal = await fetch(`${MIRROR}/accounts/${accountId}/tokens?token.id=${usdc}`).then((r) => r.json())
console.log("mirror USDC balance:", JSON.stringify(bal.tokens))
process.exit(0)
