// Media stage: ffprobe for duration/streams, ffmpeg for 3 fingerprint frames, sharp for 64-bit dHash.
import { execFile } from "node:child_process"
import { promisify } from "node:util"
import sharp from "sharp"

const run = promisify(execFile)

export type Probe = {
  durationMs: number
  hasVideo: boolean
  hasAudio: boolean
  width: number
  height: number
}

export async function probe(path: string): Promise<Probe> {
  const { stdout } = await run(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration:stream=codec_type,width,height", "-of", "json", path],
    { timeout: 15_000, maxBuffer: 1 << 20 },
  )
  const j = JSON.parse(stdout) as {
    format?: { duration?: string }
    streams?: Array<{ codec_type?: string; width?: number; height?: number }>
  }
  const v = j.streams?.find((s) => s.codec_type === "video")
  let durationMs = Math.round(Number(j.format?.duration ?? 0) * 1000)
  // MediaRecorder WebM files often carry no duration header; count it instead.
  if (!Number.isFinite(durationMs) || durationMs <= 0) durationMs = await countDuration(path)
  return {
    durationMs,
    hasVideo: Boolean(v),
    hasAudio: Boolean(j.streams?.some((s) => s.codec_type === "audio")),
    width: v?.width ?? 0,
    height: v?.height ?? 0,
  }
}

async function countDuration(path: string): Promise<number> {
  const { stderr } = await run("ffmpeg", ["-v", "info", "-i", path, "-f", "null", "-"], {
    timeout: 60_000,
    maxBuffer: 8 << 20,
  }).catch((e: { stderr?: string }) => ({ stderr: e.stderr ?? "" }))
  const times = [...stderr.matchAll(/time=(\d+):(\d+):(\d+\.\d+)/g)]
  const last = times.at(-1)
  return last ? Math.round((Number(last[1]) * 3600 + Number(last[2]) * 60 + Number(last[3])) * 1000) : 0
}

/** One PNG frame at `atS` seconds, scaled to 320 px wide. */
async function frameAt(path: string, atS: number): Promise<Buffer> {
  const { stdout } = await run(
    "ffmpeg",
    [
      "-v",
      "error",
      "-ss",
      atS.toFixed(2),
      "-i",
      path,
      "-frames:v",
      "1",
      "-vf",
      "scale=320:-2",
      "-f",
      "image2pipe",
      "-vcodec",
      "png",
      "pipe:1",
    ],
    { timeout: 20_000, encoding: "buffer", maxBuffer: 8 << 20 },
  )
  return stdout as unknown as Buffer
}

/** dHash: greyscale → 9×8 → 64 bits from horizontal gradients → 16 hex chars. */
export async function dhash(png: Buffer): Promise<string> {
  const px = await sharp(png).greyscale().resize(9, 8, { fit: "fill" }).raw().toBuffer()
  let bits = 0n
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      bits = (bits << 1n) | ((px[y * 9 + x] as number) > (px[y * 9 + x + 1] as number) ? 1n : 0n)
    }
  }
  return bits.toString(16).padStart(16, "0")
}

/** Fingerprint = dHash of frames at 25 / 50 / 75 % of the clip. */
export async function fingerprint(path: string, durationMs: number): Promise<string[]> {
  const d = durationMs / 1000
  const frames = await Promise.all([0.25, 0.5, 0.75].map((f) => frameAt(path, Math.max(0.1, d * f))))
  return Promise.all(frames.map(dhash))
}
