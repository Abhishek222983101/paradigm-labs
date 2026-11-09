import { links } from "@adx/shared"
import { WRITERS } from "@adx/shared/arkiv"
import type { Metadata } from "next"
import { cacheLife } from "next/cache"
import Link from "next/link"
import { Suspense } from "react"
import { ProofLink } from "@/components/proof/proof-link"
import { Page, PageHeader } from "@/components/shell/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { EXPLORER_QUERIES } from "@/lib/explorer-queries"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Arkiv explorer" }

export default function ExplorerPage({ searchParams }: PageProps<"/explorer">) {
  return (
    <Page>
      <PageHeader
        title="Arkiv explorer"
        lead="Every record in Paradigm is public on Arkiv. Pick a query to see the exact SDK call the app makes and what the network returns right now."
      />
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-[18px]" />}>
        <Explorer searchParams={searchParams} />
      </Suspense>
      <section className="mt-10 border-t pt-6">
        <h2 className="text-[15px] font-semibold">Writer wallets</h2>
        <p className="mt-1 text-[14px] text-muted-foreground">
          Each role signs with its own key. Reads trust only these owners.
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {Object.entries(WRITERS).map(([role, addr]) => (
            <li key={role}>
              <ProofLink
                kind="arkiv"
                href={links.arkivAddress(addr)}
                label={`${role} ${addr.slice(0, 6)}…${addr.slice(-4)}`}
              />
            </li>
          ))}
        </ul>
      </section>
    </Page>
  )
}

async function Explorer({ searchParams }: { searchParams: PageProps<"/explorer">["searchParams"] }) {
  const q = (await searchParams).q
  const active = EXPLORER_QUERIES.find((x) => x.id === q) ?? EXPLORER_QUERIES[0]
  if (!active) return null
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
      <nav aria-label="Queries" className="-mx-5 overflow-x-auto px-5 [scrollbar-width:none] lg:mx-0 lg:px-0">
        <ul className="flex gap-2 lg:flex-col">
          {EXPLORER_QUERIES.map((x) => (
            <li key={x.id} className="shrink-0">
              <Link
                href={`/explorer?q=${x.id}`}
                scroll={false}
                aria-current={x.id === active.id ? "page" : undefined}
                className={cn(
                  "block rounded-xl border px-3.5 py-2.5 text-[14px] transition-colors",
                  x.id === active.id
                    ? "border-foreground bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {x.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="min-w-0 space-y-4">
        <p className="max-w-[64ch] text-[15px] text-pretty">{active.why}</p>
        <pre className="overflow-x-auto [scrollbar-width:thin] rounded-[14px] bg-sunken p-4 font-mono text-[12.5px] leading-relaxed">
          <code>{active.code}</code>
        </pre>
        <Suspense key={active.id} fallback={<Skeleton className="h-64 w-full rounded-[14px]" />}>
          <QueryResult id={active.id} />
        </Suspense>
      </div>
    </div>
  )
}

async function runCached(id: string) {
  "use cache"
  cacheLife({ stale: 5, revalidate: 5, expire: 60 })
  const query = EXPLORER_QUERIES.find((x) => x.id === id)
  if (!query) return { ok: false as const, ms: 0, error: "unknown query" }
  const t0 = Date.now()
  try {
    const data = await query.run()
    return { ok: true as const, ms: Date.now() - t0, data }
  } catch (e) {
    console.error("[explorer]", (e as Error).message)
    return { ok: false as const, ms: Date.now() - t0, error: "Arkiv did not answer in time" }
  }
}

const KEY = /0x[0-9a-f]{64}/gi

async function QueryResult({ id }: { id: string }) {
  const res = await runCached(id)
  if (!res.ok) {
    return (
      <div role="status" className="rounded-[14px] border border-warning/40 bg-warning/5 p-4 text-[14px]">
        {res.error}. Try again in a few seconds.
      </div>
    )
  }
  const json = JSON.stringify(res.data, null, 2)
  const keys = [...new Set(json.match(KEY) ?? [])].slice(0, 6)
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-[13px] text-muted-foreground">
        <span>Live result from Rabdi testnet</span>
        <span className="tabular">{res.ms} ms</span>
      </div>
      <pre className="max-h-[420px] overflow-auto rounded-[14px] border bg-card p-4 font-mono text-[12px] leading-relaxed">
        <code>{json}</code>
      </pre>
      {keys.length ? (
        <ul className="flex flex-wrap gap-2">
          {keys.map((k) => (
            <li key={k}>
              <ProofLink kind="arkiv" href={links.arkivEntity(k)} label={`${k.slice(0, 8)}…${k.slice(-4)}`} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
