// Server-side data access for pages. Arkiv reads are cached for a few seconds (system architecture §9.1)
// and never throw into the UI: a failed read becomes { ok: false } so pages can show "Syncing with Arkiv…"
// instead of fake data or a crash.
import "server-only"
import { liveVerifiers, networkCounts, openTasks, type TaskDTO, taskByKey } from "@adx/shared/arkiv"
import { cacheLife } from "next/cache"
import type { Hex } from "viem"
import { liveClaimCount } from "./server/claims"

export type Result<T> = { ok: true; data: T; at: number } | { ok: false; error: string; at: number }

async function attempt<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    return { ok: true, data: await fn(), at: Date.now() }
  } catch (e) {
    console.error("[arkiv]", (e as Error).message)
    return { ok: false, error: "Arkiv did not answer in time", at: Date.now() }
  }
}

export async function getOpenTasks(): Promise<Result<TaskDTO[]>> {
  "use cache"
  cacheLife({ stale: 5, revalidate: 5, expire: 60 })
  return attempt(async () => withFilled(await openTasks()))
}

/** Slots taken = live reservations in Neon (authoritative, instant); never below the on-chain value. */
async function withFilled(tasks: TaskDTO[]): Promise<TaskDTO[]> {
  return Promise.all(
    tasks.map(async (t) => {
      const n = await liveClaimCount(t.key).catch(() => 0)
      return { ...t, filled: Math.max(t.filled, n) }
    }),
  )
}

export async function getTask(key: Hex): Promise<Result<TaskDTO | null>> {
  "use cache"
  cacheLife({ stale: 5, revalidate: 5, expire: 60 })
  return attempt(async () => {
    const t = await taskByKey(key)
    return t ? ((await withFilled([t]))[0] ?? null) : null
  })
}

export async function getCounts() {
  "use cache"
  cacheLife({ stale: 10, revalidate: 10, expire: 120 })
  return attempt(() => networkCounts())
}

export async function getVerifiers(skill: string) {
  "use cache"
  cacheLife({ stale: 10, revalidate: 10, expire: 120 })
  return attempt(() => liveVerifiers(skill))
}

export const isEntityKey = (s: string): s is Hex => /^0x[0-9a-f]{64}$/i.test(s)
