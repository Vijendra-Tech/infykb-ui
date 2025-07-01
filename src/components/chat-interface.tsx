"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Send } from "lucide-react";

export function ChatInterface() {
  const [inputValue, setInputValue] = useState("");

  return (
    <div className="flex flex-col h-full">
      {/* Chat content area */}
      <div className="flex-1 overflow-auto p-4 flex flex-col items-center justify-center bg-background dark:bg-gray-900">
        <div className="max-w-2xl w-full text-center space-y-4">
          <h1 className="text-2xl font-medium">Good morning,</h1>
          <p className="text-xl">What do you want to create?</p>
        </div>
      </div>

      {/* Input area - fixed at bottom */}
      <div className="border-t p-4 bg-background dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="p-2 md:px-4">
              <div className="flex items-center">
                <div className="flex w-full items-center pb-4 md:pb-1">
                  <div className="flex w-full flex-col gap-1.5 rounded-2xl p-2.5 pl-1.5 bg-background dark:bg-gray-800 border border-input dark:border-gray-700 shadow-sm transition-colors">
                    <div className="flex items-end gap-1.5 md:gap-2 pl-4">
                      <div className="flex min-w-0 flex-1 flex-col">
                        <textarea
                          id="prompt-textarea"
                          tabIndex={0}
                          dir="auto"
                          rows={2}
                          placeholder="Message InfinityKB..."
                          className="mb-2 resize-none border-0 focus:outline-none text-sm text-foreground dark:text-gray-100 bg-transparent px-0 pb-6 pt-2"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                        />
                      </div>
                      <button
                        disabled={!inputValue.trim()}
                        data-testid="send-button"
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary dark:bg-primary text-primary-foreground hover:opacity-90 disabled:bg-muted disabled:text-muted-foreground transition-colors focus:outline-none cursor-pointer"
                        onClick={() => setInputValue("")}
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
