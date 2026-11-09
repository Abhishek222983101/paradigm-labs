// Minimal Swarm client: POST /bytes with our postage batch, GET /bytes/<ref>.
// Server-side only. Our Bee node is on Railway's private network (no public API); the public
// gateway is used only for public rubric/manifest JSON from local scripts and for judge-facing reads.

export const PUBLIC_GATEWAY = "https://api.gateway.ethswarm.org"
const REF = /^[0-9a-f]{64}$/

export async function swarmUpload(
  data: Uint8Array,
  opts: { beeUrl: string; batchId?: string; timeoutMs?: number },
): Promise<string> {
  const headers: Record<string, string> = { "content-type": "application/octet-stream" }
  // Bee's default (deferred) upload: the node stores the chunks and pushes them to the network in the background.
  // A synchronous push (swarm-deferred-upload: false) took over 120 s for a 5 MB clip on our light node.
  if (opts.batchId) headers["swarm-postage-batch-id"] = opts.batchId
  const res = await fetch(`${opts.beeUrl}/bytes`, {
    method: "POST",
    headers,
    body: data as BodyInit,
    signal: AbortSignal.timeout(opts.timeoutMs ?? 60_000),
  })
  if (!res.ok) throw new Error(`swarm upload failed: HTTP ${res.status}`)
  const { reference } = (await res.json()) as { reference?: string }
  if (!reference || !REF.test(reference)) throw new Error("swarm upload returned no plain 64-hex reference")
  return reference
}

export async function swarmDownload(
  ref: string,
  beeUrl = PUBLIC_GATEWAY,
  timeoutMs = 60_000,
): Promise<Buffer> {
  if (!REF.test(ref)) throw new Error("invalid swarm reference")
  const res = await fetch(`${beeUrl}/bytes/${ref}`, { signal: AbortSignal.timeout(timeoutMs) })
  if (!res.ok) throw new Error(`swarm download failed: HTTP ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}
