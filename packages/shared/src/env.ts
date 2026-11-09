// Env validation per service. Fails fast and prints the NAMES of missing/invalid variables, never values.
import { z } from "zod"

const hexKey = z.string().regex(/^0x[0-9a-fA-F]{64}$/, "must be a 0x-prefixed 32-byte hex key")
const hederaId = z.string().regex(/^0\.0\.\d+$/, "must look like 0.0.123")
const url = z.string().url()

const arkiv = {
  ARKIV_ACCESS_KEY: z.string().min(10),
  ARKIV_NS: z
    .string()
    .regex(/^[a-z][a-z0-9-]{1,20}$/)
    .default("adx"),
}

const db = { DATABASE_URL: z.string().startsWith("postgres") }

const world = {
  WORLD_APP_ID: z.string().startsWith("app_"),
  WORLD_RP_ID: z.string().startsWith("rp_"),
  WORLD_SIGNING_KEY: hexKey,
  WORLD_ACTION: z.string().default("claim-task"),
  WORLD_ENV: z.enum(["production", "staging"]).default("staging"),
}

const hederaCommon = {
  HEDERA_NETWORK: z.enum(["testnet", "mainnet"]).default("testnet"),
  HEDERA_OPERATOR_ID: hederaId,
  HEDERA_OPERATOR_KEY: z.string().min(64),
  HEDERA_USDC_TOKEN_ID: hederaId,
}

export const webEnvSchema = z.object({
  ...arkiv,
  ...db,
  ...world,
  ...hederaCommon,
  ARKIV_PLATFORM_WEB_KEY: hexKey,
  ARKIV_VERIFIER_KEY: hexKey,
  ARKIV_BUYER_ADDRESS: z.string().regex(/^0x[0-9a-fA-F]{40}$/),
  HEDERA_MERCHANT_ID: hederaId,
  UPLOAD_TOKEN_SECRET: z.string().min(32),
  WORKER_PUBLIC_URL: url,
})

export const workerEnvSchema = z.object({
  ...arkiv,
  ...db,
  ARKIV_PLATFORM_WORKER_KEY: hexKey,
  ARKIV_VERIFIER_KEY: hexKey,
  UPLOAD_TOKEN_SECRET: z.string().min(32),
  WEB_ORIGIN: z.string().default("https://adx-paradigm.vercel.app"),
  BEE_URL: url.default("http://bee.railway.internal:1633"),
  SWARM_BATCH_ID: z.string().regex(/^[0-9a-f]{64}$/),
  GEMINI_API_KEY: z.string().min(10).optional(),
  CLIP_DIR: z.string().default("/tmp/clips"),
  PORT: z.coerce.number().int().default(8080),
})

export const agentEnvSchema = z.object({
  ...arkiv,
  ...db,
  ...hederaCommon,
  ARKIV_BUYER_KEY: hexKey,
  HEDERA_BUYER_ID: hederaId,
  HEDERA_BUYER_KEY: z.string().min(64),
  ANTHROPIC_API_KEY: z.string().min(10),
})

export type WebEnv = z.infer<typeof webEnvSchema>
export type WorkerEnv = z.infer<typeof workerEnvSchema>
export type AgentEnv = z.infer<typeof agentEnvSchema>

export class EnvError extends Error {
  constructor(
    readonly service: string,
    readonly problems: string[],
  ) {
    super(`[${service}] invalid environment: ${problems.join(", ")}`)
    this.name = "EnvError"
  }
}

/** Parse env for a service. Throws EnvError listing only variable names and the rule they broke. */
export function loadEnv<S extends z.ZodType>(
  service: string,
  schema: S,
  source: Record<string, string | undefined> = process.env,
): z.infer<S> {
  const res = schema.safeParse(source)
  if (res.success) return res.data
  const problems = res.error.issues.map((i) => `${i.path.join(".")} (${i.message})`)
  throw new EnvError(service, problems)
}

const cache = new Map<string, unknown>()
/** Memoised loader for long-lived processes and route handlers. */
export function env<S extends z.ZodType>(service: string, schema: S): z.infer<S> {
  if (!cache.has(service)) cache.set(service, loadEnv(service, schema))
  return cache.get(service) as z.infer<S>
}
