// Explorer links. Every on-chain thing in the UI is clickable (system architecture §14).
export const ARKIV_EXPLORER = "https://rabdi.explorer.arkiv.network"
export const HASHSCAN = "https://hashscan.io/testnet"
export const SWARM_GATEWAY = "https://api.gateway.ethswarm.org"
export const WORKER_URL = "https://worker-production-e76e.up.railway.app"

export const links = {
  arkivEntity: (key: string) => `${ARKIV_EXPLORER}/entity/${key}`,
  arkivTx: (hash: string) => `${ARKIV_EXPLORER}/tx/${hash}`,
  arkivAddress: (addr: string) => `${ARKIV_EXPLORER}/address/${addr}`,
  hashscanTx: (txId: string) => `${HASHSCAN}/transaction/${txId}`,
  hashscanAccount: (id: string) => `${HASHSCAN}/account/${id}`,
  /** Public mainnet gateway: only for data uploaded through it (the task rubric JSON). */
  swarm: (ref: string) => `${SWARM_GATEWAY}/bytes/${ref}`,
  /** Clips live on Swarm testnet via our own Bee node + batch; fetched through our node (ciphertext only). */
  swarmTestnet: (ref: string) => `${WORKER_URL}/swarm/${ref}/bytes`,
}

export function shortHex(h: string, head = 6, tail = 4): string {
  return h.length <= head + tail + 1 ? h : `${h.slice(0, head)}…${h.slice(-tail)}`
}
