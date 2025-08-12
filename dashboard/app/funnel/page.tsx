'use client';

/**
 * Funnel Analysis Page
 * Uses the funnel_analysis_enhanced pipe for single-query funnel analysis
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, Title, Text, Select, SelectItem, Grid, Button, TextInput, Badge, Metric, ProgressBar } from '@tremor/react';
import { PlusIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon, FunnelIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Example pre-defined funnels - updated to use regex instead of path_pattern
const EXAMPLE_FUNNELS = {
  ecommerce: {
    name: 'E-commerce Purchase',
    steps: [
      { path_exact: '/', name: 'Homepage', description: 'Landing on homepage' },
      { path_regex: '^/product', name: 'Product View', description: 'Viewing any product' },
      { path_exact: '/cart', name: 'Cart', description: 'Added to cart' },
      { path_exact: '/checkout', name: 'Checkout', description: 'Started checkout' },
      { path_exact: '/success', name: 'Purchase', description: 'Completed purchase' }
    ]
  },
  signup: {
    name: 'User Signup',
    steps: [
      { path_exact: '/', name: 'Homepage' },
      { path_exact: '/pricing', name: 'Pricing Page' },
      { path_exact: '/signup', name: 'Signup Form' },
      { path_exact: '/verify', name: 'Email Verification' },
      { path_exact: '/welcome', name: 'Welcome Page' }
    ]
  },
  saas: {
    name: 'SaaS Trial',
    steps: [
      { path_exact: '/', name: 'Homepage' },
      { path_regex: '^/features', name: 'Features' },
      { path_exact: '/trial', name: 'Start Trial' },
      { path_exact: '/onboarding', name: 'Onboarding' },
      { event_name: 'first_action', name: 'First Action' }
    ]
  },
  content: {
    name: 'Content Engagement',
    steps: [
      { path_regex: '^/blog', name: 'Blog Visit' },
      { event_name: 'article_read', name: 'Article Read' },
      { event_name: 'newsletter_signup', name: 'Newsletter Signup' },
      { path_exact: '/premium', name: 'Premium Content' }
    ]
  }
};

// Type for funnel step configuration
interface StepConfig {
  path_exact?: string;
  path_regex?: string;
  event_name?: string;
  name?: string;
  description?: string;
  // Optional filters
  country?: string;
  os?: string;
  browser?: string;
  platform?: string;
  utm_source?: string;
}

// Type for API response
interface FunnelStep {
  step: number;
  visitors: number;
}

// Calculate derived metrics on the frontend
function calculateFunnelMetrics(data: FunnelStep[]) {
  if (!data || data.length === 0) return [];
  
  const totalVisitors = data[0]?.visitors || 0;
  
  return data.map((step, index) => {
    const previousVisitors = index > 0 ? data[index - 1].visitors : step.visitors;
    const dropOff = previousVisitors > 0 ? ((previousVisitors - step.visitors) / previousVisitors) * 100 : 0;
    const conversionRate = totalVisitors > 0 ? (step.visitors / totalVisitors) * 100 : 0;
    
    return {
      ...step,
      dropOff: dropOff.toFixed(1),
      conversionRate: conversionRate.toFixed(1),
      previousVisitors
    };
  });
}

export default function FunnelPage() {
  // API configuration
  const apiKey = process.env.NEXT_PUBLIC_TINYBIRD_AUTH_TOKEN || '';
  const apiUrl = process.env.NEXT_PUBLIC_TINYBIRD_HOST || 'https://api.eu-west-1.aws.tinybird.co';

  // Date range state
  const [dateFrom, setDateFrom] = useState('2025-08-05');
  const [dateTo, setDateTo] = useState('2025-08-11');
  const [siteId, setSiteId] = useState('44990');

  // Funnel steps (max 4 as per the pipe)
  const [steps, setSteps] = useState<StepConfig[]>([]);
  
  // Results
  const [funnelData, setFunnelData] = useState<FunnelStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Visualization settings
  const [variant, setVariant] = useState<'funnel' | 'bar' | 'cards'>('funnel');

  // Selected example
  const [selectedExample, setSelectedExample] = useState('');

  // New step form
  const [newStep, setNewStep] = useState<StepConfig>({
    name: '',
    description: ''
  });
  const [stepType, setStepType] = useState('path_exact');
  const [stepValue, setStepValue] = useState('');

  // Load example funnel
  const loadExample = (exampleKey: string) => {
    const example = EXAMPLE_FUNNELS[exampleKey as keyof typeof EXAMPLE_FUNNELS];
    if (example) {
      setSteps(example.steps.slice(0, 4)); // Max 4 steps
      setSelectedExample(exampleKey);
    }
  };

  // Add new step
  const handleAddStep = () => {
    if (stepValue && steps.length < 4) {
      const step: StepConfig = {
        ...newStep,
        [stepType]: stepValue
      };
      setSteps([...steps, step]);
      setNewStep({ name: '', description: '' });
      setStepValue('');
    }
  };

  // Remove step
  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  // Move step
  const moveStep = (from: number, to: number) => {
    if (to < 0 || to >= steps.length) return;
    const newSteps = [...steps];
    const [removed] = newSteps.splice(from, 1);
    newSteps.splice(to, 0, removed);
    setSteps(newSteps);
  };

  // Build API parameters
  const buildApiParams = useCallback(() => {
    const params = new URLSearchParams();
    params.append('date_from', dateFrom);
    params.append('date_to', dateTo);
    if (siteId) params.append('site_id', siteId);

    // Add step parameters (1-indexed)
    steps.forEach((step, index) => {
      const stepNum = index + 1;
      if (step.path_exact) params.append(`step${stepNum}_path_exact`, step.path_exact);
      if (step.path_regex) params.append(`step${stepNum}_path_regex`, step.path_regex);
      if (step.event_name) params.append(`step${stepNum}_event_name`, step.event_name);
      if (step.country) params.append(`step${stepNum}_country`, step.country);
      if (step.os) params.append(`step${stepNum}_os`, step.os);
      if (step.browser) params.append(`step${stepNum}_browser`, step.browser);
      if (step.platform) params.append(`step${stepNum}_platform`, step.platform);
      if (step.utm_source) params.append(`step${stepNum}_utm_source`, step.utm_source);
    });

    return params;
  }, [dateFrom, dateTo, siteId, steps]);

  // Fetch funnel data
  const fetchFunnelData = useCallback(async () => {
    if (steps.length === 0 || !apiKey) return;

    setLoading(true);
    setError('');
   
    try {
      const params = buildApiParams();
      const response = await fetch(
        `${apiUrl}/v0/pipes/funnel_analysis_enhanced.json?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch funnel data');
      }

      const result = await response.json();
      setFunnelData(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Funnel fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [apiKey, apiUrl, buildApiParams, steps.length]);

  // Fetch data when steps or parameters change
  useEffect(() => {
    fetchFunnelData();
  }, [fetchFunnelData]);

  // Calculate metrics
  const metricsData = calculateFunnelMetrics(funnelData);

  // Prepare chart data
  const chartData = metricsData.map((item, index) => ({
    name: steps[index]?.name || `Step ${item.step}`,
    visitors: item.visitors,
    conversionRate: parseFloat(item.conversionRate)
  }));

  // Color scale for the funnel
  const colors = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f6', '#c084fc'];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-white">
      {/* Header */}
      <div>
        <Title>Funnel Analysis</Title>
        <Text className="mt-2">
          Analyze conversion funnels using the enhanced Tinybird pipe with optimized query performance.
        </Text>
      </div>

      {/* Configuration */}
      <Grid numItems={1} numItemsLg={2} className="gap-6">
        {/* Date Range & Settings */}
        <Card>
          <Title>Configuration</Title>
          
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateFrom(e.target.value)}
                  className="px-3 py-2 border rounded"
                />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateTo(e.target.value)}
                  className="px-3 py-2 border rounded"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Site ID (optional)</label>
              <TextInput
                value={siteId}
                onValueChange={(value: string) => setSiteId(value)}
                placeholder="e.g., 44990"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Visualization</label>
              <Select value={variant} onValueChange={(value: string) => setVariant(value as any)}>
                <SelectItem value="funnel">Funnel View</SelectItem>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="cards">Metrics Cards</SelectItem>
              </Select>
            </div>

            {!apiKey && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <Text className="text-yellow-800 text-sm">
                  Set NEXT_PUBLIC_TINYBIRD_AUTH_TOKEN in your environment
                </Text>
              </div>
            )}
          </div>
        </Card>

        {/* Funnel Builder */}
        <Card>
          <Title>Funnel Steps (Max 4)</Title>
          
          {/* Example Templates */}
          <div className="mt-4 mb-4">
            <label className="block text-sm font-medium mb-1">Load Example</label>
            <Select 
              value={selectedExample} 
              onValueChange={(value: string) => loadExample(value)}
              placeholder="Select an example funnel"
            >
              <SelectItem value="ecommerce">E-commerce Purchase</SelectItem>
              <SelectItem value="signup">User Signup</SelectItem>
              <SelectItem value="saas">SaaS Trial</SelectItem>
              <SelectItem value="content">Content Engagement</SelectItem>
            </Select>
          </div>

          {/* Current Steps */}
          <div className="space-y-2 mb-4">
            {steps.map((step, index) => {
              const stepDisplay = step.name || 
                step.path_exact || 
                step.path_regex || 
                step.event_name || 
                'Step ' + (index + 1);
              
              return (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <Badge>{index + 1}</Badge>
                  <span className="flex-1 text-sm">{stepDisplay}</span>
                  {step.description && (
                    <span className="text-xs text-gray-500">{step.description}</span>
                  )}
                  <button
                    onClick={() => moveStep(index, index - 1)}
                    disabled={index === 0}
                    className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                  >
                    <ArrowUpIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => moveStep(index, index + 1)}
                    disabled={index === steps.length - 1}
                    className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                  >
                    <ArrowDownIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => removeStep(index)}
                    className="p-1 hover:bg-red-100 rounded text-red-600"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Add New Step */}
          {steps.length < 4 && (
            <div className="border-t pt-4">
              <label className="block text-sm font-medium mb-2">Add Step</label>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Select 
                    value={stepType} 
                    onValueChange={(value: string) => setStepType(value)}
                  >
                    <SelectItem value="path_exact">Exact Path</SelectItem>
                    <SelectItem value="path_regex">Path Regex</SelectItem>
                    <SelectItem value="event_name">Event Name</SelectItem>
                  </Select>
                  <TextInput
                    value={stepValue}
                    onValueChange={(value: string) => setStepValue(value)}
                    placeholder="Value"
                  />
                </div>
                <TextInput
                  value={newStep.name || ''}
                  onValueChange={(value: string) => setNewStep({...newStep, name: value})}
                  placeholder="Step name (optional)"
                />
                <TextInput
                  value={newStep.description || ''}
                  onValueChange={(value: string) => setNewStep({...newStep, description: value})}
                  placeholder="Description (optional)"
                />
                <Button 
                  onClick={handleAddStep}
                  disabled={!stepValue}
                  icon={PlusIcon}
                >
                  Add Step
                </Button>
              </div>
            </div>
          )}
        </Card>
      </Grid>

      {/* Results */}
      {loading && (
        <Card>
          <div className="flex items-center justify-center py-8">
            <Text>Loading funnel data...</Text>
          </div>
        </Card>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <Text className="text-red-800">Error: {error}</Text>
        </Card>
      )}

      {!loading && !error && funnelData.length > 0 && (
        <>
          {/* Funnel Visualization */}
          {variant === 'funnel' && (
            <Card>
              <Title>Funnel Visualization</Title>
              <div className="mt-6 space-y-4">
                {metricsData.map((step, index) => {
                  const widthPercent = step.visitors > 0 && metricsData[0].visitors > 0
                    ? (step.visitors / metricsData[0].visitors) * 100
                    : 0;
                  
                  return (
                    <div key={index} className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <Text className="font-semibold">
                            {steps[index]?.name || `Step ${step.step}`}
                          </Text>
                          {steps[index]?.description && (
                            <Text className="text-xs text-gray-500">{steps[index].description}</Text>
                          )}
                        </div>
                        <div className="text-right">
                          <Metric>{step.visitors.toLocaleString()}</Metric>
                          <Text className="text-xs">
                            {step.conversionRate}% conversion
                            {index > 0 && ` • ${step.dropOff}% drop-off`}
                          </Text>
                        </div>
                      </div>
                      <div className="relative h-12 bg-gray-100 rounded overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 rounded transition-all duration-500"
                          style={{
                            width: `${widthPercent}%`,
                            backgroundColor: colors[index % colors.length]
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Bar Chart */}
          {variant === 'bar' && (
            <Card>
              <Title>Funnel Bar Chart</Title>
              <div className="mt-6" style={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="visitors">
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {/* Metrics Cards */}
          {variant === 'cards' && (
            <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-4">
              {metricsData.map((step, index) => (
                <Card key={index}>
                  <Text>{steps[index]?.name || `Step ${step.step}`}</Text>
                  <Metric className="mt-2">{step.visitors.toLocaleString()}</Metric>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between">
                      <Text className="text-xs">Conversion Rate</Text>
                      <Text className="text-xs font-semibold">{step.conversionRate}%</Text>
                    </div>
                    {index > 0 && (
                      <div className="flex justify-between">
                        <Text className="text-xs">Drop-off</Text>
                        <Text className="text-xs font-semibold">{step.dropOff}%</Text>
                      </div>
                    )}
                  </div>
                  <ProgressBar
                    value={parseFloat(step.conversionRate)}
                    className="mt-3"
                    color={index === 0 ? 'blue' : index === 1 ? 'violet' : index === 2 ? 'fuchsia' : 'purple'}
                  />
                </Card>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Documentation */}
      <Card>
        <Title>How It Works</Title>
        <div className="mt-4 space-y-4 text-sm">
          <div>
            <Text className="font-semibold">Enhanced Funnel Analysis:</Text>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
              <li>Single optimized query to Tinybird (reduced from 50,000+ to ~5,000 nodes)</li>
              <li>Supports up to 4 sequential steps</li>
              <li>Handles identical step criteria correctly</li>
              <li>Returns raw visitor counts - metrics calculated client-side</li>
              <li>Step 1 filters are applied at the source level for efficiency</li>
            </ul>
          </div>
          
          <div>
            <Text className="font-semibold">Path Matching Options:</Text>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
              <li><strong>Exact Path:</strong> Matches exact URL path (e.g., /checkout)</li>
              <li><strong>Path Regex:</strong> Regular expression matching (e.g., ^/product for paths starting with /product)</li>
              <li><strong>Event Name:</strong> Matches custom events (e.g., button_click)</li>
            </ul>
          </div>

          <div>
            <Text className="font-semibold">Regex Examples:</Text>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
              <li><code>^/pricing</code> - Starts with /pricing</li>
              <li><code>/checkout$</code> - Ends with /checkout</li>
              <li><code>product</code> - Contains "product"</li>
              <li><code>^/blog/[0-9]+$</code> - Blog post with numeric ID</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
} 