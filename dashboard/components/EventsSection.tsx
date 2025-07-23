import TabbedWidget, { Tab } from './TabbedWidget'

interface EventsSectionProps {
  height: number
}

export default function EventsSection({ height }: EventsSectionProps) {
  const tabs: Tab[] = [
    {
      id: 'events',
      label: 'Events',
      endpoint: 'top_custom_events',
      index: 'event_name',
      categories: ['unique_users', 'event_count'],
    },
    {
      id: 'tags',
      label: 'Tags',
      endpoint: 'top_custom_events',
      index: 'event_name',
      categories: ['unique_users', 'event_count'],
    },
  ]

  return <TabbedWidget title="Events" tabs={tabs} height={height} />
} 