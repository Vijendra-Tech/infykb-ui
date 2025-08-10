import { traceHttpCall, traceApiCall, getAllTraces } from './browser-telemetry'

// Instrumented fetch wrapper
export async function instrumentedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const method = options.method || 'GET'
  
  return traceHttpCall(
    `HTTP ${method.toUpperCase()} ${url}`,
    async () => {
      const response = await fetch(url, options)
      return response
    },
    {
      method: method.toUpperCase(),
      url,
      tags: {
        'http.method': method.toUpperCase(),
        'http.url': url,
        'component': 'http-client'
      }
    }
  )
}

// Instrumented JSON API call
export async function instrumentedApiCall<T>(
  url: string,
  options: RequestInit = {},
  operationName?: string
): Promise<T> {
  const method = options.method || 'GET'
  const name = operationName || `API ${method.toUpperCase()} ${url}`
  
  return traceHttpCall(
    name,
    async () => {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      return response.json()
    },
    {
      method: method.toUpperCase(),
      url,
      tags: {
        'http.method': method.toUpperCase(),
        'http.url': url,
        'component': 'api-client'
      }
    }
  )
}

// GitHub API specific wrapper
export async function instrumentedGitHubApiCall<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `https://api.github.com${endpoint}`
  
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'InfyKB-UI/1.0.0',
  }
  
  if (token) {
    headers['Authorization'] = `token ${token}`
  }
  
  return instrumentedApiCall<T>(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  }, `GitHub API ${options.method || 'GET'} ${endpoint}`)
}

// Database operation wrapper
export async function instrumentedDbOperation<T>(
  operationName: string,
  operation: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  return traceApiCall(
    `DB ${operationName}`,
    operation,
    {
      metadata: {
        'db.operation': operationName,
        'component': 'database',
        ...metadata,
      },
      tags: {
        'db.operation': operationName,
        'component': 'database'
      }
    }
  )
}

// Generic service operation wrapper
export async function instrumentedServiceCall<T>(
  serviceName: string,
  operationName: string,
  operation: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  return traceApiCall(
    `${serviceName}.${operationName}`,
    operation,
    {
      metadata: {
        'service.name': serviceName,
        'service.operation': operationName,
        ...metadata,
      },
      tags: {
        'service.name': serviceName,
        'service.operation': operationName
      }
    }
  )
}
