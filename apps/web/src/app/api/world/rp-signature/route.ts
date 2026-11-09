// POST /api/world/rp-signature → RP context for IDKit (signed server-side; the key never leaves the server).
// Only our one action can be signed: the client can't ask us to sign anything else.
import { NextResponse } from "next/server"
import { clientIp, handle, rateLimit } from "@/lib/server/api"
import { rpContext, world } from "@/lib/server/world"

export const POST = handle(async (req) => {
  await rateLimit("rp-sig", clientIp(req), 20, 60)
  const w = world()
  return NextResponse.json(
    { app_id: w.WORLD_APP_ID, action: w.WORLD_ACTION, environment: w.WORLD_ENV, rp_context: rpContext() },
    { headers: { "cache-control": "no-store" } },
  )
})
