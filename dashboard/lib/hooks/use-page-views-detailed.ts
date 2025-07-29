import useSWR from 'swr';
import { queryPipe } from '../api';
import { AnalyticsFilter } from '../types/filters';
import { filtersToApiParams } from '../utils/filter-utils';

export interface DetailedPageView {
  timestamp: string;
  session_id: string;
  client_id: number;
  visitor_id: number;
  hostname: string;
  path: string;
  title: string;
  language: string;
  country_code: string;
  region: string;
  city: string;
  referrer: string;
  referrer_name: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  duration_seconds: number;
  device: string;
  browser: string;
  os: string;
  channel: string;
  tag_keys: string[];
  tag_values: string[];
}

export interface UsePageViewsDetailedOptions {
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  filters?: AnalyticsFilter;
}

export function usePageViewsDetailed({
  dateFrom,
  dateTo,
  limit = 100,
  filters = {},
}: UsePageViewsDetailedOptions = {}) {
  const params: Record<string, string> = {
    ...filtersToApiParams(filters),
    ...(dateFrom && { date_from: dateFrom }),
    ...(dateTo && { date_to: dateTo }),
    limit: limit.toString(),
  };

  const cacheKey = `page_views_detailed_${JSON.stringify(params)}`;

  const { data, error, mutate } = useSWR(
    cacheKey,
    () => queryPipe('page_views_detailed', params),
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      refreshInterval: 0, // Don't auto-refresh for detailed data
    }
  );

  return {
    data: data?.data as DetailedPageView[] | undefined,
    error,
    isLoading: !error && !data,
    mutate,
  };
}

// Example usage in a component:
/*
import { usePageViewsDetailed } from '../lib/hooks/use-page-views-detailed';

function DetailedAnalysis() {
  const { data: pageViews, isLoading } = usePageViewsDetailed({
    dateFrom: '2024-01-01',
    dateTo: '2024-01-31',
    limit: 50,
    filters: {
      path: ['/pricing'],
      device: ['mobile'],
    },
  });

  if (isLoading) return <div>Loading detailed data...</div>;

  return (
    <div>
      <h3>Individual Page Views</h3>
      {pageViews?.map((view, index) => (
        <div key={index} className="border p-4 mb-2">
          <p><strong>Path:</strong> {view.path}</p>
          <p><strong>Device:</strong> {view.device}</p>
          <p><strong>Duration:</strong> {view.duration_seconds}s</p>
          <p><strong>Location:</strong> {view.city}, {view.country_code}</p>
          <p><strong>Time:</strong> {new Date(view.timestamp).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
*/ 