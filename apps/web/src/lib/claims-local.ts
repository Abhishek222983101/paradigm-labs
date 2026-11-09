"use client"

// Claims this phone holds, so Record can resume after a reload. Public data only (no secrets):
// the upload token is single-use, short-lived, and only lets you upload to your own claim.
import type { ClaimResponse } from "@adx/shared/claim"

const KEY = "paradigm.claims.v1"

export type LocalClaim = ClaimResponse & { title: string; savedAt: number }

export function readClaims(): LocalClaim[] {
  try {
    const all = JSON.parse(localStorage.getItem(KEY) ?? "[]") as LocalClaim[]
    const cutoff = Date.now() - 2 * 60 * 60 * 1000
    return all.filter((c) => c.savedAt > cutoff)
  } catch {
    return []
  }
}

export function saveClaim(c: LocalClaim) {
  const rest = readClaims().filter((x) => x.claimKey !== c.claimKey)
  localStorage.setItem(KEY, JSON.stringify([c, ...rest].slice(0, 10)))
}

export function claimFor(claimKey: string): LocalClaim | undefined {
  return readClaims().find((c) => c.claimKey.toLowerCase() === claimKey.toLowerCase())
}

export function dropClaim(claimKey: string) {
  localStorage.setItem(KEY, JSON.stringify(readClaims().filter((c) => c.claimKey !== claimKey)))
}
