'use client'

import BarList from './BarList';
import useDashboardData from '../lib/hooks/use-dashboard-data';

export function ConversionGoals() {
  const { summary, isLoading } = useDashboardData();

  if (isLoading) {
    return (
      <div className="animate-pulse bg-gray-200 rounded-lg h-96"></div>
    );
  }

  const conversionGoalsData = summary.getConversionGoals().map(goal => ({
    name: goal.name,
    conversions: goal.conversions,
  }));

  return (
    <div className="h-96">
      <BarList
        data={conversionGoalsData}
        index="name"
        categories={['conversions']}
        title="Conversion Goals"
      />
    </div>
  );
} 