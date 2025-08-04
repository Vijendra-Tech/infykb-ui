"use client";

import { useState, useEffect } from "react";
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
  X,
  CheckCircle,
  Github,
  Building2
} from "lucide-react";
import { useDataIngestionStore, type IngestionSourceType, type IngestionSource } from "@/store/use-data-ingestion-store";

interface EditSourceFormData {
  name: string;
  type: IngestionSourceType;
  url?: string;
  username?: string;
  password?: string;
  description?: string;
}

interface EditSourceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  source: IngestionSource | null;
}

export function EditSourceDrawer({ isOpen, onClose, source }: EditSourceDrawerProps) {
  const { editSource } = useDataIngestionStore();
  const [activeTab, setActiveTab] = useState<IngestionSourceType>("GitHub");
  const [formData, setFormData] = useState<EditSourceFormData>({
    name: "",
    type: "GitHub",
    description: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when source changes
  useEffect(() => {
    if (source) {
      setFormData({
        name: source.name,
        type: source.type,
        url: source.url || "",
        username: source.username || "",
        password: source.password || "",
        description: source.description || ""
      });
      setActiveTab(source.type);
    }
  }, [source]);

  const resetForm = () => {
    setFormData({
      name: "",
      type: "GitHub",
      description: ""
    });
    setErrors({});
  };

  const handleTabChange = (value: string) => {
    const sourceType = value as IngestionSourceType;
    setActiveTab(sourceType);
    setFormData(prev => ({ ...prev, type: sourceType }));
    setErrors({});
  };

  const handleInputChange = (field: keyof EditSourceFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Source name is required";
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
    if (validateForm() && source) {
      const updatedSource: IngestionSource = {
        ...source,
        name: formData.name,
        type: formData.type,
        url: formData.url,
        username: formData.username,
        password: formData.password,
        description: formData.description,
        updatedAt: new Date().toISOString()
      };
      
      editSource(source.id, updatedSource);
      resetForm();
      onClose();
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
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
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Add a description for this source"
                rows={3}
              />
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Upload className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  File Upload Source
                </span>
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                This is a file upload source. The original file data is preserved and cannot be modified through this interface.
              </p>
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
    <Drawer open={isOpen} onOpenChange={onClose} direction="right">
      <DrawerContent className="w-[50%] min-w-[50%] max-w-none transition-all duration-300 ease-in-out transform data-[state=open]:translate-x-0 data-[state=closed]:translate-x-full">
        <DrawerHeader className="border-b animate-in fade-in-0 duration-200 delay-100">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="text-xl font-semibold">Edit Data Source</DrawerTitle>
              <DrawerDescription>
                Modify the configuration for this data source
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
              Save Changes
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
