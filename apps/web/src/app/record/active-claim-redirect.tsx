"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { readClaims } from "@/lib/claims-local"

/** If this phone holds a live claim, Record opens it directly. */
export function ActiveClaimRedirect() {
  const router = useRouter()
  useEffect(() => {
    const c = readClaims()[0]
    if (c) router.replace(`/record/${c.claimKey}`)
  }, [router])
  return null
}
