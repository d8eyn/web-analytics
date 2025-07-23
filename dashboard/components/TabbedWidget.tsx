import { useState } from 'react'
import { BarList } from '@tinybirdco/charts'
import InView from './InView'
import useDateFilter from '../lib/hooks/use-date-filter'
import { getConfig } from '../lib/api'
import { useRouter } from 'next/router'
import useDomain from '../lib/hooks/use-domain'

export interface Tab {
  id: string
  label: string
  endpoint: string
  index: string
  categories: string[]
  renderBarContent?: (item: any) => React.ReactNode
}

interface TabbedWidgetProps {
  title: string
  tabs: Tab[]
  height: number
  limit?: number
}

function buildEndpointUrl(host: string, endpoint: string) {
  const apiUrl =
    {
      'https://ui.tinybird.co': 'https://api.tinybird.co',
      'https://ui.us-east.tinybird.co': 'https://api.us-east.tinybird.co',
    }[host] ?? host

  return `${apiUrl}/v0/pipes/${endpoint}.json`
}

export default function TabbedWidget({ title, tabs, height, limit = 8 }: TabbedWidgetProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id)
  const { query } = useRouter()
  const { host } = getConfig(typeof query === 'string' ? query : undefined)
  const { startDate, endDate } = useDateFilter()
  const { domain } = useDomain()

  const activeTabData = tabs.find(tab => tab.id === activeTab)

  if (!activeTabData) return null

  const endpointUrl = buildEndpointUrl(host, activeTabData.endpoint)

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="p-0">
        <InView height={height}>
          <BarList
            endpoint={endpointUrl}
            index={activeTabData.index}
            categories={activeTabData.categories}
            title={title}
            params={{
              limit,
              date_from: startDate,
              date_to: endDate,
            }}
            height={height}
            indexConfig={{
              renderBarContent: activeTabData.renderBarContent || ((item: any) => item.label || 'Unknown'),
            }}
          />
        </InView>
      </div>
    </div>
  )
} 