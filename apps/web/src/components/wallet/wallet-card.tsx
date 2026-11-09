"use client"

import { links, shortHex } from "@adx/shared"
import { Fingerprint, KeyRound, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { ProofLink } from "@/components/proof/proof-link"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/lib/wallet/use-wallet"

/** The contributor's embedded wallet: address, how it's protected, and the Hedera account that gets paid. */
export function WalletCard() {
  const w = useWallet()
  const [busy, setBusy] = useState(false)
  const [hedera, setHedera] = useState<string | null>(null)
  const [rep, setRep] = useState<{
    accepted: number
    rejected: number
    checksLeft: number
    freeChecks: number
    blocked: boolean
  } | null>(null)
  const address = w.status === "locked" || w.status === "unlocked" ? w.address : null

  useEffect(() => {
    if (!address) return
    fetch(`/api/contributor?wallet=${address}`)
      .then((r) => r.json())
      .then((j: { hederaAccount?: string | null; reputation?: typeof rep }) => {
        setHedera(j.hederaAccount ?? null)
        setRep(j.reputation ?? null)
      })
      .catch(() => undefined)
  }, [address])

  async function create() {
    setBusy(true)
    try {
      await w.ensureAccount()
      toast.success("Wallet ready")
    } catch (e) {
      toast.error((e as Error).message || "Couldn't open the wallet")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-6 rounded-xl bg-background/10 p-4 text-[13px]">
      <div className="opacity-70">Your wallet</div>
      {w.status === "loading" ? (
        <div className="mt-1 h-5 w-40 animate-pulse rounded bg-background/20" />
      ) : w.status === "unsupported" ? (
        <p className="mt-1">{w.reason}</p>
      ) : w.status === "none" ? (
        <>
          <p className="mt-1">Lives on this phone. No email, no password, no app to install.</p>
          <Button variant="signal" size="lg" className="mt-3" onClick={create} disabled={busy}>
            {busy ? <Loader2 className="animate-spin" /> : <Fingerprint />}
            Create my wallet
          </Button>
        </>
      ) : (
        <>
          <div className="mt-1 font-mono text-[15px]" title={w.address}>
            {shortHex(w.address, 8, 6)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 opacity-80">
            {w.mode === "passkey" ? <Fingerprint className="size-3.5" /> : <KeyRound className="size-3.5" />}
            {w.mode === "passkey" ? "Opens with your face or fingerprint" : "Kept on this device"}
          </div>
          {rep ? (
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-background/10 py-2">
                <div className="font-mono text-[18px] tabular">{rep.accepted}</div>
                <div className="text-[11px] opacity-70">accepted</div>
              </div>
              <div className="rounded-lg bg-background/10 py-2">
                <div className="font-mono text-[18px] tabular">{rep.rejected}</div>
                <div className="text-[11px] opacity-70">rejected</div>
              </div>
              <div className="rounded-lg bg-background/10 py-2">
                <div className="font-mono text-[18px] tabular">{rep.checksLeft}</div>
                <div className="text-[11px] opacity-70">free checks</div>
              </div>
            </div>
          ) : null}
          {rep?.blocked ? (
            <p className="mt-2 text-[12px] text-danger">
              Too many rejected clips: this World ID can't claim new tasks.
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2 [&_a]:border-background/25 [&_a]:bg-white/10 [&_a]:text-background">
            <ProofLink kind="arkiv" href={links.arkivAddress(w.address)} label="Licences on Arkiv" />
            {hedera ? (
              <ProofLink kind="hedera" href={links.hashscanAccount(hedera)} label={`Paid to ${hedera}`} />
            ) : null}
          </div>
        </>
      )}
    </div>
  )
}
