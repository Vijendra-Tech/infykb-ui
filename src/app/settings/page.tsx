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
import { useLLMSettingsStore, LLMModel } from "@/store/use-llm-settings-store";
import { Settings, Save, Key } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function SettingsPage() {
  const { selectedModel, apiKey, setSelectedModel, setApiKey } = useLLMSettingsStore();
  const [tempModel, setTempModel] = useState<LLMModel>(selectedModel);
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  // Initialize form with stored values
  useEffect(() => {
    setTempModel(selectedModel);
    setTempApiKey(apiKey);
  }, [selectedModel, apiKey]);

  // Validate API key based on selected model
  const validateApiKey = (key: string, model: LLMModel): string | null => {
    if (!key.trim()) {
      return "API key is required";
    }

    // Model-specific validation
    if (model.startsWith('gpt')) {
      // OpenAI API keys typically start with 'sk-' and are 51 characters
      if (!key.startsWith('sk-') || key.length < 30) {
        return "Invalid OpenAI API key format";
      }
    } else if (model.startsWith('claude')) {
      // Anthropic API keys typically start with 'sk-ant-' and are longer
      if (!key.startsWith('sk-ant-') && !key.startsWith('sk-')) {
        return "Invalid Anthropic API key format";
      }
    } else if (model === 'gemini-pro') {
      // Google API keys are typically 39 characters
      if (key.length < 20) {
        return "Invalid Google API key format";
      }
    }

    return null;
  };

  // Handle API key change
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value;
    setTempApiKey(newKey);
    setApiKeyError(validateApiKey(newKey, tempModel));
  };

  // Handle model change
  const handleModelChange = (value: LLMModel) => {
    setTempModel(value);
    // Re-validate API key when model changes
    setApiKeyError(validateApiKey(tempApiKey, value));
  };

  const handleSaveSettings = () => {
    // Final validation before saving
    const error = validateApiKey(tempApiKey, tempModel);
    if (error) {
      setApiKeyError(error);
      toast({
        title: "Validation Error",
        description: error,
        variant: "destructive"
      });
      return;
    }

    setSelectedModel(tempModel);
    setApiKey(tempApiKey);
    
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
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="model">LLM Model</Label>
              <Select value={tempModel} onValueChange={handleModelChange}>
                <SelectTrigger id="model">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (OpenAI)</SelectItem>
                  <SelectItem value="gpt-4">GPT-4 (OpenAI)</SelectItem>
                  <SelectItem value="claude-3-opus">Claude 3 Opus (Anthropic)</SelectItem>
                  <SelectItem value="claude-3-sonnet">Claude 3 Sonnet (Anthropic)</SelectItem>
                  <SelectItem value="gemini-pro">Gemini Pro (Google)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="apiKey"
                    type={isApiKeyVisible ? "text" : "password"}
                    value={tempApiKey}
                    onChange={handleApiKeyChange}
                    placeholder="Enter your API key"
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
