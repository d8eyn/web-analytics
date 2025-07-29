/* eslint-disable @next/next/no-img-element */
import React from 'react'
import DateFilter from './DateFilter'
import FilterButton from './FilterButton'
import FilterChips from './FilterChips'
import CurrentVisitors from './CurrentVisitors'

export default function Header() {
  return (
    <div className="border-b border-neutral-12 pb-6 mb-10">
      <div className="flex flex-col gap-4">
        {/* Top row with date filter and filter button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <DateFilter />
            <FilterButton />
          </div>
          <CurrentVisitors />
        </div>
        
        {/* Filter chips row */}
        <FilterChips className="min-h-[32px]" />
      </div>
    </div>
  )
}
