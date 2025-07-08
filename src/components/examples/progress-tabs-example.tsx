"use client"

import React, { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

export function ProgressTabsExample() {
  const [activeTab, setActiveTab] = useState("step1")
  
  // Progress values for each step
  const progressValues = {
    step1: 25,
    step2: 50,
    step3: 75,
    step4: 100
  }
  
  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Progress Tracker</h2>
      
      {/* Overall progress bar */}
      <Progress 
        value={progressValues[activeTab as keyof typeof progressValues]} 
        className="mb-8"
      />
      
      <Tabs 
        defaultValue="step1" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="mt-4"
      >
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="step1">Step 1</TabsTrigger>
          <TabsTrigger value="step2">Step 2</TabsTrigger>
          <TabsTrigger value="step3">Step 3</TabsTrigger>
          <TabsTrigger value="step4">Step 4</TabsTrigger>
        </TabsList>
        
        <TabsContent value="step1" className="mt-6">
          <div className="rounded-lg border p-4">
            <h3 className="text-lg font-medium">Step 1: Getting Started</h3>
            <p className="text-muted-foreground mt-2">
              This is the first step of the process. Complete the initial setup.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="step2" className="mt-6">
          <div className="rounded-lg border p-4">
            <h3 className="text-lg font-medium">Step 2: Configuration</h3>
            <p className="text-muted-foreground mt-2">
              Configure your application settings and preferences.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="step3" className="mt-6">
          <div className="rounded-lg border p-4">
            <h3 className="text-lg font-medium">Step 3: Review</h3>
            <p className="text-muted-foreground mt-2">
              Review your settings and make any necessary adjustments.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="step4" className="mt-6">
          <div className="rounded-lg border p-4">
            <h3 className="text-lg font-medium">Step 4: Complete</h3>
            <p className="text-muted-foreground mt-2">
              Your setup is now complete. You're ready to go!
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
