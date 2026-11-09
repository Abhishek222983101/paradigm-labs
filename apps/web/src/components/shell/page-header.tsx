import type { ReactNode } from "react"

export function PageHeader({
  title,
  lead,
  children,
}: {
  title: string
  lead?: ReactNode
  children?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 pt-6 pb-5">
      <div className="min-w-0">
        <h1 className="text-[34px] leading-[1.05] font-semibold tracking-[-0.035em] md:text-[40px]">
          {title}
        </h1>
        {lead ? (
          <p className="mt-2 max-w-[40ch] text-[15px] leading-relaxed text-muted-foreground text-pretty">
            {lead}
          </p>
        ) : null}
      </div>
      {children}
    </div>
  )
}

export function Page({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-[1120px] px-5">{children}</div>
}

export function Pending({ what }: { what: string }) {
  return <div className="rounded-xl border border-dashed p-8 text-[15px] text-muted-foreground">{what}</div>
}
