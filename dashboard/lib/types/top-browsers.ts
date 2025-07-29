export interface TopBrowser {
  name: string
  visits: number
  color: string
}

export type TopBrowsers = {
  data: TopBrowser[]
}
