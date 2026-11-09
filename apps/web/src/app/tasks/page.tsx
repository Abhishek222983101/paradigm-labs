import { links, shortHex } from "@adx/shared"
import { WRITERS } from "@adx/shared/arkiv"
import type { Metadata } from "next"
import { Suspense } from "react"
import { ProofLink } from "@/components/proof/proof-link"
import { Page, PageHeader } from "@/components/shell/page-header"
import { TaskSheet } from "@/components/tasks/task-sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { getOpenTasks } from "@/lib/data"

export const metadata: Metadata = { title: "Open tasks" }

const BUYER = WRITERS.buyer

export default function TasksPage() {
  return (
    <Page>
      <PageHeader
        title="Open tasks"
        lead="Robot teams post the moves their robots get wrong. Film one on your phone and get paid when it's accepted."
      />
      <Suspense fallback={<BoardSkeleton />}>
        <Board />
      </Suspense>
    </Page>
  )
}

async function Board() {
  const res = await getOpenTasks()
  if (!res.ok) {
    return (
      <div role="status" className="rounded-[18px] border border-warning/40 bg-warning/5 p-5 text-[15px]">
        Syncing with Arkiv… The task list will appear as soon as the network answers. Pull to refresh in a few
        seconds.
      </div>
    )
  }
  const tasks = res.data
  return (
    <div className="space-y-6">
      {tasks.length === 0 ? (
        <div className="rounded-[18px] border border-dashed p-8 text-[15px] text-muted-foreground">
          No open tasks right now. The buyer agent posts new ones as its model finds gaps.
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {tasks.map((t) => (
            <li key={t.key}>
              <TaskSheet task={t} />
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] text-muted-foreground">
        <span>Read live from Arkiv, only tasks signed by the buyer agent</span>
        <ProofLink kind="arkiv" href={links.arkivAddress(BUYER)} label={shortHex(BUYER)} />
      </div>
    </div>
  )
}

function BoardSkeleton() {
  return (
    <ul className="grid gap-3 md:grid-cols-2" aria-hidden="true">
      {[0, 1].map((i) => (
        <li key={i} className="rounded-[18px] border bg-card p-5">
          <div className="flex justify-between">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-6 w-10" />
          </div>
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-4/5" />
          <Skeleton className="mt-6 h-4 w-1/2" />
        </li>
      ))}
    </ul>
  )
}
