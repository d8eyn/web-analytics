import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnalyticsFilter, FilterOptions, FilterPreset, FilterState, FilterField } from '../types/filters'

const FILTER_STORAGE_KEY = 'analytics_filter_presets'

export function useFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({})
  const [presets, setPresets] = useState<FilterPreset[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>()
  const searchParams = useSearchParams()

  // Parse filters from URL parameters
  const activeFilters = useMemo<AnalyticsFilter>(() => {
    const filters: AnalyticsFilter = {}

    // Helper to parse array parameters
    const parseArrayParam = (param: string | null): string[] | undefined => {
      if (!param) return undefined
      return param.split(',').filter(Boolean)
    }

    // Parse all filter fields from URL
    filters.hostname = parseArrayParam(searchParams.get('hostname'))
    filters.path = parseArrayParam(searchParams.get('path'))
    filters.anyPath = parseArrayParam(searchParams.get('anyPath'))
    filters.entryPath = parseArrayParam(searchParams.get('entryPath'))
    filters.exitPath = parseArrayParam(searchParams.get('exitPath'))
    filters.pathPattern = parseArrayParam(searchParams.get('pathPattern'))
    
    filters.language = parseArrayParam(searchParams.get('language'))
    filters.country = parseArrayParam(searchParams.get('country'))
    filters.region = parseArrayParam(searchParams.get('region'))
    filters.city = parseArrayParam(searchParams.get('city'))
    
    filters.os = parseArrayParam(searchParams.get('os'))
    filters.osVersion = parseArrayParam(searchParams.get('osVersion'))
    filters.browser = parseArrayParam(searchParams.get('browser'))
    filters.browserVersion = parseArrayParam(searchParams.get('browserVersion'))
    filters.platform = parseArrayParam(searchParams.get('platform'))
    filters.screenClass = parseArrayParam(searchParams.get('screenClass'))
    
    filters.referrer = parseArrayParam(searchParams.get('referrer'))
    filters.referrerName = parseArrayParam(searchParams.get('referrerName'))
    filters.channel = parseArrayParam(searchParams.get('channel'))
    
    filters.utmSource = parseArrayParam(searchParams.get('utmSource'))
    filters.utmMedium = parseArrayParam(searchParams.get('utmMedium'))
    filters.utmCampaign = parseArrayParam(searchParams.get('utmCampaign'))
    filters.utmContent = parseArrayParam(searchParams.get('utmContent'))
    filters.utmTerm = parseArrayParam(searchParams.get('utmTerm'))
    
    filters.eventName = parseArrayParam(searchParams.get('eventName'))
    filters.eventMetaKey = parseArrayParam(searchParams.get('eventMetaKey'))
    filters.tag = parseArrayParam(searchParams.get('tag'))
    
    const visitorId = searchParams.get('visitorId')
    if (visitorId) {
      filters.visitorId = visitorId
    }
    const sessionId = searchParams.get('sessionId')
    if (sessionId) {
      filters.sessionId = sessionId
    }

    // Parse pagination
    const offset = searchParams.get('offset')
    if (offset) {
      filters.offset = parseInt(offset, 10)
    }
    const limit = searchParams.get('limit')
    if (limit) {
      filters.limit = parseInt(limit, 10)
    }

    return filters
  }, [searchParams])

  // Update URL with new filters
  const updateFilters = useCallback((newFilters: Partial<AnalyticsFilter>) => {
    const mergedFilters = { ...activeFilters, ...newFilters }
    
    // Build new URL search parameters
    const newSearchParams = new URLSearchParams()
    
    // Copy existing non-filter params (like date_from, date_to, site_id)
    searchParams.forEach((value, key) => {
      // Skip filter parameters - we'll add them back if they have values
      if (!isFilterParam(key)) {
        newSearchParams.set(key, value)
      }
    })
    
    // Helper to set array parameters
    const setArrayParam = (key: string, values: string[] | undefined) => {
      if (values && values.length > 0) {
        newSearchParams.set(key, values.join(','))
      }
      // Note: URLSearchParams automatically doesn't include undefined/empty params
    }

    // Set all filter parameters
    setArrayParam('hostname', mergedFilters.hostname)
    setArrayParam('path', mergedFilters.path)
    setArrayParam('anyPath', mergedFilters.anyPath)
    setArrayParam('entryPath', mergedFilters.entryPath)
    setArrayParam('exitPath', mergedFilters.exitPath)
    setArrayParam('pathPattern', mergedFilters.pathPattern)
    
    setArrayParam('language', mergedFilters.language)
    setArrayParam('country', mergedFilters.country)
    setArrayParam('region', mergedFilters.region)
    setArrayParam('city', mergedFilters.city)
    
    setArrayParam('os', mergedFilters.os)
    setArrayParam('osVersion', mergedFilters.osVersion)
    setArrayParam('browser', mergedFilters.browser)
    setArrayParam('browserVersion', mergedFilters.browserVersion)
    setArrayParam('platform', mergedFilters.platform)
    setArrayParam('screenClass', mergedFilters.screenClass)
    
    setArrayParam('referrer', mergedFilters.referrer)
    setArrayParam('referrerName', mergedFilters.referrerName)
    setArrayParam('channel', mergedFilters.channel)
    
    setArrayParam('utmSource', mergedFilters.utmSource)
    setArrayParam('utmMedium', mergedFilters.utmMedium)
    setArrayParam('utmCampaign', mergedFilters.utmCampaign)
    setArrayParam('utmContent', mergedFilters.utmContent)
    setArrayParam('utmTerm', mergedFilters.utmTerm)
    
    setArrayParam('eventName', mergedFilters.eventName)
    setArrayParam('eventMetaKey', mergedFilters.eventMetaKey)
    setArrayParam('tag', mergedFilters.tag)
    
    // Set individual parameters
    if (mergedFilters.visitorId) {
      newSearchParams.set('visitorId', mergedFilters.visitorId)
    }
    
    if (mergedFilters.sessionId) {
      newSearchParams.set('sessionId', mergedFilters.sessionId)
    }

    if (mergedFilters.offset !== undefined && mergedFilters.offset > 0) {
      newSearchParams.set('offset', mergedFilters.offset.toString())
    }

    if (mergedFilters.limit !== undefined && mergedFilters.limit > 0) {
      newSearchParams.set('limit', mergedFilters.limit.toString())
    }

    // Navigate to the new URL
    const newUrl = `${pathname}?${newSearchParams.toString()}`
    router.push(newUrl, { scroll: false })
  }, [activeFilters, searchParams, pathname, router])

  // Helper function to check if a parameter is a filter parameter
  const isFilterParam = (key: string): boolean => {
    const filterParams = [
      // Path filters
      'hostname', 'path', 'anyPath', 'entryPath', 'exitPath', 'pathPattern',
      // Geographic filters
      'language', 'country', 'region', 'city',
      // Technology filters
      'os', 'osVersion', 'browser', 'browserVersion', 'platform', 'screenClass',
      // Traffic source filters
      'referrer', 'referrerName', 'channel',
      // UTM parameters
      'utmSource', 'utmMedium', 'utmCampaign', 'utmContent', 'utmTerm',
      // Event filters
      'eventName', 'eventMetaKey', 'eventMeta', 'tags', 'tag',
      // Individual tracking
      'visitorId', 'sessionId',
      // Search and sorting (future use)
      'search', 'sort',
      // Pagination
      'offset', 'limit',
      // Options
      'includeTitle', 'includeTimeOnPage', 'includeCR'
    ]
    return filterParams.includes(key)
  }

  // Add a specific filter value
  const addFilter = useCallback((field: FilterField, value: string) => {
    const currentValues = activeFilters[field] as string[] || []
    if (!currentValues.includes(value)) {
      updateFilters({
        [field]: [...currentValues, value]
      })
    }
  }, [activeFilters, updateFilters])

  // Remove a specific filter value
  const removeFilter = useCallback((field: FilterField, value: string) => {
    const currentValues = activeFilters[field] as string[] || []
    const newValues = currentValues.filter(v => v !== value)
    updateFilters({
      [field]: newValues.length > 0 ? newValues : undefined
    })
  }, [activeFilters, updateFilters])

  // Clear all filters for a specific field
  const clearFilter = useCallback((field: FilterField) => {
    updateFilters({
      [field]: undefined
    })
  }, [updateFilters])

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    const emptyFilters: Record<string, undefined> = {}
    Object.values(FilterField).forEach(field => {
      emptyFilters[field] = undefined
    })
    updateFilters(emptyFilters)
  }, [updateFilters])

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.values(FilterField).some(field => {
      const value = activeFilters[field]
      return Array.isArray(value) ? value.length > 0 : Boolean(value)
    })
  }, [activeFilters])

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    return Object.values(FilterField).reduce((count, field) => {
      const value = activeFilters[field]
      if (Array.isArray(value)) {
        return count + value.length
      }
      return value ? count + 1 : count
    }, 0)
  }, [activeFilters])

  // Load presets from localStorage
  const loadPresets = useCallback(() => {
    try {
      const stored = localStorage.getItem(FILTER_STORAGE_KEY)
      if (stored) {
        const parsedPresets = JSON.parse(stored)
        setPresets(parsedPresets)
      }
    } catch (error) {
      console.error('Failed to load filter presets:', error)
    }
  }, [])

  // Save presets to localStorage
  const savePresets = useCallback((newPresets: FilterPreset[]) => {
    try {
      localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(newPresets))
      setPresets(newPresets)
    } catch (error) {
      console.error('Failed to save filter presets:', error)
    }
  }, [])

  // Save current filters as a preset
  const saveAsPreset = useCallback((name: string, description?: string) => {
    const newPreset: FilterPreset = {
      id: `preset_${Date.now()}`,
      name,
      description,
      filters: activeFilters,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updatedPresets = [...presets, newPreset]
    savePresets(updatedPresets)
    return newPreset
  }, [activeFilters, presets, savePresets])

  // Apply a preset
  const applyPreset = useCallback((preset: FilterPreset) => {
    updateFilters(preset.filters)
  }, [updateFilters])

  // Delete a preset
  const deletePreset = useCallback((presetId: string) => {
    const updatedPresets = presets.filter(p => p.id !== presetId)
    savePresets(updatedPresets)
  }, [presets, savePresets])

  // Load presets on mount
  useEffect(() => {
    loadPresets()
  }, [loadPresets])

  const state: FilterState = {
    activeFilters,
    availableOptions: filterOptions,
    presets,
    isLoading,
    error,
  }

  return {
    ...state,
    // Filter management
    updateFilters,
    addFilter,
    removeFilter,
    clearFilter,
    clearAllFilters,
    
    // Filter status
    hasActiveFilters,
    activeFilterCount,
    
    // Presets
    saveAsPreset,
    applyPreset,
    deletePreset,
    loadPresets,
    
    // Options management
    setFilterOptions,
    setIsLoading,
    setError,
  }
}

export default useFilters 