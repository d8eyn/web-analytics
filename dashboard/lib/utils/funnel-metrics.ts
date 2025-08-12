/**
 * Funnel Metrics Calculator
 * Calculates derived metrics from basic step/visitor data
 */

export interface FunnelStep {
  step: number;
  visitors: number;
}

export interface FunnelMetrics extends FunnelStep {
  relative_visitors: number;      // % of initial visitors
  previous_visitors: number;       // Visitors from previous step
  relative_previous_visitors: number; // % vs previous step
  dropped: number;                 // Visitors lost from previous step
  drop_off: number;               // Drop-off rate from previous step
  conversion_rate: number;        // Overall conversion rate
}

/**
 * Calculate all derived funnel metrics from basic step data
 * @param steps Array of steps with visitor counts
 * @returns Array of steps with calculated metrics
 */
export function calculateFunnelMetrics(steps: FunnelStep[]): FunnelMetrics[] {
  if (!steps || steps.length === 0) {
    return [];
  }

  // Sort by step number to ensure correct order
  const sortedSteps = [...steps].sort((a, b) => a.step - b.step);
  const firstStepVisitors = sortedSteps[0]?.visitors || 0;

  return sortedSteps.map((step, index) => {
    const previousStep = index > 0 ? sortedSteps[index - 1] : null;
    const previousVisitors = previousStep?.visitors || 0;

    // Calculate derived metrics
    const metrics: FunnelMetrics = {
      ...step,
      
      // Percentage of initial visitors
      relative_visitors: firstStepVisitors > 0 
        ? Number((step.visitors / firstStepVisitors).toFixed(4))
        : 0,
      
      // Previous step visitors
      previous_visitors: previousVisitors,
      
      // Percentage vs previous step
      relative_previous_visitors: previousVisitors > 0 && index > 0
        ? Number((step.visitors / previousVisitors).toFixed(4))
        : index === 0 ? 1 : 0,
      
      // Absolute drop from previous step
      dropped: index > 0 
        ? previousVisitors - step.visitors
        : 0,
      
      // Drop-off rate from previous step
      drop_off: previousVisitors > 0 && index > 0
        ? Number((1 - (step.visitors / previousVisitors)).toFixed(4))
        : 0,
      
      // Overall conversion rate (same as relative_visitors)
      conversion_rate: firstStepVisitors > 0
        ? Number((step.visitors / firstStepVisitors).toFixed(4))
        : 0
    };

    return metrics;
  });
}

/**
 * Format percentage for display
 * @param value Decimal value (0.1234 = 12.34%)
 * @param decimals Number of decimal places
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format large numbers for display
 * @param value Number to format
 */
export function formatVisitorCount(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

/**
 * Calculate the biggest drop-off step
 * @param metrics Array of funnel metrics
 */
export function findBiggestDropOff(metrics: FunnelMetrics[]): {
  step: number;
  rate: number;
  absolute: number;
} | null {
  if (!metrics || metrics.length === 0) {
    return null;
  }

  let biggest = { step: 0, rate: 0, absolute: 0 };

  metrics.forEach(metric => {
    if (metric.drop_off > biggest.rate) {
      biggest = {
        step: metric.step,
        rate: metric.drop_off,
        absolute: metric.dropped
      };
    }
  });

  return biggest.rate > 0 ? biggest : null;
}

/**
 * Calculate average drop-off rate across all steps
 * @param metrics Array of funnel metrics
 */
export function calculateAverageDropOff(metrics: FunnelMetrics[]): number {
  const stepsWithDropOff = metrics.filter(m => m.step > 1);
  if (stepsWithDropOff.length === 0) return 0;

  const totalDropOff = stepsWithDropOff.reduce((sum, m) => sum + m.drop_off, 0);
  return Number((totalDropOff / stepsWithDropOff.length).toFixed(4));
}

/**
 * Example usage with React hook
 */
export function useFunnelMetrics(rawData: FunnelStep[]) {
  const metrics = calculateFunnelMetrics(rawData);
  
  return {
    metrics,
    summary: {
      totalVisitors: metrics[0]?.visitors || 0,
      finalConversion: metrics[metrics.length - 1]?.conversion_rate || 0,
      biggestDropOff: findBiggestDropOff(metrics),
      averageDropOff: calculateAverageDropOff(metrics)
    }
  };
} 