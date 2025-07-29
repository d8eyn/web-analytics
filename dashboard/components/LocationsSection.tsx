'use client'

import BarList from './BarList';
import { TabbedWidget } from './TabbedWidget';
import useDashboardData from '../lib/hooks/use-dashboard-data';

export function LocationsSection() {
  const { summary, isLoading } = useDashboardData();

  if (isLoading) {
    return (
      <div className="animate-pulse bg-gray-200 rounded-lg h-96"></div>
    );
  }

  const topLocationsData = summary.getTopLocations().map(location => ({
    name: location.name,
    visits: location.visits,
    hits: location.hits,
  }));

  const topRegionsData = summary.getTopRegions().map(region => ({
    name: region.name,
    visits: region.visits,
    hits: region.hits,
  }));

  const topCitiesData = summary.getTopCities().map(city => ({
    name: city.name,
    visits: city.visits,
    hits: city.hits,
  }));

  return (
    <TabbedWidget
      title="Locations"
      tabs={[
        {
          name: 'Countries',
          content: (
            <BarList
              data={topLocationsData}
              index="name"
              categories={['visits']}
            />
          ),
        },
        {
          name: 'Regions',
          content: (
            <BarList
              data={topRegionsData}
              index="name"
              categories={['visits']}
            />
          ),
        },
        {
          name: 'Cities',
          content: (
            <BarList
              data={topCitiesData}
              index="name"
              categories={['visits']}
            />
          ),
        },
      ]}
    />
  );
} 