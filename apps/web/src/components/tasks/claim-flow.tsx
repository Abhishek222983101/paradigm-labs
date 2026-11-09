"use client"

// The claim journey on one button: wallet (first time: one tap) → World ID → slot saved on Arkiv →
// challenge card. Every step says what's happening in plain words; nothing is taken if a step fails.
import type { ApiError, ClaimResponse } from "@adx/shared/claim"
import { claimMessage, claimSignal } from "@adx/shared/claim"
import type { IDKitResult, RpContext } from "@worldcoin/idkit"
import { deviceLegacy, proofOfHuman, selfieCheck } from "@worldcoin/idkit"
import { Loader2, RotateCcw, ShieldCheck, Video } from "lucide-react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { dropClaim, readClaims, saveClaim } from "@/lib/claims-local"
import { ensureAccount } from "@/lib/wallet/use-wallet"
import { ChallengeCard } from "./challenge-card"

const IDKitRequestWidget = dynamic(() => import("@worldcoin/idkit").then((m) => m.IDKitRequestWidget), {
  ssr: false,
})

type Phase =
  | { kind: "idle" }
  | { kind: "wallet" }
  | {
      kind: "world"
      rp: RpContext
      appId: `app_${string}`
      action: string
      env: "production" | "staging"
      wallet: `0x${string}`
    }
  | { kind: "saving" }
  | { kind: "done"; claim: ClaimResponse }
  | {
      kind: "blocked"
      code: string
      message: string
      submissionId: string | null
      canRestart: boolean
      restartToken?: string
    }

type ClaimError = ApiError & {
  error: { details?: { submissionId?: string | null; canRestart?: boolean; restartToken?: string } }
}

// Which World ID credential we ask for. "device" (default) = any verified World ID (Orb or device),
// works for everyone today. "human" = World ID 4.0 proof of human (Orb). "selfie" = Selfie Check, which
// World has to enable for the app first (World App says "Feature unavailable" until then).
const PRESET_ENV = process.env.NEXT_PUBLIC_WORLD_PRESET
const PRESET: "device" | "human" | "selfie" =
  PRESET_ENV === "selfie" || PRESET_ENV === "human" ? PRESET_ENV : "device"

function presetFor(signal: string) {
  if (PRESET === "selfie") return selfieCheck({ signal })
  if (PRESET === "human") return proofOfHuman({ signal })
  return deviceLegacy({ signal })
}

export function ClaimFlow({ taskKey, title }: { taskKey: `0x${string}`; title: string }) {
  const [phase, setPhase] = useState<Phase>({ kind: "idle" })
  const [open, setOpen] = useState(false)
  const settled = useRef(false)
  const restartRef = useRef(false)

  // Already holding a slot on this phone? Go straight to the challenge.
  useEffect(() => {
    const mine = readClaims().find((c) => c.taskKey.toLowerCase() === taskKey.toLowerCase())
    if (mine) setPhase({ kind: "done", claim: mine })
  }, [taskKey])

  async function start(restart = false) {
    settled.current = false
    restartRef.current = restart
    try {
      setPhase({ kind: "wallet" })
      const account = await ensureAccount()
      const r = await fetch("/api/world/rp-signature", { method: "POST" })
      const j = (await r.json()) as
        | {
            app_id: `app_${string}`
            action: string
            environment: "production" | "staging"
            rp_context: RpContext
          }
        | ApiError
      if (!r.ok || "error" in j) throw new Error("error" in j ? j.error.message : "World ID isn't available")
      setPhase({
        kind: "world",
        rp: j.rp_context,
        appId: j.app_id,
        action: j.action,
        env: j.environment,
        wallet: account.address,
      })
      setOpen(true)
    } catch (e) {
      setPhase({ kind: "idle" })
      toast.error((e as Error).message || "Couldn't start. Try again.")
    }
  }

  // Runs inside the World ID sheet: the sheet shows success only after our server accepted the claim.
  async function verifyOnServer(result: IDKitResult) {
    if (phase.kind !== "world") throw new Error("not ready")
    const account = await ensureAccount()
    const signature = await account.signMessage({
      message: claimMessage(taskKey, account.address, result.nonce),
    })
    setPhase({ kind: "saving" })
    const r = await fetch("/api/claims", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        taskKey,
        wallet: account.address,
        signature,
        idkit: result,
        restart: restartRef.current,
      }),
    })
    const j = (await r.json()) as ClaimResponse | ClaimError
    if (!r.ok || "error" in j) {
      const message = "error" in j ? j.error.message : "Couldn't save your slot"
      settled.current = true
      const code = "error" in j ? j.error.code : "error"
      if (code === "already_submitted" || code === "already_claimed") {
        const d = "error" in j ? j.error.details : undefined
        setPhase({
          kind: "blocked",
          code,
          message,
          submissionId: d?.submissionId ?? null,
          canRestart: Boolean(d?.canRestart),
          restartToken: d?.restartToken,
        })
      } else {
        setPhase({ kind: "idle" })
        toast.error(message)
      }
      throw new Error(message)
    }
    for (const old of readClaims().filter((c) => c.taskKey.toLowerCase() === taskKey.toLowerCase()))
      dropClaim(old.claimKey)
    saveClaim({ ...j, title, savedAt: Date.now() })
    settled.current = true
    setPhase({ kind: "done", claim: j })
    if (j.resumed) toast("You already hold a slot on this task. Here's your challenge again.")
    else if (restartRef.current) toast.success("Started over with a fresh slot and a new challenge.")
  }

  // Start over without a second World ID check: the server issued a one-time pass moments ago, right after
  // this person proved their World ID. The wallet signs the request; the pass expires in 2 minutes.
  async function startOverWithPass(restartToken: string) {
    try {
      setPhase({ kind: "saving" })
      const account = await ensureAccount()
      const signature = await account.signMessage({
        message: claimMessage(taskKey, account.address, `restart:${restartToken.slice(-24)}`),
      })
      const r = await fetch("/api/claims", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ taskKey, wallet: account.address, signature, restartToken }),
      })
      const j = (await r.json()) as ClaimResponse | ClaimError
      if (!r.ok || "error" in j) {
        // Pass expired or already used: fall back to a normal World ID claim.
        if ("error" in j && (j.error.code === "restart_expired" || j.error.code === "restart_used"))
          return start(true)
        throw new Error("error" in j ? j.error.message : "Couldn't start over")
      }
      for (const old of readClaims().filter((c) => c.taskKey.toLowerCase() === taskKey.toLowerCase()))
        dropClaim(old.claimKey)
      saveClaim({ ...j, title, savedAt: Date.now() })
      setPhase({ kind: "done", claim: j })
      toast.success("Started over with a fresh slot and a new challenge.")
    } catch (e) {
      setPhase({ kind: "idle" })
      toast.error((e as Error).message || "Couldn't start over")
    }
  }

  if (phase.kind === "blocked") {
    return (
      <div className="space-y-3" role="status">
        <div>
          <div className="text-[15px] font-medium">{phase.message}</div>
          <p className="mt-1 text-[13.5px] text-muted-foreground">
            {phase.code === "already_submitted"
              ? "One clip per person per task. You can follow its checks below."
              : "Each person gets one slot per task."}
            {phase.canRestart
              ? " For a fresh run, start over: your old slot is released and you get a new challenge."
              : ""}
          </p>
        </div>
        <div className="grid gap-2">
          {phase.submissionId ? (
            <Button asChild variant="outline" size="xl" className="w-full">
              <Link href={`/submissions/${phase.submissionId}`}>See your clip</Link>
            </Button>
          ) : null}
          {phase.canRestart ? (
            <Button
              variant="signal"
              size="xl"
              className="w-full"
              onClick={() => (phase.restartToken ? startOverWithPass(phase.restartToken) : start(true))}
            >
              <RotateCcw />
              Start over
            </Button>
          ) : null}
        </div>
      </div>
    )
  }

  if (phase.kind === "done") {
    const c = phase.claim
    return (
      <div className="space-y-4">
        <div>
          <div className="text-[13px] text-success">Your slot is saved</div>
          <p className="mt-1 text-[14px] text-muted-foreground">
            Do this on camera while you fold. You have 2 hours to record.
          </p>
        </div>
        <ChallengeCard word={c.challenge.word} fingers={c.challenge.fingers} />
        <Button asChild variant="signal" size="xl" className="w-full">
          <Link href={`/record/${c.claimKey}`}>
            <Video />
            Start recording
          </Link>
        </Button>
        <button
          type="button"
          onClick={() => {
            dropClaim(c.claimKey)
            setPhase({ kind: "idle" })
          }}
          className="w-full py-1 text-center text-[13px] text-muted-foreground underline underline-offset-4"
        >
          Not you, or need a new challenge? Claim again
        </button>
      </div>
    )
  }

  const busy = phase.kind === "wallet" || phase.kind === "saving" || phase.kind === "world"
  const label =
    phase.kind === "wallet"
      ? "Opening your wallet…"
      : phase.kind === "world"
        ? "Waiting for World ID…"
        : phase.kind === "saving"
          ? "Saving your slot on Arkiv…"
          : "Claim with World ID"

  return (
    <>
      <Button
        variant="signal"
        size="xl"
        className="w-full"
        onClick={() => start(false)}
        disabled={busy}
        aria-live="polite"
      >
        {busy ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
        {label}
      </Button>
      {phase.kind === "saving" ? (
        <p className="mt-2 text-center text-[13px] text-muted-foreground">Recording your claim on Arkiv…</p>
      ) : null}
      {phase.kind === "world" ? (
        <IDKitRequestWidget
          open={open}
          onOpenChange={(o) => {
            setOpen(o)
            if (!o && !settled.current) {
              setPhase({ kind: "idle" })
              toast("World ID was closed. No slot was taken.")
            }
          }}
          app_id={phase.appId}
          action={phase.action}
          rp_context={phase.rp}
          environment={phase.env}
          allow_legacy_proofs={PRESET !== "selfie"}
          preset={presetFor(claimSignal(taskKey, phase.wallet))}
          handleVerify={verifyOnServer}
          onSuccess={() => setOpen(false)}
          onError={(code) => {
            if (settled.current) return
            setPhase({ kind: "idle" })
            toast(
              code === "user_rejected"
                ? "You cancelled World ID. No slot was taken."
                : code === "credential_unavailable" || code === "feature_unavailable"
                  ? "World ID can't run this check for this app yet. No slot was taken."
                  : "World ID didn't finish. No slot was taken.",
            )
          }}
        />
      ) : null}
    </>
  )
}
