"use client";

import React from "react";
import { AgenticChatInterface } from "@/components/agentic-chat-interface";

export default function AgenticChatPage() {
  return (
    <main className="flex h-screen overflow-hidden">
      <AgenticChatInterface className="w-full" />
    </main>
  );
}
