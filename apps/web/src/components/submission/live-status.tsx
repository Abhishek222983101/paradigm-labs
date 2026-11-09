"use client"

// The real status of one clip: polls /api/submissions/:id every 2.5 s until a final verdict arrives.
// Shows only what actually happened. No sample data.
// Layout follows the Paper design (07 Nov): "Checking your clip" while it runs, a receipt once paid.
import { links, shortHex } from "@adx/shared"
import type { PipelineEvent, VerdictSummary } from "@adx/shared/events"
import { ArrowUpRight, Check, Hand, Loader2, Lock, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { ProofLink } from "@/components/proof/proof-link"
import { Button } from "@/components/ui/button"
import { PipelineSteps } from "./pipeline-steps"
import { VerdictCard } from "./verdict-card"

type View = {
  id: string
  status: string
  bytes: number | null
  receivedAt: string
  challenge: { word: string; fingers: number } | null
  events: PipelineEvent[]
  payment: {
    status: string
    amount: string
    hederaTx: string | null
    receiptKey: string | null
    licenceKey: string | null
    payTo: string
    approvedByHuman?: boolean
  } | null
}

export function LiveStatus({ id, initial }: { id: string; initial: View }) {
  const [view, setView] = useState<View>(initial)
  const checked = view.events.some((e) => e.step === "done") || view.status === "failed"
  const payFinal =
    view.payment &&
    (view.payment.status === "declined" || (view.payment.status === "settled" && view.payment.licenceKey))
  // After an accept, keep watching until the agent has paid (or a human declined).
  const done = checked && (view.status !== "accepted" || Boolean(payFinal))

  useEffect(() => {
    if (done) return
    const t = setInterval(async () => {
      const r = await fetch(`/api/submissions/${id}`, { cache: "no-store" }).catch(() => null)
      if (r?.ok) setView((await r.json()) as View)
    }, 2500)
    return () => clearInterval(t)
  }, [id, done])

  const started = view.events.some((e) => e.step !== "received")
  const summary = view.events.find((e) => e.step === "verdict" && e.data?.summary)?.data?.summary as
    | VerdictSummary
    | undefined
  const failure = [...view.events].reverse().find((e) => !e.ok && e.data?.reason)?.data?.reason
  const swarmRef = view.events.find((e) => e.step === "store")?.data?.swarmRef
  const pub = view.events.find((e) => e.step === "publish")?.data
  const duplicateOf = view.events.find((e) => e.data?.duplicateOf)?.data?.duplicateOf
  const paid = view.payment?.status === "settled" ? view.payment : null

  const proofs =
    pub?.verificationKey || swarmRef ? (
      <div className="flex flex-wrap gap-2">
        {pub?.verificationKey ? (
          <ProofLink kind="arkiv" href={links.arkivEntity(pub.verificationKey)} label="Verdict on Arkiv" />
        ) : null}
        {swarmRef ? (
          <ProofLink kind="swarm" href={links.swarmTestnet(swarmRef)} label="Clip on Swarm" />
        ) : null}
        {pub?.submissionKey ? (
          <ProofLink kind="arkiv" href={links.arkivEntity(pub.submissionKey)} label="Submission on Arkiv" />
        ) : null}
      </div>
    ) : null

  if (paid) {
    const amount = Number(paid.amount)
    return (
      <div className="mx-auto max-w-[440px] space-y-4 pb-6">
        <section className="pt-4 text-center animate-in fade-in zoom-in-95 duration-500" aria-live="polite">
          <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-semibold tracking-[0.06em] text-success-text">
            <Check className="size-3" strokeWidth={3} aria-hidden="true" />
            PAID · LIVE
          </span>
          <div className="mt-4 flex items-baseline justify-center gap-2">
            <span className="text-[60px] leading-none font-semibold tracking-[-0.04em] tabular">
              {amount.toFixed(2)}
            </span>
            <span className="text-[13px] font-semibold tracking-[0.06em] text-muted-foreground">USDC</span>
          </div>
          <p className="mt-3 text-[14px] text-muted-foreground">
            {paid.approvedByHuman
              ? "Settled on Hedera · approved with World ID"
              : "Settled on Hedera · no approval needed"}
          </p>
        </section>

        <section className="rounded-[18px] bg-card p-5">
          <h2 className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground">RECEIPT</h2>
          <dl className="mt-3 space-y-2.5 text-[14px]">
            <Row label="To">
              <span className="tabular">{paid.payTo}</span>
            </Row>
            <Row label="Transaction">
              {paid.hederaTx ? (
                <a
                  href={links.hashscanTx(paid.hederaTx)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 tabular underline-offset-4 hover:underline"
                >
                  {paid.hederaTx.length > 18 ? `${paid.hederaTx.slice(0, 15)}…` : paid.hederaTx}
                  <ArrowUpRight className="size-3.5 opacity-60" aria-hidden="true" />
                  <span className="sr-only">(opens HashScan in a new tab)</span>
                </a>
              ) : (
                "—"
              )}
            </Row>
            <Row label="Network">hedera:testnet</Row>
            <Row label="Approval">
              {paid.approvedByHuman ? (
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="size-3.5 text-signal" aria-hidden="true" /> World ID
                </span>
              ) : (
                "Within the agent's limit"
              )}
            </Row>
          </dl>
        </section>

        <section className="rounded-[18px] border border-signal/30 bg-signal-soft p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-semibold">You own this licence</h2>
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                A record on Arkiv held by your wallet, not a row in our database.
              </p>
            </div>
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-card">
              <Lock className="size-3.5" aria-hidden="true" />
            </span>
          </div>
          {paid.licenceKey ? (
            <a
              href={links.arkivEntity(paid.licenceKey)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex h-8 items-center gap-1 rounded-full border border-border bg-card px-3 text-[12.5px] font-medium"
            >
              Licence {shortHex(paid.licenceKey)}
              <ArrowUpRight className="size-3.5 opacity-60" aria-hidden="true" />
            </a>
          ) : null}
        </section>

        <ul className="space-y-2 px-1 text-[12.5px] text-muted-foreground">
          <li className="flex gap-2">
            <Lock className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
            Your clip stays encrypted on Swarm. The buyer gets the key only after paying.
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-signal" aria-hidden="true" />
            <span>
              The receipt and licence are open records on Arkiv.{" "}
              {paid.receiptKey ? (
                <a
                  href={links.arkivEntity(paid.receiptKey)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-foreground underline underline-offset-4"
                >
                  Receipt
                </a>
              ) : null}
            </span>
          </li>
        </ul>

        <Button asChild variant="outline" size="lg" className="h-12 w-full rounded-[14px] bg-card">
          <Link href="/tasks">Back to open tasks</Link>
        </Button>

        {summary ? (
          <details className="group rounded-[18px] bg-card p-5">
            <summary className="cursor-pointer list-none text-[14px] font-medium">
              How your clip was checked
              <span className="ml-1 text-muted-foreground group-open:hidden">· show</span>
            </summary>
            <div className="mt-4 space-y-4">
              <VerdictCard v={summary} bare />
              {proofs}
            </div>
          </details>
        ) : null}
      </div>
    )
  }

  const waitingForPay = view.status === "accepted" && checked && view.payment?.status !== "declined"
  return (
    <div className="mx-auto max-w-[440px] space-y-4 pb-6">
      <header className="pt-2">
        <h1 className="text-[30px] leading-[1.1] font-semibold tracking-[-0.03em]">
          {checked ? (summary?.verdict === "accept" ? "Clip accepted" : "Your clip") : "Checking your clip"}
        </h1>
        <p className="mt-1.5 text-[15px] text-muted-foreground">
          {checked
            ? waitingForPay
              ? "The robot team's agent is paying you now."
              : "The check has finished."
            : "Usually about 30 seconds. Nothing to tap."}
        </p>
      </header>

      {view.challenge ? (
        <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
          Your challenge
          <span className="rounded-full bg-signal px-2.5 py-0.5 font-semibold text-signal-ink">
            “{view.challenge.word}”
          </span>
          <span className="flex items-center gap-1 rounded-full bg-foreground px-2.5 py-0.5 font-semibold text-background">
            {view.challenge.fingers} <Hand className="size-3" aria-label="fingers" />
          </span>
        </div>
      ) : null}

      {!checked ? <PipelineSteps events={view.events} /> : null}

      {waitingForPay ? (
        <div
          role="status"
          className="flex items-center gap-3 rounded-[14px] bg-signal-soft px-4 py-3.5 text-[14px] font-medium"
        >
          <Loader2 className="size-4 shrink-0 animate-spin text-signal" />
          Paying you in USDC on Hedera…
        </div>
      ) : null}

      {summary ? <VerdictCard v={summary} /> : null}

      {!summary && done && failure ? (
        <section className="rounded-[18px] border border-danger/30 bg-card p-5">
          <h2 className="text-[20px] font-semibold text-danger">
            {view.status === "duplicate"
              ? "This clip was already submitted"
              : view.status === "failed"
                ? "The check couldn't finish"
                : "Not accepted"}
          </h2>
          <p className="mt-1 text-[15px] text-muted-foreground">{failure}</p>
          {duplicateOf ? (
            <div className="mt-3">
              <ProofLink
                kind="arkiv"
                href={links.arkivEntity(duplicateOf)}
                label={`Matches ${shortHex(duplicateOf)}`}
              />
            </div>
          ) : null}
        </section>
      ) : null}

      {proofs}

      {checked ? (
        <details className="rounded-[18px] bg-card p-5">
          <summary className="cursor-pointer list-none text-[14px] font-medium">
            Every check, with timings
          </summary>
          <div className="mt-3">
            <PipelineSteps events={view.events} />
          </div>
        </details>
      ) : null}

      {!started && !done ? (
        <p role="status" className="px-1 text-[13px] text-muted-foreground text-pretty">
          Your clip is safely received{view.bytes ? ` (${(view.bytes / 1e6).toFixed(1)} MB)` : ""}. This page
          updates by itself; you can leave and come back.
        </p>
      ) : null}

      {!checked || waitingForPay ? (
        <p className="flex gap-2 px-1 pt-2 text-[12.5px] text-muted-foreground">
          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-signal" aria-hidden="true" />
          Payment and licence are written automatically. You can leave this screen.
        </p>
      ) : null}
      <Button asChild variant="outline" size="lg" className="h-12 w-full rounded-[14px] bg-card">
        <Link href="/tasks">Back to open tasks</Link>
      </Button>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate text-right font-medium">{children}</dd>
    </div>
  )
}
