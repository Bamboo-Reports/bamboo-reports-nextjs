import type { Account, Center, Function, ChartData } from "../types"

export const CHART_COLORS = [
  "#017ABF",
  "#0E81C2",
  "#1A87C5",
  "#278EC9",
  "#3495CC",
  "#419BCF",
  "#4DA2D2",
  "#5AA9D5",
  "#67AFD9",
  "#73B6DC",
  "#80BDDF",
  "#8DC3E2",
  "#99CAE5",
  "#A6D0E9",
  "#B3D7EC",
  "#C0DEEF",
  "#CCE4F2",
  "#D9EBF5",
  "#E6F2F9",
  "#F2F8FC",
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
