import type { FilterValue } from "@/lib/types"

/**
 * Enhanced filter matching with include/exclude support
 * - If only include values: item must match at least one include value (OR logic)
 * - If only exclude values: item must not match any exclude value
 * - If both include and exclude: item must match at least one include AND not match any exclude
 * - If empty filter: match all
 */
export function enhancedFilterMatch(filterArray: FilterValue[], value: string): boolean {
  if (filterArray.length === 0) return true

  const includeValues = filterArray.filter(f => f.mode === 'include').map(f => f.value)
  const excludeValues = filterArray.filter(f => f.mode === 'exclude').map(f => f.value)

  // Check exclude first (faster rejection)
  if (excludeValues.length > 0 && excludeValues.includes(value)) {
    return false
  }

  // If there are include values, must match at least one
  if (includeValues.length > 0) {
    return includeValues.includes(value)
  }

  // Only exclude values and didn't match any exclude = pass
  return true
}

/**
 * Keyword matching with include/exclude support for search fields
 * - Include keywords: value must contain at least one include keyword (OR logic)
 * - Exclude keywords: value must not contain any exclude keyword
 * - Both: must match include AND not match exclude
 */
export function enhancedKeywordMatch(filterArray: FilterValue[], value: string): boolean {
  if (filterArray.length === 0) return true

  const lowerValue = value.toLowerCase()
  const includeKeywords = filterArray.filter(f => f.mode === 'include').map(f => f.value.toLowerCase())
  const excludeKeywords = filterArray.filter(f => f.mode === 'exclude').map(f => f.value.toLowerCase())

  // Check exclude first (faster rejection)
  if (excludeKeywords.length > 0 && excludeKeywords.some(keyword => lowerValue.includes(keyword))) {
    return false
  }

  // If there are include keywords, must contain at least one
  if (includeKeywords.length > 0) {
    return includeKeywords.some(keyword => lowerValue.includes(keyword))
  }

  // Only exclude keywords and didn't match any exclude = pass
  return true
}

/**
 * Extract values from FilterValue array for backward compatibility
 */
export function extractFilterValues(filterArray: FilterValue[]): string[] {
  return filterArray.map(f => f.value)
}

/**
 * Convert string array to FilterValue array (for migration)
 */
export function toFilterValues(values: string[], mode: 'include' | 'exclude' = 'include'): FilterValue[] {
  return values.map(value => ({ value, mode }))
}

/**
 * Check if any filters are active
 */
export function hasActiveFilters(filterArray: FilterValue[]): boolean {
  return filterArray.length > 0
}

/**
 * Count filters by mode
 */
export function countFiltersByMode(filterArray: FilterValue[]): { include: number; exclude: number } {
  return {
    include: filterArray.filter(f => f.mode === 'include').length,
    exclude: filterArray.filter(f => f.mode === 'exclude').length,
  }
}
