/**
 * API Configuration utility
 * Centralizes API base URL configuration for the application
 */

/**
 * Get the API base URL from environment variables
 * Falls back to localhost:8000 for development
 */
export const getApiBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
};

/**
 * Build a complete API URL with the base URL and endpoint
 * @param endpoint - The API endpoint (e.g., '/api/search', '/api/projects')
 * @returns Complete API URL
 */
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  // Ensure endpoint starts with '/' and base URL doesn't end with '/'
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  return `${cleanBaseUrl}${cleanEndpoint}`;
};

/**
 * Common API endpoints
 */
export const API_ENDPOINTS = {
  SEARCH: '/api/search',
  PROJECTS: '/api/projects',
  USER: '/api/user',
} as const;
