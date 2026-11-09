"use client"

// Paper design: tap a task → one bottom sheet with the brief, reward and the one orange button.
// The list already holds the full task (rubric included), so the sheet opens instantly with no fetch.
// Non-modal on purpose: World ID's own popup must stay clickable above the sheet.
import type { TaskDTO } from "@adx/shared"
import { Lock } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Drawer } from "vaul"
import { Button } from "@/components/ui/button"
import { ClaimFlow } from "./claim-flow"
import { Countdown } from "./countdown"
import { SlotRail } from "./slot-rail"
import { TaskCardBody } from "./task-card"

export function TaskSheet({ task }: { task: TaskDTO }) {
  const [open, setOpen] = useState(false)
  const r = task.rubric
  const now = Math.floor(Date.now() / 1000)
  const state = task.deadline <= now ? "closed" : task.filled >= task.slots ? "full" : "open"

  return (
    <Drawer.Root open={open} onOpenChange={setOpen} modal={false}>
      <Drawer.Trigger asChild>
        <button
          type="button"
          className="block w-full rounded-[18px] border border-border bg-card p-5 text-left transition-transform active:scale-[0.99]"
        >
          <TaskCardBody task={task} />
        </button>
      </Drawer.Trigger>
      {open ? (
        <button
          type="button"
          aria-label="Close"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 bg-black/55 animate-in fade-in duration-300"
        />
      ) : null}
      <Drawer.Portal>
        <Drawer.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[88dvh] max-w-[520px] flex-col rounded-t-[24px] bg-card outline-none"
        >
          <div className="mx-auto mt-2.5 h-1 w-9 shrink-0 rounded-full bg-foreground/20" aria-hidden="true" />
          <div className="overflow-y-auto px-6 pt-4 pb-3">
            <Drawer.Title className="text-[22px] leading-tight font-semibold tracking-[-0.02em] text-balance">
              {task.title}
            </Drawer.Title>
            {r ? <p className="mt-1.5 text-[15px] text-muted-foreground text-pretty">{r.summary}</p> : null}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[28px] leading-none font-semibold tracking-[-0.03em] tabular">
                  {Number(task.reward).toFixed(2)}
                </span>
                <span className="text-[12px] font-semibold tracking-[0.06em] text-muted-foreground">
                  USDC
                </span>
              </div>
              <SlotRail slots={task.slots} filled={task.filled} size="sm" />
            </div>

            {r ? (
              <section className="mt-6">
                <h3 className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground">
                  WHAT TO FILM
                </h3>
                <ol className="mt-2 divide-y divide-border border-t border-border">
                  {r.steps.map((s, i) => (
                    <li key={s.name} className="flex gap-3 py-3">
                      <span className="grid size-[22px] shrink-0 place-items-center rounded-full bg-foreground text-[12px] font-semibold text-background tabular">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="text-[15px] font-medium">{s.label}</div>
                        <div className="text-[13px] text-muted-foreground">{s.hint}</div>
                      </div>
                    </li>
                  ))}
                </ol>
                <p className="mt-2 flex gap-2 rounded-[12px] bg-sunken px-3.5 py-3 text-[12.5px] text-muted-foreground">
                  <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                  {r.durationS.min}–{r.durationS.max} s, with a word to say and fingers to show. The clip is
                  encrypted on Swarm and the verdict is recorded on Arkiv.
                </p>
              </section>
            ) : null}
          </div>

          <div className="border-t border-border px-6 pt-3 pb-[max(env(safe-area-inset-bottom),16px)]">
            {state === "open" ? (
              <ClaimFlow taskKey={task.key} title={task.title} />
            ) : (
              <Button variant="outline" size="xl" className="w-full" disabled>
                {state === "full" ? "All slots taken" : "This task has closed"}
              </Button>
            )}
            <div className="mt-2 flex items-center justify-between gap-3 text-[12.5px] text-muted-foreground">
              <span>One person, one slot. We never learn who you are.</span>
              <Countdown deadline={task.deadline} className="shrink-0 text-[12.5px]" />
            </div>
            <Link
              href={`/tasks/${task.key}`}
              className="mt-1 block py-1 text-center text-[12.5px] text-muted-foreground underline underline-offset-4"
            >
              Full task page
            </Link>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
