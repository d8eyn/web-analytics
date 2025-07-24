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

export function TechnologySection() {
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
      name: 'OS',
      content: (
        <InView height={400}>
          <BarList
            endpoint={buildEndpointUrl(host, 'top_os')}
            index="os"
            categories={['visits']}
            title="Top Operating Systems"
            params={commonParams}
            height={400}
          />
        </InView>
      ),
    },
    {
      name: 'Browsers',
      content: (
        <InView height={400}>
          <BarList
            endpoint={buildEndpointUrl(host, 'top_browsers')}
            index="browser"
            categories={['visits']}
            title="Top Browsers"
            params={commonParams}
            height={400}
          />
        </InView>
      ),
    },
    {
      name: 'Platforms',
      content: (
        <InView height={400}>
          <BarList
            endpoint={buildEndpointUrl(host, 'top_devices')}
            index="device"
            categories={['visits']}
            title="Top Devices"
            params={commonParams}
            height={400}
          />
        </InView>
      ),
    },
    {
      name: 'Screens',
      content: (
        <InView height={400}>
          <BarList
            endpoint={buildEndpointUrl(host, 'top_devices')}
            index="screen_class"
            categories={['visits']}
            title="Screen Sizes"
            params={commonParams}
            height={400}
          />
        </InView>
      ),
    },
  ];

  return <TabbedWidget title="Technology" tabs={tabs} />;
} 