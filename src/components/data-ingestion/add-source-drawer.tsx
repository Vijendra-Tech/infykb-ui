"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose
} from "@/components/ui/drawer";
import {
  Upload,
  Database,
  Globe,
  FileText,
  Link,
  Cloud,
  X,
  CheckCircle,
  Github,
  Building2
} from "lucide-react";
import { type IngestionSourceType } from "@/store/use-data-ingestion-store";

interface SourceFormData {
  name: string;
  type: IngestionSourceType;
  url?: string;
  username?: string;
  password?: string;
  description?: string;
  file?: File;
}

interface AddSourceDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: SourceFormData) => void;
}

export function AddSourceDrawer({ isOpen, onOpenChange, onSave }: AddSourceDrawerProps) {
  const [activeTab, setActiveTab] = useState<IngestionSourceType>("GitHub");
  const [formData, setFormData] = useState<SourceFormData>({
    name: "",
    type: "GitHub",
    description: ""
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormData({
      name: "",
      type: "GitHub",
      description: ""
    });
    setSelectedFile(null);
    setErrors({});
    setIsDragging(false);
  };

  const handleTabChange = (value: string) => {
    const sourceType = value as IngestionSourceType;
    setActiveTab(sourceType);
    setFormData(prev => ({ ...prev, type: sourceType }));
    setErrors({});
  };

  const handleInputChange = (field: keyof SourceFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFormData(prev => ({ ...prev, file }));
      if (errors.file) {
        setErrors(prev => ({ ...prev, file: "" }));
      }
    }
  };

  const handleDragEvents = {
    onDragEnter: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    },
    onDragLeave: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    },
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        setSelectedFile(file);
        setFormData(prev => ({ ...prev, file }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Source name is required";
    }

    if (activeTab === "File Upload" && !selectedFile) {
      newErrors.file = "Please select a file to upload";
    }

    if (["API Endpoint", "Database", "GitHub"].includes(activeTab) && !formData.url?.trim()) {
      newErrors.url = "URL is required";
    }

    if (["JIRA", "Salesforce"].includes(activeTab)) {
      if (!formData.url?.trim()) newErrors.url = "URL is required";
      if (!formData.username?.trim()) newErrors.username = "Username is required";
      if (!formData.password?.trim()) newErrors.password = "Password/API Key is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
      resetForm();
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const getTabIcon = (type: IngestionSourceType) => {
    switch (type) {
      case "File Upload": return <Upload className="w-4 h-4" />;
      case "API Endpoint": return <Globe className="w-4 h-4" />;
      case "Database": return <Database className="w-4 h-4" />;
      case "JIRA": return <FileText className="w-4 h-4" />;
      case "Salesforce": return <Building2 className="w-4 h-4" />;
      case "GitHub": return <Github className="w-4 h-4" />;
      default: return <Link className="w-4 h-4" />;
    }
  };

  const renderTabContent = (type: IngestionSourceType) => {
    switch (type) {
      case "File Upload":
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Source Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter a name for this source"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label>File Upload</Label>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging 
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" 
                    : errors.file 
                    ? "border-red-300 bg-red-50 dark:bg-red-950/20" 
                    : "border-gray-300 hover:border-gray-400"
                }`}
                {...handleDragEvents}
              >
                {selectedFile ? (
                  <div className="space-y-2">
                    <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedFile(null);
                        setFormData(prev => ({ ...prev, file: undefined }));
                      }}
                    >
                      Remove File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-12 h-12 mx-auto text-gray-400" />
                    <div>
                      <p className="text-lg font-medium">Drop your file here</p>
                      <p className="text-sm text-gray-500">or click to browse</p>
                    </div>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.doc,.docx,.txt,.csv,.json,.xml"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById("file-upload")?.click()}
                    >
                      Choose File
                    </Button>
                  </div>
                )}
              </div>
              {errors.file && <p className="text-sm text-red-500">{errors.file}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Add a description for this source"
                rows={3}
              />
            </div>
          </div>
        );

      case "API Endpoint":
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Source Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter a name for this API source"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">API Endpoint URL</Label>
              <Input
                id="url"
                value={formData.url || ""}
                onChange={(e) => handleInputChange("url", e.target.value)}
                placeholder="https://api.example.com/data"
                className={errors.url ? "border-red-500" : ""}
              />
              {errors.url && <p className="text-sm text-red-500">{errors.url}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username (Optional)</Label>
                <Input
                  id="username"
                  value={formData.username || ""}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  placeholder="API username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">API Key (Optional)</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password || ""}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="API key or token"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe this API endpoint"
                rows={3}
              />
            </div>
          </div>
        );

      case "Database":
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Source Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter a name for this database"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">Connection String</Label>
              <Input
                id="url"
                value={formData.url || ""}
                onChange={(e) => handleInputChange("url", e.target.value)}
                placeholder="postgresql://user:password@host:port/database"
                className={errors.url ? "border-red-500" : ""}
              />
              {errors.url && <p className="text-sm text-red-500">{errors.url}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe this database connection"
                rows={3}
              />
            </div>
          </div>
        );

      case "GitHub":
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Source Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter a name for this GitHub source"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">Repository URL</Label>
              <Input
                id="url"
                value={formData.url || ""}
                onChange={(e) => handleInputChange("url", e.target.value)}
                placeholder="https://github.com/owner/repository"
                className={errors.url ? "border-red-500" : ""}
              />
              {errors.url && <p className="text-sm text-red-500">{errors.url}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Access Token (Optional)</Label>
              <Input
                id="password"
                type="password"
                value={formData.password || ""}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="GitHub personal access token"
              />
              <p className="text-xs text-gray-500">
                Required for private repositories or higher rate limits
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe this GitHub repository"
                rows={3}
              />
            </div>
          </div>
        );

      case "JIRA":
      case "Salesforce":
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Source Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder={`Enter a name for this ${type} source`}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">{type} URL</Label>
              <Input
                id="url"
                value={formData.url || ""}
                onChange={(e) => handleInputChange("url", e.target.value)}
                placeholder={
                  type === "JIRA" ? "https://your-domain.atlassian.net" :
                  "https://your-domain.salesforce.com"
                }
                className={errors.url ? "border-red-500" : ""}
              />
              {errors.url && <p className="text-sm text-red-500">{errors.url}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username/Email</Label>
                <Input
                  id="username"
                  value={formData.username || ""}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  placeholder="your-email@example.com"
                  className={errors.username ? "border-red-500" : ""}
                />
                {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">
                  {type === "Salesforce" ? "Security Token" : "API Token"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password || ""}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder={
                    type === "Salesforce" ? "Security token" : "API token"
                  }
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder={`Describe this ${type} connection`}
                rows={3}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="w-[50%] min-w-[50%] max-w-none transition-all duration-300 ease-in-out transform data-[state=open]:translate-x-0 data-[state=closed]:translate-x-full">
        <DrawerHeader className="border-b animate-in fade-in-0 duration-200 delay-100">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="text-xl font-semibold">Add New Data Source</DrawerTitle>
              <DrawerDescription>
                Configure a new data source for ingestion
              </DrawerDescription>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="sm" onClick={handleClose}>
                <X className="w-4 h-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6 animate-in fade-in-0 duration-300 delay-200">
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-6 mb-6 animate-in slide-in-from-top-2 duration-200 delay-150">
                  {(["File Upload", "API Endpoint", "Database", "JIRA", "Salesforce", "GitHub"] as IngestionSourceType[]).map((type) => {
                    const isEnabled = type === "GitHub" || type === "JIRA";
                    return (
                      <TabsTrigger 
                        key={type} 
                        value={type} 
                        disabled={!isEnabled}
                        className={`flex items-center gap-1 text-xs ${
                          !isEnabled ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {getTabIcon(type)}
                        <span className="hidden sm:inline">{type.replace(" ", "\n")}</span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                {(["File Upload", "API Endpoint", "Database", "JIRA", "Salesforce", "GitHub"] as IngestionSourceType[]).map((type) => (
                  <TabsContent key={type} value={type} className="mt-0 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                    {renderTabContent(type)}
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </ScrollArea>
        </div>

        <DrawerFooter className="border-t animate-in fade-in-0 slide-in-from-bottom-2 duration-200 delay-250">
          <div className="flex gap-3">
            <Button onClick={handleSave} className="flex-1">
              Add Source
            </Button>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
