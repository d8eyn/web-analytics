'use client'

import React, { useState } from 'react'
import { FunnelIcon } from './Icons'
import FilterPanel from './FilterPanel'
import useFilters from '../lib/hooks/use-filters'

interface FilterButtonProps {
  className?: string
}

export default function FilterButton({ className = '' }: FilterButtonProps) {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)
  const { hasActiveFilters, activeFilterCount } = useFilters()

  return (
    <>
      <button
        type="button"
        onClick={() => setIsFilterPanelOpen(true)}
        className={`relative inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${className}`}
      >
        <FunnelIcon className="h-4 w-4" />
        Filters
        {hasActiveFilters && (
          <span className="absolute -top-2 -right-2 h-5 w-5 text-xs font-bold text-white bg-blue-600 rounded-full flex items-center justify-center">
            {activeFilterCount > 99 ? '99+' : activeFilterCount}
          </span>
        )}
      </button>

      <FilterPanel
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
      />
    </>
  )
} 