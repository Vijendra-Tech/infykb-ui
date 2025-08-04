import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type IngestionSourceType = 'File Upload' | 'API Endpoint' | 'Database' | 'JIRA' | 'Salesforce' | 'GitHub';

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
  description?: string;
  lastIngested?: string; // ISO date string if ingested, undefined if never ingested
  // New tracking fields
  ingestStats?: {
    totalDocuments?: number;
    processedDocuments?: number;
    failedDocuments?: number;
    startTime?: string; // ISO date string
    endTime?: string; // ISO date string
    durationMs?: number; // Duration in milliseconds
  };
  errorDetails?: {
    message?: string;
    code?: string;
    timestamp?: string; // ISO date string
  };
  ingestHistory?: Array<{
    timestamp: string; // ISO date string
    status: IngestionStatus;
    recordCount?: number;
    durationMs?: number;
    errorMessage?: string;
  }>;
  // Resubmission tracking
  lastResubmission?: {
    resubmissionType: 'all' | 'selective';
    documentIds?: string[];
    timestamp: string; // ISO date string
  };
}

interface DataIngestionState {
  sources: IngestionSource[];
  addSource: (source: Omit<IngestionSource, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'ingestStats' | 'errorDetails' | 'ingestHistory' | 'lastResubmission'>) => string;
  editSource: (id: string, updates: Partial<Omit<IngestionSource, 'id' | 'createdAt' | 'ingestHistory' | 'lastResubmission'>>) => void;
  updateSourceStatus: (id: string, status: IngestionStatus, recordCount?: number) => void;
  startIngestion: (id: string) => void;
  completeIngestion: (id: string, recordCount: number, stats?: Partial<IngestionSource['ingestStats']>) => void;
  failIngestion: (id: string, errorMessage: string, errorCode?: string) => void;
  resubmitIngestion: (id: string, selectedDocuments?: string[]) => void;
  deleteSource: (id: string) => void;
  clearSources: () => void;
  getSourceStats: (id: string) => {
    totalIngestions: number;
    successRate: number;
    averageDuration: number;
    lastError?: string;
  } | null;
}

export const useDataIngestionStore = create<DataIngestionState>()(
  persist(
    (set, get) => ({
      sources: [],
      addSource: (source) => {
        const now = new Date().toISOString();
        const id = Math.random().toString(36).substring(2, 9);
        
        set((state) => ({
          sources: [
            ...state.sources,
            {
              id,
              status: 'Ready',
              createdAt: now,
              updatedAt: now,
              ingestHistory: [],
              ...source,
            },
          ],
        }));
        
        return id;
      },
      
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
        set((state) => {
          const now = new Date().toISOString();
          return {
            sources: state.sources.map((source) => 
              source.id === id 
                ? { 
                    ...source, 
                    status: 'Processing',
                    ingestStats: {
                      ...source.ingestStats,
                      startTime: now,
                      processedDocuments: 0,
                      failedDocuments: 0
                    }
                  } 
                : source
            ),
          };
        }),
      completeIngestion: (id, recordCount, stats) =>
        set((state) => {
          const now = new Date().toISOString();
          const source = state.sources.find(s => s.id === id);
          if (!source) return { sources: state.sources };
          
          const startTime = source.ingestStats?.startTime ? new Date(source.ingestStats.startTime) : new Date(now);
          const endTime = new Date(now);
          const durationMs = endTime.getTime() - startTime.getTime();
          
          const historyEntry = {
            timestamp: now,
            status: 'Completed' as IngestionStatus,
            recordCount,
            durationMs
          };
          
          return {
            sources: state.sources.map((source) => 
              source.id === id 
                ? { 
                    ...source, 
                    status: 'Completed',
                    lastIngested: now,
                    recordCount,
                    ingestStats: {
                      ...source.ingestStats,
                      ...stats,
                      endTime: now,
                      durationMs,
                      totalDocuments: recordCount,
                      processedDocuments: recordCount - (source.ingestStats?.failedDocuments || 0)
                    },
                    ingestHistory: [
                      ...(source.ingestHistory || []),
                      historyEntry
                    ]
                  } 
                : source
            ),
          };
        }),
      failIngestion: (id, errorMessage, errorCode) =>
        set((state) => {
          const now = new Date().toISOString();
          const source = state.sources.find(s => s.id === id);
          if (!source) return { sources: state.sources };
          
          const startTime = source.ingestStats?.startTime ? new Date(source.ingestStats.startTime) : new Date(now);
          const endTime = new Date(now);
          const durationMs = endTime.getTime() - startTime.getTime();
          
          const historyEntry = {
            timestamp: now,
            status: 'Failed' as IngestionStatus,
            errorMessage,
            durationMs
          };
          
          return {
            sources: state.sources.map((source) => 
              source.id === id 
                ? { 
                    ...source, 
                    status: 'Failed',
                    errorDetails: {
                      message: errorMessage,
                      code: errorCode,
                      timestamp: now
                    },
                    ingestStats: {
                      ...source.ingestStats,
                      endTime: now,
                      durationMs
                    },
                    ingestHistory: [
                      ...(source.ingestHistory || []),
                      historyEntry
                    ]
                  } 
                : source
            ),
          };
        }),
      resubmitIngestion: (id, selectedDocuments) =>
        set((state) => {
          const sourceIndex = state.sources.findIndex((source) => source.id === id);
          if (sourceIndex === -1) return state;

          const updatedSources = [...state.sources];
          const source = updatedSources[sourceIndex];
          
          // Store the failed documents that were selected for resubmission
          // This will be used in the future for selective resubmission
          const resubmissionData = selectedDocuments ? {
            resubmissionType: 'selective' as const,
            documentIds: selectedDocuments,
            timestamp: new Date().toISOString(),
          } : {
            resubmissionType: 'all' as const,
            timestamp: new Date().toISOString(),
          };
          
          updatedSources[sourceIndex] = {
            ...source,
            status: 'Ready',
            errorDetails: undefined,
            // Store resubmission data in the source for future reference
            lastResubmission: resubmissionData,
          };

          return { sources: updatedSources };
        }),
      deleteSource: (id) =>
        set((state) => ({
          sources: state.sources.filter((source) => source.id !== id),
        })),
      clearSources: () => set({ sources: [] }),
      getSourceStats: (id) => {
        const state = get();
        const source = state.sources.find(s => s.id === id);
        
        if (!source || !source.ingestHistory || source.ingestHistory.length === 0) {
          return null;
        }
        
        const history = source.ingestHistory;
        const totalIngestions = history.length;
        const successfulIngestions = history.filter(h => h.status === 'Completed').length;
        const successRate = totalIngestions > 0 ? (successfulIngestions / totalIngestions) * 100 : 0;
        
        const durationsMs = history
          .filter(h => h.durationMs !== undefined)
          .map(h => h.durationMs as number);
          
        const averageDuration = durationsMs.length > 0 
          ? durationsMs.reduce((sum, duration) => sum + duration, 0) / durationsMs.length 
          : 0;
        
        const failedIngestions = history.filter(h => h.status === 'Failed');
        const lastError = failedIngestions.length > 0 
          ? failedIngestions[failedIngestions.length - 1].errorMessage 
          : undefined;
        
        return {
          totalIngestions,
          successRate,
          averageDuration,
          lastError
        };
      },
    }),
    {
      name: 'data-ingestion-storage',
    }
  )
);
