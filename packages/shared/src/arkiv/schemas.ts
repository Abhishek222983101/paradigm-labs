// The 8 Paradigm entity types on Arkiv (system architecture §10.1).
// Everything here is PUBLIC. Secrets, nullifiers, AES keys and PII never go in these columns (see guard.ts).
// Arkiv limits checked in SDK 1.0.1 source: str ≤ 128 bytes, ≤ 32 attributes, entity ≤ 128 KiB.
import { addr, bytes, dec, defineSchema, key, str, u64 } from "@arkiv-network/sdk/schema"

export function makeSchemas(ns: string) {
  return {
    /** A verifier advertising its x402 endpoint. Owner: verifier wallet. Expiry 24 h, heartbeat-extended. */
    Verifier: defineSchema(`${ns}.verifier`, {
      skill: str().indexed(),
      status: str().indexed(),
      price: dec().indexed(),
      endpoint: str(),
      payTo: str(),
      model: str(),
    }),
    /** A data request posted by a buyer agent. Owner: buyer wallet. Expiry = deadline. */
    Task: defineSchema(`${ns}.task`, {
      status: str().indexed(),
      skill: str().indexed(),
      reward: dec().indexed(),
      slots: u64().indexed(),
      filled: u64().indexed(),
      deadline: u64().indexed(), // unix seconds
      title: str(),
      failureTag: str(),
      rubricRef: str(), // Swarm reference of the public rubric JSON
      rubricHash: str(), // sha256 of the rubric JSON (same bytes as `rubric`)
      rubric: bytes(), // the rubric JSON itself, so the board never depends on a gateway
    }),
    /** One verified human holding one slot. Owner: platform-web. Expiry 2 h, 24 h after submit. */
    Claim: defineSchema(`${ns}.claim`, {
      task: key().indexed(),
      status: str().indexed(),
      slot: u64().indexed(),
      claimant: str(), // fresh pseudonym per claim (not the wallet, not the nullifier)
      challenge: str(), // "word:fingers" — shown on camera, not secret
    }),
    /** An uploaded clip. Owner: platform-worker. Expiry 30 d. */
    Submission: defineSchema(`${ns}.submission`, {
      task: key().indexed(),
      claim: key().indexed(),
      status: str().indexed(),
      dhashA: str().indexed(),
      dhashB: str().indexed(),
      dhashC: str().indexed(),
      dhash: str(),
      swarmRef: str(), // ciphertext only
      cipherSha256: str(),
      durationMs: u64(),
    }),
    /** The AI verdict with timestamped evidence. Owner: verifier. Expiry 180 d. */
    Verification: defineSchema(`${ns}.verification`, {
      submission: key().indexed(),
      task: key().indexed(),
      verdict: str().indexed(),
      score: u64().indexed(),
      model: str(),
      rubricHash: str(),
      evidence: bytes(),
      evidenceHash: str(),
    }),
    /** Written only after x402 settlement. Owner: verifier. Expiry 180 d. */
    Receipt: defineSchema(`${ns}.receipt`, {
      task: key().indexed(),
      submission: key().indexed(),
      mode: str().indexed(), // live | simulated — never show simulated as real
      network: str().indexed(),
      hederaTx: str(),
      usdc: dec(),
      payTo: str(),
      approval: str(),
    }),
    /** Contributor-owned, withdrawable licence. Creator: platform-web, owner: contributor. Expiry 90 d. */
    Licence: defineSchema(`${ns}.licence`, {
      submission: key().indexed(),
      task: key().indexed(),
      licensee: addr().indexed(),
      status: str().indexed(),
      scope: str(),
      termsHash: str(),
    }),
    /** Dataset manifest with distinct-human count. Owner: buyer. Expiry 180 d. */
    Manifest: defineSchema(`${ns}.manifest`, {
      skill: str().indexed(),
      version: u64().indexed(),
      samples: u64(),
      humans: u64(),
      swarmRef: str(),
    }),
  } as const
}

export type Schemas = ReturnType<typeof makeSchemas>

const g = globalThis as { process?: { env?: Record<string, string | undefined> } }
export const ARKIV_NS = g.process?.env?.ARKIV_NS ?? "adx"
export const S: Schemas = makeSchemas(ARKIV_NS)

/** Task statuses. */
export const TASK_STATUS = ["open", "filled", "closed"] as const
export const CLAIM_STATUS = ["active", "submitted", "expired"] as const
export const SUBMISSION_STATUS = ["accepted", "rejected", "review", "duplicate"] as const
export const VERDICT = ["accept", "reject", "review"] as const
