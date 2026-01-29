
// ============================================
// CONFIGURATION & SETUP
// ============================================

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

interface CachedData<T> {
  data: T
  timestamp: number
}

const dataCache = new Map<string, CachedData<unknown>>()

/**
 * Get data from cache or fetch if expired
 */
export function getCachedData<T>(key: string): T | null {
  const cached = dataCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`Cache hit for: ${key}`)
    return cached.data as T
  }
  return null
}

/**
 * Set data in cache
 */
export function setCachedData<T>(key: string, data: T): void {
  dataCache.set(key, { data, timestamp: Date.now() })
  console.log(`Cache set for: ${key}`)
}

/**
 * Clear all cached data
 */
export function clearCache(): { success: boolean; message: string } {
  dataCache.clear()
  console.log("Cache cleared")
  return { success: true, message: "Cache cleared successfully" }
}

/**
 * Invalidate a specific cache key
 */
export function invalidateCache(key: string): void {
    dataCache.delete(key);
}

/**
 * Get cache stats for diagnostics
 */
export function getCacheStats() {
    return {
        size: dataCache.size,
        keys: Array.from(dataCache.keys())
    }
}
