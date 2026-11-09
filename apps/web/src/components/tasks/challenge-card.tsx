import { Hand } from "lucide-react"

/** "Say MANGO, hold up 3 fingers": the liveness challenge, shown big enough to read at arm's length. */
export function ChallengeCard({
  word,
  fingers,
  compact = false,
}: {
  word: string
  fingers: number
  compact?: boolean
}) {
  return (
    <div className={compact ? "flex items-center gap-4" : "grid grid-cols-2 gap-2"}>
      <div className={compact ? "" : "rounded-2xl bg-signal p-4 text-signal-ink"}>
        <div className={compact ? "text-[12px] opacity-80" : "text-[13px] opacity-75"}>Say this word</div>
        <div
          className={
            compact
              ? "text-[22px] font-semibold"
              : "mt-1 text-[30px] leading-none font-semibold tracking-[-0.02em]"
          }
        >
          {word}
        </div>
      </div>
      <div className={compact ? "" : "rounded-2xl bg-foreground p-4 text-background"}>
        <div className={compact ? "text-[12px] opacity-80" : "text-[13px] opacity-70"}>Hold up</div>
        <div
          className={
            compact
              ? "flex items-center gap-1.5 text-[22px] font-semibold"
              : "mt-1 flex items-center gap-2 text-[30px] leading-none font-semibold"
          }
        >
          {fingers}
          <Hand className={compact ? "size-5" : "size-7"} aria-hidden="true" />
          <span className="sr-only">fingers</span>
        </div>
      </div>
    </div>
  )
}
