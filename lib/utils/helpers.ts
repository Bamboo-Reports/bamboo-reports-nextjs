import type { Account, Center, Function, ChartData } from "../types"

/**
 * Parse revenue value from string or number
 */
export const parseRevenue = (value: string | number): number => {
  const numValue = typeof value === "string" ? Number.parseFloat(value) : value
  return isNaN(numValue) ? 0 : numValue
}

/**
 * Format revenue in millions
 */
export const formatRevenueInMillions = (value: number): string => {
  return `${value.toLocaleString()}M`
}

/**
 * Get paginated data
 */
export const getPaginatedData = (data: any[], page: number, itemsPerPage: number) => {
  const startIndex = (page - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  return data.slice(startIndex, endIndex)
}

/**
 * Get total pages for pagination
 */
export const getTotalPages = (totalItems: number, itemsPerPage: number) => {
  return Math.ceil(totalItems / itemsPerPage)
}

/**
 * Get page info for pagination display
 */
export const getPageInfo = (currentPage: number, totalItems: number, itemsPerPage: number) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)
  return { startItem, endItem, totalItems }
}

/**
 * Copy text to clipboard
 */
export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
}
