import useSWR from 'swr';
import { queryPipe } from '../api';
import { FunnelConfig, FunnelResult, FunnelStepResult, FunnelStepConfig } from '../types/funnel';
import useDateFilter from './use-date-filter';

interface EnhancedFunnelApiResponse {
  step: number;
  visitors: number;
  relative_visitors: number;
  previous_visitors: number;
  relative_previous_visitors: number;
  dropped: number;
  drop_off: number;
  conversion_rate: number;
}

// Helper function to convert enhanced funnel config to API parameters
function buildEnhancedFunnelParams(
  config: FunnelConfig,
  dateFrom?: string,
  dateTo?: string
): Record<string, string> {
  const params: Record<string, string> = {};
  
  // Add date parameters
  if (dateFrom) params.date_from = dateFrom;
  if (dateTo) params.date_to = dateTo;
  
  // Process each step into parameters (up to 4 steps for now)
  config.steps.forEach((step, index) => {
    const stepNum = index + 1;
    
    // Skip if we exceed 4 steps (current limitation)
    if (stepNum > 4) return;
    
    // Path filtering
    if (step.path && step.path.length > 0) {
      params[`step${stepNum}_path_exact`] = step.path[0]; // Use first path for exact match
    }
    
    if (step.pathPattern && step.pathPattern.length > 0) {
      params[`step${stepNum}_path_pattern`] = step.pathPattern[0]; // Use first pattern
    }
    
    if (step.pathRegex && step.pathRegex.length > 0) {
      params[`step${stepNum}_path_regex`] = step.pathRegex[0]; // Use first regex
    }
    
    // Event filtering
    if (step.eventName && step.eventName.length > 0) {
      params[`step${stepNum}_event_name`] = step.eventName[0]; // Use first event
    }
    
    // Geographic filtering
    if (step.country && step.country.length > 0) {
      params[`step${stepNum}_country`] = step.country[0];
    }
    
    if (step.countryCode && step.countryCode.length > 0) {
      params[`step${stepNum}_country`] = step.countryCode[0];
    }
    
    if (step.region && step.region.length > 0) {
      params[`step${stepNum}_region`] = step.region[0];
    }
    
    if (step.language && step.language.length > 0) {
      params[`step${stepNum}_language`] = step.language[0];
    }
    
    // Technology filtering
    if (step.os && step.os.length > 0) {
      params[`step${stepNum}_os`] = step.os[0];
    }
    
    if (step.browser && step.browser.length > 0) {
      params[`step${stepNum}_browser`] = step.browser[0];
    }
    
    if (step.platform && step.platform.length > 0) {
      params[`step${stepNum}_platform`] = step.platform[0];
    }
    
    // Traffic source filtering
    if (step.utmSource && step.utmSource.length > 0) {
      params[`step${stepNum}_utm_source`] = step.utmSource[0];
    }
    
    if (step.utmMedium && step.utmMedium.length > 0) {
      params[`step${stepNum}_utm_medium`] = step.utmMedium[0];
    }
    
    if (step.referrerName && step.referrerName.length > 0) {
      params[`step${stepNum}_referrer_name`] = step.referrerName[0];
    }
  });
  
  return params;
}

// Fetch enhanced funnel data from API
async function getEnhancedFunnelData(
  config: FunnelConfig,
  dateFrom?: string,
  dateTo?: string
): Promise<FunnelResult> {
  const params = buildEnhancedFunnelParams(config, dateFrom, dateTo);
  
  const { data } = await queryPipe<EnhancedFunnelApiResponse>('funnel_analysis_enhanced', params);
  
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
  
  // Calculate enhanced metrics
  const totalVisitors = steps.length > 0 ? steps[0].visitors : 0;
  const finalStep = steps[steps.length - 1];
  const overallConversionRate = finalStep ? finalStep.conversionRate : 0;
  const completionRate = totalVisitors > 0 ? (finalStep?.visitors || 0) / totalVisitors : 0;
  
  return {
    funnelId: config.id,
    funnelName: config.name,
    totalVisitors,
    steps,
    overallConversionRate,
    dateRange: {
      from: dateFrom || '',
      to: dateTo || '',
    },
    
    // Enhanced result metadata
    totalSteps: steps.length,
    completionRate,
    avgTimeToComplete: undefined, // TODO: Calculate from step timing data
    processingTime: undefined, // TODO: Add performance tracking
  };
}

// Main hook for enhanced funnel data
export default function useEnhancedFunnel(config: FunnelConfig | null) {
  const { startDate, endDate } = useDateFilter();
  
  const { data, error, isValidating, mutate } = useSWR(
    config ? ['enhanced-funnel', config.id, startDate, endDate, JSON.stringify(config)] : null,
    () => config ? getEnhancedFunnelData(config, startDate, endDate) : null,
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

// Hook for multiple enhanced funnels - fetches all funnel data efficiently
export function useEnhancedFunnels(configs: FunnelConfig[]) {
  const { startDate, endDate } = useDateFilter();
  
  const { data, error, isValidating, mutate } = useSWR(
    configs.length > 0 ? ['enhanced-funnels', configs.map(c => c.id).join(','), startDate, endDate] : null,
    async () => {
      const results = await Promise.allSettled(
        configs.map(config => getEnhancedFunnelData(config, startDate, endDate))
      );
      
      return results.map((result, index) => ({
        config: configs[index],
        data: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason : null,
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

// Utility function to create step configuration with reference-style filtering
export function createFunnelStep(config: {
  name: string;
  description?: string;
  
  // Simple path matching
  path?: string | string[];
  pathPattern?: string | string[];
  pathRegex?: string | string[];
  
  // Event matching
  eventName?: string | string[];
  eventMeta?: Record<string, string>;
  
  // Geographic filtering
  country?: string | string[];
  region?: string | string[];
  city?: string | string[];
  language?: string | string[];
  
  // Technology filtering
  os?: string | string[];
  browser?: string | string[];
  platform?: string | string[];
  
  // Traffic source filtering
  utmSource?: string | string[];
  utmMedium?: string | string[];
  utmCampaign?: string | string[];
  
  // Custom filtering
  tags?: Record<string, string>;
  hostname?: string | string[];
  
  // Step behavior
  sequenceMode?: 'any' | 'ordered';
  timeWindow?: number;
}): FunnelStepConfig {
  return {
    name: config.name,
    description: config.description,
    
    // Normalize arrays
    path: Array.isArray(config.path) ? config.path : config.path ? [config.path] : undefined,
    pathPattern: Array.isArray(config.pathPattern) ? config.pathPattern : config.pathPattern ? [config.pathPattern] : undefined,
    pathRegex: Array.isArray(config.pathRegex) ? config.pathRegex : config.pathRegex ? [config.pathRegex] : undefined,
    
    eventName: Array.isArray(config.eventName) ? config.eventName : config.eventName ? [config.eventName] : undefined,
    eventMeta: config.eventMeta,
    
    country: Array.isArray(config.country) ? config.country : config.country ? [config.country] : undefined,
    region: Array.isArray(config.region) ? config.region : config.region ? [config.region] : undefined,
    city: Array.isArray(config.city) ? config.city : config.city ? [config.city] : undefined,
    language: Array.isArray(config.language) ? config.language : config.language ? [config.language] : undefined,
    
    os: Array.isArray(config.os) ? config.os : config.os ? [config.os] : undefined,
    browser: Array.isArray(config.browser) ? config.browser : config.browser ? [config.browser] : undefined,
    platform: Array.isArray(config.platform) ? config.platform : config.platform ? [config.platform] : undefined,
    
    utmSource: Array.isArray(config.utmSource) ? config.utmSource : config.utmSource ? [config.utmSource] : undefined,
    utmMedium: Array.isArray(config.utmMedium) ? config.utmMedium : config.utmMedium ? [config.utmMedium] : undefined,
    utmCampaign: Array.isArray(config.utmCampaign) ? config.utmCampaign : config.utmCampaign ? [config.utmCampaign] : undefined,
    
    tags: config.tags,
    hostname: Array.isArray(config.hostname) ? config.hostname : config.hostname ? [config.hostname] : undefined,
    
    sequenceMode: config.sequenceMode,
    timeWindow: config.timeWindow,
  };
}

// Example usage and reference-style funnel creation helpers
export const createReferenceStyleFunnel = {
  // Create a funnel matching the reference test case
  ecommerce: (): FunnelConfig => ({
    id: 'reference-ecommerce',
    name: 'Reference E-commerce Funnel',
    description: 'Matches reference implementation test case',
    sequenceMode: 'ordered',
    timeWindow: 24,
    steps: [
      createFunnelStep({
        name: 'Product Page View',
        description: 'User visits any product page',
        pathRegex: '(?i)^/product.*$', // Reference uses regex
        language: ['en', 'de']
      }),
      createFunnelStep({
        name: 'Add to Cart',
        description: 'User adds item to shopping cart',
        path: '/product',
        eventName: 'Add to Cart'
      }),
      createFunnelStep({
        name: 'Purchase',
        description: 'User completes purchase',
        eventName: 'Purchase',
        eventMeta: { amount: '89.90', currency: 'USD' },
        tags: { currency: 'USD' }
      })
    ]
  }),
  
  // Create a simple funnel for testing
  simple: (step1Path: string, step2Path: string): FunnelConfig => ({
    id: 'simple-funnel',
    name: 'Simple Two-Step Funnel',
    steps: [
      createFunnelStep({
        name: 'Step 1',
        path: step1Path
      }),
      createFunnelStep({
        name: 'Step 2', 
        path: step2Path
      })
    ]
  }),
  
  // Create funnel with regex patterns (reference style)
  regexPattern: (): FunnelConfig => ({
    id: 'regex-pattern-funnel',
    name: 'Regex Pattern Funnel',
    description: 'Uses ClickHouse regex patterns like reference implementation',
    steps: [
      createFunnelStep({
        name: 'Product Discovery',
        description: 'User visits any product page',
        pathRegex: '(?i)^/product/[^/]+$', // Matches /product/{anything}
        language: ['en']
      }),
      createFunnelStep({
        name: 'Engagement',
        description: 'User engages with product',
        eventName: 'Add to Cart',
        country: ['US']
      })
    ]
  })
}; 