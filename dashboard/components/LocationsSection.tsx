import { BarList } from '@tinybirdco/charts';
import { TabbedWidget } from './TabbedWidget';
import InView from './InView';
import useDateFilter from '../lib/hooks/use-date-filter';
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

export function LocationsSection() {
  const { query } = useRouter();
  const { host } = getConfig(typeof query === 'string' ? query : undefined);
  const { startDate, endDate } = useDateFilter();

  const commonParams = {
    date_from: startDate,
    date_to: endDate,
    limit: 8,
  };

  const tabs = [
    {
      name: 'Countries',
      content: (
        <InView height={400}>
          <BarList
            endpoint={buildEndpointUrl(host, 'top_locations')}
            index="country_code"
            categories={['visits']}
            title="Top Countries"
            params={commonParams}
            height={400}
          />
        </InView>
      ),
    },
    {
      name: 'Regions',
      content: (
        <InView height={400}>
          <BarList
            endpoint={buildEndpointUrl(host, 'top_regions')}
            index="region"
            categories={['visits']}
            title="Top Regions"
            params={commonParams}
            height={400}
          />
        </InView>
      ),
    },
    {
      name: 'Cities',
      content: (
        <InView height={400}>
          <BarList
            endpoint={buildEndpointUrl(host, 'top_cities')}
            index="city"
            categories={['visits']}
            title="Top Cities"
            params={commonParams}
            height={400}
          />
        </InView>
      ),
    },
    {
      name: 'Languages',
      content: (
        <InView height={400}>
          <BarList
            endpoint={buildEndpointUrl(host, 'top_languages')}
            index="language"
            categories={['visits']}
            title="Top Languages"
            params={commonParams}
            height={400}
          />
        </InView>
      ),
    },
  ];

  return <TabbedWidget title="Locations" tabs={tabs} />;
} 