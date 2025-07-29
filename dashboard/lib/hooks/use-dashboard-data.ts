import { useMemo } from 'react'
import { queryPipe } from '../api'
import useDateFilter from './use-date-filter'
import useQuery from './use-query'
import { useFilters } from './use-filters'
import { filtersToApiParams } from '../utils/filter-utils'

// Types for the consolidated dashboard data
interface DashboardSummaryRow {
  data_type: string
  name: string
  visits: number
  hits: number
  unique_users: number
  event_count: number
  conversions: number
}

interface DashboardTrendsRow {
  data_type: string
  date_key: string
  visits: number
  pageviews: number
  bounce_rate: number
  avg_session_sec: number
}

interface DashboardSummaryData {
  data: DashboardSummaryRow[]
}

interface DashboardTrendsData {
  data: DashboardTrendsRow[]
}

// Helper function to group summary data by type
function groupSummaryData(data: DashboardSummaryRow[]) {
  return data.reduce((acc, row) => {
    if (!acc[row.data_type]) {
      acc[row.data_type] = []
    }
    acc[row.data_type].push(row)
    return acc
  }, {} as Record<string, DashboardSummaryRow[]>)
}

// Helper function to group trends data by type
function groupTrendsData(data: DashboardTrendsRow[]) {
  return data.reduce((acc, row) => {
    if (!acc[row.data_type]) {
      acc[row.data_type] = []
    }
    acc[row.data_type].push(row)
    return acc
  }, {} as Record<string, DashboardTrendsRow[]>)
}

export function useDashboardSummary() {
  const { startDate, endDate } = useDateFilter()
  const { activeFilters } = useFilters()

  // Create a cache key that includes filters
  const cacheKey = useMemo(() => {
    return [
      'dashboard_summary',
      startDate,
      endDate,
      JSON.stringify(activeFilters)
    ]
  }, [startDate, endDate, activeFilters])

  const { data, error, isValidating, mutate } = useQuery(
    cacheKey,
    () => {
      const params = filtersToApiParams(activeFilters, startDate, endDate)
      return queryPipe('dashboard_summary', params)
    }
  )

  const groupedData = useMemo(() => {
    if (!data?.data) return {}
    return groupSummaryData(data.data as unknown as DashboardSummaryRow[])
  }, [data])

  return {
    data: groupedData,
    isLoading: isValidating,
    error,
    mutate,
    // Helper functions to get specific data types
    getTopPages: () => groupedData.top_pages || [],
    getEntryPages: () => groupedData.entry_pages || [],
    getExitPages: () => groupedData.exit_pages || [],
    getTopSources: () => groupedData.top_sources || [],
    getTopBrowsers: () => groupedData.top_browsers || [],
    getTopOS: () => groupedData.top_os || [],
    getTopDevices: () => groupedData.top_devices || [],
    getTopLocations: () => groupedData.top_locations || [],
    getTopRegions: () => groupedData.top_regions || [],
    getTopCities: () => groupedData.top_cities || [],
    getTopLanguages: () => groupedData.top_languages || [],
    getTopHostnames: () => groupedData.top_hostnames || [],
    getTopChannels: () => groupedData.top_channels || [],
    getTopMediums: () => groupedData.top_mediums || [],
    getTopCampaigns: () => groupedData.top_campaigns || [],
    getTopCustomEvents: () => groupedData.top_custom_events || [],
    getConversionGoals: () => groupedData.conversion_goals || [],
  }
}

export function useDashboardTrends() {
  const { startDate, endDate } = useDateFilter()
  const { activeFilters } = useFilters()

  // Create a cache key that includes filters
  const cacheKey = useMemo(() => {
    return [
      'dashboard_trends',
      startDate,
      endDate,
      JSON.stringify(activeFilters)
    ]
  }, [startDate, endDate, activeFilters])

  const { data, error, isValidating, mutate } = useQuery(
    cacheKey,
    () => {
      const params = filtersToApiParams(activeFilters, startDate, endDate)
      return queryPipe('dashboard_trends', params)
    }
  )

  const groupedData = useMemo(() => {
    if (!data?.data) return {}
    return groupTrendsData(data.data as unknown as DashboardTrendsRow[])
  }, [data])

  return {
    data: groupedData,
    isLoading: isValidating,
    error,
    mutate,
    // Helper functions to get specific data types
    getKpiTrends: () => groupedData.kpi_trends || [],
    getRealtimeTrend: () => groupedData.realtime_trend || [],
  }
}

// Combined hook for convenience
export default function useDashboardData() {
  const summary = useDashboardSummary()
  const trends = useDashboardTrends()

  return {
    summary,
    trends,
    isLoading: summary.isLoading || trends.isLoading,
    error: summary.error || trends.error,
    mutate: () => {
      summary.mutate()
      trends.mutate()
    },
  }
} 