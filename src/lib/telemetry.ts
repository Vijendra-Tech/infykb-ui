import { trace, context, SpanStatusCode, SpanKind } from '@opentelemetry/api'

// Server-side only imports - wrapped in dynamic imports to avoid bundling issues
let NodeSDK: any = null
let getNodeAutoInstrumentations: any = null

// Initialize OpenTelemetry SDK (server-side only)
let sdk: any = null

export async function initializeTelemetry() {
  if (typeof window !== 'undefined') {
    // Skip initialization on client side
    return
  }

  if (sdk) {
    return sdk
  }

  try {
    // Dynamic imports to avoid bundling Node.js modules in browser
    const { NodeSDK: NodeSDKClass } = await import('@opentelemetry/sdk-node')
    const { getNodeAutoInstrumentations: getInstrumentations } = await import('@opentelemetry/auto-instrumentations-node')
    
    NodeSDK = NodeSDKClass
    getNodeAutoInstrumentations = getInstrumentations

    sdk = new NodeSDK({
      instrumentations: [getNodeAutoInstrumentations()],
    })

    sdk.start()
    console.log('OpenTelemetry tracing initialized')
    return sdk
  } catch (error) {
    console.warn('OpenTelemetry initialization failed (this is normal in browser context):', error)
    return null
  }
}

// Tracer instance - safe for both server and client
const getTracer = () => {
  try {
    return trace.getTracer('infy-kb-ui', '1.0.0')
  } catch (error) {
    // Fallback for browser context
    return null
  }
}

// Types for trace data
export interface TraceLog {
  id: string
  traceId: string
  spanId: string
  operationName: string
  startTime: number
  endTime?: number
  duration?: number
  status: 'success' | 'error' | 'pending'
  method?: string
  url?: string
  statusCode?: number
  error?: string
  metadata?: Record<string, any>
  tags?: Record<string, string>
}

// In-memory store for traces (in production, you'd use a proper storage)
const traceStore: TraceLog[] = []

// Helper function to generate unique ID
function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

// Enhanced tracing wrapper function
export async function traceApiCall<T>(
  operationName: string,
  operation: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const tracer = getTracer()
  
  // If no tracer available (browser context), still execute operation but without tracing
  if (!tracer) {
    console.log(`[Browser] Executing ${operationName} without tracing`)
    return operation()
  }

  const span = tracer.startSpan(operationName, {
    kind: SpanKind.CLIENT,
    attributes: {
      'operation.name': operationName,
      'service.name': 'infy-kb-ui',
      ...metadata,
    },
  })

  const traceLog: TraceLog = {
    id: generateId(),
    traceId: span.spanContext().traceId,
    spanId: span.spanContext().spanId,
    operationName,
    startTime: Date.now(),
    status: 'pending',
    metadata,
  }

  // Add to store
  traceStore.push(traceLog)

  return context.with(trace.setSpan(context.active(), span), async () => {
    try {
      const result = await operation()
      
      // Update trace log on success
      traceLog.endTime = Date.now()
      traceLog.duration = traceLog.endTime - traceLog.startTime
      traceLog.status = 'success'
      
      span.setStatus({ code: SpanStatusCode.OK })
      span.setAttributes({
        'operation.success': true,
        'operation.duration': traceLog.duration,
      })
      
      return result
    } catch (error) {
      // Update trace log on error
      traceLog.endTime = Date.now()
      traceLog.duration = traceLog.endTime - traceLog.startTime
      traceLog.status = 'error'
      traceLog.error = error instanceof Error ? error.message : String(error)
      
      span.recordException(error instanceof Error ? error : new Error(String(error)))
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : String(error),
      })
      
      throw error
    } finally {
      span.end()
    }
  })
}

// HTTP-specific tracing wrapper
export async function traceHttpCall<T>(
  method: string,
  url: string,
  operation: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const operationName = `HTTP ${method.toUpperCase()} ${url}`
  
  return traceApiCall(
    operationName,
    async () => {
      const result = await operation()
      
      // Update the latest trace log with HTTP-specific data
      const latestLog = traceStore[traceStore.length - 1]
      if (latestLog) {
        latestLog.method = method.toUpperCase()
        latestLog.url = url
        latestLog.tags = {
          'http.method': method.toUpperCase(),
          'http.url': url,
          'component': 'http-client',
        }
      }
      
      return result
    },
    {
      'http.method': method.toUpperCase(),
      'http.url': url,
      ...metadata,
    }
  )
}

// Function to get all traces
export function getAllTraces(): TraceLog[] {
  return [...traceStore].sort((a, b) => b.startTime - a.startTime)
}

// Function to get traces by status
export function getTracesByStatus(status: TraceLog['status']): TraceLog[] {
  return traceStore.filter(log => log.status === status)
}

// Function to clear traces
export function clearTraces(): void {
  traceStore.length = 0
}

// Function to get trace statistics
export function getTraceStats() {
  const total = traceStore.length
  const success = traceStore.filter(log => log.status === 'success').length
  const error = traceStore.filter(log => log.status === 'error').length
  const pending = traceStore.filter(log => log.status === 'pending').length
  
  const completedTraces = traceStore.filter(log => log.duration !== undefined)
  const avgDuration = completedTraces.length > 0 
    ? completedTraces.reduce((sum, log) => sum + (log.duration || 0), 0) / completedTraces.length
    : 0

  return {
    total,
    success,
    error,
    pending,
    avgDuration: Math.round(avgDuration),
  }
}

// Initialize telemetry on import (server-side only)
if (typeof window === 'undefined') {
  initializeTelemetry().catch(error => {
    console.warn('Failed to initialize telemetry:', error)
  })
}
