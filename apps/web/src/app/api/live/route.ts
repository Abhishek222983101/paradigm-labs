// GET /api/live → the most recent run across World ID, the worker, Gemini, Swarm, Arkiv, the agent and Hedera.
import { NextResponse } from "next/server"
import { clientIp, handle, rateLimit } from "@/lib/server/api"
import { liveRun } from "@/lib/server/live"

export const GET = handle(async (req) => {
  await rateLimit("live", clientIp(req), 240, 60)
  const run = await liveRun()
  return NextResponse.json(run, { headers: { "cache-control": "no-store" } })
})
