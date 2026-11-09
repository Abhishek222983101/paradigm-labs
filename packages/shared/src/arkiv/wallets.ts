// Public writer addresses, one per role (created by scripts/arkiv/arkiv-wallets.ts, 6 Nov 2026).
// These are public on purpose: every read filters by them, so nobody can spoof our entities
// by writing their own `adx.task` (security §15 "Fake entities with our schema names").
import type { Address } from "viem"

export type Role = "web" | "worker" | "verifier" | "buyer"

const g = globalThis as { process?: { env?: Record<string, string | undefined> } }
const e = (name: string) => g.process?.env?.[name] as Address | undefined

export const WRITERS: Record<Role, Address> = {
  web: e("ARKIV_PLATFORM_WEB_ADDRESS") ?? "0x2dEc12a23ec38830f7f314B33b144D4d1fe4D98C",
  worker: e("ARKIV_PLATFORM_WORKER_ADDRESS") ?? "0xCDFa94802dEEAaf2ce7E694F2d16BE2628d52A51",
  verifier: e("ARKIV_VERIFIER_ADDRESS") ?? "0x0C736210492F8d86A1Fe4297cD7A5804ed48F421",
  buyer: e("ARKIV_BUYER_ADDRESS") ?? "0x0F00CFF8dae364c5d7c0840A2C92DFc7d087Dcc6",
}

export const ROLE_KEY_ENV: Record<Role, string> = {
  web: "ARKIV_PLATFORM_WEB_KEY",
  worker: "ARKIV_PLATFORM_WORKER_KEY",
  verifier: "ARKIV_VERIFIER_KEY",
  buyer: "ARKIV_BUYER_KEY",
}
