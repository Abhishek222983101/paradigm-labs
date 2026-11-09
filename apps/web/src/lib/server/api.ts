// Shared route-handler helpers: one error shape, zod parsing, client IP, Neon-backed rate limits.
import "server-only"
import { db, sql } from "@adx/db"
import { NextResponse } from "next/server"
import type { z } from "zod"

export class ApiFail extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: Record<string, unknown>,
  ) {
    super(message)
  }
}

export function fail(
  status: number,
  code: string,
  message: string,
  details?: Record<string, unknown>,
): never {
  throw new ApiFail(status, code, message, details)
}

/** Wrap a handler: ApiFail → its status; anything else → 500 with a generic message (details logged). */
export function handle(fn: (req: Request) => Promise<Response>) {
  return async (req: Request) => {
    try {
      return await fn(req)
    } catch (e) {
      if (e instanceof ApiFail) {
        return NextResponse.json(
          { error: { code: e.code, message: e.message, ...(e.details ? { details: e.details } : {}) } },
          { status: e.status },
        )
      }
      console.error("[api]", req.method, new URL(req.url).pathname, (e as Error)?.stack ?? e)
      return NextResponse.json(
        { error: { code: "internal", message: "Something went wrong on our side. Try again." } },
        { status: 500 },
      )
    }
  }
}

export async function parseJson<S extends z.ZodType>(
  req: Request,
  schema: S,
  maxBytes = 64_000,
): Promise<z.infer<S>> {
  const len = Number(req.headers.get("content-length") ?? 0)
  if (len > maxBytes) fail(413, "too_large", "Request is too large")
  let body: unknown
  try {
    const text = await req.text()
    if (text.length > maxBytes) fail(413, "too_large", "Request is too large")
    body = JSON.parse(text)
  } catch (e) {
    if (e instanceof ApiFail) throw e
    fail(400, "bad_json", "Request body must be JSON")
  }
  const res = schema.safeParse(body)
  if (!res.success) fail(400, "invalid", `Invalid request: ${res.error.issues[0]?.path.join(".") || "body"}`)
  return res.data
}

export function clientIp(req: Request): string {
  return (
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  ).slice(0, 64)
}

/** Fixed-window limiter in Neon. Fails open only if the database itself is down (logged). */
export async function rateLimit(bucket: string, subject: string, limit: number, windowS: number) {
  const win = Math.floor(Date.now() / 1000 / windowS)
  const key = `${bucket}:${subject}:${win}`
  try {
    const r = await db().execute(sql`
      insert into rate_limits (key, count, expires_at)
      values (${key}, 1, now() + make_interval(secs => ${windowS * 2}))
      on conflict (key) do update set count = rate_limits.count + 1
      returning count`)
    const count = Number((r.rows[0] as { count: number }).count)
    if (count > limit) fail(429, "rate_limited", "Too many attempts. Wait a minute and try again.")
  } catch (e) {
    if (e instanceof ApiFail) throw e
    console.error("[ratelimit] db error", (e as Error).message)
  }
}
