'use client';

/**
 * Modular Funnel Chart Component
 * Displays funnel analysis using the modular approach
 */

import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  Legend,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts';
import { Card, Title, Text, Flex, Badge, Grid, Metric } from '@tremor/react';
import { FunnelMetrics } from '../lib/services/modular-funnel';
import { 
  useModularFunnel, 
  UseModularFunnelOptions 
} from '../lib/hooks/use-modular-funnel';
import { ArrowDownIcon, ArrowRightIcon, UsersIcon } from '@heroicons/react/24/outline';

interface ModularFunnelChartProps {
  config: {
    dateFrom: string;
    dateTo: string;
    siteId?: string;
    steps: Array<{
      path_exact?: string;
      path_pattern?: string;
      path_regex?: string;
      path_prefix?: string;
      event_name?: string;
      name?: string; // Display name for the step
      description?: string; // Description for the step
    }>;
  };
  apiKey: string;
  apiUrl?: string;
  variant?: 'funnel' | 'bar' | 'cards';
  showDetails?: boolean;
  height?: number;
  colors?: string[];
  onStepClick?: (step: FunnelMetrics) => void;
}

/**
 * Color palette for funnel steps
 */
const DEFAULT_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
];

/**
 * Format percentage values
 */
function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

/**
 * Format large numbers
 */
function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

/**
 * Funnel visualization component
 */
function FunnelVisualization({ 
  data, 
  colors, 
  height = 400,
  onStepClick 
}: { 
  data: FunnelMetrics[];
  colors: string[];
  height?: number;
  onStepClick?: (step: FunnelMetrics) => void;
}) {
  const chartData = data.map((step, index) => ({
    name: `Step ${step.step}`,
    value: step.visitors,
    fill: colors[index % colors.length]
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <FunnelChart>
        <Tooltip 
          formatter={(value: number) => formatNumber(value)}
          contentStyle={{ 
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '6px'
          }}
        />
        <Funnel
          dataKey="value"
          data={chartData}
          isAnimationActive
          onClick={(data: any) => {
            const step = data.payload;
            const stepNumber = parseInt(step.name.split(' ')[1]);
            const metrics = data.find((d: FunnelMetrics) => d.step === stepNumber);
            if (metrics && onStepClick) {
              onStepClick(metrics);
            }
          }}
        >
          <LabelList position="center" fill="#fff" fontSize={14} />
        </Funnel>
      </FunnelChart>
    </ResponsiveContainer>
  );
}

/**
 * Bar chart visualization component
 */
function BarChartVisualization({ 
  data, 
  colors, 
  height = 400,
  onStepClick 
}: { 
  data: FunnelMetrics[];
  colors: string[];
  height?: number;
  onStepClick?: (step: FunnelMetrics) => void;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="step" 
          tickFormatter={(value) => `Step ${value}`}
        />
        <YAxis tickFormatter={formatNumber} />
        <Tooltip 
          formatter={(value: number) => formatNumber(value)}
          labelFormatter={(label) => `Step ${label}`}
          contentStyle={{ 
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '6px'
          }}
        />
        <Bar 
          dataKey="visitors" 
          onClick={(data: any) => onStepClick && onStepClick(data)}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/**
 * Cards visualization component
 */
function CardsVisualization({ 
  data, 
  steps,
  colors,
  onStepClick 
}: { 
  data: FunnelMetrics[];
  steps: any[];
  colors: string[];
  onStepClick?: (step: FunnelMetrics) => void;
}) {
  return (
    <div className="space-y-4">
      {data.map((metric, index) => {
        const step = steps[index] || {};
        const color = colors[index % colors.length];
        
        return (
          <Card 
            key={metric.step}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onStepClick && onStepClick(metric)}
          >
            <Flex justifyContent="between" alignItems="start">
              <div className="flex-1">
                <Flex justifyContent="start" alignItems="center" className="gap-2 mb-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <Title>Step {metric.step}: {step.name || step.path_exact || step.path_pattern || step.event_name || 'Unknown'}</Title>
                </Flex>
                
                {step.description && (
                  <Text className="mb-3">{step.description}</Text>
                )}
                
                <Grid numItems={2} numItemsSm={4} className="gap-4 mt-4">
                  <div>
                    <Text>Visitors</Text>
                    <Metric>{formatNumber(metric.visitors)}</Metric>
                  </div>
                  <div>
                    <Text>Conversion Rate</Text>
                    <Metric>{formatPercentage(metric.conversion_rate)}</Metric>
                  </div>
                  <div>
                    <Text>Drop-off</Text>
                    <Metric className="text-red-600">
                      {metric.drop_off > 0 ? formatPercentage(metric.drop_off) : '-'}
                    </Metric>
                  </div>
                  <div>
                    <Text>Dropped</Text>
                    <Metric className="text-red-600">
                      {metric.dropped > 0 ? formatNumber(metric.dropped) : '-'}
                    </Metric>
                  </div>
                </Grid>
              </div>
              
              {index < data.length - 1 && (
                <ArrowDownIcon className="h-8 w-8 text-gray-400 ml-4" />
              )}
            </Flex>
          </Card>
        );
      })}
    </div>
  );
}

/**
 * Main Modular Funnel Chart Component
 */
export default function ModularFunnelChart({
  config,
  apiKey,
  apiUrl,
  variant = 'funnel',
  showDetails = true,
  height = 400,
  colors = DEFAULT_COLORS,
  onStepClick
}: ModularFunnelChartProps) {
  const options: UseModularFunnelOptions = {
    apiKey,
    apiUrl,
    cacheTimeout: 60000, // 1 minute cache
    onError: (error) => {
      console.error('Funnel analysis error:', error);
    }
  };

  const { data, loading, error, refetch } = useModularFunnel(config, options);

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        totalVisitors: 0,
        finalConversion: 0,
        biggestDropOff: { step: 0, rate: 0 },
        averageDropOff: 0
      };
    }

    const totalVisitors = data[0]?.visitors || 0;
    const finalConversion = data[data.length - 1]?.conversion_rate || 0;
    
    let biggestDropOff = { step: 0, rate: 0 };
    let totalDropOff = 0;
    let dropOffCount = 0;

    data.forEach((metric) => {
      if (metric.drop_off > biggestDropOff.rate) {
        biggestDropOff = { step: metric.step, rate: metric.drop_off };
      }
      if (metric.drop_off > 0) {
        totalDropOff += metric.drop_off;
        dropOffCount++;
      }
    });

    return {
      totalVisitors,
      finalConversion,
      biggestDropOff,
      averageDropOff: dropOffCount > 0 ? totalDropOff / dropOffCount : 0
    };
  }, [data]);

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-8">
          <Text className="text-red-600 mb-4">Error loading funnel data</Text>
          <Text className="text-gray-600 mb-4">{error.message}</Text>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <Text className="text-center py-8 text-gray-600">
          No funnel data available for the selected period
        </Text>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Metrics */}
      {showDetails && (
        <Grid numItems={2} numItemsSm={4} className="gap-4">
          <Card>
            <Flex alignItems="center" className="gap-2">
              <UsersIcon className="h-5 w-5 text-blue-600" />
              <Text>Total Visitors</Text>
            </Flex>
            <Metric className="mt-2">{formatNumber(summaryMetrics.totalVisitors)}</Metric>
          </Card>
          
          <Card>
            <Text>Final Conversion</Text>
            <Metric className="mt-2">{formatPercentage(summaryMetrics.finalConversion)}</Metric>
          </Card>
          
          <Card>
            <Text>Biggest Drop-off</Text>
            <Metric className="mt-2 text-red-600">
              {summaryMetrics.biggestDropOff.rate > 0 
                ? `Step ${summaryMetrics.biggestDropOff.step}: ${formatPercentage(summaryMetrics.biggestDropOff.rate)}`
                : 'N/A'}
            </Metric>
          </Card>
          
          <Card>
            <Text>Average Drop-off</Text>
            <Metric className="mt-2">
              {formatPercentage(summaryMetrics.averageDropOff)}
            </Metric>
          </Card>
        </Grid>
      )}

      {/* Funnel Visualization */}
      <Card>
        <Title className="mb-4">Funnel Analysis</Title>
        
        {variant === 'funnel' && (
          <FunnelVisualization 
            data={data} 
            colors={colors} 
            height={height}
            onStepClick={onStepClick}
          />
        )}
        
        {variant === 'bar' && (
          <BarChartVisualization 
            data={data} 
            colors={colors} 
            height={height}
            onStepClick={onStepClick}
          />
        )}
        
        {variant === 'cards' && (
          <CardsVisualization 
            data={data} 
            steps={config.steps}
            colors={colors}
            onStepClick={onStepClick}
          />
        )}
      </Card>

      {/* Detailed Metrics Table */}
      {showDetails && variant !== 'cards' && (
        <Card>
          <Title className="mb-4">Detailed Metrics</Title>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Step</th>
                  <th className="text-right py-2">Visitors</th>
                  <th className="text-right py-2">Conversion</th>
                  <th className="text-right py-2">Drop-off</th>
                  <th className="text-right py-2">Dropped</th>
                  <th className="text-right py-2">From Previous</th>
                </tr>
              </thead>
              <tbody>
                {data.map((metric, index) => {
                  const step = config.steps[index] || {};
                  return (
                    <tr 
                      key={metric.step} 
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => onStepClick && onStepClick(metric)}
                    >
                      <td className="py-2">
                        <Flex alignItems="center" className="gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: colors[index % colors.length] }}
                          />
                          <span className="font-medium">Step {metric.step}</span>
                          {step.name && (
                            <Badge color="gray">{step.name}</Badge>
                          )}
                        </Flex>
                      </td>
                      <td className="text-right py-2">{formatNumber(metric.visitors)}</td>
                      <td className="text-right py-2">{formatPercentage(metric.conversion_rate)}</td>
                      <td className="text-right py-2 text-red-600">
                        {metric.drop_off > 0 ? formatPercentage(metric.drop_off) : '-'}
                      </td>
                      <td className="text-right py-2 text-red-600">
                        {metric.dropped > 0 ? formatNumber(metric.dropped) : '-'}
                      </td>
                      <td className="text-right py-2">
                        {metric.relative_previous_visitors > 0 
                          ? formatPercentage(metric.relative_previous_visitors) 
                          : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
} 