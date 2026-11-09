"use client"

// Camera + MediaRecorder helpers (system architecture §9.1 recorder notes).
// iOS Safari: start(1000) with a timeslice avoids the freeze past ~15 s; it records MP4/H.264.
// Chrome/Android: MP4 if supported, else WebM VP9/VP8.

export const MIN_S = 15
export const MAX_S = 30
export const MAX_UPLOAD_BYTES = 60 * 1024 * 1024

const CANDIDATES = [
  "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
  "video/mp4;codecs=avc1",
  "video/mp4",
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
]

export function pickMime(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined
  return CANDIDATES.find((m) => MediaRecorder.isTypeSupported(m))
}

/** The plain container type the worker accepts. */
export function containerType(mime: string): "video/mp4" | "video/webm" {
  return mime.startsWith("video/webm") ? "video/webm" : "video/mp4"
}

export async function openCamera(): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: { ideal: "environment" },
      width: { ideal: 1280 },
      height: { ideal: 720 },
      frameRate: { ideal: 30 },
    },
    audio: { echoCancellation: true, noiseSuppression: true },
  })
}

export type CameraError = "denied" | "missing" | "busy" | "insecure" | "unsupported"

export function cameraError(e: unknown): CameraError {
  if (typeof window !== "undefined" && !window.isSecureContext) return "insecure"
  const name = (e as { name?: string })?.name
  if (name === "NotAllowedError" || name === "SecurityError") return "denied"
  if (name === "NotFoundError" || name === "OverconstrainedError") return "missing"
  if (name === "NotReadableError" || name === "AbortError") return "busy"
  return "unsupported"
}

export type UploadResult =
  | { ok: true; submissionId: string }
  | { ok: false; status: number; code: string; message: string; retryable: boolean }

/** XHR PUT so we get real progress events; fetch can't report upload progress. */
export function uploadOnce(
  url: string,
  token: string,
  blob: Blob,
  type: string,
  onProgress: (fraction: number) => void,
): { promise: Promise<UploadResult>; abort: () => void } {
  const xhr = new XMLHttpRequest()
  const promise = new Promise<UploadResult>((resolve) => {
    xhr.open("PUT", url)
    xhr.setRequestHeader("authorization", `Bearer ${token}`)
    xhr.setRequestHeader("content-type", type)
    xhr.timeout = 180_000
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total)
    xhr.onload = () => {
      let body: { submissionId?: string; error?: { code: string; message: string } } = {}
      try {
        body = JSON.parse(xhr.responseText)
      } catch {}
      if (xhr.status === 202 && body.submissionId) resolve({ ok: true, submissionId: body.submissionId })
      else
        resolve({
          ok: false,
          status: xhr.status,
          code: body.error?.code ?? "http_error",
          message: body.error?.message ?? "Upload failed",
          retryable: xhr.status >= 500,
        })
    }
    const network = (code: string) => () =>
      resolve({ ok: false, status: 0, code, message: "Connection dropped during upload", retryable: true })
    xhr.onerror = network("network")
    xhr.ontimeout = network("timeout")
    xhr.onabort = () =>
      resolve({ ok: false, status: 0, code: "aborted", message: "Upload cancelled", retryable: false })
    xhr.send(blob)
  })
  return { promise, abort: () => xhr.abort() }
}

/** Up to 3 attempts on network/5xx errors with a short backoff; 4xx answers are final. */
export async function uploadWithRetry(
  url: string,
  token: string,
  blob: Blob,
  type: string,
  onProgress: (fraction: number, attempt: number) => void,
): Promise<UploadResult> {
  let last: UploadResult = { ok: false, status: 0, code: "not_started", message: "", retryable: true }
  for (let attempt = 1; attempt <= 3; attempt++) {
    last = await uploadOnce(url, token, blob, type, (f) => onProgress(f, attempt)).promise
    if (last.ok || !last.retryable) return last
    await new Promise((r) => setTimeout(r, 800 * attempt))
  }
  return last
}
