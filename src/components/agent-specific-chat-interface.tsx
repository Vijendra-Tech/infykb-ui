'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Lightbulb, 
  Code, 
  Zap,
  Star,
  Crown,
  ExternalLink,
  Copy,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Settings,
  ChevronRight
} from 'lucide-react';
import { Agent } from '@/types/agent-types';
import { motion, AnimatePresence } from 'framer-motion';

interface AgentSpecificChatProps {
  agent: Agent;
  className?: string;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  type?: 'text' | 'example' | 'capability';
}

export function AgentSpecificChatInterface({ agent, className }: AgentSpecificChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize with agent-specific welcome message and capabilities
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      content: `Hello! I'm ${agent.name}. ${agent.description}\n\nI specialize in:\n${agent.capabilities.slice(0, 4).map(cap => `• ${cap}`).join('\n')}\n\nHow can I help you today?`,
      sender: 'agent',
      timestamp: new Date(),
      type: 'text'
    };
    setMessages([welcomeMessage]);
  }, [agent]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    // Simulate agent response based on agent's capabilities
    setTimeout(() => {
      const agentResponse = generateAgentResponse(inputValue, agent);
      const agentMessage: Message = {
        id: `agent_${Date.now()}`,
        content: agentResponse,
        sender: 'agent',
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, agentMessage]);
      setIsTyping(false);
      setIsLoading(false);
    }, 1500);
  };

  const generateAgentResponse = (userInput: string, agent: Agent): string => {
    const input = userInput.toLowerCase();
    
    // Agent-specific responses based on capabilities
    if (agent.id === 'github-assistant') {
      if (input.includes('pull request') || input.includes('pr')) {
        return "I can help you create, review, and manage pull requests! I'll analyze your code changes, suggest reviewers, generate automated changelogs, and ensure your PR follows best practices. Would you like me to create a PR template or review an existing one?";
      }
      if (input.includes('issue') || input.includes('bug')) {
        return "I'll help you with issue management! I can create detailed bug reports, triage issues by priority, assign labels automatically, and track issue resolution. I can also help set up issue templates and automation workflows.";
      }
      if (input.includes('repository') || input.includes('repo')) {
        return "I can assist with repository management including branch protection rules, repository settings, collaborator management, and repository analytics. I can also help with repository organization and best practices.";
      }
    } else if (agent.id === 'jira-assistant') {
      if (input.includes('sprint') || input.includes('planning')) {
        return "I'll help you with sprint planning! I can create sprint goals, estimate story points, assign tasks to team members, and track sprint progress. I can also generate sprint reports and velocity charts.";
      }
      if (input.includes('issue') || input.includes('ticket')) {
        return "I can help you create and manage JIRA issues! I'll set up proper issue types, assign priorities, link related issues, and track progress through your workflow. I can also automate issue transitions and notifications.";
      }
      if (input.includes('workflow') || input.includes('automation')) {
        return "I'll help you set up powerful JIRA workflows and automation! I can create custom workflows, set up automation rules, configure triggers and conditions, and optimize your team's processes.";
      }
    } else if (agent.id === 'salesforce-assistant') {
      if (input.includes('lead') || input.includes('prospect')) {
        return "I can help you manage leads effectively! I'll assist with lead scoring, qualification, assignment rules, and conversion tracking. I can also set up automated lead nurturing campaigns and follow-up sequences.";
      }
      if (input.includes('opportunity') || input.includes('deal')) {
        return "I'll help you track and manage opportunities! I can assist with opportunity stages, probability assessment, forecasting, and deal progression. I can also set up automated alerts and reminders for key milestones.";
      }
      if (input.includes('report') || input.includes('dashboard')) {
        return "I can create comprehensive reports and dashboards! I'll help you build sales performance reports, pipeline analysis, conversion metrics, and custom dashboards with real-time data visualization.";
      }
    } else if (agent.id === 'slack-assistant') {
      if (input.includes('channel') || input.includes('workspace')) {
        return "I can help you manage Slack channels and workspaces! I'll assist with channel organization, permissions, automated workflows, and workspace optimization for better team collaboration.";
      }
      if (input.includes('automation') || input.includes('workflow')) {
        return "I'll help you set up Slack automation! I can create custom workflows, set up bot responses, automate notifications, and integrate with other tools to streamline your team's communication.";
      }
    }

    // Generic response based on agent's primary capabilities
    const primaryCapabilities = agent.capabilities.slice(0, 3);
    return `I'm specialized in ${primaryCapabilities.join(', ')}. Based on your question, I can help you with ${agent.category} tasks. Let me provide you with a tailored solution that leverages my expertise in ${agent.name.toLowerCase()} workflows.`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleExampleClick = (example: string) => {
    setInputValue(example);
    inputRef.current?.focus();
  };

  const getAgentSpecificExamples = (agent: Agent): string[] => {
    const examples: Record<string, string[]> = {
      'github-assistant': [
        'Create a pull request for my feature branch',
        'Help me set up branch protection rules',
        'Review my code for security issues',
        'Set up GitHub Actions workflow'
      ],
      'jira-assistant': [
        'Plan our next sprint with story estimation',
        'Create an epic for the new feature',
        'Set up automation for bug triage',
        'Generate a sprint velocity report'
      ],
      'salesforce-assistant': [
        'Create a lead scoring model',
        'Set up opportunity stage automation',
        'Generate a sales pipeline report',
        'Configure territory management'
      ],
      'slack-assistant': [
        'Set up automated daily standups',
        'Create a workflow for incident response',
        'Organize channels by project teams',
        'Set up integration with JIRA'
      ],
      'notion-assistant': [
        'Create a project management template',
        'Set up automated task assignments',
        'Build a knowledge base structure',
        'Create team collaboration workflows'
      ]
    };

    return examples[agent.id] || [
      `Help me with ${agent.capabilities[0].toLowerCase()}`,
      `Set up ${agent.capabilities[1].toLowerCase()}`,
      `Create a workflow for ${agent.category}`,
      `Generate reports for ${agent.name.toLowerCase()}`
    ];
  };

  return (
    <div className={`flex flex-col h-full bg-gradient-to-br from-slate-50 via-white to-slate-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950/90 ${className || ''}`}>

      {/* Messages area */}
      <div className="flex-1 min-h-0 relative">
        <ScrollArea className="h-full">
          <div className="px-6 py-6 space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center min-h-[400px] space-y-6">
                <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center shadow-2xl`}>
                  <span className="text-3xl text-white">{agent.icon}</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">{agent.name}</h3>
                  <p className="text-slate-600 dark:text-slate-400 max-w-md">{agent.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                  {getAgentSpecificExamples(agent).map((example, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleExampleClick(example)}
                      className="text-left h-auto p-3 justify-start bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border-slate-200/60 dark:border-slate-700/60"
                    >
                      <div className="flex items-start gap-2">
                        <Sparkles className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{example}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.sender === 'agent' && (
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${agent.gradient} flex items-center justify-center shadow-md flex-shrink-0`}>
                        <span className="text-sm text-white">{agent.icon}</span>
                      </div>
                    )}
                    <div className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
                      message.sender === 'user' 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-tr-md' 
                        : 'bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-tl-md'
                    }`}>
                      <div className={`text-sm leading-relaxed whitespace-pre-wrap ${
                        message.sender === 'user' ? 'text-white' : 'text-slate-900 dark:text-slate-100'
                      }`}>
                        {message.content}
                      </div>
                      <div className={`text-xs mt-2 ${
                        message.sender === 'user' ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                    {message.sender === 'user' && (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-md flex-shrink-0">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-4 justify-start">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${agent.gradient} flex items-center justify-center shadow-md flex-shrink-0`}>
                      <span className="text-sm text-white">{agent.icon}</span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 border-t border-slate-200/40 dark:border-slate-800/40 bg-white/98 dark:bg-slate-950/98 backdrop-blur-2xl">
        <div className="p-6">
          <div className="relative group">
            <Textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Ask ${agent.name} about ${agent.capabilities[0].toLowerCase()}, ${agent.capabilities[1].toLowerCase()}, or anything else...`}
              className="min-h-[60px] max-h-[120px] resize-none pr-16 bg-white/90 dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-700/60 focus:ring-2 focus:ring-slate-900/20 dark:focus:ring-slate-100/20 focus:border-slate-400 dark:focus:border-slate-500 rounded-2xl shadow-lg text-base placeholder:text-slate-500 dark:placeholder:text-slate-400 transition-all duration-300 hover:shadow-xl focus:shadow-xl backdrop-blur-sm"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className={`absolute right-3 bottom-3 h-10 w-10 p-0 bg-gradient-to-br ${agent.gradient} hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105`}
            >
              <Send className="h-4 w-4 text-white" />
            </Button>
          </div>
          <div className="flex justify-between items-center mt-3 px-1">
            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span>Press Enter to send, Shift+Enter for new line</span>
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                <span>Powered by {agent.name}</span>
              </div>
            </div>
            <div className={`text-xs font-medium ${
              inputValue.length > 800 ? 'text-red-500' : 
              inputValue.length > 600 ? 'text-yellow-500' : 
              'text-slate-500 dark:text-slate-400'
            }`}>
              {inputValue.length}/1000
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
