import { Button } from "@/components/ui/button"
import { ClaimFlow } from "./claim-flow"

type State = "open" | "full" | "closed"

/**
 * The single primary action on a task. On phones it docks above the bottom nav (thumb reach):
 * reward on one line, the action full width underneath, so the challenge card fits after claiming.
 * On desktop it sits in the sidebar. The claim flow itself is in claim-flow.tsx.
 */
export function ClaimPanel({
  taskKey,
  title,
  reward,
  state,
}: {
  taskKey: `0x${string}`
  title: string
  reward: string
  state: State
}) {
  return (
    <div className="fixed inset-x-0 bottom-16 z-30 max-h-[calc(100dvh-8rem)] overflow-y-auto border-t bg-background/95 px-4 pt-3 pb-4 backdrop-blur-xl md:static md:max-h-none md:overflow-visible md:rounded-[18px] md:border md:bg-card md:p-5">
      <div className="mx-auto flex max-w-md flex-col gap-3 md:max-w-none">
        <div className="flex items-baseline justify-between">
          <div className="font-mono text-[20px] leading-none font-medium tabular md:text-[28px]">
            {reward} <span className="font-sans text-[13px] font-normal text-muted-foreground">USDC</span>
          </div>
          <div className="text-[12px] text-muted-foreground">per accepted clip</div>
        </div>
        {state === "open" ? (
          <ClaimFlow taskKey={taskKey} title={title} />
        ) : (
          <Button variant="outline" size="xl" className="w-full" disabled>
            {state === "full" ? "All slots taken" : "This task has closed"}
          </Button>
        )}
      </div>
      <p className="mx-auto mt-3 hidden max-w-md text-[13px] text-muted-foreground md:block">
        One slot per person. You prove you're a unique human with World ID; we never learn who you are.
      </p>
    </div>
  )
}
