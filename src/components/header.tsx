"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Search, Edit, Sparkles, RefreshCcw, History } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { UserProfileDropdown } from "@/components/user-profile-dropdown";
import { useSidebar } from "@/context/sidebar-context";
import { Logo } from "@/components/ui/logo";
import { ChatHistory } from "@/components/chat-history";
import { useChatHistoryStore } from "@/store/use-chat-history-store";

export function Header() {
  const { collapsed } = useSidebar();
  const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(false);
  const router = useRouter();
  const { addChat } = useChatHistoryStore();

  return (
    <>
      <header className="h-14 border-b bg-background flex items-center px-4 sticky top-0 z-10">
        {collapsed && (
          <div className="mr-4">
            <Logo size="sm" variant="default" />
          </div>
        )}
        <div className="flex-1 flex justify-center"></div>
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={() => setIsChatHistoryOpen(!isChatHistoryOpen)}
          >
            <History className="h-5 w-5" />
            <span className="sr-only">Chat History</span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={() => {
              // Create a new chat and navigate to it
              addChat({ title: "New Chat" });
              router.push("/chat");
            }}
          >
            <Edit className="h-5 w-5" />
            <span className="sr-only">New Chat</span>
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Sparkles className="h-5 w-5" />
            <span className="sr-only">Premium</span>
          </Button>
          <ModeToggle />
          <UserProfileDropdown
            userName="Vijendra Rana"
            userEmail="vijendra.rana@globallogic.com"
          />
        </div>
      </header>
      
      {/* Chat History Popup */}
      <ChatHistory 
        isOpen={isChatHistoryOpen} 
        onClose={() => setIsChatHistoryOpen(false)} 
      />
    </>
  );
}
