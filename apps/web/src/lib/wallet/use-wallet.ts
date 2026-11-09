"use client"

// useWallet(): one tiny external store shared by every component. The unlocked key lives only in
// this module's memory for the session; reloading the page locks it again.
import { useSyncExternalStore } from "react"
import type { Hex } from "viem"
import { type PrivateKeyAccount, privateKeyToAccount } from "viem/accounts"
import { createWallet, forgetWallet, loadSealed, type Sealed, unlockWallet } from "./vault"

export type WalletState =
  | { status: "loading" }
  | { status: "none" }
  | { status: "locked"; address: Hex; mode: Sealed["mode"] }
  | { status: "unlocked"; address: Hex; mode: Sealed["mode"] }
  | { status: "unsupported"; reason: string }

let state: WalletState = { status: "loading" }
let sealed: Sealed | undefined
let account: PrivateKeyAccount | undefined
const listeners = new Set<() => void>()
const emit = (s: WalletState) => {
  state = s
  for (const l of listeners) l()
}

let loading: Promise<void> | undefined
/** Load the sealed wallet from this phone once. Every path that needs the wallet awaits this first. */
function boot(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve()
  loading ??= (async () => {
    if (!window.indexedDB || !window.crypto?.subtle) {
      emit({ status: "unsupported", reason: "This browser can't store a wallet. Try Safari or Chrome." })
      return
    }
    try {
      sealed = await loadSealed()
      if (!account)
        emit(sealed ? { status: "locked", address: sealed.address, mode: sealed.mode } : { status: "none" })
    } catch {
      emit({ status: "unsupported", reason: "Private browsing blocks wallet storage. Open a normal tab." })
    }
  })()
  return loading
}

function subscribe(l: () => void) {
  listeners.add(l)
  void boot()
  return () => listeners.delete(l)
}

/** Create (if needed) and unlock, then return the account. One tap on first use. */
export async function ensureAccount(): Promise<PrivateKeyAccount> {
  if (account) return account
  await boot() // never create a second wallet: always look for the one already on this phone first
  if (state.status === "unsupported") throw new Error(state.reason)
  if (!sealed) {
    const created = await createWallet()
    sealed = created.sealed
    account = privateKeyToAccount(created.privateKey)
  } else {
    account = privateKeyToAccount(await unlockWallet(sealed))
  }
  emit({ status: "unlocked", address: account.address, mode: sealed.mode })
  return account
}

/** Remove the wallet from this phone (demo reset). The keys are gone for good on this device. */
export async function resetWallet(): Promise<void> {
  await boot()
  await forgetWallet()
  sealed = undefined
  account = undefined
  emit({ status: "none" })
}

export function useWallet() {
  const s = useSyncExternalStore(
    subscribe,
    () => state,
    () => ({ status: "loading" }) as WalletState,
  )
  return { ...s, ensureAccount }
}
