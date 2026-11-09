// Per-signer FIFO. Arkiv writes from one wallet must be serialised so nonces never collide;
// different wallets run in parallel. Each job gets bounded retries with backoff.

export type RetryOptions = {
  retries?: number
  baseDelayMs?: number
  /** Called after a failed attempt; return a value to treat the attempt as having succeeded. */
  reconcile?: (err: unknown) => Promise<unknown | undefined>
  isRetryable?: (err: unknown) => boolean
}

const chains = new Map<string, Promise<unknown>>()

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Non-retryable: our own guard/validation errors and contract reverts that will fail again. */
export function defaultRetryable(err: unknown): boolean {
  const name = (err as { name?: string })?.name ?? ""
  if (name === "UnsafeArkivWrite" || name === "InvalidValueError" || name === "SchemaDefinitionError")
    return false
  const msg = String((err as { message?: string })?.message ?? err)
  if (/insufficient funds|execution reverted|invalid params/i.test(msg)) return false
  return true
}

export async function withRetry<T>(fn: () => Promise<T>, opts: RetryOptions = {}): Promise<T> {
  const retries = opts.retries ?? 3
  const base = opts.baseDelayMs ?? 600
  const retryable = opts.isRetryable ?? defaultRetryable
  let lastErr: unknown
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err
      if (opts.reconcile) {
        const recovered = await opts.reconcile(err).catch(() => undefined)
        if (recovered !== undefined) return recovered as T
      }
      if (!retryable(err) || attempt === retries) break
      await sleep(base * 2 ** attempt + Math.floor(Math.random() * 200))
    }
  }
  throw lastErr
}

/** Run `fn` after every earlier job queued on `signer` has settled. */
export function enqueue<T>(signer: string, fn: () => Promise<T>): Promise<T> {
  const prev = chains.get(signer) ?? Promise.resolve()
  const next = prev.then(fn, fn)
  // Keep the chain alive regardless of this job's outcome, and drop it when idle.
  const tail = next.catch(() => undefined)
  chains.set(signer, tail)
  tail.then(() => {
    if (chains.get(signer) === tail) chains.delete(signer)
  })
  return next
}
