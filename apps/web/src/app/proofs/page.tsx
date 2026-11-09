import { ArrowUpRight } from "lucide-react"
import type { Metadata } from "next"
import { Page, PageHeader } from "@/components/shell/page-header"

export const metadata: Metadata = { title: "Proofs" }

type Proof = { id: string; sponsor: string; what: string; links: { label: string; href: string }[] }

// Mirror of docs/sponsors/PROOFS.md: only things that really happened on a public network.
const PROOFS: Proof[] = [
  {
    id: "HED-02",
    sponsor: "Hedera",
    what: "An agent paid over x402 with no human approving; settled in about 2 seconds",
    links: [
      { label: "HashScan", href: "https://hashscan.io/testnet/transaction/0.0.9185802@1793933035.147018991" },
    ],
  },
  {
    id: "HED-01",
    sponsor: "Hedera",
    what: "Buyer, merchant and contributor accounts with testnet USDC associated",
    links: [
      { label: "Buyer", href: "https://hashscan.io/testnet/account/0.0.11333306" },
      { label: "Merchant", href: "https://hashscan.io/testnet/account/0.0.11333308" },
    ],
  },
  {
    id: "ARK-03",
    sponsor: "Arkiv",
    what: "Verifier listing and the towel task published by their own role wallets",
    links: [
      {
        label: "Task",
        href: "https://rabdi.explorer.arkiv.network/entity/0x59f8914bff0b8d9e8de3c1c2d004843b5fc0d5dd4155d8b056f2a15b89daa69e",
      },
      {
        label: "Verifier",
        href: "https://rabdi.explorer.arkiv.network/entity/0x1ff914c70cbd19d5cc35ddcce96f51538b2cd13594f0ae29608719d090d064cb",
      },
    ],
  },
  {
    id: "ARK-02",
    sponsor: "Arkiv",
    what: "One signer per role (web, worker, verifier, buyer), funded from the team wallet",
    links: [
      {
        label: "Buyer wallet",
        href: "https://rabdi.explorer.arkiv.network/address/0x0F00CFF8dae364c5d7c0840A2C92DFc7d087Dcc6",
      },
    ],
  },
  {
    id: "SWM-04",
    sponsor: "Swarm",
    what: "Our own postage batch bought on-chain for our own Bee node",
    links: [
      {
        label: "Etherscan",
        href: "https://sepolia.etherscan.io/tx/0x515df5c447f6c91d81c8391019f3a3702cb0a47b08968867ea43de5c2ee520d1",
      },
    ],
  },
  {
    id: "SWM-03",
    sponsor: "Swarm",
    what: "Bee 2.8.3 node chequebook deployed",
    links: [
      {
        label: "Chequebook",
        href: "https://sepolia.etherscan.io/address/0x6f045e3A46048c77F3555AA87b78CD665Dd891bB",
      },
    ],
  },
  {
    id: "ARK-03b",
    sponsor: "Swarm",
    what: "The towel task's rubric stored on Swarm and linked from the Arkiv task",
    links: [
      {
        label: "Gateway",
        href: "https://api.gateway.ethswarm.org/bytes/2a6ba126c36859a953e1ff2883bbe6d0c94b60ae534f3a9c3973b96888e80e81",
      },
    ],
  },
  {
    id: "WLD-01",
    sponsor: "World",
    what: "IDKit app and relying party registered for the claim-task action; Agent Pass app registered",
    links: [],
  },
]

export default function ProofsPage() {
  return (
    <Page>
      <PageHeader
        title="Proofs"
        lead="Every row is something that happened on a public network during the hackathon, with a link you can open."
      />
      <ul className="pb-10">
        {PROOFS.map((p) => (
          <li
            key={p.id}
            className="grid grid-cols-1 gap-2 border-t py-4 md:grid-cols-[120px_1fr_auto] md:items-center md:gap-6"
          >
            <div className="text-[13px] text-muted-foreground">{p.sponsor}</div>
            <div className="text-[15px] text-pretty">{p.what}</div>
            <div className="flex flex-wrap gap-2">
              {p.links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-8 items-center gap-1 rounded-full border px-3 text-[13px] hover:border-foreground/30"
                >
                  {l.label}
                  <ArrowUpRight className="size-3.5 opacity-60" aria-hidden="true" />
                </a>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </Page>
  )
}
