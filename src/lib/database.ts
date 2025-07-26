import Dexie, { Table } from 'dexie';

// Database Models
export interface User {
  id?: number;
  uuid: string;
  email: string;
  name: string;
  password: string; // In production, this should be hashed
  role: 'super_admin' | 'admin' | 'approver' | 'member';
  organizationId: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

export interface Organization {
  id?: number;
  uuid: string;
  name: string;
  domain?: string;
  plan: 'free' | 'pro' | 'enterprise';
  ownerId: string;
  settings: {
    allowSelfRegistration: boolean;
    requireEmailVerification: boolean;
    maxMembers: number;
    features: string[];
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

export interface Project {
  id?: number;
  uuid: string;
  name: string;
  description: string;
  organizationId: string;
  createdBy: string;
  status: 'active' | 'inactive' | 'archived';
  modelConfig: {
    provider: 'openai' | 'azure' | 'anthropic' | 'google' | 'ollama';
    modelId: string;
    apiKey: string;
    azureConfig?: {
      endpoint: string;
      deploymentName: string;
      apiVersion: string;
      embeddingModel?: string;
    };
    settings?: Record<string, unknown>;
  };
  permissions: {
    allowedRoles: string[];
    restrictedFeatures: string[];
  };
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

export interface ProjectMember {
  id?: number;
  uuid: string;
  projectId: string;
  userId: string;
  role: 'admin' | 'member' | 'viewer';
  permissions: string[];
  addedBy: string;
  addedAt: Date;
  isActive: boolean;
  metadata?: Record<string, unknown>;
}

export interface AccessRequest {
  id?: number;
  uuid: string;
  userId: string;
  projectId: string;
  requestType: 'project_access' | 'model_key_access' | 'role_upgrade' | 'feature_access';
  requestedRole?: string;
  requestedPermissions?: string[];
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  message?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
  expiresAt?: Date;
  requestedAt: Date;
  metadata?: Record<string, unknown>;
}

export interface Session {
  id?: number;
  uuid: string;
  userId: string;
  token: string;
  refreshToken?: string;
  expiresAt: Date;
  isActive: boolean;
  deviceInfo?: {
    userAgent: string;
    ipAddress?: string;
    deviceType: string;
  };
  createdAt: Date;
  lastUsedAt: Date;
}

export interface UserPermission {
  id?: number;
  uuid: string;
  userId: string;
  organizationId: string;
  projectId?: string;
  permission: string;
  resource: string;
  action: string;
  conditions?: Record<string, unknown>;
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

export interface AuditLog {
  updatedAt: any;
  createdAt: any;
  isActive: boolean;
  id?: number;
  uuid: string;
  userId?: string;
  organizationId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ApiKey {
  id?: number;
  uuid: string;
  name: string;
  key: string; // Encrypted
  userId: string;
  organizationId: string;
  projectId?: string;
  permissions: string[];
  isActive: boolean;
  lastUsedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

export interface GitHubIssue {
  id?: number;
  uuid: string;
  githubId: number;
  number: number;
  title: string;
  body?: string;
  state: 'open' | 'closed';
  html_url: string;
  repository: string;
  user: {
    login: string;
    avatar_url: string;
  };
  labels: Array<{
    name: string;
    color: string;
  }>;
  assignees: Array<{
    login: string;
    avatar_url: string;
  }>;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  comments: number;
  syncedAt: Date;
  organizationId: string;
  projectId?: string;
  metadata?: Record<string, unknown>;
}

// Database Class
export class AppDatabase extends Dexie {
  users!: Table<User>;
  organizations!: Table<Organization>;
  projects!: Table<Project>;
  projectMembers!: Table<ProjectMember>;
  accessRequests!: Table<AccessRequest>;
  sessions!: Table<Session>;
  userPermissions!: Table<UserPermission>;
  auditLogs!: Table<AuditLog>;
  apiKeys!: Table<ApiKey>;
  githubIssues!: Table<GitHubIssue>;

  constructor() {
    super('InfinityKBDatabase');
    
    this.version(2).stores({
      users: '++id, uuid, email, organizationId, role, isActive, createdAt',
      organizations: '++id, uuid, name, domain, ownerId, isActive, createdAt',
      projects: '++id, uuid, name, organizationId, createdBy, status, createdAt',
      projectMembers: '++id, uuid, projectId, userId, role, addedAt, isActive',
      accessRequests: '++id, uuid, userId, projectId, requestType, status, requestedAt',
      sessions: '++id, uuid, userId, token, isActive, expiresAt, createdAt',
      userPermissions: '++id, uuid, userId, organizationId, projectId, permission, isActive',
      auditLogs: '++id, uuid, userId, organizationId, action, timestamp',
      apiKeys: '++id, uuid, userId, organizationId, projectId, isActive, createdAt',
      githubIssues: '++id, uuid, githubId, number, repository, state, organizationId, syncedAt'
    });

    // Hooks for automatic timestamps and UUIDs
    this.users.hook('creating', function (_primKey, obj, _trans) {
      obj.uuid = obj.uuid || generateUUID();
      obj.createdAt = obj.createdAt || new Date();
      obj.updatedAt = new Date();
      obj.isActive = obj.isActive !== undefined ? obj.isActive : true;
    });

    this.users.hook('updating', function (modifications, _primKey, _obj, _trans) {
      (modifications as any).updatedAt = new Date();
    });

    this.organizations.hook('creating', function (_primKey, obj, _trans) {
      obj.uuid = obj.uuid || generateUUID();
      obj.createdAt = obj.createdAt || new Date();
      obj.updatedAt = new Date();
      obj.isActive = obj.isActive !== undefined ? obj.isActive : true;
    });

    this.organizations.hook('updating', function (modifications, _primKey, _obj, _trans) {
      (modifications as Record<string, unknown>).updatedAt = new Date();
    });

    this.projects.hook('creating', function (_primKey, obj, _trans) {
      obj.uuid = obj.uuid || generateUUID();
      obj.createdAt = obj.createdAt || new Date();
      obj.updatedAt = new Date();
      obj.status = obj.status || 'active';
    });

    this.projects.hook('updating', function (modifications, primKey, obj, trans) {
      (modifications as any).updatedAt = new Date();
    });

    // Add hooks for other tables
    ['projectMembers', 'accessRequests', 'sessions', 'userPermissions', 'auditLogs', 'apiKeys'].forEach(tableName => {
      (this as any)[tableName].hook('creating', function (primKey: any, obj: any, trans: any) {
        obj.uuid = obj.uuid || generateUUID();
        if (tableName === 'sessions') {
          obj.createdAt = obj.createdAt || new Date();
          obj.lastUsedAt = obj.lastUsedAt || new Date();
          obj.isActive = obj.isActive !== undefined ? obj.isActive : true;
        } else if (tableName === 'auditLogs') {
          obj.timestamp = obj.timestamp || new Date();
        } else if (tableName === 'accessRequests') {
          obj.requestedAt = obj.requestedAt || new Date();
          obj.status = obj.status || 'pending';
        } else if (tableName === 'projectMembers') {
          obj.addedAt = obj.addedAt || new Date();
          obj.isActive = obj.isActive !== undefined ? obj.isActive : true;
        } else if (tableName === 'userPermissions') {
          obj.grantedAt = obj.grantedAt || new Date();
          obj.isActive = obj.isActive !== undefined ? obj.isActive : true;
        } else if (tableName === 'apiKeys') {
          obj.createdAt = obj.createdAt || new Date();
          obj.isActive = obj.isActive !== undefined ? obj.isActive : true;
        } else if (tableName === 'githubIssues') {
          obj.uuid = obj.uuid || generateUUID();
          obj.syncedAt = obj.syncedAt || new Date();
        }
      });
    });
  }
}

// Utility function to generate UUIDs
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Hash password helper function (matches AuthService implementation)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Create database instance
export const db = new AppDatabase();

// Database initialization with seed data
export async function initializeDatabase() {
  try {
    // Check if database is already initialized
    const userCount = await db.users.count();
    console.log('Current user count:', userCount);
    if (userCount > 0) {
      console.log('Database already initialized with', userCount, 'users');
      // List existing users for debugging
      const users = await db.users.toArray();
      console.log('Existing users:', users.map(u => ({ email: u.email, role: u.role, passwordHash: u.password })));
      
      // Check if passwords are already hashed (hash should be 64 characters)
      const firstUser = users[0];
      if (firstUser && firstUser.password && firstUser.password.length === 64) {
        console.log('Passwords are already hashed, skipping initialization');
        return;
      } else {
        console.log('Passwords are plain text, need to recreate with hashed passwords');
        // Clear existing data to recreate with hashed passwords
        await db.users.clear();
        await db.organizations.clear();
        await db.projects.clear();
        console.log('Cleared existing data, proceeding with hashed password initialization');
      }
    }

    console.log('Initializing database with seed data...');

    // Create default organization
    const orgId = generateUUID();
    await db.organizations.add({
      uuid: orgId,
      name: 'Demo Organization',
      domain: 'example.com',
      plan: 'pro',
      ownerId: '', // Will be set after creating admin user
      settings: {
        allowSelfRegistration: true,
        requireEmailVerification: false,
        maxMembers: 100,
        features: ['projects', 'analytics', 'api_access', 'advanced_permissions']
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Create admin user
    const adminId = generateUUID();
    const adminPasswordHash = await hashPassword('admin123');
    await db.users.add({
      uuid: adminId,
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPasswordHash,
      role: 'admin',
      organizationId: orgId,
      isActive: true,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Update organization owner
    await db.organizations.where('uuid').equals(orgId).modify({ ownerId: adminId });

    // Create member user
    const memberId = generateUUID();
    const memberPasswordHash = await hashPassword('member123');
    await db.users.add({
      uuid: memberId,
      email: 'member@example.com',
      name: 'Member User',
      password: memberPasswordHash,
      role: 'member',
      organizationId: orgId,
      isActive: true,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Create approver user
    const approverId = generateUUID();
    const approverPasswordHash = await hashPassword('approver123');
    await db.users.add({
      uuid: approverId,
      email: 'approver@example.com',
      name: 'Approver User',
      password: approverPasswordHash,
      role: 'approver',
      organizationId: orgId,
      isActive: true,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Create sample projects
    const project1Id = generateUUID();
    await db.projects.add({
      uuid: project1Id,
      name: 'Marketing Analytics',
      description: 'AI-powered marketing insights and analytics',
      organizationId: orgId,
      createdBy: adminId,
      status: 'active',
      modelConfig: {
        provider: 'openai',
        modelId: 'gpt-4o',
        apiKey: 'sk-demo-key-1',
        settings: {
          temperature: 0.7,
          maxTokens: 2000
        }
      },
      permissions: {
        allowedRoles: ['admin', 'approver', 'member'],
        restrictedFeatures: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const project2Id = generateUUID();
    await db.projects.add({
      uuid: project2Id,
      name: 'Customer Support Bot',
      description: 'Automated customer service chatbot',
      organizationId: orgId,
      createdBy: adminId,
      status: 'active',
      modelConfig: {
        provider: 'anthropic',
        modelId: 'claude-3-sonnet',
        apiKey: 'sk-ant-demo-key-2',
        settings: {
          temperature: 0.5,
          maxTokens: 1500
        }
      },
      permissions: {
        allowedRoles: ['admin', 'approver'],
        restrictedFeatures: ['model_config_edit']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Create project members
    await db.projectMembers.add({
      uuid: generateUUID(),
      projectId: project1Id,
      userId: adminId,
      role: 'admin',
      permissions: ['read', 'write', 'delete', 'manage_members'],
      addedBy: adminId,
      addedAt: new Date(),
      isActive: true
    });

    await db.projectMembers.add({
      uuid: generateUUID(),
      projectId: project1Id,
      userId: memberId,
      role: 'member',
      permissions: ['read', 'write'],
      addedBy: adminId,
      addedAt: new Date(),
      isActive: true
    });

    await db.projectMembers.add({
      uuid: generateUUID(),
      projectId: project2Id,
      userId: adminId,
      role: 'admin',
      permissions: ['read', 'write', 'delete', 'manage_members'],
      addedBy: adminId,
      addedAt: new Date(),
      isActive: true
    });

    await db.projectMembers.add({
      uuid: generateUUID(),
      projectId: project2Id,
      userId: approverId,
      role: 'member',
      permissions: ['read', 'write'],
      addedBy: adminId,
      addedAt: new Date(),
      isActive: true
    });

    // Create sample access requests
    await db.accessRequests.add({
      uuid: generateUUID(),
      userId: memberId,
      projectId: project2Id,
      requestType: 'project_access',
      status: 'pending',
      message: 'I would like to contribute to the customer support bot project.',
      requestedAt: new Date()
    });

    await db.accessRequests.add({
      uuid: generateUUID(),
      userId: memberId,
      projectId: project1Id,
      requestType: 'model_key_access',
      status: 'pending',
      message: 'Need access to the OpenAI model for advanced analytics.',
      requestedAt: new Date()
    });

    console.log('Database initialized successfully with seed data');

  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}
