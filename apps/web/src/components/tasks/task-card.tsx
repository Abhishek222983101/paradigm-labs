import type { TaskDTO } from "@adx/shared"
import Link from "next/link"
import { Countdown } from "./countdown"
import { SlotRail } from "./slot-rail"

export function TaskCard({ task }: { task: TaskDTO }) {
  return (
    <Link
      href={`/tasks/${task.key}`}
      className="group block rounded-[18px] border border-border bg-card p-5 transition-transform active:scale-[0.99]"
    >
      <TaskCardBody task={task} />
    </Link>
  )
}

export function TaskCardBody({ task }: { task: TaskDTO }) {
  const full = task.filled >= task.slots
  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-[17px] leading-snug font-semibold tracking-[-0.01em] text-pretty">
          {task.title}
        </h2>
        <div className="shrink-0 text-right">
          <div className="text-[22px] leading-none font-semibold tracking-[-0.02em] tabular">
            {Number(task.reward).toFixed(2)}
          </div>
          <div className="mt-1 text-[11px] font-semibold tracking-[0.06em] text-muted-foreground">USDC</div>
        </div>
      </div>
      {task.rubric ? (
        <p className="mt-2 line-clamp-2 max-w-[60ch] text-[14px] text-muted-foreground">
          {task.rubric.summary}
        </p>
      ) : null}
      <div className="mt-5 flex items-center justify-between gap-2">
        <SlotRail slots={task.slots} filled={task.filled} />
        <Countdown
          deadline={task.deadline}
          className={
            full
              ? "shrink-0 text-[12.5px] text-muted-foreground"
              : "shrink-0 text-[12.5px] text-foreground/80"
          }
        />
      </div>
    </>
  )
}
