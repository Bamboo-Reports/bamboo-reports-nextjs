import { cn } from "@/lib/utils"

interface RecentlyUpdatedIndicatorProps {
  className?: string
  title?: string
}

export function RecentlyUpdatedIndicator({
  className,
  title = "Recently updated",
}: RecentlyUpdatedIndicatorProps) {
  return (
    <span
      className={cn("relative inline-flex h-2.5 w-2.5 shrink-0", className)}
      role="status"
      aria-label="Recently updated"
      title={title}
    >
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400/70" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.75)]" />
    </span>
  )
}

