"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDexieAuthStore } from '@/store/use-dexie-auth-store';
import { useDexieOrganizationStore } from '@/store/use-dexie-organization-store';
import { useLLMSettingsStore, LLMProvider, providerNames, ModelOption, providerModels } from '@/store/use-llm-settings-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function NewProjectPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useDexieAuthStore();
  const { createProject } = useDexieOrganizationStore();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    modelProvider: 'none' as LLMProvider,
    modelId: '',
    apiKey: '',
    // Azure OpenAI specific configuration
    azureEndpoint: '',
    azureDeploymentName: '',
    azureApiVersion: '2024-02-15-preview',
    azureEmbeddingModel: '',
  });
  
  const [availableModels, setAvailableModels] = useState<ModelOption[]>([]);
  const [hoveredModel, setHoveredModel] = useState<ModelOption | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Authentication check - redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
  }, [isAuthenticated, router]);

  // Update available models when provider changes
  useEffect(() => {
    if (formData.modelProvider && formData.modelProvider !== 'none') {
      const models = providerModels[formData.modelProvider] || [];
      setAvailableModels(models);
      // Reset model selection when provider changes
      setFormData(prev => ({ ...prev, modelId: '' }));
    } else {
      setAvailableModels([]);
    }
  }, [formData.modelProvider]);

  const handleProviderChange = (provider: LLMProvider) => {
    setFormData(prev => ({
      ...prev,
      modelProvider: provider,
      modelId: '',
      apiKey: '',
      // Reset Azure fields when switching providers
      azureEndpoint: '',
      azureDeploymentName: '',
      azureApiVersion: '2024-02-15-preview',
      azureEmbeddingModel: '',
    }));
  };

  const handleModelChange = (modelId: string) => {
    setFormData(prev => ({ ...prev, modelId }));
    // Clear hovered model when selection is made
    setHoveredModel(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!formData.name || !formData.description) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    // Additional validation for Azure OpenAI
    if (formData.modelProvider === 'azure') {
      if (!formData.azureEndpoint || !formData.azureDeploymentName) {
        setError('Please fill in all required Azure OpenAI fields (Endpoint and Deployment Name)');
        setIsLoading(false);
        return;
      }
    }

    try {
      const modelConfig: any = {
        provider: formData.modelProvider as any,
        modelId: formData.modelId,
        apiKey: formData.apiKey,
      };

      // Add Azure-specific configuration if Azure provider is selected
      if (formData.modelProvider === 'azure') {
        modelConfig.azureConfig = {
          endpoint: formData.azureEndpoint,
          deploymentName: formData.azureDeploymentName,
          apiVersion: formData.azureApiVersion,
          embeddingModel: formData.azureEmbeddingModel || undefined,
        };
      }

      const result = await createProject({
        name: formData.name,
        description: formData.description,
        modelConfig,
        permissions: {
          allowedRoles: ['admin', 'member'],
          restrictedFeatures: [],
        },
      });

      if (result.success) {
        setSuccess('Project created successfully!');
        setTimeout(() => {
          router.push('/projects');
        }, 1500);
      } else {
        setError(result.error || 'Failed to create project');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/projects');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto pb-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="mb-4 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
          
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-2">
              Create New Project
            </h1>
            <p className="text-slate-600 text-lg">
              Set up a new knowledge base project with AI model configuration
            </p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="backdrop-blur-sm bg-white/80 border-slate-200/50 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 rounded-t-lg">
            <CardTitle className="text-slate-800">Project Configuration</CardTitle>
            <CardDescription>
              Configure your project settings and AI model preferences
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-700 font-medium">
                      Project Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter project name"
                      className="border-slate-300 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description" className="text-slate-700 font-medium">
                      Description *
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your project and its purpose"
                      className="border-slate-300 focus:border-blue-500 min-h-[100px]"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* AI Model Configuration */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
                  AI Model Configuration
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">AI Provider</Label>
                    <Select value={formData.modelProvider} onValueChange={handleProviderChange}>
                      <SelectTrigger className="border-slate-300 focus:border-blue-500">
                        <SelectValue placeholder="Select AI provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(providerNames).map(([key, name]) => (
                          <SelectItem key={key} value={key}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.modelProvider !== 'none' && availableModels.length > 0 && (
                    <div className="space-y-2 relative">
                      <Label className="text-slate-700 font-medium">Model</Label>
                      <div className="flex gap-2">
                        <Select value={formData.modelId} onValueChange={handleModelChange}>
                          <SelectTrigger className="border-slate-300 focus:border-blue-500">
                            <SelectValue placeholder="Select model" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableModels.map((model) => (
                              <SelectItem 
                                key={model.id} 
                                value={model.id}
                                onMouseEnter={() => setHoveredModel(model)}
                                onMouseLeave={() => setHoveredModel(null)}
                              >
                                {model.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Model Details Floating Tooltip */}
                      {hoveredModel && (
                        <div className="absolute top-0 right-0 transform translate-x-4 z-50 w-80 p-4 bg-white rounded-lg border border-slate-200 shadow-xl backdrop-blur-sm" style={{ transform: 'translateX(1rem) translateY(calc(-100% - 1rem))' }}>
                          <div className="relative">
                            <h4 className="font-medium text-slate-800 mb-2">{hoveredModel.name}</h4>
                            <div className="space-y-1 text-sm text-slate-600">
                              <p><span className="font-medium">Context:</span> {hoveredModel.contextLength?.toLocaleString()} tokens</p>
                              <p><span className="font-medium">Input:</span> ${hoveredModel.inputPricing}/1M tokens</p>
                              <p><span className="font-medium">Output:</span> ${hoveredModel.outputPricing}/1M tokens</p>
                              {hoveredModel.description && (
                                <p className="mt-2">{hoveredModel.description}</p>
                              )}
                            </div>
                            {/* Arrow pointing down to the select */}
                            <div className="absolute -bottom-2 left-8 w-4 h-4 bg-white border-b border-r border-slate-200 transform rotate-45"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {formData.modelProvider !== 'none' && (
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="apiKey" className="text-slate-700 font-medium">
                        {providerNames[formData.modelProvider]} API Key
                      </Label>
                      <Input
                        id="apiKey"
                        type="password"
                        value={formData.apiKey}
                        onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                        placeholder={`Enter your ${providerNames[formData.modelProvider]} API key`}
                        className="border-slate-300 focus:border-blue-500"
                      />
                      <p className="text-sm text-slate-500">
                        Your API key will be stored securely and used only for this project.
                      </p>
                    </div>
                  )}

                  {/* Azure OpenAI Specific Configuration */}
                  {formData.modelProvider === 'azure' && (
                    <>
                      <div className="md:col-span-2">
                        <h4 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-4">
                          Azure OpenAI Configuration
                        </h4>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="azureEndpoint" className="text-slate-700 font-medium">
                          Azure Endpoint *
                        </Label>
                        <Input
                          id="azureEndpoint"
                          value={formData.azureEndpoint}
                          onChange={(e) => setFormData(prev => ({ ...prev, azureEndpoint: e.target.value }))}
                          placeholder="https://your-resource.openai.azure.com"
                          className="border-slate-300 focus:border-blue-500"
                        />
                        <p className="text-sm text-slate-500">
                          Your Azure OpenAI resource endpoint URL
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="azureDeploymentName" className="text-slate-700 font-medium">
                          Deployment Name *
                        </Label>
                        <Input
                          id="azureDeploymentName"
                          value={formData.azureDeploymentName}
                          onChange={(e) => setFormData(prev => ({ ...prev, azureDeploymentName: e.target.value }))}
                          placeholder="gpt-4-deployment"
                          className="border-slate-300 focus:border-blue-500"
                        />
                        <p className="text-sm text-slate-500">
                          The deployment name you created in Azure OpenAI Studio
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="azureApiVersion" className="text-slate-700 font-medium">
                          API Version
                        </Label>
                        <Select 
                          value={formData.azureApiVersion} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, azureApiVersion: value }))}
                        >
                          <SelectTrigger className="border-slate-300 focus:border-blue-500">
                            <SelectValue placeholder="Select API version" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2024-02-15-preview">2024-02-15-preview (Latest)</SelectItem>
                            <SelectItem value="2023-12-01-preview">2023-12-01-preview</SelectItem>
                            <SelectItem value="2023-10-01-preview">2023-10-01-preview</SelectItem>
                            <SelectItem value="2023-09-01-preview">2023-09-01-preview</SelectItem>
                            <SelectItem value="2023-08-01-preview">2023-08-01-preview</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-slate-500">
                          Azure OpenAI API version to use
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="azureEmbeddingModel" className="text-slate-700 font-medium">
                          Embedding Model (Optional)
                        </Label>
                        <Input
                          id="azureEmbeddingModel"
                          value={formData.azureEmbeddingModel}
                          onChange={(e) => setFormData(prev => ({ ...prev, azureEmbeddingModel: e.target.value }))}
                          placeholder="text-embedding-ada-002"
                          className="border-slate-300 focus:border-blue-500"
                        />
                        <p className="text-sm text-slate-500">
                          Embedding model deployment name for vector search (optional)
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Project
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
