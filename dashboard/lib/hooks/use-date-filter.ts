import { parse, format, subDays } from 'date-fns'
import { useSearchParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { DateFilter, dateFormat } from '../types/date-filter'

// Simple date range type for internal use
export type DateRangeValue = {
  from: Date | undefined
  to: Date | undefined
}

export default function useDateFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [dateRangePickerValue, setDateRangePickerValue] =
    useState<DateRangeValue | undefined>()

  const setDateFilter = useCallback(
    (value: DateRangeValue) => {
      if (!value?.from || !value?.to) return

      const startDate = value.from
      const endDate = value.to
      const lastDays = DateFilter.Custom

      const newSearchParams = new URLSearchParams(window.location.search)
      newSearchParams.set('last_days', lastDays)

      if (lastDays === DateFilter.Custom && startDate && endDate) {
        newSearchParams.set('start_date', format(startDate, dateFormat))
        newSearchParams.set('end_date', format(endDate, dateFormat))
      } else {
        newSearchParams.delete('start_date')
        newSearchParams.delete('end_date')
      }
      
      const newUrl = `${window.location.pathname}?${newSearchParams.toString()}`
      router.push(newUrl, { scroll: false })
    },
    [router]
  )

  const lastDaysParam = searchParams.get('last_days') as DateFilter
  const lastDays: DateFilter =
    typeof lastDaysParam === 'string' &&
      Object.values(DateFilter).includes(lastDaysParam)
      ? lastDaysParam
      : DateFilter.Last7Days

  const { startDate, endDate } = useMemo(() => {
    const today = new Date()
    if (lastDays === DateFilter.Custom) {
      const startDateParam = searchParams.get('start_date')
      const endDateParam = searchParams.get('end_date')

      const startDate =
        startDateParam ||
        format(subDays(today, +DateFilter.Last7Days), dateFormat)
      const endDate = endDateParam || format(today, dateFormat)

      return { startDate, endDate }
    }

    const startDate = format(subDays(today, +lastDays), dateFormat)
    const endDate =
      lastDays === DateFilter.Yesterday
        ? format(subDays(today, +DateFilter.Yesterday), dateFormat)
        : format(today, dateFormat)

    return { startDate, endDate }
  }, [lastDays, searchParams.get('start_date'), searchParams.get('end_date')])

  useEffect(() => {
    setDateRangePickerValue({
      from: parse(startDate, dateFormat, new Date()),
      to: parse(endDate, dateFormat, new Date()),
    })
  }, [startDate, endDate, lastDays])

  const onDateRangePickerValueChange = useCallback(
    (value: DateRangeValue | undefined) => {
      if (value?.from && value?.to) {
        setDateFilter(value)
      } else {
        setDateRangePickerValue(value)
      }
    },
    [setDateFilter]
  )

  return {
    startDate,
    endDate,
    dateRangePickerValue,
    onDateRangePickerValueChange,
  }
}
