// Selling an accepted clip over x402 (system architecture §12, decision D12).
//   saleFor()         what's for sale at this path: accepted? price? who gets paid? (no payment yet)
//   recordSettled()   runs only after Hedera settlement: receipt + licence on Arkiv, payment row updated
import "server-only"
import { approvals, claimsPrivate, clipKeys, contributors, db, eq, jobs, payments, sql } from "@adx/db"
import { S, safeChangeOwner, safeCreate, taskByKey, WRITERS } from "@adx/shared/arkiv"
import { sha256Hex } from "@adx/shared/crypto"
import { ExpirationTime } from "@arkiv-network/sdk"
import { addr, dec, key as keyV, str } from "@arkiv-network/sdk/schema"
import type { Hex } from "viem"

export type Sale = {
  submissionKey: Hex
  taskKey: Hex
  priceUsd: string // e.g. "3"
  payTo: string // contributor's Hedera account (falls back to the merchant)
  contributorWallet: Hex | null
  swarmRef: string
  cipherSha256: string
  aesKeyHex: string
}

export type SaleLookup =
  | { ok: true; sale: Sale }
  | { ok: false; status: 404 | 409; code: string; message: string }

const KEY = /^0x[0-9a-f]{64}$/i

export async function saleFor(submissionKey: string): Promise<SaleLookup> {
  if (!KEY.test(submissionKey)) return { ok: false, status: 404, code: "not_found", message: "No such clip" }
  const d = db()
  const [job] = await d
    .select({ status: jobs.status, taskKey: jobs.taskKey, claimKey: jobs.claimKey })
    .from(jobs)
    .where(sql`lower(${jobs.submissionKey}) = ${submissionKey.toLowerCase()}`)
    .limit(1)
  if (!job || job.status !== "accepted") {
    return { ok: false, status: 404, code: "not_for_sale", message: "Only accepted clips are for sale" }
  }
  const [paid] = await d
    .select({ status: payments.status })
    .from(payments)
    .where(sql`lower(${payments.submissionKey}) = ${submissionKey.toLowerCase()}`)
    .limit(1)
  if (paid && paid.status === "settled") {
    return { ok: false, status: 409, code: "already_sold", message: "This clip was already bought" }
  }
  const [ck] = await d
    .select()
    .from(clipKeys)
    .where(sql`lower(${clipKeys.submissionKey}) = ${submissionKey.toLowerCase()}`)
    .limit(1)
  if (!ck) return { ok: false, status: 404, code: "not_found", message: "Clip key missing" }
  const task = await taskByKey(job.taskKey as Hex)
  if (!task) return { ok: false, status: 404, code: "task_gone", message: "The task for this clip is gone" }
  const [cp] = await d
    .select({ wallet: claimsPrivate.wallet })
    .from(claimsPrivate)
    .where(eq(claimsPrivate.claimKey, job.claimKey))
    .limit(1)
  const [c] = cp
    ? await d
        .select({ hedera: contributors.hederaAccount })
        .from(contributors)
        .where(eq(contributors.wallet, cp.wallet))
        .limit(1)
    : []
  return {
    ok: true,
    sale: {
      submissionKey: submissionKey.toLowerCase() as Hex,
      taskKey: job.taskKey as Hex,
      priceUsd: task.reward,
      payTo: c?.hedera ?? (process.env.HEDERA_MERCHANT_ID as string),
      contributorWallet: (cp?.wallet as Hex | undefined) ?? null,
      swarmRef: ck.swarmRef,
      cipherSha256: ck.cipherSha256,
      aesKeyHex: Buffer.from(ck.aesKey).toString("hex"),
    },
  }
}

/** Reserve the sale row before settlement (idempotent per clip). Returns false if someone else holds it. */
export async function reserveSale(sale: Sale): Promise<boolean> {
  const r = await db().execute(sql`
    insert into payments (submission_key, amount, pay_to, status)
    values (${sale.submissionKey}, ${sale.priceUsd}, ${sale.payTo}, 'settling')
    on conflict (submission_key) do update set status = 'settling', updated_at = now()
      where payments.status in ('failed')
    returning id`)
  return r.rows.length > 0
}

export async function markFailed(submissionKey: string, reason: string) {
  await db()
    .update(payments)
    .set({ status: "failed", updatedAt: new Date() })
    .where(
      sql`lower(${payments.submissionKey}) = ${submissionKey.toLowerCase()} and ${payments.status} = 'settling'`,
    )
  console.warn("[x402] settlement failed", submissionKey.slice(0, 10), reason)
}

/**
 * After settlement only: receipt (verifier wallet, mode "live") and licence (created by the platform,
 * then owned by the contributor's wallet) on Arkiv, plus the Hedera tx on the payment row.
 */
export async function recordSettled(sale: Sale, hederaTx: string, approval: string) {
  const d = db()
  await d
    .update(payments)
    .set({ status: "settled", hederaTx, updatedAt: new Date() })
    .where(sql`lower(${payments.submissionKey}) = ${sale.submissionKey}`)
  const exp = ExpirationTime.fromDays(180)
  const [receipt, licence] = await Promise.all([
    safeCreate(
      "verifier",
      S.Receipt,
      {
        task: keyV(sale.taskKey),
        submission: keyV(sale.submissionKey),
        mode: str("live"),
        network: str("hedera:testnet"),
        hederaTx: str(hederaTx),
        usdc: dec(sale.priceUsd),
        payTo: str(sale.payTo),
        approval: str(approval),
      },
      exp,
    ),
    sale.contributorWallet
      ? safeCreate(
          "web",
          S.Licence,
          {
            submission: keyV(sale.submissionKey),
            task: keyV(sale.taskKey),
            licensee: addr(WRITERS.buyer), // the buyer agent that paid
            status: str("granted"),
            scope: str("robot-training, non-exclusive, 90 days, withdrawable"),
            termsHash: str(
              sha256Hex(
                "paradigm-licence-v1: robot-training, non-exclusive, 90 days, withdrawable by the owner",
              ),
            ),
          },
          ExpirationTime.fromDays(90),
        )
      : Promise.resolve(null),
  ])
  // The contributor owns their licence: only they can withdraw (delete) it.
  if (licence && sale.contributorWallet)
    await safeChangeOwner("web", licence.entityKey, sale.contributorWallet)
  await d
    .update(payments)
    .set({ receiptKey: receipt.entityKey, licenceKey: licence?.entityKey ?? null, updatedAt: new Date() })
    .where(sql`lower(${payments.submissionKey}) = ${sale.submissionKey}`)
  console.log(
    JSON.stringify({
      evt: "sold",
      submission: sale.submissionKey.slice(0, 10),
      tx: hederaTx,
      receipt: receipt.entityKey,
      licence: licence?.entityKey,
    }),
  )
  return { receiptKey: receipt.entityKey, licenceKey: licence?.entityKey ?? null }
}

/** True only if a human approved this exact clip's payment with World Agent Pass. */
export async function approvedByAgentPass(submissionKey: string): Promise<boolean> {
  const [a] = await db()
    .select({ id: approvals.id })
    .from(approvals)
    .where(
      sql`lower(${approvals.submissionKey}) = ${submissionKey.toLowerCase()} and ${approvals.status} = 'approved'`,
    )
    .limit(1)
  return Boolean(a)
}
