// Embedded contributor wallet (system architecture §13.1).
// A secp256k1 key generated on the phone, sealed with AES-GCM and stored in IndexedDB.
//   mode "passkey": the AES key comes from the passkey's PRF output via HKDF, so the wallet only opens
//                   after Face ID / fingerprint. Nothing usable is stored on the device by itself.
//   mode "device":  fallback when PRF isn't available: a non-extractable WebCrypto key kept in IndexedDB.
//                   Bound to this browser; JavaScript can use it but can never read it out.
// The same key is the contributor's Arkiv owner address (licences) and a Hedera ECDSA alias (payouts).
import type { Hex } from "viem"
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts"
import { idbDelete, idbGet, idbSet } from "./store"

const RECORD = "sealed-v1"
const PRF_SALT = new TextEncoder().encode("paradigm/wallet/prf/v1")
const HKDF_INFO = new TextEncoder().encode("paradigm wallet seal v1")

export type Sealed = {
  v: 1
  mode: "passkey" | "device"
  address: Hex
  iv: Uint8Array
  ct: Uint8Array
  credentialId?: Uint8Array
  deviceKey?: CryptoKey
  createdAt: number
}

const buf = (u: Uint8Array) => u.buffer.slice(u.byteOffset, u.byteOffset + u.byteLength) as ArrayBuffer

async function aesFromPrf(prf: ArrayBuffer): Promise<CryptoKey> {
  const ikm = await crypto.subtle.importKey("raw", prf, "HKDF", false, ["deriveKey"])
  return crypto.subtle.deriveKey(
    { name: "HKDF", hash: "SHA-256", salt: buf(PRF_SALT), info: buf(HKDF_INFO) },
    ikm,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  )
}

async function seal(key: CryptoKey, pk: Hex) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const plain = new TextEncoder().encode(pk)
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plain))
  plain.fill(0)
  return { iv, ct }
}

async function unseal(key: CryptoKey, iv: Uint8Array, ct: Uint8Array): Promise<Hex> {
  const plain = new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv: buf(iv) }, key, buf(ct)))
  const pk = new TextDecoder().decode(plain) as Hex
  plain.fill(0)
  return pk
}

type PrfResults = { prf?: { enabled?: boolean; results?: { first?: ArrayBuffer } } }

async function passkeyCreate(address: Hex): Promise<{ credentialId: Uint8Array; prf?: ArrayBuffer } | null> {
  if (!window.PublicKeyCredential || !navigator.credentials?.create) return null
  try {
    const cred = (await navigator.credentials.create({
      publicKey: {
        rp: { name: "Paradigm", id: location.hostname },
        user: {
          id: crypto.getRandomValues(new Uint8Array(16)),
          name: `Paradigm ${address.slice(0, 8)}`,
          displayName: "Paradigm wallet",
        },
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        pubKeyCredParams: [
          { type: "public-key", alg: -7 },
          { type: "public-key", alg: -257 },
        ],
        authenticatorSelection: { residentKey: "preferred", userVerification: "required" },
        timeout: 60_000,
        extensions: { prf: { eval: { first: PRF_SALT } } } as AuthenticationExtensionsClientInputs,
      },
    })) as PublicKeyCredential | null
    if (!cred) return null
    const ext = cred.getClientExtensionResults() as PrfResults
    if (!ext.prf?.enabled && !ext.prf?.results?.first) return null
    return { credentialId: new Uint8Array(cred.rawId), prf: ext.prf?.results?.first }
  } catch {
    return null // user cancelled or no platform authenticator: fall back to device mode
  }
}

async function passkeyPrf(credentialId: Uint8Array): Promise<ArrayBuffer> {
  const cred = (await navigator.credentials.get({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      allowCredentials: [{ type: "public-key", id: buf(credentialId) }],
      userVerification: "required",
      timeout: 60_000,
      extensions: { prf: { eval: { first: PRF_SALT } } } as AuthenticationExtensionsClientInputs,
    },
  })) as PublicKeyCredential | null
  const first = (cred?.getClientExtensionResults() as PrfResults | undefined)?.prf?.results?.first
  if (!first) throw new Error("This passkey can't unlock the wallet on this browser")
  return first
}

export async function loadSealed(): Promise<Sealed | undefined> {
  return idbGet<Sealed>(RECORD)
}

/** Create a wallet. Tries a passkey with PRF first, falls back to a device-bound key. */
export async function createWallet(): Promise<{ sealed: Sealed; privateKey: Hex }> {
  const privateKey = generatePrivateKey()
  const address = privateKeyToAccount(privateKey).address
  let sealed: Sealed | undefined

  const pk = await passkeyCreate(address)
  if (pk) {
    const prf = pk.prf ?? (await passkeyPrf(pk.credentialId).catch(() => undefined))
    if (prf) {
      const { iv, ct } = await seal(await aesFromPrf(prf), privateKey)
      sealed = {
        v: 1,
        mode: "passkey",
        address,
        iv,
        ct,
        credentialId: pk.credentialId,
        createdAt: Date.now(),
      }
    }
  }
  if (!sealed) {
    const deviceKey = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, [
      "encrypt",
      "decrypt",
    ])
    const { iv, ct } = await seal(deviceKey, privateKey)
    sealed = { v: 1, mode: "device", address, iv, ct, deviceKey, createdAt: Date.now() }
  }
  await idbSet(RECORD, sealed)
  return { sealed, privateKey }
}

/** Decrypt the key for this session (passkey mode asks for Face ID / fingerprint). */
export async function unlockWallet(sealed: Sealed): Promise<Hex> {
  if (sealed.mode === "device") {
    if (!sealed.deviceKey) throw new Error("Wallet key missing on this device")
    return unseal(sealed.deviceKey, sealed.iv, sealed.ct)
  }
  if (!sealed.credentialId) throw new Error("Wallet passkey missing")
  const key = await aesFromPrf(await passkeyPrf(sealed.credentialId))
  return unseal(key, sealed.iv, sealed.ct)
}

export async function forgetWallet(): Promise<void> {
  await idbDelete(RECORD)
}
