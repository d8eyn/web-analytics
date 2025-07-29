import { Popover } from '@headlessui/react'
import DatePicker from 'react-datepicker'
import { subDays } from 'date-fns'
import { useState } from 'react'
import { QuestionIcon } from './Icons'


import {
  DateFilter as DateFilterType,
} from '../lib/types/date-filter'
import useDateFilter from '../lib/hooks/use-date-filter'

const dateFilterOptions = [
  { text: 'Today', value: DateFilterType.Today, startDate: new Date() },
  {
    text: 'Yesterday',
    value: DateFilterType.Yesterday,
    startDate: subDays(new Date(), 1),
  },
  {
    text: '7 days',
    value: DateFilterType.Last7Days,
    startDate: subDays(new Date(), 7),
  },
  {
    text: '30 days',
    value: DateFilterType.Last30Days,
    startDate: subDays(new Date(), 30),
  },
  {
    text: '12 months',
    value: DateFilterType.Last12Months,
    startDate: subDays(new Date(), 365),
  },
]

export default function DateFilter() {
  const { dateRangePickerValue, onDateRangePickerValueChange } = useDateFilter()
  const [startDate, setStartDate] = useState<Date | undefined>(dateRangePickerValue?.from)
  const [endDate, setEndDate] = useState<Date | undefined>(dateRangePickerValue?.to)

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates
    setStartDate(start || undefined)
    setEndDate(end || undefined)
    
    if (start && end) {
      onDateRangePickerValueChange({
        from: start,
        to: end
      })
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Popover className="relative">
        <Popover.Button className="flex items-center justify-center w-4 h-4 text-gray-500 hover:text-gray-700 transition-colors">
          <QuestionIcon className="w-4 h-4" />
          <span className="sr-only">What is the time zone used?</span>
        </Popover.Button>
        <Popover.Panel className="absolute bottom-6 -right-10 z-50 w-24 bg-gray-900 text-white text-xs font-medium rounded-md py-2 px-3 shadow-lg">
          <div className="absolute -bottom-1 right-3 w-2 h-2 bg-gray-900 rotate-45"></div>
          UTC timezone
        </Popover.Panel>
      </Popover>
      
      <div className="relative z-40">
        <DatePicker
          selected={startDate}
          onChange={handleDateChange}
          startDate={startDate}
          endDate={endDate}
          selectsRange
          placeholderText="Select dates..."
          className="min-w-[200px] px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          dateFormat="MMM dd, yyyy"
        />
      </div>
    </div>
  )
}
