import { BarList } from '@tinybirdco/charts'
import InView from './InView'
import useDateFilter from '../lib/hooks/use-date-filter'
import { getConfig } from '../lib/api'
import { useRouter } from 'next/router'

interface ConversionGoalsProps {
  height: number
}

function buildEndpointUrl(host: string, endpoint: string) {
  const apiUrl =
    {
      'https://ui.tinybird.co': 'https://api.tinybird.co',
      'https://ui.us-east.tinybird.co': 'https://api.us-east.tinybird.co',
    }[host] ?? host

  return `${apiUrl}/v0/pipes/${endpoint}.json`
}

export default function ConversionGoals({ height }: ConversionGoalsProps) {
  const { query } = useRouter()
  const { host } = getConfig(typeof query === 'string' ? query : undefined)
  const { startDate, endDate } = useDateFilter()
  
  const endpointUrl = buildEndpointUrl(host, 'conversion_goals')

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Conversion Goals</h3>
      </div>
      <div className="p-0">
        <InView height={height}>
          <BarList
            endpoint={endpointUrl}
            index="goal_name"
            categories={['conversions']}
            title=""
            params={{
              date_from: startDate,
              date_to: endDate,
            }}
            height={height}
            indexConfig={{
              renderBarContent: (item: any) => item.label || 'Unknown Goal',
            }}
          />
        </InView>
      </div>
    </div>
  )
} 