import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Info, Database, RefreshCw, ExternalLink, Copy } from "lucide-react"
import { copyToClipboard } from "@/lib/utils/helpers"

interface ErrorStateProps {
  error: string
  dbStatus?: any
  onRetry: () => void
  onClearCache: () => void
}

export function ErrorState({ error, dbStatus, onRetry, onClearCache }: ErrorStateProps) {
  const isUrlMissing = dbStatus && !dbStatus.hasUrl

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center space-y-6">
            <AlertCircle className="h-16 w-16 text-red-600" />
            <div>
              <h2 className="text-2xl font-semibold mb-2 text-red-600">Database Configuration Error</h2>
              <p className="text-gray-600 mb-4">{error}</p>
            </div>

            {isUrlMissing && (
              <div className="w-full space-y-4 text-left">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Quick Fix:</strong> You need to add your Neon database URL to Vercel's environment
                    variables.
                  </AlertDescription>
                </Alert>

                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <h3 className="font-semibold text-gray-900">Step-by-Step Setup:</h3>

                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                        1
                      </div>
                      <div>
                        <p className="font-medium">Go to your Vercel Dashboard</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-1 bg-transparent"
                          onClick={() => window.open("https://vercel.com/dashboard", "_blank")}
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
                        <div className="bg-white p-3 rounded border space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-sm">Name: DATABASE_URL</span>
                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard("DATABASE_URL")}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <div>
                            <span className="font-mono text-sm">Value: Your Neon connection string</span>
                            <p className="text-xs text-gray-500 mt-1">
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
              <div className="w-full bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Debug Information:</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Database URL:</span>
                    <span className={dbStatus.hasUrl ? "text-green-600" : "text-red-600"}>
                      {dbStatus.hasUrl ? "✓ Configured" : "✗ Missing"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Connection:</span>
                    <span className={dbStatus.hasConnection ? "text-green-600" : "text-red-600"}>
                      {dbStatus.hasConnection ? "✓ Initialized" : "✗ Failed"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Environment:</span>
                    <span className="text-gray-600">{dbStatus.environment}</span>
                  </div>
                  {dbStatus.urlLength > 0 && (
                    <div className="flex justify-between">
                      <span>URL Length:</span>
                      <span className="text-gray-600">{dbStatus.urlLength} chars</span>
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
