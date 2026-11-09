// Real data for the buyer console. Display-safe fields only (no device codes, no keys).
import "server-only"
import { approvals, db, desc, eq, events, jobs } from "@adx/db"
import { connection } from "next/server"
import QRCode from "qrcode"

const fmt = (d: Date) =>
  d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  })

export async function recentClips(limit = 8) {
  await connection()
  const rows = await db()
    .select({ id: jobs.id, status: jobs.status, bytes: jobs.bytes, createdAt: jobs.createdAt })
    .from(jobs)
    .orderBy(desc(jobs.createdAt))
    .limit(limit)
  return rows.map((r) => ({ id: r.id, status: r.status, bytes: r.bytes, time: fmt(r.createdAt) }))
}

export type AgentEvent = {
  id: number
  time: string
  action: string
  amount?: number
  tx?: string
  hcsTx?: string
  note?: string | null
  reason?: string
  submissionKey?: string
}

export async function agentFeed(limit = 15): Promise<AgentEvent[]> {
  await connection()
  const rows = await db()
    .select()
    .from(events)
    .where(eq(events.scope, "agent"))
    .orderBy(desc(events.id))
    .limit(limit)
  return rows.map((r) => {
    const d = (r.data ?? {}) as Record<string, unknown>
    return {
      id: r.id,
      time: fmt(r.createdAt),
      action: r.step,
      amount: typeof d.amount === "number" ? d.amount : undefined,
      tx: typeof d.tx === "string" ? d.tx : undefined,
      hcsTx: typeof d.hcsTx === "string" ? d.hcsTx : undefined,
      note: typeof d.note === "string" ? d.note : null,
      reason: typeof d.reason === "string" ? d.reason : undefined,
      submissionKey: typeof d.submissionKey === "string" ? d.submissionKey : undefined,
    }
  })
}

export type PendingApproval = {
  id: string
  amount: string
  payTo: string
  userCode: string
  url: string
  qrSvg: string
  createdAt: string
}

export async function pendingApprovals(): Promise<PendingApproval[]> {
  await connection()
  const rows = await db()
    .select()
    .from(approvals)
    .where(eq(approvals.status, "pending"))
    .orderBy(desc(approvals.createdAt))
    .limit(3)
  return Promise.all(
    rows
      .filter((a) => a.verificationUri?.startsWith("https://auth.world.org/"))
      .map(async (a) => ({
        id: a.id,
        amount: a.amount,
        payTo: a.payTo,
        userCode: a.userCode ?? "",
        url: a.verificationUri as string,
        qrSvg: await QRCode.toString(a.verificationUri as string, { type: "svg", margin: 1, width: 180 }),
        createdAt: fmt(a.createdAt),
      })),
  )
}

export async function approvalById(id: string) {
  await connection()
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null
  const [a] = await db().select().from(approvals).where(eq(approvals.id, id)).limit(1)
  if (!a) return null
  return {
    id: a.id,
    status: a.status,
    amount: a.amount,
    payTo: a.payTo,
    userCode: a.userCode ?? "",
    url: a.verificationUri?.startsWith("https://auth.world.org/") ? a.verificationUri : null,
    qrSvg: a.verificationUri
      ? await QRCode.toString(a.verificationUri, { type: "svg", margin: 1, width: 200 })
      : "",
  }
}
