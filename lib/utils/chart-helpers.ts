import type { Account, Center, Function, ChartData } from "../types"

export const CHART_COLORS = [
  "#1E40AF",
  "#2563EB",
  "#3B82F6",
  "#60A5FA",
  "#93C5FD",
  "#1E3A8A",
  "#1D4ED8",
  "#0284C7",
  "#38BDF8",
  "#7DD3FC",
  "#0369A1",
  "#0EA5E9",
  "#4ADE80",
  "#22C55E",
  "#10B981",
  "#6366F1",
  "#8B5CF6",
  "#EC4899",
  "#F43F5E",
  "#F97316",
]

/**
 * Calculate chart data from accounts
 */
export const calculateChartData = (accounts: Account[], field: keyof Account): ChartData[] => {
  const counts = new Map<string, number>()

  accounts.forEach((account) => {
    const value = account[field] || "Unknown"
    counts.set(value, (counts.get(value) || 0) + 1)
  })

  return Array.from(counts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10) // Top 10 for better readability
}

/**
 * Calculate chart data from centers
 */
export const calculateCenterChartData = (centers: Center[], field: keyof Center): ChartData[] => {
  const counts = new Map<string, number>()

  centers.forEach((center) => {
    const value = center[field] || "Unknown"
    counts.set(value, (counts.get(value) || 0) + 1)
  })

  return Array.from(counts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10) // Top 10 for better readability
}

/**
 * Calculate city chart data with top 5 + Others
 */
export const calculateCityChartData = (centers: Center[]): ChartData[] => {
  const counts = new Map<string, number>()

  centers.forEach((center) => {
    const city = center.center_city || "Unknown"
    counts.set(city, (counts.get(city) || 0) + 1)
  })

  const sorted = Array.from(counts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  // Take top 5 and group the rest as "Others"
  if (sorted.length <= 5) {
    return sorted
  }

  const top5 = sorted.slice(0, 5)
  const others = sorted.slice(5).reduce((sum, item) => sum + item.value, 0)

  if (others > 0) {
    top5.push({ name: "Others", value: others })
  }

  return top5
}

/**
 * Calculate function chart data from centers
 */
export const calculateFunctionChartData = (functions: Function[], centerKeys: string[]): ChartData[] => {
  const counts = new Map<string, number>()
  const centerKeySet = new Set(centerKeys)

  functions.forEach((func) => {
    if (centerKeySet.has(func.cn_unique_key)) {
      const funcName = func.function_name || "Unknown"
      counts.set(funcName, (counts.get(funcName) || 0) + 1)
    }
  })

  return Array.from(counts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10) // Top 10 for better readability
}
