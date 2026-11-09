// The exact strings both the phone and the server build for a claim. Browser-safe.
// signal  → bound into the World ID proof, so a proof can't be reused for another task or wallet.
// message → signed by the embedded wallet, so the server knows the caller controls that wallet.

export function claimSignal(taskKey: string, wallet: string): string {
  return `${taskKey.toLowerCase()}:${wallet.toLowerCase()}`
}

export function claimMessage(taskKey: string, wallet: string, nonce: string): string {
  return [
    "Paradigm: claim a slot",
    `task: ${taskKey.toLowerCase()}`,
    `wallet: ${wallet.toLowerCase()}`,
    `nonce: ${nonce}`,
  ].join("\n")
}

export type ClaimResponse = {
  claimKey: string
  taskKey: string
  challenge: { word: string; fingers: number }
  slot: number
  upload: { url: string | null; token: string; expiresAt: string }
  resumed: boolean
}

export type ApiError = { error: { code: string; message: string } }
