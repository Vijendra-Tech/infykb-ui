import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LLMModel = 'gpt-3.5-turbo' | 'gpt-4' | 'claude-3-opus' | 'claude-3-sonnet' | 'gemini-pro';

interface LLMSettingsState {
  selectedModel: LLMModel;
  apiKey: string;
  setSelectedModel: (model: LLMModel) => void;
  setApiKey: (apiKey: string) => void;
}

export const useLLMSettingsStore = create<LLMSettingsState>()(
  persist(
    (set) => ({
      selectedModel: 'gpt-3.5-turbo',
      apiKey: '',
      setSelectedModel: (selectedModel) => set({ selectedModel }),
      setApiKey: (apiKey) => set({ apiKey }),
    }),
    {
      name: 'llm-settings-storage',
    }
  )
);
