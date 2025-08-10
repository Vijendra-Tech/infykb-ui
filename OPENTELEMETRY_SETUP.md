# OpenTelemetry API Call Tracing Implementation

This document describes the comprehensive OpenTelemetry tracing implementation for the InfyKB application, which allows you to trace and monitor all API calls with detailed logging and visualization.

## 🚀 Features

- **Complete API Call Tracing**: Trace HTTP requests, API calls, database operations, and service calls
- **Real-time Logs Page**: Professional UI to view all traced operations with filtering and search
- **Interactive Demo**: Test different types of operations and see tracing in action
- **GitHub Service Integration**: Pre-instrumented GitHub API calls with detailed metadata
- **Chat Service Integration**: Example integration with chat functionality
- **Statistics Dashboard**: View success rates, error counts, and performance metrics
- **In-Memory Storage**: Fast local storage for development (easily extensible to external systems)

## 📁 File Structure

```
src/
├── lib/
│   ├── telemetry.ts                    # Core OpenTelemetry configuration and tracing functions
│   └── instrumented-api.ts             # Instrumented API wrappers (fetch, JSON, GitHub, DB)
├── services/
│   ├── instrumented-github-service.ts  # GitHub service with tracing
│   └── instrumented-chat-service.ts    # Chat service with tracing examples
├── components/
│   ├── logs-page.tsx                   # Professional logs viewing interface
│   └── tracing-demo.tsx               # Interactive demo component
├── app/
│   ├── logs/page.tsx                   # Logs page route
│   └── tracing-demo/page.tsx          # Demo page route
└── OPENTELEMETRY_SETUP.md             # This documentation
```

## 🛠️ Installation

The required dependencies are already installed:

```bash
npm install @opentelemetry/api @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node @opentelemetry/exporter-trace-otlp-http @opentelemetry/instrumentation-http @opentelemetry/instrumentation-fetch @opentelemetry/semantic-conventions
```

## 📖 Usage

### Basic API Call Tracing

```typescript
import { traceApiCall, traceHttpCall } from '@/lib/telemetry'

// Trace any async operation
const result = await traceApiCall(
  'operationName',
  async () => {
    // Your async operation here
    return await someApiCall()
  },
  { metadata: 'optional' }
)

// Trace HTTP calls specifically
const response = await traceHttpCall(
  'GET',
  'https://api.example.com/data',
  async () => {
    return await fetch('https://api.example.com/data')
  }
)
```

### Using Instrumented Wrappers

```typescript
import { instrumentedApiCall, instrumentedFetch } from '@/lib/instrumented-api'

// Instrumented fetch with automatic tracing
const response = await instrumentedFetch('https://api.example.com/data')

// Instrumented JSON API call
const data = await instrumentedApiCall('https://api.example.com/data', {
  method: 'POST',
  body: JSON.stringify({ key: 'value' })
})
```

### GitHub Service Integration

```typescript
import { instrumentedGitHubService } from '@/services/instrumented-github-service'

// All GitHub operations are automatically traced
const result = await instrumentedGitHubService.testConnection('https://github.com/owner/repo')
const issues = await instrumentedGitHubService.fetchIssues('https://github.com/owner/repo')
```

### Chat Service Integration

```typescript
import { instrumentedChatService } from '@/services/instrumented-chat-service'

// All chat operations are automatically traced
await instrumentedChatService.sendMessage('Hello, world!', 'project_123')
await instrumentedChatService.searchSimilarIssues('typescript error')
```

## 🎯 Key Components

### 1. Core Telemetry (`src/lib/telemetry.ts`)

- **`traceApiCall()`**: Generic function to trace any async operation
- **`traceHttpCall()`**: Specialized function for HTTP requests
- **`getAllTraces()`**: Retrieve all traced operations
- **`getTraceStats()`**: Get statistics about traced operations
- **`clearTraces()`**: Clear all stored traces

### 2. Instrumented API Wrappers (`src/lib/instrumented-api.ts`)

- **`instrumentedFetch()`**: Drop-in replacement for fetch() with tracing
- **`instrumentedApiCall()`**: JSON API calls with automatic tracing
- **`instrumentedGitHubApiCall()`**: GitHub-specific API calls
- **`instrumentedDbOperation()`**: Database operation tracing
- **`instrumentedServiceCall()`**: Generic service method tracing

### 3. Logs Page (`src/components/logs-page.tsx`)

Professional interface featuring:
- Real-time trace display with auto-refresh
- Advanced filtering by status, search query
- Statistics dashboard with success/error rates
- Detailed trace information with metadata
- Export and clear functionality

### 4. Interactive Demo (`src/components/tracing-demo.tsx`)

Test different scenarios:
- HTTP requests
- JSON API calls
- Database operations
- Service calls
- GitHub API integration
- Concurrent operations
- Error scenarios

## 🔍 Trace Data Structure

Each trace contains:

```typescript
interface TraceLog {
  id: string              // Unique identifier
  traceId: string         // OpenTelemetry trace ID
  spanId: string          // OpenTelemetry span ID
  operationName: string   // Human-readable operation name
  startTime: number       // Start timestamp
  endTime?: number        // End timestamp
  duration?: number       // Duration in milliseconds
  status: 'success' | 'error' | 'pending'
  method?: string         // HTTP method (for HTTP calls)
  url?: string           // Request URL (for HTTP calls)
  statusCode?: number    // HTTP status code
  error?: string         // Error message (if failed)
  metadata?: Record<string, any>  // Custom metadata
  tags?: Record<string, string>   // OpenTelemetry tags
}
```

## 📊 Navigation

The tracing system is integrated into the application navigation:

- **Logs Page**: `/logs` - View all traced API calls (Admin/Approver access)
- **Demo Page**: `/tracing-demo` - Interactive testing interface
- **Sidebar Navigation**: Added to Management section for admins

## 🎨 UI Features

### Logs Page Features:
- **Statistics Cards**: Total calls, success rate, error count, average duration
- **Real-time Updates**: Auto-refresh every 2 seconds
- **Advanced Filtering**: Search by operation name, URL, method, error message
- **Status Filtering**: Filter by success, error, or pending status
- **Detailed Views**: Expandable metadata and error information
- **Professional Design**: Glassmorphism effects and modern UI

### Demo Page Features:
- **Multiple Test Scenarios**: Different types of API calls and operations
- **Real-time Results**: See test outcomes immediately
- **Configurable Tests**: Customize URLs and parameters
- **Error Testing**: Dedicated error scenario testing
- **Concurrent Testing**: Test multiple parallel operations

## 🔧 Customization

### Adding Tracing to New Services

1. **Import the tracing functions**:
```typescript
import { instrumentedServiceCall } from '@/lib/instrumented-api'
```

2. **Wrap your service methods**:
```typescript
async myServiceMethod(param: string): Promise<any> {
  return instrumentedServiceCall(
    'MyService',
    'myServiceMethod',
    async () => {
      // Your existing service logic
      return await actualImplementation(param)
    },
    {
      'service.param': param,
      'service.param_length': param.length,
    }
  )
}
```

### Custom Metadata

Add custom metadata to traces for better debugging:

```typescript
await traceApiCall(
  'customOperation',
  async () => {
    // Your operation
  },
  {
    'user.id': userId,
    'request.type': 'batch',
    'batch.size': items.length,
    'feature.flag': 'new_ui_enabled'
  }
)
```

## 🚀 Production Considerations

### Current Implementation (Development)
- **Storage**: In-memory storage for fast development
- **Retention**: Traces cleared on server restart
- **Performance**: Optimized for development workflow

### Production Recommendations
- **External Storage**: Integrate with databases or external tracing systems
- **Retention Policies**: Implement automatic cleanup of old traces
- **Performance**: Consider sampling for high-traffic applications
- **Security**: Ensure sensitive data is not logged in traces
- **Monitoring**: Set up alerts for error rates and performance thresholds

### Extending to External Systems

The implementation is designed to be easily extended to external tracing systems:

```typescript
// Example: Send traces to external system
export function sendToExternalTracing(trace: TraceLog) {
  // Send to Jaeger, Zipkin, DataDog, etc.
}
```

## 📈 Benefits

1. **Development**: Instantly see all API calls and their performance
2. **Debugging**: Detailed error information and request/response data
3. **Performance**: Identify slow operations and bottlenecks
4. **Monitoring**: Track success rates and error patterns
5. **Documentation**: Automatic documentation of API usage patterns

## 🎯 Example Scenarios

### Debugging API Issues
1. Navigate to `/logs`
2. Filter by "error" status
3. Examine failed requests with full error details
4. Check metadata for request parameters

### Performance Analysis
1. View average duration statistics
2. Identify slowest operations
3. Analyze concurrent vs sequential performance
4. Monitor trends over time

### Testing New Features
1. Use `/tracing-demo` to test new API integrations
2. Verify error handling works correctly
3. Test concurrent operation behavior
4. Validate metadata collection

## 🔗 Integration Examples

The implementation includes working examples with:
- GitHub API integration
- Chat service operations
- Database operations
- Concurrent request handling
- Error scenarios
- Batch processing

This comprehensive tracing system provides full visibility into your application's API behavior, making development, debugging, and monitoring significantly easier.
