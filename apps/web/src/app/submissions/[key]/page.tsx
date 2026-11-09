import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { Page } from "@/components/shell/page-header"
import { LiveStatus } from "@/components/submission/live-status"
import { Skeleton } from "@/components/ui/skeleton"
import { isSubmissionId, submissionView } from "@/lib/server/submissions"

export const metadata: Metadata = { title: "Your clip" }

export default function SubmissionPage({ params }: PageProps<"/submissions/[key]">) {
  return (
    <Page>
      <div className="pt-4">
        <Suspense fallback={<Skeleton className="mx-auto h-80 w-full max-w-[440px] rounded-[18px]" />}>
          <Status params={params} />
        </Suspense>
      </div>
    </Page>
  )
}

async function Status({ params }: { params: PageProps<"/submissions/[key]">["params"] }) {
  const { key } = await params
  if (!isSubmissionId(key)) notFound()
  const view = await submissionView(key)
  if (!view) notFound()
  return <LiveStatus id={key} initial={view} />
}
