// Arkiv clients. Server-side only: the access key and role keys must never reach a browser bundle.
import { createPublicClient, createWalletClient } from "@arkiv-network/sdk"
import { rabdi } from "@arkiv-network/sdk/chains"
import { http, isHex } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { ROLE_KEY_ENV, type Role } from "./wallets"

function chain() {
  const accessKey = process.env.ARKIV_ACCESS_KEY
  if (!accessKey) throw new Error("ARKIV_ACCESS_KEY is not set")
  return rabdi({ accessKey })
}

let pub: ReturnType<typeof makePublic> | undefined
function makePublic() {
  return createPublicClient({
    chain: chain(),
    // no-store: the RPC URL carries our access key; never let a framework fetch cache persist it.
    transport: http(undefined, { timeout: 20_000, retryCount: 2, fetchOptions: { cache: "no-store" } }),
  })
}
/** Shared read client (uses our access key for rate limits). */
export function arkivPublic() {
  pub ??= makePublic()
  return pub
}
export type ArkivPublic = ReturnType<typeof arkivPublic>

function makeWallet(role: Role) {
  const name = ROLE_KEY_ENV[role]
  const key = process.env[name]
  if (!key || !isHex(key) || key.length !== 66) throw new Error(`${name} is not set`)
  return createWalletClient({
    chain: chain(),
    transport: http(undefined, { timeout: 30_000, retryCount: 0, fetchOptions: { cache: "no-store" } }),
    account: privateKeyToAccount(key),
  })
}
export type ArkivWallet = ReturnType<typeof makeWallet>

const wallets = new Map<Role, ArkivWallet>()
/** Raw wallet client for a role. Do not call writes on it directly: use writer.ts (guard + queue). */
export function walletFor(role: Role): ArkivWallet {
  let w = wallets.get(role)
  if (!w) {
    w = makeWallet(role)
    wallets.set(role, w)
  }
  return w
}
