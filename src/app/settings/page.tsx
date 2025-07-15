"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  useLLMSettingsStore, 
  LLMProvider,
  providerNames,
  ModelOption,
  providerModels
} from "@/store/use-llm-settings-store";
import { Settings, Save, Key, Cloud } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  const { 
    selectedProvider,
    selectedModelId, 
    apiKey, 
    azureApiEndpoint, 
    azureDeploymentName, 
    azureApiVersion, 
    setSelectedProvider,
    setSelectedModelId, 
    setApiKey, 
    setAzureConfig,
    getAvailableModels,
    getCurrentModel
  } = useLLMSettingsStore();
  
  const [tempProvider, setTempProvider] = useState<LLMProvider>(selectedProvider);
  const [tempModelId, setTempModelId] = useState<string>(selectedModelId);
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [tempAzureEndpoint, setTempAzureEndpoint] = useState(azureApiEndpoint || '');
  const [tempAzureDeployment, setTempAzureDeployment] = useState(azureDeploymentName || '');
  const [tempAzureApiVersion, setTempAzureApiVersion] = useState(azureApiVersion || '2023-12-01-preview');
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [azureEndpointError, setAzureEndpointError] = useState<string | null>(null);
  const [azureDeploymentError, setAzureDeploymentError] = useState<string | null>(null);
  const [availableModels, setAvailableModels] = useState<ModelOption[]>(getAvailableModels());
  
  const { toast } = useToast();
  const router = useRouter();

  // Initialize form with stored values
  useEffect(() => {
    setTempProvider(selectedProvider);
    setTempModelId(selectedModelId);
    setTempApiKey(apiKey);
    setTempAzureEndpoint(azureApiEndpoint || '');
    setTempAzureDeployment(azureDeploymentName || '');
    setTempAzureApiVersion(azureApiVersion || '2023-12-01-preview');
    setAvailableModels(getAvailableModels());
  }, [selectedProvider, selectedModelId, apiKey, azureApiEndpoint, azureDeploymentName, azureApiVersion, getAvailableModels]);
  
  // Scroll to Azure configuration section when it becomes visible
  useEffect(() => {
    if (tempProvider === 'azure') {
      // Longer delay to ensure the section is rendered and animation has started
      const timer = setTimeout(() => {
        const azureSection = document.getElementById('azure-config-section');
        if (azureSection) {
          azureSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300); // Increased delay to account for animation
      return () => clearTimeout(timer);
    }
  }, [tempProvider]);

  // Validate API key based on selected provider
  const validateApiKey = (key: string, provider: LLMProvider): string | null => {
    if (!key.trim()) {
      return "API key is required";
    }

    // Provider-specific validation
    switch (provider) {
      case 'openai':
        // OpenAI API keys typically start with 'sk-' and are 51 characters
        if (!key.startsWith('sk-') || key.length < 30) {
          return "Invalid OpenAI API key format";
        }
        break;
      case 'anthropic':
        // Anthropic API keys typically start with 'sk-ant-' and are longer
        if (!key.startsWith('sk-ant-') && !key.startsWith('sk-')) {
          return "Invalid Anthropic API key format";
        }
        break;
      case 'google':
        // Google API keys are typically 39 characters
        if (key.length < 20) {
          return "Invalid Google API key format";
        }
        break;
      case 'azure':
        // Azure OpenAI API keys don't have a specific format but should be non-empty
        if (key.length < 10) {
          return "Azure API key seems too short";
        }
        break;
      // Add validation for other providers as needed
    }

    return null;
  };
  
  // Validate Azure endpoint URL
  const validateAzureEndpoint = (endpoint: string): string | null => {
    if (!endpoint.trim()) {
      return "Azure API endpoint is required";
    }
    
    try {
      const url = new URL(endpoint);
      if (!url.hostname.includes('openai.azure.com')) {
        return "Azure endpoint should be on openai.azure.com domain";
      }
    } catch (e) {
      return "Invalid URL format for Azure endpoint";
    }
    
    return null;
  };
  
  // Validate Azure deployment name
  const validateAzureDeployment = (deployment: string): string | null => {
    if (!deployment.trim()) {
      return "Azure deployment name is required";
    }
    
    return null;
  };

  // Handle API key change
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value;
    setTempApiKey(newKey);
    setApiKeyError(validateApiKey(newKey, tempProvider));
  };

  // Handle Azure endpoint change
  const handleAzureEndpointChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndpoint = e.target.value;
    setTempAzureEndpoint(newEndpoint);
    setAzureEndpointError(validateAzureEndpoint(newEndpoint));
  };

  // Handle Azure deployment change
  const handleAzureDeploymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDeployment = e.target.value;
    setTempAzureDeployment(newDeployment);
    setAzureDeploymentError(validateAzureDeployment(newDeployment));
  };

  // Handle Azure API version change
  const handleAzureApiVersionChange = (value: string) => {
    setTempAzureApiVersion(value);
  };

  // Handle provider change
  const handleProviderChange = (value: LLMProvider) => {
    setTempProvider(value);
    
    // Handle 'none' case separately
    if (value === 'none') {
      setAvailableModels([]);
      setTempModelId('');
      return;
    }
    
    // Get available models for this provider
    const models = providerModels[value as Exclude<LLMProvider, 'none'>] || [];
    setAvailableModels(models);
    
    // Set the first model as default when changing provider
    if (models.length > 0) {
      setTempModelId(models[0].id);
    } else {
      setTempModelId(''); // Clear model selection if no models available
    }
    
    // Re-validate API key when provider changes
    setApiKeyError(validateApiKey(tempApiKey, value));
    
    // If switching to Azure, validate Azure fields
    if (value === 'azure') {
      setAzureEndpointError(validateAzureEndpoint(tempAzureEndpoint));
      setAzureDeploymentError(validateAzureDeployment(tempAzureDeployment));
    }
  };
  
  // Handle model change
  const handleModelChange = (value: string) => {
    setTempModelId(value);
  };

  const handleSaveSettings = () => {
    // Final validation before saving
    const apiKeyError = validateApiKey(tempApiKey, tempProvider);
    let hasError = false;
    
    if (apiKeyError) {
      setApiKeyError(apiKeyError);
      toast({
        title: "API Key Validation Error",
        description: apiKeyError,
        variant: "destructive"
      });
      hasError = true;
    }
    
    // Validate Azure fields if using Azure
    if (tempProvider === 'azure') {
      const endpointError = validateAzureEndpoint(tempAzureEndpoint);
      const deploymentError = validateAzureDeployment(tempAzureDeployment);
      
      if (endpointError) {
        setAzureEndpointError(endpointError);
        toast({
          title: "Azure Endpoint Validation Error",
          description: endpointError,
          variant: "destructive"
        });
        hasError = true;
      }
      
      if (deploymentError) {
        setAzureDeploymentError(deploymentError);
        toast({
          title: "Azure Deployment Validation Error",
          description: deploymentError,
          variant: "destructive"
        });
        hasError = true;
      }
    }
    
    if (hasError) return;

    // Save all settings
    setSelectedProvider(tempProvider);
    setSelectedModelId(tempModelId);
    setApiKey(tempApiKey);
    
    // Save Azure settings if applicable
    if (tempProvider === 'azure') {
      setAzureConfig({
        endpoint: tempAzureEndpoint,
        deploymentName: tempAzureDeployment,
        apiVersion: tempAzureApiVersion
      });
    }
    
    toast({
      title: "Settings saved",
      description: "Your LLM settings have been saved successfully.",
    });
  };

  return (
    <div className="container flex flex-col items-center justify-center py-8">
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-2 mb-8">
          <Settings className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>LLM Configuration</CardTitle>
            <CardDescription>
              Configure your preferred LLM model and API key. Your API key is stored locally in your browser.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="provider">LLM Provider</Label>
                <Select value={tempProvider} onValueChange={handleProviderChange}>
                  <SelectTrigger id="provider">
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

              {tempProvider !== 'none' && availableModels.length > 0 && (
                <div 
                  className="space-y-2 animate-in fade-in slide-in-from-top-5 duration-300"
                  key={tempProvider} // Key helps React properly animate when provider changes
                >
                  <Label htmlFor="model">Model</Label>
                  <Select value={tempModelId} onValueChange={handleModelChange}>
                    <SelectTrigger id="model">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map((model) => (
                        <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Select the specific model from {providerNames[tempProvider]}
                  </p>
                </div>
              )}
            </div>

            {tempProvider !== 'none' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-5 duration-300">
                <Label htmlFor="apiKey">
                  {`${providerNames[tempProvider]} API Key`}
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="apiKey"
                      type={isApiKeyVisible ? "text" : "password"}
                      value={tempApiKey}
                      onChange={handleApiKeyChange}
                      placeholder={`Enter your ${providerNames[tempProvider]} API key`}
                      className={`pr-10 ${apiKeyError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setIsApiKeyVisible(!isApiKeyVisible)}
                    >
                      <Key className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {apiKeyError && (
                  <p className="text-xs text-red-500 mt-1">
                    {apiKeyError}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Your API key is stored locally in your browser and never sent to our servers.
                </p>
              </div>
            )}
            
            {/* Azure OpenAI specific fields */}
            {tempProvider === 'azure' && (
              <div 
                id="azure-config-section" 
                className="space-y-4 mt-4 p-4 border border-blue-200 bg-blue-50 rounded-md shadow-sm
                         animate-in fade-in slide-in-from-top-5 duration-300"
                key="azure-config"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Cloud className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-medium">Azure OpenAI Configuration</h3>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="azureEndpoint">Azure API Endpoint</Label>
                  <Input
                    id="azureEndpoint"
                    value={tempAzureEndpoint}
                    onChange={handleAzureEndpointChange}
                    placeholder="https://your-resource-name.openai.azure.com/"
                    className={azureEndpointError ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  />
                  {azureEndpointError && (
                    <p className="text-xs text-red-500 mt-1">{azureEndpointError}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    The endpoint URL for your Azure OpenAI resource
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="azureDeployment">Azure Deployment Name</Label>
                  <Input
                    id="azureDeployment"
                    value={tempAzureDeployment}
                    onChange={handleAzureDeploymentChange}
                    placeholder="your-deployment-name"
                    className={azureDeploymentError ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  />
                  {azureDeploymentError && (
                    <p className="text-xs text-red-500 mt-1">{azureDeploymentError}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    The name of your Azure OpenAI model deployment
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="azureApiVersion">API Version</Label>
                  <Select value={tempAzureApiVersion} onValueChange={handleAzureApiVersionChange}>
                    <SelectTrigger id="azureApiVersion">
                      <SelectValue placeholder="Select API version" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2023-12-01-preview">2023-12-01-preview</SelectItem>
                      <SelectItem value="2023-05-15">2023-05-15</SelectItem>
                      <SelectItem value="2023-03-15-preview">2023-03-15-preview</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    The Azure OpenAI API version to use
                  </p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleSaveSettings}>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
