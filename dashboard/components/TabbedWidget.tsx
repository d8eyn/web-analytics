import { useState } from 'react';
import { Card } from '@tremor/react';

interface Tab {
  name: string;
  content: React.ReactNode;
}

interface TabbedWidgetProps {
  title: string;
  tabs: Tab[];
  className?: string;
}

export function TabbedWidget({ title, tabs, className = '' }: TabbedWidgetProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <Card className={`${className}`}>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
        
        {/* Tab Navigation */}
        <nav className="flex space-x-8 border-b border-gray-200" aria-label="Tabs">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`${
                selectedIndex === index
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
        
        {/* Tab Content */}
        <div className="mt-6">
          {tabs[selectedIndex]?.content}
        </div>
      </div>
    </Card>
  );
} 