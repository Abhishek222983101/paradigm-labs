import { cn } from "@/lib/utils"

/**
 * Slots as physical cells, echoing the Paradigm mark: one cell per verified human.
 * Filled cells are taken; the label says what's left in words.
 */
export function SlotRail({
  slots,
  filled,
  size = "md",
}: {
  slots: number
  filled: number
  size?: "sm" | "md"
}) {
  const left = Math.max(0, slots - filled)
  const cells = Array.from({ length: Math.min(slots, 12) }, (_, i) => i < filled)
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex gap-1" role="img" aria-label={`${filled} of ${slots} slots taken, ${left} left`}>
        {cells.map((taken, i) => (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length visual cells
            key={i}
            className={cn(
              "rounded-[4px] border",
              size === "sm" ? "size-3" : "size-4",
              taken ? "border-signal bg-signal" : "border-foreground/25 bg-transparent",
            )}
          />
        ))}
      </div>
      <span className="text-[13px] text-muted-foreground tabular">
        {left === 0 ? "All slots taken" : `${left} of ${slots} left`}
      </span>
    </div>
  )
}
