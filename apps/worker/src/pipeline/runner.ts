// Job runner: claims queued jobs with FOR UPDATE SKIP LOCKED (safe with several workers), runs the pipeline,
// retries transient failures up to 3 times with backoff, and requeues jobs stuck in "processing".

import type { dbPool } from "@adx/db"
import { events, sql } from "@adx/db"
import { type PipelineEnv, processJob } from "./run"

type DB = ReturnType<typeof dbPool>
const MAX_ATTEMPTS = 3

async function claimNext(db: DB) {
  const r = await db.execute(sql`
    update jobs set status = 'processing', attempts = attempts + 1, updated_at = now()
    where id = (
      select id from jobs
      where status = 'queued' and (updated_at is null or updated_at < now() - make_interval(secs => attempts * 20))
      order by created_at
      for update skip locked
      limit 1
    )
    returning *`)
  const row = r.rows[0] as Record<string, unknown> | undefined
  if (!row) return null
  return {
    id: row.id as string,
    claimKey: row.claim_key as string,
    taskKey: row.task_key as string,
    path: row.path as string,
    bytes: row.bytes as number | null,
    mime: row.mime as string | null,
    challenge: row.challenge as string | null,
    status: row.status as string,
    attempts: row.attempts as number,
    error: row.error as string | null,
    submissionKey: row.submission_key as string | null,
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date | null,
  }
}

export function startRunner(db: DB, env: PipelineEnv, concurrency = 2) {
  let stopped = false
  // Jobs left in "processing" by a crash or redeploy go back to the queue.
  void db.execute(
    sql`update jobs set status = 'queued' where status = 'processing' and updated_at < now() - interval '10 minutes'`,
  )

  const loop = async (slot: number) => {
    while (!stopped) {
      let job: Awaited<ReturnType<typeof claimNext>> = null
      try {
        job = await claimNext(db)
        if (!job) {
          await new Promise((r) => setTimeout(r, 1500))
          continue
        }
        const t0 = Date.now()
        const status = await processJob(db, env, job)
        console.log(JSON.stringify({ evt: "job_done", slot, job: job.id, status, ms: Date.now() - t0 }))
      } catch (e) {
        const msg = (e as Error).message?.slice(0, 300) ?? String(e)
        console.error(JSON.stringify({ evt: "job_error", slot, job: job?.id, attempt: job?.attempts, msg }))
        if (job) {
          const final = job.attempts >= MAX_ATTEMPTS
          await db
            .execute(
              sql`update jobs set status = ${final ? "failed" : "queued"}, error = ${msg}, updated_at = now() where id = ${job.id}`,
            )
            .catch(() => undefined)
          if (final) {
            await db
              .insert(events)
              .values([
                {
                  scope: `submission:${job.id}`,
                  step: "verdict",
                  ok: false,
                  ms: 0,
                  data: { reason: "The automatic check failed. We'll retry it." },
                },
                {
                  scope: `submission:${job.id}`,
                  step: "done",
                  ok: false,
                  ms: 0,
                  data: { verdict: "failed" },
                },
              ])
              .catch(() => undefined)
          }
        }
        await new Promise((r) => setTimeout(r, 2000))
      }
    }
  }
  for (let i = 0; i < concurrency; i++) void loop(i)
  return () => {
    stopped = true
  }
}
