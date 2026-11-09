import { ShieldCheck } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { AutoRefresh } from "@/components/shell/auto-refresh"
import { Page } from "@/components/shell/page-header"
import { Button } from "@/components/ui/button"
import { approvalById } from "@/lib/server/console"

export const metadata: Metadata = { title: "Approve a payment" }

export default function ApprovePage({ params }: PageProps<"/approve/[id]">) {
  return (
    <Page>
      <AutoRefresh />
      <div className="mx-auto max-w-md pt-10 pb-10">
        <Suspense fallback={null}>
          <Approval params={params} />
        </Suspense>
      </div>
    </Page>
  )
}

async function Approval({ params }: { params: PageProps<"/approve/[id]">["params"] }) {
  const { id } = await params
  const a = await approvalById(id)
  if (!a || a.status !== "pending" || !a.url) {
    const word =
      a?.status === "approved"
        ? "approved"
        : a?.status === "denied"
          ? "declined"
          : a?.status === "expired"
            ? "expired"
            : null
    return (
      <div className="text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-sunken">
          <ShieldCheck className="size-6 text-muted-foreground" />
        </span>
        <h1 className="mt-5 text-[24px] font-semibold tracking-[-0.02em]">
          {word ? `This payment was ${word}` : "No payment is waiting for you"}
        </h1>
        <p className="mt-2 text-[15px] text-muted-foreground">
          Nothing above the agent's limit is ever paid without a human.
        </p>
        <Button asChild variant="outline" size="lg" className="mt-6">
          <Link href="/console">Back to the console</Link>
        </Button>
      </div>
    )
  }
  return (
    <div>
      <div className="text-[13px] font-medium text-warning">Waiting for you</div>
      <h1 className="mt-1 text-[28px] leading-tight font-semibold tracking-[-0.03em]">
        The agent wants to pay {a.amount} USDC
      </h1>
      <p className="mt-2 text-[15px] text-muted-foreground">
        That's above its limit, so it needs you. Confirm with World ID on your phone, or decline there.
      </p>
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: SVG generated server-side from a validated World URL */}
      <div
        className="mx-auto mt-6 size-[220px] rounded-2xl bg-white p-2"
        dangerouslySetInnerHTML={{ __html: a.qrSvg }}
      />
      <p className="mt-3 text-center font-mono text-[18px] tabular">{a.userCode}</p>
      <Button asChild variant="signal" size="xl" className="mt-5 w-full">
        <a href={a.url} target="_blank" rel="noopener noreferrer">
          <ShieldCheck />
          Approve or decline with World ID
        </a>
      </Button>
      <p className="mt-3 text-[13px] text-muted-foreground">
        Expires in 20 minutes. If nobody approves, nothing is paid.
      </p>
    </div>
  )
}
