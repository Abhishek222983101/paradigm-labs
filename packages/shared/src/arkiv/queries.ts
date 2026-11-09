// Every Arkiv read the product makes, by name. The explorer page and the README show these same queries.
// All reads are owner-filtered to our writer wallets, except dedup (cross-buyer on purpose).
import { and, desc, eq, or } from "@arkiv-network/sdk/query"
import { addr, key as keyV, str } from "@arkiv-network/sdk/schema"
import { type Hex, hexToString } from "viem"
import { type Rubric, rubricSchema } from "../rubric"
import { type ArkivPublic, arkivPublic } from "./client"
import { S } from "./schemas"
import { WRITERS } from "./wallets"

export type TaskDTO = {
  key: Hex
  title: string
  skill: string
  status: string
  reward: string
  slots: number
  filled: number
  deadline: number
  failureTag: string
  rubricRef: string
  rubricHash: string
  rubric: Rubric | null
  owner: Hex
}

type TaskRow = {
  $key: Hex
  $owner: Hex
  title: { value: string }
  skill: { value: string }
  status: { value: string }
  reward: { value: string }
  slots: { value: bigint }
  filled: { value: bigint }
  deadline: { value: bigint }
  failureTag: { value: string }
  rubricRef: { value: string }
  rubricHash: { value: string }
  rubric?: { value: Hex }
}

function parseRubric(hex: Hex | undefined): Rubric | null {
  if (!hex || hex === "0x") return null
  try {
    const r = rubricSchema.safeParse(JSON.parse(hexToString(hex)))
    return r.success ? r.data : null
  } catch {
    return null
  }
}

function toTask(r: TaskRow): TaskDTO {
  return {
    key: r.$key,
    owner: r.$owner,
    title: r.title.value,
    skill: r.skill.value,
    status: r.status.value,
    reward: r.reward.value,
    slots: Number(r.slots.value),
    filled: Number(r.filled.value),
    deadline: Number(r.deadline.value),
    failureTag: r.failureTag.value,
    rubricRef: r.rubricRef.value,
    rubricHash: r.rubricHash.value,
    rubric: parseRubric(r.rubric?.value),
  }
}

/** Open tasks posted by our buyer agent, soonest deadline first. */
export async function openTasks(pub: ArkivPublic = arkivPublic(), limit = 50): Promise<TaskDTO[]> {
  const res = await pub
    .select()
    .from(S.Task)
    .where(eq("status", "open"))
    .ownedBy(WRITERS.buyer)
    .orderBy(desc("reward"))
    .limit(limit)
    .fetch()
  const now = Math.floor(Date.now() / 1000)
  return (res.entities as unknown as TaskRow[]).map(toTask).filter((t) => t.deadline > now)
}

export async function taskByKey(taskKey: Hex, pub: ArkivPublic = arkivPublic()): Promise<TaskDTO | null> {
  const res = await pub
    .select()
    .from(S.Task)
    .where(eq("$key", keyV(taskKey)))
    .ownedBy(WRITERS.buyer)
    .limit(1)
    .fetch()
  const row = res.entities[0] as unknown as TaskRow | undefined
  return row ? toTask(row) : null
}

/** How many live claims hold slots on a task (claims expire on their own after 2 h if unused). */
export async function activeClaimsForTask(taskKey: Hex, pub: ArkivPublic = arkivPublic()): Promise<number> {
  const n = await pub
    .count()
    .from(S.Claim)
    .where(and(eq("task", keyV(taskKey)), or(eq("status", "active"), eq("status", "submitted"))))
    .ownedBy(WRITERS.web)
    .fetch()
  return Number(n)
}

export type ClaimDTO = {
  key: Hex
  task: Hex
  status: string
  slot: number
  claimant: string
  challenge: string
}
export async function claimByKey(claimKey: Hex, pub: ArkivPublic = arkivPublic()): Promise<ClaimDTO | null> {
  const res = await pub
    .select()
    .from(S.Claim)
    .where(eq("$key", keyV(claimKey)))
    .ownedBy(WRITERS.web)
    .limit(1)
    .fetch()
  const r = res.entities[0] as unknown as
    | {
        $key: Hex
        task: { value: Hex }
        status: { value: string }
        slot: { value: bigint }
        claimant: { value: string }
        challenge: { value: string }
      }
    | undefined
  return r
    ? {
        key: r.$key,
        task: r.task.value,
        status: r.status.value,
        slot: Number(r.slot.value),
        claimant: r.claimant.value,
        challenge: r.challenge.value,
      }
    : null
}

/** Cross-buyer dedup: any submission (anyone's) sharing a 4-hex bucket. Not owner-filtered on purpose. */
export async function submissionsByBucket(a: string, b: string, c: string, pub: ArkivPublic = arkivPublic()) {
  const res = await pub
    .select({ $key: true, $owner: true, dhash: true, task: true })
    .from(S.Submission)
    .where(or(eq("dhashA", str(a)), eq("dhashB", str(b)), eq("dhashC", str(c))))
    .limit(100)
    .fetch()
  return res.entities.map((r) => ({ key: r.$key, owner: r.$owner, dhash: r.dhash.value, task: r.task.value }))
}

export async function liveVerifiers(skill: string, pub: ArkivPublic = arkivPublic()) {
  const res = await pub
    .select()
    .from(S.Verifier)
    .where(and(eq("skill", skill), eq("status", "live")))
    .ownedBy(WRITERS.verifier)
    .limit(10)
    .fetch()
  return res.entities.map((r) => ({
    key: r.$key,
    skill: r.skill.value,
    price: r.price.value,
    endpoint: r.endpoint.value,
    payTo: r.payTo.value,
    model: r.model.value,
    expiresAtBlock: Number(r.$expiresAt),
  }))
}

/** Headline counts for the landing page, straight from Arkiv. */
export async function networkCounts(pub: ArkivPublic = arkivPublic()) {
  const [openTaskCount, claims, submissions, verifications, receipts, licences] = await Promise.all([
    pub.count().from(S.Task).where(eq("status", "open")).ownedBy(WRITERS.buyer).fetch(),
    pub.count().from(S.Claim).ownedBy(WRITERS.web).fetch(),
    pub.count().from(S.Submission).ownedBy(WRITERS.worker).fetch(),
    pub.count().from(S.Verification).ownedBy(WRITERS.verifier).fetch(),
    pub.count().from(S.Receipt).ownedBy(WRITERS.verifier).fetch(),
    pub
      .count()
      .from(S.Licence)
      .where(eq("$creator", addr(WRITERS.web)))
      .fetch(),
  ])
  return {
    openTasks: Number(openTaskCount),
    claims: Number(claims),
    submissions: Number(submissions),
    verifications: Number(verifications),
    receipts: Number(receipts),
    licences: Number(licences),
  }
}
