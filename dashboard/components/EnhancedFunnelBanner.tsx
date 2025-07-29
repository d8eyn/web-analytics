import React from 'react';

const EnhancedFunnelBanner: React.FC = () => {
  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-blue-900">🚀 New: Enhanced Funnel Analysis</h3>
          <p className="text-sm text-blue-700 mt-1">
            Reference-style funnel analysis with regex patterns, unlimited steps, and advanced filtering
          </p>
        </div>
        <a
          href="/demo"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Try Demo (/ → /pricing)
        </a>
      </div>
    </div>
  );
};

export default EnhancedFunnelBanner; 