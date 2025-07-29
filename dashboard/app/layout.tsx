import type { Metadata } from 'next'
import AnalyticsProvider from '../components/Provider'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'Analytics Dashboard',
  description: 'Web analytics dashboard powered by Tinybird',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="antialiased dark:bg-gray-950">
      <body>
        <AnalyticsProvider>
          {children}
        </AnalyticsProvider>
      </body>
    </html>
  )
} 