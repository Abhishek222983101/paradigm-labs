"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

/** Re-renders server data every few seconds (console feed, approvals). Pauses when the tab is hidden. */
export function AutoRefresh({ ms = 5000 }: { ms?: number }) {
  const router = useRouter()
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh()
    }, ms)
    return () => clearInterval(id)
  }, [router, ms])
  return null
}
