import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface LoadingStateProps {
  connectionStatus?: string
  dbStatus?: any
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
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full w-2/3 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
