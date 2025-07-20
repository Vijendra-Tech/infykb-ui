import { create } from 'zustand';
import { User, Project, ProjectMember, AccessRequest } from '@/lib/database';
import { organizationService, ProjectData, MemberInvite, AccessRequestData } from '@/lib/organization-service';

interface OrganizationState {
  // State
  members: User[];
  projects: Project[];
  accessRequests: (AccessRequest & { user: User; project?: Project })[];
  stats: {
    totalMembers: number;
    totalProjects: number;
    pendingRequests: number;
    activeProjects: number;
  };
  isLoading: boolean;
  error: string | null;

  // Actions
  loadMembers: () => Promise<void>;
  loadProjects: () => Promise<void>;
  loadAccessRequests: (status?: AccessRequest['status']) => Promise<void>;
  loadStats: () => Promise<void>;
  loadAll: () => Promise<void>;

  // Member management
  inviteMember: (invite: MemberInvite) => Promise<{ success: boolean; error?: string }>;
  updateMemberRole: (userId: string, role: User['role']) => Promise<{ success: boolean; error?: string }>;
  removeMember: (userId: string) => Promise<{ success: boolean; error?: string }>;

  // Project management
  createProject: (projectData: ProjectData) => Promise<{ success: boolean; error?: string }>;
  updateProject: (projectId: string, updates: Partial<ProjectData>) => Promise<{ success: boolean; error?: string }>;
  deleteProject: (projectId: string) => Promise<{ success: boolean; error?: string }>;
  getProjectMembers: (projectId: string) => Promise<(ProjectMember & { user: User })[]>;
  addProjectMember: (projectId: string, userId: string, role: 'admin' | 'member' | 'viewer') => Promise<{ success: boolean; error?: string }>;
  removeProjectMember: (projectId: string, userId: string) => Promise<{ success: boolean; error?: string }>;

  // Access request management
  createAccessRequest: (requestData: AccessRequestData) => Promise<{ success: boolean; error?: string }>;
  approveAccessRequest: (requestId: string, notes?: string) => Promise<{ success: boolean; error?: string }>;
  rejectAccessRequest: (requestId: string, notes?: string) => Promise<{ success: boolean; error?: string }>;

  // Utility
  clearError: () => void;
  getProjectById: (projectId: string) => Project | undefined;
  getMemberById: (userId: string) => User | undefined;
  getRequestById: (requestId: string) => (AccessRequest & { user: User; project?: Project }) | undefined;
}

export const useDexieOrganizationStore = create<OrganizationState>((set, get) => ({
  // Initial state
  members: [],
  projects: [],
  accessRequests: [],
  stats: {
    totalMembers: 0,
    totalProjects: 0,
    pendingRequests: 0,
    activeProjects: 0
  },
  isLoading: false,
  error: null,

  // Load data actions
  loadMembers: async () => {
    try {
      set({ isLoading: true, error: null });
      const members = await organizationService.getMembers();
      set({ members, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load members';
      set({ error: errorMessage, isLoading: false });
    }
  },

  loadProjects: async () => {
    try {
      set({ isLoading: true, error: null });
      const projects = await organizationService.getProjects();
      set({ projects, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load projects';
      set({ error: errorMessage, isLoading: false });
    }
  },

  loadAccessRequests: async (status?: AccessRequest['status']) => {
    try {
      set({ isLoading: true, error: null });
      const accessRequests = await organizationService.getAccessRequests(status);
      set({ accessRequests, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load access requests';
      set({ error: errorMessage, isLoading: false });
    }
  },

  loadStats: async () => {
    try {
      const stats = await organizationService.getOrganizationStats();
      set({ stats });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  },

  loadAll: async () => {
    const { loadMembers, loadProjects, loadAccessRequests, loadStats } = get();
    await Promise.all([
      loadMembers(),
      loadProjects(),
      loadAccessRequests(),
      loadStats()
    ]);
  },

  // Member management
  inviteMember: async (invite: MemberInvite) => {
    try {
      set({ isLoading: true, error: null });
      const result = await organizationService.inviteMember(invite);
      
      if (result.success) {
        // Reload members to get updated list
        await get().loadMembers();
        await get().loadStats();
      } else {
        set({ error: result.error, isLoading: false });
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to invite member';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  updateMemberRole: async (userId: string, role: User['role']) => {
    try {
      set({ isLoading: true, error: null });
      const result = await organizationService.updateMemberRole(userId, role);
      
      if (result.success) {
        // Update member in local state
        const { members } = get();
        const updatedMembers = members.map(member => 
          member.uuid === userId ? { ...member, role } : member
        );
        set({ members: updatedMembers, isLoading: false });
      } else {
        set({ error: result.error, isLoading: false });
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update member role';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  removeMember: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      const result = await organizationService.removeMember(userId);
      
      if (result.success) {
        // Remove member from local state
        const { members } = get();
        const updatedMembers = members.filter(member => member.uuid !== userId);
        set({ members: updatedMembers, isLoading: false });
        await get().loadStats();
      } else {
        set({ error: result.error, isLoading: false });
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove member';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Project management
  createProject: async (projectData: ProjectData) => {
    try {
      set({ isLoading: true, error: null });
      const result = await organizationService.createProject(projectData);
      
      if (result.success) {
        // Reload projects to get updated list
        await get().loadProjects();
        await get().loadStats();
      } else {
        set({ error: result.error, isLoading: false });
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create project';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  updateProject: async (projectId: string, updates: Partial<ProjectData>) => {
    try {
      set({ isLoading: true, error: null });
      const result = await organizationService.updateProject(projectId, updates);
      
      if (result.success) {
        // Update project in local state
        const { projects } = get();
        const updatedProjects = projects.map(project => 
          project.uuid === projectId ? { ...project, ...updates, updatedAt: new Date() } : project
        );
        set({ projects: updatedProjects, isLoading: false });
      } else {
        set({ error: result.error, isLoading: false });
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update project';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  deleteProject: async (projectId: string) => {
    try {
      set({ isLoading: true, error: null });
      const result = await organizationService.deleteProject(projectId);
      
      if (result.success) {
        // Remove project from local state
        const { projects } = get();
        const updatedProjects = projects.filter(project => project.uuid !== projectId);
        set({ projects: updatedProjects, isLoading: false });
        await get().loadStats();
      } else {
        set({ error: result.error, isLoading: false });
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete project';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  getProjectMembers: async (projectId: string) => {
    try {
      return await organizationService.getProjectMembers(projectId);
    } catch (error) {
      console.error('Failed to get project members:', error);
      return [];
    }
  },

  addProjectMember: async (projectId: string, userId: string, role: 'admin' | 'member' | 'viewer') => {
    try {
      const result = await organizationService.addProjectMember(projectId, userId, role);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add project member';
      return { success: false, error: errorMessage };
    }
  },

  removeProjectMember: async (projectId: string, userId: string) => {
    try {
      const result = await organizationService.removeProjectMember(projectId, userId);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove project member';
      return { success: false, error: errorMessage };
    }
  },

  // Access request management
  createAccessRequest: async (requestData: AccessRequestData) => {
    try {
      set({ isLoading: true, error: null });
      const result = await organizationService.createAccessRequest(requestData);
      
      if (result.success) {
        // Reload access requests to get updated list
        await get().loadAccessRequests();
        await get().loadStats();
      } else {
        set({ error: result.error, isLoading: false });
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create access request';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  approveAccessRequest: async (requestId: string, notes?: string) => {
    try {
      set({ isLoading: true, error: null });
      const result = await organizationService.approveAccessRequest(requestId, notes);
      
      if (result.success) {
        // Update request in local state
        const { accessRequests } = get();
        const updatedRequests = accessRequests.map(request => 
          request.uuid === requestId 
            ? { ...request, status: 'approved' as const, reviewedAt: new Date(), reviewNotes: notes }
            : request
        );
        set({ accessRequests: updatedRequests, isLoading: false });
        await get().loadStats();
      } else {
        set({ error: result.error, isLoading: false });
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to approve access request';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  rejectAccessRequest: async (requestId: string, notes?: string) => {
    try {
      set({ isLoading: true, error: null });
      const result = await organizationService.rejectAccessRequest(requestId, notes);
      
      if (result.success) {
        // Update request in local state
        const { accessRequests } = get();
        const updatedRequests = accessRequests.map(request => 
          request.uuid === requestId 
            ? { ...request, status: 'rejected' as const, reviewedAt: new Date(), reviewNotes: notes }
            : request
        );
        set({ accessRequests: updatedRequests, isLoading: false });
        await get().loadStats();
      } else {
        set({ error: result.error, isLoading: false });
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reject access request';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Utility methods
  clearError: () => {
    set({ error: null });
  },

  getProjectById: (projectId: string) => {
    const { projects } = get();
    return projects.find(project => project.uuid === projectId);
  },

  getMemberById: (userId: string) => {
    const { members } = get();
    return members.find(member => member.uuid === userId);
  },

  getRequestById: (requestId: string) => {
    const { accessRequests } = get();
    return accessRequests.find(request => request.uuid === requestId);
  }
}));
