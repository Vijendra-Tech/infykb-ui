import { create } from 'zustand';
import { User, Organization, Session, db, initializeDatabase } from '@/lib/database';
import { authService, LoginCredentials, RegisterCredentials } from '@/lib/auth-service';
import { organizationService } from '@/lib/organization-service';

interface AuthState {
  // State
  user: User | null;
  organization: Organization | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (credentials: RegisterCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;

  // Helper methods
  isAuthenticated: () => boolean;
  hasRole: (role: User['role']) => boolean;
  hasPermission: (permission: string, resource?: string, projectId?: string) => Promise<boolean>;
  isAdmin: () => boolean;
  isApprover: () => boolean;
  isMember: () => boolean;
}

export const useDexieAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  organization: null,
  session: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  // Actions
  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    
    try {
      const result = await authService.login(credentials);
      
      if (result.success && result.user && result.organization && result.session) {
        set({
          user: result.user,
          organization: result.organization,
          session: result.session,
          isLoading: false,
          error: null
        });
        return { success: true };
      } else {
        set({ 
          isLoading: false, 
          error: result.error || 'Login failed',
          user: null,
          organization: null,
          session: null
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      set({ 
        isLoading: false, 
        error: errorMessage,
        user: null,
        organization: null,
        session: null
      });
      return { success: false, error: errorMessage };
    }
  },

  register: async (credentials: RegisterCredentials) => {
    set({ isLoading: true, error: null });
    
    try {
      const result = await authService.register(credentials);
      
      if (result.success && result.user && result.organization && result.session) {
        set({
          user: result.user,
          organization: result.organization,
          session: result.session,
          isLoading: false,
          error: null
        });
        return { success: true };
      } else {
        set({ 
          isLoading: false, 
          error: result.error || 'Registration failed',
          user: null,
          organization: null,
          session: null
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      set({ 
        isLoading: false, 
        error: errorMessage,
        user: null,
        organization: null,
        session: null
      });
      return { success: false, error: errorMessage };
    }
  },

  logout: async () => {
    set({ isLoading: true });
    
    try {
      await authService.logout();
      set({
        user: null,
        organization: null,
        session: null,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Clear state even if logout fails
      set({
        user: null,
        organization: null,
        session: null,
        isLoading: false,
        error: null
      });
    }
  },

  initialize: async () => {
    if (get().isInitialized) return;
    
    set({ isLoading: true });
    
    try {
      // Initialize database with seed data
      await initializeDatabase();
      
      // Try to restore session
      const session = await authService.getCurrentSession();
      if (session) {
        const user = await authService.getCurrentUser();
        const organization = await authService.getCurrentOrganization();
        
        if (user && organization) {
          set({
            user,
            organization,
            session,
            isLoading: false,
            isInitialized: true,
            error: null
          });
          return;
        }
      }
      
      // No valid session found
      set({
        user: null,
        organization: null,
        session: null,
        isLoading: false,
        isInitialized: true,
        error: null
      });
      
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({
        user: null,
        organization: null,
        session: null,
        isLoading: false,
        isInitialized: true,
        error: 'Failed to initialize authentication'
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  refreshUser: async () => {
    try {
      const user = await authService.getCurrentUser();
      const organization = await authService.getCurrentOrganization();
      const session = await authService.getCurrentSession();
      
      if (user && organization && session) {
        set({ user, organization, session });
      } else {
        // Session expired or invalid
        set({
          user: null,
          organization: null,
          session: null
        });
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      set({
        user: null,
        organization: null,
        session: null
      });
    }
  },

  // Helper methods
  isAuthenticated: () => {
    const { user, session } = get();
    return !!(user && session && session.expiresAt > new Date());
  },

  hasRole: (role: User['role']) => {
    const { user } = get();
    return user?.role === role;
  },

  hasPermission: async (permission: string, resource?: string, projectId?: string) => {
    const { user } = get();
    if (!user) return false;
    
    return await authService.hasPermission(permission, resource, projectId);
  },

  isAdmin: () => {
    const { user } = get();
    return user?.role === 'admin' || user?.role === 'super_admin';
  },

  isApprover: () => {
    const { user } = get();
    return user?.role === 'approver' || user?.role === 'admin' || user?.role === 'super_admin';
  },

  isMember: () => {
    const { user } = get();
    return !!user && ['member', 'approver', 'admin', 'super_admin'].includes(user.role);
  }
}));

// Auto-initialize when store is created
if (typeof window !== 'undefined') {
  useDexieAuthStore.getState().initialize();
}

// Periodic session cleanup (every 5 minutes)
if (typeof window !== 'undefined') {
  setInterval(async () => {
    try {
      await authService.cleanupExpiredSessions();
      
      // Refresh current user session
      const store = useDexieAuthStore.getState();
      if (store.isAuthenticated()) {
        await store.refreshUser();
      }
    } catch (error) {
      console.error('Session cleanup error:', error);
    }
  }, 5 * 60 * 1000); // 5 minutes
}
