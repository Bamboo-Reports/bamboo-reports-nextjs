import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative overflow-hidden rounded-xl border border-border/70 bg-gradient-to-br from-background/95 via-background/90 to-background text-card-foreground shadow-[0_20px_70px_-50px_rgba(0,0,0,0.9)] backdrop-blur-sm transition-transform duration-200 hover:-translate-y-[1px]",
      className
    )}
    {...props}
  >
    <div
      className="pointer-events-none absolute inset-0 opacity-90"
      aria-hidden="true"
      style={{
        background:
          "radial-gradient(circle at 15% 20%, hsl(var(--chart-1) / 0.12), transparent 40%)," +
          "radial-gradient(circle at 85% 0%, hsl(var(--chart-3) / 0.12), transparent 36%)," +
          "linear-gradient(135deg, hsl(var(--card) / 0.7), hsl(var(--card) / 0.55))",
      }}
    />
    <div
      className="pointer-events-none absolute inset-px rounded-[calc(var(--radius)-2px)] border border-white/15 dark:border-white/5 opacity-60"
      aria-hidden="true"
    />
    <div className="relative">{children}</div>
  </div>
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
