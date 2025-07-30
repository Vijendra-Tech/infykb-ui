"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle 
} from "@/components/ui/sheet";
import {
  Github,
  RefreshCw,
  Database,
  Activity,
  Bug,
  GitBranch,
  MessageSquare,
  Shield,
  Key,
  Webhook,
  CheckCircle,
  Link,
  X
} from "lucide-react";

interface GitHubSettings {
  syncEnabled: boolean;
  repository: string;
  accessToken: string;
  syncIssues: boolean;
  syncPRs: boolean;
  syncDiscussions: boolean;
  autoSync: boolean;
  syncInterval: number;
  webhookUrl: string;
  lastSyncTime?: Date;
}

interface GitHubSourceDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (settings: GitHubSettings & { name: string }) => void;
  initialSettings?: GitHubSettings;
  sourceName?: string;
}

export function GitHubSourceDrawer({
  isOpen,
  onOpenChange,
  onSave,
  initialSettings,
  sourceName = ""
}: GitHubSourceDrawerProps) {
  const [name, setName] = useState(sourceName);
  const [gitHubSettings, setGitHubSettings] = useState<GitHubSettings>({
    syncEnabled: false,
    repository: "",
    accessToken: "",
    syncIssues: true,
    syncPRs: true,
    syncDiscussions: false,
    autoSync: false,
    syncInterval: 30,
    webhookUrl: "",
    ...initialSettings
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [repositoryError, setRepositoryError] = useState<string | null>(null);

  const validateForm = () => {
    let isValid = true;
    
    if (!name.trim()) {
      setNameError("Source name is required");
      isValid = false;
    } else {
      setNameError(null);
    }

    if (!gitHubSettings.repository.trim()) {
      setRepositoryError("Repository URL is required");
      isValid = false;
    } else if (!gitHubSettings.repository.includes("github.com")) {
      setRepositoryError("Please enter a valid GitHub repository URL");
      isValid = false;
    } else {
      setRepositoryError(null);
    }

    return isValid;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave({
        ...gitHubSettings,
        name: name.trim()
      });
      onOpenChange(false);
    }
  };

  const syncGitHubIssues = async () => {
    if (!gitHubSettings.repository) return;
    
    setIsSyncing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setGitHubSettings(prev => ({ ...prev, lastSyncTime: new Date() }));
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const testGitHubConnection = async () => {
    if (!gitHubSettings.repository) return;
    
    setIsSyncing(true);
    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Show success feedback
    } catch (error) {
      console.error('Connection test failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClose = () => {
    setName(sourceName);
    setGitHubSettings({
      syncEnabled: false,
      repository: "",
      accessToken: "",
      syncIssues: true,
      syncPRs: true,
      syncDiscussions: false,
      autoSync: false,
      syncInterval: 30,
      webhookUrl: "",
      ...initialSettings
    });
    setNameError(null);
    setRepositoryError(null);
    onOpenChange(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] sm:w-[600px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            GitHub Integration Settings
          </SheetTitle>
          <SheetDescription>
            Configure GitHub synchronization and integration options for enhanced AI assistance.
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-120px)] mt-6">
          <div className="space-y-6 pr-4">
            {/* Source Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Source Name</label>
              <Input
                placeholder="e.g., Main Repository Issues"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (e.target.value.trim()) setNameError(null);
                }}
                className={nameError ? "border-red-300 focus:ring-red-500" : ""}
              />
              {nameError && <p className="text-sm text-red-500">{nameError}</p>}
            </div>

            {/* Main Sync Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  gitHubSettings.syncEnabled 
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400'
                }`}>
                  <RefreshCw className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">GitHub Sync</h3>
                  <p className="text-sm text-muted-foreground">
                    Enable real-time synchronization with GitHub repositories
                  </p>
                </div>
              </div>
              <Button
                variant={gitHubSettings.syncEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setGitHubSettings(prev => ({ ...prev, syncEnabled: !prev.syncEnabled }))}
              >
                {gitHubSettings.syncEnabled ? 'Enabled' : 'Enable'}
              </Button>
            </div>

            {/* Repository Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Database className="h-4 w-4" />
                Repository Settings
              </h3>
              
              <div className="grid gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Repository URL</label>
                  <div className="relative">
                    <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="https://github.com/username/repository"
                      value={gitHubSettings.repository}
                      onChange={(e) => {
                        setGitHubSettings(prev => ({ ...prev, repository: e.target.value }));
                        if (e.target.value.trim()) setRepositoryError(null);
                      }}
                      className={`pl-10 ${repositoryError ? "border-red-300 focus:ring-red-500" : ""}`}
                    />
                  </div>
                  {repositoryError && <p className="text-sm text-red-500 mt-1">{repositoryError}</p>}
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Access Token</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                      value={gitHubSettings.accessToken}
                      onChange={(e) => setGitHubSettings(prev => ({ ...prev, accessToken: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Optional - Required only for private repositories and higher rate limits
                  </p>
                </div>
              </div>
            </div>

            {/* Sync Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Sync Options
              </h3>
              
              <div className="grid gap-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bug className="h-4 w-4 text-red-500" />
                    <div>
                      <p className="font-medium text-sm">Issues</p>
                      <p className="text-xs text-muted-foreground">Sync repository issues</p>
                    </div>
                  </div>
                  <Button
                    variant={gitHubSettings.syncIssues ? "default" : "outline"}
                    size="sm"
                    onClick={() => setGitHubSettings(prev => ({ ...prev, syncIssues: !prev.syncIssues }))}
                  >
                    {gitHubSettings.syncIssues ? 'On' : 'Off'}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <GitBranch className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="font-medium text-sm">Pull Requests</p>
                      <p className="text-xs text-muted-foreground">Sync pull requests and reviews</p>
                    </div>
                  </div>
                  <Button
                    variant={gitHubSettings.syncPRs ? "default" : "outline"}
                    size="sm"
                    onClick={() => setGitHubSettings(prev => ({ ...prev, syncPRs: !prev.syncPRs }))}
                  >
                    {gitHubSettings.syncPRs ? 'On' : 'Off'}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-4 w-4 text-purple-500" />
                    <div>
                      <p className="font-medium text-sm">Discussions</p>
                      <p className="text-xs text-muted-foreground">Sync repository discussions</p>
                    </div>
                  </div>
                  <Button
                    variant={gitHubSettings.syncDiscussions ? "default" : "outline"}
                    size="sm"
                    onClick={() => setGitHubSettings(prev => ({ ...prev, syncDiscussions: !prev.syncDiscussions }))}
                  >
                    {gitHubSettings.syncDiscussions ? 'On' : 'Off'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Advanced Settings
              </h3>
              
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Auto Sync</p>
                    <p className="text-xs text-muted-foreground">Automatically sync changes</p>
                  </div>
                  <Button
                    variant={gitHubSettings.autoSync ? "default" : "outline"}
                    size="sm"
                    onClick={() => setGitHubSettings(prev => ({ ...prev, autoSync: !prev.autoSync }))}
                  >
                    {gitHubSettings.autoSync ? 'On' : 'Off'}
                  </Button>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Sync Interval (minutes)</label>
                  <Input
                    type="number"
                    min="5"
                    max="1440"
                    value={gitHubSettings.syncInterval}
                    onChange={(e) => setGitHubSettings(prev => ({ ...prev, syncInterval: parseInt(e.target.value) || 30 }))}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Webhook URL (Optional)</label>
                  <div className="relative">
                    <Webhook className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="https://your-webhook-url.com/github"
                      value={gitHubSettings.webhookUrl}
                      onChange={(e) => setGitHubSettings(prev => ({ ...prev, webhookUrl: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    For real-time notifications and updates
                  </p>
                </div>
              </div>
            </div>

            {/* Sync Status */}
            {gitHubSettings.lastSyncTime && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Last Sync</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {gitHubSettings.lastSyncTime.toLocaleString()}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              <Button 
                onClick={syncGitHubIssues}
                disabled={!gitHubSettings.repository || isSyncing}
                className="flex-1"
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Test Sync'}
              </Button>
              <Button 
                variant="outline" 
                onClick={testGitHubConnection}
                disabled={!gitHubSettings.repository || isSyncing}
              >
                <Link className="h-4 w-4 mr-2" />
                Test Connection
              </Button>
            </div>

            {/* Save/Cancel Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={handleClose} variant="outline" className="flex-1">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex-1">
                <CheckCircle className="h-4 w-4 mr-2" />
                Save Configuration
              </Button>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
