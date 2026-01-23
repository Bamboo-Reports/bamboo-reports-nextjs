"use client"

interface InfoRowProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number | null | undefined
  link?: string
}

export function InfoRow({ icon: Icon, label, value, link }: InfoRowProps) {
  if (value === null || value === undefined) return null

  const displayValue = typeof value === "number" ? value.toString() : value
  if (displayValue.trim() === "") return null

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-background/40 backdrop-blur-sm border border-border/50 hover:border-border transition-colors dark:bg-white/5 dark:border-white/10 dark:backdrop-blur-md dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
      <div className="mt-0.5">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary hover:underline break-words"
          >
            {displayValue}
          </a>
        ) : (
          <p className="text-sm font-medium break-words whitespace-pre-line">{displayValue}</p>
        )}
      </div>
    </div>
  )
}
