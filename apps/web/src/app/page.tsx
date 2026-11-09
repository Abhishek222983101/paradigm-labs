import { ArrowRight, Bot, Camera, ShieldCheck, Video, Wallet } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"
import { HeroBackground, HeroMachine, HowItWorks, SiteFooter } from "@/components/landing/landing-client"
import { TaskSheet } from "@/components/tasks/task-sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { getCounts, getOpenTasks } from "@/lib/data"

const BUILT_ON = [
  "Arkiv",
  "Swarm",
  "Hedera x402",
  "Hedera Agent Kit",
  "World ID",
  "World Agent Pass",
  "Gemini",
  "USDC",
]

const TRY = [
  {
    n: "1",
    icon: Camera,
    title: "Film a task",
    body: "Pick a task, prove you're human with World ID, film 30 seconds.",
    cta: "See open tasks",
    href: "/tasks",
  },
  {
    n: "2",
    icon: Bot,
    title: "Watch the agent pay",
    body: "See its budget, every payment, and approve big ones with World ID.",
    cta: "Open the console",
    href: "/console",
  },
  {
    n: "3",
    icon: ShieldCheck,
    title: "Check the records",
    body: "Every task, verdict, payment and licence is public on Arkiv.",
    cta: "See the records",
    href: "/explorer",
  },
]

export default function Home() {
  return (
    <div className="-mb-24 md:-mb-12">
      <section className="relative isolate overflow-hidden">
        <HeroBackground />
        <div className="mx-auto grid max-w-[1240px] items-center gap-6 px-5 pt-12 pb-14 lg:grid-cols-[1fr_1.15fr] lg:pt-20 lg:pb-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border bg-card/70 px-3 py-1 text-[13px] text-muted-foreground">
              <Video className="size-3.5" />
              <span>
                Team Paradigm · ETHGlobal Mumbai
                <span className="hidden sm:inline"> · Robot training data</span>
              </span>
            </span>
            <h1 className="mt-6 text-[44px] leading-[1.04] font-semibold tracking-[-0.03em] sm:text-[60px]">
              <span className="font-serif font-normal text-muted-foreground italic">
                Robots can't fold yet.
              </span>
              <br />
              Film it. Get paid.
            </h1>
            <p className="mt-5 max-w-[34rem] text-[18px] leading-relaxed text-muted-foreground">
              AI agents post the moves their robots fail at. Film one on your phone and get paid in USDC.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/tasks"
                className="inline-flex h-12 items-center gap-2 rounded-[10px] bg-primary px-6 text-[15px] font-medium text-primary-foreground transition-colors hover:bg-primary/85"
              >
                <Camera className="size-4" />
                Find a task
              </Link>
              <Link
                href="/console"
                className="inline-flex h-12 items-center gap-2 rounded-[10px] border border-input px-6 text-[15px] font-medium transition-colors hover:bg-secondary"
              >
                <Wallet className="size-4" />
                Watch the agent pay
              </Link>
            </div>
            <Suspense fallback={<StatsShell />}>
              <Stats />
            </Suspense>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_55%,color-mix(in_oklab,var(--foreground)_7%,transparent),transparent_65%)]" />
            <HeroMachine />
          </div>
        </div>
      </section>

      <section aria-label="Built on" className="border-y bg-card/40 py-8">
        <div className="mx-auto max-w-[1240px] px-5">
          <p className="mb-4 text-center text-[13px] tracking-[0.14em] text-muted-foreground">BUILT ON</p>
          <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_12%,white_88%,transparent)]">
            <div className="marquee flex w-max gap-3 text-[15px]">
              {[0, 1].map((k) => (
                <div key={k} className="flex gap-3" aria-hidden={k === 1}>
                  {BUILT_ON.map((s) => (
                    <span
                      key={s + k}
                      className="rounded-full border bg-card px-4 py-1.5 font-medium whitespace-nowrap text-foreground/80"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-[1240px] scroll-mt-20 px-5 py-8">
        <HowItWorks />
      </section>

      <section id="try" className="mx-auto max-w-[1240px] scroll-mt-20 px-5 py-16">
        <h2 className="text-[32px] font-semibold tracking-tight">Try it in three clicks</h2>
        <p className="mt-2 text-[16px] text-muted-foreground">Live on testnets. No real money.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {TRY.map(({ n, icon: I, title, body, cta, href }) => (
            <Link
              key={n}
              href={href}
              className="group flex flex-col items-start gap-4 rounded-[14px] border bg-card p-6 transition-colors hover:border-input hover:bg-secondary"
            >
              <span className="flex w-full items-center justify-between">
                <span className="grid size-8 place-items-center rounded-full border border-input text-[15px] text-muted-foreground tabular">
                  {n}
                </span>
                <I className="size-[18px] text-muted-foreground" />
              </span>
              <span className="text-[19px] font-semibold">{title}</span>
              <span className="text-[15px] leading-relaxed text-muted-foreground">{body}</span>
              <span className="mt-auto inline-flex items-center gap-1.5 text-[15px] font-medium">
                {cta}
                <ArrowRight className="size-[15px] transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 pb-20">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-[24px] font-semibold tracking-tight">Open now</h2>
          <Link
            href="/tasks"
            className="inline-flex items-center gap-1 text-[14px] text-muted-foreground hover:text-foreground"
          >
            All tasks <ArrowRight className="size-4" />
          </Link>
        </div>
        <Suspense
          fallback={
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <Skeleton className="h-[164px] rounded-[18px]" />
              <Skeleton className="h-[164px] rounded-[18px]" />
            </div>
          }
        >
          <OpenTasks />
        </Suspense>
      </section>

      <SiteFooter />
    </div>
  )
}

function StatsShell() {
  return <div className="mt-10 h-[84px] max-w-md border-t" />
}

async function Stats() {
  const res = await getCounts()
  if (!res.ok) return <StatsShell />
  const c = res.data
  const stats = [
    ["Clips checked", c.verifications],
    ["Payouts", c.receipts],
    ["Licences", c.licences],
  ] as const
  return (
    <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t pt-6">
      {stats.map(([label, v]) => (
        <div key={label}>
          <dt className="text-[13px] text-muted-foreground">{label}</dt>
          <dd className="mt-1 text-[26px] font-semibold tabular">{v}</dd>
        </div>
      ))}
    </dl>
  )
}

async function OpenTasks() {
  const res = await getOpenTasks()
  if (!res.ok || res.data.length === 0) {
    return (
      <div className="mt-5 rounded-[18px] border border-dashed p-6 text-[15px] text-muted-foreground">
        {res.ok
          ? "No open tasks right now. Agents post new ones as robots find gaps."
          : "Loading from Arkiv…"}
      </div>
    )
  }
  return (
    <ul className="mt-5 grid gap-3 md:grid-cols-2">
      {res.data.slice(0, 4).map((t) => (
        <li key={t.key}>
          <TaskSheet task={t} />
        </li>
      ))}
    </ul>
  )
}
