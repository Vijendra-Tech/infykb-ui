"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDexieAuthStore } from '@/store/use-dexie-auth-store';
import { useOrganizationStore } from '@/store/use-organization-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Send, 
  Database, 
  Key, 
  UserPlus, 
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function NewRequestPage() {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized, isLoading } = useDexieAuthStore();
  const { projects, fetchProjects, createAccessRequest } = useOrganizationStore();
  
  const [formData, setFormData] = useState({
    requestType: '',
    projectId: '',
    requestedRole: '',
    requestedPermissions: [] as string[],
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Wait for auth initialization to complete
    if (!isInitialized || isLoading) {
      return;
    }
    
    // Check if user is authenticated
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    fetchProjects();
  }, [user, isInitialized, isLoading, router, fetchProjects]);

  const requestTypes = [
    { value: 'project_access', label: 'Project Access', icon: Database, description: 'Request access to a specific project' },
    { value: 'model_key_access', label: 'Model API Key Access', icon: Key, description: 'Request access to model API keys' },
    { value: 'role_upgrade', label: 'Role Upgrade', icon: UserPlus, description: 'Request upgrade to higher role' },
    { value: 'feature_access', label: 'Feature Access', icon: TrendingUp, description: 'Request access to premium features' }
  ];

  const roles = [
    { value: 'viewer', label: 'Viewer' },
    { value: 'member', label: 'Member' },
    { value: 'admin', label: 'Admin' },
    { value: 'approver', label: 'Approver' }
  ];

  const permissions = [
    'read_projects',
    'write_projects',
    'delete_projects',
    'manage_members',
    'approve_requests',
    'access_analytics',
    'manage_api_keys'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!formData.requestType) {
        throw new Error('Please select a request type');
      }

      if (formData.requestType === 'project_access' && !formData.projectId) {
        throw new Error('Please select a project');
      }

      if (formData.requestType === 'role_upgrade' && !formData.requestedRole) {
        throw new Error('Please select a requested role');
      }

      const requestData = {
        requestType: formData.requestType as any,
        projectId: formData.projectId || undefined,
        requestedRole: formData.requestedRole || undefined,
        requestedPermissions: formData.requestedPermissions.length > 0 ? formData.requestedPermissions : undefined,
        message: formData.message || undefined
      };

      await createAccessRequest(requestData);
      setSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        router.push('/requests');
      }, 2000);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const selectedRequestType = requestTypes.find(type => type.value === formData.requestType);

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Request Submitted Successfully!</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your access request has been submitted and is pending approval. You'll be notified once it's reviewed.
            </p>
            <Button onClick={() => router.push('/requests')}>
              View My Requests
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/requests">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Requests
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              New Access Request
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Request access to projects, features, or role upgrades
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-slate-200/60 dark:border-slate-700/60 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-600" />
                Request Details
              </CardTitle>
              <CardDescription>
                Fill out the form below to submit your access request
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Request Type */}
                <div className="space-y-3">
                  <Label htmlFor="requestType">Request Type *</Label>
                  <Select value={formData.requestType} onValueChange={(value) => handleInputChange('requestType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select request type" />
                    </SelectTrigger>
                    <SelectContent>
                      {requestTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="w-4 h-4" />
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-xs text-muted-foreground">{type.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Project Selection (for project access) */}
                {formData.requestType === 'project_access' && (
                  <div className="space-y-3">
                    <Label htmlFor="projectId">Project *</Label>
                    <Select value={formData.projectId} onValueChange={(value) => handleInputChange('projectId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.uuid} value={project.uuid}>
                            <div>
                              <div className="font-medium">{project.name}</div>
                              <div className="text-xs text-muted-foreground">{project.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Role Selection (for role upgrade) */}
                {formData.requestType === 'role_upgrade' && (
                  <div className="space-y-3">
                    <Label htmlFor="requestedRole">Requested Role *</Label>
                    <Select value={formData.requestedRole} onValueChange={(value) => handleInputChange('requestedRole', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select requested role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Permissions (for feature access) */}
                {formData.requestType === 'feature_access' && (
                  <div className="space-y-3">
                    <Label>Requested Permissions</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {permissions.map((permission) => (
                        <label key={permission} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.requestedPermissions.includes(permission)}
                            onChange={(e) => {
                              const newPermissions = e.target.checked
                                ? [...formData.requestedPermissions, permission]
                                : formData.requestedPermissions.filter(p => p !== permission);
                              handleInputChange('requestedPermissions', newPermissions);
                            }}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">{permission.replace('_', ' ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message */}
                <div className="space-y-3">
                  <Label htmlFor="message">Additional Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Provide additional context or justification for your request..."
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    rows={4}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/requests')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !formData.requestType}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Request
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
