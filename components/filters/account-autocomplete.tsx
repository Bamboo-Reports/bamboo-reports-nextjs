"use client"

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Plus, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { FilterValue } from "@/lib/types"

interface AccountAutocompleteProps {
  accountNames: string[]
  selectedAccounts: FilterValue[]
  onChange: (accounts: FilterValue[]) => void
  placeholder?: string
}

type Mode = FilterValue["mode"]

type SuggestionMatch = {
  startsWith: string[]
  contains: string[]
}

const MODE_INCLUDE: Mode = "include"
const MODE_EXCLUDE: Mode = "exclude"

const buildSuggestions = (
  searchTerm: string,
  names: string[],
  alreadySelected: Set<string>
): string[] => {
  if (!searchTerm) return []

  const matches: SuggestionMatch = {
    startsWith: [],
    contains: [],
  }

  for (const name of names) {
    const lower = name.toLowerCase()
    if (alreadySelected.has(lower)) continue

    if (lower.startsWith(searchTerm)) {
      matches.startsWith.push(name)
      continue
    }

    if (lower.includes(searchTerm)) {
      matches.contains.push(name)
    }
  }

  return [...matches.startsWith, ...matches.contains].slice(0, 50)
}

const highlightMatch = (text: string, query: string): React.ReactNode => {
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

export function AccountAutocomplete({
  accountNames,
  selectedAccounts,
  onChange,
  placeholder = "Type to search account names...",
}: AccountAutocompleteProps): JSX.Element {
  const [inputValue, setInputValue] = useState("")
  const [debouncedValue, setDebouncedValue] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(inputValue)
    }, 300)

    return () => clearTimeout(timer)
  }, [inputValue])

  const uniqueAccountNames = useMemo(() => {
    const unique = Array.from(new Set(accountNames.filter(Boolean)))
    return unique.sort((a, b) => a.localeCompare(b))
  }, [accountNames])

  const selectedSet = useMemo(
    () => new Set(selectedAccounts.map((item) => item.value.toLowerCase())),
    [selectedAccounts]
  )

  const suggestions = useMemo(() => {
    const searchTerm = debouncedValue.trim().toLowerCase()
    return buildSuggestions(searchTerm, uniqueAccountNames, selectedSet)
  }, [debouncedValue, uniqueAccountNames, selectedSet])

  const handleSelectAccount = useCallback(
    (accountName: string, mode: Mode = MODE_INCLUDE) => {
      const newAccount: FilterValue = { value: accountName, mode }
      onChange([...selectedAccounts, newAccount])
      setInputValue("")
      setDebouncedValue("")
      setIsOpen(false)
      setHighlightedIndex(0)
      inputRef.current?.focus()
    },
    [selectedAccounts, onChange]
  )

  const handleRemoveAccount = useCallback(
    (index: number) => {
      const newAccounts = selectedAccounts.filter((_, i) => i !== index)
      onChange(newAccounts)
    },
    [selectedAccounts, onChange]
  )

  const handleToggleMode = useCallback(
    (index: number) => {
      const newAccounts = selectedAccounts.map((account, i) =>
        i === index
          ? { ...account, mode: account.mode === MODE_INCLUDE ? MODE_EXCLUDE : MODE_INCLUDE }
          : account
      )
      onChange(newAccounts)
    },
    [selectedAccounts, onChange]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen || suggestions.length === 0) {
        if (e.key === "ArrowDown" && inputValue.trim()) {
          setIsOpen(true)
        }
        return
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setHighlightedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : prev
          )
          break
        case "ArrowUp":
          e.preventDefault()
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev))
          break
        case "Enter":
          e.preventDefault()
          if (suggestions[highlightedIndex]) {
            handleSelectAccount(suggestions[highlightedIndex])
          }
          break
        case "Escape":
          e.preventDefault()
          setIsOpen(false)
          setHighlightedIndex(0)
          break
      }
    },
    [isOpen, suggestions, highlightedIndex, handleSelectAccount, inputValue]
  )

  useEffect(() => {
    setHighlightedIndex(0)
  }, [suggestions])

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

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="space-y-2">
      {selectedAccounts.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedAccounts.map((account, index) => {
            const isInclude = account.mode === MODE_INCLUDE
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
                  title={isInclude ? "Click to exclude" : "Click to include"}
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

      <div className="relative">
        <div className="relative">
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
          />
        </div>

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
                          handleSelectAccount(suggestion, MODE_INCLUDE)
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
                          handleSelectAccount(suggestion, MODE_EXCLUDE)
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

            {suggestions.length === 50 && (
              <div className="px-3 py-2 text-xs text-muted-foreground border-t bg-muted/50">
                Showing first 50 results. Type more to narrow down.
              </div>
            )}
          </div>
        )}

        {isOpen && debouncedValue.trim() && suggestions.length === 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg p-3 text-sm text-muted-foreground"
          >
            No accounts found matching &quot;{debouncedValue}&quot;
          </div>
        )}
      </div>
    </div>
  )
}
