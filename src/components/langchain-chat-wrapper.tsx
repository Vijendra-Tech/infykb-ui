"use client";

import React from "react";
import { LangchainChatInterface } from "./langchain-chat-interface";

// Mock providers for LangGraph integration
// These would be replaced with actual providers from @langchain/langgraph-sdk/react in a real implementation
const StreamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

const ThreadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

const ArtifactProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

// Wrapper component that provides all necessary contexts for LangGraph integration
export function LangchainChatWrapper() {
  return (
    <div className="flex flex-col h-full">
      <StreamProvider>
        <ThreadProvider>
          <ArtifactProvider>
            <div className="h-full overflow-auto flex-1">
              <LangchainChatInterface hideInput={false} />
            </div>
          </ArtifactProvider>
        </ThreadProvider>
      </StreamProvider>
    </div>
  );
}
