import TabbedWidget, { Tab } from './TabbedWidget'

interface LocationsSectionProps {
  height: number
}

export default function LocationsSection({ height }: LocationsSectionProps) {
  const tabs: Tab[] = [
    {
      id: 'countries',
      label: 'Countries',
      endpoint: 'top_locations',
      index: 'location',
      categories: ['visits', 'hits'],
      renderBarContent: (item: any) => item.label || 'Unknown',
    },
    {
      id: 'regions',
      label: 'Regions',
      endpoint: 'top_regions',
      index: 'region',
      categories: ['visits', 'hits'],
    },
    {
      id: 'cities',
      label: 'Cities',
      endpoint: 'top_cities',
      index: 'city',
      categories: ['visits', 'hits'],
    },
    {
      id: 'languages',
      label: 'Languages',
      endpoint: 'top_languages',
      index: 'language',
      categories: ['visits', 'hits'],
    },
  ]

  return <TabbedWidget title="Countries" tabs={tabs} height={height} />
} 