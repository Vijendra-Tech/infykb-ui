"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDexieAuthStore } from '@/store/use-dexie-auth-store';
import { useDexieOrganizationStore } from '@/store/use-dexie-organization-store';
import { 
  useLLMSettingsStore, 
  LLMProvider,
  providerNames,
  ModelOption,
  providerModels
} from '@/store/use-llm-settings-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Database, 
  Plus, 
  Users, 
  Settings, 
  Trash2, 
  Edit,
  Calendar,
  Key,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Building
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ProjectsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useDexieAuthStore();
  const { 
    projects, 
    isLoading, 
    loadProjects, 
    loadMembers,
    createProject, 
    updateProject, 
    deleteProject 
  } = useDexieOrganizationStore();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    modelProvider: 'none' as LLMProvider,
    modelId: '',
    apiKey: '',
  });
  
  const [availableModels, setAvailableModels] = useState<ModelOption[]>([]);
  const [hoveredModel, setHoveredModel] = useState<ModelOption | null>(null);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    loadProjects();
    loadMembers();
  }, [isAuthenticated, router, loadProjects, loadMembers]);

  // Handle provider change
  const handleProviderChange = (value: LLMProvider) => {
    setFormData(prev => ({ ...prev, modelProvider: value, modelId: '' }));
    
    if (value === 'none') {
      setAvailableModels([]);
      return;
    }
    
    // Get available models for this provider
    const models = providerModels[value as Exclude<LLMProvider, 'none'>] || [];
    setAvailableModels(models);
    
    // Set the first model as default when changing provider
    if (models.length > 0) {
      setFormData(prev => ({ ...prev, modelId: models[0].id }));
    }
  };
  
  // Handle model change
  const handleModelChange = (value: string) => {
    setFormData(prev => ({ ...prev, modelId: value }));
    setHoveredModel(null); // Clear hover panel when selection is made
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      modelProvider: 'none' as LLMProvider,
      modelId: '',
      apiKey: '',
    });
    setAvailableModels([]);
    setHoveredModel(null);
    setError('');
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.description) {
      setError('Please fill in all required fields');
      return;
    }

    const result = await createProject({
      name: formData.name,
      description: formData.description,
      modelConfig: {
        provider: formData.modelProvider as any,
        modelId: formData.modelId,
        apiKey: formData.apiKey,
      },
      permissions: {
        allowedRoles: ['admin', 'member'],
        restrictedFeatures: [],
      },
    });

    if (result.success) {
      setSuccess('Project created successfully');
      resetForm();
      setIsCreateDialogOpen(false);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.error || 'Failed to create project');
    }
  };

  const handleEditProject = (project: any) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      modelProvider: project.modelConfig.provider,
      modelId: project.modelConfig.modelId,
      apiKey: project.modelConfig.apiKey,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    setError('');
    setSuccess('');

    const result = await updateProject(editingProject.id, {
      name: formData.name,
      description: formData.description,
      modelConfig: {
        ...editingProject.modelConfig,
        provider: formData.modelProvider as any,
        modelId: formData.modelId,
        apiKey: formData.apiKey,
      },
    });

    if (result.success) {
      setSuccess('Project updated successfully');
      resetForm();
      setIsEditDialogOpen(false);
      setEditingProject(null);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.error || 'Failed to update project');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    const result = await deleteProject(projectId);
    if (result.success) {
      setSuccess('Project deleted successfully');
      setProjectToDelete(null);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.error || 'Failed to delete project');
    }
  };

  const getProviderBadge = (provider: string) => {
    const providerConfig = {
      openai: { label: 'OpenAI', className: 'bg-green-100 text-green-800' },
      azure: { label: 'Azure OpenAI', className: 'bg-blue-100 text-blue-800' },
      anthropic: { label: 'Anthropic', className: 'bg-purple-100 text-purple-800' },
      google: { label: 'Google', className: 'bg-red-100 text-red-800' },
      ollama: { label: 'Ollama', className: 'bg-gray-100 text-gray-800' },
    };

    const config = providerConfig[provider as keyof typeof providerConfig] || providerConfig.openai;
    return (
      <Badge variant="secondary" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 pt-20 pb-10 px-6 md:px-10 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link
                href="/dashboard"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                Projects
              </h1>
            </div>
            <p className="text-muted-foreground">
              {isAdmin ? 'Manage organization projects and AI model configurations' : 'Your assigned projects'}
            </p>
          </div>
          
          {isAdmin && (
            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center gap-2"
              onClick={() => router.push('/projects/new')}
            >
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          )}
          {isAdmin && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <div style={{ display: 'none' }}></div>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <form onSubmit={handleCreateProject}>
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>
                      Set up a new project with AI model configuration
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Project Name</Label>
                        <Input
                          id="name"
                          placeholder="Enter project name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="modelProvider">LLM Provider</Label>
                        <Select value={formData.modelProvider} onValueChange={handleProviderChange}>
                          <SelectTrigger id="modelProvider">
                            <SelectValue placeholder="Select a provider" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(providerNames).map(([key, name]) => (
                              <SelectItem key={key} value={key as LLMProvider}>{name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                          Select your preferred AI provider
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe the project purpose and goals"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        required
                      />
                    </div>
                    
                    {formData.modelProvider !== 'none' && availableModels.length > 0 && (
                      <div 
                        className="space-y-2 animate-in fade-in slide-in-from-top-5 duration-300"
                        key={formData.modelProvider}
                      >
                        <div className="space-y-2 relative">
                          <Label htmlFor="model">Model</Label>
                          <div className="relative">
                            <Select value={formData.modelId} onValueChange={handleModelChange}>
                              <SelectTrigger id="model">
                                <SelectValue placeholder="Select a model" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableModels.map((model) => (
                                  <SelectItem 
                                    key={model.id} 
                                    value={model.id}
                                    onMouseEnter={() => setHoveredModel(model)}
                                    onMouseLeave={() => setHoveredModel(null)}
                                    className="relative"
                                  >
                                    {model.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            
                            {/* Model Details Hover Panel */}
                            {hoveredModel && (
                              <div 
                                className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] w-80 bg-background border border-border rounded-lg shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-200"
                                onMouseEnter={() => setHoveredModel(hoveredModel)}
                                onMouseLeave={() => setHoveredModel(null)}
                              >
                                <div className="space-y-3">
                                  <div className="border-b border-border pb-2">
                                    <h3 className="font-semibold text-foreground text-lg">{hoveredModel.name}</h3>
                                    {hoveredModel.description && (
                                      <p className="text-sm text-muted-foreground mt-1">{hoveredModel.description}</p>
                                    )}
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm font-medium text-muted-foreground">Context</span>
                                      <span className="text-sm font-mono text-foreground">{hoveredModel.contextLength.toLocaleString()} tokens</span>
                                    </div>
                                    
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm font-medium text-muted-foreground">Input Pricing</span>
                                      <span className="text-sm font-mono text-foreground">${hoveredModel.inputPricing.toFixed(2)} / million tokens</span>
                                    </div>
                                    
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm font-medium text-muted-foreground">Output Pricing</span>
                                      <span className="text-sm font-mono text-foreground">${hoveredModel.outputPricing.toFixed(2)} / million tokens</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Select the specific model from {providerNames[formData.modelProvider]}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {formData.modelProvider !== 'none' && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-5 duration-300">
                        <Label htmlFor="apiKey">
                          {`${providerNames[formData.modelProvider]} API Key`}
                        </Label>
                        <Input
                          id="apiKey"
                          type="password"
                          placeholder="Enter API key"
                          value={formData.apiKey}
                          onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Enter your {providerNames[formData.modelProvider]} API key
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsCreateDialogOpen(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Creating...' : 'Create Project'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </motion.div>

        {/* Alerts */}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Projects Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {projects.map((project) => {
            // For now, we'll use a placeholder for member count since getProjectMembers is async
            // TODO: Implement proper async loading of project members
            const projectMemberCount: number = 0; // Placeholder until async loading is implemented
            
            return (
              <Card key={project.id} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{project.name}</CardTitle>
                      <CardDescription className="text-sm line-clamp-2">
                        {project.description}
                      </CardDescription>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-1 ml-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditProject(project)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => setProjectToDelete(project.id?.toString() || null)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Delete Project</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete "{project.name}"? This action cannot be undone 
                                and all project data will be permanently removed.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setProjectToDelete(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => project?.id && handleDeleteProject(project.id.toString())}
                                disabled={isLoading}
                              >
                                {isLoading ? 'Deleting...' : 'Delete Project'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{project.modelConfig?.modelId || 'N/A'}</span>
                    </div>
                    {getProviderBadge(project.modelConfig?.provider || 'openai')}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {projectMemberCount} member{projectMemberCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => router.push(`/projects/${project.id}`)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Project
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>

        {/* Empty State */}
        {projects.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <Database className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
            <p className="text-muted-foreground mb-6">
              {isAdmin 
                ? 'Create your first project to get started with AI-powered workflows'
                : 'No projects have been assigned to you yet. Contact your admin for access.'
              }
            </p>
            {isAdmin && (
              <Button
                onClick={() => router.push('/projects/new')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Project
              </Button>
            )}
          </motion.div>
        )}

        {/* Edit Project Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleUpdateProject}>
              <DialogHeader>
                <DialogTitle>Edit Project</DialogTitle>
                <DialogDescription>
                  Update project details and configuration
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Project Name</Label>
                    <Input
                      id="edit-name"
                      placeholder="Enter project name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-modelProvider">AI Provider</Label>
                    <Select value={formData.modelProvider} onValueChange={handleProviderChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(providerNames).map(([key, name]) => (
                          <SelectItem key={key} value={key as LLMProvider}>{name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    placeholder="Describe the project purpose and goals"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-modelId">Model</Label>
                    <Input
                      id="edit-modelId"
                      placeholder="e.g., gpt-4o, claude-3-sonnet"
                      value={formData.modelId}
                      onChange={(e) => setFormData(prev => ({ ...prev, modelId: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-apiKey">API Key</Label>
                    <Input
                      id="edit-apiKey"
                      type="password"
                      placeholder="Enter API key"
                      value={formData.apiKey}
                      onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingProject(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Update Project'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
