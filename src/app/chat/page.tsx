"use client";

import { AgenticChatInterface } from "@/components/agentic-chat-interface";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ChatPageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');

  return (
    <main className="flex h-screen overflow-hidden">
      <AgenticChatInterface 
        className="w-full" 
        sessionId={sessionId || undefined}
      />
    </main>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <main className="flex h-screen overflow-hidden">
        <div className="flex items-center justify-center w-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </main>
    }>
      <ChatPageContent />
    </Suspense>
  );
}
