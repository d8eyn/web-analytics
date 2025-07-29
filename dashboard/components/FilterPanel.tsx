'use client'

import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { ChevronDownIcon, FunnelIcon, CloseIcon } from './Icons'
import { FilterField, FilterFieldMeta, FILTER_FIELD_META, FILTER_CATEGORIES, FilterValue } from '../lib/types/filters'
import useFilters from '../lib/hooks/use-filters'
import useFilterOptions from '../lib/hooks/use-filter-options-lazy'

interface FilterPanelProps {
  isOpen: boolean
  onClose: () => void
}

interface FilterSectionProps {
  field: FilterField
  meta: FilterFieldMeta
  values: string[]
  options: FilterValue[]
  onAdd: (value: string) => void
  onRemove: (value: string) => void
  onClear: () => void
  isLoading?: boolean
  onLoadOptions: () => void
}

function FilterSection({ field, meta, values, options, onAdd, onRemove, onClear, isLoading, onLoadOptions }: FilterSectionProps) {
  const [search, setSearch] = useState('')
  const [isExpanded, setIsExpanded] = useState(values.length > 0)

  // Load options when section is expanded
  useEffect(() => {
    if (isExpanded && options.length === 0 && !isLoading) {
      onLoadOptions()
    }
  }, [isExpanded, options.length, isLoading, onLoadOptions])

  const filteredOptions = useMemo(() => {
    if (!search) return options
    return options.filter(option => 
      option.label.toLowerCase().includes(search.toLowerCase()) ||
      option.value.toLowerCase().includes(search.toLowerCase())
    )
  }, [options, search])

  const handleAddValue = useCallback((value: string) => {
    if (value && !values.includes(value)) {
      onAdd(value)
    }
    setSearch('')
  }, [values, onAdd])

  const handleRemoveValue = useCallback((value: string) => {
    onRemove(value)
  }, [onRemove])

  const isNegated = (value: string) => value.startsWith('!')
  const getNormalValue = (value: string) => value.startsWith('!') ? value.slice(1) : value
  const toggleNegation = (value: string) => {
    const normalValue = getNormalValue(value)
    const newValue = isNegated(value) ? normalValue : `!${normalValue}`
    onRemove(value)
    onAdd(newValue)
  }

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        type="button"
        className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{meta.label}</span>
          {values.length > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              {values.length}
            </span>
          )}
        </div>
        <ChevronDownIcon 
          className={`h-4 w-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      <Transition
        show={isExpanded}
        enter="transition-all duration-200"
        enterFrom="max-h-0 opacity-0"
        enterTo="max-h-96 opacity-100"
        leave="transition-all duration-200"
        leaveFrom="max-h-96 opacity-100"
        leaveTo="max-h-0 opacity-0"
      >
        <div className="px-4 pb-4 space-y-3 max-h-96 overflow-y-auto">
          {meta.description && (
            <p className="text-sm text-gray-500">{meta.description}</p>
          )}

          {/* Search input */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400">🔍</div>
            <input
              type="text"
              placeholder={meta.placeholder || `Search ${meta.label.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && search) {
                  handleAddValue(search)
                }
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Selected values */}
          {values.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Selected ({values.length})
                </span>
                <button
                  type="button"
                  onClick={onClear}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {values.map((value) => (
                  <div
                    key={value}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                      isNegated(value) 
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}
                  >
                    <span className="truncate max-w-32">
                      {isNegated(value) && <span className="font-medium">!</span>}
                      {getNormalValue(value)}
                    </span>
                    {meta.allowNegation && (
                      <button
                        type="button"
                        onClick={() => toggleNegation(value)}
                        className="ml-1 hover:bg-gray-200 rounded px-1"
                        title={isNegated(value) ? "Remove negation" : "Add negation (exclude)"}
                      >
                        {isNegated(value) ? '!' : '¬'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveValue(value)}
                      className="ml-1 hover:bg-gray-200 rounded"
                    >
                      <CloseIcon className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available options */}
          <div className="space-y-2">
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading options...</p>
              </div>
            ) : filteredOptions.length > 0 ? (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {filteredOptions.slice(0, 50).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleAddValue(option.value)}
                    disabled={values.includes(option.value) || values.includes(`!${option.value}`)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="truncate">{option.label}</span>
                    {option.count !== undefined && (
                      <span className="text-xs text-gray-500 ml-2">({option.count})</span>
                    )}
                  </button>
                ))}
                {filteredOptions.length > 50 && (
                  <p className="text-xs text-gray-500 px-3 py-2">
                    Showing first 50 results. Refine your search for more specific options.
                  </p>
                )}
              </div>
            ) : options.length === 0 && !isLoading ? (
              <button
                type="button"
                onClick={onLoadOptions}
                className="w-full text-center py-4 text-sm text-blue-600 hover:text-blue-800"
              >
                Click to load {meta.label.toLowerCase()} options
              </button>
            ) : (
              <p className="text-sm text-gray-500 px-3 py-2">
                {search ? 'No matching options found.' : 'No options available.'}
              </p>
            )}
          </div>

          {/* Custom value input for pattern fields */}
          {meta.allowPattern && (
            <div className="border-t pt-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter custom pattern..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => handleAddValue(search)}
                  disabled={!search || values.includes(search)}
                  className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Use regex patterns for advanced matching (e.g., ^/products/.*)
              </p>
            </div>
          )}
        </div>
      </Transition>
    </div>
  )
}

export default function FilterPanel({ isOpen, onClose }: FilterPanelProps) {
  const {
    activeFilters,
    addFilter,
    removeFilter,
    clearFilter,
    clearAllFilters,
    hasActiveFilters,
    activeFilterCount,
    presets,
    saveAsPreset,
    applyPreset,
    deletePreset,
  } = useFilters()

  const { getFilterOptions, loadFilterOptions, isLoading: optionsLoading } = useFilterOptions()
  const [selectedCategory, setSelectedCategory] = useState(FILTER_CATEGORIES[0].id)
  const [presetName, setPresetName] = useState('')
  const [showPresetDialog, setShowPresetDialog] = useState(false)

  const currentCategory = FILTER_CATEGORIES.find(cat => cat.id === selectedCategory)

  const handleSavePreset = useCallback(() => {
    if (presetName.trim()) {
      saveAsPreset(presetName.trim())
      setPresetName('')
      setShowPresetDialog(false)
    }
  }, [presetName, saveAsPreset])

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-25 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto relative w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    {/* Header */}
                    <div className="bg-gray-50 px-4 py-6 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FunnelIcon className="h-5 w-5 text-gray-600" />
                          <Dialog.Title className="text-lg font-medium text-gray-900">
                            Filters
                          </Dialog.Title>
                          {hasActiveFilters && (
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                              {activeFilterCount}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          className="rounded-md text-gray-400 hover:text-gray-500"
                          onClick={onClose}
                        >
                          <CloseIcon className="h-6 w-6" />
                        </button>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-4 flex gap-2">
                        {hasActiveFilters && (
                          <>
                            <button
                              type="button"
                              onClick={clearAllFilters}
                              className="flex-1 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                              Clear All
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowPresetDialog(true)}
                              className="flex-1 px-3 py-2 text-sm text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                            >
                              Save Preset
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Category tabs */}
                    <div className="border-b bg-gray-50">
                      <nav className="flex overflow-x-auto scrollbar-hide">
                        {FILTER_CATEGORIES.map((category) => (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => setSelectedCategory(category.id)}
                            className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 ${
                              selectedCategory === category.id
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            {category.label}
                          </button>
                        ))}
                      </nav>
                    </div>

                    {/* Filter sections */}
                    <div className="flex-1 overflow-y-auto">
                      {currentCategory?.fields.map((field) => {
                        const meta = FILTER_FIELD_META[field]
                        const values = (activeFilters[field] as string[]) || []
                        const options = getFilterOptions(field)

                        return (
                          <FilterSection
                            key={field}
                            field={field}
                            meta={meta}
                            values={values}
                            options={options}
                            onAdd={(value) => addFilter(field, value)}
                            onRemove={(value) => removeFilter(field, value)}
                            onClear={() => clearFilter(field)}
                            isLoading={optionsLoading}
                            onLoadOptions={() => loadFilterOptions(field)}
                          />
                        )
                      })}
                    </div>

                    {/* Presets section */}
                    {presets.length > 0 && (
                      <div className="border-t bg-gray-50 px-4 py-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Saved Presets</h3>
                        <div className="space-y-2">
                          {presets.map((preset) => (
                            <div key={preset.id} className="flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() => applyPreset(preset)}
                                className="flex-1 text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                              >
                                <div className="font-medium">{preset.name}</div>
                                {preset.description && (
                                  <div className="text-xs text-gray-500">{preset.description}</div>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => deletePreset(preset.id)}
                                className="ml-2 p-1 text-gray-400 hover:text-red-600 rounded"
                              >
                                <CloseIcon className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>

        {/* Save preset dialog */}
        <Transition.Root show={showPresetDialog} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => setShowPresetDialog(false)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                    <div>
                      <div className="text-center">
                        <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                          Save Filter Preset
                        </Dialog.Title>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            Give your current filter combination a name to save it for later use.
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <input
                          type="text"
                          placeholder="Enter preset name..."
                          value={presetName}
                          onChange={(e) => setPresetName(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSavePreset()}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                      <button
                        type="button"
                        onClick={handleSavePreset}
                        disabled={!presetName.trim()}
                        className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed sm:col-start-2"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPresetDialog(false)}
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                      >
                        Cancel
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
      </Dialog>
    </Transition.Root>
  )
} 