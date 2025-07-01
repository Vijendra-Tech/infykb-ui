"use client";

import { ChatInterface } from "@/components/chat-interface";

export default function ChatPage() {
  return (
    <main className="flex-1 overflow-auto">
      <ChatInterface />
    </main>
  );
}
