import fetch from 'cross-fetch'
import {
  ClientResponse,
  PipeParams,
  QueryPipe,
  QuerySQL,
  QueryError,
} from './types/api'
import config from './config'

export function getConfig(search?: string) {
  // Check if we're in the browser
  const isBrowser = typeof window !== 'undefined'
  
  // Use provided search param, or window.location.search if in browser, or empty string if on server
  const searchParams = new URLSearchParams(search || (isBrowser ? window.location.search : ''))
  
  const token = config.authToken ?? searchParams.get('token')
  const host = config.host ?? searchParams.get('host')
  const siteId = config.siteId ?? searchParams.get('site_id')
  
  return {
    token,
    host,
    siteId,
  }
}

export async function client<T>(
  path: string,
  params?: RequestInit
): Promise<ClientResponse<T>> {
  const { host, token } = getConfig()

  if (!token || !host) throw new Error('Configuration not found')

  const apiUrl =
    {
      'https://ui.tinybird.co': 'https://api.tinybird.co',
      'https://ui.us-east.tinybird.co': 'https://api.us-east.tinybird.co',
    }[host] ?? host

  const response = await fetch(`${apiUrl}/v0${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    ...params,
  })
  const data = (await response.json()) as ClientResponse<T>

  if (!response.ok) {
    throw new QueryError(data?.error ?? 'Something went wrong', response.status)
  }

  return data
}

export async function fetcher<T>(
  path: string,
  params?: RequestInit
): Promise<ClientResponse<T>> {
  const { host, token } = getConfig()

  if (!token || !host) throw new Error('Configuration not found')

  const response = await fetch(path, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    ...params,
  })
  const data = (await response.json()) as ClientResponse<T>

  if (!response.ok) {
    throw new QueryError(data?.error ?? 'Something went wrong', response.status)
  }

  return data
}

export function queryPipe<T = any>(
  pipe: string,
  params: Partial<PipeParams<T>> = {}
): Promise<QueryPipe<T>> {
  const { siteId } = getConfig()
  const searchParams = new URLSearchParams()
  
  // Add site_id as a required parameter for all pipe queries
  if (siteId) {
    searchParams.set('site_id', siteId)
  }
  
  Object.entries(params).forEach(([key, value]) => {
    if (!value) return
    
    // Handle array parameters for filters
    if (Array.isArray(value)) {
      value.forEach(v => searchParams.append(key, v.toString()))
    } else {
      searchParams.set(key, value.toString())
    }
  })

  return client(`/pipes/${pipe}.json?${searchParams}`)
}

export function querySQL<T>(sql: string): Promise<QuerySQL<T>> {
  return client(`/sql?q=${sql}`)
}
