import { PIPELINE_STEPS, type PipelineEvent } from "@adx/shared/events"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * The live check list. Each row is one stage of the pipeline with how long it took.
 * The first unfinished stage pulses; everything after it waits. Announced politely to screen readers.
 */
export function PipelineSteps({ events }: { events: PipelineEvent[] }) {
  const byStep = new Map(events.map((e) => [e.step, e]))
  const failed = events.find((e) => !e.ok)
  const firstPending = PIPELINE_STEPS.findIndex((s) => !byStep.has(s.id))
  return (
    <ol aria-live="polite" className="divide-y divide-border border-y border-border">
      {PIPELINE_STEPS.map((s, i) => {
        const ev = byStep.get(s.id)
        const state = ev
          ? ev.ok
            ? "done"
            : "fail"
          : failed
            ? "skipped"
            : i === firstPending
              ? "active"
              : "waiting"
        return (
          <li
            key={s.id}
            className={cn(
              "flex items-center gap-3 py-3",
              state === "active" && "-mx-3 rounded-[12px] border-none bg-signal-soft px-3",
            )}
          >
            <span
              className={cn(
                "grid size-[22px] shrink-0 place-items-center rounded-full",
                state === "done" && "bg-success-soft text-success-text",
                state === "fail" && "bg-danger text-white",
                state === "active" && "bg-signal",
                (state === "waiting" || state === "skipped") && "border border-border",
              )}
            >
              {state === "done" ? <Check className="size-3" strokeWidth={3} /> : null}
              {state === "fail" ? <X className="size-3" strokeWidth={3} /> : null}
              {state === "active" ? (
                <span className="size-2 animate-pulse rounded-full bg-card motion-reduce:animate-none" />
              ) : null}
            </span>
            <span
              className={cn(
                "flex-1 text-[15px] font-medium",
                (state === "waiting" || state === "skipped") && "font-normal text-muted-foreground",
              )}
            >
              {s.label}
              {state === "fail" && ev?.data?.reason ? (
                <span className="block text-[13px] font-normal text-danger">{ev.data.reason}</span>
              ) : null}
            </span>
            <span
              className={cn(
                "text-[12.5px] tabular",
                state === "active" ? "font-medium text-signal-text" : "text-muted-foreground",
              )}
            >
              {state === "active"
                ? "live"
                : ev?.ms != null
                  ? ev.ms >= 1000
                    ? `${(ev.ms / 1000).toFixed(1)} s`
                    : `${ev.ms} ms`
                  : ""}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
