// Swarm smoke test: encrypt a clip-sized blob ourselves (AES-256-GCM), upload the ciphertext to
// Swarm, download it by reference, decrypt and verify the hash. Swarm (and any gateway) only ever
// sees ciphertext; the key never leaves our side. The plain 64-hex reference of the ciphertext is
// safe to put in a public Arkiv entity.
// Run: pnpm swarm:smoke [SIZE_MB=10] [BEE_URL=https://api.gateway.ethswarm.org] [SWARM_BATCH_ID=...]
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto"

const BEE = process.env.BEE_URL ?? "https://api.gateway.ethswarm.org"
const BATCH = process.env.SWARM_BATCH_ID ?? "0".repeat(64) // public gateway stamps with its own batch
const sizes = (process.env.SIZE_MB ?? "1,10,30").split(",").map(Number)
const sha = (b: Uint8Array) => createHash("sha256").update(b).digest("hex")

for (const mb of sizes) {
  const clip = randomBytes(mb * 1024 * 1024)
  const key = randomBytes(32)
  const iv = randomBytes(12)
  const c = createCipheriv("aes-256-gcm", key, iv)
  const ct = Buffer.concat([iv, c.update(clip), c.final(), c.getAuthTag()])

  let t = Date.now()
  const up = await fetch(`${BEE}/bytes`, {
    method: "POST",
    headers: { "content-type": "application/octet-stream", "swarm-postage-batch-id": BATCH },
    body: ct,
  })
  const upMs = Date.now() - t
  if (!up.ok) {
    console.log(`${mb} MB upload FAILED ${up.status} ${await up.text()}`)
    continue
  }
  const { reference } = (await up.json()) as { reference: string }

  t = Date.now()
  const down = Buffer.from(await (await fetch(`${BEE}/bytes/${reference}`)).arrayBuffer())
  const downMs = Date.now() - t
  const d = createDecipheriv("aes-256-gcm", key, down.subarray(0, 12))
  d.setAuthTag(down.subarray(down.length - 16))
  const plain = Buffer.concat([d.update(down.subarray(12, down.length - 16)), d.final()])
  console.log(
    `${mb} MB · ref ${reference} (${reference.length} hex) · up ${upMs} ms · down ${downMs} ms · match ${sha(plain) === sha(clip)}`,
  )
}
