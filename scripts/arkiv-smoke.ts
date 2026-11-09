// Arkiv smoke test: one write, one read-back, one owner-filtered query on Rabdi.
// Run: pnpm arkiv:smoke   (reads ARKIV_ACCESS_KEY and ARKIV_FUNDER_PRIVATE_KEY from .env)
import { createPublicClient, createWalletClient, ExpirationTime } from "@arkiv-network/sdk"
import { rabdi } from "@arkiv-network/sdk/chains"
import { and, eq } from "@arkiv-network/sdk/query"
import { addr, dec, defineSchema, str, u64 } from "@arkiv-network/sdk/schema"
import { formatEther, http, isHex } from "viem"
import { privateKeyToAccount } from "viem/accounts"

const SmokeTask = defineSchema("adx.smoke.task", {
  status: str().indexed(),
  category: str().indexed(),
  reward: dec().indexed(),
  deadline: u64().indexed(),
  buyer: addr().indexed(),
  title: str(),
})

const key = process.env.ARKIV_FUNDER_PRIVATE_KEY
if (!key || !isHex(key)) throw new Error("ARKIV_FUNDER_PRIVATE_KEY missing in .env")
const account = privateKeyToAccount(key)
const chain = rabdi({ accessKey: process.env.ARKIV_ACCESS_KEY ?? "" })
const pub = createPublicClient({ chain, transport: http() })
const wallet = createWalletClient({ chain, transport: http(), account })

const t0 = Date.now()
console.log("signer", account.address)
console.log("block", await pub.getBlockNumber())
console.log("balance tGLM", formatEther(await pub.getBalance({ address: account.address })))

const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600)
const { entityKey, txHash } = await wallet.createEntity(
  SmokeTask,
  {
    status: "open",
    category: "manipulation",
    reward: dec("3"),
    deadline: u64(deadline),
    buyer: addr(account.address),
    title: "Smoke test: fold a towel",
  },
  { expiration: ExpirationTime.fromHours(1) },
)
console.log("created", entityKey, "tx", txHash, `${Date.now() - t0} ms`)

const back = await pub.getEntity(entityKey, SmokeTask)
console.log("read back:", back.title.value, back.status.value, back.reward.value)

const rows = await pub
  .select({ $key: true, title: true, reward: true })
  .from(SmokeTask)
  .where(and(eq("status", "open"), eq("category", "manipulation")))
  .ownedBy(account.address)
  .limit(10)
  .fetch()
console.log(
  "query hits",
  rows.entities.length,
  rows.entities.map((r) => r.$key),
)
console.log(`explorer: https://rabdi.explorer.arkiv.network/tx/${txHash}`)
console.log(`total ${Date.now() - t0} ms`)
