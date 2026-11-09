// Hedera Agent Kit (@hashgraph/hedera-agent-kit), called from code only. No LLM sees these tools.
// Only two tools are loaded: HCS submit-topic-message (the public spend log) and the account
// token-balance query (USDC pre-check). No transfer tool is registered, so the kit cannot move money;
// payments stay in pay.ts (x402) behind the policy engine.

import { operatorClient } from "@adx/shared/hedera"
import {
  AgentMode,
  type Context,
  HederaAgentAPI,
  type TokenBalancesResponse,
} from "@hashgraph/hedera-agent-kit"
import {
  GET_ACCOUNT_TOKEN_BALANCES_QUERY_TOOL,
  getAccountTokenBalancesQuery,
  SUBMIT_TOPIC_MESSAGE_TOOL,
  submitTopicMessageTool,
} from "@hashgraph/hedera-agent-kit/plugins"

export const USDC_TOKEN_ID = process.env.HEDERA_USDC_TOKEN_ID ?? "0.0.429274"

/** The only tools the kit may run. Kept as a list so a test can prove no transfer tool sneaks in. */
export const KIT_TOOLS = [submitTopicMessageTool, getAccountTokenBalancesQuery] as const

let api: HederaAgentAPI | undefined
function kit(): HederaAgentAPI {
  if (api) return api
  const context: Context = { mode: AgentMode.AUTONOMOUS, accountId: process.env.HEDERA_OPERATOR_ID }
  api = new HederaAgentAPI(
    operatorClient(),
    context,
    KIT_TOOLS.map((t) => t(context)),
  )
  return api
}

type KitResult = {
  raw?: { status?: string; error?: string; transactionId?: string } & Record<string, unknown>
}

async function run(method: string, args: Record<string, unknown>): Promise<NonNullable<KitResult["raw"]>> {
  const out = JSON.parse(await kit().run(method, args)) as KitResult
  // The kit never rejects on a tool failure: it resolves with raw.status "ERROR". Turn that into a throw.
  const raw = out.raw ?? {}
  if (raw.status !== "SUCCESS") throw new Error(`${method}: ${raw.error ?? raw.status ?? "no result"}`)
  return raw
}

/** Submit one message to an HCS topic through the kit. Returns the transaction id (throws if none). */
export async function kitSubmitTopicMessage(topicId: string, message: string): Promise<string> {
  const raw = await run(SUBMIT_TOPIC_MESSAGE_TOOL, { topicId, message })
  if (!raw.transactionId) throw new Error("agent kit returned no transaction id")
  return raw.transactionId
}

/** Token balance in display units (USDC has 6 decimals) from the kit's mirror-node response. 0 if not held. */
export function balanceFromKit(resp: TokenBalancesResponse | undefined, tokenId: string): number {
  const t = resp?.tokens?.find((x) => x.token_id === tokenId)
  if (!t) return 0
  return Number(t.balance) / 10 ** Number(t.decimals ?? 0)
}

/** USDC balance of an account, via the kit's get-account-token-balances query (mirror node). */
export async function kitUsdcBalance(accountId: string): Promise<number> {
  const raw = await run(GET_ACCOUNT_TOKEN_BALANCES_QUERY_TOOL, { accountId, tokenId: USDC_TOKEN_ID })
  return balanceFromKit(raw.tokenBalances as TokenBalancesResponse | undefined, USDC_TOKEN_ID)
}
