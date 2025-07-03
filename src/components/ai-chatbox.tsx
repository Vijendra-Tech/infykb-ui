"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronDown, Plus, Workflow, FileText, Settings } from "lucide-react";

export function AIChatbox() {
  const [selectedModel, setSelectedModel] = useState("Auto");
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<{type: 'user' | 'assistant', content: string}[]>([]);
  
  const models = [
    { name: "Auto", description: "Dynamic cost" },
    { name: "Flux Kontext [PRO]", description: null },
    { name: "Flux Kontext [MAX]", description: null },
    { name: "GPT", description: null },
    { name: "GPT-HQ", description: null }
  ];

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      // Add user message
      setMessages([...messages, { type: 'user', content: inputValue }]);
      
      // Simulate assistant response after a delay
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          type: 'assistant', 
          content: `This is a simulated response using ${selectedModel} model.` 
        }]);
      }, 1000);
      
      setInputValue("");
    }
  };

  return (
    <Card className="flex flex-col h-full border-0 rounded-lg overflow-hidden bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="text-lg font-medium">Design</div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
            <Plus className="h-5 w-5" />
          </Button>
          <div className="relative">
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-white bg-gray-800 hover:bg-gray-700 rounded-md px-3 py-1.5 text-sm"
              onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
            >
              {selectedModel}
              <ChevronDown className="h-4 w-4" />
            </Button>
            
            {isModelDropdownOpen && (
              <div className="absolute right-0 mt-1 w-56 rounded-md bg-gray-800 shadow-lg z-50">
                <div className="py-1">
                  {models.map((model) => (
                    <button
                      key={model.name}
                      className="flex items-center justify-between w-full px-4 py-2 text-sm text-left hover:bg-gray-700"
                      onClick={() => {
                        setSelectedModel(model.name);
                        setIsModelDropdownOpen(false);
                      }}
                    >
                      <div className="flex items-center">
                        {model.name === "Auto" && (
                          <div className="mr-2">
                            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
                              <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
                              <path d="M5 8h6M8 5v6" strokeWidth="1.5" stroke="currentColor" />
                            </svg>
                          </div>
                        )}
                        {model.name}
                      </div>
                      {model.description && (
                        <span className="text-gray-400 text-xs">{model.description}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 bg-gray-800">
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white rounded-md">
          <Workflow className="h-4 w-4" />
          <span className="ml-2">Workflows</span>
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white rounded-md">
          <FileText className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white rounded-md">
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Chat content area */}
      <div className="flex-1 overflow-auto p-4 bg-gray-900">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center h-full">
            <div className="text-center space-y-4 text-gray-400">
              <p className="text-lg">Start a new conversation</p>
              <p className="text-sm">Select a model and type a message to begin</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg p-3 ${message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-white'}`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-gray-800 p-4 bg-gray-900">
        <div className="relative">
          <textarea
            placeholder="Type a message..."
            className="w-full rounded-lg bg-gray-800 border-0 text-white placeholder-gray-400 p-3 pr-12 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
            rows={1}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <button
            className="absolute right-3 bottom-3 text-blue-500 hover:text-blue-400"
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </Card>
  );
}
