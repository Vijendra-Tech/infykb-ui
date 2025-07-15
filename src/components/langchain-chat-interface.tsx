"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLLMSettingsStore } from "@/store/use-llm-settings-store";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Send, 
  ChevronDown, 
  MessageSquare, 
  Cpu,
  Check,
  Search,
  FileText,
  Database,
  Terminal,
  AlertCircle,
  CheckCircle,
  Clock,
  HelpCircle,
  Layers,
  PanelRightOpen,
  PanelRightClose,
  SquarePen,
  XIcon,
  Plus,
  CircleX,
  ArrowDown,
  LoaderCircle,
  Settings,
  PenLine,
  Paperclip
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSafeDate } from "@/utils/safe-hydration";
import "@/styles/scrollbar.css";
// Mock Label and Switch components since we don't have the actual dependencies
const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ children, ...props }) => (
  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" {...props}>
    {children}
  </label>
);

const Switch: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => (
  <div className="inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input">
    <input 
      type="checkbox" 
      className="sr-only"
      {...props} 
    />
    <span className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${props.checked ? 'translate-x-5' : 'translate-x-0'}`} />
  </div>
);
import { Input } from "@/components/ui/input";
import { useClientOnly } from "@/utils/use-client-only";
import ClientOnly from "./client-only";

// Mock implementations for LangGraph SDK
// These would be replaced with actual imports when the dependencies are installed

// Mock LangGraph Message type
type LangGraphMessage = {
  id?: string;
  type: 'human' | 'ai' | 'system' | 'tool';
  content: string | Record<string, any>;
};

// Mock UI Message types
type UIMessage = {
  id: string;
  type: string;
  content: any;
};

type RemoveUIMessage = {
  id: string;
  remove: boolean;
};

// Mock functions for UI message handling
const isUIMessage = (event: any): event is UIMessage => {
  return event && typeof event === 'object' && 'type' in event && !('remove' in event);
};

const isRemoveUIMessage = (event: any): event is RemoveUIMessage => {
  return event && typeof event === 'object' && 'remove' in event;
};

const uiMessageReducer = (ui: UIMessage[], event: UIMessage | RemoveUIMessage): UIMessage[] => {
  if (isRemoveUIMessage(event)) {
    return ui.filter(m => m.id !== event.id);
  } else {
    const exists = ui.findIndex(m => m.id === event.id);
    if (exists >= 0) {
      return ui.map(m => m.id === event.id ? event : m);
    } else {
      return [...ui, event];
    }
  }
};

// Mock useQueryState hook
function useQueryState(key: string, options?: { defaultValue?: string }) {
  const [value, setValue] = useState<string | null>(options?.defaultValue || null);
  return [value, setValue] as const;
}

// Mock useStream hook
function useStream<T, O>(
  options: {
    apiUrl?: string;
    apiKey?: string;
    assistantId?: string;
    threadId: string | null;
    onCustomEvent?: (event: any, options: any) => void;
    onThreadId?: (id: string) => void;
  }
) {
  const [state, setState] = useState<{ messages: LangGraphMessage[]; ui?: UIMessage[] }>({ 
    messages: [],
    ui: []
  });
  
  const submit = async ({ messages, context }: { messages: string | LangGraphMessage | LangGraphMessage[], context?: Record<string, unknown> }) => {
    // In a real implementation, this would send the message to the LangGraph server
    // Here we just simulate adding a user message and then an AI response
    
    const addMessage = (prev: LangGraphMessage[], message: LangGraphMessage): LangGraphMessage[] => {
      if (message.type === "human" || message.type === "ai" || message.type === "system" || message.type === "tool") {
        return [...prev, message];
      }
      return prev;
    };
    
    const userMessage = typeof messages === 'string' 
      ? { type: 'human', content: messages } as LangGraphMessage
      : Array.isArray(messages) 
        ? messages[0] 
        : messages;
    
    setState(prev => ({
      ...prev,
      messages: addMessage(prev.messages, userMessage)
    }));
    
    // Simulate AI response after a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const aiMessage: LangGraphMessage = {
      type: 'ai',
      content: `This is a simulated response to: "${typeof userMessage.content === 'string' ? userMessage.content : JSON.stringify(userMessage.content)}"`
    };
    
    setState(prev => ({
      ...prev,
      messages: addMessage(prev.messages, aiMessage)
    }));
    
    // Generate a thread ID if none exists
    if (!options.threadId && options.onThreadId) {
      const newThreadId = `thread_${Math.random().toString(36).substring(2, 9)}`;
      options.onThreadId(newThreadId);
    }
    
    return Promise.resolve();
  };
  
  return { state, submit };
}

// Mock StickToBottom component
interface StickToBottomProps {
  children: React.ReactNode;
  apiKeyError?: string | null;
}

const StickToBottom: React.FC<StickToBottomProps> = ({ children, apiKeyError }) => {
  // Display API key error message if no API key is provided
  if (apiKeyError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gradient-to-b from-transparent to-muted/20">
        <div className="mb-6 bg-red-500/10 p-4 rounded-full">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">API Key Required</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          {apiKeyError}
        </p>
        <Link href="/settings">
          <Button className="bg-primary hover:bg-primary/90">
            <Settings className="h-4 w-4 mr-2" />
            Go to Settings
          </Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">{children}</div>
  );
};

// Define types
type StateType = { messages: LangGraphMessage[]; ui?: UIMessage[] };

type Message = {
  id?: string;
  type: 'user' | 'system' | 'assistant' | 'tool';
  content: string;
  timestamp: Date;
  category?: 'question' | 'error' | 'solution' | 'diagnostic';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'pending' | 'resolved' | 'escalated';
  actions?: AgentAction[];
};

type AgentAction = {
  id: string;
  type: 'search' | 'database' | 'api' | 'code' | 'file';
  status: 'pending' | 'completed' | 'failed';
  description: string;
  result?: string;
  timestamp: Date;
};

// Create a typed version of the useStream hook
const useTypedStream = useStream<
  StateType,
  {
    UpdateType: {
      messages?: LangGraphMessage[] | LangGraphMessage | string;
      ui?: (UIMessage | RemoveUIMessage)[] | UIMessage | RemoveUIMessage;
      context?: Record<string, unknown>;
    };
    CustomEventType: UIMessage | RemoveUIMessage;
  }
>;

// Create context for stream
type StreamContextType = ReturnType<typeof useTypedStream>;
const StreamContext = React.createContext<StreamContextType | undefined>(undefined);

// Helper functions
async function sleep(ms = 4000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkGraphStatus(
  apiUrl: string,
  apiKey: string | null,
): Promise<boolean> {
  try {
    const res = await fetch(`${apiUrl}/info`, {
      ...(apiKey && {
        headers: {
          "X-Api-Key": apiKey,
        },
      }),
    });

    return res.ok;
  } catch (e) {
    console.error(e);
    return false;
  }
}

// Provider Components
const StreamSession = ({
  children,
  apiKey,
  apiUrl,
  assistantId,
}: {
  children: React.ReactNode;
  apiKey: string | null;
  apiUrl: string;
  assistantId: string;
}) => {
  const [threadId, setThreadId] = useQueryState("threadId");
  const [threads, setThreads] = useState<{ id: string; title: string }[]>([]);
  
  const getThreads = async (): Promise<{ id: string; title: string }[]> => {
    try {
      const res = await fetch(`${apiUrl}/threads?assistant_id=${assistantId}`, {
        ...(apiKey && {
          headers: {
            "X-Api-Key": apiKey,
          },
        }),
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.threads || [];
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  const streamValue = useTypedStream({
    apiUrl,
    apiKey: apiKey ?? undefined,
    assistantId,
    threadId: threadId ?? null,
    onCustomEvent: (event: any, options: any) => {
      if (isUIMessage(event) || isRemoveUIMessage(event)) {
        options.mutate((prev: { ui?: UIMessage[] }) => {
          const ui = uiMessageReducer(prev.ui ?? [], event);
          return { ...prev, ui };
        });
      }
    },
    onThreadId: (id) => {
      setThreadId(id);
      // Refetch threads list when thread ID changes
      sleep().then(() => getThreads().then(setThreads).catch(console.error));
    },
  });

  useEffect(() => {
    checkGraphStatus(apiUrl, apiKey).then((ok) => {
      if (!ok) {
        console.error("Failed to connect to LangGraph server");
        // You could add a toast notification here
      }
    });
    
    // Initial fetch of threads
    getThreads().then(setThreads).catch(console.error);
  }, [apiKey, apiUrl, assistantId]);

  return (
    <StreamContext.Provider value={streamValue}>
      {children}
    </StreamContext.Provider>
  );
};

// Default values for the form
const DEFAULT_API_URL = "http://localhost:2024";
const DEFAULT_ASSISTANT_ID = "agent";

export const StreamProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Get environment variables
  const envApiUrl: string | undefined = process.env.NEXT_PUBLIC_API_URL;
  const envAssistantId: string | undefined = process.env.NEXT_PUBLIC_ASSISTANT_ID;

  // Use URL params with env var fallbacks
  const [apiUrl, setApiUrl] = useQueryState("apiUrl", {
    defaultValue: envApiUrl || "",
  });
  const [assistantId, setAssistantId] = useQueryState("assistantId", {
    defaultValue: envAssistantId || "",
  });

  // For API key, use localStorage
  const [apiKey, setApiKey] = useState<string | null>(null);
  
  useEffect(() => {
    const storedKey = localStorage.getItem("lg:chat:apiKey");
    if (storedKey) setApiKey(storedKey);
  }, []);

  // Determine final values to use, prioritizing URL params then env vars
  const finalApiUrl = apiUrl || envApiUrl;
  const finalAssistantId = assistantId || envAssistantId;
  
  // Handle form submission
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const formApiUrl = formData.get("apiUrl") as string;
    const formAssistantId = formData.get("assistantId") as string;
    const formApiKey = formData.get("apiKey") as string;
    
    setApiUrl(formApiUrl);
    localStorage.setItem("lg:chat:apiKey", formApiKey);
    setApiKey(formApiKey);
    setAssistantId(formAssistantId);
  };
  
  return (
    <div className="p-4">
      <form onSubmit={handleFormSubmit} className="bg-muted/50 flex flex-col gap-6 p-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="apiUrl">
                Deployment URL<span className="text-rose-500">*</span>
              </Label>
              <p className="text-muted-foreground text-sm">
                This is the URL of your LangGraph deployment. Can be a local, or
                production deployment.
              </p>
              <Input
                id="apiUrl"
                name="apiUrl"
                className="bg-background"
                defaultValue={apiUrl || DEFAULT_API_URL}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="assistantId">
                Assistant / Graph ID<span className="text-rose-500">*</span>
              </Label>
              <p className="text-muted-foreground text-sm">
                This is the ID of the graph (can be the graph name), or
                assistant to fetch threads from, and invoke when actions are
                taken.
              </p>
              <Input
                id="assistantId"
                name="assistantId"
                className="bg-background"
                defaultValue={assistantId || DEFAULT_ASSISTANT_ID}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="apiKey">LangSmith API Key</Label>
              <p className="text-muted-foreground text-sm">
                This is <strong>NOT</strong> required if using a local LangGraph
                server. This value is stored in your browser's local storage and
                is only used to authenticate requests sent to your LangGraph
                server.
              </p>
              <Input
                id="apiKey"
                name="apiKey"
                type="password"
                defaultValue={apiKey ?? ""}
                className="bg-background"
                placeholder="lsv2_pt_..."
              />
            </div>

            <div className="mt-2 flex justify-end">
              <Button
                type="submit"
                size="lg"
              >
                Continue
              </Button>
            </div>
      </form>
    </div>
  );

  return (
    <StreamSession
      apiKey={apiKey}
      apiUrl={finalApiUrl || DEFAULT_API_URL}
      assistantId={finalAssistantId || DEFAULT_ASSISTANT_ID}
    >
      {children}
    </StreamSession>
  );
};

// ThreadProvider for managing thread history
type ThreadContextType = {
  threads: { id: string; title: string }[];
  setThreads: React.Dispatch<React.SetStateAction<{ id: string; title: string }[]>>;
  activeThreadId: string | null;
  setActiveThreadId: (id: string | null) => void;
};

const ThreadContext = React.createContext<ThreadContextType | undefined>(undefined);

// Create a custom hook to use the context
export const useThreadContext = (): ThreadContextType => {
  const context = React.useContext(ThreadContext);
  if (context === undefined) {
    throw new Error("useThreadContext must be used within a ThreadProvider");
  }
  return context;
};

export const ThreadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [threads, setThreads] = useState<{ id: string; title: string }[]>([]);
  const [threadId, setThreadId] = useQueryState("threadId");

  return (
    <ThreadContext.Provider value={{
      threads,
      setThreads,
      activeThreadId: threadId,
      setActiveThreadId: setThreadId,
    }}>
      {children}
    </ThreadContext.Provider>
  );
};

// Artifact Provider for side panel content
type ArtifactContextType = {
  artifactOpen: boolean;
  setArtifactOpen: React.Dispatch<React.SetStateAction<boolean>>;
  artifactContent: Record<string, any>;
  setArtifactContent: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  artifactTitle: string;
  setArtifactTitle: React.Dispatch<React.SetStateAction<string>>;
};

const ArtifactContext = React.createContext<ArtifactContextType | undefined>(undefined);

export const ArtifactProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [artifactOpen, setArtifactOpen] = useState(false);
  const [artifactContent, setArtifactContent] = useState<Record<string, any>>({});
  const [artifactTitle, setArtifactTitle] = useState("");

  return (
    <ArtifactContext.Provider value={{
      artifactOpen,
      setArtifactOpen,
      artifactContent,
      setArtifactContent,
      artifactTitle,
      setArtifactTitle,
    }}>
      {children}
    </ArtifactContext.Provider>
  );
};

export const useArtifactContext = (): ArtifactContextType => {
  const context = React.useContext(ArtifactContext);
  if (context === undefined) {
    throw new Error("useArtifactContext must be used within an ArtifactProvider");
  }
  return context;
};

// Main component
export const LangchainChatInterface: React.FC<{ hideInput?: boolean }> = ({ hideInput = false }) => {
  const isClient = useClientOnly();
  
  // Get API key and provider from LLM settings store
  const { apiKey, selectedProvider, selectedModelId, getCurrentModel } = useLLMSettingsStore();
  
  // State for API key validation error
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  
  // Check if API key is provided on component mount
  useEffect(() => {
    if (!apiKey || apiKey.trim() === '') {
      setApiKeyError(`No API key found. Please add your ${selectedProvider.toUpperCase()} API key in settings.`);
    } else {
      setApiKeyError(null);
    }
  }, [apiKey, selectedProvider]);
  
  // Mock the stream context since we're using simplified providers
  const [mockMessages, setMockMessages] = useState<Array<{id: string; type: 'human' | 'ai' | 'system' | 'tool'; content: string}>>([    
   
  ]);
  
  const stream = React.useContext(StreamContext) || {
    state: { 
      messages: mockMessages, 
      ui: [] 
    },
    sendMessage: () => {},
    regenerate: () => {},
    stop: () => {},
    isLoading: false,
    submit: ({ messages, context }: { messages: string | any | any[]; context?: Record<string, any> }) => Promise.resolve({})
  };
  // Mock thread context
  const activeThreadId = "mock-thread-id";
  // Mock artifact context
  const artifactOpen = false;
  const setArtifactOpen = (value: boolean) => {};
  
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gpt-4");
  const [agentMode, setAgentMode] = useState(true);
  const [promptSuggestions, setPromptSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // We're using mockMessages directly instead of converting messages
  // The message format is already compatible with our UI needs
  
  // Use effect to scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mockMessages]);
  
  // Listen for messages from the main chat interface
  useEffect(() => {
    const handleLangchainMessage = (event: CustomEvent) => {
      const { message } = event.detail;
      if (message && typeof message === 'string') {
        // Simulate sending the message through our handleSendMessage function
        setInputValue(message);
        handleSendMessage();
      }
    };
    
    // Add event listener
    document.addEventListener('langchain-message', handleLangchainMessage as EventListener);
    
    // Clean up
    return () => {
      document.removeEventListener('langchain-message', handleLangchainMessage as EventListener);
    };
  }, []);
  
  // Handle sending a message
  const handleSendMessage = () => {
    // Check if API key is provided
    if (!apiKey || apiKey.trim() === '') {
      setApiKeyError('No API key found. Please add your API key in settings.');
      return;
    }
    
    if (inputValue.trim() === "" || isLoading) return;
    
    setIsLoading(true);
    
    // Mock sending a message
    const newMessage = { id: Date.now().toString(), type: 'human' as const, content: inputValue };
    setMockMessages(prev => [...prev, newMessage]);
    
    setInputValue("");
    
    // Simulate AI response after a short delay
    setTimeout(() => {
      const aiResponse = { 
        id: (Date.now() + 1).toString(), 
        type: 'ai' as const, 
        content: `This is a mock response to: "${inputValue}". In a real implementation, this would come from the LangGraph server.` 
      };
      setMockMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000);
  };
  
  // Reference to the suggestions container for click-outside handling
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  // Handle click outside to dismiss suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Default suggestions that are always available
  const defaultSuggestions = [
    "How do I troubleshoot application errors?",
    "What are best practices for database optimization?",
    "How can I improve API security?"
  ];
  
  // Generate prompt suggestions based on user input
  const generatePromptSuggestions = (input: string) => {
    // Always show default suggestions if input is empty
    if (input.length === 0) {
      setPromptSuggestions(defaultSuggestions);
      setShowSuggestions(true);
      return;
    }
    
    // For very short inputs, still show suggestions but don't try to match
    if (input.length < 2) {
      setPromptSuggestions(defaultSuggestions);
      setShowSuggestions(true);
      return;
    }
    
    const lowercaseInput = input.toLowerCase();
    let suggestions: string[] = [];
    
    // Technical support related suggestions
    if (lowercaseInput.includes('error') || lowercaseInput.includes('issue') || 
        lowercaseInput.includes('problem') || lowercaseInput.includes('fix') || 
        lowercaseInput.includes('bug')) {
      suggestions = [
        'What are the steps to troubleshoot this error?',
        'Can you help diagnose this issue?',
        'How do I fix this problem in my application?'
      ];
    }
    // Database related suggestions
    else if (lowercaseInput.includes('database') || lowercaseInput.includes('query') || 
             lowercaseInput.includes('sql') || lowercaseInput.includes('db')) {
      suggestions = [
        'How do I optimize this database query?',
        'What\'s the best way to structure this database?',
        'Can you explain this SQL query?'
      ];
    }
    // API related suggestions
    else if (lowercaseInput.includes('api') || lowercaseInput.includes('endpoint') || 
             lowercaseInput.includes('request') || lowercaseInput.includes('response')) {
      suggestions = [
        'How do I authenticate with this API?',
        'What\'s the correct format for this API request?',
        'How do I handle errors from this API?'
      ];
    }
    // Knowledge base related suggestions
    else if (lowercaseInput.includes('kb') || lowercaseInput.includes('knowledge') || 
             lowercaseInput.includes('doc') || lowercaseInput.includes('article')) {
      suggestions = [
        'Where can I find documentation about this feature?',
        'Is there a knowledge base article about this topic?',
        'How do I contribute to the knowledge base?'
      ];
    }
    // Infrastructure related suggestions
    else if (lowercaseInput.includes('server') || lowercaseInput.includes('cloud') || 
             lowercaseInput.includes('deploy') || lowercaseInput.includes('infra')) {
      suggestions = [
        'How do I deploy this application to production?',
        'What\'s the best cloud service for this use case?',
        'How do I monitor server performance?'
      ];
    }
    // Security related suggestions
    else if (lowercaseInput.includes('security') || lowercaseInput.includes('auth') || 
             lowercaseInput.includes('password') || lowercaseInput.includes('hack')) {
      suggestions = [
        'What are the best practices for securing this application?',
        'How do I implement proper authentication?',
        'How can I prevent security vulnerabilities?'
      ];
    }
    // If no specific category matches, use default suggestions
    else {
      suggestions = defaultSuggestions;
    }
    
    // Always show suggestions
    setPromptSuggestions(suggestions);
    setShowSuggestions(true);
  };
  
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Generate suggestions based on input
    generatePromptSuggestions(newValue);
    
    // Auto-resize the textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };
  
  // Handle selecting a suggestion
  const handleSelectSuggestion = (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    // Focus the textarea after selecting a suggestion
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };
  
  // Show suggestions when input field is focused
  const handleInputFocus = () => {
    // If there's no input, show default suggestions
    if (inputValue.length === 0) {
      setPromptSuggestions(defaultSuggestions);
      setShowSuggestions(true);
    } else {
      // Otherwise, generate suggestions based on current input
      generatePromptSuggestions(inputValue);
    }
  };
  
  // Handle key press in textarea
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);
  
  // We already have a useEffect for scrolling to bottom when mockMessages change
  
  // Models dropdown options
  const models = [
    { value: "gpt-3.5-turbo", label: "GPT-3.5" },
    { value: "gpt-4", label: "GPT-4" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
    { value: "claude-3-opus", label: "Claude 3 Opus" },
    { value: "claude-3-sonnet", label: "Claude 3 Sonnet" },
    { value: "gemini-pro", label: "Gemini Pro" },
    { value: "gemini-ultra", label: "Gemini Ultra" },
  ];
  
  // Message category icons
  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case "question":
        return <HelpCircle className="h-4 w-4 text-blue-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "solution":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "diagnostic":
        return <Search className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };
  
  // Message severity badges
  const getSeverityBadge = (severity?: string) => {
    if (!severity) return null;
    
    const colors = {
      low: "bg-blue-100 text-blue-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800",
    };
    
    const color = colors[severity as keyof typeof colors] || "bg-gray-100 text-gray-800";
    
    return (
      <span className={`text-xs font-medium mr-2 px-2 py-0.5 rounded ${color}`}>
        {severity}
      </span>
    );
  };
  
  // Message status indicators
  const getStatusIndicator = (status?: string) => {
    if (!status) return null;
    
    const indicators = {
      pending: <Clock className="h-4 w-4 text-yellow-500" />,
      resolved: <Check className="h-4 w-4 text-green-500" />,
      escalated: <Layers className="h-4 w-4 text-red-500" />,
    };
    
    return indicators[status as keyof typeof indicators] || null;
  };
  
  // Render agent actions
  const renderAgentActions = (actions?: AgentAction[]) => {
    if (!actions || actions.length === 0) return null;
    
    return (
      <div className="mt-2 space-y-2">
        {actions.map((action) => (
          <div key={action.id} className="bg-muted/50 rounded p-2 text-sm">
            <div className="flex items-center gap-2 mb-1">
              {action.type === "search" && <Search className="h-4 w-4" />}
              {action.type === "database" && <Database className="h-4 w-4" />}
              {action.type === "api" && <Terminal className="h-4 w-4" />}
              {action.type === "code" && <FileText className="h-4 w-4" />}
              {action.type === "file" && <FileText className="h-4 w-4" />}
              <span className="font-medium">{action.type}</span>
              <span
                className={`ml-auto text-xs ${
                  action.status === "completed"
                    ? "text-green-500"
                    : action.status === "failed"
                    ? "text-red-500"
                    : "text-yellow-500"
                }`}
              >
                {action.status}
              </span>
            </div>
            <p className="text-muted-foreground">{action.description}</p>
            {action.result && (
              <div className="mt-1 bg-background p-1 rounded border text-xs overflow-x-auto">
                {action.result}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  // Render message content with proper formatting
  const renderMessageContent = (content: string) => {
    // Enhanced markdown-like formatting with code highlighting
    return content
      .split("\n")
      .map((line, i) => {
        // Simple code block detection
        if (line.startsWith('```') || line.startsWith('`')) {
          return <div key={i} className="font-mono text-xs bg-muted/50 p-1 rounded">{line.replace(/^```|`/g, '')}</div>;
        }
        return <div key={i}>{line || <br />}</div>;
      });
  };
  
  // Display API key error message if no API key is provided
  if (apiKeyError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gradient-to-b from-transparent to-muted/20">
        <div className="mb-6 bg-red-500/10 p-4 rounded-full">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">API Key Required</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          {apiKeyError}
        </p>
        <Link href="/settings">
          <Button className="bg-primary hover:bg-primary/90">
            <Settings className="h-4 w-4 mr-2" />
            Go to Settings
          </Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      {/* Main content area with messages */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
        ref={containerRef}
      >
        {mockMessages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center max-w-md mx-auto p-6 rounded-2xl bg-gradient-to-b from-background to-muted/20 border border-muted/30 shadow-sm">
              {/* Infinity KB Logo */}
              <h3 className="text-xl font-medium bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">Infinity KB</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Welcome to the chat. How can I help you today?
              </p>
              <div className="mt-4 p-2 bg-muted/30 rounded-lg border border-muted/50 text-xs">
                <p className="text-muted-foreground">Ask me about your application or technical questions.</p>
              </div>
            </div>
          </div>
        ) : (
          mockMessages.map((message, index) => (
            <div
              key={message.id || index}
              className={`flex w-full items-end ${message.type === "human" ? "justify-end" : "justify-start"} ${index > 0 && mockMessages[index-1].type === message.type ? "mt-1" : "mt-4"}`}
            >
              {message.type !== "human" && (
                <div className="flex-shrink-0 mr-2 mb-1">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Cpu className="h-4 w-4 text-primary" />
                  </div>
                </div>
              )}
              <div
                className={`relative rounded-2xl px-4 py-3 max-w-[80%] shadow-sm ${
                  message.type === "human"
                    ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground"
                    : message.type === "system"
                    ? "bg-muted text-muted-foreground border border-muted/50"
                    : "bg-background border border-muted/30"
                } ${
                  message.type === "human" ? "rounded-tr-sm" : "rounded-tl-sm"
                }`}
              >
                {renderMessageContent(message.content)}
                <div className="text-xs mt-1 opacity-70 text-right">
                  {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
              {message.type === "human" && (
                <div className="flex-shrink-0 ml-2 mb-1">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <div className="font-medium text-xs text-primary">You</div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced elegant input area with L2/L3 support options */}
      {!hideInput && (
        <div className="p-4 border-t border-border bg-gradient-to-b from-background/80 to-muted/30 backdrop-blur-sm sticky bottom-0 shadow-sm">
          <div className="max-w-3xl mx-auto">
            {/* Support tools toolbar with horizontal scrolling */}
            <div className="mb-2 flex items-center justify-between">
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent -mx-1 px-1 py-0.5 snap-x">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 px-2 text-xs bg-background/80 border-muted/50 hover:bg-muted/20 flex items-center gap-1 flex-shrink-0 snap-start"
                  >
                    <Terminal className="h-3 w-3 text-blue-500" />
                    <span>Run Diagnostics</span>
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 px-2 text-xs bg-background/80 border-muted/50 hover:bg-muted/20 flex items-center gap-1 flex-shrink-0 snap-start"
                  >
                    <Database className="h-3 w-3 text-amber-500" />
                    <span>Query DB</span>
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 px-2 text-xs bg-background/80 border-muted/50 hover:bg-muted/20 flex items-center gap-1 flex-shrink-0 snap-start"
                  >
                    <FileText className="h-3 w-3 text-green-500" />
                    <span>View Logs</span>
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 px-2 text-xs bg-background/80 border-muted/50 hover:bg-muted/20 flex items-center gap-1 flex-shrink-0 snap-start"
                  >
                    <AlertCircle className="h-3 w-3 text-red-500" />
                    <span>Escalate</span>
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 px-2 text-xs bg-background/80 border-muted/50 hover:bg-muted/20 flex items-center gap-1 flex-shrink-0 snap-start"
                  >
                    <HelpCircle className="h-3 w-3 text-purple-500" />
                    <span>Knowledge Base</span>
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <select 
                  className="h-7 text-xs bg-background border border-muted/50 rounded-md px-2 focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                  <option value="critical">Critical</option>
                </select>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-7 w-7 p-0"
                  title="Attach file"
                >
                  <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </div>
            </div>
            
            {/* Prompt suggestions chips above input area */}
            {showSuggestions && promptSuggestions.length > 0 && (
              <div 
                ref={suggestionsRef}
                className="mb-2 p-2 bg-background/80 border border-primary/20 rounded-lg"
              >
                {apiKeyError ? (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gradient-to-b from-transparent to-muted/20">
                    <div className="mb-6 bg-red-500/10 p-4 rounded-full">
                      <AlertCircle className="h-12 w-12 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">API Key Required</h2>
                    <p className="text-muted-foreground mb-8 max-w-md">
                      {apiKeyError}
                    </p>
                    <Link href="/settings">
                      <Button className="bg-primary hover:bg-primary/90">
                        <Settings className="h-4 w-4 mr-2" />
                        Go to Settings
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {promptSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="px-3 py-1.5 text-xs bg-muted/50 hover:bg-primary/10 text-foreground rounded-full border border-muted/50 transition-colors flex items-center"
                        onClick={() => handleSelectSuggestion(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Input area */}
            <div className="relative">
              <div className="relative flex items-end bg-background rounded-xl shadow-sm border border-muted/50 transition-all hover:border-primary/30 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyPress}
                  onFocus={handleInputFocus}
                  onClick={handleInputFocus}
                  placeholder="Type your message..."
                  className="w-full bg-transparent px-4 pt-3 pb-2 pr-16 text-sm focus:outline-none min-h-[60px] max-h-[200px] resize-none custom-scrollbar"
                  rows={1}
                  disabled={isLoading}
                />
                <div className="absolute right-2 bottom-2 flex space-x-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                    onClick={handleSendMessage}
                    disabled={inputValue.trim() === "" || isLoading}
                  >
                    {isLoading ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-1.5">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <input type="checkbox" id="save-template" className="h-3 w-3" />
                  <label htmlFor="save-template" className="text-xs text-muted-foreground">Save as template</label>
                </div>
                <div className="flex items-center space-x-1">
                  <input type="checkbox" id="add-to-kb" className="h-3 w-3" />
                  <label htmlFor="add-to-kb" className="text-xs text-muted-foreground">Add to knowledge base</label>
                </div>
              </div>
              <div className="text-xs text-muted-foreground/70">
                Press Enter to send, Shift+Enter for new line
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Note: LangchainChatWrapper has been moved to its own file: langchain-chat-wrapper.tsx
