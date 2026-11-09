"use client"

// Live system map. Polls /api/live every 1.5 s and lights each module as the real services report it.
// Nothing here is simulated: "Replay" re-plays the last run's real, recorded events one by one.
import {
  ArrowUpRight,
  Bot,
  Check,
  Database,
  Film,
  HardDrive,
  type LucideIcon,
  Play,
  Receipt,
  ScanEye,
  ShieldCheck,
  Smartphone,
  UserCheck,
  Wallet,
  X,
} from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import type { HistoryItem, LiveRun, NodeId } from "@/lib/server/live"
import { cn } from "@/lib/utils"

type NodeDef = { id: NodeId; title: string; tag: string; icon: LucideIcon }

const LANES: { name: string; nodes: NodeDef[] }[] = [
  {
    name: "Person",
    nodes: [
      { id: "world", title: "World ID", tag: "World", icon: UserCheck },
      { id: "claim", title: "Slot claimed", tag: "Arkiv", icon: Smartphone },
      { id: "upload", title: "Clip uploaded", tag: "Worker", icon: Film },
    ],
  },
  {
    name: "Verifier",
    nodes: [
      { id: "checks", title: "Live checks", tag: "Duplicate check", icon: ShieldCheck },
      { id: "gemini", title: "AI watches", tag: "Gemini", icon: ScanEye },
      { id: "swarm", title: "Encrypted store", tag: "Swarm", icon: HardDrive },
      { id: "arkiv", title: "Verdict recorded", tag: "Arkiv", icon: Database },
    ],
  },
  {
    name: "Agent",
    nodes: [
      { id: "agent", title: "Spending rules", tag: "Buyer agent", icon: Bot },
      { id: "pass", title: "Human approval", tag: "World Agent Pass", icon: UserCheck },
      { id: "hedera", title: "Paid in USDC", tag: "Hedera x402", icon: Wallet },
      { id: "licence", title: "Receipt + licence", tag: "Arkiv", icon: Receipt },
    ],
  },
]
const ORDER: NodeId[] = LANES.flatMap((l) => l.nodes.map((n) => n.id))
const TITLE = Object.fromEntries(LANES.flatMap((l) => l.nodes.map((n) => [n.id, n.tag]))) as Record<
  NodeId,
  string
>
const ENDED = new Set(["rejected", "duplicate", "failed"])

type State = "idle" | "active" | "done" | "fresh" | "skipped" | "failed" | "rejected"

export function LiveMap() {
  const [run, setRun] = useState<LiveRun | null>(null)
  const [now, setNow] = useState(0)
  const [replay, setReplay] = useState<number | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let stop = false
    const load = async () => {
      const r = await fetch("/api/live", { cache: "no-store" }).catch(() => null)
      if (stop) return
      if (r?.ok) {
        setRun((await r.json()) as LiveRun)
        setError(false)
      } else setError(true)
    }
    load()
    setNow(Date.now())
    const t = setInterval(load, 1500)
    const c = setInterval(() => setNow(Date.now()), 500)
    return () => {
      stop = true
      clearInterval(t)
      clearInterval(c)
    }
  }, [])

  // Replay: walk through the recorded log, one event every 0.9 s.
  useEffect(() => {
    if (replay === null || !run) return
    if (replay >= run.log.length) {
      const t = setTimeout(() => setReplay(null), 2500)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setReplay((i) => (i === null ? null : i + 1)), 900)
    return () => clearTimeout(t)
  }, [replay, run])

  const view = useMemo(() => {
    if (!run || !now) return null
    const log = replay === null ? run.log : run.log.slice(0, replay)
    const done = new Map<NodeId, string>()
    let failed: NodeId | null = null
    for (const l of log) {
      if (l.ok) done.set(l.node, l.at)
      else failed ??= l.node
    }
    const lastAt = log.at(-1)?.at
    const age = lastAt ? now - Date.parse(lastAt) : Number.POSITIVE_INFINITY
    const ended =
      Boolean(failed) ||
      Boolean(replay === null && run.rejected) ||
      done.has("licence") ||
      (run.clip ? ENDED.has(run.clip.status) && replay === null : false)
    const inProgress = replay !== null ? replay < run.log.length : !ended && age < 10 * 60_000
    const skipped = new Set(replay === null || done.has("hedera") ? run.skipped : [])
    const active = inProgress ? ORDER.find((id) => !done.has(id) && !skipped.has(id)) : undefined
    const rejected = replay === null || done.has("gemini") ? run.rejected : null
    const state = (id: NodeId): State => {
      if (failed === id) return "failed"
      if (id === "gemini" && rejected && done.has("gemini")) return "rejected"
      const at = done.get(id)
      if (at) return replay === null && now - Date.parse(at) < 6000 ? "fresh" : "done"
      if (skipped.has(id)) return "skipped"
      if (id === active) return "active"
      return "idle"
    }
    return { log, state, inProgress, age, ended, lastAt, rejected }
  }, [run, replay, now])

  const start = run?.startedAt ? Date.parse(run.startedAt) : null

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-[14px]">
          <span
            className={cn(
              "size-2 rounded-full",
              error ? "bg-danger" : view?.inProgress ? "animate-pulse bg-signal" : "bg-success",
            )}
          />
          {error
            ? "Can't reach the server. Retrying…"
            : replay !== null
              ? "Replaying the last run from its recorded events"
              : view?.rejected && !view.inProgress
                ? `Last clip not accepted: ${view.rejected}`
                : view?.inProgress
                  ? "A clip is moving through the system right now"
                  : view?.lastAt
                    ? `Waiting for the next clip · last run ${ago(now - Date.parse(view.lastAt))}`
                    : "Waiting for the first clip"}
        </div>
        <div className="flex items-center gap-2">
          {run?.amount ? (
            <span className="rounded-full border px-3 py-1 text-[13px] tabular">{run.amount} USDC task</span>
          ) : null}
          <button
            type="button"
            onClick={() => setReplay(0)}
            disabled={!run?.log.length || replay !== null}
            className="inline-flex h-9 items-center gap-1.5 rounded-[8px] border border-input px-3 text-[13.5px] font-medium transition-colors hover:bg-secondary disabled:opacity-50"
          >
            <Play className="size-3.5" />
            Replay last run
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section aria-label="System map" className="dot-grid rounded-[18px] border bg-card/60 p-4 md:p-6">
          <div className="space-y-6">
            {LANES.map((lane, li) => (
              <div key={lane.name}>
                <div className="mb-2.5 flex items-center gap-2 text-[12px] font-medium tracking-[0.12em] text-muted-foreground">
                  <span className="grid size-5 place-items-center rounded-full border text-[11px] tabular">
                    {li + 1}
                  </span>
                  {lane.name.toUpperCase()}
                </div>
                <ol className="flex flex-col gap-2 md:flex-row md:items-stretch md:gap-0">
                  {lane.nodes.map((n, i) => {
                    const s = view?.state(n.id) ?? "idle"
                    const prevDone =
                      i > 0 && ["done", "fresh"].includes(view?.state(lane.nodes[i - 1].id) ?? "")
                    return (
                      <li key={n.id} className="flex min-w-0 flex-col md:flex-1 md:flex-row md:items-center">
                        {i > 0 ? (
                          <span
                            aria-hidden="true"
                            className={cn(
                              "mx-auto h-3 w-px md:mx-0 md:h-px md:w-5 md:shrink-0",
                              prevDone ? "bg-signal" : "bg-border",
                              s === "active" && "live-wire",
                            )}
                          />
                        ) : null}
                        <NodeCard
                          def={n}
                          state={s}
                          at={run && view ? lastFor(view.log, n.id) : undefined}
                          start={start}
                        />
                      </li>
                    )
                  })}
                </ol>
              </div>
            ))}
          </div>
          <p className="mt-6 text-[12.5px] text-muted-foreground">
            Each box lights up when that service reports back. Green means done, orange means working now.
          </p>
        </section>

        <LogPanel log={view?.log ?? []} start={start} />
      </div>

      <History items={run?.history ?? []} />
    </div>
  )
}

function NodeCard({
  def,
  state,
  at,
  start,
}: {
  def: NodeDef
  state: State
  at?: string
  start: number | null
}) {
  const Icon = def.icon
  const isDone = state === "done" || state === "fresh"
  return (
    <div
      className={cn(
        "relative flex min-w-0 flex-1 items-center gap-3 rounded-[14px] border bg-background px-3.5 py-3 transition-all duration-500",
        state === "idle" && "opacity-55",
        state === "skipped" && "border-dashed opacity-55",
        state === "active" &&
          "border-signal shadow-[0_0_0_4px_color-mix(in_oklab,var(--signal)_18%,transparent)]",
        state === "fresh" && "border-signal bg-signal-soft",
        state === "done" && "border-success/50",
        state === "failed" && "border-danger",
        state === "rejected" && "border-signal/60 bg-signal-soft",
      )}
    >
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-full border",
          isDone && "border-success/40 bg-success-soft text-success-text",
          state === "active" && "border-signal bg-signal text-signal-ink",
          state === "failed" && "border-danger bg-danger text-white",
          state === "rejected" && "border-signal/50 bg-card text-signal-text",
        )}
      >
        {state === "failed" || state === "rejected" ? (
          <X className="size-4" />
        ) : isDone ? (
          <Check className="size-4" strokeWidth={2.6} />
        ) : (
          <Icon className={cn("size-4", state === "active" && "animate-pulse")} strokeWidth={1.9} />
        )}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[14px] font-medium">{def.title}</span>
        <span className="block truncate text-[12px] text-muted-foreground">
          {state === "active"
            ? `${def.tag} · working…`
            : state === "skipped"
              ? "Not needed: under 5 USDC"
              : state === "failed"
                ? `${def.tag} · stopped`
                : state === "rejected"
                  ? `${def.tag} · not accepted`
                  : isDone && at && start
                    ? `${def.tag} · +${((Date.parse(at) - start) / 1000).toFixed(1)} s`
                    : def.tag}
        </span>
      </span>
    </div>
  )
}

function LogPanel({ log, start }: { log: LiveRun["log"]; start: number | null }) {
  const ref = useRef<HTMLOListElement>(null)
  const count = log.length
  useEffect(() => {
    if (count && ref.current) ref.current.scrollTop = ref.current.scrollHeight
  }, [count])
  return (
    <section aria-label="Live log" className="flex max-h-[640px] flex-col rounded-[18px] border bg-card">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-[14px] font-semibold">Live log</h2>
        <span className="text-[12px] text-muted-foreground">{count} events · newest last</span>
      </div>
      <ol ref={ref} aria-live="polite" className="flex-1 space-y-1 overflow-y-auto p-2">
        {count === 0 ? (
          <li className="p-3 text-[13.5px] text-muted-foreground">
            Nothing yet. Claim a task on your phone and watch it appear here.
          </li>
        ) : null}
        {log.map((l, i) => (
          <li
            key={`${l.at}-${l.node}-${i}`}
            className="rounded-[10px] px-2.5 py-2 animate-in fade-in slide-in-from-bottom-1 duration-300 hover:bg-secondary"
          >
            <div className="flex items-center gap-2 text-[11.5px] text-muted-foreground">
              <span className="font-mono tabular">{clock(l.at)}</span>
              {start ? (
                <span className="tabular">+{((Date.parse(l.at) - start) / 1000).toFixed(1)} s</span>
              ) : null}
              <span
                className={cn(
                  "ml-auto rounded-full border px-1.5 py-px text-[10.5px] font-medium",
                  l.ok ? "text-foreground/80" : "border-danger/50 text-danger",
                )}
              >
                {TITLE[l.node]}
              </span>
            </div>
            <div className="mt-0.5 flex items-start justify-between gap-2">
              <span className="text-[13.5px] leading-snug">{l.text}</span>
              {l.proof ? (
                <a
                  href={l.proof.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-0.5 rounded-full border px-2 py-0.5 text-[11.5px] font-medium hover:border-signal hover:text-signal-text"
                >
                  {l.proof.label}
                  <ArrowUpRight className="size-3" />
                </a>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

function lastFor(log: LiveRun["log"], id: NodeId) {
  for (let i = log.length - 1; i >= 0; i--) if (log[i].node === id && log[i].ok) return log[i].at
  return undefined
}

function clock(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", { hour12: false })
}

function ago(ms: number) {
  const s = Math.max(0, Math.round(ms / 1000))
  if (s < 60) return `${s} s ago`
  const m = Math.round(s / 60)
  if (m < 60) return `${m} min ago`
  return `${Math.round(m / 60)} h ago`
}

function History({ items }: { items: HistoryItem[] }) {
  if (items.length === 0) return null
  return (
    <section aria-label="Recent clips" className="rounded-[18px] border bg-card">
      <div className="flex items-center justify-between border-b px-5 py-3.5">
        <h2 className="text-[15px] font-semibold">Recent clips</h2>
        <span className="text-[12px] text-muted-foreground">Newest first · every link is a public proof</span>
      </div>
      <ul className="divide-y">
        {items.map((c) => {
          const accepted = c.verdict === "accept"
          const rejected = c.verdict === "reject" || c.status === "duplicate"
          return (
            <li key={c.id} className="flex flex-col gap-2 px-5 py-3.5 md:flex-row md:items-center md:gap-5">
              <span className="w-[120px] shrink-0 text-[12.5px] text-muted-foreground tabular">
                {new Date(c.at).toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </span>
              <span className="flex min-w-0 flex-1 items-center gap-2.5">
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[11.5px] font-semibold",
                    accepted && "bg-success-soft text-success-text",
                    rejected && "bg-signal-soft text-signal-text",
                    !accepted && !rejected && "bg-secondary text-muted-foreground",
                  )}
                >
                  {accepted
                    ? "Accepted"
                    : c.status === "duplicate"
                      ? "Duplicate"
                      : rejected
                        ? "Not accepted"
                        : c.status === "failed"
                          ? "Check failed"
                          : "Checking"}
                </span>
                <span className="truncate text-[13.5px] text-muted-foreground">
                  {accepted
                    ? c.amount
                      ? `Paid ${c.amount} USDC${c.approvedByHuman ? " · approved with World ID" : " · paid by the agent"}`
                      : "Waiting for the agent to pay"
                    : (c.reason ?? "")}
                </span>
              </span>
              <span className="flex shrink-0 flex-wrap items-center gap-1.5">
                {c.proofs.map((p) => (
                  <a
                    key={p.label}
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-[11.5px] font-medium hover:border-signal hover:text-signal-text"
                  >
                    {p.label}
                    <ArrowUpRight className="size-3" />
                  </a>
                ))}
                <a
                  href={`/submissions/${c.id}`}
                  className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-[11.5px] font-medium hover:bg-foreground hover:text-background"
                >
                  Open
                </a>
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
