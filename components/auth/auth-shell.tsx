"use client"

import type { ReactNode } from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface AuthShellProps {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
  footer: ReactNode
  formCardClassName?: string
}

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
  formCardClassName,
}: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.14),transparent_40%),radial-gradient(circle_at_80%_15%,rgba(56,189,248,0.12),transparent_45%),radial-gradient(circle_at_50%_100%,rgba(37,99,235,0.1),transparent_45%)] px-4 py-12 sm:px-6">
      <div className="pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl animate-auth-float" />
      <div className="pointer-events-none absolute -right-24 top-1/4 h-80 w-80 rounded-full bg-sky-500/15 blur-3xl animate-auth-float-delay" />
      <div className="pointer-events-none absolute bottom-[-8rem] left-1/2 h-72 w-[26rem] -translate-x-1/2 rounded-full bg-blue-700/15 blur-3xl animate-auth-breathe" />

      <div className="relative z-10 w-full max-w-xl">
        <Card
          className={cn(
            "w-full border-border/70 bg-card/90 shadow-[0_30px_80px_-45px_rgba(59,130,246,0.5)] backdrop-blur-xl",
            formCardClassName
          )}
        >
          <div className="p-8 sm:p-9">
            <div className="mb-6">
              <p className="inline-flex rounded-full border border-blue-500/25 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-700 dark:text-blue-300">
                {eyebrow}
              </p>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            </div>

            {children}

            <div className="mt-5 text-sm text-muted-foreground">{footer}</div>
          </div>
        </Card>
      </div>

      <style jsx>{`
        @keyframes auth-float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-14px);
          }
        }

        @keyframes auth-breathe {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.9;
          }
          50% {
            transform: scale(1.08);
            opacity: 1;
          }
        }

        .animate-auth-float {
          animation: auth-float 7s ease-in-out infinite;
        }

        .animate-auth-float-delay {
          animation: auth-float 8s ease-in-out infinite 0.8s;
        }

        .animate-auth-breathe {
          animation: auth-breathe 2.4s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
