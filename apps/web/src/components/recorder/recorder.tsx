"use client"

// Full-screen recorder: challenge pinned on top, big record button, 3-2-1, 15–30 s ring, preview,
// retake / submit, then upload with real progress and automatic retries.
import { Check, Hand, Loader2, RotateCcw, Upload, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { dropClaim, type LocalClaim } from "@/lib/claims-local"
import {
  type CameraError,
  cameraError,
  containerType,
  MAX_S,
  MAX_UPLOAD_BYTES,
  MIN_S,
  openCamera,
  pickMime,
  uploadWithRetry,
} from "@/lib/recorder"
import { cn } from "@/lib/utils"

type Phase =
  | { kind: "intro" }
  | { kind: "starting" }
  | { kind: "error"; error: CameraError }
  | { kind: "ready" }
  | { kind: "countdown"; n: number }
  | { kind: "recording"; startedAt: number }
  | { kind: "review"; blob: Blob; url: string; seconds: number }
  | { kind: "uploading"; blob: Blob; url: string; seconds: number; progress: number; attempt: number }
  | { kind: "failed"; blob: Blob; url: string; seconds: number; message: string; final: boolean }

const CAMERA_HELP: Record<CameraError, string> = {
  denied:
    "Camera or microphone access is blocked. On iPhone: Settings › Safari › Camera and Microphone › Allow. On Android: tap the lock icon next to the address, then Permissions.",
  missing: "No back camera was found on this device. Try a phone.",
  busy: "Another app is using the camera. Close it and try again.",
  insecure: "The camera only works on the secure https:// site.",
  unsupported: "This browser can't record video. Use Safari on iPhone or Chrome on Android.",
}

export function Recorder({ claim }: { claim: LocalClaim }) {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recRef = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])
  const mimeRef = useRef<string>("video/mp4")
  const wakeRef = useRef<{ release: () => Promise<void> } | null>(null)
  const [phase, setPhase] = useState<Phase>({ kind: "intro" })
  const [elapsed, setElapsed] = useState(0)

  const stopStream = useCallback(() => {
    for (const t of streamRef.current?.getTracks() ?? []) t.stop()
    streamRef.current = null
  }, [])

  useEffect(
    () => () => {
      stopStream()
      wakeRef.current?.release().catch(() => undefined)
    },
    [stopStream],
  )

  async function startCamera() {
    setPhase({ kind: "starting" })
    try {
      const mime = pickMime()
      if (!mime) throw Object.assign(new Error("no recorder"), { name: "NotSupportedError" })
      mimeRef.current = mime
      const stream = await openCamera()
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play().catch(() => undefined)
      }
      const nav = navigator as Navigator & {
        wakeLock?: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> }
      }
      wakeRef.current = (await nav.wakeLock?.request("screen").catch(() => null)) ?? null
      setPhase({ kind: "ready" })
    } catch (e) {
      setPhase({ kind: "error", error: cameraError(e) })
    }
  }

  function beginCountdown() {
    let n = 3
    setPhase({ kind: "countdown", n })
    const id = setInterval(() => {
      n -= 1
      if (n > 0) setPhase({ kind: "countdown", n })
      else {
        clearInterval(id)
        record()
      }
    }, 800)
  }

  function record() {
    const stream = streamRef.current
    if (!stream) return
    chunks.current = []
    const rec = new MediaRecorder(stream, {
      mimeType: mimeRef.current,
      videoBitsPerSecond: 2_500_000,
      audioBitsPerSecond: 96_000,
    })
    recRef.current = rec
    rec.ondataavailable = (e) => e.data.size > 0 && chunks.current.push(e.data)
    const startedAt = performance.now()
    rec.onstop = () => {
      const seconds = (performance.now() - startedAt) / 1000
      const blob = new Blob(chunks.current, { type: containerType(mimeRef.current) })
      setPhase({ kind: "review", blob, url: URL.createObjectURL(blob), seconds })
    }
    rec.start(1000) // timeslice: required for iOS Safari past ~15 s
    setElapsed(0)
    setPhase({ kind: "recording", startedAt })
  }

  // Timer + auto-stop at the maximum.
  useEffect(() => {
    if (phase.kind !== "recording") return
    const id = setInterval(() => {
      const s = (performance.now() - phase.startedAt) / 1000
      setElapsed(s)
      if (s >= MAX_S) recRef.current?.state === "recording" && recRef.current.stop()
    }, 100)
    return () => clearInterval(id)
  }, [phase])

  function stop() {
    if (recRef.current?.state === "recording") recRef.current.stop()
  }

  function retake() {
    if ("url" in phase) URL.revokeObjectURL(phase.url)
    setPhase({ kind: "ready" })
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(() => undefined)
    }
  }

  async function submit() {
    if (phase.kind !== "review" && phase.kind !== "failed") return
    const { blob, url, seconds } = phase
    if (!claim.upload.url) {
      setPhase({
        kind: "failed",
        blob,
        url,
        seconds,
        message: "Uploads aren't switched on for this deployment yet.",
        final: true,
      })
      return
    }
    if (blob.size > MAX_UPLOAD_BYTES) {
      setPhase({
        kind: "failed",
        blob,
        url,
        seconds,
        message: "This clip is over 60 MB. Record a shorter one.",
        final: true,
      })
      return
    }
    setPhase({ kind: "uploading", blob, url, seconds, progress: 0, attempt: 1 })
    const res = await uploadWithRetry(
      claim.upload.url,
      claim.upload.token,
      blob,
      blob.type,
      (progress, attempt) => setPhase({ kind: "uploading", blob, url, seconds, progress, attempt }),
    )
    if (res.ok) {
      stopStream()
      dropClaim(claim.claimKey)
      router.replace(`/submissions/${res.submissionId}`)
      return
    }
    const final = !res.retryable
    const message =
      res.code === "token_used"
        ? "This clip was already uploaded."
        : res.code === "token_expired"
          ? "Your 15-minute upload window passed. Claim the task again to get a new one."
          : res.message
    setPhase({ kind: "failed", blob, url, seconds, message, final })
  }

  const showLive =
    phase.kind === "ready" ||
    phase.kind === "countdown" ||
    phase.kind === "recording" ||
    phase.kind === "starting"
  const reviewUrl = "url" in phase ? phase.url : undefined
  const tooShort = phase.kind === "review" && phase.seconds < MIN_S
  const ring = Math.min(1, elapsed / MAX_S)

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white">
      {/* camera / preview */}
      <video
        ref={videoRef}
        className={cn("absolute inset-0 size-full object-cover", !showLive && "hidden")}
        playsInline
        muted
        autoPlay
      />
      {reviewUrl ? (
        // biome-ignore lint/a11y/useMediaCaption: the contributor's own clip, played back for review
        <video
          src={reviewUrl}
          className="absolute inset-x-0 top-20 h-[calc(100%-290px)] w-full object-contain"
          playsInline
          controls
          loop
        />
      ) : null}

      {/* top bar: close + challenge (Paper design: one pill, always visible while filming) */}
      <div className="relative z-10 flex items-center gap-2 bg-gradient-to-b from-black/70 to-transparent px-4 pt-[max(env(safe-area-inset-top),16px)] pb-4">
        <Link
          href={`/tasks/${claim.taskKey}`}
          aria-label="Close the camera"
          className="grid size-10 shrink-0 place-items-center rounded-full bg-black/45 backdrop-blur"
          onClick={(e) => {
            if (phase.kind === "recording" || phase.kind === "review") {
              if (!confirm("Discard this recording?")) e.preventDefault()
            }
          }}
        >
          <X className="size-4.5" />
        </Link>
        <div className="flex flex-1 justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-signal px-3.5 py-2 text-[13px] font-semibold tracking-[0.04em] text-signal-ink shadow-lg">
            <span
              className="size-1.5 animate-pulse rounded-full bg-signal-ink motion-reduce:animate-none"
              aria-hidden="true"
            />
            SAY {claim.challenge.word.toUpperCase()} · {claim.challenge.fingers}
            <Hand className="size-3.5" aria-label="fingers" />
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-black/45 px-2.5 py-1.5 text-[11px] font-semibold tracking-[0.06em] text-white backdrop-blur">
          <Check className="size-3 text-success" strokeWidth={3} aria-hidden="true" />
          HUMAN
        </span>
      </div>

      {/* framing guides over the live camera */}
      {showLive ? (
        <div
          className="pointer-events-none absolute inset-x-5 top-[88px] bottom-[210px] z-[5]"
          aria-hidden="true"
        >
          <span className="absolute top-0 left-0 size-7 rounded-tl-[10px] border-t-2 border-l-2 border-white/80" />
          <span className="absolute top-0 right-0 size-7 rounded-tr-[10px] border-t-2 border-r-2 border-white/80" />
          <span className="absolute bottom-0 left-0 size-7 rounded-bl-[10px] border-b-2 border-l-2 border-white/80" />
          <span className="absolute right-0 bottom-0 size-7 rounded-br-[10px] border-r-2 border-b-2 border-white/80" />
          {phase.kind === "ready" ? (
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center [text-shadow:0_1px_8px_rgba(0,0,0,0.7)]">
              <div className="text-[15px] font-medium">Film from directly above</div>
              <div className="mt-1 text-[12.5px] text-white/65">Whole item and both hands in view</div>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* centre messages */}
      <div className="relative z-10 flex flex-1 items-center justify-center p-6 text-center">
        {phase.kind === "intro" ? (
          <div className="max-w-xs">
            <h1 className="text-[24px] font-semibold tracking-[-0.02em]">{claim.title}</h1>
            <p className="mt-3 text-[15px] text-white/75">
              Hold your phone flat above the table, camera pointing down. Get the towel and both hands in
              frame. Say the word and show the fingers while you film.
            </p>
            <Button variant="signal" size="xl" className="mt-6 w-full" onClick={startCamera}>
              Open the camera
            </Button>
            <p className="mt-3 text-[12px] text-white/55">We'll ask for camera and microphone access.</p>
          </div>
        ) : null}
        {phase.kind === "starting" ? (
          <Loader2 className="size-8 animate-spin" aria-label="Opening the camera" />
        ) : null}
        {phase.kind === "error" ? (
          <div className="max-w-xs rounded-2xl bg-white/10 p-5 text-left backdrop-blur">
            <h2 className="text-[17px] font-semibold">Camera unavailable</h2>
            <p className="mt-2 text-[14px] text-white/80">{CAMERA_HELP[phase.error]}</p>
            <Button variant="signal" size="lg" className="mt-4 w-full" onClick={startCamera}>
              Try again
            </Button>
          </div>
        ) : null}
        {phase.kind === "countdown" ? (
          <span
            key={phase.n}
            className="animate-in zoom-in-50 fade-in text-[120px] font-semibold tabular duration-300"
            aria-live="assertive"
          >
            {phase.n}
          </span>
        ) : null}
      </div>

      {/* bottom controls */}
      <div className="relative z-10 bg-gradient-to-t from-black/80 to-transparent px-6 pt-6 pb-[max(env(safe-area-inset-bottom),24px)]">
        {phase.kind === "ready" || phase.kind === "recording" || phase.kind === "countdown" ? (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-baseline gap-1.5 tabular" aria-live="polite">
              <span className="font-mono text-[26px] font-semibold">
                {clock(phase.kind === "recording" ? elapsed : 0)}
              </span>
              <span className="font-mono text-[13px] text-white/50">/ {clock(MAX_S)}</span>
            </div>
            <button
              type="button"
              onClick={phase.kind === "recording" ? stop : beginCountdown}
              disabled={phase.kind === "countdown" || (phase.kind === "recording" && elapsed < MIN_S)}
              aria-label={phase.kind === "recording" ? "Stop recording" : "Start recording"}
              className="relative grid size-[84px] place-items-center rounded-full disabled:opacity-60"
            >
              <svg viewBox="0 0 84 84" className="absolute inset-0 -rotate-90" aria-hidden="true">
                <circle cx="42" cy="42" r="39" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="4" />
                <circle
                  cx="42"
                  cy="42"
                  r="39"
                  fill="none"
                  stroke={elapsed >= MIN_S ? "#22c55e" : "#FE7446"}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 39}
                  strokeDashoffset={2 * Math.PI * 39 * (1 - ring)}
                />
              </svg>
              <span
                className={cn(
                  "bg-signal transition-all duration-200",
                  phase.kind === "recording" ? "size-8 rounded-lg" : "size-[64px] rounded-full",
                )}
              />
            </button>
            <div className="text-center">
              <div className="text-[14px] font-medium">
                {phase.kind === "recording"
                  ? elapsed < MIN_S
                    ? `Keep going to ${MIN_S} s`
                    : "Tap to stop"
                  : phase.kind === "countdown"
                    ? "Get ready"
                    : "Tap to record"}
              </div>
              <div className="mt-0.5 text-[12px] text-white/55">
                {MIN_S}–{MAX_S} s · stops by itself at {MAX_S} s
              </div>
            </div>
          </div>
        ) : null}

        {phase.kind === "review" || phase.kind === "failed" ? (
          <div className="mx-auto max-w-sm space-y-3">
            {tooShort ? (
              <p className="text-center text-[14px] text-warning">
                That's {Math.floor(phase.seconds)} seconds. Clips need at least {MIN_S}. Retake it.
              </p>
            ) : null}
            {phase.kind === "failed" ? (
              <p className="text-center text-[14px] text-danger" role="alert">
                {phase.message}
              </p>
            ) : null}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="xl"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                onClick={retake}
              >
                <RotateCcw />
                Retake
              </Button>
              <Button
                variant="signal"
                size="xl"
                onClick={submit}
                disabled={tooShort || (phase.kind === "failed" && phase.final)}
              >
                {phase.kind === "failed" ? <RotateCcw /> : <Check />}
                {phase.kind === "failed" ? "Try again" : "Submit clip"}
              </Button>
            </div>
            <p className="text-center text-[12px] text-white/60">
              {Math.floor(phase.seconds)} seconds, {(phase.blob.size / 1e6).toFixed(1)} MB
            </p>
          </div>
        ) : null}

        {phase.kind === "uploading" ? (
          <div className="mx-auto max-w-sm" aria-live="polite">
            <div className="mb-2 flex items-center justify-between text-[14px]">
              <span className="flex items-center gap-2">
                <Upload className="size-4" />
                {phase.attempt > 1 ? `Reconnecting, try ${phase.attempt} of 3…` : "Uploading your clip…"}
              </span>
              <span className="font-mono tabular">{Math.round(phase.progress * 100)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-signal transition-[width] duration-200"
                style={{ width: `${phase.progress * 100}%` }}
              />
            </div>
            <p className="mt-2 text-center text-[12px] text-white/60">
              Keep this page open until it finishes.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function clock(seconds: number): string {
  const t = Math.floor(seconds)
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`
}
