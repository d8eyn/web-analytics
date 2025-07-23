import InView from './InView'
import {
  AreaChart,
  BarChart,
  BarList,
  ChartProvider,
  DonutChart,
  PieChart,
  tinybirdBorderColor,
} from '@tinybirdco/charts'
import { fetcher, getConfig } from '../lib/api'
import { useRouter } from 'next/router'
import useDateFilter from '../lib/hooks/use-date-filter'
import KpisTabs from './KpisTabs'
import useKpis from '../lib/hooks/use-kpis'
import useKpiTotals from '../lib/hooks/use-kpi-totals'
import { typography } from '../styles/theme'
import useDomain from '../lib/hooks/use-domain'
import PagesSection from './PagesSection'
import ReferrersSection from './ReferrersSection'
import ConversionGoals from './ConversionGoals'
import EventsSection from './EventsSection'
import LocationsSection from './LocationsSection'
import TechnologySection from './TechnologySection'

const enum WidgetHeight {
  XLarge = 588,
  Large = 472,
  Medium = 344,
  Small = 216,
}

export default function Widgets() {
  const { query } = useRouter()
  const { host, token } = getConfig(
    typeof query === 'string' ? query : undefined
  )
  function buildEndointUrl(host: string, endpoint: string) {
    const apiUrl =
      {
        'https://ui.tinybird.co': 'https://api.tinybird.co',
        'https://ui.us-east.tinybird.co': 'https://api.us-east.tinybird.co',
      }[host] ?? host

    return `${apiUrl}/v0/pipes/${endpoint}.json`
  }
  const trendEndpoint = buildEndointUrl(host, 'trend')
  const kpisEndpoint = buildEndointUrl(host, 'kpis')
  const { startDate, endDate } = useDateFilter()
  const { kpi, setKpi } = useKpis()
  const { data: kpiTotals } = useKpiTotals()

  return (
    <ChartProvider
      queryConfig={{
        token,
        fetcher,
      }}
      styles={{
        borderRadius: 8,
        borderColor: tinybirdBorderColor,
        colorPalette: ['#27F795', '#F72768', '#F7D427', '#2768F7'],
        padding: 24,
        fontFamily: typography.fontFamily,
        fontSize: 12,
      }}
    >
      <div className="space-y-6">
        {/* KPIs and Main Chart */}
        <div
          className="relative"
          style={{ height: WidgetHeight.XLarge }}
        >
          <div className="absolute top-0 left-0 right-0 z-10">
            <KpisTabs value={kpi} onChange={setKpi} totals={kpiTotals} />
          </div>
          <AreaChart
            endpoint={kpisEndpoint}
            index="date"
            categories={[kpi]}
            boxShadow="none"
            params={{
              date_from: startDate,
              date_to: endDate,
            }}
            height={WidgetHeight.XLarge}
            options={{
              grid: {
                left: '2%',
                right: '2%',
                top: 140,
                bottom: 0,
                containLabel: true,
              },
              yAxis: {
                splitNumber: 4,
                type: 'value',
                splitLine: {},
                axisLabel: {
                  fontSize: 12,
                },
              },
            }}
          />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Pages Section */}
            <PagesSection height={WidgetHeight.Large} />

            {/* Referrers Section */}
            <ReferrersSection height={WidgetHeight.Large} />

            {/* Conversion Goals */}
            <ConversionGoals height={WidgetHeight.Medium} />

            {/* Events Section */}
            <EventsSection height={WidgetHeight.Medium} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Current Visitors Trend */}
            <InView height={WidgetHeight.Small}>
              <BarChart
                endpoint={trendEndpoint}
                index="t"
                categories={['visits']}
                title="Users in last 30 minutes"
                height={WidgetHeight.Small}
                options={{
                  yAxis: { show: false },
                  xAxis: { show: false },
                }}
                params={{
                  date_from: startDate,
                  date_to: endDate,
                }}
              />
            </InView>

            {/* Countries/Locations Section */}
            <LocationsSection height={WidgetHeight.Large} />

            {/* Technology Section (OS/Browsers/etc) */}
            <TechnologySection height={WidgetHeight.Large} />
          </div>
        </div>
      </div>
    </ChartProvider>
  )
}
