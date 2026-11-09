// Public view of one submission for its status page. Only display-safe fields: no wallet, no nullifier,
// no file path, no keys. The id is a random UUID the uploader received.
import "server-only"
import { approvals, asc, claimsPrivate, db, eq, events, jobs, payments, sql } from "@adx/db"
import { claimByKey } from "@adx/shared/arkiv"
import { decodeChallenge } from "@adx/shared/challenge"
import type { PipelineEvent } from "@adx/shared/events"

export type SubmissionView = {
  id: string
  taskKey: string
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
    approvedByHuman: boolean
  } | null
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const isSubmissionId = (s: string) => UUID.test(s)

export async function submissionView(id: string): Promise<SubmissionView | null> {
  if (!isSubmissionId(id)) return null
  const d = db()
  const [job] = await d
    .select({
      id: jobs.id,
      taskKey: jobs.taskKey,
      claimKey: jobs.claimKey,
      status: jobs.status,
      bytes: jobs.bytes,
      challenge: jobs.challenge,
      submissionKey: jobs.submissionKey,
      createdAt: jobs.createdAt,
    })
    .from(jobs)
    .where(eq(jobs.id, id))
    .limit(1)
  if (!job) return null
  const [claim] = await d
    .select({ challenge: claimsPrivate.challenge })
    .from(claimsPrivate)
    .where(eq(claimsPrivate.claimKey, job.claimKey))
    .limit(1)
  const evs = await d
    .select()
    .from(events)
    .where(eq(events.scope, `submission:${id}`))
    .orderBy(asc(events.id))
    .limit(50)
  const [pay] = job.submissionKey
    ? await d
        .select()
        .from(payments)
        .where(sql`lower(${payments.submissionKey}) = ${job.submissionKey.toLowerCase()}`)
        .limit(1)
    : []
  // A World Agent Pass approval is recorded in its own table, keyed by the submission.
  const [approved] =
    pay && job.submissionKey
      ? await d
          .select({ id: approvals.id })
          .from(approvals)
          .where(
            sql`lower(${approvals.submissionKey}) = ${job.submissionKey.toLowerCase()} and ${approvals.status} = 'approved'`,
          )
          .limit(1)
      : []
  return {
    payment: pay
      ? {
          status: pay.status,
          amount: pay.amount,
          hederaTx: pay.hederaTx,
          receiptKey: pay.receiptKey,
          licenceKey: pay.licenceKey,
          payTo: pay.payTo,
          approvedByHuman: Boolean(pay.approvalId || approved),
        }
      : null,
    id: job.id,
    taskKey: job.taskKey,
    status: job.status,
    bytes: job.bytes,
    receivedAt: job.createdAt.toISOString(),
    challenge: job.challenge
      ? decodeChallenge(job.challenge)
      : claim?.challenge
        ? decodeChallenge(claim.challenge)
        : await challengeFromArkiv(job.claimKey),
    events: evs.map((e) => ({
      id: e.id,
      step: e.step as PipelineEvent["step"],
      ok: e.ok,
      ms: e.ms,
      at: e.createdAt.toISOString(),
      data: (e.data ?? undefined) as PipelineEvent["data"],
    })),
  }
}

/** The challenge is public on the Arkiv claim, so it survives even if the private row was released. */
async function challengeFromArkiv(claimKey: string) {
  if (!/^0x[0-9a-f]{64}$/i.test(claimKey)) return null
  const c = await claimByKey(claimKey as `0x${string}`).catch(() => null)
  return c ? decodeChallenge(c.challenge) : null
}
