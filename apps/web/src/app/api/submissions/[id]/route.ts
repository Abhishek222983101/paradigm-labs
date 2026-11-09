// GET /api/submissions/:id → live status of one clip (polled by the status page).
import { NextResponse } from "next/server"
import { clientIp, fail, handle, rateLimit } from "@/lib/server/api"
import { submissionView } from "@/lib/server/submissions"

export const GET = handle(async (req) => {
  await rateLimit("submission", clientIp(req), 120, 60)
  const id = new URL(req.url).pathname.split("/").pop() ?? ""
  const view = await submissionView(id)
  if (!view) fail(404, "not_found", "No clip with this id")
  return NextResponse.json(view, { headers: { "cache-control": "no-store" } })
})
