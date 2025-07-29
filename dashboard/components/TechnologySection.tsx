'use client'

import BarList from './BarList';
import { TabbedWidget } from './TabbedWidget';
import useDashboardData from '../lib/hooks/use-dashboard-data';

export function TechnologySection() {
  const { summary, isLoading } = useDashboardData();

  if (isLoading) {
    return (
      <div className="animate-pulse bg-gray-200 rounded-lg h-96"></div>
    );
  }

  const topBrowsersData = summary.getTopBrowsers().map(browser => ({
    name: browser.name,
    visits: browser.visits,
    hits: browser.hits,
  }));

  const topOSData = summary.getTopOS().map(os => ({
    name: os.name,
    visits: os.visits,
    hits: os.hits,
  }));

  const topDevicesData = summary.getTopDevices().map(device => ({
    name: device.name,
    visits: device.visits,
    hits: device.hits,
  }));

  return (
    <TabbedWidget
      title="Technology"
      tabs={[
        {
          name: 'Browsers',
          content: (
            <BarList
              data={topBrowsersData}
              index="name"
              categories={['visits']}
            />
          ),
        },
        {
          name: 'OS',
          content: (
            <BarList
              data={topOSData}
              index="name"
              categories={['visits']}
            />
          ),
        },
        {
          name: 'Devices',
          content: (
            <BarList
              data={topDevicesData}
              index="name"
              categories={['visits']}
            />
          ),
        },
      ]}
    />
  );
} 