const config = {
  dashboardURL: process.env.NEXT_PUBLIC_TINYBIRD_DASHBOARD_URL as string,
  trackerToken: process.env.NEXT_PUBLIC_TINYBIRD_TRACKER_TOKEN as string,
  authToken: process.env.NEXT_PUBLIC_TINYBIRD_AUTH_TOKEN as string,
  host: process.env.NEXT_PUBLIC_TINYBIRD_HOST as string,
  siteId: process.env.NEXT_PUBLIC_SITE_ID as string,
} as const

export default config
