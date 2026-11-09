import type { VerdictSummary } from "@adx/shared/events"
import { Check, CircleHelp, X } from "lucide-react"
import { cn } from "@/lib/utils"

const HEAD = {
  accept: { title: "Accepted", tone: "text-success", ring: "border-success/40" },
  reject: { title: "Not accepted", tone: "text-danger", ring: "border-danger/40" },
  review: { title: "A person is checking this clip", tone: "text-warning", ring: "border-warning/40" },
} as const

function Mark({ ok }: { ok: boolean | null }) {
  if (ok === null) return <CircleHelp className="size-4 text-warning" aria-label="Not visible" />
  return ok ? (
    <Check className="size-4 text-success" strokeWidth={2.6} aria-label="Yes" />
  ) : (
    <X className="size-4 text-danger" strokeWidth={2.6} aria-label="No" />
  )
}

/** The verdict with evidence: every step points at the second it happened. Code decided, not the model. */
export function VerdictCard({ v, bare = false }: { v: VerdictSummary; bare?: boolean }) {
  const head = HEAD[v.verdict]
  const wordOk = v.liveness.wordHeard === v.liveness.word
  const fingersOk = v.liveness.fingersShown === null ? null : v.liveness.fingersShown === v.liveness.fingers
  return (
    <section
      className={cn(
        !bare && "rounded-[18px] border bg-card p-5 animate-in fade-in slide-in-from-bottom-2 duration-500",
        !bare && head.ring,
      )}
      aria-labelledby="verdict-title"
    >
      <div className="flex items-center justify-between gap-4">
        <h2
          id="verdict-title"
          className="flex items-center gap-2.5 text-[18px] font-semibold tracking-[-0.01em]"
        >
          <span
            className={cn(
              "grid size-7 place-items-center rounded-full",
              v.verdict === "accept" ? "bg-success-soft text-success-text" : "bg-sunken",
              head.tone,
            )}
          >
            {v.verdict === "accept" ? (
              <Check className="size-3.5" strokeWidth={3} />
            ) : v.verdict === "reject" ? (
              <X className="size-3.5" strokeWidth={3} />
            ) : (
              <CircleHelp className="size-3.5" />
            )}
          </span>
          <span className={v.verdict === "accept" ? "text-foreground" : head.tone}>{head.title}</span>
        </h2>
        <span className="flex items-baseline gap-1">
          <span className="text-[22px] font-semibold tracking-[-0.02em] tabular">{v.score}</span>
          <span className="text-[12px] text-muted-foreground">conf.</span>
        </span>
      </div>
      <p className="mt-1 text-[15px] text-muted-foreground text-pretty">{v.reason}</p>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <div className="rounded-[12px] bg-sunken p-3">
          <div className="text-[12px] text-muted-foreground">Word to say</div>
          <div className="mt-1 flex items-center gap-1.5 text-[15px] font-medium">
            <Mark ok={wordOk} /> “{v.liveness.word}”
          </div>
        </div>
        <div className="rounded-[12px] bg-sunken p-3">
          <div className="text-[12px] text-muted-foreground">Fingers to show</div>
          <div className="mt-1 flex items-center gap-1.5 text-[15px] font-medium">
            <Mark ok={fingersOk} /> {v.liveness.fingers}
          </div>
        </div>
      </div>

      <ol className="mt-5">
        {v.steps.map((s) => (
          <li key={s.name} className="flex gap-3 border-t border-border py-3">
            <span className="w-11 shrink-0 pt-px font-mono text-[12.5px] text-signal-text tabular">
              {s.t || "—"}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <span className="text-[14.5px] font-medium">{s.label}</span>
                <span className="mt-0.5 shrink-0">
                  <Mark ok={s.status === "done" ? true : s.status === "not_done" ? false : null} />
                </span>
              </div>
              <p className="text-[13px] text-muted-foreground">{s.evidence}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
