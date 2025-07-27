"use client";
import { useState } from "react";
import { useSidebar } from "@/context/sidebar-context";
import { useDexieAuthStore } from "@/store/use-dexie-auth-store";
import { useChatHistoryStore } from "@/store/use-chat-history-store";
import { ChatHistory } from "@/components/chat-history";
import {
  BarChart,
  Clock,
  Database,
  FileText,
  Home,
  Menu,
  Pencil,
  Share2,
  UserCheck,
  Users,
  X,
  Bot,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/ui/logo";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: string;
  href?: string;
}

const SidebarItem = ({ icon, label, active, badge, href = "#" }: SidebarItemProps) => {
  const { collapsed } = useSidebar();
  
  if (!collapsed) {
    return (
      <motion.div
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <Link
          href={href}
          className={`group flex items-center gap-4 px-4 py-3.5 rounded-lg transition-all duration-200 ease-out relative overflow-hidden ${
            active 
              ? "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm border border-slate-300 dark:border-slate-600" 
              : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:shadow-sm hover:border hover:border-slate-200 dark:hover:border-slate-600"
          }`}
        >
          {active && (
            <motion.div
              className="absolute inset-0 bg-slate-200/30 dark:bg-slate-700/30 rounded-lg"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
          <div className={`relative z-10 transition-all duration-200 ease-out ${
            active ? "text-slate-700 dark:text-slate-300" : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300"
          }`}>
            {icon}
          </div>
          <span className={`relative z-10 font-medium transition-all duration-200 ease-out ${
            active ? "text-slate-800 dark:text-slate-200" : "text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100"
          }`}>
            {label}
          </span>
          {badge && (
            <span className="relative z-10 ml-auto text-xs px-2 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
              {badge}
            </span>
          )}
        </Link>
      </motion.div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={href}
          className={`group flex items-center justify-center w-12 h-12 rounded-lg transition-all duration-200 ease-out relative overflow-hidden ${
            active
              ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm border border-slate-300 dark:border-slate-600" 
              : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:shadow-sm hover:border hover:border-slate-200 dark:hover:border-slate-600"
          }`}
        >
          {active && (
            <motion.div
              className="absolute inset-0 bg-slate-200/30 dark:bg-slate-700/30 rounded-lg"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
          <div className="relative z-10 transition-all duration-200 ease-out">
            {icon}
          </div>
          {badge && (
            <span className="absolute -top-1 -right-1 text-xs px-1.5 py-0.5 rounded-full bg-slate-600 dark:bg-slate-400 text-white dark:text-slate-900 font-medium">
              {badge}
            </span>
          )}
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" className="bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 border-slate-700 dark:border-slate-300 shadow-lg">
        {label}
      </TooltipContent>
    </Tooltip>
  );
};

const SidebarSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="space-y-2 mb-6">
      <div className="flex items-center justify-between px-3 py-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 select-none">
          {title}
        </h3>
        <button
          className="h-5 w-5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center"
          onClick={() => setExpanded(!expanded)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground dark:text-slate-400"
            style={{ transform: expanded ? "none" : "rotate(180deg)" }}
          >
            <path d="m18 15-6-6-6 6" />
          </svg>
        </button>
      </div>
      {expanded && <div className="space-y-1">{children}</div>}
    </div>
  );
};

export function Sidebar() {
  const { collapsed, setCollapsed } = useSidebar();
  const { isAdmin, isApprover } = useDexieAuthStore();
  const { chats } = useChatHistoryStore();
  const pathname = usePathname();
  const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(false);

  return (
    <motion.div
      className={`h-full ${
        collapsed ? "w-16" : "w-72"
      } border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 flex flex-col transition-all duration-500 ease-out relative shadow-lg shadow-slate-200/20 dark:shadow-slate-900/30`}
      animate={{ width: collapsed ? 70 : 288 }}
      transition={{ type: "spring", stiffness: 200, damping: 30, mass: 1 }}
    >
      {/* Header */}
      <div className="h-18 px-6 flex items-center justify-between bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-100/30 dark:bg-slate-800/30" />
        
        <AnimatePresence mode="wait" initial={false}>
          {collapsed ? (
            <motion.div
              key="collapsed-logo"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="relative z-10"
            >
              <Logo size="md" variant="sidebar" animated={false} />
            </motion.div>
          ) : (
            <motion.div
              key="expanded-logo"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="relative z-10"
            >
              <Logo size="md" variant="sidebar" animated={false} />
            </motion.div>
          )}
        </AnimatePresence>

        {!collapsed && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setCollapsed(true)}
                className="relative z-10 p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 border-slate-700 dark:border-slate-300 shadow-lg">
              Collapse sidebar
            </TooltipContent>
          </Tooltip>
        )}

        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="absolute top-1/2 -translate-y-1/2 right-2 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors z-10"
          >
            <Menu className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto py-6 px-4 bg-white dark:bg-slate-950 relative">
        <div className="absolute inset-0 bg-slate-50/20 dark:bg-slate-900/20" />
        
        <div className="relative z-10 space-y-2 mb-6">
          <AnimatePresence mode="wait" initial={false}>
            {collapsed ? (
              <motion.div
                key="collapsed-home"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center space-y-2"
              >
                <SidebarItem
                  icon={<Home className="h-5 w-5" />}
                  label="Dashboard"
                  active={pathname === "/dashboard"}
                  href="/dashboard"
                />
              </motion.div>
            ) : (
              <motion.div
                key="expanded-home"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-1"
              >
                <SidebarItem
                  icon={<Home className="h-5 w-5" />}
                  label="Dashboard"
                  active={pathname === "/dashboard"}
                  href="/dashboard"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!collapsed && (
          <SidebarSection title="Navigation">
            <SidebarItem
              icon={<FileText className="h-5 w-5" />}
              label="Projects"
              active={pathname === "/projects"}
              href="/projects"
            />
            <SidebarItem
              icon={<Database className="h-5 w-5" />}
              label="Data Ingestion"
              active={pathname === "/data-ingestion"}
              href="/data-ingestion"
            />
            <SidebarItem
              icon={<Bot className="h-5 w-5" />}
              label="Chat"
              active={pathname === "/chat"}
              href="/chat"
            />
            <SidebarItem
              icon={<Sparkles className="h-5 w-5" />}
              label="Agents"
              active={pathname === "/agents"}
              href="/agents"
              badge="New"
            />
            <SidebarItem
              icon={<BarChart className="h-5 w-5" />}
              label="Analytics"
              active={pathname === "/analytics"}
              href="/analytics"
            />
          </SidebarSection>
        )}

        {!collapsed && (isAdmin || isApprover()) && (
          <SidebarSection title="Management">
            <SidebarItem
              icon={<Users className="h-5 w-5" />}
              label="Organization"
              active={pathname === "/organization"}
              href="/organization"
            />
            <SidebarItem
              icon={<UserCheck className="h-5 w-5" />}
              label="Requests"
              active={pathname === "/requests"}
              href="/requests"
            />
          </SidebarSection>
        )}

        {!collapsed && (
          <div className="mt-8">
            <button
              onClick={() => setIsChatHistoryOpen(!isChatHistoryOpen)}
              className="group flex items-center gap-4 px-4 py-3.5 rounded-lg transition-all duration-200 ease-out relative overflow-hidden w-full hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:shadow-sm hover:border hover:border-slate-200 dark:hover:border-slate-600"
            >
              <Clock className="h-5 w-5" />
              <span className="font-medium">Chat History</span>
              <span className="ml-auto text-xs px-2 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                {chats.length}
              </span>
            </button>
            
            <AnimatePresence>
              {isChatHistoryOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 max-h-64 overflow-auto">
                    <ChatHistory isOpen={false} onClose={function (): void {
                      throw new Error("Function not implemented.");
                    } } />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {collapsed && (
          <div className="flex flex-col items-center space-y-2">
            <SidebarItem
              icon={<FileText className="h-5 w-5" />}
              label="Projects"
              active={pathname === "/projects"}
              href="/projects"
            />
            <SidebarItem
              icon={<Database className="h-5 w-5" />}
              label="Data Ingestion"
              active={pathname === "/data-ingestion"}
              href="/data-ingestion"
            />
            <SidebarItem
              icon={<Bot className="h-5 w-5" />}
              label="Chat"
              active={pathname === "/chat"}
              href="/chat"
            />
            <SidebarItem
              icon={<Sparkles className="h-5 w-5" />}
              label="Agents"
              active={pathname === "/agents"}
              href="/agents"
              badge="New"
            />
            <SidebarItem
              icon={<BarChart className="h-5 w-5" />}
              label="Analytics"
              active={pathname === "/analytics"}
              href="/analytics"
            />
            {(isAdmin() || isApprover()) && (
              <>
                <SidebarItem
                  icon={<Users className="h-5 w-5" />}
                  label="Organization"
                  active={pathname === "/organization"}
                  href="/organization"
                />
                <SidebarItem
                  icon={<UserCheck className="h-5 w-5" />}
                  label="Requests"
                  active={pathname === "/requests"}
                  href="/requests"
                />
              </>
            )}
            <SidebarItem
              icon={<Clock className="h-5 w-5" />}
              label="Chat History"
              badge={chats.length.toString()}
              href="#"
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}
