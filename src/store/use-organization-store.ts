import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Project, ProjectMember, AccessRequest } from '@/types/auth';

interface OrganizationStore {
  // State
  members: User[];
  projects: Project[];
  projectMembers: ProjectMember[];
  accessRequests: AccessRequest[];
  isLoading: boolean;

  // Actions
  fetchMembers: () => Promise<void>;
  fetchProjects: () => Promise<void>;
  fetchAccessRequests: () => Promise<void>;
  
  // Member management
  inviteMember: (email: string, role: string) => Promise<{ success: boolean; error?: string }>;
  updateMemberRole: (userId: string, role: string) => Promise<{ success: boolean; error?: string }>;
  removeMember: (userId: string) => Promise<{ success: boolean; error?: string }>;
  
  // Project management
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; project?: Project; error?: string }>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<{ success: boolean; error?: string }>;
  deleteProject: (projectId: string) => Promise<{ success: boolean; error?: string }>;
  
  // Project member management
  addProjectMember: (projectId: string, userId: string, role: 'admin' | 'member') => Promise<{ success: boolean; error?: string }>;
  removeProjectMember: (projectId: string, userId: string) => Promise<{ success: boolean; error?: string }>;
  updateProjectMemberRole: (projectId: string, userId: string, role: 'admin' | 'member') => Promise<{ success: boolean; error?: string }>;
  
  // Access request management
  createAccessRequest: (request: Omit<AccessRequest, 'id' | 'requestedAt' | 'status'>) => Promise<{ success: boolean; error?: string }>;
  approveAccessRequest: (requestId: string, reviewNotes?: string) => Promise<{ success: boolean; error?: string }>;
  rejectAccessRequest: (requestId: string, reviewNotes?: string) => Promise<{ success: boolean; error?: string }>;
  
  // Helper methods
  getProjectMembers: (projectId: string) => User[];
  getUserProjects: (userId: string) => Project[];
  getPendingRequests: () => AccessRequest[];
}

// Mock data for demonstration
const mockMembers: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    organizationId: 'org-1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    email: 'member@example.com',
    name: 'Member User',
    role: 'member',
    organizationId: 'org-1',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    id: '3',
    email: 'approver@example.com',
    name: 'Approver User',
    role: 'approver',
    organizationId: 'org-1',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
  },
  {
    id: '4',
    email: 'john.doe@example.com',
    name: 'John Doe',
    role: 'member',
    organizationId: 'org-1',
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-04'),
  },
];

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Marketing Analytics',
    description: 'AI-powered marketing insights and analytics',
    organizationId: 'org-1',
    createdBy: '1',
    modelConfig: {
      provider: 'openai',
      modelId: 'gpt-4o',
      apiKey: 'sk-...',
    },
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Customer Support Bot',
    description: 'Automated customer service chatbot',
    organizationId: 'org-1',
    createdBy: '1',
    modelConfig: {
      provider: 'anthropic',
      modelId: 'claude-3-sonnet',
      apiKey: 'sk-ant-...',
    },
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-14'),
  },
  {
    id: '3',
    name: 'Data Processing Pipeline',
    description: 'Large-scale data analysis and processing',
    organizationId: 'org-1',
    createdBy: '1',
    modelConfig: {
      provider: 'azure',
      modelId: 'gpt-4',
      apiKey: 'azure-key',
      azureConfig: {
        endpoint: 'https://example.openai.azure.com/',
        deploymentName: 'gpt-4-deployment',
        apiVersion: '2023-12-01-preview',
        embeddingModel: 'text-embedding-ada-002',
      },
    },
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-12'),
  },
];

const mockProjectMembers: ProjectMember[] = [
  { id: '1', projectId: '1', userId: '1', role: 'admin', addedBy: '1', addedAt: new Date('2024-01-10') },
  { id: '2', projectId: '1', userId: '2', role: 'member', addedBy: '1', addedAt: new Date('2024-01-11') },
  { id: '3', projectId: '1', userId: '4', role: 'member', addedBy: '1', addedAt: new Date('2024-01-12') },
  { id: '4', projectId: '2', userId: '1', role: 'admin', addedBy: '1', addedAt: new Date('2024-01-12') },
  { id: '5', projectId: '2', userId: '3', role: 'member', addedBy: '1', addedAt: new Date('2024-01-13') },
  { id: '6', projectId: '3', userId: '1', role: 'admin', addedBy: '1', addedAt: new Date('2024-01-08') },
  { id: '7', projectId: '3', userId: '2', role: 'member', addedBy: '1', addedAt: new Date('2024-01-09') },
];

const mockAccessRequests: AccessRequest[] = [
  {
    id: '1',
    userId: '4',
    projectId: '2',
    requestType: 'project_access',
    status: 'pending',
    message: 'I would like to contribute to the customer support bot project.',
    requestedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    userId: '2',
    projectId: '3',
    requestType: 'model_key_access',
    status: 'pending',
    message: 'Need access to the Azure OpenAI model for data processing tasks.',
    requestedAt: new Date('2024-01-14'),
  },
  {
    id: '3',
    userId: '3',
    projectId: '1',
    requestType: 'project_access',
    status: 'approved',
    message: 'Requesting access to marketing analytics project.',
    requestedAt: new Date('2024-01-13'),
    reviewedAt: new Date('2024-01-14'),
    reviewedBy: '1',
    reviewNotes: 'Approved for marketing team collaboration.',
  },
];

export const useOrganizationStore = create<OrganizationStore>()(
  persist(
    (set, get) => ({
      members: mockMembers,
      projects: mockProjects,
      projectMembers: mockProjectMembers,
      accessRequests: mockAccessRequests,
      isLoading: false,

      fetchMembers: async () => {
        set({ isLoading: true });
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        set({ members: mockMembers, isLoading: false });
      },

      fetchProjects: async () => {
        set({ isLoading: true });
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        set({ projects: mockProjects, isLoading: false });
      },

      fetchAccessRequests: async () => {
        set({ isLoading: true });
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        set({ accessRequests: mockAccessRequests, isLoading: false });
      },

      inviteMember: async (email: string, role: string) => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const newMember: User = {
          id: Math.random().toString(36).substr(2, 9),
          email,
          name: email.split('@')[0],
          role: role as any,
          organizationId: 'org-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set(state => ({
          members: [...state.members, newMember],
          isLoading: false,
        }));

        return { success: true };
      },

      updateMemberRole: async (userId: string, role: string) => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 500));

        set(state => ({
          members: state.members.map(member =>
            member.id === userId ? { ...member, role: role as any, updatedAt: new Date() } : member
          ),
          isLoading: false,
        }));

        return { success: true };
      },

      removeMember: async (userId: string) => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 500));

        set(state => ({
          members: state.members.filter(member => member.id !== userId),
          projectMembers: state.projectMembers.filter(pm => pm.userId !== userId),
          isLoading: false,
        }));

        return { success: true };
      },

      createProject: async (projectData) => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 1000));

        const newProject: Project = {
          ...projectData,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set(state => ({
          projects: [...state.projects, newProject],
          isLoading: false,
        }));

        return { success: true, project: newProject };
      },

      updateProject: async (projectId: string, updates: Partial<Project>) => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 500));

        set(state => ({
          projects: state.projects.map(project =>
            project.id === projectId ? { ...project, ...updates, updatedAt: new Date() } : project
          ),
          isLoading: false,
        }));

        return { success: true };
      },

      deleteProject: async (projectId: string) => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 500));

        set(state => ({
          projects: state.projects.filter(project => project.id !== projectId),
          projectMembers: state.projectMembers.filter(pm => pm.projectId !== projectId),
          accessRequests: state.accessRequests.filter(req => req.projectId !== projectId),
          isLoading: false,
        }));

        return { success: true };
      },

      addProjectMember: async (projectId: string, userId: string, role: 'admin' | 'member') => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 500));

        const newProjectMember: ProjectMember = {
          id: Math.random().toString(36).substr(2, 9),
          projectId,
          userId,
          role,
          addedBy: '1', // Current user ID
          addedAt: new Date(),
        };

        set(state => ({
          projectMembers: [...state.projectMembers, newProjectMember],
          isLoading: false,
        }));

        return { success: true };
      },

      removeProjectMember: async (projectId: string, userId: string) => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 500));

        set(state => ({
          projectMembers: state.projectMembers.filter(
            pm => !(pm.projectId === projectId && pm.userId === userId)
          ),
          isLoading: false,
        }));

        return { success: true };
      },

      updateProjectMemberRole: async (projectId: string, userId: string, role: 'admin' | 'member') => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 500));

        set(state => ({
          projectMembers: state.projectMembers.map(pm =>
            pm.projectId === projectId && pm.userId === userId
              ? { ...pm, role }
              : pm
          ),
          isLoading: false,
        }));

        return { success: true };
      },

      createAccessRequest: async (requestData) => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 500));

        const newRequest: AccessRequest = {
          ...requestData,
          id: Math.random().toString(36).substr(2, 9),
          status: 'pending',
          requestedAt: new Date(),
        };

        set(state => ({
          accessRequests: [...state.accessRequests, newRequest],
          isLoading: false,
        }));

        return { success: true };
      },

      approveAccessRequest: async (requestId: string, reviewNotes?: string) => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 500));

        set(state => ({
          accessRequests: state.accessRequests.map(request =>
            request.id === requestId
              ? {
                  ...request,
                  status: 'approved' as const,
                  reviewedAt: new Date(),
                  reviewedBy: '1', // Current user ID
                  reviewNotes,
                }
              : request
          ),
          isLoading: false,
        }));

        return { success: true };
      },

      rejectAccessRequest: async (requestId: string, reviewNotes?: string) => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 500));

        set(state => ({
          accessRequests: state.accessRequests.map(request =>
            request.id === requestId
              ? {
                  ...request,
                  status: 'rejected' as const,
                  reviewedAt: new Date(),
                  reviewedBy: '1', // Current user ID
                  reviewNotes,
                }
              : request
          ),
          isLoading: false,
        }));

        return { success: true };
      },

      getProjectMembers: (projectId: string) => {
        const state = get();
        const memberIds = state.projectMembers
          .filter(pm => pm.projectId === projectId)
          .map(pm => pm.userId);
        return state.members.filter(member => memberIds.includes(member.id));
      },

      getUserProjects: (userId: string) => {
        const state = get();
        const projectIds = state.projectMembers
          .filter(pm => pm.userId === userId)
          .map(pm => pm.projectId);
        return state.projects.filter(project => projectIds.includes(project.id));
      },

      getPendingRequests: () => {
        const state = get();
        return state.accessRequests.filter(request => request.status === 'pending');
      },
    }),
    {
      name: 'organization-storage',
      partialize: (state) => ({
        members: state.members,
        projects: state.projects,
        projectMembers: state.projectMembers,
        accessRequests: state.accessRequests,
      }),
    }
  )
);
