'use client'

import BarList from './BarList';
import { TabbedWidget } from './TabbedWidget';
import InView from './InView';
import useDashboardData from '../lib/hooks/use-dashboard-data';

export function PagesSection() {
  const { summary, isLoading } = useDashboardData();

  if (isLoading) {
    return (
      <div className="animate-pulse bg-gray-200 rounded-lg h-96"></div>
    );
  }

  const topPagesData = summary.getTopPages().map(page => ({
    name: page.name,
    visits: page.visits,
    hits: page.hits,
  }));

  const entryPagesData = summary.getEntryPages().map(page => ({
    name: page.name,
    visits: page.visits,
    hits: page.hits,
  }));

  const exitPagesData = summary.getExitPages().map(page => ({
    name: page.name,
    visits: page.visits,
    hits: page.hits,
  }));

  return (
    <TabbedWidget
      title="Pages"
             tabs={[
        {
          name: 'Top',
          content: (
            <BarList
              data={topPagesData}
              index="name"
              categories={['visits']}
            />
          ),
        },
        {
          name: 'Entry',
          content: (
            <BarList
              data={entryPagesData}
              index="name"
              categories={['visits']}
            />
          ),
        },
        {
          name: 'Exit',
          content: (
            <BarList
              data={exitPagesData}
              index="name"
              categories={['visits']}
            />
          ),
        },
      ]}
    />
  );
} 