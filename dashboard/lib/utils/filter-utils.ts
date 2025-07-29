import { AnalyticsFilter, FilterField } from '../types/filters'

// Convert filter values to SQL-compatible format
export function buildFilterConditions(filters: AnalyticsFilter): Record<string, any> {
  const conditions: Record<string, any> = {}

  // Helper to process array filters with negation support
  const processArrayFilter = (field: FilterField, values?: string[]) => {
    if (!values || values.length === 0) return undefined

    const positive: string[] = []
    const negative: string[] = []

    values.forEach(value => {
      if (value.startsWith('!')) {
        negative.push(value.slice(1))
      } else {
        positive.push(value)
      }
    })

    return { positive, negative }
  }

  // Path filters
  if (filters.hostname) {
    const result = processArrayFilter(FilterField.HOSTNAME, filters.hostname)
    if (result) conditions.hostname = result
  }

  if (filters.path) {
    const result = processArrayFilter(FilterField.PATH, filters.path)
    if (result) conditions.path = result
  }

  if (filters.anyPath) {
    const result = processArrayFilter(FilterField.PATH, filters.anyPath)
    if (result) conditions.anyPath = result
  }

  if (filters.entryPath) {
    const result = processArrayFilter(FilterField.ENTRY_PATH, filters.entryPath)
    if (result) conditions.entryPath = result
  }

  if (filters.exitPath) {
    const result = processArrayFilter(FilterField.EXIT_PATH, filters.exitPath)
    if (result) conditions.exitPath = result
  }

  if (filters.pathPattern) {
    conditions.pathPattern = filters.pathPattern
  }

  // Geographic filters
  if (filters.language) {
    const result = processArrayFilter(FilterField.LANGUAGE, filters.language)
    if (result) conditions.language = result
  }

  if (filters.country) {
    const result = processArrayFilter(FilterField.COUNTRY, filters.country)
    if (result) conditions.country = result
  }

  if (filters.region) {
    const result = processArrayFilter(FilterField.REGION, filters.region)
    if (result) conditions.region = result
  }

  if (filters.city) {
    const result = processArrayFilter(FilterField.CITY, filters.city)
    if (result) conditions.city = result
  }

  // Technology filters
  if (filters.os) {
    const result = processArrayFilter(FilterField.OS, filters.os)
    if (result) conditions.os = result
  }

  if (filters.osVersion) {
    const result = processArrayFilter(FilterField.OS_VERSION, filters.osVersion)
    if (result) conditions.osVersion = result
  }

  if (filters.browser) {
    const result = processArrayFilter(FilterField.BROWSER, filters.browser)
    if (result) conditions.browser = result
  }

  if (filters.browserVersion) {
    const result = processArrayFilter(FilterField.BROWSER_VERSION, filters.browserVersion)
    if (result) conditions.browserVersion = result
  }

  if (filters.platform) {
    const result = processArrayFilter(FilterField.PLATFORM, filters.platform)
    if (result) conditions.platform = result
  }

  if (filters.screenClass) {
    const result = processArrayFilter(FilterField.SCREEN_CLASS, filters.screenClass)
    if (result) conditions.screenClass = result
  }

  // Traffic source filters
  if (filters.referrer) {
    const result = processArrayFilter(FilterField.REFERRER, filters.referrer)
    if (result) conditions.referrer = result
  }

  if (filters.referrerName) {
    const result = processArrayFilter(FilterField.REFERRER_NAME, filters.referrerName)
    if (result) conditions.referrerName = result
  }

  if (filters.channel) {
    const result = processArrayFilter(FilterField.CHANNEL, filters.channel)
    if (result) conditions.channel = result
  }

  // UTM filters
  if (filters.utmSource) {
    const result = processArrayFilter(FilterField.UTM_SOURCE, filters.utmSource)
    if (result) conditions.utmSource = result
  }

  if (filters.utmMedium) {
    const result = processArrayFilter(FilterField.UTM_MEDIUM, filters.utmMedium)
    if (result) conditions.utmMedium = result
  }

  if (filters.utmCampaign) {
    const result = processArrayFilter(FilterField.UTM_CAMPAIGN, filters.utmCampaign)
    if (result) conditions.utmCampaign = result
  }

  if (filters.utmContent) {
    const result = processArrayFilter(FilterField.UTM_CONTENT, filters.utmContent)
    if (result) conditions.utmContent = result
  }

  if (filters.utmTerm) {
    const result = processArrayFilter(FilterField.UTM_TERM, filters.utmTerm)
    if (result) conditions.utmTerm = result
  }

  // Event filters
  if (filters.eventName) {
    const result = processArrayFilter(FilterField.EVENT_NAME, filters.eventName)
    if (result) conditions.eventName = result
  }

  if (filters.eventMetaKey) {
    const result = processArrayFilter(FilterField.EVENT_META_KEY, filters.eventMetaKey)
    if (result) conditions.eventMetaKey = result
  }

  if (filters.eventMeta) {
    conditions.eventMeta = filters.eventMeta
  }

  // Tag filters
  if (filters.tag) {
    const result = processArrayFilter(FilterField.TAG, filters.tag)
    if (result) conditions.tag = result
  }

  if (filters.tags) {
    conditions.tags = filters.tags
  }

  // Individual tracking
  if (filters.visitorId) {
    conditions.visitorId = filters.visitorId
  }

  if (filters.sessionId) {
    conditions.sessionId = filters.sessionId
  }

  return conditions
}

// Generate SQL WHERE clauses for Tinybird pipes
export function buildWhereClause(filters: AnalyticsFilter): string {
  const conditions = buildFilterConditions(filters)
  const clauses: string[] = []

  // Helper to build IN/NOT IN clauses
  const buildInClause = (field: string, values: { positive: string[], negative: string[] }) => {
    const parts: string[] = []
    
    if (values.positive.length > 0) {
      const valueList = values.positive.map(v => `'${v.replace(/'/g, "''")}'`).join(',')
      parts.push(`${field} IN (${valueList})`)
    }
    
    if (values.negative.length > 0) {
      const valueList = values.negative.map(v => `'${v.replace(/'/g, "''")}'`).join(',')
      parts.push(`${field} NOT IN (${valueList})`)
    }
    
    return parts.length > 0 ? `(${parts.join(' AND ')})` : ''
  }

  // Process each filter condition
  Object.entries(conditions).forEach(([key, value]) => {
    switch (key) {
      case 'hostname':
        if (value.positive.length > 0 || value.negative.length > 0) {
          clauses.push(buildInClause('hostname', value))
        }
        break
      case 'path':
        if (value.positive.length > 0 || value.negative.length > 0) {
          clauses.push(buildInClause('path', value))
        }
        break
      case 'anyPath':
        if (value.positive.length > 0) {
          const pathConditions = value.positive.map((path: string) => 
            `path LIKE '%${path.replace(/'/g, "''")}%'`
          ).join(' OR ')
          clauses.push(`(${pathConditions})`)
        }
        break
      case 'entryPath':
        if (value.positive.length > 0 || value.negative.length > 0) {
          clauses.push(buildInClause('entry_path', value))
        }
        break
      case 'exitPath':
        if (value.positive.length > 0 || value.negative.length > 0) {
          clauses.push(buildInClause('exit_path', value))
        }
        break
      case 'pathPattern':
        if (value.length > 0) {
          const patternConditions = value.map((pattern: string) => 
            `match(path, '${pattern.replace(/'/g, "''")}')`
          ).join(' OR ')
          clauses.push(`(${patternConditions})`)
        }
        break
      case 'language':
        if (value.positive.length > 0 || value.negative.length > 0) {
          clauses.push(buildInClause('language', value))
        }
        break
      case 'country':
        if (value.positive.length > 0 || value.negative.length > 0) {
          clauses.push(buildInClause('country_code', value))
        }
        break
      case 'region':
        if (value.positive.length > 0 || value.negative.length > 0) {
          clauses.push(buildInClause('region', value))
        }
        break
      case 'city':
        if (value.positive.length > 0 || value.negative.length > 0) {
          clauses.push(buildInClause('city', value))
        }
        break
      case 'os':
        if (value.positive.length > 0 || value.negative.length > 0) {
          clauses.push(buildInClause('os', value))
        }
        break
      case 'browser':
        if (value.positive.length > 0 || value.negative.length > 0) {
          clauses.push(buildInClause('browser', value))
        }
        break
      case 'referrer':
        if (value.positive.length > 0 || value.negative.length > 0) {
          clauses.push(buildInClause('referrer', value))
        }
        break
      case 'utmSource':
        if (value.positive.length > 0 || value.negative.length > 0) {
          clauses.push(buildInClause('utm_source', value))
        }
        break
      case 'utmMedium':
        if (value.positive.length > 0 || value.negative.length > 0) {
          clauses.push(buildInClause('utm_medium', value))
        }
        break
      case 'utmCampaign':
        if (value.positive.length > 0 || value.negative.length > 0) {
          clauses.push(buildInClause('utm_campaign', value))
        }
        break
      case 'eventName':
        if (value.positive.length > 0 || value.negative.length > 0) {
          clauses.push(buildInClause('event_name', value))
        }
        break
      case 'visitorId':
        clauses.push(`visitor_id = ${value}`)
        break
      case 'sessionId':
        clauses.push(`session_id = ${value}`)
        break
    }
  })

  return clauses.length > 0 ? ` AND ${clauses.join(' AND ')}` : ''
}

// Validate filter values
export function validateFilters(filters: AnalyticsFilter): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Validate required combinations
  if (filters.visitorId && !filters.sessionId) {
    errors.push('Session ID is required when filtering by Visitor ID')
  }

  if (filters.sessionId && !filters.visitorId) {
    errors.push('Visitor ID is required when filtering by Session ID')
  }

  // Validate event meta requires event name
  if (filters.eventMetaKey && (!filters.eventName || filters.eventName.length === 0)) {
    errors.push('Event Name is required when filtering by Event Meta Key')
  }

  if (filters.eventMeta && (!filters.eventName || filters.eventName.length === 0)) {
    errors.push('Event Name is required when filtering by Event Meta')
  }

  // Validate regex patterns
  if (filters.pathPattern) {
    filters.pathPattern.forEach(pattern => {
      try {
        new RegExp(pattern)
      } catch {
        errors.push(`Invalid regex pattern: ${pattern}`)
      }
    })
  }

  // Validate date range
  if (filters.from && filters.to) {
    const fromDate = new Date(filters.from)
    const toDate = new Date(filters.to)
    
    if (fromDate > toDate) {
      errors.push('Start date must be before end date')
    }
  }

  // Validate pagination
  if (filters.offset && filters.offset < 0) {
    errors.push('Offset must be non-negative')
  }

  if (filters.limit && filters.limit <= 0) {
    errors.push('Limit must be positive')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Convert filters to URL-friendly query parameters
export function filtersToQueryParams(filters: AnalyticsFilter): URLSearchParams {
  const params = new URLSearchParams()

  const addArrayParam = (key: string, values?: string[]) => {
    if (values && values.length > 0) {
      params.set(key, values.join(','))
    }
  }

  addArrayParam('hostname', filters.hostname)
  addArrayParam('path', filters.path)
  addArrayParam('anyPath', filters.anyPath)
  addArrayParam('entryPath', filters.entryPath)
  addArrayParam('exitPath', filters.exitPath)
  addArrayParam('pathPattern', filters.pathPattern)
  
  addArrayParam('language', filters.language)
  addArrayParam('country', filters.country)
  addArrayParam('region', filters.region)
  addArrayParam('city', filters.city)
  
  addArrayParam('os', filters.os)
  addArrayParam('osVersion', filters.osVersion)
  addArrayParam('browser', filters.browser)
  addArrayParam('browserVersion', filters.browserVersion)
  addArrayParam('platform', filters.platform)
  addArrayParam('screenClass', filters.screenClass)
  
  addArrayParam('referrer', filters.referrer)
  addArrayParam('referrerName', filters.referrerName)
  addArrayParam('channel', filters.channel)
  
  addArrayParam('utmSource', filters.utmSource)
  addArrayParam('utmMedium', filters.utmMedium)
  addArrayParam('utmCampaign', filters.utmCampaign)
  addArrayParam('utmContent', filters.utmContent)
  addArrayParam('utmTerm', filters.utmTerm)
  
  addArrayParam('eventName', filters.eventName)
  addArrayParam('eventMetaKey', filters.eventMetaKey)
  addArrayParam('tag', filters.tag)

  if (filters.visitorId) params.set('visitorId', filters.visitorId)
  if (filters.sessionId) params.set('sessionId', filters.sessionId)
  if (filters.offset) params.set('offset', filters.offset.toString())
  if (filters.limit) params.set('limit', filters.limit.toString())

  return params
}

// Convert filters to API parameters for Tinybird pipes
export function filtersToApiParams(
  filters: AnalyticsFilter,
  dateFrom?: string,
  dateTo?: string
): Record<string, any> {
  const params: Record<string, any> = {}
  
  // Add date parameters
  if (dateFrom) params.date_from = dateFrom
  if (dateTo) params.date_to = dateTo
  
  // Convert filters to API format
  if (filters && typeof filters === 'object') {
    // Add specific filter parameters that Tinybird pipes might support
    if (filters.hostname && filters.hostname.length > 0) {
      params.hostname = filters.hostname.join(',')
    }
    if (filters.path && filters.path.length > 0) {
      params.path = filters.path.join(',')
    }
    if (filters.anyPath && filters.anyPath.length > 0) {
      params.any_path = filters.anyPath.join(',')
    }
    if (filters.entryPath && filters.entryPath.length > 0) {
      params.entry_path = filters.entryPath.join(',')
    }
    if (filters.exitPath && filters.exitPath.length > 0) {
      params.exit_path = filters.exitPath.join(',')
    }
    if (filters.country && filters.country.length > 0) {
      params.country = filters.country.join(',')
    }
    if (filters.region && filters.region.length > 0) {
      params.region = filters.region.join(',')
    }
    if (filters.city && filters.city.length > 0) {
      params.city = filters.city.join(',')
    }
    if (filters.language && filters.language.length > 0) {
      params.language = filters.language.join(',')
    }
    if (filters.browser && filters.browser.length > 0) {
      params.browser = filters.browser.join(',')
    }
    if (filters.os && filters.os.length > 0) {
      params.os = filters.os.join(',')
    }
    if (filters.platform && filters.platform.length > 0) {
      params.platform = filters.platform.join(',')
    }
    if (filters.referrer && filters.referrer.length > 0) {
      params.referrer = filters.referrer.join(',')
    }
    if (filters.referrerName && filters.referrerName.length > 0) {
      params.referrer_name = filters.referrerName.join(',')
    }
    if (filters.channel && filters.channel.length > 0) {
      params.channel = filters.channel.join(',')
    }
    if (filters.utmSource && filters.utmSource.length > 0) {
      params.utm_source = filters.utmSource.join(',')
    }
    if (filters.utmMedium && filters.utmMedium.length > 0) {
      params.utm_medium = filters.utmMedium.join(',')
    }
    if (filters.utmCampaign && filters.utmCampaign.length > 0) {
      params.utm_campaign = filters.utmCampaign.join(',')
    }
    if (filters.utmContent && filters.utmContent.length > 0) {
      params.utm_content = filters.utmContent.join(',')
    }
    if (filters.utmTerm && filters.utmTerm.length > 0) {
      params.utm_term = filters.utmTerm.join(',')
    }
    if (filters.eventName && filters.eventName.length > 0) {
      params.event_name = filters.eventName.join(',')
    }
    if (filters.eventMetaKey && filters.eventMetaKey.length > 0) {
      params.event_meta_key = filters.eventMetaKey.join(',')
    }
    if (filters.tag && filters.tag.length > 0) {
      params.tag = filters.tag.join(',')
    }
    
    // Add individual parameters
    if (filters.visitorId) {
      params.visitor_id = filters.visitorId
    }
    if (filters.sessionId) {
      params.session_id = filters.sessionId
    }
    if (filters.offset) {
      params.offset = filters.offset
    }
    if (filters.limit) {
      params.limit = filters.limit
    }
  }
  
  return params
}

// Get human-readable description of active filters
export function getFilterDescription(filters: AnalyticsFilter): string {
  const descriptions: string[] = []
  
  const addDescription = (label: string, values?: string[]) => {
    if (values && values.length > 0) {
      const positive = values.filter(v => !v.startsWith('!'))
      const negative = values.filter(v => v.startsWith('!')).map(v => v.slice(1))
      
      if (positive.length > 0) {
        descriptions.push(`${label}: ${positive.join(', ')}`)
      }
      if (negative.length > 0) {
        descriptions.push(`Not ${label}: ${negative.join(', ')}`)
      }
    }
  }

  addDescription('Hostname', filters.hostname)
  addDescription('Path', filters.path)
  addDescription('Country', filters.country)
  addDescription('Browser', filters.browser)
  addDescription('OS', filters.os)
  addDescription('Referrer', filters.referrer)
  addDescription('UTM Source', filters.utmSource)
  addDescription('Event', filters.eventName)

  if (filters.visitorId) {
    descriptions.push(`Visitor: ${filters.visitorId}`)
  }

  return descriptions.join(' • ')
} 