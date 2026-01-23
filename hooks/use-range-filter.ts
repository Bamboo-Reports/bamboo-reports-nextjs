import { useCallback, useState } from "react"

interface RangeFilterState {
  min: number
  max: number
}

interface UseRangeFilterResult {
  range: [number, number]
  setRange: React.Dispatch<React.SetStateAction<[number, number]>>
  handleMinChange: (value: string) => void
  handleMaxChange: (value: string) => void
  handleRangeChange: (value: [number, number]) => void
}

export function useRangeFilter(
  initialRange: [number, number],
  bounds: RangeFilterState,
  onRangeChange?: (range: [number, number]) => void
): UseRangeFilterResult {
  const [range, setRange] = useState<[number, number]>(initialRange)

  const handleMinChange = useCallback(
    (value: string) => {
      const numValue = Number.parseFloat(value) || bounds.min
      const clampedValue = Math.max(bounds.min, Math.min(numValue, range[1]))
      setRange((prev) => [clampedValue, prev[1]])
      onRangeChange?.([clampedValue, range[1]])
    },
    [bounds.min, range, onRangeChange]
  )

  const handleMaxChange = useCallback(
    (value: string) => {
      const numValue = Number.parseFloat(value) || bounds.max
      const clampedValue = Math.min(bounds.max, Math.max(numValue, range[0]))
      setRange((prev) => [prev[0], clampedValue])
      onRangeChange?.([range[0], clampedValue])
    },
    [bounds.max, range, onRangeChange]
  )

  const handleRangeChange = useCallback(
    (value: [number, number]) => {
      const clampedMin = Math.max(bounds.min, Math.min(value[0], bounds.max))
      const clampedMax = Math.min(bounds.max, Math.max(value[1], bounds.min))
      const newRange: [number, number] = [clampedMin, clampedMax]
      setRange(newRange)
      onRangeChange?.(newRange)
    },
    [bounds, onRangeChange]
  )

  return { range, setRange, handleMinChange, handleMaxChange, handleRangeChange }
}
