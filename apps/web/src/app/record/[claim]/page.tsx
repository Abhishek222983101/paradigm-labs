import type { Metadata } from "next"
import { Suspense } from "react"
import { RecordClaim } from "./record-claim"

export const metadata: Metadata = { title: "Record your clip" }

export default function RecordClaimPage({ params }: PageProps<"/record/[claim]">) {
  return (
    <Suspense fallback={<div className="fixed inset-0 z-50 bg-black" />}>
      <RecordClaim params={params} />
    </Suspense>
  )
}
