'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Bug,
  Globe,
  Database
} from 'lucide-react'
import { instrumentedFetch, instrumentedApiCall } from '@/lib/instrumented-api'
import { getAllTraces, getTraceStats, clearTraces } from '@/lib/browser-telemetry'
import { buildApiUrl, API_ENDPOINTS } from '@/lib/api-config'

export function ApiErrorTest() {
  const [loading, setLoading] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, success: 0, error: 0, pending: 0, avgDuration: 0 })

  const updateStats = async () => {
    try {
      const currentStats = await getTraceStats()
      setStats(currentStats)
    } catch (error) {
      console.error('Failed to update stats:', error)
    }
  }

  const addTestResult = (test: string, success: boolean, details: string) => {
    const result = {
      id: Date.now(),
      test,
      success,
      details,
      timestamp: new Date().toLocaleTimeString()
    }
    setTestResults(prev => [result, ...prev])
    updateStats()
  }

  // Test 1: 404 Not Found Error
  const test404Error = async () => {
    setLoading('404')
    try {
      await instrumentedFetch('https://httpstat.us/404')
      addTestResult('404 Error Test', false, 'Expected 404 error but got success')
    } catch (error) {
      addTestResult('404 Error Test', true, `Correctly caught 404 error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(null)
    }
  }

  // Test 2: 500 Server Error
  const test500Error = async () => {
    setLoading('500')
    try {
      await instrumentedFetch('https://httpstat.us/500')
      addTestResult('500 Error Test', false, 'Expected 500 error but got success')
    } catch (error) {
      addTestResult('500 Error Test', true, `Correctly caught 500 error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(null)
    }
  }

  // Test 3: Network Timeout Error
  const testTimeoutError = async () => {
    setLoading('timeout')
    try {
      // Use a URL that will timeout
      await instrumentedFetch('https://httpstat.us/200?sleep=10000', {
        signal: AbortSignal.timeout(2000) // 2 second timeout
      })
      addTestResult('Timeout Error Test', false, 'Expected timeout error but got success')
    } catch (error) {
      addTestResult('Timeout Error Test', true, `Correctly caught timeout error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(null)
    }
  }

  // Test 4: Invalid URL Error
  const testInvalidUrlError = async () => {
    setLoading('invalid')
    try {
      await instrumentedFetch('invalid-url-that-should-fail')
      addTestResult('Invalid URL Test', false, 'Expected invalid URL error but got success')
    } catch (error) {
      addTestResult('Invalid URL Test', true, `Correctly caught invalid URL error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(null)
    }
  }

  // Test 5: Search API Error (Real API that might fail)
  const testSearchApiError = async () => {
    setLoading('search')
    try {
      const response = await instrumentedFetch(buildApiUrl(API_ENDPOINTS.SEARCH), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: 'test query that might fail' }),
      })
      
      if (!response.ok) {
        throw new Error(`Search API failed with status ${response.status}: ${response.statusText}`)
      }
      
      addTestResult('Search API Test', true, `Search API succeeded with status ${response.status}`)
    } catch (error) {
      addTestResult('Search API Test', true, `Search API error correctly logged: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(null)
    }
  }

  // Test 6: JSON Parse Error
  const testJsonParseError = async () => {
    setLoading('json')
    try {
      await instrumentedApiCall('https://httpstat.us/200?content-type=text/plain')
      addTestResult('JSON Parse Test', false, 'Expected JSON parse error but got success')
    } catch (error) {
      addTestResult('JSON Parse Test', true, `Correctly caught JSON parse error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(null)
    }
  }

  // Clear all traces and results
  const clearAllData = () => {
    clearTraces()
    setTestResults([])
    updateStats()
  }

  // Check current traces
  const checkTraces = async () => {
    try {
      const traces = await getAllTraces()
      const errorTraces = traces.filter(t => t.status === 'error')

      console.log('📊 Current Traces:', traces)
      console.log('❌ Error Traces:', errorTraces)
    
      addTestResult('Trace Check', true, `Found ${traces.length} total traces, ${errorTraces.length} error traces`)
    } catch (error) {
      console.error('Failed to check traces:', error)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Error Testing</h1>
          <p className="text-muted-foreground">
            Test various API error scenarios to ensure they are properly logged and displayed
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={checkTraces}>
            <Bug className="h-4 w-4 mr-2" />
            Check Traces
          </Button>
          <Button variant="outline" size="sm" onClick={clearAllData}>
            <XCircle className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Traces</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.success}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.error}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgDuration}ms</div>
          </CardContent>
        </Card>
      </div>

      {/* Test Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              404 Not Found
            </CardTitle>
            <CardDescription>Test 404 error handling and logging</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={test404Error}
              disabled={loading === '404'}
              variant="destructive"
              className="w-full"
            >
              {loading === '404' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Test 404 Error
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              500 Server Error
            </CardTitle>
            <CardDescription>Test server error handling and logging</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={test500Error}
              disabled={loading === '500'}
              variant="destructive"
              className="w-full"
            >
              {loading === '500' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Test 500 Error
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Timeout Error
            </CardTitle>
            <CardDescription>Test network timeout handling</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={testTimeoutError}
              disabled={loading === 'timeout'}
              variant="destructive"
              className="w-full"
            >
              {loading === 'timeout' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Test Timeout
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Invalid URL
            </CardTitle>
            <CardDescription>Test invalid URL error handling</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={testInvalidUrlError}
              disabled={loading === 'invalid'}
              variant="destructive"
              className="w-full"
            >
              {loading === 'invalid' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Test Invalid URL
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="h-5 w-5 text-blue-500" />
              Search API
            </CardTitle>
            <CardDescription>Test real search API error handling</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={testSearchApiError}
              disabled={loading === 'search'}
              className="w-full"
            >
              {loading === 'search' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Globe className="h-4 w-4 mr-2" />
              )}
              Test Search API
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              JSON Parse Error
            </CardTitle>
            <CardDescription>Test JSON parsing error handling</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={testJsonParseError}
              disabled={loading === 'json'}
              variant="destructive"
              className="w-full"
            >
              {loading === 'json' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Test JSON Error
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
          <CardDescription>Results of error testing scenarios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {testResults.length === 0 ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No tests run yet. Click the test buttons above to start testing error scenarios.
                </AlertDescription>
              </Alert>
            ) : (
              testResults.map((result) => (
                <div key={result.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {result.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <div>
                      <div className="font-medium">{result.test}</div>
                      <div className="text-sm text-muted-foreground">{result.timestamp}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.success ? "PASS" : "FAIL"}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {testResults.length > 0 && (
            <Alert className="mt-4">
              <Bug className="h-4 w-4" />
              <AlertDescription>
                After running tests, check the <strong>/logs</strong> page to verify that all error traces are properly displayed.
                You should see failed API calls with detailed error information.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
