'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Play, 
  Database, 
  Globe, 
  Code, 
  Loader2,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import { instrumentedFetch, instrumentedApiCall, instrumentedDbOperation, instrumentedServiceCall } from '@/lib/instrumented-api'
import { instrumentedGitHubService } from '@/services/instrumented-github-service'
import { getAllTraces, getTraceStats } from '@/lib/browser-telemetry'

export function TracingDemo() {
  const [loading, setLoading] = useState<string | null>(null)
  const [results, setResults] = useState<any[]>([])
  const [githubRepo, setGithubRepo] = useState('microsoft/TypeScript')
  const [apiUrl, setApiUrl] = useState('https://jsonplaceholder.typicode.com/posts/1')
  const [stats, setStats] = useState({ total: 0, success: 0, error: 0, pending: 0, avgDuration: 0 })

  const addResult = (type: string, success: boolean, data?: any, error?: string) => {
    const result = {
      id: Date.now(),
      type,
      success,
      data,
      error,
      timestamp: new Date().toLocaleTimeString()
    }
    setResults(prev => [result, ...prev])
  }

  // Demo 1: Simple HTTP Request
  const testHttpRequest = async () => {
    setLoading('http')
    try {
      const response = await instrumentedFetch(apiUrl)
      const data = await response.json()
      addResult('HTTP Request', true, { status: response.status, data })
    } catch (error) {
      addResult('HTTP Request', false, null, error instanceof Error ? error.message : String(error))
    } finally {
      setLoading(null)
    }
  }

  // Demo 2: API Call with JSON
  const testApiCall = async () => {
    setLoading('api')
    try {
      const data = await instrumentedApiCall(apiUrl)
      addResult('API Call', true, data)
    } catch (error) {
      addResult('API Call', false, null, error instanceof Error ? error.message : String(error))
    } finally {
      setLoading(null)
    }
  }

  // Demo 3: Database Operation Simulation
  const testDbOperation = async () => {
    setLoading('db')
    try {
      const result = await instrumentedDbOperation(
        'getUserById',
        async () => {
          // Simulate database operation
          await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500))
          return {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            created_at: new Date().toISOString()
          }
        },
        { userId: 1, table: 'users' }
      )
      addResult('Database Operation', true, result)
    } catch (error) {
      addResult('Database Operation', false, null, error instanceof Error ? error.message : String(error))
    } finally {
      setLoading(null)
    }
  }

  // Demo 4: Service Call
  const testServiceCall = async () => {
    setLoading('service')
    try {
      const result = await instrumentedServiceCall(
        'UserService',
        'processUserData',
        async () => {
          // Simulate service operation
          await new Promise(resolve => setTimeout(resolve, Math.random() * 800 + 300))
          return {
            processed: true,
            userId: 123,
            operations: ['validation', 'transformation', 'storage'],
            duration: Math.round(Math.random() * 500 + 200)
          }
        },
        { operation: 'batch_process', count: 5 }
      )
      addResult('Service Call', true, result)
    } catch (error) {
      addResult('Service Call', false, null, error instanceof Error ? error.message : String(error))
    } finally {
      setLoading(null)
    }
  }

  // Demo 5: GitHub Service Call
  const testGitHubService = async () => {
    setLoading('github')
    try {
      const result = await instrumentedGitHubService.testConnection(`https://github.com/${githubRepo}`)
      addResult('GitHub Service', result.success, result, result.error)
    } catch (error) {
      addResult('GitHub Service', false, null, error instanceof Error ? error.message : String(error))
    } finally {
      setLoading(null)
    }
  }

  // Demo 6: Multiple Concurrent Calls
  const testConcurrentCalls = async () => {
    setLoading('concurrent')
    try {
      const promises = [
        instrumentedApiCall('https://jsonplaceholder.typicode.com/users/1'),
        instrumentedApiCall('https://jsonplaceholder.typicode.com/posts/1'),
        instrumentedApiCall('https://jsonplaceholder.typicode.com/albums/1'),
      ]
      
      const results = await Promise.allSettled(promises)
      const successCount = results.filter(r => r.status === 'fulfilled').length
      
      addResult('Concurrent Calls', true, { 
        total: promises.length, 
        successful: successCount, 
        failed: promises.length - successCount 
      })
    } catch (error) {
      addResult('Concurrent Calls', false, null, error instanceof Error ? error.message : String(error))
    } finally {
      setLoading(null)
    }
  }

  // Demo 7: Simulated Error
  const testErrorScenario = async () => {
    setLoading('error')
    try {
      await instrumentedApiCall('https://httpstat.us/500')
    } catch (error) {
      addResult('Error Scenario', false, null, error instanceof Error ? error.message : String(error))
    } finally {
      setLoading(null)
    }
  }

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    )
  }

  // Load stats on component mount and refresh periodically
  useEffect(() => {
    const loadStats = async () => {
      try {
        const currentStats = await getTraceStats()
        setStats(currentStats)
      } catch (error) {
        console.error('Failed to load stats:', error)
      }
    }
    
    loadStats()
    const interval = setInterval(loadStats, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">OpenTelemetry Tracing Demo</h1>
          <p className="text-muted-foreground">
            Test different types of API calls and see them traced in real-time
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Traces: {stats.total}</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Success: {stats.success}</span>
          </div>
          <div className="flex items-center gap-1">
            <XCircle className="h-4 w-4 text-red-500" />
            <span>Errors: {stats.error}</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="demo" className="space-y-4">
        <TabsList>
          <TabsTrigger value="demo">Demo Tests</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="demo" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* HTTP Request Demo */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Globe className="h-5 w-5" />
                  HTTP Request
                </CardTitle>
                <CardDescription>Test basic HTTP fetch with tracing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="API URL"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                />
                <Button
                  onClick={testHttpRequest}
                  disabled={loading === 'http'}
                  className="w-full"
                >
                  {loading === 'http' ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Test HTTP
                </Button>
              </CardContent>
            </Card>

            {/* API Call Demo */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Code className="h-5 w-5" />
                  API Call
                </CardTitle>
                <CardDescription>Test JSON API call with tracing</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={testApiCall}
                  disabled={loading === 'api'}
                  className="w-full"
                >
                  {loading === 'api' ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Test API Call
                </Button>
              </CardContent>
            </Card>

            {/* Database Operation Demo */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Database className="h-5 w-5" />
                  Database Op
                </CardTitle>
                <CardDescription>Simulate database operation</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={testDbOperation}
                  disabled={loading === 'db'}
                  className="w-full"
                >
                  {loading === 'db' ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Test DB Operation
                </Button>
              </CardContent>
            </Card>

            {/* Service Call Demo */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Code className="h-5 w-5" />
                  Service Call
                </CardTitle>
                <CardDescription>Test service method with tracing</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={testServiceCall}
                  disabled={loading === 'service'}
                  className="w-full"
                >
                  {loading === 'service' ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Test Service
                </Button>
              </CardContent>
            </Card>

            {/* GitHub Service Demo */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Globe className="h-5 w-5" />
                  GitHub Service
                </CardTitle>
                <CardDescription>Test GitHub API with tracing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="owner/repo"
                  value={githubRepo}
                  onChange={(e) => setGithubRepo(e.target.value)}
                />
                <Button
                  onClick={testGitHubService}
                  disabled={loading === 'github'}
                  className="w-full"
                >
                  {loading === 'github' ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Test GitHub
                </Button>
              </CardContent>
            </Card>

            {/* Concurrent Calls Demo */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Code className="h-5 w-5" />
                  Concurrent Calls
                </CardTitle>
                <CardDescription>Test multiple parallel requests</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={testConcurrentCalls}
                  disabled={loading === 'concurrent'}
                  className="w-full"
                >
                  {loading === 'concurrent' ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Test Concurrent
                </Button>
              </CardContent>
            </Card>

            {/* Error Scenario Demo */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <XCircle className="h-5 w-5" />
                  Error Scenario
                </CardTitle>
                <CardDescription>Test error handling and tracing</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={testErrorScenario}
                  disabled={loading === 'error'}
                  variant="destructive"
                  className="w-full"
                >
                  {loading === 'error' ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Test Error
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>Recent test executions and their outcomes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {results.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No tests executed yet</p>
                    <p className="text-sm">Run some tests to see results here</p>
                  </div>
                ) : (
                  results.map((result) => (
                    <div key={result.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result.success)}
                        <div>
                          <div className="font-medium">{result.type}</div>
                          <div className="text-sm text-muted-foreground">{result.timestamp}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={result.success ? "default" : "destructive"}>
                          {result.success ? "Success" : "Error"}
                        </Badge>
                        {result.error && (
                          <div className="text-sm text-red-600 max-w-xs truncate">
                            {result.error}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
