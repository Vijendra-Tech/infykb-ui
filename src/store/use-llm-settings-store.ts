import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LLMProvider = 'none' | 'openai' | 'azure' | 'anthropic' | 'google' | 'ollama' | 'llama';

export interface ModelOption {
  id: string;
  name: string;
  provider: LLMProvider;
}

// Define available models for each provider
export const providerModels: Record<Exclude<LLMProvider, 'none'>, ModelOption[]> = {
  // 'none' is not included here as it represents no selection
  openai: [
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai' },
    { id: 'gpt-4', name: 'GPT-4', provider: 'openai' },
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai' },
  ],
  azure: [
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'azure' },
    { id: 'gpt-4', name: 'GPT-4', provider: 'azure' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'azure' },
  ],
  anthropic: [
    { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'anthropic' },
    { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'anthropic' },
    { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'anthropic' },
  ],
  google: [
    { id: 'gemini-pro', name: 'Gemini Pro', provider: 'google' },
    { id: 'gemini-ultra', name: 'Gemini Ultra', provider: 'google' },
  ],
  ollama: [
    { id: 'llama3', name: 'Llama 3', provider: 'ollama' },
    { id: 'mistral', name: 'Mistral', provider: 'ollama' },
  ],
  llama: [
    { id: 'llama-3-8b', name: 'Llama 3 (8B)', provider: 'llama' },
    { id: 'llama-3-70b', name: 'Llama 3 (70B)', provider: 'llama' },
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
  setSelectedProvider: (provider: LLMProvider) => void;
  setSelectedModelId: (modelId: string) => void;
  setApiKey: (apiKey: string) => void;
  setAzureConfig: (config: { endpoint?: string; deploymentName?: string; apiVersion?: string }) => void;
  
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
