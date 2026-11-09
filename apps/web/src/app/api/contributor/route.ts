// GET /api/contributor?wallet=0x… → what /me shows for the wallet on this phone:
//   Hedera payout account, earnings + licences (settled payments for clips this person filmed), reputation.
// "This person" = the World ID behind this wallet's latest claim, so earnings follow the human across wallets.
// Display-safe only: no nullifiers or other wallets are returned.
import { contributors, db, eq, humans, sql } from "@adx/db"
import { checksLeft, FREE_CHECKS, isBlocked } from "@adx/shared/verdict"
import { NextResponse } from "next/server"
import { clientIp, fail, handle, rateLimit } from "@/lib/server/api"

export const GET = handle(async (req) => {
  await rateLimit("contributor", clientIp(req), 60, 60)
  const wallet = (new URL(req.url).searchParams.get("wallet") ?? "").toLowerCase()
  if (!/^0x[0-9a-f]{40}$/.test(wallet)) fail(400, "invalid", "wallet must be an address")
  const d = db()

  const [row] = await d
    .select({ hederaAccount: contributors.hederaAccount })
    .from(contributors)
    .where(eq(contributors.wallet, wallet))
    .limit(1)

  // The person behind this wallet (base nullifier; released claims carry a suffix).
  const who = await d.execute(sql`
    select split_part(nullifier, ':', 1) as n from claims_private
    where wallet = ${wallet} order by created_at desc limit 1`)
  const nullifier = (who.rows[0] as { n?: string } | undefined)?.n

  let items: Array<{ amount: number; tx: string | null; licenceKey: string | null; at: string }> = []
  let reputation = null
  if (nullifier) {
    const paid = await d.execute(sql`
      select p.amount::float as amount, p.hedera_tx, p.licence_key, p.updated_at
      from payments p
      join jobs j on lower(j.submission_key) = lower(p.submission_key)
      join claims_private c on c.claim_key = j.claim_key
      where split_part(c.nullifier, ':', 1) = ${nullifier} and p.status = 'settled'
      order by p.updated_at desc limit 50`)
    items = paid.rows.map((r) => {
      const x = r as {
        amount: number
        hedera_tx: string | null
        licence_key: string | null
        updated_at: string
      }
      return { amount: x.amount, tx: x.hedera_tx, licenceKey: x.licence_key, at: x.updated_at }
    })
    const [h] = await d.select().from(humans).where(eq(humans.nullifier, nullifier)).limit(1)
    const s = h ?? { accepted: 0, rejected: 0, rejectStreak: 0, checksUsed: 0 }
    reputation = {
      accepted: s.accepted,
      rejected: s.rejected,
      checksLeft: checksLeft(s),
      freeChecks: FREE_CHECKS,
      blocked: isBlocked(s),
    }
  }

  return NextResponse.json(
    {
      hederaAccount: row?.hederaAccount ?? null,
      earnedUsdc: Math.round(items.reduce((a, i) => a + i.amount, 0) * 100) / 100,
      licences: items.filter((i) => i.licenceKey),
      reputation,
    },
    { headers: { "cache-control": "no-store" } },
  )
})
