export type DeviceType = 'desktop' | 'mobile-ios' | 'mobile-android' | 'bot'

export type TopDevicesData = {
  device: DeviceType
  browser: string
  visits: number
  hits: number
}

export interface TopDevice {
  name: string
  visits: number
  color: string
}

export type TopDevices = {
  data: TopDevice[]
}
