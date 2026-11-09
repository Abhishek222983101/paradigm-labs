// PUT /upload — the phone streams its clip here (system architecture §9.3).
// Auth: single-use HMAC upload token in the Authorization header (never in the URL, so never in logs).
// Order: verify signature + expiry → check unused → stream to disk with a hard size cap → check it's
// really a video → burn the token atomically (a parallel duplicate upload loses and is deleted) → job row.

import { randomUUID } from "node:crypto"
import { createWriteStream } from "node:fs"
import { mkdir, open, rm } from "node:fs/promises"
import { join } from "node:path"
import { Readable, Transform } from "node:stream"
import { pipeline } from "node:stream/promises"
import type { dbPool } from "@adx/db"
import { claimsPrivate, contributors, eq, events, jobs, sql, uploadTokens } from "@adx/db"
import { verifyUploadToken } from "@adx/shared/upload-token"
import type { Context } from "hono"

export const MAX_BYTES = 60 * 1024 * 1024
const MIN_BYTES = 50 * 1024
const MIMES = new Set(["video/mp4", "video/webm", "video/quicktime"])

type Deps = { db: ReturnType<typeof dbPool>; secret: string; clipDir: string }

// Rejections can happen before the body is read; close the socket so a client never reuses a
// connection that still has an unread upload on it.
const err = (
  c: Context,
  status: 400 | 401 | 409 | 410 | 411 | 413 | 415 | 500,
  code: string,
  message: string,
) => {
  c.header("connection", "close")
  return c.json({ error: { code, message } }, status)
}

/** Is this really an MP4/MOV (ftyp box) or WebM (EBML header)? */
async function looksLikeVideo(path: string): Promise<boolean> {
  const fh = await open(path, "r")
  try {
    const { buffer } = await fh.read(Buffer.alloc(12), 0, 12, 0)
    const isMp4 = buffer.subarray(4, 8).toString("latin1") === "ftyp"
    const isWebm = buffer.readUInt32BE(0) === 0x1a45dfa3
    return isMp4 || isWebm
  } finally {
    await fh.close()
  }
}

class TooLarge extends Error {}

export function uploadHandler({ db, secret, clipDir }: Deps) {
  return async (c: Context) => {
    const auth = c.req.header("authorization") ?? ""
    const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : ""
    const v = verifyUploadToken(token, secret)
    if (!v.ok)
      return err(
        c,
        v.reason === "expired" ? 410 : 401,
        `token_${v.reason}`,
        "This upload link is invalid or expired. Claim again.",
      )

    const [row] = await db.select().from(uploadTokens).where(eq(uploadTokens.tokenHash, v.tokenHash)).limit(1)
    if (!row) return err(c, 401, "token_unknown", "This upload link is invalid.")
    if (row.usedAt) return err(c, 409, "token_used", "This clip was already uploaded.")

    const mime = (c.req.header("content-type") ?? "").split(";")[0]?.trim().toLowerCase() ?? ""
    if (!MIMES.has(mime)) return err(c, 415, "bad_type", "Upload a video (MP4 or WebM).")
    const declared = Number(c.req.header("content-length") ?? "0")
    if (declared > MAX_BYTES)
      return err(c, 413, "too_large", "This clip is over 60 MB. Record a shorter one.")
    const body = c.req.raw.body
    if (!body) return err(c, 400, "empty", "No video received.")

    await mkdir(clipDir, { recursive: true, mode: 0o700 })
    const id = randomUUID()
    const path = join(clipDir, `${id}.${mime === "video/webm" ? "webm" : "mp4"}`)
    let bytes = 0
    try {
      const counter = new Transform({
        transform(chunk: Buffer, _enc, cb) {
          bytes += chunk.length
          if (bytes > MAX_BYTES) cb(new TooLarge())
          else cb(null, chunk)
        },
      })
      await pipeline(Readable.fromWeb(body as never), counter, createWriteStream(path, { mode: 0o600 }))
    } catch (e) {
      await rm(path, { force: true })
      if (e instanceof TooLarge)
        return err(c, 413, "too_large", "This clip is over 60 MB. Record a shorter one.")
      return err(c, 400, "upload_interrupted", "The upload was interrupted. Try again.")
    }
    if (bytes < MIN_BYTES || !(await looksLikeVideo(path))) {
      await rm(path, { force: true })
      return err(c, 415, "not_video", "That file isn't a playable video.")
    }

    // Burn the token atomically; the loser of a race deletes its copy.
    const burned = await db
      .update(uploadTokens)
      .set({ usedAt: new Date() })
      .where(
        sql`${uploadTokens.tokenHash} = ${v.tokenHash} and ${uploadTokens.usedAt} is null and ${uploadTokens.expiresAt} > now()`,
      )
      .returning({ claimKey: uploadTokens.claimKey })
    if (!burned[0]) {
      await rm(path, { force: true })
      return err(c, 409, "token_used", "This clip was already uploaded.")
    }

    const { claim, task } = v.payload
    const [cp0] = await db
      .select({ challenge: claimsPrivate.challenge })
      .from(claimsPrivate)
      .where(eq(claimsPrivate.claimKey, claim))
      .limit(1)
    const [job] = await db
      .insert(jobs)
      .values({
        id,
        claimKey: claim,
        taskKey: task,
        path,
        bytes,
        mime,
        challenge: cp0?.challenge ?? null,
        status: "queued",
      })
      .returning({ id: jobs.id })
    await db
      .insert(events)
      .values({ scope: `submission:${id}`, step: "received", ok: true, ms: 0, data: { bytes } })
    const [cp] = await db
      .update(claimsPrivate)
      .set({ status: "submitted" })
      .where(eq(claimsPrivate.claimKey, claim))
      .returning({ wallet: claimsPrivate.wallet })
    if (cp)
      await db
        .update(contributors)
        .set({ lastUploadAt: new Date() })
        .where(eq(contributors.wallet, cp.wallet))

    console.log(JSON.stringify({ at: new Date().toISOString(), evt: "upload", job: job?.id, bytes, mime }))
    return c.json({ submissionId: job?.id, bytes }, 202)
  }
}
