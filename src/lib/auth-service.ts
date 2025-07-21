import { db, User, Organization, Session } from './database';
import { generateUUID } from './utils';

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

export interface AuthResult {
  success: boolean;
  user?: User;
  organization?: Organization;
  session?: Session;
  error?: string;
}

export class AuthService {
  private static instance: AuthService;
  private currentSession: Session | null = null;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Hash password (simple implementation - use bcrypt in production)
  private async hashPassword(password: string): Promise<string> {
    // In production, use a proper hashing library like bcrypt
    // This is just for demo purposes
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'salt');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Verify password
  private async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const inputHash = await this.hashPassword(password);
    return inputHash === hashedPassword;
  }

  // Generate session token
  private generateSessionToken(): string {
    return 'sess_' + generateUUID() + '_' + Date.now();
  }

  // Create audit log entry
  private async createAuditLog(
    action: string,
    resource: string,
    userId?: string,
    organizationId?: string,
    details: Record<string, unknown> = {},
    severity: 'low' | 'medium' | 'high' | 'critical' = 'low'
  ): Promise<void> {
    try {
      await db.auditLogs.add({
        uuid: generateUUID(),
        userId,
        organizationId: organizationId || '',
        action,
        resource,
        details,
        timestamp: new Date(),
        severity,
        userAgent: navigator.userAgent,
        ipAddress: 'localhost' // In production, get real IP
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      console.log('AuthService: Attempting login for:', credentials.email);
      
      // Find user by email
      const user = await db.users
        .where('email')
        .equalsIgnoreCase(credentials.email.trim())
        .and(u => u.isActive === true)
        .first();

      console.log('AuthService: User found:', user ? { email: user.email, role: user.role } : 'No user found');

      if (!user) {
        await this.createAuditLog(
          'login_failed',
          'user',
          undefined,
          undefined,
          { email: credentials.email, reason: 'user_not_found' },
          'medium'
        );
        return { success: false, error: 'Invalid email or password' };
      }

      // Verify password
      console.log('AuthService: Verifying password for user:', user.email);
      console.log('AuthService: Input password:', credentials.password);
      console.log('AuthService: Stored password hash:', user.password);
      const inputHash = await this.hashPassword(credentials.password);
      console.log('AuthService: Generated hash from input:', inputHash);
      const isValidPassword = await this.verifyPassword(credentials.password, user.password);
      console.log('AuthService: Password valid:', isValidPassword);
      if (!isValidPassword) {
        await this.createAuditLog(
          'login_failed',
          'user',
          user.uuid,
          user.organizationId,
          { email: credentials.email, reason: 'invalid_password' },
          'medium'
        );
        return { success: false, error: 'Invalid email or password' };
      }

      // Get user's organization
      const organization = await db.organizations
        .where('uuid')
        .equals(user.organizationId)
        .and(org => org.isActive === true)
        .first();

      if (!organization) {
        await this.createAuditLog(
          'login_failed',
          'user',
          user.uuid,
          user.organizationId,
          { email: credentials.email, reason: 'organization_not_found' },
          'high'
        );
        return { success: false, error: 'Organization not found or inactive' };
      }

      // Create session
      console.log('🔑 Creating new session for user:', user.email);
      const sessionToken = this.generateSessionToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + (credentials.rememberMe ? 24 * 30 : 24)); // 30 days or 24 hours

      const session: Session = {
        uuid: generateUUID(),
        userId: user.uuid,
        token: sessionToken,
        expiresAt,
        isActive: true,
        deviceInfo: {
          userAgent: navigator.userAgent,
          deviceType: this.getDeviceType()
        },
        createdAt: new Date(),
        lastUsedAt: new Date()
      };

      console.log('💾 Storing session in database:', {
        sessionId: session.uuid,
        userId: session.userId,
        expires: session.expiresAt,
        rememberMe: credentials.rememberMe,
        hoursValid: credentials.rememberMe ? 24 * 30 : 24
      });
      
      await db.sessions.add(session);
      
      // Verify session was stored
      const storedSession = await db.sessions.where('uuid').equals(session.uuid).first();
      console.log('✅ Session verification after storage:', storedSession ? 'SUCCESS' : 'FAILED');
      if (storedSession) {
        console.log('📊 Stored session details:', {
          uuid: storedSession.uuid,
          userId: storedSession.userId,
          isActive: storedSession.isActive,
          expires: storedSession.expiresAt
        });
      }

      // Update user's last login
      await db.users.where('uuid').equals(user.uuid).modify({
        lastLogin: new Date(),
        updatedAt: new Date()
      });

      // Store current session
      this.currentSession = session;

      // Create audit log
      await this.createAuditLog(
        'login_success',
        'user',
        user.uuid,
        user.organizationId,
        { email: user.email, sessionId: session.uuid }
      );

      return {
        success: true,
        user,
        organization,
        session
      };

    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }

  // Register user
  async register(credentials: RegisterCredentials): Promise<AuthResult> {
    try {
      // Validate passwords match
      if (credentials.password !== credentials.confirmPassword) {
        return { success: false, error: 'Passwords do not match' };
      }

      // Check if user already exists
      const existingUser = await db.users
        .where('email')
        .equalsIgnoreCase(credentials.email.trim())
        .first();

      if (existingUser) {
        return { success: false, error: 'User with this email already exists' };
      }

      let organization: Organization;
      let userRole: User['role'] = 'member';

      if (credentials.organizationName) {
        // Creating new organization
        const orgUuid = generateUUID();
        organization = {
          uuid: orgUuid,
          name: credentials.organizationName,
          domain: credentials.organizationDomain || '',
          plan: 'free',
          ownerId: '', // Will be set after user creation
          settings: {
            allowSelfRegistration: true,
            requireEmailVerification: false,
            maxMembers: 10, // Free plan limit
            features: ['projects', 'basic_analytics']
          },
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await db.organizations.add(organization);
        userRole = 'admin'; // First user becomes admin

      } else if (credentials.inviteCode) {
        // Joining existing organization
        // In a real app, you'd validate the invite code
        if (credentials.inviteCode === 'DEMO123') {
          const foundOrg = await db.organizations
            .where('name')
            .equals('Demo Organization')
            .first();

          if (!foundOrg) {
            return { success: false, error: 'Invalid invite code' };
          }
          organization = foundOrg;
        } else {
          return { success: false, error: 'Invalid invite code' };
        }
      } else {
        return { success: false, error: 'Organization name or invite code required' };
      }

      // Hash password
      const hashedPassword = await this.hashPassword(credentials.password);

      // Create user
      const userUuid = generateUUID();
      const user: User = {
        uuid: userUuid,
        email: credentials.email.trim().toLowerCase(),
        name: credentials.name,
        password: hashedPassword,
        role: userRole,
        organizationId: organization.uuid,
        isActive: true,
        emailVerified: false, // Would be handled by email verification flow
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.users.add(user);

      // Update organization owner if this is a new org
      if (credentials.organizationName && userRole === 'admin') {
        await db.organizations.where('uuid').equals(organization.uuid).modify({
          ownerId: userUuid,
          updatedAt: new Date()
        });
        organization.ownerId = userUuid;
      }

      // Create audit log
      await this.createAuditLog(
        'user_registered',
        'user',
        user.uuid,
        organization.uuid,
        { 
          email: user.email, 
          role: user.role,
          organizationType: credentials.organizationName ? 'new' : 'existing'
        }
      );

      // Auto-login after registration
      const loginResult = await this.login({
        email: credentials.email,
        password: credentials.password,
        rememberMe: true
      });

      return loginResult;

    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      if (this.currentSession) {
        // Deactivate session
        await db.sessions
          .where('uuid')
          .equals(this.currentSession.uuid)
          .modify({ isActive: false });

        // Create audit log
        await this.createAuditLog(
          'logout',
          'user',
          this.currentSession.userId,
          undefined,
          { sessionId: this.currentSession.uuid }
        );

        this.currentSession = null;
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // Get current session
  async getCurrentSession(): Promise<Session | null> {
    try {
      console.log('🔍 getCurrentSession called');
      console.log('📊 Current session in memory:', this.currentSession ? 'exists' : 'null');
      
      if (this.currentSession) {
        console.log('⏰ Checking in-memory session validity:', {
          expires: this.currentSession.expiresAt,
          now: new Date(),
          isActive: this.currentSession.isActive,
          isValid: this.currentSession.expiresAt > new Date() && this.currentSession.isActive
        });
        
        // Check if session is still valid
        if (this.currentSession.expiresAt > new Date() && this.currentSession.isActive) {
          console.log('✅ In-memory session is valid, updating last used time');
          try {
            // Update last used time
            await db.sessions
              .where('uuid')
              .equals(this.currentSession.uuid)
              .modify({ lastUsedAt: new Date() });
          } catch (updateError) {
            console.warn('⚠️ Failed to update session last used time:', updateError);
          }
          
          return this.currentSession;
        } else {
          console.log('❌ In-memory session expired, cleaning up');
          // Session expired, clean up
          try {
            await this.logout();
          } catch (logoutError) {
            console.warn('⚠️ Failed to logout expired session:', logoutError);
          }
          return null;
        }
      }

      console.log('🔄 No in-memory session, checking database for active sessions...');
      
      // Try to restore session from database (for page refresh scenarios)
      let allSessions: Session[] = [];
      try {
        allSessions = await db.sessions.toArray();
      } catch (dbError) {
        console.error('❌ Failed to fetch sessions from database:', dbError);
        return null;
      }
      
      const now = new Date();
      
      console.log('📋 All sessions in database:', allSessions.map(s => {
        const isExpired = s.expiresAt <= now;
        const isActiveBoolean = s.isActive === true;
        return {
          uuid: s.uuid,
          userId: s.userId,
          isActive: s.isActive,
          isActiveBoolean,
          expires: s.expiresAt,
          expired: isExpired,
          valid: isActiveBoolean && !isExpired
        };
      }));
      
      console.log('🕐 Current time for comparison:', now);
      
      // Use simple filtering instead of complex Dexie queries to avoid DexieError
      const validSessions = allSessions.filter(session => {
        try {
          const isActiveValue = session.isActive === true;
          const isNotExpired = session.expiresAt > now;
          const isValid = isActiveValue && isNotExpired;
          
          console.log(`🧪 Session ${session.uuid}: isActive=${session.isActive} (${typeof session.isActive}), expires=${session.expiresAt}, valid=${isValid}`);
          
          return isValid;
        } catch (filterError) {
          console.warn(`⚠️ Error filtering session ${session.uuid}:`, filterError);
          return false;
        }
      });
      
      console.log('🔍 Found', validSessions.length, 'valid sessions');
      
      if (validSessions.length > 0) {
        console.log('✅ Restoring session from database:', {
          sessionId: validSessions[0].uuid,
          userId: validSessions[0].userId,
          expires: validSessions[0].expiresAt,
          isActive: validSessions[0].isActive,
          isActiveType: typeof validSessions[0].isActive
        });
        this.currentSession = validSessions[0];
        return this.currentSession;
      }

      console.log('🚫 No valid sessions found in database');
      return null;
      
    } catch (error) {
      console.error('❌ Critical error in getCurrentSession:', error);
      // Reset current session to prevent infinite loops
      this.currentSession = null;
      return null;
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    const session = await this.getCurrentSession();
    if (!session) return null;

    const user = await db.users
      .where('uuid')
      .equals(session.userId)
      .and(u => u.isActive === true)
      .first();

    return user || null;
  }

  // Get current organization
  async getCurrentOrganization(): Promise<Organization | null> {
    const user = await this.getCurrentUser();
    if (!user) return null;

    const organization = await db.organizations
      .where('uuid')
      .equals(user.organizationId)
      .and(org => org.isActive === true)
      .first();

    return organization || null;
  }

  // Check if user has permission
  async hasPermission(permission: string, resource?: string, projectId?: string): Promise<boolean> {
    const user = await this.getCurrentUser();
    if (!user) return false;

    // Super admin has all permissions
    if (user.role === 'super_admin') return true;

    // Check explicit permissions
    const userPermissions = await db.userPermissions
      .where('userId')
      .equals(user.uuid)
      .and(perm => perm.isActive === true)
      .and(perm => !perm.expiresAt || perm.expiresAt > new Date())
      .toArray();

    const hasExplicitPermission = userPermissions.some(perm => {
      const matchesPermission = perm.permission === permission || perm.permission === '*';
      const matchesResource = !resource || perm.resource === resource || perm.resource === '*';
      const matchesProject = !projectId || perm.projectId === projectId;
      
      return matchesPermission && matchesResource && matchesProject;
    });

    if (hasExplicitPermission) return true;

    // Check role-based permissions
    return this.checkRolePermission(user.role, permission, resource, projectId);
  }

  // Check role-based permissions
  private checkRolePermission(role: User['role'], permission: string, _resource?: string, _projectId?: string): boolean {
    const rolePermissions: Record<User['role'], string[]> = {
      super_admin: ['*'],
      admin: [
        'users:read', 'users:write', 'users:delete',
        'organizations:read', 'organizations:write',
        'projects:read', 'projects:write', 'projects:delete',
        'requests:read', 'requests:approve', 'requests:reject',
        'analytics:read', 'settings:write'
      ],
      approver: [
        'users:read',
        'projects:read', 'projects:write',
        'requests:read', 'requests:approve', 'requests:reject',
        'analytics:read'
      ],
      member: [
        'projects:read',
        'requests:create',
        'profile:write'
      ]
    };

    const permissions = rolePermissions[role] || [];
    return permissions.includes('*') || permissions.includes(permission);
  }

  // Utility method to get device type
  private getDeviceType(): string {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet';
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  }

  // Clean up expired sessions
  async cleanupExpiredSessions(): Promise<void> {
    try {
      const expiredSessions = await db.sessions
        .where('expiresAt')
        .below(new Date())
        .toArray();

      for (const session of expiredSessions) {
        await db.sessions.where('uuid').equals(session.uuid).modify({ isActive: false });
      }

      console.log(`Cleaned up ${expiredSessions.length} expired sessions`);
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
    }
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
