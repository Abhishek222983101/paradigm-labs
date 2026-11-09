// Pipeline events shared by worker (writes), web (SSE + status page) and agent (console feed).
// Browser-safe: types and constants only.

export const PIPELINE_STEPS = [
  { id: "received", label: "Clip received" },
  { id: "probe", label: "Length and sound checked" },
  { id: "fingerprint", label: "Fingerprint taken" },
  { id: "dedup", label: "Checked against every clip on Arkiv" },
  { id: "verdict", label: "AI watched the clip" },
  { id: "encrypt", label: "Encrypted" },
  { id: "store", label: "Stored on Swarm" },
  { id: "publish", label: "Published to Arkiv" },
] as const

export type PipelineStepId = (typeof PIPELINE_STEPS)[number]["id"] | "done"

export type PipelineEvent = {
  id: number
  step: PipelineStepId
  ok: boolean
  ms: number | null
  at: string
  /** Public, display-safe details only (refs, keys, reasons). Never secrets. */
  data?: {
    reason?: string
    swarmRef?: string
    submissionKey?: string
    verificationKey?: string
    duplicateOf?: string
    verdict?: Verdict | "duplicate"
    score?: number
    summary?: VerdictSummary
    submissionTx?: string
    verificationTx?: string
  }
}

export type Verdict = "accept" | "reject" | "review"

export type StepEvidence = {
  name: string
  label: string
  status: "done" | "not_done" | "not_visible"
  t: string | null
  evidence: string
}

export type VerdictSummary = {
  verdict: Verdict
  score: number
  reason: string
  liveness: { word: string; wordHeard: string; fingers: number; fingersShown: number | null }
  steps: StepEvidence[]
}
