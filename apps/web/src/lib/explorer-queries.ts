// The named queries the explorer page runs. `code` is the exact SDK call (shown to judges);
// `run` executes the same query from packages/shared/src/arkiv/queries.ts.
import "server-only"
import { liveVerifiers, networkCounts, openTasks, submissionsByBucket } from "@adx/shared/arkiv"

export type ExplorerQuery = {
  id: string
  title: string
  why: string
  code: string
  run: () => Promise<unknown>
}

export const EXPLORER_QUERIES: ExplorerQuery[] = [
  {
    id: "open-tasks",
    title: "Open tasks",
    why: "What the task board shows. Only tasks signed by our buyer agent count, so nobody can inject fake work.",
    code: `client.select()
  .from(Task)                       // adx.task
  .where(eq("status", "open"))
  .ownedBy(BUYER_AGENT)             // 0x0F00…Dcc6
  .orderBy(desc("reward"))
  .limit(50)
  .fetch()`,
    run: async () =>
      (await openTasks()).map(({ rubric, ...t }) => ({
        ...t,
        rubric: rubric ? `${rubric.steps.length} steps` : null,
      })),
  },
  {
    id: "verifiers",
    title: "Live verifiers",
    why: "Buyer agents discover who can check clips, at what price, and where to pay. The listing expires unless its owner keeps it alive.",
    code: `client.select()
  .from(Verifier)                   // adx.verifier
  .where(and(eq("skill", "towel-fold"), eq("status", "live")))
  .ownedBy(VERIFIER)                // 0x0C73…F421
  .fetch()`,
    run: () => liveVerifiers("towel-fold"),
  },
  {
    id: "counts",
    title: "Network totals",
    why: "Headline numbers on the landing page, counted on Arkiv rather than in our database.",
    code: `client.count().from(Task).where(eq("status", "open")).ownedBy(BUYER_AGENT).fetch()
client.count().from(Claim).ownedBy(PLATFORM_WEB).fetch()
client.count().from(Submission).ownedBy(PLATFORM_WORKER).fetch()
client.count().from(Verification).ownedBy(VERIFIER).fetch()
client.count().from(Receipt).ownedBy(VERIFIER).fetch()
client.count().from(Licence).where(eq("$creator", PLATFORM_WEB)).fetch()`,
    run: () => networkCounts(),
  },
  {
    id: "dedup",
    title: "Duplicate check",
    why: "Before paying, any buyer can check whether a clip's fingerprint is already on Arkiv. Not owner-filtered on purpose: it works across every buyer.",
    code: `client.select({ $key: true, $owner: true, dhash: true, task: true })
  .from(Submission)                 // adx.submission
  .where(or(eq("dhashA", a), eq("dhashB", b), eq("dhashC", c)))
  .limit(100)
  .fetch()`,
    run: () => submissionsByBucket("abcd", "ef01", "2345"),
  },
]
