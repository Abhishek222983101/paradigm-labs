"use client"

import { links, shortHex } from "@adx/shared"
import Link from "next/link"
import { useEffect, useState } from "react"
import { ProofLink } from "@/components/proof/proof-link"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/lib/wallet/use-wallet"
import { WalletCard } from "./wallet-card"

type Licence = { amount: number; tx: string | null; licenceKey: string | null; at: string }

/** Earnings + licences for the wallet on this phone. Reads only real settled payments. */
export function MePanel() {
  const w = useWallet()
  const address = w.status === "locked" || w.status === "unlocked" ? w.address : null
  const [earned, setEarned] = useState(0)
  const [licences, setLicences] = useState<Licence[]>([])
  useEffect(() => {
    if (!address) return
    const load = () =>
      fetch(`/api/contributor?wallet=${address}`)
        .then((r) => r.json())
        .then((j: { earnedUsdc?: number; licences?: Licence[] }) => {
          setEarned(j.earnedUsdc ?? 0)
          setLicences(j.licences ?? [])
        })
        .catch(() => undefined)
    void load()
    const id = setInterval(load, 8000)
    return () => clearInterval(id)
  }, [address])

  return (
    <div className="grid grid-cols-1 gap-5 pb-10 lg:grid-cols-[360px_1fr]">
      <section className="rounded-[20px] bg-foreground p-5 text-background">
        <div className="text-[13px] opacity-70">Paid to you</div>
        <div className="mt-1 text-[44px] leading-none font-semibold tracking-[-0.04em] tabular">
          {earned.toFixed(2)}
          <span className="ml-2 font-sans text-[15px] font-normal opacity-70">USDC</span>
        </div>
        <WalletCard />
      </section>
      <section aria-labelledby="licences">
        <h2 id="licences" className="text-[17px] font-semibold">
          Licences you own
        </h2>
        <p className="mt-1 text-[14px] text-muted-foreground">
          A licence lets the buyer use your clip for training. It lives on Arkiv, owned by your wallet.
        </p>
        {licences.length ? (
          <ul className="mt-4 space-y-2">
            {licences.map((l) => (
              <li key={l.licenceKey} className="rounded-[16px] border bg-card p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[15px] font-medium">Robot-training clip</span>
                  <span className="font-mono text-[15px] tabular">+{l.amount} USDC</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {l.licenceKey ? (
                    <ProofLink
                      kind="arkiv"
                      href={links.arkivEntity(l.licenceKey)}
                      label={`Licence ${shortHex(l.licenceKey)}`}
                    />
                  ) : null}
                  {l.tx ? <ProofLink kind="hedera" href={links.hashscanTx(l.tx)} label="Payment" /> : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4 rounded-[16px] border border-dashed p-5 text-[14px] text-muted-foreground">
            No licences yet. When a clip you filmed is accepted and paid for, its licence appears here.
          </div>
        )}
        <Button asChild variant="signal" size="lg" className="mt-6">
          <Link href="/tasks">Find a task</Link>
        </Button>
      </section>
    </div>
  )
}
