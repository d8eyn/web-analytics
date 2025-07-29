import { useSearchParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'

import { queryPipe } from '../api'
import { KpisData, KpiType, isKpi, KPI_OPTIONS } from '../types/kpis'
import useDateFilter from './use-date-filter'
import useQuery from './use-query'
import { ChartValue } from '../types/charts'
import { useFilters } from './use-filters'
import { filtersToApiParams } from '../utils/filter-utils'
import { useMemo } from 'react'

const arrayHasCurrentDate = (dates: string[], isHourlyGranularity: boolean) => {
  const now = format(new Date(), isHourlyGranularity ? 'HH:mm' : 'MMM DD, yyyy')
  return dates[dates.length - 1] === now
}

async function getKpis(kpi: KpiType, date_from?: string, date_to?: string, activeFilters?: any) {
  const params = filtersToApiParams(activeFilters, date_from, date_to)
  const { data: queryData } = await queryPipe<KpisData>('kpis', params)
  
  const isHourlyGranularity = !!date_from && !!date_to && date_from === date_to
  const dates = queryData.map(({ date }) =>
    format(new Date(date), isHourlyGranularity ? 'HH:mm' : 'MMM DD, yyyy')
  )
  const isCurrentData = arrayHasCurrentDate(dates, isHourlyGranularity)

  const data = isCurrentData
    ? queryData.reduce(
      (acc, record, index) => {
        const value = record[kpi] ?? 0

        const pastValue = index < queryData.length - 1 ? value : ''
        const currentValue = index > queryData.length - 3 ? value : ''

        const [pastPart, currentPart] = acc

        return [
          [...pastPart, pastValue],
          [...currentPart, currentValue],
        ]
      },
      [[], []] as ChartValue[][]
    )
    : [queryData.map(value => value[kpi] ?? 0), ['']]

  return {
    dates,
    data,
  }
}

export default function useKpis() {
  const { startDate, endDate } = useDateFilter()
  const { activeFilters } = useFilters()
  const searchParams = useSearchParams()
  const router = useRouter()
  const kpiParam = searchParams.get('kpi')
  const kpi = (kpiParam && isKpi(kpiParam)) ? kpiParam : 'visits'
  const kpiOption = KPI_OPTIONS.find(({ value }) => value === kpi)!
  
  // Create a cache key that includes filters
  const cacheKey = useMemo(() => {
    return [kpi, startDate, endDate, 'kpis', JSON.stringify(activeFilters)]
  }, [kpi, startDate, endDate, activeFilters])
  
  const query = useQuery(cacheKey, () => getKpis(kpi, startDate, endDate, activeFilters))

  const setKpi = (kpi: KpiType) => {
    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.set('kpi', kpi)
    router.push(`?${newSearchParams.toString()}`, { scroll: false })
  }

  return {
    setKpi,
    kpi,
    kpiOption,
    ...query,
  }
}
