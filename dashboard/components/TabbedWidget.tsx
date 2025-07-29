'use client'

import { ReactNode, useState } from 'react'

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

export interface Tab {
  name: string
  content: ReactNode
}

export interface TabbedWidgetProps {
  title: string
  tabs: Tab[]
}

export function TabbedWidget({ title, tabs }: TabbedWidgetProps) {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      
      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === index
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>
      
      <div className="mt-4">
        {tabs[activeTab]?.content}
      </div>
    </Card>
  )
} 