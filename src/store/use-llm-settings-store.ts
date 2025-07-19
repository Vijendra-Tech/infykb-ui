import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LLMProvider = 'none' | 'openai' | 'azure' | 'anthropic' | 'google' | 'ollama' | 'llama';

export interface ModelOption {
  id: string;
  name: string;
  provider: LLMProvider;
  contextLength: number; // Maximum context length in tokens
  inputPricing: number; // Cost per million input tokens in USD
  outputPricing: number; // Cost per million output tokens in USD
  description?: string; // Optional description of the model
}

// Define available models for each provider
export const providerModels: Record<Exclude<LLMProvider, 'none'>, ModelOption[]> = {
  // 'none' is not included here as it represents no selection
  openai: [
    { 
      id: 'gpt-3.5-turbo', 
      name: 'GPT-3.5 Turbo', 
      provider: 'openai',
      contextLength: 16385,
      inputPricing: 0.50,
      outputPricing: 1.50,
      description: 'Fast and efficient model for most tasks'
    },
    { 
      id: 'gpt-4', 
      name: 'GPT-4', 
      provider: 'openai',
      contextLength: 8192,
      inputPricing: 30.00,
      outputPricing: 60.00,
      description: 'Most capable model for complex reasoning tasks'
    },
    { 
      id: 'gpt-4o', 
      name: 'GPT-4o', 
      provider: 'openai',
      contextLength: 128000,
      inputPricing: 5.00,
      outputPricing: 15.00,
      description: 'Multimodal flagship model with vision capabilities'
    },
    { 
      id: 'gpt-4o-mini', 
      name: 'GPT-4o Mini', 
      provider: 'openai',
      contextLength: 128000,
      inputPricing: 0.15,
      outputPricing: 0.60,
      description: 'Affordable small model for fast, lightweight tasks'
    },
  ],
  azure: [
    { 
      id: 'gpt-3.5-turbo', 
      name: 'GPT-3.5 Turbo', 
      provider: 'azure',
      contextLength: 16385,
      inputPricing: 0.50,
      outputPricing: 1.50,
      description: 'Fast and efficient model for most tasks (Azure)'
    },
    { 
      id: 'gpt-4', 
      name: 'GPT-4', 
      provider: 'azure',
      contextLength: 8192,
      inputPricing: 30.00,
      outputPricing: 60.00,
      description: 'Most capable model for complex reasoning (Azure)'
    },
    { 
      id: 'gpt-4-turbo', 
      name: 'GPT-4 Turbo', 
      provider: 'azure',
      contextLength: 128000,
      inputPricing: 10.00,
      outputPricing: 30.00,
      description: 'Enhanced GPT-4 with larger context window (Azure)'
    },
  ],
  anthropic: [
    { 
      id: 'claude-3-opus', 
      name: 'Claude 3 Opus', 
      provider: 'anthropic',
      contextLength: 200000,
      inputPricing: 15.00,
      outputPricing: 75.00,
      description: 'Most powerful model for highly complex tasks'
    },
    { 
      id: 'claude-3-sonnet', 
      name: 'Claude 3 Sonnet', 
      provider: 'anthropic',
      contextLength: 200000,
      inputPricing: 3.00,
      outputPricing: 15.00,
      description: 'Balanced performance and speed for enterprise workloads'
    },
    { 
      id: 'claude-3-haiku', 
      name: 'Claude 3 Haiku', 
      provider: 'anthropic',
      contextLength: 200000,
      inputPricing: 0.25,
      outputPricing: 1.25,
      description: 'Fastest model for lightweight tasks'
    },
  ],
  google: [
    { 
      id: 'gemini-pro', 
      name: 'Gemini Pro', 
      provider: 'google',
      contextLength: 32768,
      inputPricing: 0.50,
      outputPricing: 1.50,
      description: 'Versatile model for diverse tasks'
    },
    { 
      id: 'gemini-ultra', 
      name: 'Gemini Ultra', 
      provider: 'google',
      contextLength: 32768,
      inputPricing: 2.50,
      outputPricing: 7.50,
      description: 'Most capable model for complex reasoning'
    },
  ],
  ollama: [
    { 
      id: 'llama3', 
      name: 'Llama 3', 
      provider: 'ollama',
      contextLength: 8192,
      inputPricing: 0.00,
      outputPricing: 0.00,
      description: 'Open-source model running locally (free)'
    },
    { 
      id: 'mistral', 
      name: 'Mistral', 
      provider: 'ollama',
      contextLength: 8192,
      inputPricing: 0.00,
      outputPricing: 0.00,
      description: 'Efficient open-source model (free)'
    },
  ],
  llama: [
    { 
      id: 'llama-3-8b', 
      name: 'Llama 3 (8B)', 
      provider: 'llama',
      contextLength: 8192,
      inputPricing: 0.15,
      outputPricing: 0.15,
      description: 'Smaller, faster Llama 3 model'
    },
    { 
      id: 'llama-3-70b', 
      name: 'Llama 3 (70B)', 
      provider: 'llama',
      contextLength: 8192,
      inputPricing: 0.65,
      outputPricing: 0.65,
      description: 'Larger, more capable Llama 3 model'
    },
  ],
};

// Provider display names
export const providerNames: Record<LLMProvider, string> = {
  none: 'Select Provider',
  openai: 'OpenAI',
  azure: 'Azure OpenAI',
  anthropic: 'Anthropic',
  google: 'Google AI',
  ollama: 'Ollama',
  llama: 'Llama',
};

interface LLMSettingsState {
  selectedProvider: LLMProvider;
  selectedModelId: string;
  apiKey: string;
  azureApiEndpoint?: string;
  azureDeploymentName?: string;
  azureApiVersion?: string;
  azureEmbeddingModel?: string;
  setSelectedProvider: (provider: LLMProvider) => void;
  setSelectedModelId: (modelId: string) => void;
  setApiKey: (apiKey: string) => void;
  setAzureConfig: (config: { endpoint?: string; deploymentName?: string; apiVersion?: string; embeddingModel?: string }) => void;
  
  // Helper computed properties
  getCurrentModel: () => ModelOption | undefined;
  getAvailableModels: () => ModelOption[];
}

export const useLLMSettingsStore = create<LLMSettingsState>()(
  persist(
    (set, get) => ({
      selectedProvider: 'none',
      selectedModelId: 'gpt-3.5-turbo',
      apiKey: '',
      azureApiEndpoint: '',
      azureDeploymentName: '',
      azureApiVersion: '2023-12-01-preview',
      azureEmbeddingModel: '',
      
      setSelectedProvider: (selectedProvider) => {
        // Handle 'none' case separately
        if (selectedProvider === 'none') {
          set({ selectedProvider, selectedModelId: '' });
          return;
        }
        
        // For other providers, get available models
        const availableModels = providerModels[selectedProvider as Exclude<LLMProvider, 'none'>] || [];
        // Set the first model of the new provider as default
        const defaultModelId = availableModels.length > 0 ? availableModels[0].id : '';
        set({ selectedProvider, selectedModelId: defaultModelId });
      },
      
      setSelectedModelId: (selectedModelId) => set({ selectedModelId }),
      
      setApiKey: (apiKey) => set({ apiKey }),
      
      setAzureConfig: (config) => set({
        azureApiEndpoint: config.endpoint ?? '',
        azureDeploymentName: config.deploymentName ?? '',
        azureApiVersion: config.apiVersion ?? '2023-12-01-preview',
        azureEmbeddingModel: config.embeddingModel ?? '',
      }),
      
      // Helper methods
      getCurrentModel: () => {
        const state = get();
        if (state.selectedProvider === 'none') return undefined;
        
        const models = providerModels[state.selectedProvider as Exclude<LLMProvider, 'none'>] || [];
        return models.find((model) => model.id === state.selectedModelId);
      },
      
      getAvailableModels: () => {
        const state = get();
        if (state.selectedProvider === 'none') return [];
        return providerModels[state.selectedProvider as Exclude<LLMProvider, 'none'>] || [];
      },
    }),
    {
      name: 'llm-settings-storage',
    }
  )
);
