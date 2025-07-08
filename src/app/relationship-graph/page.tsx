"use client";

import { RelationshipGraph } from "@/components/relationship-graph";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useClientOnly } from "@/utils/use-client-only";
import { Info } from "lucide-react";

export default function RelationshipGraphPage() {
  // Use client-only to prevent hydration errors with ReactFlow
  const isClient = useClientOnly();

  if (!isClient) {
    return <div className="flex items-center justify-center h-[600px]">Loading...</div>;
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center mb-8 px-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Relationship Graph</h1>
          <p className="text-muted-foreground text-lg pl-1">
            Visualize and explore relationships between different work items
          </p>
        </div>
      </div>

      <Tabs defaultValue="graph" className="space-y-4">
        <TabsList>
          <TabsTrigger value="graph">Graph View</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="graph" className="space-y-4">
          <RelationshipGraph />
          
          <Card className="border-blue-100 shadow-md">
            <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-slate-50">
              <CardTitle className="text-blue-700 flex items-center gap-2">
                <Info className="h-5 w-5" />
                How to use the graph
              </CardTitle>
              <CardDescription className="text-blue-600/70 pl-7">
                Tips for navigating and interacting with the relationship graph
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors">
                  <div className="mt-0.5 bg-blue-100 p-2 rounded-full h-fit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-800">Navigation</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Use mouse wheel to zoom, drag empty space to pan, and drag nodes to reposition them.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors">
                  <div className="mt-0.5 bg-blue-100 p-2 rounded-full h-fit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-800">Creating Connections</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Drag from one node's handle to another to create a new connection between items.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <div className="mt-0.5">
                    <Info className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Filtering</h3>
                    <p className="text-sm text-muted-foreground">
                      Use the search box and type filter to find specific items in complex graphs.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <div className="mt-0.5">
                    <Info className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Fullscreen Mode</h3>
                    <p className="text-sm text-muted-foreground">
                      Click the expand button in the top right to enter fullscreen mode for better visibility.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Graph Settings</CardTitle>
              <CardDescription>
                Customize the appearance and behavior of the relationship graph
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="font-medium">Layout Options</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="justify-start">Horizontal</Button>
                    <Button variant="outline" className="justify-start">Vertical</Button>
                    <Button variant="outline" className="justify-start">Force</Button>
                    <Button variant="outline" className="justify-start">Radial</Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Display Options</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="justify-start">Show Labels</Button>
                    <Button variant="outline" className="justify-start">Show Details</Button>
                    <Button variant="outline" className="justify-start">Dark Mode</Button>
                    <Button variant="outline" className="justify-start">High Contrast</Button>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end">
                <Button>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
