import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";

import {
  Send,
  Bot,
  User,
  ExternalLink,
  Sparkles,
  Bug,
  Lightbulb,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Search,
  RefreshCw,
  Paperclip,
  Plus,
} from "lucide-react";

import {
  GitHubIssue,
} from "@/lib/github-service";
import {
  MultiRepoSearchResult,
} from "@/lib/enhanced-github-service";
import {
  AnalysisResult,
  SolutionSuggestion,
} from "@/lib/agentic-ai-service";
import { CodeSnippetCard } from "@/components/generative-ui-components";
import { SimilarIssuesDisplay } from "@/components/similar-issues-display";
import { useToast } from "@/components/ui/use-toast";
import { useChatHistory } from "@/hooks/use-chat-history";
import ChatHistoryService from "@/services/chat-history-service";
import { ChatMessage } from "@/lib/database";
import { generateUUID } from "@/lib/utils";
import { InfinityKBLogoHero } from "./ui/infinity-kb-logo";
import { buildApiUrl, API_ENDPOINTS } from "@/lib/api-config";
import { instrumentedFetch } from "@/lib/instrumented-api";

// Enhanced Markdown Renderer Component
const MarkdownRenderer: React.FC<{ content: string; className?: string }> = ({
  content,
  className = "",
}) => {
  return (
    <div className={`prose prose-sm max-w-none dark:prose-invert ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Custom styling for different elements
          h1: ({ children }) => (
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-medium text-slate-700 dark:text-slate-300 mb-2">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-3 space-y-1 text-slate-600 dark:text-slate-400">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-3 space-y-1 text-slate-600 dark:text-slate-400">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-slate-600 dark:text-slate-400">{  }</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 dark:bg-blue-950/30 rounded-r-md mb-3">
              {children}
            </blockquote>
          ),
          code: ({ children, className, ...props }: any) => {
            const isInline = !className || !className.includes("language-");
            if (isInline) {
              return (
                <code
                  className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm font-mono text-slate-800 dark:text-slate-200"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code
                className="block bg-slate-100 dark:bg-slate-800 p-3 rounded-md text-sm font-mono overflow-x-auto"
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md overflow-x-auto mb-3">
              {children}
            </pre>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-900 dark:text-slate-100">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-slate-700 dark:text-slate-300">
              {children}
            </em>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 underline"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

// AI Response Match structure
interface AIResponseMatch {
  description: any;
  title: string;
  summary: string;
  created: string;
  user: string;
  url: string | null;
  score: number;
}

// AI Response structure
interface AIResponse {
  ai_summary: string;
  potential_fix: string;
  matches: AIResponseMatch[];
}

interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
  type?: "text" | "code" | "analysis" | "error" | "ai_response";
  isStreaming?: boolean;
  streamedContent?: string;
  aiResponse?: AIResponse;
  metadata?: {
    analysis?: AnalysisResult;
    suggestions?: SolutionSuggestion[];
    relatedIssues?: GitHubIssue[];
    enhancedIssues?: MultiRepoSearchResult[];
    confidence?: number;
    followUpQuestions?: string[];
  };
  analysis?: AnalysisResult;
  suggestions?: SolutionSuggestion[];
  relatedIssues?: GitHubIssue[];
  enhancedIssues?: MultiRepoSearchResult[];
  confidence?: number;
  followUpQuestions?: string[];
}

interface AgenticChatProps {
  className?: string;
  sessionId?: string;
}

export function AgenticChatInterface({
  className,
  sessionId,
}: AgenticChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [relatedIssues, setRelatedIssues] = useState<GitHubIssue[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  const [sideDrawerContent, setSideDrawerContent] = useState<
    "issues" | "knowledge" | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageReactions, setMessageReactions] = useState<
    Record<string, "up" | "down" | null>
  >({});
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
    null
  );
  const [expandedSummaries, setExpandedSummaries] = useState<
    Record<
      string,
      {
        isExpanded: boolean;
        summary: string;
        isStreaming: boolean;
        streamedContent: string;
      }
    >
  >({});

  // Dexie-based chat history integration
  const chatHistory = useChatHistory();

  // Load existing sessions on component mount
  useEffect(() => {
    chatHistory.loadSessions();
  }, []);

  const { toast } = useToast();

  // Function to simulate AI response with the provided structure
  const getAIResponse = async (query: string) => {
    try {
      const res = await instrumentedFetch(buildApiUrl(API_ENDPOINTS.SEARCH), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: query }),
      });

      if (res.ok) {
        const data = await res.json();
        return data;
      }

      // Log the error response for failed API calls
      console.error(`Search API failed with status ${res.status}: ${res.statusText}`);
      
      return {
        matches: [],
        error: `API call failed with status ${res.status}: ${res.statusText}`,
      };
    } catch (error) {
      // Ensure errors are logged and traced
      console.error('Search API error:', error);
      return {
        matches: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  };

  // Function to handle individual match summarize button click
  const handleMatchSummarize = async (
    match: AIResponseMatch,
    matchIndex: number
  ) => {
    const matchKey = `${match.title}-${matchIndex}`;

    // If already expanded, collapse it
    if (expandedSummaries[matchKey]?.isExpanded) {
      setExpandedSummaries((prev) => ({
        ...prev,
        [matchKey]: { ...prev[matchKey], isExpanded: false },
      }));
      return;
    }

    // Initialize the expanded state with streaming
    setExpandedSummaries((prev) => ({
      ...prev,
      [matchKey]: {
        isExpanded: true,
        summary: "",
        isStreaming: true,
        streamedContent: "",
      },
    }));

    // Generate enhanced summary for this specific match
    const enhancedSummary = await generateMatchSummary(match);

    // Stream the summary text character by character
    const streamDelay = 10;
    let currentContent = "";

    for (let i = 0; i < enhancedSummary.length; i++) {
      currentContent += enhancedSummary[i];

      setExpandedSummaries((prev) => ({
        ...prev,
        [matchKey]: {
          ...prev[matchKey],
          streamedContent: currentContent,
        },
      }));

      await new Promise((resolve) => setTimeout(resolve, streamDelay));
    }

    // Finalize the streaming
    setExpandedSummaries((prev) => ({
      ...prev,
      [matchKey]: {
        ...prev[matchKey],
        summary: enhancedSummary,
        isStreaming: false,
      },
    }));
  };

  function showFormattedLines(rawText: string) {
    // Split by custom delimiters: headers, lists, steps, and sentence endings
    const regex =
      /(?<=\*\*[^*]+\*\*)|(?<=\n)|(?<=\.\s)|(?<=\?\s)|(?<=:\s)|(?=-\s)|(?=\d+\.\s)/g;

    const lines = rawText
      .split(regex)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    return lines;
  }

  // Function to generate summary for a specific match
  const generateMatchSummary = async (
    match: AIResponseMatch
  ): Promise<string> => {
    // Simulate AI processing time
    await new Promise((resolve) =>
      setTimeout(resolve, 500 + Math.random() * 800)
    );

    const createdDate = new Date(match.created);
    const formattedDate = createdDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return (
      `**Description for: ${match.title}**\n\n` +
      `${match.description}\n\n` +
      `**Key Details:**\n` +
      `• Reported by: ${match.user}\n` +
      `• Date: ${formattedDate}\n` +
      `• Confidence Score: ${match.score.toFixed(4)} (${
        match.score > 0.9 ? "High" : match.score > 0.7 ? "Medium" : "Low"
      } relevance)\n\n`
    );
  };

  // Load specific session when sessionId is provided
  useEffect(() => {
    const loadSpecificSession = async () => {
      if (sessionId) {
        try {
          console.log("Loading session:", sessionId);

          // Load session and messages directly from service to avoid state timing issues
          const [session, sessionMessages] = await Promise.all([
            ChatHistoryService.getChatSession(sessionId),
            ChatHistoryService.getChatMessages(sessionId),
          ]);

          if (!session) {
            throw new Error("Session not found");
          }

          // Convert chat history messages to Message format for the UI
          const historyMessages = sessionMessages.map(
            (msg: ChatMessage): Message => ({
              id: msg.uuid || generateUUID(),
              content: msg.content,
              sender: msg.sender as "user" | "assistant",
              timestamp: new Date(msg.timestamp),
              type:
                ((msg.type === "error" ? "analysis" : msg.type) as
                  | "text"
                  | "code"
                  | "analysis") || "text",
              metadata: msg.metadata,
            })
          );

          setMessages(historyMessages);
          setCurrentChatId(sessionId);

          console.log(
            "Session loaded successfully:",
            sessionId,
            "Messages:",
            historyMessages.length
          );
        } catch (error) {
          console.error("Failed to load session:", error);
          toast({
            title: "Error",
            description: "Failed to load conversation history",
            variant: "destructive",
          });
        }
      }
    };

    loadSpecificSession();
  }, [sessionId]); // Only depend on sessionId to prevent infinite loop
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Create a new chat session when the first user message is sent
  useEffect(() => {
    const createNewSession = async () => {
      if (messages.length > 0 && !currentChatId) {
        const firstUserMessage = messages.find((m) => m.sender === "user");
        if (firstUserMessage) {
          const chatTitle =
            firstUserMessage.content.length > 50
              ? firstUserMessage.content.substring(0, 50) + "..."
              : firstUserMessage.content;

          try {
            console.log("Creating new chat session:", chatTitle);
            // Create new chat session in Dexie
            const session = await chatHistory.createSession({
              title: chatTitle || "New Chat",
              userId: "user-123", // TODO: Get actual user ID from auth context
              organizationId: "org-123", // TODO: Get actual org ID from auth context
              projectId: undefined,
              metadata: {
                tags: ["typescript", "support"],
                isFavorite: false,
                aiModel: "gpt-4",
                totalTokens: 0,
              },
            });

            setCurrentChatId(session.uuid);
            console.log("Chat session created with ID:", session.uuid);

            // Save all existing messages to the session
            for (const message of messages) {
              await chatHistory.addMessage({
                sessionId: session.uuid,
                content: message.content,
                sender: message.sender,
                type: "text",
                metadata: message.metadata,
              });
            }
          } catch (error) {
            console.error("Failed to create chat session:", error);
          }
        }
      }
    };

    createNewSession();
  }, [messages, currentChatId, chatHistory]);

  // Save new messages to database when they are added
  const saveMessageToHistory = async (message: Message) => {
    if (currentChatId) {
      try {
        await chatHistory.addMessage({
          sessionId: currentChatId,
          content: message.content,
          sender: message.sender,
          type: "text",
          metadata: message.metadata,
        });
        console.log("Message saved to chat history:", message.id);
      } catch (error) {
        console.error("Failed to save message to chat history:", error);
      }
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    // Auto-resize textarea
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Streaming text functionality
  const streamText = async (
    text: string,
    messageId: string,
    delay: number = 30
  ) => {
    const words = text.split(" ");
    let currentText = "";

    for (let i = 0; i < words.length; i++) {
      currentText += (i > 0 ? " " : "") + words[i];

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, streamedContent: currentText } : msg
        )
      );

      // Variable delay for more natural typing
      const wordDelay = delay + Math.random() * 20;
      await new Promise((resolve) => setTimeout(resolve, wordDelay));
    }

    // Mark streaming as complete
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              isStreaming: false,
              content: text,
              streamedContent: undefined,
            }
          : msg
      )
    );

    setStreamingMessageId(null);
  };

  const handleSendMessage = async () => {
    // Validate input first - don't start loading
    if (!inputValue.trim()) {
      toast({
        title: "Empty message",
        description: "Please enter a message before sending.",
        variant: "destructive",
      });
      return;
    }
    if (isLoading) return;

    const userMessage: Message = {
      id: generateUUID(),
      content: inputValue.trim(),
      sender: "user",
      timestamp: new Date(),
      type: "text",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setIsTyping(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    let aiMessageId: string | null = null;

    try {
      // Save user message to database
      await saveMessageToHistory(userMessage);

      // Simulate AI processing
      await new Promise((resolve) =>
        setTimeout(resolve, 800 + Math.random() * 1200)
      );

      // Create streaming AI message
      aiMessageId = generateUUID();
      const aiMessage: Message = {
        id: aiMessageId,
        content: "",
        sender: "assistant",
        timestamp: new Date(),
        type: "ai_response",
        isStreaming: true,
        streamedContent: "",
      };

      setMessages((prev) => [...prev, aiMessage]);
      setStreamingMessageId(aiMessageId);
      setIsTyping(false);

      // Get AI response with matches structure
      const aiResponse = await getAIResponse(userMessage.content);

      // Update the message with AI response data
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? {
                ...msg,
                type: "ai_response",
                aiResponse: aiResponse,
                content: "",
                isStreaming: false,
              }
            : msg
        )
      );

      // Save the final message to database
      const finalMessage: Message = {
        id: aiMessageId,
        content: "",
        sender: "assistant",
        timestamp: new Date(),
        type: "ai_response",
        aiResponse: aiResponse,
      };

      await saveMessageToHistory(finalMessage);
    } catch (error) {
      console.error("Error processing message:", error);

      const errorMessage =
        "I apologize, but I encountered an error while processing your request. Please try again.";

      // If we have created an AI message, update it with error content
      if (aiMessageId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? {
                  ...msg,
                  content: errorMessage,
                  type: "error" as const,
                  isStreaming: false,
                  streamedContent: undefined,
                  aiResponse: undefined,
                }
              : msg
          )
        );

        // Save the updated error message to database
        try {
          const errorMsg: Message = {
            id: aiMessageId,
            content: errorMessage,
            sender: "assistant",
            timestamp: new Date(),
            type: "error",
          };
          await saveMessageToHistory(errorMsg);
        } catch (saveError) {
          console.error("Failed to save error message:", saveError);
        }
      } else {
        // Create new error message only if no AI message was created
        const errorMsg: Message = {
          id: generateUUID(),
          content: errorMessage,
          sender: "assistant",
          timestamp: new Date(),
          type: "error",
        };
        setMessages((prev) => [...prev, errorMsg]);

        // Save error message to database
        try {
          await saveMessageToHistory(errorMsg);
        } catch (saveError) {
          console.error("Failed to save error message:", saveError);
        }
      }

      // Show error toast
      toast({
        title: "Error",
        description: "Failed to process your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsTyping(false);
      setStreamingMessageId(null);
    }
  };

  const openSideDrawer = (content: "issues" | "knowledge") => {
    setSideDrawerContent(content);
    setSideDrawerOpen(true);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "Text has been copied to your clipboard.",
      });
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    setInputValue("");
    setRelatedIssues([]);
    setMessageReactions({});
    setSideDrawerOpen(false);
    setSideDrawerContent(null);
    setSearchQuery("");
    setExpandedSummaries({});
    setIsLoading(false);
    setIsTyping(false);
    setStreamingMessageId(null);

    toast({
      title: "New Chat Started",
      description: "Previous conversation has been saved to history.",
    });
  };

  const handleMessageReaction = (
    messageId: string,
    reaction: "up" | "down"
  ) => {
    setMessageReactions((prev) => ({
      ...prev,
      [messageId]: prev[messageId] === reaction ? null : reaction,
    }));
  };

  // Function to convert GitHub API URL to web URL
  const convertApiUrlToWebUrl = (apiUrl: string | null): string | null => {
    if (!apiUrl) return null;

    // Convert API URL to web URL
    // From: https://api.github.com/repos/owner/repo/issues/123
    // To: https://github.com/owner/repo/issues/123
    const apiUrlPattern = /^https:\/\/api\.github\.com\/repos\/(.+)$/;
    const match = apiUrl.match(apiUrlPattern);

    if (match) {
      return `https://github.com/${match[1]}`;
    }

    // If it's already a web URL or doesn't match the pattern, return as is
    return apiUrl;
  };

  // Function to extract ticket number from URL
  const extractTicketNumber = (url: string | null): string | null => {
    if (!url) return null;

    // Extract issue/PR number from GitHub URL
    // From: https://api.github.com/repos/SuiteCRM/SuiteCRM/issues/10693
    // Extract: #10693
    const issuePattern = /\/issues\/(\d+)$/;
    const prPattern = /\/pull\/(\d+)$/;

    const issueMatch = url.match(issuePattern);
    if (issueMatch) {
      return `#${issueMatch[1]}`;
    }

    const prMatch = url.match(prPattern);
    if (prMatch) {
      return `#${prMatch[1]}`;
    }

    return null;
  };

  // Component to render AI response matches (title-only with individual summarize buttons)
  const renderAIResponseMatches = (matches: AIResponseMatch[]) => {
    return (
      <div className="mt-4 space-y-2">
        {matches.map((match, index) => {
          const matchKey = `${match.title}-${index}`;
          const expandedState = expandedSummaries[matchKey];
          const webUrl = convertApiUrlToWebUrl(match.url);
          const ticketNumber = extractTicketNumber(match.url);
          const createdDate = new Date(match.created);
          const formattedDate = createdDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });

          return (
            <Card
              key={index}
              className="border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors min-w-3xl"
            >
              {/* Enhanced Info Row */}
              <div className="p-3">
                {/* Top row: Ticket number, score, and actions */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {ticketNumber && (
                      <Badge
                        variant="secondary"
                        className="text-xs px-2 py-1 font-mono"
                      >
                        {ticketNumber}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs px-2 py-1">
                      {match.score.toFixed(3)}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700 transition-all duration-200"
                      onClick={() => handleMatchSummarize(match, index)}
                      disabled={expandedState?.isStreaming}
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      {expandedState?.isStreaming
                        ? "Loading..."
                        : expandedState?.isExpanded
                        ? "Hide"
                        : "See Description"}
                    </Button>

                    {webUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-slate-400 hover:text-blue-600"
                        onClick={() => window.open(webUrl, "_blank")}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h4 className="font-medium text-slate-900 dark:text-slate-100 text-sm leading-tight mb-2">
                  {match.title}
                </h4>

                {/* Bottom row: User and date */}
                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {match.user}
                  </span>
                  <span>{formattedDate}</span>
                </div>
              </div>

              {/* Expandable Summary Area */}
              {expandedState?.isExpanded && (
                <div className="px-3 pb-3 border-t border-slate-100 dark:border-slate-700">
                  <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    {expandedState.isStreaming ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <div className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
                          {expandedState.streamedContent}
                          <span className="inline-block w-0.5 h-4 bg-blue-500 ml-1 animate-pulse rounded-sm" />
                        </div>
                      </div>
                    ) : (
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <div className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
                          {expandedState.summary}
                        </div>
                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-slate-600">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs px-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                            onClick={() =>
                              copyToClipboard(expandedState.summary)
                            }
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy Summary
                          </Button>
                          {webUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs px-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                              onClick={() => window.open(webUrl, "_blank")}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View Issue
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    );
  };

  const renderMessage = (message: Message, index: number) => {
    const isUser = message.sender === "user";

    return (
      <div key={message.id} className="group flex justify-start mb-8">
        <div className="flex items-start gap-4 max-w-[85%]">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-slate-900 ${
                isUser
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                  : "bg-gradient-to-br from-orange-500 to-red-500 text-white"
              }`}
            >
              {isUser ? (
                <User className="h-5 w-5" />
              ) : (
                <Bot className="h-5 w-5" />
              )}
            </div>
            {!isUser && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-orange-400 rounded-full border-2 border-white dark:border-slate-900 shadow-sm animate-pulse" />
            )}
          </div>

          {/* Message Content */}
          <div className="flex flex-col items-start w-full">
            {/* Message Header */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {isUser ? "You" : "AI Assistant"}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {message.timestamp.toLocaleTimeString()}
              </span>
              {message.metadata?.confidence && (
                <Badge variant="secondary" className="text-xs">
                  {Math.round(message.metadata.confidence * 100)}% confident
                </Badge>
              )}
            </div>

            {/* Clean Message Content */}
            <div className="relative w-full py-2">
              {/* Message Content */}
              <div className="prose prose-sm max-w-none dark:prose-invert">
                {message.type === "code" ? (
                  <CodeSnippetCard
                    suggestion={{
                      type: "code_snippet",
                      confidence: 1.0,
                      title: "Code Snippet",
                      description: "Generated code snippet",
                      code: {
                        language: "javascript",
                        snippet: message.content,
                        explanation: "Code snippet from chat message",
                      },
                    }}
                    onCopy={(code) => {
                      navigator.clipboard.writeText(code);
                    }}
                  />
                ) : (
                  <div className="whitespace-pre-wrap break-words">
                    {message.isStreaming ? (
                      <div className="flex items-end">
                        <span>{message.streamedContent}</span>
                        <span className="inline-block w-0.5 h-4 bg-blue-500 ml-1 animate-pulse rounded-sm" />
                      </div>
                    ) : (
                      <span>{message.content}</span>
                    )}
                  </div>
                )}
              </div>

              {/* AI Response Matches - Display when message type is ai_response */}
              {message.type === "ai_response" &&
                message.aiResponse &&
                message.aiResponse.matches && (
                  <div className="mt-4">
                    <MarkdownRenderer content={message.aiResponse.ai_summary} />
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Drawing from the following tickets, I identified the
                        root cause and formulated the solution.
                      </span>
                    </div>
                    {renderAIResponseMatches(message.aiResponse.matches)}
                  </div>
                )}

              {/* Similar Issues Display - Only show for the latest AI message */}
              {!isUser &&
                relatedIssues &&
                relatedIssues.length > 0 &&
                index === messages.length - 1 && (
                  <div className="mt-4">
                    <SimilarIssuesDisplay
                      issues={relatedIssues.map((issue, idx) => ({
                        ...issue,
                        relevance_score: 1.0 - idx * 0.1, // Decreasing relevance based on order
                        match_type: "combined" as const, // Default match type
                        repository:
                          issue.html_url.match(
                            /github\.com\/([^/]+\/[^/]+)/
                          )?.[1] || undefined,
                      }))}
                      searchQuery={
                        messages.filter((m) => m.sender === "user").pop()
                          ?.content
                      }
                    />
                  </div>
                )}

              {/* Follow-up Questions */}
              {message.metadata?.followUpQuestions &&
                message.metadata.followUpQuestions.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Follow-up questions:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {message.metadata.followUpQuestions.map(
                        (question, index) => (
                          <button
                            key={index}
                            onClick={() => setInputValue(question)}
                            className="text-sm px-3 py-2 rounded-lg transition-all duration-200 hover:shadow-sm bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-800 border border-amber-200 dark:from-amber-900/20 dark:to-orange-900/20 dark:hover:from-amber-900/30 dark:hover:to-orange-900/30 dark:text-amber-300 dark:border-amber-800"
                          >
                            {question}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Action Buttons - Only for bot messages */}
              {!isUser && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex flex-wrap items-center gap-2">
                    {message.aiResponse &&
                      message.aiResponse.matches?.length > 0 && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(
                                message.content || "No content to copy"
                              )
                            }
                            className="h-8 px-3 text-xs bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleMessageReaction(message.id, "up")
                            }
                            className={`h-8 px-3 text-xs ${
                              messageReactions[message.id] === "up"
                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                : "bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600"
                            }`}
                          >
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            Like
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleMessageReaction(message.id, "down")
                            }
                            className={`h-8 px-3 text-xs ${
                              messageReactions[message.id] === "down"
                                ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                                : "bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600"
                            }`}
                          >
                            <ThumbsDown className="h-3 w-3 mr-1" />
                            Dislike
                          </Button>
                        </>
                      )}

                    {message.metadata?.relatedIssues &&
                      message.metadata.relatedIssues.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openSideDrawer("issues")}
                          className="h-8 px-3 text-xs bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600"
                        >
                          <Bug className="h-3 w-3 mr-1" />
                          {message.metadata.relatedIssues?.length || 0} Similar
                          Issues
                        </Button>
                      )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSideDrawerContent = () => {
    return null;
  };

  return (
    <div
      className={`flex flex-col h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950/90 ${
        className || ""
      }`}
    >
      {/* Chat Content Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Messages Area */}
        <div className="flex-1 min-h-0 relative">
          <ScrollArea className="absolute inset-0" ref={chatContainerRef}>
            <div className="px-6 py-6">
              <div className="max-w-4xl mx-auto">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center min-h-[65vh]">
                    {/* Beautiful InfinityKB.AI Hero Logo */}
                    <div className="mb-12">
                      <InfinityKBLogoHero className="mb-8" />
                    </div>

                    {/* Enhanced Feature Cards with Glassmorphism */}
                    <div className="mb-8">
                      <div className="flex items-center justify-center gap-2 mb-6">
                        <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                          Powered by AI
                        </span>
                        <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
                      <Card className="group p-6 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 cursor-pointer border-slate-200/30 dark:border-slate-700/30 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl hover:bg-white/80 dark:hover:bg-slate-900/80 hover:scale-105">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                            <Bug className="h-6 w-6 text-white" />
                          </div>
                          <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            Debug & Analyze
                          </h3>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          Intelligent debugging with AI-powered error analysis
                          and instant troubleshooting solutions.
                        </p>
                      </Card>

                      <Card className="group p-6 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 cursor-pointer border-slate-200/30 dark:border-slate-700/30 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl hover:bg-white/80 dark:hover:bg-slate-900/80 hover:scale-105">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
                            <Lightbulb className="h-6 w-6 text-white" />
                          </div>
                          <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            Smart Solutions
                          </h3>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          Discover optimal code patterns, best practices, and
                          innovative solutions for complex challenges.
                        </p>
                      </Card>

                      <Card className="group p-6 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 cursor-pointer border-slate-200/30 dark:border-slate-700/30 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl hover:bg-white/80 dark:hover:bg-slate-900/80 hover:scale-105 md:col-span-2 lg:col-span-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg group-hover:shadow-emerald-500/25 transition-all duration-300">
                            <Search className="h-6 w-6 text-white" />
                          </div>
                          <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            Knowledge Search
                          </h3>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          Explore infinite knowledge with intelligent search
                          across your codebase and documentation.
                        </p>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {messages.map((message, index) =>
                      renderMessage(message, index)
                    )}
                    {isTyping && (
                      <div className="flex justify-start mb-8">
                        <div className="flex items-start gap-4 max-w-[85%]">
                          <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-200 dark:to-slate-300 flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-slate-900 text-white dark:text-slate-900">
                              <Bot className="h-5 w-5" />
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm animate-pulse" />
                          </div>
                          <div className="bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                              <div
                                className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Professional Chat Input Area */}
        <div className="flex-shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50">
          <div className="max-w-4xl mx-auto px-6 py-4">
            {/* New Chat Button - Only show when there are messages */}
            {messages.length > 0 && (
              <div className="mb-4 flex justify-center">
                <Button
                  onClick={startNewChat}
                  variant="outline"
                  size="sm"
                  className="h-8 px-4 text-xs font-medium bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700"
                >
                  <Plus className="h-3 w-3 mr-2" />
                  New Chat
                </Button>
              </div>
            )}

            {/* Enhanced Chat Input */}
            <div className="relative">
              <div className="flex items-end gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200">
                <Textarea
                  ref={textareaRef}
                  placeholder="Ask me anything about your code, debugging, or development challenges..."
                  value={inputValue}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyPress}
                  className="flex-1 min-h-[80px] max-h-[200px] resize-none border-0 bg-transparent text-base leading-relaxed placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-0 focus:outline-none p-0"
                  disabled={isLoading}
                />
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    size="sm"
                    className="h-8 w-8 p-0 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white rounded-lg transition-all duration-200"
                  >
                    {isLoading ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      <Send className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Compact L1/L2/L3 Support Prompts */}
            {messages.length === 0 && (
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {/* L1 Support Pills */}
                  <button
                    onClick={() =>
                      setInputValue(
                        "My application won't start. Can you help me troubleshoot?"
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-800 transition-colors"
                  >
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    L1: App won't start
                  </button>
                  <button
                    onClick={() =>
                      setInputValue(
                        "I'm getting a login error. What should I check?"
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-800 transition-colors"
                  >
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    L1: Login issues
                  </button>
                  <button
                    onClick={() =>
                      setInputValue(
                        "The page is loading slowly. Can you help optimize it?"
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-800 transition-colors"
                  >
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    L1: Performance
                  </button>

                  {/* L2 Support Pills */}
                  <button
                    onClick={() =>
                      setInputValue(
                        "I'm getting a 500 error when submitting forms. Can you help debug this?"
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/50 text-amber-700 dark:text-amber-300 rounded-full border border-amber-200 dark:border-amber-800 transition-colors"
                  >
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                    L2: API debugging
                  </button>
                  <button
                    onClick={() =>
                      setInputValue(
                        "My database queries are running slowly. How can I optimize them?"
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/50 text-amber-700 dark:text-amber-300 rounded-full border border-amber-200 dark:border-amber-800 transition-colors"
                  >
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                    L2: DB optimization
                  </button>
                  <button
                    onClick={() =>
                      setInputValue(
                        "My React components are re-rendering too often. How can I fix this?"
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/50 text-amber-700 dark:text-amber-300 rounded-full border border-amber-200 dark:border-amber-800 transition-colors"
                  >
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                    L2: React optimization
                  </button>

                  {/* L3 Support Pills */}
                  <button
                    onClick={() =>
                      setInputValue(
                        "I need to design a microservices architecture for my application. Can you help?"
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 text-red-700 dark:text-red-300 rounded-full border border-red-200 dark:border-red-800 transition-colors"
                  >
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    L3: Architecture
                  </button>
                  <button
                    onClick={() =>
                      setInputValue(
                        "How do I implement distributed caching across multiple services?"
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 text-red-700 dark:text-red-300 rounded-full border border-red-200 dark:border-red-800 transition-colors"
                  >
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    L3: Distributed systems
                  </button>
                  <button
                    onClick={() =>
                      setInputValue(
                        "Can you help me design a scalable CI/CD pipeline for enterprise deployment?"
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 text-red-700 dark:text-red-300 rounded-full border border-red-200 dark:border-red-800 transition-colors"
                  >
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    L3: DevOps & scaling
                  </button>
                </div>
              </div>
            )}

            {/* Minimal Status */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Press Enter to send
                </span>
              </div>
              <span
                className={`text-xs transition-colors ${
                  inputValue.length > 1800
                    ? "text-red-500 dark:text-red-400"
                    : inputValue.length > 1500
                    ? "text-amber-500 dark:text-amber-400"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {inputValue.length}/2000
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Side Drawer */}
      <Sheet open={sideDrawerOpen} onOpenChange={setSideDrawerOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>
              {sideDrawerContent === "issues"
                ? "Similar Issues"
                : "Knowledge Graph"}
            </SheetTitle>
            <SheetDescription>
              {sideDrawerContent === "issues"
                ? "Related GitHub issues that might help with your query"
                : "Knowledge graph showing relationships between concepts"}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">{renderSideDrawerContent()}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
