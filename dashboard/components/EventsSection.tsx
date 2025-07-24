import { BarList } from '@tinybirdco/charts';
import { Card } from '@tremor/react';
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

export function EventsSection() {
  const { query } = useRouter();
  const { host } = getConfig(typeof query === 'string' ? query : undefined);
  const { startDate, endDate } = useDateFilter();

  const params = {
    date_from: startDate,
    date_to: endDate,
    limit: 8,
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Events</h3>
      <InView height={400}>
        <BarList
          endpoint={buildEndpointUrl(host, 'top_custom_events')}
          index="event_name"
          categories={['total_events']}
          title="Top Custom Events"
          params={params}
          height={400}
        />
      </InView>
    </Card>
  );
} 