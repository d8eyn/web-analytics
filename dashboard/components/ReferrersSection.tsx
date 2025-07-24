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

export function ReferrersSection() {
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
      name: 'Sources',
      content: (
        <InView height={400}>
          <BarList
            endpoint={buildEndpointUrl(host, 'top_sources')}
            index="referrer_name"
            categories={['visits']}
            title="Top Sources"
            params={commonParams}
            height={400}
          />
        </InView>
      ),
    },
    {
      name: 'Mediums',
      content: (
        <InView height={400}>
          <BarList
            endpoint={buildEndpointUrl(host, 'top_mediums')}
            index="utm_medium"
            categories={['visits']}
            title="Top Mediums"
            params={commonParams}
            height={400}
          />
        </InView>
      ),
    },
    {
      name: 'Campaigns',
      content: (
        <InView height={400}>
          <BarList
            endpoint={buildEndpointUrl(host, 'top_campaigns')}
            index="utm_campaign"
            categories={['visits']}
            title="Top Campaigns"
            params={commonParams}
            height={400}
          />
        </InView>
      ),
    },
  ];

  return <TabbedWidget title="Referrers" tabs={tabs} />;
} 