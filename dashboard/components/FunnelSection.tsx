'use client'

import { useState } from 'react';
import BarList from './BarList';
import { TabbedWidget } from './TabbedWidget';
import InView from './InView';
import { FunnelConfig, FunnelStepResult, DEFAULT_FUNNELS } from '../lib/types/funnel';
import useFunnel from '../lib/hooks/use-funnel';

// Simple Card component replacement
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

interface FunnelVisualizationProps {
  config: FunnelConfig;
  height?: number;
}

function FunnelVisualization({ config, height = 400 }: FunnelVisualizationProps) {
  const { data, isLoading, error } = useFunnel(config);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-gray-500">Loading funnel data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-red-500">Error loading funnel data</div>
      </div>
    );
  }

  if (!data || data.steps.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-gray-500">No funnel data available</div>
      </div>
    );
  }

  // Prepare data for BarList visualization
  const funnelData = data.steps.map(step => ({
    name: step.name,
    value: step.visitors,
    conversionRate: `${(step.conversionRate * 100).toFixed(1)}%`,
    dropOff: step.step > 1 ? `${(step.dropOff * 100).toFixed(1)}%` : '',
  }));

  return (
    <div className="space-y-6">
      {/* Funnel Overview */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{data.totalVisitors}</div>
          <div className="text-sm text-gray-600">Total Visitors</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {(data.overallConversionRate * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Overall Conversion</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{data.steps.length}</div>
          <div className="text-sm text-gray-600">Steps</div>
        </div>
      </div>

      {/* Funnel Steps Visualization */}
      <div className="space-y-4">
        {data.steps.map((step, index) => (
          <FunnelStep key={step.step} step={step} isFirst={index === 0} />
        ))}
      </div>

      {/* Alternative BarList View */}
      <div className="mt-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Step Performance</h4>
        <div style={{ height: Math.min(height, 300) }}>
          <BarList
            data={funnelData}
            index="name"
            categories={['value']}
          />
        </div>
      </div>
    </div>
  );
}

interface FunnelStepProps {
  step: FunnelStepResult;
  isFirst: boolean;
}

function FunnelStep({ step, isFirst }: FunnelStepProps) {
  const width = Math.max((step.relativeVisitors * 100), 10); // Minimum 10% width for visibility
  
  return (
    <div className="relative">
      {/* Step Bar */}
      <div className="bg-gray-200 rounded-lg h-16 relative overflow-hidden">
        <div
          className={`h-full rounded-lg flex items-center justify-between px-4 ${
            isFirst 
              ? 'bg-blue-500' 
              : step.conversionRate > 0.5 
                ? 'bg-green-500' 
                : step.conversionRate > 0.2 
                  ? 'bg-yellow-500' 
                  : 'bg-red-500'
          }`}
          style={{ width: `${width}%` }}
        >
          <div className="text-white font-medium truncate">
            {step.name}
          </div>
          <div className="text-white text-sm font-semibold">
            {step.visitors}
          </div>
        </div>
        
        {/* Step metrics overlay */}
        <div className="absolute top-0 right-4 h-full flex items-center">
          <div className="text-gray-700 text-sm font-medium">
            {(step.conversionRate * 100).toFixed(1)}%
          </div>
        </div>
      </div>
      
      {/* Drop-off indicator */}
      {!isFirst && step.dropped > 0 && (
        <div className="flex items-center mt-2 text-sm text-red-600">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          {step.dropped} visitors dropped off ({(step.dropOff * 100).toFixed(1)}%)
        </div>
      )}
    </div>
  );
}

export function FunnelSection() {
  // Use the default e-commerce funnel for demonstration
  const defaultFunnel = DEFAULT_FUNNELS[0];
  const { data, isLoading, error } = useFunnel(defaultFunnel);

  if (isLoading) return <div className="animate-pulse bg-gray-200 rounded-lg h-32"></div>
  if (error) return <div className="text-red-500">Error loading funnel data</div>
  if (!data || !data.steps) return <div className="text-gray-500">No funnel data available</div>

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">Conversion Funnel</h3>
      <div className="space-y-3">
        {data.steps.map((step: FunnelStepResult, index: number) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm font-medium">{step.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{step.visitors}</span>
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${(step.conversionRate * 100)}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600">{(step.conversionRate * 100).toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
} 