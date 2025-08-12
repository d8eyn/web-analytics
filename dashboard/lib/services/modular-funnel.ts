/**
 * Modular Funnel Analysis Service
 * Breaks down complex funnel analysis into multiple simple API calls
 * to avoid Tinybird's query tree limitations
 */

export interface StepFilter {
  path_exact?: string;
  path_pattern?: string;
  path_regex?: string;
  path_prefix?: string;
  event_name?: string;
  country?: string;
  region?: string;
  city?: string;
  language?: string;
  os?: string;
  browser?: string;
  device?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer_name?: string;
  name?: string; // Display name for the step
  description?: string; // Description for the step
}

export interface FunnelConfig {
  dateFrom: string;
  dateTo: string;
  siteId?: string;
  steps: StepFilter[];
}

export interface StepResult {
  visitor_id: string;
  first_occurrence: string;
}

export interface FunnelMetrics {
  step: number;
  visitors: number;
  visitor_ids?: string[];
  relative_visitors: number;
  previous_visitors: number;
  relative_previous_visitors: number;
  dropped: number;
  drop_off: number;
  conversion_rate: number;
}

export class ModularFunnelAnalyzer {
  private apiKey: string;
  private baseUrl: string;
  private cache: Map<string, { data: StepResult[]; timestamp: number }>;
  private cacheTimeout: number = 60000; // 1 minute cache

  constructor(apiKey: string, baseUrl: string = '') {
    this.apiKey = apiKey;
    // Use the API URL from environment or default
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_TINYBIRD_API_URL || 'https://api.eu-west-1.aws.tinybird.co/v0';
    this.cache = new Map();
  }

  /**
   * Generate a cache key for a step configuration
   */
  private getCacheKey(stepConfig: any): string {
    return JSON.stringify(stepConfig);
  }

  /**
   * Check if cached data is still valid
   */
  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.cacheTimeout;
  }

  /**
   * Fetch data for a single funnel step
   */
  async fetchStep(
    stepConfig: StepFilter,
    dateFrom: string,
    dateTo: string,
    siteId?: string
  ): Promise<StepResult[]> {
    const fullConfig = {
      date_from: dateFrom,
      date_to: dateTo,
      site_id: siteId,
      ...stepConfig
    };

    // Check cache
    const cacheKey = this.getCacheKey(fullConfig);
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    // Build query parameters
    const params = new URLSearchParams();
    params.append('token', "p.eyJ1IjogIjM2NzI3MGY0LTNhZDItNGU5MC1iYmVlLTFhNmRlZTMxZmRjNyIsICJpZCI6ICJiZjAyZjFmZC0xNDkxLTRhNmItOTFiNy1hMGJmYjRmMDdkZDEiLCAiaG9zdCI6ICJhd3MtZXUtd2VzdC0xIn0.xWsNER60za9k_v7tI_UqKJ-pjzj3x8bUbm8glv56w2k");
    params.append('date_from', dateFrom);
    params.append('date_to', dateTo);
    params.append('limit', '100000');
    
    if (siteId) {
      params.append('site_id', siteId);
    }

    // Add step-specific filters
    Object.entries(stepConfig).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value);
      }
    });

    try {
      const response = await fetch(
        `https://api.eu-west-1.aws.tinybird.co/v0/pipes/funnel_step_processor.json?${params}`,
        {
          headers: {
            'Accept': 'application/json',
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Funnel step fetch error:', errorText);
        throw new Error(`Failed to fetch funnel step: ${response.status}`);
      }

      const data = await response.json();
      const results = data.data || [];

      // Cache the results
      this.cache.set(cacheKey, {
        data: results,
        timestamp: Date.now()
      });

      return results;
    } catch (error) {
      console.error('Error fetching funnel step:', error);
      throw error;
    }
  }

  /**
   * Analyze complete funnel by combining individual step results
   */
  async analyzeFunnel(config: FunnelConfig): Promise<FunnelMetrics[]> {
    const { steps, dateFrom, dateTo, siteId } = config;
    
    if (!steps || steps.length === 0) {
      return [];
    }

    // Fetch all steps in parallel for better performance
    const promises = steps.map(step => 
      this.fetchStep(step, dateFrom, dateTo, siteId)
    );

    let allResults: StepResult[][];
    try {
      allResults = await Promise.all(promises);
    } catch (error) {
      console.error('Error fetching funnel steps:', error);
      throw error;
    }

    // Process results sequentially to validate funnel progression
    const stepMetrics: FunnelMetrics[] = [];
    let previousVisitors = new Map<string, string>();

    for (let i = 0; i < allResults.length; i++) {
      const currentStep = allResults[i];
      
      // Create a map for fast lookups
      const visitorMap = new Map<string, string>(
        currentStep.map(v => [v.visitor_id, v.first_occurrence])
      );

      let qualifiedVisitors: Map<string, string>;

      if (i === 0) {
        // First step: all visitors qualify
        qualifiedVisitors = visitorMap;
      } else {
        // Subsequent steps: filter by previous step completion and sequential ordering
        qualifiedVisitors = new Map();
        
        Array.from(visitorMap.entries()).forEach(([visitorId, timestamp]) => {
          const prevTimestamp = previousVisitors.get(visitorId);
          if (prevTimestamp && timestamp >= prevTimestamp) {
            qualifiedVisitors.set(visitorId, timestamp);
          }
        });
      }

      // Calculate metrics
      const metrics: FunnelMetrics = {
        step: i + 1,
        visitors: qualifiedVisitors.size,
        relative_visitors: 0,
        previous_visitors: 0,
        relative_previous_visitors: 0,
        dropped: 0,
        drop_off: 0,
        conversion_rate: 0
      };

      // Include visitor IDs for first 1000 visitors (to avoid huge payloads)
      if (qualifiedVisitors.size <= 1000) {
        metrics.visitor_ids = Array.from(qualifiedVisitors.keys());
      }

      // Calculate relative metrics
      if (i > 0) {
        metrics.previous_visitors = previousVisitors.size;
        metrics.dropped = previousVisitors.size - metrics.visitors;
        metrics.drop_off = previousVisitors.size > 0 
          ? Number((1 - (metrics.visitors / previousVisitors.size)).toFixed(4))
          : 0;
        metrics.relative_previous_visitors = previousVisitors.size > 0
          ? Number((metrics.visitors / previousVisitors.size).toFixed(4))
          : 0;
      } else {
        metrics.previous_visitors = 0;
        metrics.relative_previous_visitors = 1;
      }

      // Calculate conversion rate relative to first step
      if (stepMetrics.length > 0) {
        const firstStepVisitors = stepMetrics[0].visitors;
        metrics.conversion_rate = firstStepVisitors > 0
          ? Number((metrics.visitors / firstStepVisitors).toFixed(4))
          : 0;
        metrics.relative_visitors = metrics.conversion_rate;
      } else {
        metrics.conversion_rate = 1;
        metrics.relative_visitors = 1;
      }

      stepMetrics.push(metrics);
      previousVisitors = qualifiedVisitors;
    }

    return stepMetrics;
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Set cache timeout
   */
  setCacheTimeout(timeout: number): void {
    this.cacheTimeout = timeout;
  }
}

/**
 * Helper function to create standard funnel configurations
 */
export function createFunnelConfig(
  dateFrom: string,
  dateTo: string,
  siteId?: string,
  steps?: StepFilter[]
): FunnelConfig {
  return {
    dateFrom,
    dateTo,
    siteId,
    steps: steps || [
      { path_exact: '/' },
      { path_pattern: '/pricing%' },
      { path_exact: '/checkout' },
      { path_exact: '/success' }
    ]
  };
}

/**
 * Convert legacy funnel parameters to modular format
 */
export function convertLegacyParams(params: Record<string, any>): FunnelConfig {
  const steps: StepFilter[] = [];

  // Extract steps from legacy parameters
  for (let i = 1; i <= 8; i++) {
    const step: StepFilter = {};
    let hasStep = false;

    // Path filters
    if (params[`step${i}_path_exact`]) {
      step.path_exact = params[`step${i}_path_exact`];
      hasStep = true;
    }
    if (params[`step${i}_path_pattern`]) {
      step.path_pattern = params[`step${i}_path_pattern`];
      hasStep = true;
    }
    if (params[`step${i}_path_regex`]) {
      step.path_regex = params[`step${i}_path_regex`];
      hasStep = true;
    }
    if (params[`step${i}_event_name`]) {
      step.event_name = params[`step${i}_event_name`];
      hasStep = true;
    }

    // Geographic filters
    if (params[`step${i}_country`]) {
      step.country = params[`step${i}_country`];
    }
    if (params[`step${i}_region`]) {
      step.region = params[`step${i}_region`];
    }
    if (params[`step${i}_city`]) {
      step.city = params[`step${i}_city`];
    }
    if (params[`step${i}_language`]) {
      step.language = params[`step${i}_language`];
    }

    // Technology filters
    if (params[`step${i}_os`]) {
      step.os = params[`step${i}_os`];
    }
    if (params[`step${i}_browser`]) {
      step.browser = params[`step${i}_browser`];
    }
    if (params[`step${i}_platform`]) {
      step.device = params[`step${i}_platform`];
    }

    // UTM filters
    if (params[`step${i}_utm_source`]) {
      step.utm_source = params[`step${i}_utm_source`];
    }
    if (params[`step${i}_utm_medium`]) {
      step.utm_medium = params[`step${i}_utm_medium`];
    }
    if (params[`step${i}_utm_campaign`]) {
      step.utm_campaign = params[`step${i}_utm_campaign`];
    }
    if (params[`step${i}_referrer_name`]) {
      step.referrer_name = params[`step${i}_referrer_name`];
    }

    if (hasStep) {
      steps.push(step);
    } else {
      break; // No more steps defined
    }
  }

  return {
    dateFrom: params.date_from || params.dateFrom,
    dateTo: params.date_to || params.dateTo,
    siteId: params.site_id || params.siteId,
    steps
  };
} 