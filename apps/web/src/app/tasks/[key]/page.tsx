import { links, shortHex } from "@adx/shared"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { ProofLink } from "@/components/proof/proof-link"
import { Page } from "@/components/shell/page-header"
import { ClaimPanel } from "@/components/tasks/claim-panel"
import { Countdown } from "@/components/tasks/countdown"
import { SlotRail } from "@/components/tasks/slot-rail"
import { Skeleton } from "@/components/ui/skeleton"
import { getTask, isEntityKey } from "@/lib/data"

export const metadata: Metadata = { title: "Task" }

export default function TaskPage({ params }: PageProps<"/tasks/[key]">) {
  return (
    <Page>
      <div className="pt-6">
        <Link href="/tasks" className="text-[14px] text-muted-foreground hover:text-foreground">
          All tasks
        </Link>
      </div>
      <Suspense fallback={<DetailSkeleton />}>
        <Detail params={params} />
      </Suspense>
    </Page>
  )
}

async function Detail({ params }: { params: PageProps<"/tasks/[key]">["params"] }) {
  const { key } = await params
  if (!isEntityKey(key)) notFound()
  const res = await getTask(key)
  if (!res.ok) {
    return (
      <div
        role="status"
        className="mt-6 rounded-[18px] border border-warning/40 bg-warning/5 p-5 text-[15px]"
      >
        Syncing with Arkiv… This task will load as soon as the network answers.
      </div>
    )
  }
  const task = res.data
  if (!task) notFound()
  const r = task.rubric
  const now = Math.floor(Date.now() / 1000)
  const state = task.deadline <= now ? "closed" : task.filled >= task.slots ? "full" : "open"

  return (
    <article className="grid grid-cols-1 gap-10 pt-4 pb-32 md:pb-8 lg:grid-cols-[1fr_360px]">
      <div className="min-w-0">
        <h1 className="max-w-[22ch] text-[30px] leading-[1.1] font-semibold tracking-[-0.03em] text-balance md:text-[40px]">
          {task.title}
        </h1>
        {r ? (
          <p className="mt-3 max-w-[60ch] text-[16px] text-muted-foreground text-pretty">{r.summary}</p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          <SlotRail slots={task.slots} filled={task.filled} />
          <Countdown deadline={task.deadline} className="text-[14px] text-foreground/80" />
        </div>

        {r ? (
          <>
            <section className="mt-10">
              <h2 className="text-[17px] font-semibold tracking-[-0.01em]">What to film</h2>
              <ol className="mt-4 space-y-0">
                {r.steps.map((s, i) => (
                  <li key={s.name} className="flex gap-4 border-t py-4 first:border-t-0 first:pt-0">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-foreground font-mono text-[13px] text-background tabular">
                      {i + 1}
                    </span>
                    <div>
                      <div className="text-[15px] font-medium">{s.label}</div>
                      <div className="text-[14px] text-muted-foreground">{s.hint}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
            <section className="mt-8 rounded-[18px] bg-sunken p-5">
              <h2 className="text-[15px] font-semibold">Before you start</h2>
              <ul className="mt-3 space-y-2 text-[14px] text-muted-foreground">
                {r.setup.map((line) => (
                  <li key={line} className="flex gap-2.5">
                    <span
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-foreground/40"
                      aria-hidden="true"
                    />
                    {line}
                  </li>
                ))}
                <li className="flex gap-2.5">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-foreground/40" aria-hidden="true" />
                  {r.durationS.min}–{r.durationS.max} seconds, with a word to say and fingers to show (you get
                  them when you claim)
                </li>
              </ul>
            </section>
          </>
        ) : null}

        <section className="mt-8">
          <h2 className="sr-only">Public record</h2>
          <div className="flex flex-wrap gap-2">
            <ProofLink kind="arkiv" href={links.arkivEntity(task.key)} label={`Task ${shortHex(task.key)}`} />
            {task.rubricRef ? (
              <ProofLink kind="swarm" href={links.swarm(task.rubricRef)} label="Rubric on Swarm" />
            ) : null}
          </div>
        </section>
      </div>

      <aside className="lg:sticky lg:top-20 lg:self-start">
        <ClaimPanel taskKey={task.key} title={task.title} reward={task.reward} state={state} />
      </aside>
    </article>
  )
}

function DetailSkeleton() {
  return (
    <div className="pt-4" aria-hidden="true">
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="mt-4 h-5 w-full max-w-xl" />
      <Skeleton className="mt-2 h-5 w-2/3 max-w-lg" />
      <Skeleton className="mt-8 h-48 w-full max-w-xl rounded-[18px]" />
    </div>
  )
}
