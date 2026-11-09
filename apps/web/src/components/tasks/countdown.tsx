"use client"

import { useEffect, useState } from "react"

function format(secondsLeft: number): string {
  if (secondsLeft <= 0) return "Closed"
  const h = Math.floor(secondsLeft / 3600)
  const m = Math.floor((secondsLeft % 3600) / 60)
  if (h >= 48) return `${Math.floor(h / 24)} days left`
  if (h >= 1) return `${h} h ${m} min left`
  if (m >= 1) return `${m} min left`
  return "Under a minute left"
}

/** Deadline countdown from the task's on-chain `deadline` (unix seconds). Ticks every 30 s. */
export function Countdown({ deadline, className }: { deadline: number; className?: string }) {
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    setNow(Math.floor(Date.now() / 1000))
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 30_000)
    return () => clearInterval(id)
  }, [])
  return (
    <span className={className} suppressHydrationWarning>
      {now === null ? " " : format(deadline - now)}
    </span>
  )
}
