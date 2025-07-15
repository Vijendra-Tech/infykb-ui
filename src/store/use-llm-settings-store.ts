import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LLMModel = 
  | 'gpt-3.5-turbo' 
  | 'gpt-4' 
  | 'claude-3-opus' 
  | 'claude-3-sonnet' 
  | 'gemini-pro'
  | 'azure-gpt-3.5-turbo'
  | 'azure-gpt-4'
  | 'azure-gpt-4-turbo';

export type LLMProvider = 'openai' | 'anthropic' | 'google' | 'azure';

export const getProviderFromModel = (model: LLMModel): LLMProvider => {
  if (model.startsWith('gpt')) return 'openai';
  if (model.startsWith('claude')) return 'anthropic';
  if (model.startsWith('gemini')) return 'google';
  if (model.startsWith('azure')) return 'azure';
  return 'openai'; // Default
};

interface LLMSettingsState {
  selectedModel: LLMModel;
  apiKey: string;
  azureApiEndpoint?: string;
  azureDeploymentName?: string;
  azureApiVersion?: string;
  setSelectedModel: (model: LLMModel) => void;
  setApiKey: (apiKey: string) => void;
  setAzureConfig: (config: { endpoint?: string; deploymentName?: string; apiVersion?: string }) => void;
}

export const useLLMSettingsStore = create<LLMSettingsState>()(
  persist(
    (set) => ({
      selectedModel: 'gpt-3.5-turbo',
      apiKey: '',
      azureApiEndpoint: '',
      azureDeploymentName: '',
      azureApiVersion: '2023-12-01-preview',
      setSelectedModel: (selectedModel) => set({ selectedModel }),
      setApiKey: (apiKey) => set({ apiKey }),
      setAzureConfig: (config) => set({
        azureApiEndpoint: config.endpoint ?? '',
        azureDeploymentName: config.deploymentName ?? '',
        azureApiVersion: config.apiVersion ?? '2023-12-01-preview',
      }),
    }),
    {
      name: 'llm-settings-storage',
    }
  )
);
