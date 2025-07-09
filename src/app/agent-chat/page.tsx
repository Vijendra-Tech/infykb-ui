"use client";

import { AgentChatView } from "@/components/agent-chat-view";

export default function AgentChatPage() {
  return (
    <main className="flex-1 overflow-auto relative">
      <AgentChatView />
    </main>
  );
}
