// Verdict contract (system architecture §11.2). The AI only reports what it saw, in a strict schema;
// this file decides. "not_visible" / "not_audible" are always allowed, so the model never has to guess.
// Browser-safe: pure functions, no I/O.
import { z } from "zod"
import type { StepEvidence, Verdict, VerdictSummary } from "./events"
import type { Rubric } from "./rubric"

export const aiReportSchema = z.object({
  liveness: z.object({
    word_heard: z.string().max(40), // the word spoken, lowercase, or "not_audible"
    fingers_shown: z.number().int().min(-1).max(10), // -1 = not visible
  }),
  steps: z
    .array(
      z.object({
        name: z.string().max(40),
        status: z.enum(["done", "not_done", "not_visible"]),
        t: z.string().max(8), // "mm:ss" or ""
        evidence: z.string().max(160),
      }),
    )
    .max(12),
  quality: z.object({
    framing: z.enum(["top_down", "angled", "unclear"]),
    hands_visible: z.boolean(),
  }),
  confidence: z.number().int().min(0).max(100),
})
export type AiReport = z.infer<typeof aiReportSchema>

/** JSON schema handed to Gemini (responseJsonSchema). Kept in step with aiReportSchema. */
export const AI_REPORT_JSON_SCHEMA = {
  type: "object",
  properties: {
    liveness: {
      type: "object",
      properties: {
        word_heard: {
          type: "string",
          description:
            "The single word the person says out loud, lowercase. 'not_audible' if you cannot clearly hear one.",
        },
        fingers_shown: {
          type: "integer",
          description:
            "How many fingers the person deliberately holds up to the camera. -1 if not clearly visible.",
        },
      },
      required: ["word_heard", "fingers_shown"],
    },
    steps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          status: { type: "string", enum: ["done", "not_done", "not_visible"] },
          t: { type: "string", description: "mm:ss when the step happens, '' if not done or not visible" },
          evidence: { type: "string", description: "One short factual sentence about what is visible" },
        },
        required: ["name", "status", "t", "evidence"],
      },
    },
    quality: {
      type: "object",
      properties: {
        framing: { type: "string", enum: ["top_down", "angled", "unclear"] },
        hands_visible: { type: "boolean" },
      },
      required: ["framing", "hands_visible"],
    },
    confidence: { type: "integer", description: "0-100, how sure you are about the whole report" },
  },
  required: ["liveness", "steps", "quality", "confidence"],
} as const

export function parseT(t: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t.trim())
  return m ? Number(m[1]) * 60 + Number(m[2]) : null
}

const norm = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/[^a-z-]/g, "")

/** Rough spoken form: "cello" and "selo" or "chello" sound alike, so compare how words sound, not spelling. */
const soundKey = (w: string) =>
  w
    .replace(/-/g, "")
    .replace(/^ch(?=e|i)/, "s")
    .replace(/ph/g, "f")
    .replace(/c(?=[eiy])/g, "s")
    .replace(/ck/g, "k")
    .replace(/c/g, "k")
    .replace(/qu/g, "kw")
    .replace(/x/g, "ks")
    .replace(/y/g, "i")
    .replace(/(.)\1+/g, "$1")

function editDistance(a: string, b: string): number {
  let prev: number[] = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    const cur: number[] = [i]
    for (let j = 1; j <= b.length; j++) {
      const sub = (prev[j - 1] ?? 0) + (a[i - 1] === b[j - 1] ? 0 : 1)
      cur[j] = Math.min((prev[j] ?? 0) + 1, (cur[j - 1] ?? 0) + 1, sub)
    }
    prev = cur
  }
  return prev[b.length] ?? 0
}

/**
 * The model writes down what it heard, so spelling can differ from the word on screen ("selo" for "cello").
 * Accept when it sounds the same or is one letter off (two for longer words).
 */
export function wordMatches(heard: string, expected: string): boolean {
  if (heard === expected) return true
  const a = soundKey(heard)
  const b = soundKey(expected)
  if (a === b) return true
  return editDistance(a, b) <= (b.length >= 6 ? 2 : 1)
}

/**
 * Plain code turns the AI's observations into accept / reject / review.
 * Reject: wrong word, wrong finger count, a required step not done.
 * Review: anything not visible or not audible, low confidence, impossible timestamps.
 */
export function decide(input: {
  report: AiReport
  rubric: Pick<Rubric, "steps">
  challenge: { word: string; fingers: number }
  durationS: number
}): VerdictSummary {
  const { report, rubric, challenge, durationS } = input
  const heard = norm(report.liveness.word_heard)
  const wordHeard = heard === "notaudible" || heard === "" ? "not_audible" : heard
  const fingersShown = report.liveness.fingers_shown < 0 ? null : report.liveness.fingers_shown

  const steps: StepEvidence[] = rubric.steps.map((s) => {
    const r = report.steps.find((x) => norm(x.name) === norm(s.name))
    return {
      name: s.name,
      label: s.label,
      status: r?.status ?? "not_visible",
      t: r && r.status === "done" && r.t ? r.t : null,
      evidence: r?.evidence ?? "Not reported",
    }
  })
  const liveness = { word: challenge.word, wordHeard, fingers: challenge.fingers, fingersShown }
  const out = (verdict: Verdict, reason: string): VerdictSummary => ({
    verdict,
    score: report.confidence,
    reason,
    liveness,
    steps,
  })

  // Liveness: a different word or finger count means it wasn't filmed for this claim.
  if (wordHeard !== "not_audible" && !wordMatches(wordHeard, norm(challenge.word))) {
    return out("reject", `The word heard was “${wordHeard}”, not “${challenge.word}”.`)
  }
  if (fingersShown !== null && fingersShown !== challenge.fingers) {
    return out("reject", `${fingersShown} fingers were shown, not ${challenge.fingers}.`)
  }
  const missing = steps.find((s) => s.status === "not_done")
  if (missing) return out("reject", `“${missing.label}” wasn't done.`)

  // Anything unclear goes to a person instead of a guess.
  if (wordHeard === "not_audible") return out("review", "The challenge word couldn't be heard clearly.")
  if (fingersShown === null) return out("review", "The finger count wasn't clearly visible.")
  const unseen = steps.find((s) => s.status === "not_visible")
  if (unseen) return out("review", `“${unseen.label}” wasn't clearly visible.`)

  // Sanity: every timestamp inside the clip, steps in order.
  const ts = steps.map((s) => (s.t ? parseT(s.t) : null))
  if (ts.some((t) => t === null || t > Math.ceil(durationS) + 1)) {
    return out("review", "A step time didn't fit inside the clip.")
  }
  for (let i = 1; i < ts.length; i++) {
    if ((ts[i] as number) < (ts[i - 1] as number))
      return out("review", "The steps weren't in the expected order.")
  }
  if (report.confidence < 70) return out("review", "The checker wasn't confident enough.")
  return out("accept", "Every step is visible, in order, and the challenge matches.")
}

// ---------- fingerprints (dedup) ----------

/** Hamming distance between two 16-hex (64-bit) dHashes. */
export function hamming(a: string, b: string): number {
  // Compare as two 32-bit halves: no BigInt needed, works on every target.
  const pop = (v: number) => {
    let c = 0
    for (let x = v >>> 0; x; x >>>= 1) c += x & 1
    return c
  }
  const hi = (h: string) => Number.parseInt(h.slice(0, 8), 16)
  const lo = (h: string) => Number.parseInt(h.slice(8, 16), 16)
  return pop(hi(a) ^ hi(b)) + pop(lo(a) ^ lo(b))
}

/** A clip is a duplicate if at least 2 of its 3 frame hashes are within `max` bits of another clip's. */
export function isNearDuplicate(mine: string[], theirs: string[], max = 10): boolean {
  let close = 0
  for (let i = 0; i < Math.min(mine.length, theirs.length); i++) {
    if (hamming(mine[i] as string, theirs[i] as string) < max) close++
  }
  return close >= 2
}

// ---------- reputation + free checks ----------

export const FREE_CHECKS = 10

export type HumanStats = { accepted: number; rejected: number; rejectStreak: number; checksUsed: number }

/** Checks left: 10 free, and every accepted clip refunds the check it used. */
export function checksLeft(s: HumanStats): number {
  return Math.max(0, FREE_CHECKS - s.checksUsed + s.accepted)
}

/** Blocked after 5 rejections in a row, or under 40% accepted once 6+ clips were judged. */
export function isBlocked(s: HumanStats): boolean {
  const judged = s.accepted + s.rejected
  return s.rejectStreak >= 5 || (judged >= 6 && s.accepted / judged < 0.4)
}

export function applyVerdict(s: HumanStats, v: Verdict | "duplicate"): HumanStats {
  if (v === "accept") return { ...s, accepted: s.accepted + 1, rejectStreak: 0 }
  if (v === "reject" || v === "duplicate")
    return { ...s, rejected: s.rejected + 1, rejectStreak: s.rejectStreak + 1 }
  return s // review: neither counts until a person decides
}
