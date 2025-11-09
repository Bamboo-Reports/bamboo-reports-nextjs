import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SummaryCardsProps {
  filteredAccountsCount: number
  totalAccountsCount: number
  filteredCentersCount: number
  totalCentersCount: number
  filteredServicesCount: number
  totalServicesCount: number
}

export function SummaryCards({
  filteredAccountsCount,
  totalAccountsCount,
  filteredCentersCount,
  totalCentersCount,
  filteredServicesCount,
  totalServicesCount,
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{filteredAccountsCount}</div>
          <p className="text-xs text-gray-500">of {totalAccountsCount} total</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total Centers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{filteredCentersCount}</div>
          <p className="text-xs text-gray-500">of {totalCentersCount} total</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{filteredServicesCount}</div>
          <p className="text-xs text-gray-500">of {totalServicesCount} total</p>
        </CardContent>
      </Card>
    </div>
  )
}
