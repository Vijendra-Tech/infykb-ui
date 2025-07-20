export type UserRole = 'super_admin' | 'admin' | 'approver' | 'member';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  organizationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  domain: string;
  plan: 'free' | 'pro' | 'enterprise';
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
  createdBy: string;
  modelConfig?: {
    provider: string;
    modelId: string;
    apiKey: string;
    azureConfig?: {
      endpoint: string;
      deploymentName: string;
      apiVersion: string;
      embeddingModel?: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: 'admin' | 'member';
  addedBy: string;
  addedAt: Date;
}

export interface AccessRequest {
  id: string;
  userId: string;
  projectId: string;
  requestType: 'project_access' | 'model_key_access';
  status: 'pending' | 'approved' | 'rejected';
  message?: string;
  requestedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewNotes?: string;
}

export interface AuthState {
  user: User | null;
  organization: Organization | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  organizationName?: string;
  organizationDomain?: string;
  inviteCode?: string;
}
