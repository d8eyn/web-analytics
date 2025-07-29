// Simple color definitions instead of Tremor Color types
export const chartColors = [
  '#3b82f6', // blue
  '#ef4444', // red  
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#ec4899', // pink
  '#6b7280', // gray
]

export type ChartColor = string

export const getChartColor = (index: number): ChartColor => {
  return chartColors[index % chartColors.length]
}
