'use client'

import InView from './InView'
import ReactECharts from 'echarts-for-react'
import useDashboardData from '../lib/hooks/use-dashboard-data'
import { formatMinSec, formatPercentage, formatNumber, kFormatter } from '../lib/utils'
import { KpiType } from '../lib/types/kpis'

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

// KPI Chart component for individual metrics
function KpiChart({ 
  title, 
  data, 
  dataKey, 
  color, 
  formatter,
  yAxisFormatter
}: {
  title: string
  data: any[]
  dataKey: string
  color: string
  formatter?: (value: number) => string
  yAxisFormatter?: (value: number) => string
}) {
  const chartOptions = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      formatter: function (params: any) {
        const point = params[0]
        const value = point.value
        const formattedValue = formatter ? formatter(value) : value.toLocaleString()
        return `${point.name}<br/>${point.seriesName}: ${formattedValue}`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.map(item => {
        const date = new Date(item.date_key)
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }),
      axisLabel: {
        fontSize: 11
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 11,
        formatter: yAxisFormatter || function(value: number) {
          return formatter ? formatter(value) : value.toLocaleString()
        }
      }
    },
    series: [
      {
        name: title,
        type: 'line',
        smooth: true,
        areaStyle: {
          color: `${color}20` // 20% opacity
        },
        emphasis: {
          focus: 'series'
        },
        data: data.map(item => item[dataKey] || 0),
        itemStyle: {
          color: color
        },
        lineStyle: {
          color: color,
          width: 2
        }
      }
    ]
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {data.length > 0 ? (
        <ReactECharts 
          option={chartOptions}
          style={{ height: '280px', width: '100%' }}
          opts={{ renderer: 'svg' }}
        />
      ) : (
        <div className="flex items-center justify-center h-72">
          <div className="text-gray-500">No data available</div>
        </div>
      )}
    </Card>
  )
}

interface OptimizedWidgetsProps {
  selectedKpi?: KpiType
}

export default function OptimizedWidgets({ selectedKpi }: OptimizedWidgetsProps) {
  const { summary, trends, isLoading, error } = useDashboardData()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="animate-pulse bg-gray-200 rounded-lg h-80"></div>
        <div className="animate-pulse bg-gray-200 rounded-lg h-80"></div>
        <div className="animate-pulse bg-gray-200 rounded-lg h-80"></div>
        <div className="animate-pulse bg-gray-200 rounded-lg h-80"></div>
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">Error loading dashboard data</div>
  }

  // Get chart data with proper null checks
  const kpiTrends = trends?.getKpiTrends() || []
  const realtimeTrend = trends?.getRealtimeTrend() || []

  // KPI configuration mapping
  const kpiConfigs = {
    visits: {
      title: 'Visits (Sessions)',
      dataKey: 'visits',
      color: '#27F795',
      formatter: formatNumber,
      yAxisFormatter: (value: number) => kFormatter(value)
    },
    pageviews: {
      title: 'Page Views',
      dataKey: 'pageviews',
      color: '#2563eb',
      formatter: kFormatter,
      yAxisFormatter: (value: number) => kFormatter(value)
    },
    bounce_rate: {
      title: 'Bounce Rate',
      dataKey: 'bounce_rate',
      color: '#dc2626',
      formatter: formatPercentage,
      yAxisFormatter: (value: number) => `${value.toFixed(0)}%`
    },
    avg_session_sec: {
      title: 'Average Session Duration',
      dataKey: 'avg_session_sec',
      color: '#7c3aed',
      formatter: formatMinSec,
      yAxisFormatter: (value: number) => formatMinSec(value)
    }
  }

  // Prepare data for realtime bar chart
  const barChartData = realtimeTrend.slice(-24).map((item, index) => ({
    time: `${index}:00`,
    visitors: item.visits || 0,
  }))

  // Handle empty data cases
  if (kpiTrends.length === 0 && barChartData.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-full">
          <div className="text-center py-12">
            <div className="text-gray-500">No data available for the selected date range</div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 mb-12 mt-4">
      {/* Selected KPI Chart or All KPI Trends */}
      <div>
        {selectedKpi ? (
          <>
            {/* <h2 className="text-xl font-semibold mb-4">
              {kpiConfigs[selectedKpi]?.title || 'KPI Trend'}
            </h2> */}
            <div className="grid grid-cols-1 gap-6">
              <InView height={350}>
                <KpiChart
                  title={kpiConfigs[selectedKpi].title}
                  data={kpiTrends}
                  dataKey={kpiConfigs[selectedKpi].dataKey}
                  color={kpiConfigs[selectedKpi].color}
                  formatter={kpiConfigs[selectedKpi].formatter}
                  yAxisFormatter={kpiConfigs[selectedKpi].yAxisFormatter}
                />
              </InView>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-4">KPI Trends</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Visits Chart */}
              <InView height={350}>
                <KpiChart
                  title="Visits (Sessions)"
                  data={kpiTrends}
                  dataKey="visits"
                  color="#27F795"
                  formatter={formatNumber}
                  yAxisFormatter={(value) => kFormatter(value)}
                />
              </InView>

              {/* Page Views Chart */}
              <InView height={350}>
                <KpiChart
                  title="Page Views"
                  data={kpiTrends}
                  dataKey="pageviews"
                  color="#2563eb"
                  formatter={kFormatter}
                  yAxisFormatter={(value) => kFormatter(value)}
                />
              </InView>

              {/* Bounce Rate Chart */}
              <InView height={350}>
                <KpiChart
                  title="Bounce Rate"
                  data={kpiTrends}
                  dataKey="bounce_rate"
                  color="#dc2626"
                  formatter={formatPercentage}
                  yAxisFormatter={(value) => `${value.toFixed(0)}%`}
                />
              </InView>

              {/* Average Session Duration Chart */}
              <InView height={350}>
                <KpiChart
                  title="Average Session Duration"
                  data={kpiTrends}
                  dataKey="avg_session_sec"
                  color="#7c3aed"
                  formatter={formatMinSec}
                  yAxisFormatter={(value) => formatMinSec(value)}
                />
              </InView>
            </div>
          </>
        )}
      </div>

      {/* Realtime Visitors Section */}
      {/* <div>
        <h2 className="text-xl font-semibold mb-4">Realtime Activity</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-1">
            <InView height={350}>
              <Card>
                <h3 className="text-lg font-semibold mb-4">Visitors (Last 24 Hours)</h3>
                {barChartData.length > 0 ? (
                  <ReactECharts 
                    option={barChartOptions}
                    style={{ height: '280px', width: '100%' }}
                    opts={{ renderer: 'svg' }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-72">
                    <div className="text-gray-500">No realtime data available</div>
                  </div>
                )}
              </Card>
            </InView>
          </div>
        </div>
      </div> */}
    </div>
  )
} 