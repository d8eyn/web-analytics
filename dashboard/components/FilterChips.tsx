import React from 'react'
import { CloseIcon } from './Icons'
import useFilters from '../lib/hooks/use-filters'
import { FilterField, FILTER_FIELD_META } from '../lib/types/filters'

interface FilterChipsProps {
  className?: string
  maxVisible?: number
}

export default function FilterChips({ className = '', maxVisible = 10 }: FilterChipsProps) {
  const {
    activeFilters,
    hasActiveFilters,
    removeFilter,
    clearAllFilters,
    activeFilterCount,
  } = useFilters()

  if (!hasActiveFilters) {
    return null
  }

  // Collect all active filter chips
  const chips: Array<{
    field: FilterField
    value: string
    label: string
    isNegated: boolean
  }> = []

  Object.entries(activeFilters).forEach(([fieldKey, values]) => {
    if (Array.isArray(values) && values.length > 0) {
      const field = fieldKey as FilterField
      const meta = FILTER_FIELD_META[field]
      
      if (meta) {
        values.forEach(value => {
          const isNegated = value.startsWith('!')
          const normalValue = isNegated ? value.slice(1) : value
          
          chips.push({
            field,
            value,
            label: `${meta.label}: ${normalValue}`,
            isNegated,
          })
        })
      }
    } else if (typeof values === 'string') {
      const field = fieldKey as FilterField
      const meta = FILTER_FIELD_META[field]
      
      if (meta) {
        chips.push({
          field,
          value: values,
          label: `${meta.label}: ${values}`,
          isNegated: false,
        })
      }
    }
  })

  const visibleChips = chips.slice(0, maxVisible)
  const hiddenCount = chips.length - maxVisible

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {visibleChips.map((chip, index) => (
        <div
          key={`${chip.field}-${chip.value}-${index}`}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
            chip.isNegated
              ? 'bg-red-100 text-red-800 border border-red-200'
              : 'bg-blue-100 text-blue-800 border border-blue-200'
          }`}
        >
          <span className="truncate max-w-32">
            {chip.isNegated && <span className="font-bold">!</span>}
            {chip.label}
          </span>
          <button
            type="button"
            onClick={() => removeFilter(chip.field, chip.value)}
            className="ml-1 hover:bg-gray-200 rounded p-0.5"
            aria-label={`Remove ${chip.label} filter`}
          >
            <CloseIcon className="h-3 w-3" />
          </button>
        </div>
      ))}

      {hiddenCount > 0 && (
        <div className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
          +{hiddenCount} more
        </div>
      )}

      {chips.length > 0 && (
        <button
          type="button"
          onClick={clearAllFilters}
          className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
        >
          Clear all
        </button>
      )}
    </div>
  )
} 