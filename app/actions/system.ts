"use server"

import { getSqlOrThrow, fetchWithRetry, getSql } from "@/lib/db/connection"
import { getCacheStats } from "@/lib/db/cache"

// ============================================
// DATABASE HEALTH & DIAGNOSTICS
// ============================================

export async function testConnection(): Promise<{ success: boolean; message: string }> {
  try {
    if (!process.env.DATABASE_URL) {
      return {
        success: false,
        message: "DATABASE_URL environment variable is not configured",
      }
    }

    if (!getSql()) {
      return {
        success: false,
        message: "Database connection could not be initialized",
      }
    }

    console.log("Testing database connection...")
    // Use getSqlOrThrow because we checked getSql() above, but we need the ensure non-null type
    const result = await fetchWithRetry(() => getSqlOrThrow()`SELECT 1 as test`)
    console.log("Database connection successful:", result)
    return { success: true, message: "Database connection successful" }
  } catch (error) {
    console.error("Database connection test failed:", error)
    return {
      success: false,
      message: `Connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

export async function getDatabaseStatus(): Promise<{
  hasUrl: boolean
  hasConnection: boolean
  urlLength: number
  environment: string
  cacheSize: number
  cacheKeys: string[]
  error?: string
}> {
  try {
    const hasUrl = !!process.env.DATABASE_URL
    const hasConnection = !!getSql()
    const cacheStats = getCacheStats();

    return {
      hasUrl,
      hasConnection,
      urlLength: process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0,
      environment: process.env.NODE_ENV || "unknown",
      cacheSize: cacheStats.size,
      cacheKeys: cacheStats.keys,
    }
  } catch (error) {
    return {
      hasUrl: false,
      hasConnection: false,
      urlLength: 0,
      environment: "unknown",
      cacheSize: 0,
      cacheKeys: [],
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
