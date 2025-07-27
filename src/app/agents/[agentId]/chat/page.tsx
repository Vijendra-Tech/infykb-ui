'use client';

import React from 'react';
import { AgentChatInterface } from '@/components/agent-chat-interface';
import { useParams } from 'next/navigation';

export default function AgentChatPage() {
  const params = useParams();
  const agentId = params.agentId as string;

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <AgentChatInterface agentId={agentId} />
    </div>
  );
}
