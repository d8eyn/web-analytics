/**
 * React hook for modular funnel analysis
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ModularFunnelAnalyzer, 
  FunnelConfig, 
  FunnelMetrics,
  StepFilter,
  convertLegacyParams
} from '../services/modular-funnel';

export interface UseModularFunnelOptions {
  apiKey: string;
  apiUrl?: string;
  autoFetch?: boolean;
  cacheTimeout?: number;
  onError?: (error: Error) => void;
}

export interface UseModularFunnelResult {
  data: FunnelMetrics[] | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  updateConfig: (config: FunnelConfig) => void;
  clearCache: () => void;
}

/**
 * Hook for fetching and managing modular funnel data
 */
export function useModularFunnel(
  initialConfig: FunnelConfig,
  options: UseModularFunnelOptions
): UseModularFunnelResult {
  const [data, setData] = useState<FunnelMetrics[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [config, setConfig] = useState(initialConfig);

  const analyzerRef = useRef<ModularFunnelAnalyzer | null>(null);

  // Initialize analyzer
  useEffect(() => {
    analyzerRef.current = new ModularFunnelAnalyzer(options.apiKey, options.apiUrl);
    
    if (options.cacheTimeout) {
      analyzerRef.current.setCacheTimeout(options.cacheTimeout);
    }

    return () => {
      // Cleanup if needed
      analyzerRef.current = null;
    };
  }, [options.apiKey, options.apiUrl, options.cacheTimeout]);

  // Fetch funnel data
  const fetchData = useCallback(async () => {
    if (!analyzerRef.current) return;
    
    setLoading(true);
    setError(null);

    try {
      const results = await analyzerRef.current.analyzeFunnel(config);
      setData(results);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      
      if (options.onError) {
        options.onError(error);
      }
    } finally {
      setLoading(false);
    }
  }, [config, options]);

  // Auto-fetch on config change if enabled
  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchData();
    }
  }, [config, fetchData, options.autoFetch]);

  // Update configuration
  const updateConfig = useCallback((newConfig: FunnelConfig) => {
    setConfig(newConfig);
  }, []);

  // Clear cache
  const clearCache = useCallback(() => {
    if (analyzerRef.current) {
      analyzerRef.current.clearCache();
    }
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    updateConfig,
    clearCache
  };
}

/**
 * Hook for converting legacy funnel parameters to modular format
 */
export function useLegacyFunnelAdapter(
  legacyParams: Record<string, any>,
  options: UseModularFunnelOptions
): UseModularFunnelResult {
  const config = convertLegacyParams(legacyParams);
  return useModularFunnel(config, options);
}

/**
 * Hook for building funnel configurations dynamically
 */
export function useFunnelBuilder() {
  const [steps, setSteps] = useState<StepFilter[]>([]);

  const addStep = useCallback((step: StepFilter) => {
    setSteps(prev => [...prev, step]);
  }, []);

  const updateStep = useCallback((index: number, step: StepFilter) => {
    setSteps(prev => {
      const newSteps = [...prev];
      newSteps[index] = step;
      return newSteps;
    });
  }, []);

  const removeStep = useCallback((index: number) => {
    setSteps(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearSteps = useCallback(() => {
    setSteps([]);
  }, []);

  const moveStep = useCallback((fromIndex: number, toIndex: number) => {
    setSteps(prev => {
      const newSteps = [...prev];
      const [removed] = newSteps.splice(fromIndex, 1);
      newSteps.splice(toIndex, 0, removed);
      return newSteps;
    });
  }, []);

  return {
    steps,
    addStep,
    updateStep,
    removeStep,
    clearSteps,
    moveStep
  };
}

/**
 * Hook for polling funnel data at intervals
 */
export function usePollingFunnel(
  config: FunnelConfig,
  options: UseModularFunnelOptions & { pollingInterval?: number }
): UseModularFunnelResult {
  const result = useModularFunnel(config, { ...options, autoFetch: false });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initial fetch
    result.refetch();

    // Set up polling if interval is provided
    if (options.pollingInterval && options.pollingInterval > 0) {
      intervalRef.current = setInterval(() => {
        result.refetch();
      }, options.pollingInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [config, options.pollingInterval]);

  return result;
} 