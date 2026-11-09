// Neon (private) tables — system architecture §10.2. Everything that must NOT be public lives here:
// World ID nullifiers, wallet ↔ claim links, upload tokens (hashed), AES clip keys, payments, approvals.
import { sql } from "drizzle-orm"
import {
  bigserial,
  boolean,
  customType,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core"

const bytea = customType<{ data: Buffer; driverData: Buffer }>({ dataType: () => "bytea" })
const ts = (name: string) => timestamp(name, { withTimezone: true })

export const claimsPrivate = pgTable(
  "claims_private",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    taskKey: text("task_key").notNull(),
    claimKey: text("claim_key"),
    nullifier: text("nullifier").notNull(),
    wallet: text("wallet").notNull(),
    challenge: text("challenge"),
    status: text("status").notNull().default("reserving"), // reserving | active | submitted | released
    createdAt: ts("created_at").defaultNow().notNull(),
  },
  (t) => [
    unique("claims_task_nullifier").on(t.taskKey, t.nullifier),
    index("claims_wallet_idx").on(t.wallet),
  ],
)

export const contributors = pgTable("contributors", {
  wallet: text("wallet").primaryKey(),
  hederaAccount: text("hedera_account"),
  lastUploadAt: ts("last_upload_at"),
  createdAt: ts("created_at").defaultNow().notNull(),
})

export const uploadTokens = pgTable("upload_tokens", {
  tokenHash: text("token_hash").primaryKey(),
  claimKey: text("claim_key").notNull(),
  expiresAt: ts("expires_at").notNull(),
  usedAt: ts("used_at"),
})

export const jobs = pgTable(
  "jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    claimKey: text("claim_key").notNull(),
    taskKey: text("task_key").notNull(),
    path: text("path").notNull(),
    bytes: integer("bytes"),
    mime: text("mime"),
    challenge: text("challenge"), // copied from the claim at upload, so the check never depends on the claim's 2 h expiry
    status: text("status").notNull().default("queued"),
    attempts: integer("attempts").default(0).notNull(),
    error: text("error"),
    submissionKey: text("submission_key"),
    createdAt: ts("created_at").defaultNow().notNull(),
    updatedAt: ts("updated_at"),
  },
  (t) => [index("jobs_status_created_idx").on(t.status, t.createdAt)],
)

export const clipKeys = pgTable("clip_keys", {
  submissionKey: text("submission_key").primaryKey(),
  aesKey: bytea("aes_key").notNull(),
  swarmRef: text("swarm_ref").notNull(),
  cipherSha256: text("cipher_sha256").notNull(),
  createdAt: ts("created_at").defaultNow().notNull(),
})

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  submissionKey: text("submission_key").unique().notNull(),
  amount: numeric("amount").notNull(),
  payTo: text("pay_to").notNull(),
  status: text("status").notNull(),
  approvalId: uuid("approval_id"),
  hederaTx: text("hedera_tx"),
  receiptKey: text("receipt_key"),
  licenceKey: text("licence_key"),
  createdAt: ts("created_at").defaultNow().notNull(),
  updatedAt: ts("updated_at"),
})

export const approvals = pgTable("approvals", {
  id: uuid("id").primaryKey().defaultRandom(),
  bindingHash: text("binding_hash").notNull(),
  amount: numeric("amount").notNull(),
  payTo: text("pay_to").notNull(),
  submissionKey: text("submission_key").notNull(),
  status: text("status").notNull(), // pending | approved | denied | expired
  deviceCode: text("device_code"),
  userCode: text("user_code"),
  verificationUri: text("verification_uri"),
  approverSub: text("approver_sub"),
  acr: text("acr"),
  authTime: ts("auth_time"),
  createdAt: ts("created_at").defaultNow().notNull(),
  decidedAt: ts("decided_at"),
})

export const events = pgTable(
  "events",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    scope: text("scope").notNull(), // submission:<jobId> | claim:<key> | agent
    step: text("step").notNull(),
    ok: boolean("ok").notNull(),
    ms: integer("ms"),
    data: jsonb("data"),
    createdAt: ts("created_at").defaultNow().notNull(),
  },
  (t) => [index("events_scope_id_idx").on(t.scope, t.id)],
)

/** Fixed-window rate limiter rows (key = route:subject:window). */
export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(0),
  expiresAt: ts("expires_at").notNull().default(sql`now() + interval '1 hour'`),
})

/**
 * Reputation + free checks per verified human, keyed by the World ID nullifier (same person = same key on
 * every task, so new wallets can't reset it). Private: never published as-is.
 */
export const humans = pgTable("humans", {
  nullifier: text("nullifier").primaryKey(),
  accepted: integer("accepted").notNull().default(0),
  rejected: integer("rejected").notNull().default(0),
  rejectStreak: integer("reject_streak").notNull().default(0),
  checksUsed: integer("checks_used").notNull().default(0),
  updatedAt: ts("updated_at").defaultNow().notNull(),
})
