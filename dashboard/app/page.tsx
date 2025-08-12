'use client'

/* eslint-disable @next/next/no-img-element */
import Script from 'next/script'
import Header from '../components/Header'
import Footer from '../components/Footer'
import OptimizedWidgets from '../components/OptimizedWidgets'
import EnhancedFunnelBanner from '../components/EnhancedFunnelBanner'
import FunnelAnalysisDemo from '../components/FunnelAnalysisDemo'
import { PagesSection } from '../components/PagesSection'
import { ReferrersSection } from '../components/ReferrersSection'
import { LocationsSection } from '../components/LocationsSection'
import { TechnologySection } from '../components/TechnologySection'
import { EventsSection } from '../components/EventsSection'
import { ConversionGoals } from '../components/ConversionGoals'
import { FunnelSection } from '../components/FunnelSection'
import CurrentVisitors from '../components/CurrentVisitors'
import KpisTabs from '../components/KpisTabs'
import Credentials from '../components/Credentials'
import useAuth from '../lib/hooks/use-auth'
import Meta from '../components/Meta'
import ErrorModal from '../components/ErrorModal'
import config from '../lib/config'
import { useState } from 'react'
import { KpiType } from '../lib/types/kpis'
import useKpiTotals from '../lib/hooks/use-kpi-totals'

export default function DashboardPage() {
  const { isAuthenticated, isTokenValid } = useAuth()
  const [showEnhancedDemo, setShowEnhancedDemo] = useState(false)
  const [selectedKpi, setSelectedKpi] = useState<KpiType>('visits')
  const [errorModalOpen, setErrorModalOpen] = useState(false)

  // Get KPI totals for the tabs
  const { data: kpiTotals } = useKpiTotals()

  return (
    <>
      {process.env.NODE_ENV === 'production' && (
        <Script
          defer
          src="https://unpkg.com/@tinybirdco/flock.js"
          data-token={config.trackerToken}
        />
      )}
      <Meta />
      <div className="h-12 bg-primary text-sm leading-5 text-secondary flex items-center justify-center gap-2">
        📊{' '}
        <div>
          <span className="font-semibold">Tinybird Charts</span>: Create
          in-product analytics or internal dashboards in minutes.{' '}
          <a
            href="https://www.tinybird.co/docs/publish/charts"
            className="underline"
          >
            Learn more
          </a>
        </div>
      </div>
      <div className="min-h-screen px-5 py-5 text-sm leading-5 bg-body sm:px-10 text-secondary">
        <div className="mx-auto max-w-7xl">
          <Header />
          {!isAuthenticated && <Credentials />}
          {isAuthenticated && !isTokenValid && (
            <div className="flex items-center justify-center p-4 mb-4 text-blue-700 bg-blue-100 rounded-md">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Token is not valid
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      The token you provided is not valid. Please check the{' '}
                      <a
                        href="https://guide.tinybird.co/guide/web-analytics-starter-kit#deploy-to-vercel"
                        className="font-medium underline"
                      >
                        API token
                      </a>{' '}
                      setting.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {isAuthenticated && isTokenValid && (
            <>
              {/* Enhanced Funnel Demo Toggle */}
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-blue-900">
                      🚀 Enhanced Funnel Analysis
                    </h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Try the new reference-style funnel analysis with regex
                      patterns and advanced filtering
                    </p>
                  </div>
                  <button
                    onClick={() => window.location.assign('/funnel')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Try Enhanced Funnels
                  </button>
                </div>
              </div>

              {showEnhancedDemo ? (
                <FunnelAnalysisDemo />
              ) : (
                <>
                  <KpisTabs
                    value={selectedKpi}
                    onChange={setSelectedKpi}
                    totals={kpiTotals}
                  />
                  <OptimizedWidgets selectedKpi={selectedKpi} />
                  <div className="grid grid-cols-2 gap-4">
                    <PagesSection />
                    {/* <FunnelSection /> */}
                    <ReferrersSection />
                    <LocationsSection />
                    <TechnologySection />
                    <EventsSection />
                    <ConversionGoals />
                  </div>
                </>
              )}
            </>
          )}
          <Footer />
          <ErrorModal
            open={errorModalOpen}
            onClose={() => setErrorModalOpen(false)}
          />
        </div>
      </div>
    </>
  )
}
