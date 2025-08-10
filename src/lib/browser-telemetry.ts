/**
 * Browser-compatible telemetry implementation with Dexie persistence
 * This avoids Node.js-only modules like diagnostics_channel
 */

import { db, TraceLog, generateUUID } from './database';

// Re-export TraceLog for components
export type { TraceLog } from './database';

interface TraceSpan {
  traceId: string;
  spanId: string;
  operationName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'success' | 'error' | 'pending';
  method?: string;
  url?: string;
  statusCode?: number;
  error?: string;
  metadata?: Record<string, any>;
  tags?: Record<string, string>;
}

// In-memory trace storage for browser (for immediate access)
const traceStore = new Map<string, TraceSpan>();

// Helper function to generate unique ID
function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Persist trace to Dexie database
async function persistTrace(span: TraceSpan, isUpdate: boolean = false): Promise<void> {
  try {
    const traceLog: Omit<TraceLog, 'id'> = {
      uuid: span.spanId, // Use spanId as UUID for consistency
      traceId: span.traceId,
      spanId: span.spanId,
      operationName: span.operationName,
      startTime: span.startTime,
      endTime: span.endTime,
      duration: span.duration,
      status: span.status,
      method: span.method,
      url: span.url,
      statusCode: span.statusCode,
      error: span.error,
      metadata: span.metadata,
      tags: span.tags,
      createdAt: new Date()
    };
    
    if (isUpdate) {
      // Update existing record
      await db.traceLogs.where('spanId').equals(span.spanId).modify(traceLog);
    } else {
      // Add new record
      await db.traceLogs.add(traceLog);
    }
  } catch (error) {
    console.error('Failed to persist trace to database:', error);
  }
}

// Create a new trace span
function createSpan(operationName: string, options: {
  method?: string;
  url?: string;
  metadata?: Record<string, any>;
  tags?: Record<string, string>;
} = {}): TraceSpan {
  const traceId = generateId();
  const spanId = generateId();
  
  const span: TraceSpan = {
    traceId,
    spanId,
    operationName,
    startTime: Date.now(),
    status: 'pending',
    method: options.method,
    url: options.url,
    metadata: options.metadata,
    tags: options.tags
  };
  
  traceStore.set(spanId, span);
  // Persist to Dexie database
  persistTrace(span).catch(console.error);
  return span;
}

// Finish a trace span
function finishSpan(span: TraceSpan, options: {
  status?: 'success' | 'error';
  statusCode?: number;
  error?: string;
  metadata?: Record<string, any>;
} = {}) {
  const endTime = Date.now();
  const duration = endTime - span.startTime;
  
  // Update the span in store
  const updatedSpan: TraceSpan = {
    ...span,
    endTime,
    duration,
    status: options.status || 'success',
    statusCode: options.statusCode,
    error: options.error,
    metadata: { ...span.metadata, ...options.metadata }
  };
  
  traceStore.set(span.spanId, updatedSpan);
  // Persist updated trace to Dexie database
  persistTrace(updatedSpan, true).catch(console.error);
}

// Trace an API call
export async function traceApiCall<T>(
  operationName: string,
  apiCall: () => Promise<T>,
  options: {
    method?: string;
    url?: string;
    metadata?: Record<string, any>;
    tags?: Record<string, string>;
  } = {}
): Promise<T> {
  const span = createSpan(operationName, options);
  
  try {
    const result = await apiCall();
    finishSpan(span, { status: 'success' });
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack?.substring(0, 500) : undefined;
    
    finishSpan(span, { 
      status: 'error', 
      error: errorMessage,
      metadata: {
        ...options.metadata,
        errorName: error instanceof Error ? error.name : 'UnknownError',
        errorStack
      }
    });
    
    // Log error details for debugging
    console.error(`API call failed [${operationName}]:`, {
      error: errorMessage,
      url: options.url,
      method: options.method,
      traceId: span.traceId,
      spanId: span.spanId
    });
    
    throw error;
  }
}

// Trace an HTTP call
export async function traceHttpCall<T>(
  operationName: string,
  httpCall: () => Promise<T>,
  options: {
    method?: string;
    url?: string;
    metadata?: Record<string, any>;
    tags?: Record<string, string>;
  } = {}
): Promise<T> {
  const span = createSpan(operationName, options);
  
  try {
    const result = await httpCall();
    finishSpan(span, { status: 'success' });
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack?.substring(0, 500) : undefined;
    
    finishSpan(span, { 
      status: 'error', 
      error: errorMessage,
      metadata: {
        ...options.metadata,
        errorName: error instanceof Error ? error.name : 'UnknownError',
        errorStack
      }
    });
    
    // Log error details for debugging
    console.error(`HTTP call failed [${operationName}]:`, {
      error: errorMessage,
      url: options.url,
      method: options.method,
      traceId: span.traceId,
      spanId: span.spanId
    });
    
    throw error;
  }
}

// Get all traces from Dexie database
export async function getAllTraces(): Promise<TraceLog[]> {
  try {
    const traces = await db.traceLogs.orderBy('startTime').reverse().toArray();
    return traces;
  } catch (error) {
    console.error('Failed to fetch traces from database:', error);
    // Fallback to in-memory traces
    return Array.from(traceStore.values()).sort((a, b) => b.startTime - a.startTime).map(spanToTraceLog);
  }
}

// Get traces with filtering from Dexie database
export async function getTraces(filter?: { status?: string }): Promise<TraceLog[]> {
  try {
    let query = db.traceLogs.orderBy('startTime').reverse();
    if (filter?.status) {
      query = db.traceLogs.where('status').equals(filter.status).reverse();
    }
    return await query.toArray();
  } catch (error) {
    console.error('Failed to fetch filtered traces from database:', error);
    // Fallback to in-memory traces
    const traces = Array.from(traceStore.values());
    const filtered = filter?.status ? traces.filter(span => span.status === filter.status) : traces;
    return filtered.sort((a, b) => b.startTime - a.startTime).map(spanToTraceLog);
  }
}

// Get trace statistics from Dexie database
export async function getTraceStats() {
  try {
    const total = await db.traceLogs.count();
    const success = await db.traceLogs.where('status').equals('success').count();
    const error = await db.traceLogs.where('status').equals('error').count();
    const pending = await db.traceLogs.where('status').equals('pending').count();
    
    const completedTraces = await db.traceLogs.where('duration').aboveOrEqual(1).toArray();
    const avgDuration = completedTraces.length > 0 
      ? completedTraces.reduce((sum, log) => sum + (log.duration || 0), 0) / completedTraces.length
      : 0;

    return {
      total,
      success,
      error,
      pending,
      avgDuration: Math.round(avgDuration)
    };
  } catch (error) {
    console.error('Failed to fetch trace stats from database:', error);
    // Fallback to in-memory stats
    const traces = Array.from(traceStore.values());
    const total = traces.length;
    const success = traces.filter(span => span.status === 'success').length;
    const errorCount = traces.filter(span => span.status === 'error').length;
    const pending = traces.filter(span => span.status === 'pending').length;
    
    const completedTraces = traces.filter(span => span.duration !== undefined);
    const avgDuration = completedTraces.length > 0 
      ? completedTraces.reduce((sum, span) => sum + (span.duration || 0), 0) / completedTraces.length
      : 0;

    return {
      total,
      success,
      error: errorCount,
      pending,
      avgDuration: Math.round(avgDuration)
    };
  }
}

// Clear traces from database
export async function clearTraces(): Promise<void> {
  try {
    await db.traceLogs.clear();
    traceStore.clear();
    console.log('🗑️ [Trace] Cleared all traces from database and memory');
  } catch (error) {
    console.error('Failed to clear traces from database:', error);
    // Fallback to clearing in-memory traces only
    traceStore.clear();
    console.log('🗑️ [Trace] Cleared in-memory traces only');
  }
}

// Clean up old pending traces (traces that have been pending for more than 30 seconds)
export async function cleanupPendingTraces(): Promise<void> {
  try {
    const thirtySecondsAgo = Date.now() - 30000;
    const oldPendingTraces = await db.traceLogs
      .where('status').equals('pending')
      .and(trace => trace.startTime < thirtySecondsAgo)
      .toArray();
    
    if (oldPendingTraces.length > 0) {
      // Mark old pending traces as timed out
      for (const trace of oldPendingTraces) {
        await db.traceLogs.where('spanId').equals(trace.spanId).modify({
          status: 'error',
          error: 'Trace timed out - operation may have failed or been interrupted',
          endTime: Date.now(),
          duration: Date.now() - trace.startTime
        });
      }
      console.log(`🧹 [Trace] Cleaned up ${oldPendingTraces.length} old pending traces`);
    }
  } catch (error) {
    console.error('Failed to cleanup pending traces:', error);
  }
}

// Get traces by status (for backward compatibility)
export async function getTracesByStatus(status: TraceLog['status']): Promise<TraceLog[]> {
  return getTraces({ status });
}

// Helper function to convert TraceSpan to TraceLog format
function spanToTraceLog(span: TraceSpan): TraceLog {
  return {
    uuid: generateUUID(),
    traceId: span.traceId,
    spanId: span.spanId,
    operationName: span.operationName,
    startTime: span.startTime,
    endTime: span.endTime,
    duration: span.duration,
    status: span.status,
    method: span.method,
    url: span.url,
    statusCode: span.statusCode,
    error: span.error,
    metadata: span.metadata,
    tags: span.tags,
    createdAt: new Date()
  };
}
