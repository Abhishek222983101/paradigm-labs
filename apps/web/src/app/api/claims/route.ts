// POST /api/claims → claim one slot on a task with World ID + the embedded wallet.
import { contributors, db, eq } from "@adx/db"
import { ensureContributorAccount } from "@adx/shared/hedera"
import { after, NextResponse } from "next/server"
import { z } from "zod"
import { clientIp, handle, parseJson, rateLimit } from "@/lib/server/api"
import { claimSlot } from "@/lib/server/claims"
import { idkitResultSchema } from "@/lib/server/world"

const body = z.object({
  taskKey: z
    .string()
    .regex(/^0x[0-9a-fA-F]{64}$/)
    .transform((s) => s.toLowerCase() as `0x${string}`),
  wallet: z
    .string()
    .regex(/^0x[0-9a-fA-F]{40}$/)
    .transform((s) => s as `0x${string}`),
  signature: z
    .string()
    .regex(/^0x[0-9a-fA-F]{130}$/)
    .transform((s) => s as `0x${string}`),
  idkit: idkitResultSchema.optional(),
  restart: z.boolean().optional(),
  restartToken: z.string().max(400).optional(),
})

export const POST = handle(async (req) => {
  await rateLimit("claim", clientIp(req), 8, 60)
  const input = await parseJson(req, body)
  await rateLimit("claim-wallet", input.wallet.toLowerCase(), 5, 60)
  const { res, publicKey, arkivDone } = await claimSlot(input)
  // The public Arkiv claim confirms after we reply (its key was predicted, so the client already has it).
  if (arkivDone) after(() => arkivDone)

  // Contributor's Hedera account (ECDSA alias, unlimited auto-associations) after the response is sent.
  if (!res.resumed) {
    after(async () => {
      try {
        const { accountId, txId } = await ensureContributorAccount(publicKey, input.wallet)
        await db()
          .update(contributors)
          .set({ hederaAccount: accountId })
          .where(eq(contributors.wallet, input.wallet.toLowerCase()))
        console.log("[claims] hedera account", accountId, txId ?? "(existing)")
      } catch (e) {
        console.error("[claims] hedera account failed", (e as Error).message)
      }
    })
  }
  return NextResponse.json(res, { status: res.resumed ? 200 : 201, headers: { "cache-control": "no-store" } })
})
