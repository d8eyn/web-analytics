import TabbedWidget, { Tab } from './TabbedWidget'

interface ReferrersSectionProps {
  height: number
}

export default function ReferrersSection({ height }: ReferrersSectionProps) {
  const tabs: Tab[] = [
    {
      id: 'sources',
      label: 'Sources',
      endpoint: 'top_sources',
      index: 'referrer',
      categories: ['visits', 'hits'],
      renderBarContent: (item: any) =>
        item.label ? (
          <a
            href={`https://${item.label}`}
            className="truncate hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            {item.label}
          </a>
        ) : (
          'Direct'
        ),
    },
    {
      id: 'mediums',
      label: 'Mediums',
      endpoint: 'top_mediums',
      index: 'medium',
      categories: ['visits', 'hits'],
    },
    {
      id: 'campaigns',
      label: 'Campaigns',
      endpoint: 'top_campaigns',
      index: 'campaign',
      categories: ['visits', 'hits'],
    },
  ]

  return <TabbedWidget title="Referrers" tabs={tabs} height={height} />
} 