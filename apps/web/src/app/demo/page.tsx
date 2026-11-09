import type { Metadata } from "next"
import Link from "next/link"
import { Page, PageHeader } from "@/components/shell/page-header"

export const metadata: Metadata = {
  title: "Demo",
  description: "The full Paradigm flow end to end, in under four minutes, with narration and captions.",
}

const STEPS = [
  "Open a task and prove you're human with World ID",
  "Film the task with the word and finger challenge",
  "Gemini watches, code decides, the clip is encrypted to Swarm",
  "The verdict, receipt and licence are public records on Arkiv",
  "The agent pays in USDC on Hedera over x402; above 5 USDC a human approves with World Agent Pass",
]

// The video loads only on this page and only when played (preload="none"), so no other page gets heavier.
export default function DemoPage() {
  return (
    <Page>
      <PageHeader
        title="Watch the demo"
        lead="The full flow, end to end, recorded on a phone and the live site. Under 4 minutes, with captions."
      />
      <div className="overflow-hidden rounded-xl border bg-black">
        {/* biome-ignore lint/a11y/useMediaCaption: captions are burned into the video */}
        <video
          className="aspect-video w-full"
          controls
          playsInline
          preload="none"
          poster="/demo/paradigm-demo-poster.jpg"
          src="/demo/paradigm-demo.mp4"
        />
      </div>
      <ol className="mt-6 grid gap-2 text-[15px] text-muted-foreground md:grid-cols-2">
        {STEPS.map((s, i) => (
          <li key={s} className="flex gap-3">
            <span className="tabular-nums text-foreground">{i + 1}</span>
            {s}
          </li>
        ))}
      </ol>
      <p className="mt-8 pb-16 text-[15px]">
        Try it yourself: keep{" "}
        <Link href="/live" className="underline underline-offset-4">
          the live system map
        </Link>{" "}
        open in a second tab, then{" "}
        <Link href="/tasks" className="underline underline-offset-4">
          pick a task
        </Link>
        .
      </p>
    </Page>
  )
}
