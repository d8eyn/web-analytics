import useSWR from 'swr';
import { queryPipe } from '../api';
import { FunnelConfig, FunnelResult, FunnelStepResult } from '../types/funnel';
import useDateFilter from './use-date-filter';

interface FunnelApiResponse {
  step: number;
  visitors: number;
  relative_visitors: number;
  previous_visitors: number;
  relative_previous_visitors: number;
  dropped: number;
  drop_off: number;
  conversion_rate: number;
}

// Helper function to convert funnel config to API parameters
function buildFunnelParams(config: FunnelConfig, dateFrom?: string, dateTo?: string) {
  const params: Record<string, string> = {};
  
  // Add date parameters
  if (dateFrom) params.date_from = dateFrom;
  if (dateTo) params.date_to = dateTo;
  
  // Initialize all step parameters with empty defaults (supports 2-4 steps)
  for (let i = 1; i <= 4; i++) {
    params[`step${i}_path_pattern`] = '';
    params[`step${i}_path_exact`] = '';
    params[`step${i}_event_name`] = '';
  }
  
  // Add step parameters (support up to 4 steps)
  config.steps.forEach((step, index) => {
    const stepNum = index + 1;
    
    // Skip if we exceed 4 steps
    if (stepNum > 4) return;
    
    if (step.pathPattern) {
      params[`step${stepNum}_path_pattern`] = Array.isArray(step.pathPattern) 
        ? step.pathPattern.join(',') 
        : step.pathPattern;
    }
    
    if (step.path) {
      params[`step${stepNum}_path_exact`] = Array.isArray(step.path) 
        ? step.path.join(',') 
        : step.path;
    }
    
    if (step.eventName) {
      params[`step${stepNum}_event_name`] = Array.isArray(step.eventName) 
        ? step.eventName.join(',') 
        : step.eventName;
    }
    
    // Add event metadata if specified
    if (step.eventMeta) {
      const firstMetaKey = Object.keys(step.eventMeta)[0];
      if (firstMetaKey) {
        params[`step${stepNum}_event_meta_key`] = firstMetaKey;
        params[`step${stepNum}_event_meta_value`] = step.eventMeta[firstMetaKey];
      }
    }
    
    // Add UTM parameters if specified
    if (step.utmSource && step.utmSource.length > 0) {
      params[`step${stepNum}_utm_source`] = step.utmSource.join(',');
    }
    
    if (step.utmMedium && step.utmMedium.length > 0) {
      params[`step${stepNum}_utm_medium`] = step.utmMedium.join(',');
    }
    
    if (step.utmCampaign && step.utmCampaign.length > 0) {
      params[`step${stepNum}_utm_campaign`] = step.utmCampaign.join(',');
    }
    
    // Add tags if specified
    if (step.tags) {
      const firstTagKey = Object.keys(step.tags)[0];
      if (firstTagKey) {
        params[`step${stepNum}_tag_key`] = firstTagKey;
        params[`step${stepNum}_tag_value`] = step.tags[firstTagKey];
      }
    }
  });
  
  return params;
}

// Fetch funnel data from API
async function getFunnelData(
  config: FunnelConfig,
  dateFrom?: string,
  dateTo?: string
): Promise<FunnelResult> {
  const params = buildFunnelParams(config, dateFrom, dateTo);
  
  const { data } = await queryPipe<FunnelApiResponse>('funnel_analysis', params);
  
  // Process API response into our FunnelResult format
  const steps: FunnelStepResult[] = data.map((apiStep, index) => ({
    step: apiStep.step,
    name: config.steps[index]?.name || `Step ${apiStep.step}`,
    visitors: apiStep.visitors,
    relativeVisitors: apiStep.relative_visitors,
    previousVisitors: apiStep.previous_visitors,
    relativePreviousVisitors: apiStep.relative_previous_visitors,
    dropped: apiStep.dropped,
    dropOff: apiStep.drop_off,
    conversionRate: apiStep.conversion_rate,
  }));
  
  // Calculate overall metrics
  const totalVisitors = steps.length > 0 ? steps[0].visitors : 0;
  const finalStep = steps[steps.length - 1];
  const overallConversionRate = finalStep ? finalStep.conversionRate : 0;
  const completionRate = finalStep && totalVisitors > 0 
    ? (finalStep.visitors / totalVisitors) * 100 
    : 0;
  
  return {
    funnelId: config.id,
    funnelName: config.name,
    totalVisitors,
    steps,
    overallConversionRate,
    totalSteps: steps.length,
    completionRate,
    dateRange: {
      from: dateFrom || '',
      to: dateTo || '',
    },
  };
}

// Main hook for funnel data
export default function useFunnel(config: FunnelConfig | null) {
  const { startDate, endDate } = useDateFilter();
  
  const { data, error, isValidating, mutate } = useSWR(
    config ? ['funnel', config.id, startDate, endDate] : null,
    () => config ? getFunnelData(config, startDate, endDate) : null,
    {
      revalidateOnFocus: false,
      refreshInterval: 120_000, // 2 minutes
      dedupingInterval: 0,
    }
  );
  
  return {
    data: data || null,
    error,
    isLoading: isValidating,
    mutate,
  };
}

// Hook for multiple funnels - fetches all funnel data in a single request
export function useFunnels(configs: FunnelConfig[]) {
  const { startDate, endDate } = useDateFilter();
  
  const { data, error, isValidating, mutate } = useSWR(
    configs.length > 0 ? ['funnels', configs.map(c => c.id).join(','), startDate, endDate] : null,
    async () => {
      const results = await Promise.all(
        configs.map(config => getFunnelData(config, startDate, endDate))
      );
      return results.map((data, index) => ({
        config: configs[index],
        data,
        error: null,
        isLoading: false,
      }));
    },
    {
      revalidateOnFocus: false,
      refreshInterval: 120_000,
      dedupingInterval: 0,
    }
  );
  
  return {
    funnels: data || [],
    isLoading: isValidating,
    hasError: !!error,
    mutate,
  };
} 