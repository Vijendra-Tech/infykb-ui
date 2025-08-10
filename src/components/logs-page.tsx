'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Activity, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Search, 
  Trash2, 
  RefreshCw,
  Globe,
  Database,
  Code,
  BarChart3,
  Copy,
  ChevronDown,
  ChevronRight,
  Bug,
  Package,
  Info,
  AlertTriangle,
  Eye
} from 'lucide-react'
import { 
  getAllTraces, 
  getTraceStats, 
  clearTraces, 
  cleanupPendingTraces,
  type TraceLog 
} from '@/lib/browser-telemetry'

interface LogsPageProps {
  className?: string
}

// Enhanced metadata viewer component - defined outside to prevent state reset on re-renders
const MetadataViewer = ({ trace }: { trace: TraceLog }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copiedSection, setCopiedSection] = useState<string | null>(null)

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedSection(section)
      setTimeout(() => setCopiedSection(null), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  // Separate metadata into different categories
  const errorDetails = {
    error: trace.error,
    errorName: trace.metadata?.errorName,
    errorStack: trace.metadata?.errorStack,
    statusCode: trace.statusCode
  }

  const requestPayload = {
    method: trace.method,
    url: trace.url,
    headers: trace.metadata?.headers,
    body: trace.metadata?.body,
    params: trace.metadata?.params,
    query: trace.metadata?.query
  }

  const operationContext = {
    operationName: trace.operationName,
    traceId: trace.traceId,
    spanId: trace.spanId,
    startTime: trace.startTime,
    endTime: trace.endTime,
    duration: trace.duration,
    status: trace.status,
    tags: trace.tags
  }

  const businessContext = trace.metadata ? {
    userId: trace.metadata.userId,
    userEmail: trace.metadata.userEmail,
    organizationId: trace.metadata.organizationId,
    projectId: trace.metadata.projectId,
    projectName: trace.metadata.projectName,
    sourceId: trace.metadata.sourceId,
    sourceName: trace.metadata.sourceName,
    repository: trace.metadata.repository,
    ...Object.fromEntries(
      Object.entries(trace.metadata).filter(([key]) => 
        !['errorName', 'errorStack', 'headers', 'body', 'params', 'query', 
          'userId', 'userEmail', 'organizationId', 'projectId', 'projectName', 
          'sourceId', 'sourceName', 'repository'].includes(key)
      )
    )
  } : {}

  const renderSection = (title: string, data: any, icon: React.ReactNode, sectionKey: string) => {
    const hasData = data && Object.values(data).some(v => v !== undefined && v !== null && v !== '')
    if (!hasData) return null

    const jsonString = JSON.stringify(data, null, 2)
    
    return (
      <div className="border rounded-lg p-3 bg-slate-50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {icon}
            <h5 className="font-medium text-sm">{title}</h5>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(jsonString, sectionKey)}
            className="h-6 w-6 p-0"
          >
            {copiedSection === sectionKey ? (
              <CheckCircle className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
        <pre className="text-xs bg-white border rounded p-2 overflow-x-auto max-h-40">
          {jsonString}
        </pre>
      </div>
    )
  }

  return (
    <div className="mt-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
      >
        {isExpanded ? (
          <ChevronDown className="h-3 w-3 mr-1" />
        ) : (
          <ChevronRight className="h-3 w-3 mr-1" />
        )}
        <Eye className="h-3 w-3 mr-1" />
        View Detailed Metadata
      </Button>

      {isExpanded && (
        <div className="mt-3 space-y-3 border-l-2 border-blue-200 pl-4">
          {/* Error Details Section */}
          {trace.status === 'error' && renderSection(
            'Error Details',
            errorDetails,
            <Bug className="h-4 w-4 text-red-500" />,
            'error'
          )}

          {/* Request/Payload Section */}
          {renderSection(
            'Request Payload',
            requestPayload,
            <Package className="h-4 w-4 text-blue-500" />,
            'payload'
          )}

          {/* Operation Context Section */}
          {renderSection(
            'Operation Context',
            operationContext,
            <Info className="h-4 w-4 text-purple-500" />,
            'context'
          )}

          {/* Business Context Section */}
          {renderSection(
            'Business Context',
            businessContext,
            <BarChart3 className="h-4 w-4 text-green-500" />,
            'business'
          )}

          {/* Raw Metadata (Fallback) */}
          {trace.metadata && Object.keys(trace.metadata).length > 0 && (
            <div className="border rounded-lg p-3 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-gray-500" />
                  <h5 className="font-medium text-sm">Raw Metadata</h5>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(JSON.stringify(trace.metadata, null, 2), 'raw')}
                  className="h-6 w-6 p-0"
                >
                  {copiedSection === 'raw' ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <pre className="text-xs bg-white border rounded p-2 overflow-x-auto max-h-40">
                {JSON.stringify(trace.metadata, null, 2)}
              </pre>
            </div>
          )}

          {/* Developer Tips */}
          {trace.status === 'error' && (
            <div className="border rounded-lg p-3 bg-amber-50 border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <h5 className="font-medium text-sm text-amber-800">Developer Tips</h5>
              </div>
              <div className="text-xs text-amber-700 space-y-1">
                <p>• Check the Error Details section for specific error information</p>
                <p>• Review Request Payload for invalid parameters or missing data</p>
                <p>• Verify Business Context for user permissions and resource access</p>
                <p>• Use the trace ID ({trace.traceId.slice(0, 8)}...) for correlation across logs</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function LogsPage({ className }: LogsPageProps) {
  const [traces, setTraces] = useState<TraceLog[]>([])
  const [filteredTraces, setFilteredTraces] = useState<TraceLog[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    error: 0,
    pending: 0,
    avgDuration: 0,
  })

  // Refresh traces data
  const refreshTraces = async () => {
    try {
      // Clean up old pending traces first
      await cleanupPendingTraces()
      const allTraces = await getAllTraces()
      const traceStats = await getTraceStats()
      setTraces(allTraces)
      setStats(traceStats)
    } catch (error) {
      console.error('Failed to refresh traces:', error)
    }
  }

  // Auto-refresh every 2 seconds
  useEffect(() => {
    refreshTraces()
    const interval = setInterval(refreshTraces, 2000)
    return () => clearInterval(interval)
  }, [])

  // Filter traces based on search and status
  useEffect(() => {
    let filtered = traces

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(trace => trace.status === statusFilter)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(trace =>
        trace.operationName.toLowerCase().includes(query) ||
        trace.url?.toLowerCase().includes(query) ||
        trace.method?.toLowerCase().includes(query) ||
        trace.error?.toLowerCase().includes(query)
      )
    }

    setFilteredTraces(filtered)
  }, [traces, searchQuery, statusFilter])

  const getStatusIcon = (status: TraceLog['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: TraceLog['status']) => {
    const variants = {
      success: 'bg-green-100 text-green-800 border-green-200',
      error: 'bg-red-100 text-red-800 border-red-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    }
    return (
      <Badge variant="outline" className={variants[status]}>
        {status.toUpperCase()}
      </Badge>
    )
  }

  const getOperationIcon = (operationName: string) => {
    if (operationName.includes('HTTP') || operationName.includes('API')) {
      return <Globe className="h-4 w-4" />
    }
    if (operationName.includes('DB')) {
      return <Database className="h-4 w-4" />
    }
    return <Code className="h-4 w-4" />
  }

  const formatDuration = (duration?: number) => {
    if (!duration) return 'N/A'
    if (duration < 1000) return `${duration}ms`
    return `${(duration / 1000).toFixed(2)}s`
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const handleClearLogs = () => {
    clearTraces()
    refreshTraces()
  }



  return (
    <div className={`space-y-6 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Call Logs</h1>
          <p className="text-muted-foreground">
            Monitor and trace all API calls with OpenTelemetry
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refreshTraces}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleClearLogs}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Logs
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(stats.avgDuration)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search operations, URLs, errors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent API Calls</CardTitle>
          <CardDescription>
            Showing {filteredTraces.length} of {traces.length} traced operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-2">
              {filteredTraces.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No API calls found</p>
                  <p className="text-sm">Start using the application to see traced operations</p>
                </div>
              ) : (
                filteredTraces.map((trace) => (
                  <Card key={trace.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1">
                          {getOperationIcon(trace.operationName)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium truncate">{trace.operationName}</h4>
                            {getStatusBadge(trace.status)}
                            {trace.method && (
                              <Badge variant="secondary" className="text-xs">
                                {trace.method}
                              </Badge>
                            )}
                          </div>
                          
                          {trace.url && (
                            <p className="text-sm text-muted-foreground truncate mb-1">
                              {trace.url}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTimestamp(trace.startTime)}
                            </span>
                            
                            {trace.duration && (
                              <span>Duration: {formatDuration(trace.duration)}</span>
                            )}
                            
                            {trace.statusCode && (
                              <span>Status: {trace.statusCode}</span>
                            )}
                          </div>
                          
                          {trace.error && (
                            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                              <div className="flex items-center gap-2 mb-1">
                                <Bug className="h-4 w-4 text-red-600" />
                                <strong>Error:</strong>
                              </div>
                              <p className="font-mono text-xs">{trace.error}</p>
                              {trace.metadata?.errorName && (
                                <p className="text-xs mt-1">
                                  <strong>Type:</strong> {trace.metadata.errorName}
                                </p>
                              )}
                            </div>
                          )}
                          
                          {/* Enhanced Metadata Viewer */}
                          <MetadataViewer trace={trace} />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {getStatusIcon(trace.status)}
                        <span className="text-xs text-muted-foreground">
                          {trace.traceId.slice(0, 8)}...
                        </span>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
