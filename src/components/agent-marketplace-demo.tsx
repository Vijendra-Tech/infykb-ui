'use client';

import React, { useState } from 'react';
import { AgentMarketplace } from '@/components/agent-marketplace';
import { AgentChatInterface } from '@/components/agent-chat-interface';
import { Agent } from '@/types/agent-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Bot, MessageCircle, Star, Users, Zap, Crown, Github, Trello, Slack } from 'lucide-react';

export function AgentMarketplaceDemo() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showChat, setShowChat] = useState(false);

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowChat(true);
  };

  const handleBackToMarketplace = () => {
    setShowChat(false);
    setSelectedAgent(null);
  };

  if (showChat && selectedAgent) {
    return (
      <div className="h-screen">
        <AgentChatInterface 
          agentId={selectedAgent.id}
          onBack={handleBackToMarketplace}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Demo Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-blue-50 rounded-full border border-green-200">
            <Zap className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-700">Live Demo</span>
          </div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Agent Marketplace Demo
          </h1>
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Experience the power of specialized AI agents! Browse through our marketplace, select an agent that matches your needs, 
            and start chatting immediately. Each agent is expertly trained for specific tasks and integrations.
          </p>
        </div>

        {/* Feature Highlights */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="agents">Sample Agents</TabsTrigger>
            <TabsTrigger value="demo">Try Demo</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 text-white">
                      <Bot className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">10+ Specialized Agents</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Choose from GitHub, JIRA, Salesforce, Slack, and more specialized AI agents, each expertly trained for specific workflows.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 text-white">
                      <MessageCircle className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">Instant Chat Interface</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Start chatting immediately with any agent. Professional chat interface with message history and real-time responses.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-green-600 to-green-800 text-white">
                      <Star className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">Smart Filtering</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Advanced search, category filtering, rating-based sorting, and tag-based discovery to find the perfect agent.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-600" />
                    Marketplace Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span>Category-based agent organization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span>Real-time search and filtering</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span>Rating and popularity metrics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span>Premium and free agent tiers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span>Grid and list view modes</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-purple-600" />
                    Chat Interface Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <span>Real-time message streaming</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <span>Message copy and rating system</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <span>Typing indicators and status</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <span>Session management and history</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <span>Agent-specific contextual responses</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="agents" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl p-3 rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 text-white">
                      🐙
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        GitHub Assistant
                        <Badge variant="secondary">Free</Badge>
                      </CardTitle>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">4.8</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-3">
                    Expert GitHub agent for repository management, code reviews, and automation.
                  </CardDescription>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">git</Badge>
                    <Badge variant="outline" className="text-xs">code-review</Badge>
                    <Badge variant="outline" className="text-xs">ci-cd</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl p-3 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 text-white">
                      📋
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        JIRA Assistant
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                          <Crown className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      </CardTitle>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">4.6</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-3">
                    Comprehensive JIRA agent for project management and sprint planning.
                  </CardDescription>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">agile</Badge>
                    <Badge variant="outline" className="text-xs">scrum</Badge>
                    <Badge variant="outline" className="text-xs">tracking</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                      ☁️
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Salesforce Assistant
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                          <Crown className="h-3 w-3 mr-1" />
                          Enterprise
                        </Badge>
                      </CardTitle>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">4.7</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-3">
                    Powerful Salesforce CRM agent for lead management and sales automation.
                  </CardDescription>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">crm</Badge>
                    <Badge variant="outline" className="text-xs">sales</Badge>
                    <Badge variant="outline" className="text-xs">automation</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="demo" className="space-y-6">
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
              <CardHeader>
                <CardTitle className="text-center text-2xl">Ready to Try the Agent Marketplace?</CardTitle>
                <CardDescription className="text-center text-lg">
                  Click the button below to explore the full marketplace and start chatting with AI agents!
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
                  onClick={() => window.location.href = '/agents'}
                >
                  <Bot className="h-5 w-5 mr-2" />
                  Open Agent Marketplace
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Demo Section */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-slate-50 to-blue-50/30">
          <CardHeader>
            <CardTitle className="text-center">Interactive Demo</CardTitle>
            <CardDescription className="text-center">
              Experience the Agent Marketplace directly below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AgentMarketplace onAgentSelect={handleAgentSelect} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
