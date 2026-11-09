"use client"

import Link from "next/link"
import { use, useEffect, useState } from "react"
import { Recorder } from "@/components/recorder/recorder"
import { Button } from "@/components/ui/button"
import { claimFor, type LocalClaim } from "@/lib/claims-local"

export function RecordClaim({ params }: { params: Promise<{ claim: string }> }) {
  const { claim: claimKey } = use(params)
  const [claim, setClaim] = useState<LocalClaim | null | undefined>(undefined)
  useEffect(() => setClaim(claimFor(claimKey) ?? null), [claimKey])

  if (claim === undefined) return null
  if (claim === null) {
    return (
      <div className="mx-auto max-w-sm px-5 pt-20 text-center">
        <h1 className="text-[24px] font-semibold tracking-[-0.02em]">This claim isn't on this phone</h1>
        <p className="mt-2 text-[15px] text-muted-foreground">
          Record on the phone you claimed with, or claim a task here. Unused claims end after 2 hours.
        </p>
        <Button asChild variant="signal" size="xl" className="mt-8">
          <Link href="/tasks">See open tasks</Link>
        </Button>
      </div>
    )
  }
  return <Recorder claim={claim} />
}
