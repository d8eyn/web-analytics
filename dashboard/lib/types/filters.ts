// Filter types based on Pirsch analytics reference system
export interface FilterValue {
  value: string
  label: string
  count?: number
}

export interface FilterOptions {
  [key: string]: FilterValue[]
}

// Main filter interface matching Pirsch's filter system
export interface AnalyticsFilter {
  // Time range (inherited from existing date filter)
  from?: string
  to?: string
  
  // Location & Path filters
  hostname?: string[]
  path?: string[]
  anyPath?: string[]
  entryPath?: string[]
  exitPath?: string[]
  pathPattern?: string[]
  
  // Geographic filters
  language?: string[]
  country?: string[]
  region?: string[]
  city?: string[]
  
  // Technology filters
  os?: string[]
  osVersion?: string[]
  browser?: string[]
  browserVersion?: string[]
  platform?: string[]
  screenClass?: string[]
  
  // Traffic source filters
  referrer?: string[]
  referrerName?: string[]
  channel?: string[]
  
  // UTM parameters
  utmSource?: string[]
  utmMedium?: string[]
  utmCampaign?: string[]
  utmContent?: string[]
  utmTerm?: string[]
  
  // Event filters
  eventName?: string[]
  eventMetaKey?: string[]
  eventMeta?: Record<string, string>
  
  // Custom tags
  tags?: Record<string, string>
  tag?: string[]
  
  // Individual tracking
  visitorId?: string
  sessionId?: string
  
  // Search and sorting
  search?: FilterSearch[]
  sort?: FilterSort[]
  
  // Pagination
  offset?: number
  limit?: number
  
  // Options
  includeTitle?: boolean
  includeTimeOnPage?: boolean
  includeCR?: boolean
}

export interface FilterSearch {
  field: string
  input: string
}

export interface FilterSort {
  field: string
  direction: 'ASC' | 'DESC'
}

// Filter field definitions
export enum FilterField {
  // Path fields
  HOSTNAME = 'hostname',
  PATH = 'path',
  ENTRY_PATH = 'entryPath',
  EXIT_PATH = 'exitPath',
  
  // Geographic fields
  LANGUAGE = 'language',
  COUNTRY = 'country',
  REGION = 'region',
  CITY = 'city',
  
  // Technology fields
  OS = 'os',
  OS_VERSION = 'osVersion',
  BROWSER = 'browser',
  BROWSER_VERSION = 'browserVersion',
  PLATFORM = 'platform',
  SCREEN_CLASS = 'screenClass',
  
  // Traffic source fields
  REFERRER = 'referrer',
  REFERRER_NAME = 'referrerName',
  CHANNEL = 'channel',
  
  // UTM fields
  UTM_SOURCE = 'utmSource',
  UTM_MEDIUM = 'utmMedium',
  UTM_CAMPAIGN = 'utmCampaign',
  UTM_CONTENT = 'utmContent',
  UTM_TERM = 'utmTerm',
  
  // Event fields
  EVENT_NAME = 'eventName',
  EVENT_META_KEY = 'eventMetaKey',
  
  // Tag fields
  TAG = 'tag',
}

// Filter categories for UI organization
export interface FilterCategory {
  id: string
  label: string
  fields: FilterField[]
  icon?: string
}

export const FILTER_CATEGORIES: FilterCategory[] = [
  {
    id: 'pages',
    label: 'Pages & Paths',
    fields: [FilterField.HOSTNAME, FilterField.PATH, FilterField.ENTRY_PATH, FilterField.EXIT_PATH],
  },
  {
    id: 'location',
    label: 'Location',
    fields: [FilterField.COUNTRY, FilterField.REGION, FilterField.CITY, FilterField.LANGUAGE],
  },
  {
    id: 'technology',
    label: 'Technology',
    fields: [FilterField.OS, FilterField.BROWSER, FilterField.PLATFORM, FilterField.SCREEN_CLASS],
  },
  {
    id: 'traffic',
    label: 'Traffic Sources',
    fields: [FilterField.REFERRER, FilterField.REFERRER_NAME, FilterField.CHANNEL],
  },
  {
    id: 'utm',
    label: 'UTM Parameters',
    fields: [FilterField.UTM_SOURCE, FilterField.UTM_MEDIUM, FilterField.UTM_CAMPAIGN, FilterField.UTM_CONTENT, FilterField.UTM_TERM],
  },
  {
    id: 'events',
    label: 'Events & Custom Data',
    fields: [FilterField.EVENT_NAME, FilterField.EVENT_META_KEY, FilterField.TAG],
  },
]

// Filter field metadata
export interface FilterFieldMeta {
  field: FilterField
  label: string
  type: 'select' | 'multiselect' | 'text' | 'pattern'
  placeholder?: string
  description?: string
  allowNegation?: boolean
  allowPattern?: boolean
  maxOptions?: number
}

export const FILTER_FIELD_META: Record<FilterField, FilterFieldMeta> = {
  [FilterField.HOSTNAME]: {
    field: FilterField.HOSTNAME,
    label: 'Hostname',
    type: 'multiselect',
    placeholder: 'Select hostnames...',
    description: 'Filter by domain/hostname',
    allowNegation: true,
  },
  [FilterField.PATH]: {
    field: FilterField.PATH,
    label: 'Page Path',
    type: 'multiselect',
    placeholder: 'Select or enter paths...',
    description: 'Filter by specific page paths',
    allowNegation: true,
    allowPattern: true,
  },
  [FilterField.ENTRY_PATH]: {
    field: FilterField.ENTRY_PATH,
    label: 'Entry Page',
    type: 'multiselect',
    placeholder: 'Select entry pages...',
    description: 'Filter by entry pages',
    allowNegation: true,
  },
  [FilterField.EXIT_PATH]: {
    field: FilterField.EXIT_PATH,
    label: 'Exit Page',
    type: 'multiselect',
    placeholder: 'Select exit pages...',
    description: 'Filter by exit pages',
    allowNegation: true,
  },
  [FilterField.LANGUAGE]: {
    field: FilterField.LANGUAGE,
    label: 'Language',
    type: 'multiselect',
    placeholder: 'Select languages...',
    description: 'Filter by ISO language code',
    allowNegation: true,
  },
  [FilterField.COUNTRY]: {
    field: FilterField.COUNTRY,
    label: 'Country',
    type: 'multiselect',
    placeholder: 'Select countries...',
    description: 'Filter by ISO country code',
    allowNegation: true,
  },
  [FilterField.REGION]: {
    field: FilterField.REGION,
    label: 'Region',
    type: 'multiselect',
    placeholder: 'Select regions...',
    description: 'Filter by geographic region',
    allowNegation: true,
  },
  [FilterField.CITY]: {
    field: FilterField.CITY,
    label: 'City',
    type: 'multiselect',
    placeholder: 'Select cities...',
    description: 'Filter by city name',
    allowNegation: true,
  },
  [FilterField.OS]: {
    field: FilterField.OS,
    label: 'Operating System',
    type: 'multiselect',
    placeholder: 'Select operating systems...',
    description: 'Filter by operating system',
    allowNegation: true,
  },
  [FilterField.OS_VERSION]: {
    field: FilterField.OS_VERSION,
    label: 'OS Version',
    type: 'multiselect',
    placeholder: 'Select OS versions...',
    description: 'Filter by operating system version',
    allowNegation: true,
  },
  [FilterField.BROWSER]: {
    field: FilterField.BROWSER,
    label: 'Browser',
    type: 'multiselect',
    placeholder: 'Select browsers...',
    description: 'Filter by browser',
    allowNegation: true,
  },
  [FilterField.BROWSER_VERSION]: {
    field: FilterField.BROWSER_VERSION,
    label: 'Browser Version',
    type: 'multiselect',
    placeholder: 'Select browser versions...',
    description: 'Filter by browser version',
    allowNegation: true,
  },
  [FilterField.PLATFORM]: {
    field: FilterField.PLATFORM,
    label: 'Platform',
    type: 'multiselect',
    placeholder: 'Select platforms...',
    description: 'Filter by platform (desktop, mobile, etc.)',
    allowNegation: true,
  },
  [FilterField.SCREEN_CLASS]: {
    field: FilterField.SCREEN_CLASS,
    label: 'Screen Class',
    type: 'multiselect',
    placeholder: 'Select screen classes...',
    description: 'Filter by screen size category',
    allowNegation: true,
  },
  [FilterField.REFERRER]: {
    field: FilterField.REFERRER,
    label: 'Referrer',
    type: 'multiselect',
    placeholder: 'Select referrers...',
    description: 'Filter by full referrer URL',
    allowNegation: true,
  },
  [FilterField.REFERRER_NAME]: {
    field: FilterField.REFERRER_NAME,
    label: 'Referrer Name',
    type: 'multiselect',
    placeholder: 'Select referrer names...',
    description: 'Filter by referrer display name',
    allowNegation: true,
  },
  [FilterField.CHANNEL]: {
    field: FilterField.CHANNEL,
    label: 'Channel',
    type: 'multiselect',
    placeholder: 'Select channels...',
    description: 'Filter by traffic channel',
    allowNegation: true,
  },
  [FilterField.UTM_SOURCE]: {
    field: FilterField.UTM_SOURCE,
    label: 'UTM Source',
    type: 'multiselect',
    placeholder: 'Select UTM sources...',
    description: 'Filter by UTM source parameter',
    allowNegation: true,
  },
  [FilterField.UTM_MEDIUM]: {
    field: FilterField.UTM_MEDIUM,
    label: 'UTM Medium',
    type: 'multiselect',
    placeholder: 'Select UTM mediums...',
    description: 'Filter by UTM medium parameter',
    allowNegation: true,
  },
  [FilterField.UTM_CAMPAIGN]: {
    field: FilterField.UTM_CAMPAIGN,
    label: 'UTM Campaign',
    type: 'multiselect',
    placeholder: 'Select UTM campaigns...',
    description: 'Filter by UTM campaign parameter',
    allowNegation: true,
  },
  [FilterField.UTM_CONTENT]: {
    field: FilterField.UTM_CONTENT,
    label: 'UTM Content',
    type: 'multiselect',
    placeholder: 'Select UTM content...',
    description: 'Filter by UTM content parameter',
    allowNegation: true,
  },
  [FilterField.UTM_TERM]: {
    field: FilterField.UTM_TERM,
    label: 'UTM Term',
    type: 'multiselect',
    placeholder: 'Select UTM terms...',
    description: 'Filter by UTM term parameter',
    allowNegation: true,
  },
  [FilterField.EVENT_NAME]: {
    field: FilterField.EVENT_NAME,
    label: 'Event Name',
    type: 'multiselect',
    placeholder: 'Select event names...',
    description: 'Filter by custom event name',
    allowNegation: true,
  },
  [FilterField.EVENT_META_KEY]: {
    field: FilterField.EVENT_META_KEY,
    label: 'Event Meta Key',
    type: 'multiselect',
    placeholder: 'Select event meta keys...',
    description: 'Filter by event metadata key',
    allowNegation: true,
  },
  [FilterField.TAG]: {
    field: FilterField.TAG,
    label: 'Tag',
    type: 'multiselect',
    placeholder: 'Select tags...',
    description: 'Filter by custom tag',
    allowNegation: true,
  },
}

// Filter preset interface
export interface FilterPreset {
  id: string
  name: string
  description?: string
  filters: AnalyticsFilter
  isDefault?: boolean
  createdAt: string
  updatedAt: string
}

// Filter state for UI management
export interface FilterState {
  activeFilters: AnalyticsFilter
  availableOptions: FilterOptions
  presets: FilterPreset[]
  isLoading: boolean
  error?: string
} 