import { instrumentedApiCall, instrumentedServiceCall } from '@/lib/instrumented-api'
import { getApiBaseUrl, buildApiUrl, API_ENDPOINTS } from '@/lib/api-config'

/**
 * Instrumented Chat Service with OpenTelemetry tracing
 * Demonstrates how to add tracing to existing API calls
 */
export class InstrumentedChatService {
  
  /**
   * Send a chat message with tracing
   */
  async sendMessage(message: string, projectId?: string): Promise<any> {
    return instrumentedServiceCall(
      'ChatService',
      'sendMessage',
      async () => {
        // Simulate API call to backend
        const response = await instrumentedApiCall(
          buildApiUrl(API_ENDPOINTS.SEARCH),
          {
            method: 'POST',
            body: JSON.stringify({
              query: message,
              project_id: projectId,
              timestamp: new Date().toISOString()
            })
          },
          'Chat Message API'
        )
        return response
      },
      {
        'chat.message_length': message.length,
        'chat.project_id': projectId,
        'chat.has_project': !!projectId,
      }
    )
  }

  /**
   * Search for similar issues with tracing
   */
  async searchSimilarIssues(query: string, options: any = {}): Promise<any> {
    return instrumentedServiceCall(
      'ChatService',
      'searchSimilarIssues',
      async () => {
        // Simulate GitHub API search
        const searchUrl = `https://api.github.com/search/issues?q=${encodeURIComponent(query)}&sort=relevance&order=desc`
        
        const response = await instrumentedApiCall(
          searchUrl,
          {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'InfyKB-UI/1.0.0'
            }
          },
          'GitHub Issues Search'
        )
        
        return response
      },
      {
        'search.query': query,
        'search.query_length': query.length,
        'search.options': JSON.stringify(options),
      }
    )
  }

  /**
   * Get chat history with tracing
   */
  async getChatHistory(projectId: string, limit: number = 50): Promise<any> {
    return instrumentedServiceCall(
      'ChatService',
      'getChatHistory',
      async () => {
        // Simulate database query
        await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100))
        
        return {
          messages: [],
          total: 0,
          project_id: projectId,
          limit,
          timestamp: new Date().toISOString()
        }
      },
      {
        'chat.project_id': projectId,
        'chat.history_limit': limit,
      }
    )
  }

  /**
   * Generate AI response with tracing
   */
  async generateAIResponse(prompt: string, context?: any): Promise<any> {
    return instrumentedServiceCall(
      'ChatService',
      'generateAIResponse',
      async () => {
        // Simulate AI API call (OpenAI, Anthropic, etc.)
        const aiApiUrl = 'https://api.openai.com/v1/chat/completions'
        
        // Note: This is a mock - in real implementation you'd use actual API
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000))
        
        return {
          response: `This is a simulated AI response to: "${prompt.substring(0, 50)}..."`,
          model: 'gpt-4',
          tokens_used: Math.floor(Math.random() * 500 + 100),
          processing_time: Math.floor(Math.random() * 2000 + 500)
        }
      },
      {
        'ai.prompt_length': prompt.length,
        'ai.has_context': !!context,
        'ai.context_size': context ? JSON.stringify(context).length : 0,
      }
    )
  }

  /**
   * Save chat session with tracing
   */
  async saveChatSession(sessionData: any): Promise<any> {
    return instrumentedServiceCall(
      'ChatService',
      'saveChatSession',
      async () => {
        // Simulate database save operation
        await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 100))
        
        return {
          session_id: `session_${Date.now()}`,
          saved_at: new Date().toISOString(),
          message_count: sessionData.messages?.length || 0
        }
      },
      {
        'session.message_count': sessionData.messages?.length || 0,
        'session.project_id': sessionData.project_id,
        'session.user_id': sessionData.user_id,
      }
    )
  }

  /**
   * Batch operation example with tracing
   */
  async batchProcessMessages(messages: string[]): Promise<any> {
    return instrumentedServiceCall(
      'ChatService',
      'batchProcessMessages',
      async () => {
        // Process multiple messages concurrently
        const results = await Promise.allSettled(
          messages.map(async (message, index) => {
            await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200))
            return {
              index,
              message,
              processed: true,
              word_count: message.split(' ').length,
              sentiment: Math.random() > 0.5 ? 'positive' : 'negative'
            }
          })
        )
        
        const successful = results.filter(r => r.status === 'fulfilled').length
        
        return {
          total: messages.length,
          successful,
          failed: messages.length - successful,
          results: results.map(r => r.status === 'fulfilled' ? r.value : null)
        }
      },
      {
        'batch.message_count': messages.length,
        'batch.total_length': messages.join('').length,
        'batch.avg_length': messages.reduce((sum, msg) => sum + msg.length, 0) / messages.length,
      }
    )
  }
}

// Export instrumented instance
export const instrumentedChatService = new InstrumentedChatService()

// Example usage function that can be called from components
export async function demonstrateTracing() {
  const service = new InstrumentedChatService()
  
  try {
    console.log('🚀 Starting OpenTelemetry tracing demonstration...')
    
    // Demo 1: Simple message
    console.log('📤 Sending chat message...')
    await service.sendMessage('How do I fix TypeScript compilation errors?', 'project_123')
    
    // Demo 2: Search operation
    console.log('🔍 Searching for similar issues...')
    await service.searchSimilarIssues('typescript error', { repository: 'microsoft/TypeScript' })
    
    // Demo 3: AI response generation
    console.log('🤖 Generating AI response...')
    await service.generateAIResponse('Explain TypeScript generics', { context: 'beginner' })
    
    // Demo 4: Batch processing
    console.log('📦 Batch processing messages...')
    await service.batchProcessMessages([
      'What is React?',
      'How to use hooks?',
      'Best practices for TypeScript?'
    ])
    
    // Demo 5: Session management
    console.log('💾 Saving chat session...')
    await service.saveChatSession({
      project_id: 'project_123',
      user_id: 'user_456',
      messages: ['Hello', 'How are you?', 'Goodbye']
    })
    
    console.log('✅ Tracing demonstration completed successfully!')
    console.log('🔍 Check the /logs page to see all traced operations')
    
  } catch (error) {
    console.error('❌ Error during tracing demonstration:', error)
  }
}
