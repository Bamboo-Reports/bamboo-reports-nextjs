import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface DatabaseStatus {
  hasUrl: boolean
  hasConnection: boolean
  urlLength: number
  environment: string
  cacheSize: number
  cacheKeys: string[]
  error?: string
}

interface LoadingStateProps {
  connectionStatus?: string
  dbStatus?: DatabaseStatus | null
}

export function LoadingState(_: LoadingStateProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-96">
        <CardContent className="flex flex-col items-center justify-center p-8">
          <Loader2 className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4 animate-spin" />
          <h2 className="text-xl font-semibold mb-2">Bamboo Reports is loading</h2>
          <p className="text-muted-foreground text-center mb-4">Preparing your dashboard</p>
          <div className="w-full">
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden relative">
              <div className="absolute inset-y-0 w-1/3 rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 animate-loading-bar" />
            </div>
          </div>
          <style jsx>{`
            @keyframes loading-bar {
              0% {
                transform: translateX(-110%);
              }
              100% {
                transform: translateX(310%);
              }
            }
            .animate-loading-bar {
              animation: loading-bar 1.2s ease-in-out infinite;
            }
          `}</style>
        </CardContent>
      </Card>
    </div>
  )
}
