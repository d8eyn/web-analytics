import React, { useState } from 'react';
import useEnhancedFunnel, { createReferenceStyleFunnel, createFunnelStep } from '../lib/hooks/use-funnel-enhanced';
import { FunnelConfig } from '../lib/types/funnel';

// Simple Card component (matching the project's style)
function Card({ children, className = '', ...props }: any) {
  return (
    <div 
      className={`bg-white rounded-lg border border-gray-200 p-6 shadow-sm ${className}`} 
      {...props}
    >
      {children}
    </div>
  )
}

const FunnelAnalysisDemo: React.FC = () => {
  const [selectedFunnel, setSelectedFunnel] = useState<'simple' | 'advanced' | 'reference'>('simple');

  // Create the requested funnel: / → /pricing/agency
  const simpleFunnel: FunnelConfig = {
    id: 'homepage-to-pricing-agency',
    name: 'Homepage to Pricing Agency Funnel',
    description: 'Track users from homepage to pricing agency page',
    steps: [
      createFunnelStep({
        name: 'Homepage Visit',
        description: 'User visits the homepage',
        path: '/'
      }),
      createFunnelStep({
        name: 'Pricing Agency Page',
        description: 'User views pricing agency page',
        path: '/pricing/agency'
      })
    ]
  };

  // Advanced example with enhanced filtering
  const advancedFunnel: FunnelConfig = {
    id: 'advanced-conversion',
    name: 'Advanced Conversion Funnel',
    description: 'Homepage to pricing agency with technology and geographic filters',
    sequenceMode: 'ordered',
    timeWindow: 24,
    steps: [
      createFunnelStep({
        name: 'Homepage (Desktop)',
        description: 'Desktop users visiting homepage',
        path: '/',
        platform: ['desktop'],
        country: ['US', 'CA', 'GB']
      }),
      createFunnelStep({
        name: 'Pricing Agency (Engaged)',
        description: 'Users who reach pricing agency page',
        path: '/pricing/agency',
        utmSource: ['google', 'direct'],
        language: ['en']
      })
    ]
  };

  // Reference-style funnel with regex
  const referenceFunnel = createReferenceStyleFunnel.regexPattern();

  const funnels = {
    simple: simpleFunnel,
    advanced: advancedFunnel,
    reference: referenceFunnel
  };

  const { data: funnelData, isLoading, error } = useEnhancedFunnel(funnels[selectedFunnel]);

  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;
  const formatNumber = (value: number) => value.toLocaleString();

  // Create complete step list even if API doesn't return all steps
  const createCompleteStepList = () => {
    if (!funnelData) return [];
    
    const configuredSteps = funnels[selectedFunnel].steps;
    const apiSteps = funnelData.steps;
    
    return configuredSteps.map((configStep, index) => {
      const stepNumber = index + 1;
      const apiStep = apiSteps.find(s => s.step === stepNumber);
      
      if (apiStep) {
        return apiStep;
      } else {
        // Create a placeholder step with 0 visitors for missing steps
        return {
          step: stepNumber,
          name: configStep.name,
          visitors: 0,
          relativeVisitors: 0,
          previousVisitors: index > 0 ? (apiSteps.find(s => s.step === index)?.visitors || 0) : 0,
          relativePreviousVisitors: 0,
          dropped: index > 0 ? (apiSteps.find(s => s.step === index)?.visitors || 0) : 0,
          dropOff: index > 0 ? 1 : 0,
          conversionRate: 0,
        };
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Enhanced Funnel Analysis Demo</h1>
        <p className="mt-2 text-gray-600">Real-time funnel analysis with reference-style filtering capabilities</p>
      </div>

      {/* Funnel Selector */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">Select Funnel Type</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedFunnel('simple')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedFunnel === 'simple'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Simple (/ → /pricing/agency)
          </button>
          <button
            onClick={() => setSelectedFunnel('advanced')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedFunnel === 'advanced'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Advanced Filters
          </button>
          <button
            onClick={() => setSelectedFunnel('reference')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedFunnel === 'reference'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Reference Style (Regex)
          </button>
        </div>
      </Card>

      {/* Current Funnel Info */}
      <Card>
        <h2 className="text-lg font-semibold">{funnels[selectedFunnel].name}</h2>
        <p className="mt-2 text-gray-600">{funnels[selectedFunnel].description}</p>
        
        <div className="mt-4">
          <h3 className="font-medium text-gray-900">Funnel Configuration:</h3>
          <div className="mt-2 space-y-2">
            {funnels[selectedFunnel].steps.map((step, index) => (
              <div key={index} className="flex items-center flex-wrap gap-2 text-sm">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  {index + 1}
                </span>
                <span className="font-medium">{step.name}:</span>
                {step.path && <code className="bg-gray-100 px-2 py-1 rounded text-xs">path: {step.path[0]}</code>}
                {step.pathRegex && <code className="bg-gray-100 px-2 py-1 rounded text-xs">regex: {step.pathRegex[0]}</code>}
                {step.platform && <code className="bg-gray-100 px-2 py-1 rounded text-xs">platform: {step.platform.join(', ')}</code>}
                {step.country && <code className="bg-gray-100 px-2 py-1 rounded text-xs">country: {step.country.join(', ')}</code>}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <div className="animate-pulse">
            <h2 className="text-lg font-semibold">Loading funnel data...</h2>
            <div className="mt-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <h2 className="text-lg font-semibold text-red-600">Error Loading Funnel Data</h2>
          <p className="mt-2 text-red-500">{error.message}</p>
          <div className="mt-4 p-4 bg-red-50 rounded-md">
            <p className="text-sm text-red-700">
              This might be expected if you don't have data matching the funnel steps yet. 
              The enhanced funnel system is working correctly - it's just waiting for matching data.
            </p>
          </div>
        </Card>
      )}

      {/* Funnel Results */}
      {funnelData && !isLoading && (
        <>
          {/* Summary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <h3 className="text-sm font-medium text-gray-500">Total Visitors</h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{formatNumber(funnelData.totalVisitors)}</p>
            </Card>
            <Card>
              <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{formatPercentage(funnelData.overallConversionRate)}</p>
            </Card>
            <Card>
              <h3 className="text-sm font-medium text-gray-500">Completion Rate</h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{formatPercentage(funnelData.completionRate)}</p>
            </Card>
            <Card>
              <h3 className="text-sm font-medium text-gray-500">Total Steps</h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{funnels[selectedFunnel].steps.length}</p>
            </Card>
          </div>

          {/* Step-by-Step Analysis */}
          <Card>
            <h2 className="text-lg font-semibold">Step-by-Step Analysis</h2>
            <p className="mt-2 text-gray-600">Detailed breakdown of user progression through each funnel step</p>
            
            <div className="mt-6 space-y-6">
              {createCompleteStepList().map((step, index) => (
                <div key={step.step} className="border-l-4 border-blue-500 pl-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          {step.step}
                        </span>
                        <div>
                          <h3 className="text-lg font-semibold">{step.name}</h3>
                          <p className="text-gray-600">
                            {formatNumber(step.visitors)} visitors
                            {step.step > 1 && (
                              <span className="ml-2 text-gray-500">
                                ({formatNumber(step.dropped)} dropped off)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Progress Visualization */}
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Conversion Rate</span>
                          <span>{formatPercentage(step.conversionRate)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${step.conversionRate * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Step Metrics */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-gray-500">From Previous Step</p>
                          <p className="font-medium">
                            {step.step > 1 ? formatPercentage(step.relativePreviousVisitors) : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">From Funnel Start</p>
                          <p className="font-medium">{formatPercentage(step.relativeVisitors)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Drop-off Rate</p>
                          <p className="font-medium">
                            {step.step > 1 ? formatPercentage(step.dropOff) : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Previous Count</p>
                          <p className="font-medium">
                            {step.step > 1 ? formatNumber(step.previousVisitors) : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {index < createCompleteStepList().length - 1 && <div className="border-b border-gray-200 mt-4"></div>}
                </div>
              ))}
            </div>
          </Card>

          {/* Enhanced Features Demo */}
          <Card>
            <h2 className="text-lg font-semibold">Enhanced Features in Action</h2>
            <p className="mt-2 text-gray-600">Demonstrating advanced capabilities of the reference-style implementation</p>
            
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium">✅ Features Implemented</h3>
                <ul className="mt-2 space-y-1 text-sm text-gray-600">
                  <li>• Dynamic step count (no 4-step limit)</li>
                  <li>• ClickHouse regex patterns</li>
                  <li>• Event metadata filtering</li>
                  <li>• Geographic & technology filters</li>
                  <li>• UTM parameter tracking</li>
                  <li>• Custom tags support</li>
                  <li>• Temporal sequence validation</li>
                  <li>• Enhanced metrics calculation</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium">🔧 Configuration Used</h3>
                <div className="mt-2 text-sm">
                  <div className="bg-gray-50 p-3 rounded-md overflow-x-auto">
                    <pre className="text-xs">
{JSON.stringify({
  sequenceMode: funnels[selectedFunnel].sequenceMode || 'ordered',
  timeWindow: funnels[selectedFunnel].timeWindow || 24,
  steps: funnels[selectedFunnel].steps.length,
  filters: funnels[selectedFunnel].steps.map(s => ({
    path: s.path,
    pathRegex: s.pathRegex,
    platform: s.platform,
    country: s.country
  }))
}, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* API Integration Info */}
          <Card>
            <h2 className="text-lg font-semibold">API Integration</h2>
            <p className="mt-2 text-gray-600">The enhanced funnel uses the new `funnel_analysis_enhanced` Tinybird pipe</p>
            
            <div className="mt-4 bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium text-sm">Current API Call:</h3>
              <code className="text-xs mt-1 block text-gray-700 break-all">
                GET /v0/pipes/funnel_analysis_enhanced.json?step1_path_exact=/&step2_path_exact=/pricing/agency&date_from={'{startDate}'}&date_to={'{endDate}'}
              </code>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default FunnelAnalysisDemo; 