"use client"

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Plus, Minus, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import type { FilterValue } from "@/lib/types"

interface AccountAutocompleteProps {
  accountNames: string[]
  selectedAccounts: FilterValue[]
  onChange: (accounts: FilterValue[]) => void
  placeholder?: string
}

export function AccountAutocomplete({
  accountNames,
  selectedAccounts,
  onChange,
  placeholder = "Type to search account names...",
}: AccountAutocompleteProps) {
  const [inputValue, setInputValue] = useState("")
  const [debouncedValue, setDebouncedValue] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Debounce input value for performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(inputValue)
    }, 300)

    return () => clearTimeout(timer)
  }, [inputValue])

  // Get unique, sorted account names (memoized for performance)
  const uniqueAccountNames = useMemo(() => {
    const unique = Array.from(new Set(accountNames.filter(Boolean)))
    return unique.sort((a, b) => a.localeCompare(b))
  }, [accountNames])

  // Filter suggestions based on input with smart matching
  const suggestions = useMemo(() => {
    if (!debouncedValue.trim()) return []

    const searchTerm = debouncedValue.toLowerCase().trim()
    const alreadySelected = new Set(selectedAccounts.map(s => s.value.toLowerCase()))

    // First, get accounts that start with the search term (highest priority)
    const startsWithMatches = uniqueAccountNames.filter(
      name =>
        name.toLowerCase().startsWith(searchTerm) &&
        !alreadySelected.has(name.toLowerCase())
    )

    // Then, get accounts that contain the search term (lower priority)
    const containsMatches = uniqueAccountNames.filter(
      name => {
        const lowerName = name.toLowerCase()
        return (
          lowerName.includes(searchTerm) &&
          !lowerName.startsWith(searchTerm) &&
          !alreadySelected.has(lowerName)
        )
      }
    )

    // Combine and limit to 50 results for performance
    return [...startsWithMatches, ...containsMatches].slice(0, 50)
  }, [debouncedValue, uniqueAccountNames, selectedAccounts])

  // Handle account selection
  const handleSelectAccount = useCallback((accountName: string, mode: 'include' | 'exclude' = 'include') => {
    const newAccount: FilterValue = { value: accountName, mode }
    onChange([...selectedAccounts, newAccount])
    setInputValue("")
    setDebouncedValue("")
    setIsOpen(false)
    setHighlightedIndex(0)
    inputRef.current?.focus()
  }, [selectedAccounts, onChange])

  // Handle account removal
  const handleRemoveAccount = useCallback((index: number) => {
    const newAccounts = selectedAccounts.filter((_, i) => i !== index)
    onChange(newAccounts)
  }, [selectedAccounts, onChange])

  // Toggle include/exclude mode
  const handleToggleMode = useCallback((index: number) => {
    const newAccounts = selectedAccounts.map((account, i) =>
      i === index
        ? { ...account, mode: account.mode === 'include' ? 'exclude' : 'include' } as FilterValue
        : account
    )
    onChange(newAccounts)
  }, [selectedAccounts, onChange])

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'ArrowDown' && inputValue.trim()) {
        setIsOpen(true)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev)
        break
      case 'Enter':
        e.preventDefault()
        if (suggestions[highlightedIndex]) {
          handleSelectAccount(suggestions[highlightedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setHighlightedIndex(0)
        break
    }
  }, [isOpen, suggestions, highlightedIndex, handleSelectAccount, inputValue])

  // Reset highlighted index when suggestions change
  useEffect(() => {
    setHighlightedIndex(0)
  }, [suggestions])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Highlight matching text in suggestion
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text

    const index = text.toLowerCase().indexOf(query.toLowerCase())
    if (index === -1) return text

    return (
      <>
        {text.slice(0, index)}
        <span className="font-semibold text-foreground bg-yellow-200 dark:bg-yellow-900/50">
          {text.slice(index, index + query.length)}
        </span>
        {text.slice(index + query.length)}
      </>
    )
  }

  return (
    <div className="space-y-2">
      {/* Selected Accounts as Badges */}
      {selectedAccounts.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedAccounts.map((account, index) => {
            const isInclude = account.mode === 'include'
            return (
              <Badge
                key={`${account.value}-${index}`}
                variant="secondary"
                className={cn(
                  "group flex items-center gap-1 pr-1",
                  isInclude
                    ? "bg-green-500/20 text-green-700 dark:bg-green-500/30 dark:text-green-300 border-green-500/50 hover:bg-green-500/30"
                    : "bg-red-500/20 text-red-700 dark:bg-red-500/30 dark:text-red-300 border-red-500/50 hover:bg-red-500/30"
                )}
              >
                <button
                  onClick={() => handleToggleMode(index)}
                  className={cn(
                    "flex items-center justify-center w-4 h-4 rounded-sm",
                    isInclude
                      ? "bg-green-600/30 hover:bg-green-600/50"
                      : "bg-red-600/30 hover:bg-red-600/50"
                  )}
                  title={isInclude ? 'Click to exclude' : 'Click to include'}
                >
                  {isInclude ? (
                    <Plus className="h-3 w-3" />
                  ) : (
                    <Minus className="h-3 w-3" />
                  )}
                </button>
                <span className="text-xs">{account.value}</span>
                <button
                  onClick={() => handleRemoveAccount(index)}
                  className="ml-1 rounded-sm opacity-70 hover:opacity-100 hover:bg-accent p-0.5"
                  title="Remove"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )
          })}
        </div>
      )}

      {/* Autocomplete Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value)
              setIsOpen(true)
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (inputValue.trim()) setIsOpen(true)
            }}
            placeholder={placeholder}
            className="pl-8"
          />
        </div>

        {/* Suggestions Dropdown */}
        {isOpen && suggestions.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg"
          >
            <ScrollArea className="h-auto max-h-[300px]">
              <div className="p-1">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={suggestion}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 cursor-pointer rounded-sm text-sm transition-colors",
                      highlightedIndex === index
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent/50"
                    )}
                    onClick={() => handleSelectAccount(suggestion)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <span className="flex-1">
                      {highlightMatch(suggestion, debouncedValue)}
                    </span>
                    <div className="flex gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-green-100 dark:hover:bg-green-900/20"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelectAccount(suggestion, 'include')
                        }}
                        title="Include"
                      >
                        <Plus className="h-3 w-3 text-green-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900/20"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelectAccount(suggestion, 'exclude')
                        }}
                        title="Exclude"
                      >
                        <Minus className="h-3 w-3 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Results count indicator */}
            {suggestions.length === 50 && (
              <div className="px-3 py-2 text-xs text-muted-foreground border-t bg-muted/50">
                Showing first 50 results. Type more to narrow down.
              </div>
            )}
          </div>
        )}

        {/* No results message */}
        {isOpen && debouncedValue.trim() && suggestions.length === 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg p-3 text-sm text-muted-foreground"
          >
            No accounts found matching &quot;{debouncedValue}&quot;
          </div>
        )}
      </div>

      {/* Help text */}
      <p className="text-xs text-muted-foreground">
        Type to search from {uniqueAccountNames.length.toLocaleString()} accounts. Click + to include or - to exclude.
      </p>
    </div>
  )
}
