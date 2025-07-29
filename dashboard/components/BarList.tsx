import React from 'react'

interface BarListItem {
  name?: string
  value?: number
  [key: string]: any
}

interface BarListProps {
  data: BarListItem[]
  index: string
  categories: string[]
  title?: string
  className?: string
}

export default function BarList({ data, index, categories, title, className = '' }: BarListProps) {
  const maxValue = Math.max(...data.map(item => item[categories[0]] || 0))

  return (
    <div className={className}>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <div className="space-y-3">
        {data.map((item, idx) => {
          const value = item[categories[0]] || 0
          const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0
          
          return (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-900 truncate">
                  {item[index] || item.name || 'Unknown'}
                </span>
              </div>
              <div className="flex items-center ml-4 space-x-3">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 min-w-[3rem] text-right">
                  {value.toLocaleString()}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
} 