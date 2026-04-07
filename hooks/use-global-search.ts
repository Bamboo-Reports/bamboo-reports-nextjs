"use client"

import { useMemo, useState, useCallback, useRef, useEffect } from "react"
import type { Account, Center, Prospect } from "@/lib/types"
import { buildSearchIndex, searchIndex, type GroupedResults } from "@/lib/search"

interface UseGlobalSearchProps {
  accounts: Account[]
  centers: Center[]
  prospects: Prospect[]
}

interface UseGlobalSearchReturn {
  query: string
  setQuery: (query: string) => void
  results: {
    accounts: GroupedResults
    centers: GroupedResults
    prospects: GroupedResults
    total: number
  }
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  handleOpen: () => void
  handleClose: () => void
}

const DEBOUNCE_MS = 300

export function useGlobalSearch({
  accounts,
  centers,
  prospects,
}: UseGlobalSearchProps): UseGlobalSearchReturn {
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const index = useMemo(
    () => buildSearchIndex(accounts, centers, prospects),
    [accounts, centers, prospects]
  )

  const handleSetQuery = useCallback((value: string) => {
    setQuery(value)
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(value)
    }, DEBOUNCE_MS)
  }, [])

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  const results = useMemo(
    () => searchIndex(index, debouncedQuery),
    [index, debouncedQuery]
  )

  const handleOpen = useCallback(() => {
    setIsOpen(true)
  }, [])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    setQuery("")
    setDebouncedQuery("")
  }, [])

  return {
    query,
    setQuery: handleSetQuery,
    results,
    isOpen,
    setIsOpen,
    handleOpen,
    handleClose,
  }
}
