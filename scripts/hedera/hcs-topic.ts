// Creates the agent's public spend-log topic on Hedera Consensus Service (once) and appends its id to .env.
// Every agent decision (paid / asked a human / approved / declined) is later submitted as one message.
// Run: pnpm hcs:topic
import { appendFileSync, readFileSync } from "node:fs"
import { operatorClient } from "@adx/shared/hedera"
import { TopicCreateTransaction, TopicMessageSubmitTransaction } from "@hiero-ledger/sdk"

if (/^HEDERA_SPEND_TOPIC_ID=0\.0\.\d+$/m.test(readFileSync(".env", "utf8"))) {
  console.log("topic already exists:", process.env.HEDERA_SPEND_TOPIC_ID)
  process.exit(0)
}
const c = operatorClient()
const res = await new TopicCreateTransaction().setTopicMemo("Paradigm buyer agent spend log").execute(c)
const receipt = await res.getReceipt(c)
const topicId = receipt.topicId?.toString()
if (!topicId) throw new Error("no topic id")
appendFileSync(".env", `\nHEDERA_SPEND_TOPIC_ID=${topicId}\n`)
const first = await new TopicMessageSubmitTransaction()
  .setTopicId(topicId)
  .setMessage(
    JSON.stringify({ v: 1, t: new Date().toISOString(), action: "topic_created", by: "paradigm-agent" }),
  )
  .execute(c)
await first.getReceipt(c)
console.log(`topic ${topicId}  https://hashscan.io/testnet/topic/${topicId}`)
console.log(`create tx ${res.transactionId}`)
process.exit(0)
