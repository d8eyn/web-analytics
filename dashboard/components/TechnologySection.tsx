import TabbedWidget, { Tab } from './TabbedWidget'

interface TechnologySectionProps {
  height: number
}

export default function TechnologySection({ height }: TechnologySectionProps) {
  const tabs: Tab[] = [
    {
      id: 'os',
      label: 'OS',
      endpoint: 'top_os',
      index: 'os',
      categories: ['visits', 'hits'],
    },
    {
      id: 'browsers',
      label: 'Browsers',
      endpoint: 'top_browsers',
      index: 'browser',
      categories: ['visits', 'hits'],
    },
    {
      id: 'platforms',
      label: 'Platforms',
      endpoint: 'top_devices',
      index: 'device',
      categories: ['visits', 'hits'],
    },
    {
      id: 'screens',
      label: 'Screens',
      endpoint: 'top_devices',
      index: 'device',
      categories: ['visits', 'hits'],
    },
  ]

  return <TabbedWidget title="OS" tabs={tabs} height={height} />
} 