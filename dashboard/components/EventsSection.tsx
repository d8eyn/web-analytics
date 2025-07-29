'use client'

import BarList from './BarList';
import useDashboardData from '../lib/hooks/use-dashboard-data';

export function EventsSection() {
  const { summary, isLoading } = useDashboardData();

  if (isLoading) {
    return (
      <div className="animate-pulse bg-gray-200 rounded-lg h-96"></div>
    );
  }

  const topCustomEventsData = summary.getTopCustomEvents().map(event => ({
    name: event.name,
    hits: event.hits,
  }));

  return (
    <div className="h-96">
      <BarList
        data={topCustomEventsData}
        index="name"
        categories={['hits']}
        title="Top Custom Events"
      />
    </div>
  );
} 