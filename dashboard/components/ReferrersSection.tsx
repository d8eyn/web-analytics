'use client'

import BarList from './BarList';
import { TabbedWidget } from './TabbedWidget';
import useDashboardData from '../lib/hooks/use-dashboard-data';

export function ReferrersSection() {
  const { summary, isLoading } = useDashboardData();

  if (isLoading) {
    return (
      <div className="animate-pulse bg-gray-200 rounded-lg h-96"></div>
    );
  }

  const topSourcesData = summary.getTopSources().map(source => ({
    name: source.name,
    visits: source.visits,
    hits: source.hits,
  }));

  const topMediumsData = summary.getTopMediums().map(medium => ({
    name: medium.name,
    visits: medium.visits,
    hits: medium.hits,
  }));

  const topCampaignsData = summary.getTopCampaigns().map(campaign => ({
    name: campaign.name,
    visits: campaign.visits,
    hits: campaign.hits,
  }));

  return (
    <TabbedWidget
      title="Sources"
      tabs={[
        {
          name: 'Sources',
          content: (
            <BarList
              data={topSourcesData}
              index="name"
              categories={['visits']}
            />
          ),
        },
        {
          name: 'Mediums',
          content: (
            <BarList
              data={topMediumsData}
              index="name"
              categories={['visits']}
            />
          ),
        },
        {
          name: 'Campaigns',
          content: (
            <BarList
              data={topCampaignsData}
              index="name"
              categories={['visits']}
            />
          ),
        },
      ]}
    />
  );
} 