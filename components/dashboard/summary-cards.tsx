import React, { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const AnimatedNumber = React.memo(function AnimatedNumber({
  value,
  className,
}: {
  value: number
  className?: string
}): JSX.Element {
  const [displayValue, setDisplayValue] = useState(value)
  const [reduceMotion, setReduceMotion] = useState(false)
  const frameRef = useRef<number | null>(null)
  const startValueRef = useRef(value)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = () => setReduceMotion(mediaQuery.matches)
    handleChange()
    mediaQuery.addEventListener?.('change', handleChange)
    return () => mediaQuery.removeEventListener?.('change', handleChange)
  }, [])

  useEffect(() => {
    if (reduceMotion) {
      setDisplayValue(value)
      return
    }

    startValueRef.current = displayValue
    const startTime = performance.now()
    const duration = 1100

    const step = () => {
      const elapsed = performance.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const t = progress
      const eased = 1 - Math.pow(1 - t, 4)
      const baseValue = startValueRef.current + (value - startValueRef.current) * eased
      const overshoot = Math.sin(t * Math.PI) * (value - startValueRef.current) * 0.018
      const nextValue = baseValue + overshoot
      setDisplayValue(Math.round(nextValue))

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step)
      }
    }

    frameRef.current = requestAnimationFrame(step)

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <span
      className={cn(
        'inline-flex items-baseline gap-1 text-3xl font-semibold leading-tight animate-scale-in',
        className
      )}
    >
      {displayValue.toLocaleString()}
    </span>
  )
})

interface SummaryCardsProps {
  filteredAccountsCount: number
  totalAccountsCount: number
  filteredCentersCount: number
  totalCentersCount: number
  filteredProspectsCount: number
  totalProspectsCount: number
  activeView: "accounts" | "centers" | "prospects"
  onSelect: (view: "accounts" | "centers" | "prospects") => void
}

export const SummaryCards = React.memo(function SummaryCards({
  filteredAccountsCount,
  totalAccountsCount,
  filteredCentersCount,
  totalCentersCount,
  filteredProspectsCount,
  totalProspectsCount,
  activeView,
  onSelect,
}: SummaryCardsProps): JSX.Element {
  const cards = [
    {
      id: 'accounts',
      title: 'Total Accounts',
      value: filteredAccountsCount,
      total: totalAccountsCount,
      colorVar: '--chart-1',
    },
    {
      id: 'centers',
      title: 'Total Centers',
      value: filteredCentersCount,
      total: totalCentersCount,
      colorVar: '--chart-2',
    },
    {
      id: 'prospects',
      title: 'Total Prospects',
      value: filteredProspectsCount,
      total: totalProspectsCount,
      colorVar: '--chart-3',
    },
  ] as const

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6" aria-label="Dashboard sections">
      {cards.map((card) => (
        <Card
          key={card.title}
          role="button"
          tabIndex={0}
          aria-pressed={activeView === card.id}
          onClick={() => onSelect(card.id)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onSelect(card.id)
            }
          }}
          className={cn(
            'relative cursor-pointer select-none overflow-hidden border border-border/60 bg-gradient-to-br from-background/90 via-background to-background shadow-[0_15px_50px_-35px_rgba(0,0,0,0.6)] dark:shadow-[0_20px_65px_-45px_rgba(0,0,0,0.85)] transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            activeView === card.id
              ? 'ring-2 ring-sidebar-ring border-sidebar-ring/70 shadow-[0_18px_55px_-30px_rgba(0,0,0,0.7)]'
              : 'hover:-translate-y-0.5'
          )}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-90"
            style={{
              background: `
                radial-gradient(circle at 18% 20%, hsl(var(${card.colorVar}) / 0.2), transparent 42%),
                radial-gradient(circle at 82% 0%, hsl(var(${card.colorVar}) / 0.14), transparent 36%),
                linear-gradient(125deg, hsl(var(${card.colorVar}) / 0.08), transparent 55%)
              `,
            }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-px rounded-[calc(var(--radius)-2px)] border border-white/20 dark:border-white/5 opacity-60"
            aria-hidden="true"
          />
          <CardHeader className="relative p-4 pb-2">
            <CardTitle className="text-sm font-medium text-sidebar-foreground">
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative flex items-end justify-between gap-3 p-4 pt-1">
            <div>
              <AnimatedNumber
                value={card.value}
                className="text-sidebar-foreground drop-shadow-[0_6px_12px_rgba(0,0,0,0.18)]"
              />
              <p className="mt-1 text-xs text-muted-foreground">Currently visible</p>
            </div>
            <span className="inline-flex items-center rounded-full border border-border/60 bg-secondary/70 px-3 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur-sm">
              {card.total.toLocaleString()} total
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  )
})
