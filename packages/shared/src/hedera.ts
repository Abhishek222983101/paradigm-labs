// Hedera helpers (server only). Contributor accounts are created from the embedded wallet's public key
// as an ECDSA alias with unlimited auto-associations, so USDC can arrive without the contributor
// signing a token association (system architecture §13.1 step 4).
import { AccountCreateTransaction, AccountId, Client, Hbar, PrivateKey, PublicKey } from "@hiero-ledger/sdk"

export const MIRROR = "https://testnet.mirrornode.hedera.com/api/v1"

let client: Client | undefined
export function operatorClient(): Client {
  if (client) return client
  const id = process.env.HEDERA_OPERATOR_ID
  const key = process.env.HEDERA_OPERATOR_KEY
  if (!id || !key) throw new Error("HEDERA_OPERATOR_ID / HEDERA_OPERATOR_KEY not set")
  client = Client.forTestnet().setOperator(AccountId.fromString(id), PrivateKey.fromStringECDSA(key))
  client.setRequestTimeout(20_000)
  return client
}

/** 0x04‖x‖y (65 bytes, viem's format) → 0x02/03‖x (33 bytes, what Hiero accepts). */
export function compressSecp256k1(publicKeyHex: string): Uint8Array {
  const raw = Buffer.from(publicKeyHex.replace(/^0x/, ""), "hex")
  if (raw.length === 33 && (raw[0] === 2 || raw[0] === 3)) return raw
  if (raw.length !== 65 || raw[0] !== 4) throw new Error("expected an uncompressed secp256k1 public key")
  const yOdd = ((raw[64] as number) & 1) === 1
  return Buffer.concat([Buffer.from([yOdd ? 3 : 2]), raw.subarray(1, 33)])
}

/** Account already behind this EVM alias? (Mirror Node; null if none.) */
export async function accountForEvm(evm: string): Promise<string | null> {
  const r = await fetch(`${MIRROR}/accounts/${evm.toLowerCase()}`, { signal: AbortSignal.timeout(8000) })
  if (r.status === 404) return null
  if (!r.ok) throw new Error(`mirror ${r.status}`)
  const j = (await r.json()) as { account?: string }
  return j.account ?? null
}

/**
 * Create (or find) the contributor's Hedera account for an uncompressed secp256k1 public key (0x04…).
 * Returns the 0.0.x account id and the transaction id (null if it already existed).
 */
export async function ensureContributorAccount(
  publicKeyHex: string,
  evmAddress: string,
): Promise<{ accountId: string; txId: string | null }> {
  const existing = await accountForEvm(evmAddress).catch(() => null)
  if (existing) return { accountId: existing, txId: null }
  const pub = PublicKey.fromBytesECDSA(compressSecp256k1(publicKeyHex))
  const c = operatorClient()
  const res = await new AccountCreateTransaction()
    .setECDSAKeyWithAlias(pub)
    .setMaxAutomaticTokenAssociations(-1)
    .setInitialBalance(new Hbar(0))
    .setAccountMemo("Paradigm contributor")
    .execute(c)
  const receipt = await res.getReceipt(c)
  if (!receipt.accountId) throw new Error("account create returned no account id")
  return { accountId: receipt.accountId.toString(), txId: res.transactionId.toString() }
}
