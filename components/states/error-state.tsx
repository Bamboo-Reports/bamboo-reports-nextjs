import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Info, Database, RefreshCw, ExternalLink, Copy } from "lucide-react"
import { copyToClipboard } from "@/lib/utils/helpers"

interface DatabaseStatus {
  hasUrl: boolean
  hasConnection: boolean
  urlLength: number
  environment: string
  cacheSize: number
  cacheKeys: string[]
  error?: string
}

interface ErrorStateProps {
  error: string
  dbStatus?: DatabaseStatus | null
  onRetry: () => void
  onClearCache: () => void
}

export function ErrorState({ error, dbStatus, onRetry, onClearCache }: ErrorStateProps) {
  const isUrlMissing = dbStatus && !dbStatus.hasUrl

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center space-y-6">
            <AlertCircle className="h-16 w-16 text-red-600 dark:text-red-500" />
            <div>
              <h2 className="text-2xl font-semibold mb-2 text-red-600 dark:text-red-500">Database Configuration Error</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
            </div>

            {isUrlMissing && (
              <div className="w-full space-y-4 text-left">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Quick Fix:</strong> You need to add your Neon database URL to Vercel environment
                    variables.
                  </AlertDescription>
                </Alert>

                <div className="bg-muted p-4 rounded-lg space-y-4">
                  <h3 className="font-semibold text-foreground">Step-by-Step Setup:</h3>

                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                        1
                      </div>
                      <div>
                        <p className="font-medium">Go to your Vercel Dashboard</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-1 bg-transparent"
                          onClick={() => window.open("https://vercel.com/dashboard", "_blank", "noopener,noreferrer")}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open Vercel Dashboard
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                        2
                      </div>
                      <div>
                        <p className="font-medium">Select your project → Settings → Environment Variables</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                        3
                      </div>
                      <div className="w-full">
                        <p className="font-medium mb-2">Add a new environment variable:</p>
                        <div className="bg-card p-3 rounded border space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-sm">Name: DATABASE_URL</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard("DATABASE_URL")}
                              aria-label="Copy DATABASE_URL variable name"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <div>
                            <span className="font-mono text-sm">Value: Your Neon connection string</span>
                            <p className="text-xs text-muted-foreground mt-1">
                              Format: postgresql://username:password@host/database?sslmode=require
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                        4
                      </div>
                      <div>
                        <p className="font-medium">Save and redeploy your application</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert>
                  <Database className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Need your Neon connection string?</strong> Go to your Neon dashboard → Select your
                    database → Connection Details → Copy the connection string.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {dbStatus && (
              <div className="w-full bg-muted p-4 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Debug Information:</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Database URL:</span>
                    <span className={dbStatus.hasUrl ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}>
                      {dbStatus.hasUrl ? "✓ Configured" : "✗ Missing"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Connection:</span>
                    <span className={dbStatus.hasConnection ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}>
                      {dbStatus.hasConnection ? "✓ Initialized" : "✗ Failed"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Environment:</span>
                    <span className="text-muted-foreground">{dbStatus.environment}</span>
                  </div>
                  {dbStatus.urlLength > 0 && (
                    <div className="flex justify-between">
                      <span>URL Length:</span>
                      <span className="text-muted-foreground">{dbStatus.urlLength} chars</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={onRetry} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Retry Connection
              </Button>
              <Button onClick={onClearCache} variant="outline" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Clear Cache
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
