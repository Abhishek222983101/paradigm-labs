import type { Metadata } from "next"
import { Page, PageHeader } from "@/components/shell/page-header"
import { MePanel } from "@/components/wallet/me-panel"

export const metadata: Metadata = { title: "Me" }

export default function MePage() {
  return (
    <Page>
      <PageHeader
        title="Your earnings and licences"
        lead="Everything you've been paid for, and the licences you own."
      />
      <MePanel />
    </Page>
  )
}
