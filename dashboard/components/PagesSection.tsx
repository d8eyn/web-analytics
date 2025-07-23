import TabbedWidget, { Tab } from './TabbedWidget'
import useDomain from '../lib/hooks/use-domain'

interface PagesSectionProps {
  height: number
}

export default function PagesSection({ height }: PagesSectionProps) {
  const { domain } = useDomain()

  const tabs: Tab[] = [
    {
      id: 'pages',
      label: 'Pages',
      endpoint: 'top_pages',
      index: 'pathname',
      categories: ['visits', 'hits'],
      renderBarContent: (item: any) => (
        <a
          className="truncate hover:underline"
          href={`https://${domain}${item.label}`}
          target="_blank"
          rel="noreferrer"
        >
          {item.label}
        </a>
      ),
    },
    {
      id: 'entry',
      label: 'Entry Pages',
      endpoint: 'entry_pages',
      index: 'pathname',
      categories: ['visits', 'hits'],
      renderBarContent: (item: any) => (
        <a
          className="truncate hover:underline"
          href={`https://${domain}${item.label}`}
          target="_blank"
          rel="noreferrer"
        >
          {item.label}
        </a>
      ),
    },
    {
      id: 'exit',
      label: 'Exit Pages',
      endpoint: 'exit_pages',
      index: 'pathname',
      categories: ['visits', 'hits'],
      renderBarContent: (item: any) => (
        <a
          className="truncate hover:underline"
          href={`https://${domain}${item.label}`}
          target="_blank"
          rel="noreferrer"
        >
          {item.label}
        </a>
      ),
    },
    {
      id: 'hostname',
      label: 'Hostname',
      endpoint: 'top_hostnames',
      index: 'hostname',
      categories: ['visits', 'hits'],
    },
    {
      id: 'channel',
      label: 'Channel',
      endpoint: 'top_channels',
      index: 'channel',
      categories: ['visits', 'hits'],
    },
  ]

  return <TabbedWidget title="Pages" tabs={tabs} height={height} />
} 