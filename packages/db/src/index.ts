// DB client factories. Vercel (web): Neon serverless driver over WebSockets (supports transactions).
// Railway (worker, agent): node-postgres pool over the pooler URL.
import { Pool as NeonPool } from "@neondatabase/serverless"
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless"
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres"
import pg from "pg"
import * as schema from "./schema"

export { and, asc, desc, eq, gt, gte, isNull, lt, lte, or, sql } from "drizzle-orm"
export * from "./schema"
export { schema }

function url(): string {
  const u = process.env.DATABASE_URL
  if (!u) throw new Error("DATABASE_URL is not set")
  return u
}

const g = globalThis as unknown as { __adxDb?: ReturnType<typeof makeServerless> }

function makeServerless() {
  return drizzleNeon({ client: new NeonPool({ connectionString: url(), max: 5 }), schema })
}

/** Web (serverless) client; cached across hot reloads and warm invocations. */
export function db() {
  g.__adxDb ??= makeServerless()
  return g.__adxDb
}
export type DB = ReturnType<typeof db>

/** Long-running services (worker / agent). */
export function dbPool(max = 5) {
  return drizzlePg({ client: new pg.Pool({ connectionString: url(), max }), schema })
}
