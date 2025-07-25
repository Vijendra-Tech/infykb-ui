import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Organization } from '@/types/auth';

interface AuthStore {
  // State
  user: User | null;
  organization: Organization | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    organizationName?: string;
    organizationDomain?: string;
    inviteCode?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  
  // Helper methods
  isAdmin: () => boolean;
  canApprove: () => boolean;
  canManageProjects: () => boolean;
}

// Mock authentication service - replace with real API calls
const mockAuthService = {
  async login(email: string, password: string): Promise<{ user: User; organization: Organization } | null> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful login for demo
    if (email === 'admin@example.com' && password === 'admin123') {
      return {
        user: {
          id: '1',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin',
          organizationId: 'org-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        organization: {
          id: 'org-1',
          name: 'Demo Organization',
          domain: 'example.com',
          plan: 'free',
          ownerId: '1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };
    }
    
    if (email === 'member@example.com' && password === 'member123') {
      return {
        user: {
          id: '2',
          email: 'member@example.com',
          name: 'Member User',
          role: 'member',
          organizationId: 'org-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        organization: {
          id: 'org-1',
          name: 'Demo Organization',
          domain: 'example.com',
          plan: 'free',
          ownerId: '1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };
    }
    
    return null; // Invalid credentials
  },

  async register(data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    organizationName?: string;
    organizationDomain?: string;
    inviteCode?: string;
  }): Promise<{ user: User; organization: Organization } | null> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock registration logic
    if (data.organizationName) {
      // Creating new organization
      const newOrg: Organization = {
        id: Math.random().toString(36).substr(2, 9),
        name: data.organizationName,
        domain: data.organizationDomain || '',
        plan: 'free',
        ownerId: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email: data.email,
        name: data.name,
        role: 'admin', // First user becomes admin
        organizationId: newOrg.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      return { user: newUser, organization: newOrg };
    } else if (data.inviteCode) {
      // Joining existing organization
      if (data.inviteCode === 'DEMO123') {
        const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          email: data.email,
          name: data.name,
          role: 'member',
          organizationId: 'org-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        const existingOrg: Organization = {
          id: 'org-1',
          name: 'Demo Organization',
          domain: 'example.com',
          plan: 'free',
          ownerId: '1',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        return { user: newUser, organization: existingOrg };
      }
    }
    
    return null; // Registration failed
  },
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      organization: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        
        try {
          const result = await mockAuthService.login(email, password);
          
          if (result) {
            set({
              user: result.user,
              organization: result.organization,
              isAuthenticated: true,
              isLoading: false,
            });
            return { success: true };
          } else {
            set({ isLoading: false });
            return { success: false, error: 'Invalid email or password' };
          }
        } catch (_error) {
          console.error('Failed to sign in:', _error);
          set({ isLoading: false });
          return { success: false, error: 'Login failed. Please try again.' };
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        
        try {
          const result = await mockAuthService.register(data);
          
          if (result) {
            set({
              user: result.user,
              organization: result.organization,
              isAuthenticated: true,
              isLoading: false,
            });
            return { success: true };
          } else {
            set({ isLoading: false });
            return { success: false, error: 'Registration failed. Please check your details.' };
          }
        } catch (_error) {
          console.error('Failed to sign in:', _error);
          set({ isLoading: false });
          return { success: false, error: 'Registration failed. Please try again.' };
        }
      },

      logout: () => {
        set({
          user: null,
          organization: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      isAdmin: () => {
        const { user } = get();
        return user?.role === 'admin' || user?.role === 'super_admin';
      },

      canApprove: () => {
        const { user } = get();
        return user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'approver';
      },

      canManageProjects: () => {
        const { user } = get();
        return user?.role === 'admin' || user?.role === 'super_admin';
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        organization: state.organization,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
