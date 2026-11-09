// Write guard: the last line of defence before anything becomes public on Arkiv.
// Every wallet write in the codebase goes through safeCreate/safePatch (see writer.ts), which call this.
// Rejects secret-looking column names and values. Fails closed: when in doubt, the write throws.
import { isArkivValue } from "@arkiv-network/sdk/schema"

export class UnsafeArkivWrite extends Error {
  constructor(
    readonly schema: string,
    readonly column: string,
    readonly rule: string,
  ) {
    // Never include the value itself in the message: it may be the secret we just caught.
    super(`refused Arkiv write to ${schema}.${column}: ${rule}`)
    this.name = "UnsafeArkivWrite"
  }
}

/** Column names that must never exist on a public entity. */
const FORBIDDEN_NAME =
  /(secret|private|nullifier|token|password|passwd|mnemonic|seed|email|phone|aes|apikey|api_key|^key$)/i

/** Columns allowed to hold a bare 64-hex value (public hashes and plain Swarm refs). */
const HEX64_OK = new Set(["rubricRef", "rubricHash", "swarmRef", "cipherSha256", "evidenceHash", "termsHash"])

const TEXT_RULES: Array<[RegExp, string]> = [
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "PEM private key"],
  [/\b302e020100300506032b65700422/i, "DER-encoded ed25519 private key"],
  [/\b3030020100300706052b8104000a04/i, "DER-encoded secp256k1 private key"],
  [/\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/, "JWT / bearer token"],
  [/\b(sk-ant-|sk-|AIza|gsk_|xox[bp]-|ghp_|github_pat_)[A-Za-z0-9_-]{10,}/, "API key"],
  [/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/, "email address"],
  [/(?<![\w.])\+?\d[\d\s-]{9,14}\d(?![\w.])/, "phone number"],
  [/(?<![0-9a-f])[0-9a-f]{128}(?![0-9a-f])/i, "128-hex value (encrypted Swarm ref / key material)"],
]

const HEX64_PREFIXED = /0x[0-9a-fA-F]{64}(?![0-9a-fA-F])/
const HEX64_BARE = /(?<![0-9a-fA-F])[0-9a-fA-F]{64}(?![0-9a-fA-F])/

const MAX_STR_BYTES = 128

/**
 * Fingerprint columns hold digit-heavy hex that trips the phone-number rule. They're allowed only when they
 * match their exact format, which by itself proves they aren't free text or a secret.
 */
const STRICT_FORMAT: Record<string, RegExp> = {
  dhash: /^[0-9a-f]{16}\|[0-9a-f]{16}\|[0-9a-f]{16}$/,
  dhashA: /^[0-9a-f]{4}$/,
  dhashB: /^[0-9a-f]{4}$/,
  dhashC: /^[0-9a-f]{4}$/,
}

function scanText(schema: string, column: string, text: string, isStrColumn: boolean): void {
  const strict = STRICT_FORMAT[column]
  if (strict && isStrColumn) {
    if (!strict.test(text))
      throw new UnsafeArkivWrite(schema, column, "value doesn't match the fingerprint format")
    return
  }
  for (const [re, rule] of TEXT_RULES) if (re.test(text)) throw new UnsafeArkivWrite(schema, column, rule)
  if (HEX64_PREFIXED.test(text))
    throw new UnsafeArkivWrite(
      schema,
      column,
      "0x-prefixed 32-byte hex (looks like a private key or nullifier)",
    )
  if (isStrColumn && !HEX64_OK.has(column) && HEX64_BARE.test(text)) {
    throw new UnsafeArkivWrite(schema, column, "bare 32-byte hex outside a hash/ref column")
  }
  if (isStrColumn && Buffer.byteLength(text, "utf8") > MAX_STR_BYTES) {
    throw new UnsafeArkivWrite(schema, column, `string longer than ${MAX_STR_BYTES} bytes`)
  }
}

function hexToUtf8(hex: string): string {
  return Buffer.from(hex.replace(/^0x/, ""), "hex").toString("utf8")
}

/**
 * Throws UnsafeArkivWrite if any column name or value looks sensitive.
 * `key` and `addr` typed values are allowed to be 0x-hex (they are entity keys / public addresses).
 */
export function assertPublicSafe(schema: string, values: Record<string, unknown>): void {
  for (const [column, raw] of Object.entries(values)) {
    if (FORBIDDEN_NAME.test(column)) throw new UnsafeArkivWrite(schema, column, "forbidden column name")
    if (raw === undefined || raw === null) continue
    let type: string
    let value: unknown
    if (isArkivValue(raw)) {
      type = raw.type
      value = raw.value
    } else if (typeof raw === "string") {
      type = "str"
      value = raw
    } else if (raw instanceof Uint8Array) {
      type = "bytes"
      value = Buffer.from(raw).toString("hex")
    } else if (typeof raw === "bigint" || typeof raw === "number" || typeof raw === "boolean") {
      continue
    } else {
      throw new UnsafeArkivWrite(schema, column, "unsupported value type")
    }
    if (type === "key" || type === "addr") continue
    if (type === "str") scanText(schema, column, String(value), true)
    else if (type === "bytes") scanText(schema, column, hexToUtf8(String(value)), false)
  }
}
