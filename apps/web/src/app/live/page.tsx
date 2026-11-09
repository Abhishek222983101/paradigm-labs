import type { Metadata } from "next"
import { PageHeader } from "@/components/shell/page-header"
import { LiveMap } from "./live-map"

export const metadata: Metadata = { title: "Live system" }

export default function LivePage() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-5">
      <PageHeader
        title="Live system"
        lead="Film on your phone and watch every service react here, with a proof link for each step."
      />
      <div className="pb-12">
        <LiveMap />
      </div>
    </div>
  )
}
