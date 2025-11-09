import { Button } from "@/components/ui/button"
import { CheckCircle, RefreshCw, Database } from "lucide-react"

interface HeaderProps {
  connectionStatus?: string
  onRefresh: () => void
  onClearCache: () => void
}

export function Header({ connectionStatus, onRefresh, onClearCache }: HeaderProps) {
  return (
    <div className="bg-white border-b shadow-sm sticky top-0 z-10">
      <div className="max-w-full mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Business Intelligence Platform</h1>
            <p className="text-sm text-gray-600 mt-1">Intelligence-driven insights for accounts, centers, and services</p>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-gray-500">Connected to Neon Database</span>
            <Button variant="ghost" size="sm" onClick={onRefresh} className="h-8 px-3">
              <RefreshCw className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClearCache} className="h-8 px-3" title="Clear Cache">
              <Database className="h-3 w-3" />
            </Button>
          </div>
        </div>
        {connectionStatus && <p className="text-xs text-gray-400 mt-1">{connectionStatus}</p>}
      </div>
    </div>
  )
}
