import { db, User, Project, ProjectMember, AccessRequest } from './database';
import { generateUUID } from './utils';
import { authService } from './auth-service';

export interface ProjectData {
  name: string;
  description: string;
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
}

export interface MemberInvite {
  email: string;
  name: string;
  role: 'admin' | 'approver' | 'member';
}

export interface AccessRequestData {
  projectId: string;
  requestType: 'project_access' | 'model_key_access' | 'role_upgrade' | 'feature_access';
  requestedRole?: string;
  requestedPermissions?: string[];
  message?: string;
}

export class OrganizationService {
  private static instance: OrganizationService;

  private constructor() {}

  public static getInstance(): OrganizationService {
    if (!OrganizationService.instance) {
      OrganizationService.instance = new OrganizationService();
    }
    return OrganizationService.instance;
  }

  // Create audit log helper
  private async createAuditLog(
    action: string,
    resource: string,
    resourceId?: string,
    details: Record<string, unknown> = {},
    severity: 'low' | 'medium' | 'high' | 'critical' = 'low'
  ): Promise<void> {
    try {
      const user = await authService.getCurrentUser();
      const organization = await authService.getCurrentOrganization();

      await db.auditLogs.add({
        uuid: generateUUID(),
        userId: user?.uuid,
        organizationId: organization?.uuid || '',
        action,
        resource,
        resourceId,
        details,
        timestamp: new Date(),
        severity,
        userAgent: navigator.userAgent,
        ipAddress: 'localhost'
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }

  // Get organization members
  async getMembers(): Promise<User[]> {
    const organization = await authService.getCurrentOrganization();
    if (!organization) return [];

    return await db.users
      .where('organizationId')
      .equals(organization.uuid)
      .and(user => user.isActive === true)
      .toArray();
  }

  // Invite member to organization
  async inviteMember(invite: MemberInvite): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      const currentUser = await authService.getCurrentUser();
      const organization = await authService.getCurrentOrganization();

      if (!currentUser || !organization) {
        return { success: false, error: 'Authentication required' };
      }

      // Check permissions
      const canInvite = await authService.hasPermission('users:write');
      if (!canInvite) {
        return { success: false, error: 'Insufficient permissions to invite members' };
      }

      // Check if user already exists
      const existingUser = await db.users
        .where('email')
        .equalsIgnoreCase(invite.email.trim())
        .first();

      if (existingUser) {
        return { success: false, error: 'User with this email already exists' };
      }

      // Check organization member limits
      const currentMemberCount = await db.users
        .where('organizationId')
        .equals(organization.uuid)
        .count();

      if (currentMemberCount >= organization.settings.maxMembers) {
        return { success: false, error: 'Organization member limit reached' };
      }

      // Create user (in a real app, this would send an invite email)
      const userUuid = generateUUID();
      const newUser: User = {
        uuid: userUuid,
        email: invite.email.trim().toLowerCase(),
        name: invite.name,
        password: 'temp_password_' + Math.random().toString(36), // Would be set by user on first login
        role: invite.role,
        organizationId: organization.uuid,
        isActive: true,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.users.add(newUser);

      await this.createAuditLog(
        'member_invited',
        'user',
        userUuid,
        { email: invite.email, role: invite.role, invitedBy: currentUser.uuid }
      );

      return { success: true, user: newUser };

    } catch (error) {
      console.error('Error inviting member:', error);
      return { success: false, error: 'Failed to invite member' };
    }
  }

  // Update member role
  async updateMemberRole(userId: string, newRole: User['role']): Promise<{ success: boolean; error?: string }> {
    try {
      const currentUser = await authService.getCurrentUser();
      const organization = await authService.getCurrentOrganization();

      if (!currentUser || !organization) {
        return { success: false, error: 'Authentication required' };
      }

      // Check permissions
      const canUpdateRoles = await authService.hasPermission('users:write');
      if (!canUpdateRoles) {
        return { success: false, error: 'Insufficient permissions to update member roles' };
      }

      // Get target user
      const targetUser = await db.users.where('uuid').equals(userId).first();
      if (!targetUser || targetUser.organizationId !== organization.uuid) {
        return { success: false, error: 'User not found' };
      }

      // Prevent self-demotion from admin
      if (currentUser.uuid === userId && currentUser.role === 'admin' && newRole !== 'admin') {
        return { success: false, error: 'Cannot demote yourself from admin role' };
      }

      // Update user role
      await db.users.where('uuid').equals(userId).modify({
        role: newRole,
        updatedAt: new Date()
      });

      await this.createAuditLog(
        'member_role_updated',
        'user',
        userId,
        { oldRole: targetUser.role, newRole, updatedBy: currentUser.uuid }
      );

      return { success: true };

    } catch (error) {
      console.error('Error updating member role:', error);
      return { success: false, error: 'Failed to update member role' };
    }
  }

  // Remove member from organization
  async removeMember(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const currentUser = await authService.getCurrentUser();
      const organization = await authService.getCurrentOrganization();

      if (!currentUser || !organization) {
        return { success: false, error: 'Authentication required' };
      }

      // Check permissions
      const canRemoveMembers = await authService.hasPermission('users:delete');
      if (!canRemoveMembers) {
        return { success: false, error: 'Insufficient permissions to remove members' };
      }

      // Get target user
      const targetUser = await db.users.where('uuid').equals(userId).first();
      if (!targetUser || targetUser.organizationId !== organization.uuid) {
        return { success: false, error: 'User not found' };
      }

      // Prevent self-removal
      if (currentUser.uuid === userId) {
        return { success: false, error: 'Cannot remove yourself' };
      }

      // Prevent removing organization owner
      if (targetUser.uuid === organization.ownerId) {
        return { success: false, error: 'Cannot remove organization owner' };
      }

      // Deactivate user instead of deleting (for audit trail)
      await db.users.where('uuid').equals(userId).modify({
        isActive: false,
        updatedAt: new Date()
      });

      // Remove from all projects
      await db.projectMembers
        .where('userId')
        .equals(userId)
        .modify({ isActive: false });

      await this.createAuditLog(
        'member_removed',
        'user',
        userId,
        { removedBy: currentUser.uuid, email: targetUser.email }
      );

      return { success: true };

    } catch (error) {
      console.error('Error removing member:', error);
      return { success: false, error: 'Failed to remove member' };
    }
  }

  // Get organization projects
  async getProjects(): Promise<Project[]> {
    const organization = await authService.getCurrentOrganization();
    if (!organization) return [];

    return await db.projects
      .where('organizationId')
      .equals(organization.uuid)
      .and(project => project.status !== 'archived')
      .toArray();
  }

  // Create project
  async createProject(projectData: ProjectData): Promise<{ success: boolean; error?: string; project?: Project }> {
    try {
      const currentUser = await authService.getCurrentUser();
      const organization = await authService.getCurrentOrganization();

      if (!currentUser || !organization) {
        return { success: false, error: 'Authentication required' };
      }

      // Check permissions
      const canCreateProjects = await authService.hasPermission('projects:write');
      if (!canCreateProjects) {
        return { success: false, error: 'Insufficient permissions to create projects' };
      }

      // Create project
      const projectUuid = generateUUID();
      const project: Project = {
        uuid: projectUuid,
        name: projectData.name,
        description: projectData.description,
        organizationId: organization.uuid,
        createdBy: currentUser.uuid,
        status: 'active',
        modelConfig: projectData.modelConfig,
        permissions: projectData.permissions,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.projects.add(project);

      // Add creator as project admin
      await db.projectMembers.add({
        uuid: generateUUID(),
        projectId: projectUuid,
        userId: currentUser.uuid,
        role: 'admin',
        permissions: ['read', 'write', 'delete', 'manage_members'],
        addedBy: currentUser.uuid,
        addedAt: new Date(),
        isActive: true
      });

      await this.createAuditLog(
        'project_created',
        'project',
        projectUuid,
        { name: projectData.name, createdBy: currentUser.uuid }
      );

      return { success: true, project };

    } catch (error) {
      console.error('Error creating project:', error);
      return { success: false, error: 'Failed to create project' };
    }
  }

  // Update project
  async updateProject(projectId: string, updates: Partial<ProjectData>): Promise<{ success: boolean; error?: string }> {
    try {
      const currentUser = await authService.getCurrentUser();
      const organization = await authService.getCurrentOrganization();

      if (!currentUser || !organization) {
        return { success: false, error: 'Authentication required' };
      }

      // Check if user has permission to edit this project
      const canEditProject = await authService.hasPermission('projects:write', 'project', projectId);
      if (!canEditProject) {
        return { success: false, error: 'Insufficient permissions to edit this project' };
      }

      // Get project
      const project = await db.projects.where('uuid').equals(projectId).first();
      if (!project || project.organizationId !== organization.uuid) {
        return { success: false, error: 'Project not found' };
      }

      // Update project
      await db.projects.where('uuid').equals(projectId).modify({
        ...updates,
        updatedAt: new Date()
      });

      await this.createAuditLog(
        'project_updated',
        'project',
        projectId,
        { updatedBy: currentUser.uuid, changes: Object.keys(updates) }
      );

      return { success: true };

    } catch (error) {
      console.error('Error updating project:', error);
      return { success: false, error: 'Failed to update project' };
    }
  }

  // Delete project
  async deleteProject(projectId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const currentUser = await authService.getCurrentUser();
      const organization = await authService.getCurrentOrganization();

      if (!currentUser || !organization) {
        return { success: false, error: 'Authentication required' };
      }

      // Check permissions
      const canDeleteProject = await authService.hasPermission('projects:delete', 'project', projectId);
      if (!canDeleteProject) {
        return { success: false, error: 'Insufficient permissions to delete this project' };
      }

      // Get project
      const project = await db.projects.where('uuid').equals(projectId).first();
      if (!project || project.organizationId !== organization.uuid) {
        return { success: false, error: 'Project not found' };
      }

      // Archive project instead of deleting (for audit trail)
      await db.projects.where('uuid').equals(projectId).modify({
        status: 'archived',
        updatedAt: new Date()
      });

      // Deactivate all project members
      await db.projectMembers
        .where('projectId')
        .equals(projectId)
        .modify({ isActive: false });

      await this.createAuditLog(
        'project_deleted',
        'project',
        projectId,
        { deletedBy: currentUser.uuid, name: project.name }
      );

      return { success: true };

    } catch (error) {
      console.error('Error deleting project:', error);
      return { success: false, error: 'Failed to delete project' };
    }
  }

  // Get project members
  async getProjectMembers(projectId: string): Promise<(ProjectMember & { user: User })[]> {
    const members = await db.projectMembers
      .where('projectId')
      .equals(projectId)
      .and(member => member.isActive === true)
      .toArray();

    const membersWithUsers = [];
    for (const member of members) {
      const user = await db.users.where('uuid').equals(member.userId).first();
      if (user) {
        membersWithUsers.push({ ...member, user });
      }
    }

    return membersWithUsers;
  }

  // Add member to project
  async addProjectMember(projectId: string, userId: string, role: 'admin' | 'member' | 'viewer'): Promise<{ success: boolean; error?: string }> {
    try {
      const currentUser = await authService.getCurrentUser();
      const organization = await authService.getCurrentOrganization();

      if (!currentUser || !organization) {
        return { success: false, error: 'Authentication required' };
      }

      // Check permissions
      const canManageMembers = await authService.hasPermission('projects:write', 'project', projectId);
      if (!canManageMembers) {
        return { success: false, error: 'Insufficient permissions to manage project members' };
      }

      // Check if user is already a member
      const existingMember = await db.projectMembers
        .where('projectId')
        .equals(projectId)
        .and(member => member.userId === userId && member.isActive === true)
        .first();

      if (existingMember) {
        return { success: false, error: 'User is already a member of this project' };
      }

      // Add member
      const permissions = role === 'admin' 
        ? ['read', 'write', 'delete', 'manage_members']
        : role === 'member'
        ? ['read', 'write']
        : ['read'];

      await db.projectMembers.add({
        uuid: generateUUID(),
        projectId,
        userId,
        role,
        permissions,
        addedBy: currentUser.uuid,
        addedAt: new Date(),
        isActive: true
      });

      await this.createAuditLog(
        'project_member_added',
        'project_member',
        undefined,
        { projectId, userId, role, addedBy: currentUser.uuid }
      );

      return { success: true };

    } catch (error) {
      console.error('Error adding project member:', error);
      return { success: false, error: 'Failed to add project member' };
    }
  }

  // Remove member from project
  async removeProjectMember(projectId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const currentUser = await authService.getCurrentUser();

      if (!currentUser) {
        return { success: false, error: 'Authentication required' };
      }

      // Check permissions
      const canManageMembers = await authService.hasPermission('projects:write', 'project', projectId);
      if (!canManageMembers) {
        return { success: false, error: 'Insufficient permissions to manage project members' };
      }

      // Remove member
      await db.projectMembers
        .where('projectId')
        .equals(projectId)
        .and(member => member.userId === userId)
        .modify({ isActive: false });

      await this.createAuditLog(
        'project_member_removed',
        'project_member',
        undefined,
        { projectId, userId, removedBy: currentUser.uuid }
      );

      return { success: true };

    } catch (error) {
      console.error('Error removing project member:', error);
      return { success: false, error: 'Failed to remove project member' };
    }
  }

  // Get access requests
  async getAccessRequests(status?: AccessRequest['status']): Promise<(AccessRequest & { user: User; project?: Project })[]> {
    const organization = await authService.getCurrentOrganization();
    if (!organization) return [];

    let query = db.accessRequests.orderBy('requestedAt').reverse();

    if (status) {
      query = query.filter(request => request.status === status);
    }

    const requests = await query.toArray();
    const requestsWithDetails = [];

    for (const request of requests) {
      const user = await db.users.where('uuid').equals(request.userId).first();
      const project = request.projectId 
        ? await db.projects.where('uuid').equals(request.projectId).first()
        : undefined;

      if (user && user.organizationId === organization.uuid) {
        requestsWithDetails.push({ ...request, user, project });
      }
    }

    return requestsWithDetails;
  }

  // Create access request
  async createAccessRequest(requestData: AccessRequestData): Promise<{ success: boolean; error?: string }> {
    try {
      const currentUser = await authService.getCurrentUser();
      const organization = await authService.getCurrentOrganization();

      if (!currentUser || !organization) {
        return { success: false, error: 'Authentication required' };
      }

      // Check if user already has a pending request for this project/type
      const existingRequest = await db.accessRequests
        .where('userId')
        .equals(currentUser.uuid)
        .and(request => 
          request.projectId === requestData.projectId &&
          request.requestType === requestData.requestType &&
          request.status === 'pending'
        )
        .first();

      if (existingRequest) {
        return { success: false, error: 'You already have a pending request for this resource' };
      }

      // Create request
      await db.accessRequests.add({
        uuid: generateUUID(),
        userId: currentUser.uuid,
        projectId: requestData.projectId,
        requestType: requestData.requestType,
        requestedRole: requestData.requestedRole,
        requestedPermissions: requestData.requestedPermissions,
        status: 'pending',
        message: requestData.message,
        requestedAt: new Date()
      });

      await this.createAuditLog(
        'access_request_created',
        'access_request',
        undefined,
        { 
          projectId: requestData.projectId,
          requestType: requestData.requestType,
          requestedBy: currentUser.uuid
        }
      );

      return { success: true };

    } catch (error) {
      console.error('Error creating access request:', error);
      return { success: false, error: 'Failed to create access request' };
    }
  }

  // Approve access request
  async approveAccessRequest(requestId: string, notes?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const currentUser = await authService.getCurrentUser();

      if (!currentUser) {
        return { success: false, error: 'Authentication required' };
      }

      // Check permissions
      const canApprove = await authService.hasPermission('requests:approve');
      if (!canApprove) {
        return { success: false, error: 'Insufficient permissions to approve requests' };
      }

      // Get request
      const request = await db.accessRequests.where('uuid').equals(requestId).first();
      if (!request || request.status !== 'pending') {
        return { success: false, error: 'Request not found or already processed' };
      }

      // Update request status
      await db.accessRequests.where('uuid').equals(requestId).modify({
        status: 'approved',
        reviewedBy: currentUser.uuid,
        reviewedAt: new Date(),
        reviewNotes: notes
      });

      // Grant access based on request type
      if (request.requestType === 'project_access' && request.projectId) {
        await this.addProjectMember(request.projectId, request.userId, 'member');
      }

      await this.createAuditLog(
        'access_request_approved',
        'access_request',
        requestId,
        { approvedBy: currentUser.uuid, notes }
      );

      return { success: true };

    } catch (error) {
      console.error('Error approving access request:', error);
      return { success: false, error: 'Failed to approve access request' };
    }
  }

  // Reject access request
  async rejectAccessRequest(requestId: string, notes?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const currentUser = await authService.getCurrentUser();

      if (!currentUser) {
        return { success: false, error: 'Authentication required' };
      }

      // Check permissions
      const canReject = await authService.hasPermission('requests:reject');
      if (!canReject) {
        return { success: false, error: 'Insufficient permissions to reject requests' };
      }

      // Get request
      const request = await db.accessRequests.where('uuid').equals(requestId).first();
      if (!request || request.status !== 'pending') {
        return { success: false, error: 'Request not found or already processed' };
      }

      // Update request status
      await db.accessRequests.where('uuid').equals(requestId).modify({
        status: 'rejected',
        reviewedBy: currentUser.uuid,
        reviewedAt: new Date(),
        reviewNotes: notes
      });

      await this.createAuditLog(
        'access_request_rejected',
        'access_request',
        requestId,
        { rejectedBy: currentUser.uuid, notes }
      );

      return { success: true };

    } catch (error) {
      console.error('Error rejecting access request:', error);
      return { success: false, error: 'Failed to reject access request' };
    }
  }

  // Get organization statistics
  async getOrganizationStats(): Promise<{
    totalMembers: number;
    totalProjects: number;
    pendingRequests: number;
    activeProjects: number;
  }> {
    const organization = await authService.getCurrentOrganization();
    if (!organization) {
      return { totalMembers: 0, totalProjects: 0, pendingRequests: 0, activeProjects: 0 };
    }

    const [totalMembers, totalProjects, pendingRequests, activeProjects] = await Promise.all([
      db.users.where('organizationId').equals(organization.uuid).and(u => u.isActive === true).count(),
      db.projects.where('organizationId').equals(organization.uuid).count(),
      db.accessRequests.where('status').equals('pending').count(),
      db.projects.where('organizationId').equals(organization.uuid).and(p => p.status === 'active').count()
    ]);

    return { totalMembers, totalProjects, pendingRequests, activeProjects };
  }
}

// Export singleton instance
export const organizationService = OrganizationService.getInstance();
