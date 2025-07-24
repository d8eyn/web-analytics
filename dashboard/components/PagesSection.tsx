import { BarList } from '@tinybirdco/charts';
import { TabbedWidget } from './TabbedWidget';
import InView from './InView';
import useDateFilter from '../lib/hooks/use-date-filter';
import useDomain from '../lib/hooks/use-domain';
import { getConfig } from '../lib/api';
import { useRouter } from 'next/router';

function buildEndpointUrl(host: string, endpoint: string) {
  const apiUrl =
    {
      'https://ui.tinybird.co': 'https://api.tinybird.co',
      'https://ui.us-east.tinybird.co': 'https://api.us-east.tinybird.co',
    }[host] ?? host;

  return `${apiUrl}/v0/pipes/${endpoint}.json`;
}

export function PagesSection() {
  const { query } = useRouter();
  const { host } = getConfig(typeof query === 'string' ? query : undefined);
  const { startDate, endDate } = useDateFilter();
  const { domain } = useDomain();

  const commonParams = {
    date_from: startDate,
    date_to: endDate,
    limit: 8,
  };

  const tabs = [
    {
      name: 'Entry Pages',
      content: (
        <InView height={400}>
          <BarList
            endpoint={buildEndpointUrl(host, 'entry_pages')}
            index="pathname"
            categories={['visits']}
            title="Entry Pages"
            params={commonParams}
            height={400}
          />
        </InView>
      ),
    },
    {
      name: 'Exit Pages',
      content: (
        <InView height={400}>
          <BarList
            endpoint={buildEndpointUrl(host, 'exit_pages')}
            index="pathname"
            categories={['visits']}
            title="Exit Pages"
            params={commonParams}
            height={400}
          />
        </InView>
      ),
    },
    {
      name: 'Hostname',
      content: (
        <InView height={400}>
          <BarList
            endpoint={buildEndpointUrl(host, 'top_hostnames')}
            index="hostname"
            categories={['visits']}
            title="Top Hostnames"
            params={commonParams}
            height={400}
          />
        </InView>
      ),
    },
    {
      name: 'Channel',
      content: (
        <InView height={400}>
          <BarList
            endpoint={buildEndpointUrl(host, 'top_channels')}
            index="channel"
            categories={['visits']}
            title="Top Channels"
            params={commonParams}
            height={400}
          />
        </InView>
      ),
    },
  ];

  return <TabbedWidget title="Pages" tabs={tabs} />;
} 