import { useCallback, useState, useMemo } from 'react'
import { FilterField, FilterValue, FilterOptions } from '../types/filters'
import { queryPipe } from '../api'
import useDateFilter from './use-date-filter'

// Cache for filter options to reduce API calls
const optionsCache = new Map<string, { data: FilterValue[], timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

interface FilterOptionsResponse {
  data: Array<{
    value: string
    count?: number
  }>
}

export function useFilterOptions() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>()
  const { startDate, endDate } = useDateFilter()

  // Mapping of filter fields to their corresponding Tinybird pipe endpoints
  const fieldToPipeMap: Record<FilterField, string> = {
    [FilterField.HOSTNAME]: 'filter_options_hostnames',
    [FilterField.PATH]: 'filter_options_pages',
    [FilterField.ENTRY_PATH]: 'filter_options_entry_pages',
    [FilterField.EXIT_PATH]: 'filter_options_exit_pages',
    [FilterField.LANGUAGE]: 'filter_options_languages',
    [FilterField.COUNTRY]: 'filter_options_countries',
    [FilterField.REGION]: 'filter_options_regions',
    [FilterField.CITY]: 'filter_options_cities',
    [FilterField.OS]: 'filter_options_os',
    [FilterField.OS_VERSION]: 'filter_options_os_versions',
    [FilterField.BROWSER]: 'filter_options_browsers',
    [FilterField.BROWSER_VERSION]: 'filter_options_browser_versions',
    [FilterField.PLATFORM]: 'filter_options_platforms',
    [FilterField.SCREEN_CLASS]: 'filter_options_screen_classes',
    [FilterField.REFERRER]: 'filter_options_referrers',
    [FilterField.REFERRER_NAME]: 'filter_options_referrer_names',
    [FilterField.CHANNEL]: 'filter_options_channels',
    [FilterField.UTM_SOURCE]: 'filter_options_utm_sources',
    [FilterField.UTM_MEDIUM]: 'filter_options_utm_mediums',
    [FilterField.UTM_CAMPAIGN]: 'filter_options_utm_campaigns',
    [FilterField.UTM_CONTENT]: 'filter_options_utm_content',
    [FilterField.UTM_TERM]: 'filter_options_utm_terms',
    [FilterField.EVENT_NAME]: 'filter_options_event_names',
    [FilterField.EVENT_META_KEY]: 'filter_options_event_meta_keys',
    [FilterField.TAG]: 'filter_options_tags',
  }

  // Static options for some fields (like screen class)
  const staticOptions: Partial<Record<FilterField, FilterValue[]>> = {
    [FilterField.SCREEN_CLASS]: [
      { value: 'sm', label: 'Small (< 768px)' },
      { value: 'md', label: 'Medium (768px - 1024px)' },
      { value: 'lg', label: 'Large (1024px - 1280px)' },
      { value: 'xl', label: 'Extra Large (> 1280px)' },
    ],
  }

  const fetchFilterOptions = useCallback(async (
    field: FilterField, 
    search?: string
  ): Promise<FilterValue[]> => {
    // Return static options if available
    if (staticOptions[field]) {
      const options = staticOptions[field]!
      if (search) {
        return options.filter(option => 
          option.label.toLowerCase().includes(search.toLowerCase()) ||
          option.value.toLowerCase().includes(search.toLowerCase())
        )
      }
      return options
    }

    // Check cache first
    const cacheKey = `${field}_${startDate}_${endDate}_${search || ''}`
    const cached = optionsCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data
    }

    const pipeEndpoint = fieldToPipeMap[field]
    if (!pipeEndpoint) {
      console.warn(`No pipe endpoint configured for filter field: ${field}`)
      return []
    }

    try {
      setIsLoading(true)
      setError(undefined)

      const params: Record<string, any> = {
        date_from: startDate,
        date_to: endDate,
      }

      if (search) {
        params.search = search
      }

      const response = await queryPipe(pipeEndpoint, params) as unknown as FilterOptionsResponse
      
      const options: FilterValue[] = response.data.map(item => ({
        value: item.value,
        label: item.value, // Use value as label by default
        count: item.count,
      }))

      // Cache the results
      optionsCache.set(cacheKey, {
        data: options,
        timestamp: Date.now(),
      })

      return options
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch filter options'
      setError(errorMessage)
      console.error(`Error fetching filter options for ${field}:`, err)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [startDate, endDate, fieldToPipeMap, staticOptions])

  // Get options for a specific field (with caching)
  const getFilterOptions = useCallback((field: FilterField, search?: string): FilterValue[] => {
    // Return static options immediately
    if (staticOptions[field]) {
      const options = staticOptions[field]!
      if (search) {
        return options.filter(option => 
          option.label.toLowerCase().includes(search.toLowerCase()) ||
          option.value.toLowerCase().includes(search.toLowerCase())
        )
      }
      return options
    }

    // For dynamic options, check cache
    const cacheKey = `${field}_${startDate}_${endDate}_${search || ''}`
    const cached = optionsCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data
    }

    // If not in cache, return empty array (will be fetched later)
    return []
  }, [startDate, endDate, fetchFilterOptions, staticOptions])

  // Preload options for commonly used fields
  const preloadCommonOptions = useCallback(async () => {
    const commonFields = [
      FilterField.COUNTRY,
      FilterField.BROWSER,
      FilterField.OS,
      FilterField.REFERRER_NAME,
      FilterField.UTM_SOURCE,
    ]

    await Promise.all(
      commonFields.map(field => fetchFilterOptions(field))
    )
  }, [fetchFilterOptions])

  // Clear cache
  const clearCache = useCallback(() => {
    optionsCache.clear()
  }, [])

  // Get all available options as a single object
  const getAllOptions = useCallback(async (): Promise<FilterOptions> => {
    const options: FilterOptions = {}
    
    const allFields = Object.values(FilterField)
    await Promise.all(
      allFields.map(async (field) => {
        try {
          options[field] = await fetchFilterOptions(field)
        } catch (err) {
          console.error(`Failed to fetch options for ${field}:`, err)
          options[field] = []
        }
      })
    )

    return options
  }, [fetchFilterOptions])

  return {
    fetchFilterOptions,
    getFilterOptions,
    preloadCommonOptions,
    clearCache,
    getAllOptions,
    isLoading,
    error,
  }
}

export default useFilterOptions 