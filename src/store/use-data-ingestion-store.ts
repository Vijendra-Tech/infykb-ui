import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type IngestionSourceType = 'File Upload' | 'API Endpoint' | 'Database' | 'JIRA' | 'Confluence' | 'ADO';

export type IngestionStatus = 'Ready' | 'Processing' | 'Completed' | 'Failed';

export interface IngestionSource {
  id: string;
  name: string;
  type: IngestionSourceType;
  status: IngestionStatus;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  recordCount?: number;
  url?: string;
  username?: string;
  password?: string;
  lastIngested?: string; // ISO date string if ingested, undefined if never ingested
}

type NewSourceInput = {
  name: string;
  type: IngestionSourceType;
  url?: string;
  username?: string;
  password?: string;
};

interface DataIngestionState {
  sources: IngestionSource[];
  addSource: (source: Omit<IngestionSource, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => void;
  editSource: (id: string, updates: Partial<Omit<IngestionSource, 'id' | 'createdAt'>>) => void;
  updateSourceStatus: (id: string, status: IngestionStatus, recordCount?: number) => void;
  startIngestion: (id: string) => void;
  completeIngestion: (id: string, recordCount: number) => void;
  deleteSource: (id: string) => void;
  clearSources: () => void;
}

export const useDataIngestionStore = create<DataIngestionState>()(
  persist(
    (set) => ({
      sources: [],
      addSource: (source) => 
        set((state) => {
          const now = new Date().toISOString();
          return {
            sources: [
              ...state.sources,
              {
                id: Math.random().toString(36).substring(2, 9),
                status: 'Ready',
                createdAt: now,
                updatedAt: now,
                ...source,
              },
            ],
          };
        }),
      
      editSource: (id, updates) =>
        set((state) => {
          const now = new Date().toISOString();
          return {
            sources: state.sources.map((source) =>
              source.id === id
                ? {
                    ...source,
                    ...updates,
                    updatedAt: now,
                  }
                : source
            ),
          };
        }),
      updateSourceStatus: (id, status, recordCount) =>
        set((state) => ({
          sources: state.sources.map((source) => 
            source.id === id 
              ? { 
                  ...source, 
                  status, 
                  ...(recordCount !== undefined ? { recordCount } : {})
                } 
              : source
          ),
        })),
      startIngestion: (id) =>
        set((state) => ({
          sources: state.sources.map((source) => 
            source.id === id 
              ? { 
                  ...source, 
                  status: 'Processing',
                } 
              : source
          ),
        })),
      completeIngestion: (id, recordCount) =>
        set((state) => ({
          sources: state.sources.map((source) => 
            source.id === id 
              ? { 
                  ...source, 
                  status: 'Completed',
                  lastIngested: new Date().toISOString(),
                  recordCount,
                } 
              : source
          ),
        })),
      deleteSource: (id) =>
        set((state) => ({
          sources: state.sources.filter((source) => source.id !== id),
        })),
      clearSources: () => set({ sources: [] }),
    }),
    {
      name: 'data-ingestion-storage',
    }
  )
);
