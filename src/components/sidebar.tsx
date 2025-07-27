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
          className={`group flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ease-out relative overflow-hidden ${
            active 
              ? "bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 dark:from-blue-400/20 dark:via-purple-400/20 dark:to-blue-400/20 text-blue-700 dark:text-blue-300 shadow-lg shadow-blue-500/20 dark:shadow-blue-400/30 border border-blue-200/50 dark:border-blue-400/30 backdrop-blur-sm" 
              : "hover:bg-gradient-to-r hover:from-slate-50/80 hover:via-blue-50/30 hover:to-slate-50/80 dark:hover:from-slate-800/60 dark:hover:via-slate-700/40 dark:hover:to-slate-800/60 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:shadow-lg hover:shadow-slate-200/30 dark:hover:shadow-slate-900/40 hover:border hover:border-slate-200/50 dark:hover:border-slate-600/50 hover:backdrop-blur-sm"
          }`}
        >
          {active && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 dark:from-blue-400/10 dark:to-purple-400/10 rounded-2xl"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
          <div className={`relative z-10 transition-all duration-300 ease-out ${
            active ? "text-blue-600 dark:text-blue-400 drop-shadow-sm" : "text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-300 group-hover:drop-shadow-sm"
          }`}>
            {icon}
          </div>
          <span className={`relative z-10 flex-1 font-semibold text-sm transition-all duration-300 ease-out tracking-wide ${
            active ? "text-blue-700 dark:text-blue-300" : "text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-slate-100"
          }`}>{label}</span>
          {badge && (
            <motion.span 
              className={`relative z-10 text-xs px-3 py-1.5 rounded-full font-semibold transition-all duration-300 ease-out ${
                active 
                  ? "bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/60 dark:to-purple-900/60 text-blue-700 dark:text-blue-300 shadow-sm border border-blue-200/50 dark:border-blue-400/30" 
                  : "bg-slate-100/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 group-hover:bg-blue-100/80 dark:group-hover:bg-blue-900/40 group-hover:text-blue-700 dark:group-hover:text-blue-300 group-hover:shadow-sm backdrop-blur-sm group-hover:border group-hover:border-blue-200/30 dark:group-hover:border-blue-400/20"
              }`}
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {badge}
            </motion.span>
          )}
        </Link>
      </motion.div>
    );
  } else {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Link
              href={href}
              className={`flex justify-center items-center p-3.5 rounded-2xl transition-all duration-300 ease-out relative overflow-hidden ${
                active 
                  ? "bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 dark:from-blue-400/20 dark:via-purple-400/20 dark:to-blue-400/20 text-blue-600 dark:text-blue-400 shadow-lg shadow-blue-500/20 dark:shadow-blue-400/30 border border-blue-200/50 dark:border-blue-400/30 backdrop-blur-sm" 
                  : "hover:bg-gradient-to-r hover:from-slate-50/80 hover:via-blue-50/30 hover:to-slate-50/80 dark:hover:from-slate-800/60 dark:hover:via-slate-700/40 dark:hover:to-slate-800/60 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 hover:shadow-lg hover:shadow-slate-200/30 dark:hover:shadow-slate-900/40 hover:border hover:border-slate-200/50 dark:hover:border-slate-600/50 hover:backdrop-blur-sm"
              }`}
            >
              {active && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 dark:from-blue-400/10 dark:to-purple-400/10 rounded-2xl"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
              <div className={`relative z-10 transition-all duration-300 ease-out ${
                active ? "text-blue-600 dark:text-blue-400 drop-shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 hover:drop-shadow-sm"
              }`}>{icon}</div>
            </Link>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-100 dark:to-slate-50 text-white dark:text-slate-900 border-slate-700 dark:border-slate-300 shadow-xl backdrop-blur-sm">
          <span className="font-medium">{label}</span>
          {badge && (
            <span className="ml-2 px-2 py-0.5 bg-blue-500/20 dark:bg-blue-600/20 rounded-full text-xs">
              {badge}
            </span>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }
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
          className="h-5 w-5 rounded-md hover:bg-secondary/50 dark:hover:bg-slate-700 flex items-center justify-center"
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
      } border-r border-slate-200/40 dark:border-slate-700/40 bg-gradient-to-b from-white/95 via-slate-50/60 to-white/95 dark:from-slate-950/95 dark:via-slate-900/80 dark:to-slate-950/95 flex flex-col transition-all duration-500 ease-out relative shadow-2xl shadow-slate-200/30 dark:shadow-slate-900/50 backdrop-blur-xl`}
      animate={{ width: collapsed ? 70 : 288 }}
      transition={{ type: "spring", stiffness: 200, damping: 30, mass: 1 }}
    >
      {/* Sidebar Header */}
      <div className="h-18 px-6 flex items-center justify-between bg-gradient-to-r from-blue-50/80 via-purple-50/60 to-blue-50/80 dark:from-slate-900/95 dark:via-slate-800/80 dark:to-slate-900/95 border-b border-blue-200/40 dark:border-slate-600/40 backdrop-blur-xl relative overflow-hidden">
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 dark:from-blue-400/10 dark:via-purple-400/10 dark:to-blue-400/10"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            backgroundSize: '200% 200%',
          }}
        />
        {!collapsed && (
          <>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="relative z-10"
            >
              <Logo size="md" variant="sidebar" />
            </motion.div>
            <motion.button
              className="relative z-10 p-3 rounded-2xl hover:bg-white/80 dark:hover:bg-slate-700/80 hover:shadow-lg hover:shadow-blue-200/30 dark:hover:shadow-slate-900/50 ml-auto flex items-center justify-center transition-all duration-300 ease-out backdrop-blur-sm border border-transparent hover:border-blue-200/40 dark:hover:border-slate-600/40 group"
              onClick={() => setCollapsed(true)}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Collapse sidebar"
            >
              <X size={18} className="text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200" />
            </motion.button>
          </>
        )}
        {collapsed && (
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                className="relative z-10 p-3 rounded-2xl hover:bg-white/80 dark:hover:bg-slate-700/80 hover:shadow-lg hover:shadow-blue-200/30 dark:hover:shadow-slate-900/50 mx-auto flex items-center justify-center transition-all duration-300 ease-out backdrop-blur-sm border border-transparent hover:border-blue-200/40 dark:hover:border-slate-600/40 group"
                onClick={() => setCollapsed(false)}
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Expand sidebar"
              >
                <Menu size={20} className="text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200" />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-100 dark:to-slate-50 text-white dark:text-slate-900 border-slate-700 dark:border-slate-300 shadow-xl backdrop-blur-sm">
              <span className="font-medium">Expand sidebar</span>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      {/* Main Content Area */}
      <div className="flex-1 overflow-auto py-6 px-4 bg-gradient-to-b from-white/90 via-blue-50/30 to-slate-50/80 dark:from-slate-950/90 dark:via-slate-900/80 dark:to-slate-950/95 relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-30 dark:opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 dark:from-blue-400/10 dark:via-transparent dark:to-purple-400/10" />
        </div>
        <div className="relative z-10 space-y-2 mb-6">
          <AnimatePresence mode="wait" initial={false}>
            {collapsed ? (
              <motion.div
                key="collapsed-home"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/"
                      className={`flex justify-center py-3 rounded-2xl transition-all duration-300 ease-out ${
                        pathname === "/" 
                          ? "bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 dark:from-blue-400/20 dark:via-purple-400/20 dark:to-blue-400/20 shadow-lg shadow-blue-500/20 dark:shadow-blue-400/30 border border-blue-200/50 dark:border-blue-400/30" 
                          : "hover:bg-gradient-to-r hover:from-slate-50/80 hover:via-blue-50/30 hover:to-slate-50/80 dark:hover:from-slate-800/60 dark:hover:via-slate-700/40 dark:hover:to-slate-800/60 hover:shadow-lg hover:shadow-slate-200/30 dark:hover:shadow-slate-900/40"
                      }`}
                    >
                      <Home size={18} className={pathname === "/" ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300"} />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">Home</TooltipContent>
                </Tooltip>
              </motion.div>
            ) : (
              <motion.div
                key="expanded-home"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <SidebarItem 
                  icon={<Home size={18} />} 
                  label="Home" 
                  href="/"
                  active={pathname === "/"}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Common sections for all roles */}
        <AnimatePresence mode="wait" initial={false}>
          {!collapsed ? (
            <motion.div
              key="expanded-sections"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <div className="space-y-2">
                {/* New Chat */}
                <motion.div
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Link
                    href="/chat"
                    onClick={() => {
                      const { addChat } = useChatHistoryStore.getState();
                      addChat({ title: "New Chat" });
                    }}
                    className={`group flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ease-out relative overflow-hidden ${
                      pathname === "/chat" && !pathname.includes("?id=")
                        ? "bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 dark:from-blue-400/20 dark:via-purple-400/20 dark:to-blue-400/20 text-blue-700 dark:text-blue-300 shadow-lg shadow-blue-500/20 dark:shadow-blue-400/30 border border-blue-200/50 dark:border-blue-400/30 backdrop-blur-sm" 
                        : "hover:bg-gradient-to-r hover:from-slate-50/80 hover:via-blue-50/30 hover:to-slate-50/80 dark:hover:from-slate-800/60 dark:hover:via-slate-700/40 dark:hover:to-slate-800/60 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:shadow-lg hover:shadow-slate-200/30 dark:hover:shadow-slate-900/40 hover:border hover:border-slate-200/50 dark:hover:border-slate-600/50 hover:backdrop-blur-sm"
                    }`}
                  >
                    {pathname === "/chat" && !pathname.includes("?id=") && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 dark:from-blue-400/10 dark:to-purple-400/10 rounded-2xl"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                    <div className={`relative z-10 transition-all duration-300 ease-out ${
                      pathname === "/chat" && !pathname.includes("?id=") ? "text-blue-600 dark:text-blue-400 drop-shadow-sm" : "text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-300 group-hover:drop-shadow-sm"
                    }`}>
                      <Pencil size={18} />
                    </div>
                    <span className={`relative z-10 flex-1 font-semibold text-sm transition-all duration-300 ease-out tracking-wide ${
                      pathname === "/chat" && !pathname.includes("?id=") ? "text-blue-700 dark:text-blue-300" : "text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-slate-100"
                    }`}>New Chat</span>
                    <motion.div
                      className="relative z-10 text-xs px-3 py-1.5 rounded-full font-semibold bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/60 dark:to-emerald-900/60 text-green-700 dark:text-green-300 shadow-sm border border-green-200/50 dark:border-green-400/30"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      ✨ New
                    </motion.div>
                  </Link>
                </motion.div>

                {/* Agent Marketplace */}
                <motion.div
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Link
                    href="/agents"
                    className={`group flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ease-out relative overflow-hidden ${
                      pathname === "/agents" || pathname.startsWith("/agents/")
                        ? "bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 dark:from-purple-400/20 dark:via-blue-400/20 dark:to-purple-400/20 text-purple-700 dark:text-purple-300 shadow-lg shadow-purple-500/20 dark:shadow-purple-400/30 border border-purple-200/50 dark:border-purple-400/30 backdrop-blur-sm" 
                        : "hover:bg-gradient-to-r hover:from-slate-50/80 hover:via-purple-50/30 hover:to-slate-50/80 dark:hover:from-slate-800/60 dark:hover:via-slate-700/40 dark:hover:to-slate-800/60 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:shadow-lg hover:shadow-slate-200/30 dark:hover:shadow-slate-900/40 hover:border hover:border-slate-200/50 dark:hover:border-slate-600/50 hover:backdrop-blur-sm"
                    }`}
                  >
                    {(pathname === "/agents" || pathname.startsWith("/agents/")) && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-blue-600/5 dark:from-purple-400/10 dark:to-blue-400/10 rounded-2xl"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                    <div className={`relative z-10 transition-all duration-300 ease-out ${
                      pathname === "/agents" || pathname.startsWith("/agents/") ? "text-purple-600 dark:text-purple-400 drop-shadow-sm" : "text-slate-500 dark:text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-300 group-hover:drop-shadow-sm"
                    }`}>
                      <Bot size={18} />
                    </div>
                    <span className={`relative z-10 flex-1 font-semibold text-sm transition-all duration-300 ease-out tracking-wide ${
                      pathname === "/agents" || pathname.startsWith("/agents/") ? "text-purple-700 dark:text-purple-300" : "text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-slate-100"
                    }`}>Agents</span>
                    <motion.div
                      className="relative z-10 text-xs px-3 py-1.5 rounded-full font-semibold bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/60 dark:to-blue-900/60 text-purple-700 dark:text-purple-300 shadow-sm border border-purple-200/50 dark:border-purple-400/30"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <Sparkles size={10} className="inline mr-1" />
                      AI
                    </motion.div>
                  </Link>
                </motion.div>

                {/* Chat History */}
                <motion.div
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <button
                    onClick={() => setIsChatHistoryOpen(true)}
                    className="group flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ease-out relative overflow-hidden w-full hover:bg-gradient-to-r hover:from-slate-50/80 hover:via-blue-50/30 hover:to-slate-50/80 dark:hover:from-slate-800/60 dark:hover:via-slate-700/40 dark:hover:to-slate-800/60 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:shadow-lg hover:shadow-slate-200/30 dark:hover:shadow-slate-900/40 hover:border hover:border-slate-200/50 dark:hover:border-slate-600/50 hover:backdrop-blur-sm"
                  >
                    <div className="relative z-10 transition-all duration-300 ease-out text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-300 group-hover:drop-shadow-sm">
                      <Clock size={18} />
                    </div>
                    <span className="relative z-10 flex-1 font-semibold text-sm transition-all duration-300 ease-out tracking-wide text-left text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-slate-100">
                      Chat History
                    </span>
                    {chats.length > 0 && (
                      <motion.span
                        className="relative z-10 text-xs px-3 py-1.5 rounded-full font-semibold bg-slate-100/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 group-hover:bg-blue-100/80 dark:group-hover:bg-blue-900/40 group-hover:text-blue-700 dark:group-hover:text-blue-300 group-hover:shadow-sm backdrop-blur-sm group-hover:border group-hover:border-blue-200/30 dark:group-hover:border-blue-400/20 transition-all duration-300 ease-out"
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        {chats.length}
                      </motion.span>
                    )}
                  </button>
                </motion.div>
              </div>

              {/* Organization Management - Admin/Approver sections */}
              {(isAdmin() || isApprover()) && (
                <SidebarSection title="Organization">
                  {isAdmin() && (
                    <SidebarItem
                      icon={
                        <Home size={18} className={pathname === "/dashboard" ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground dark:text-slate-300"}/>
                      }
                      label="Dashboard"
                      active={pathname === "/dashboard"}
                      href="/dashboard"
                    />
                  )}
                  {isAdmin() && (
                    <SidebarItem
                      icon={
                        <Users size={18} className={pathname === "/organization/members" ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground dark:text-slate-300"}/>
                      }
                      label="Members"
                      active={pathname === "/organization/members"}
                      href="/organization/members"
                    />
                  )}
                  {isAdmin() && (
                    <SidebarItem
                      icon={
                        <Database size={18} className={pathname === "/projects" ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground dark:text-slate-300"}/>
                      }
                      label="Projects"
                      active={pathname === "/projects"}
                      href="/projects"
                    />
                  )}
                  {isApprover() && (
                    <SidebarItem
                      icon={
                        <UserCheck size={18} className={pathname === "/requests" ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground dark:text-slate-300"}/>
                      }
                      label="Requests"
                      active={pathname === "/requests"}
                      href="/requests"
                    />
                  )}
                </SidebarSection>
              )}

              {/* System Administration - Admin-only sections */}
              {isAdmin() && (
                <SidebarSection title="System Administration">
                  <SidebarItem
                    icon={
                      <Database size={18} className={pathname === "/data-ingestion" ? "text-orange-800 dark:text-orange-400" : "text-muted-foreground dark:text-slate-300"}/>
                    }
                    label="Data Ingestion"
                    active={pathname === "/data-ingestion"}
                    href="/data-ingestion"
                  />
                  <SidebarItem
                    icon={
                      <Clock size={18} className={pathname === "/periodic-ingestion" ? "text-primary-foreground dark:text-blue-300" : "text-muted-foreground dark:text-slate-300"} />
                    }
                    label="Periodic Ingestion"
                    active={pathname === "/periodic-ingestion"}
                    href="/periodic-ingestion"
                  />
                  <SidebarItem
                    icon={
                      <BarChart size={18} className={pathname === "/metrics-dashboard" ? "text-primary-foreground dark:text-blue-300" : "text-muted-foreground dark:text-slate-300"} />
                    }
                    label="Metrics Dashboard"
                    active={pathname === "/metrics-dashboard"}
                    href="/metrics-dashboard"
                  />
                  <SidebarItem
                    icon={
                      <FileText size={18} className={pathname === "/annotations" ? "text-primary-foreground" : "text-muted-foreground"} />
                    }
                    label="Annotations"
                    active={pathname === "/annotations"}
                    href="/annotations"
                  />
                  <SidebarItem
                    icon={
                      <Share2 size={18} className={pathname === "/relationship-graph" ? "text-primary-foreground dark:text-blue-300" : "text-muted-foreground dark:text-slate-300"} />
                    }
                    label="Relationship Graph"
                    active={pathname === "/relationship-graph"}
                    href="/relationship-graph"
                  />
                </SidebarSection>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="collapsed-icons"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 flex flex-col items-center pt-2"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/chat"
                    onClick={() => {
                      const { addChat } = useChatHistoryStore.getState();
                      addChat({ title: "New Chat" });
                    }}
                    className={`p-2 rounded-md transition-colors ${
                      pathname === "/chat" && !pathname.includes("?id=")
                        ? "bg-orange-100"
                        : "hover:bg-secondary/50"
                    }`}
                  >
                    <Pencil size={16} className={pathname === "/chat" && !pathname.includes("?id=") ? "text-orange-800 dark:text-orange-400" : "text-muted-foreground dark:text-slate-300"} />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">New Chat</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setIsChatHistoryOpen(true)}
                    className="p-2 rounded-md transition-colors hover:bg-secondary/50 cursor-pointer"
                  >
                    <Clock size={16} className="text-muted-foreground dark:text-slate-300" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Chats</TooltipContent>
              </Tooltip>

              {/* Agent Marketplace in collapsed mode */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/agents"
                    className={`p-3 rounded-xl transition-all duration-300 ease-out ${
                      pathname === "/agents" || pathname.startsWith("/agents/")
                        ? "bg-gradient-to-r from-purple-100/80 via-blue-50/60 to-purple-50/80 dark:from-purple-900/40 dark:via-blue-900/30 dark:to-purple-800/40 shadow-lg shadow-purple-200/30 dark:shadow-purple-900/20 border border-purple-200/50 dark:border-purple-700/50"
                        : "hover:bg-gradient-to-r hover:from-slate-50/80 hover:via-purple-50/30 hover:to-slate-50/80 dark:hover:from-slate-800/60 dark:hover:via-slate-700/40 dark:hover:to-slate-800/60 hover:shadow-md"
                    }`}
                  >
                    <Bot size={18} className={pathname === "/agents" || pathname.startsWith("/agents/") ? "text-purple-600 dark:text-purple-400" : "text-muted-foreground dark:text-slate-300"} />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <div className="flex items-center gap-2">
                    <Sparkles size={12} className="text-purple-500" />
                    <span>Agent Marketplace</span>
                  </div>
                </TooltipContent>
              </Tooltip>

              {/* Organization icons in collapsed mode */}
              {(isAdmin() || isApprover()) && (
                <>
                  {isAdmin() && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href="/dashboard"
                          className={`p-3 rounded-xl transition-all duration-300 ease-out ${
                            pathname === "/dashboard"
                              ? "bg-gradient-to-r from-indigo-100/80 via-blue-50/60 to-indigo-50/80 dark:from-indigo-900/40 dark:via-blue-900/30 dark:to-indigo-800/40 shadow-lg shadow-indigo-200/30 dark:shadow-indigo-900/20 border border-indigo-200/50 dark:border-indigo-700/50"
                              : "hover:bg-gradient-to-r hover:from-slate-50/80 hover:via-indigo-50/30 hover:to-slate-50/80 dark:hover:from-slate-800/60 dark:hover:via-slate-700/40 dark:hover:to-slate-800/60 hover:shadow-md"
                          }`}
                        >
                          <Home size={18} className={pathname === "/dashboard" ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground dark:text-slate-300"} />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">Dashboard</TooltipContent>
                    </Tooltip>
                  )}
                  {isAdmin() && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href="/organization/members"
                          className={`p-3 rounded-xl transition-all duration-300 ease-out ${
                            pathname === "/organization/members"
                              ? "bg-gradient-to-r from-indigo-100/80 via-blue-50/60 to-indigo-50/80 dark:from-indigo-900/40 dark:via-blue-900/30 dark:to-indigo-800/40 shadow-lg shadow-indigo-200/30 dark:shadow-indigo-900/20 border border-indigo-200/50 dark:border-indigo-700/50"
                              : "hover:bg-gradient-to-r hover:from-slate-50/80 hover:via-indigo-50/30 hover:to-slate-50/80 dark:hover:from-slate-800/60 dark:hover:via-slate-700/40 dark:hover:to-slate-800/60 hover:shadow-md"
                          }`}
                        >
                          <Users size={18} className={pathname === "/organization/members" ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground dark:text-slate-300"} />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">Members</TooltipContent>
                    </Tooltip>
                  )}
                  {isAdmin() && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href="/projects"
                          className={`p-3 rounded-xl transition-all duration-300 ease-out ${
                            pathname === "/projects"
                              ? "bg-gradient-to-r from-indigo-100/80 via-blue-50/60 to-indigo-50/80 dark:from-indigo-900/40 dark:via-blue-900/30 dark:to-indigo-800/40 shadow-lg shadow-indigo-200/30 dark:shadow-indigo-900/20 border border-indigo-200/50 dark:border-indigo-700/50"
                              : "hover:bg-gradient-to-r hover:from-slate-50/80 hover:via-indigo-50/30 hover:to-slate-50/80 dark:hover:from-slate-800/60 dark:hover:via-slate-700/40 dark:hover:to-slate-800/60 hover:shadow-md"
                          }`}
                        >
                          <Database size={18} className={pathname === "/projects" ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground dark:text-slate-300"} />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">Projects</TooltipContent>
                    </Tooltip>
                  )}
                  {isApprover() && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href="/requests"
                          className={`p-3 rounded-xl transition-all duration-300 ease-out ${
                            pathname === "/requests"
                              ? "bg-gradient-to-r from-indigo-100/80 via-blue-50/60 to-indigo-50/80 dark:from-indigo-900/40 dark:via-blue-900/30 dark:to-indigo-800/40 shadow-lg shadow-indigo-200/30 dark:shadow-indigo-900/20 border border-indigo-200/50 dark:border-indigo-700/50"
                              : "hover:bg-gradient-to-r hover:from-slate-50/80 hover:via-indigo-50/30 hover:to-slate-50/80 dark:hover:from-slate-800/60 dark:hover:via-slate-700/40 dark:hover:to-slate-800/60 hover:shadow-md"
                          }`}
                        >
                          <UserCheck size={18} className={pathname === "/requests" ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground dark:text-slate-300"} />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">Requests</TooltipContent>
                    </Tooltip>
                  )}
                </>
              )}

              {/* System Administration icons in collapsed mode */}
              {isAdmin() && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href="/data-ingestion"
                        className={`p-2 rounded-md transition-colors ${
                          pathname === "/data-ingestion"
                            ? "bg-orange-100"
                            : "hover:bg-secondary/50"
                        }`}
                      >
                        <Database size={18} className={pathname === "/data-ingestion" ? "text-orange-800 dark:text-orange-400" : "text-muted-foreground dark:text-slate-300"} />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">Data Ingestion</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href="/periodic-ingestion"
                        className={`p-2 rounded-md transition-colors ${
                          pathname === "/periodic-ingestion"
                            ? "bg-orange-100"
                            : "hover:bg-secondary/50"
                        }`}
                      >
                        <Clock size={18} className={pathname === "/periodic-ingestion" ? "text-orange-800 dark:text-orange-400" : "text-muted-foreground dark:text-slate-300"} />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">Periodic Ingestion</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href="/metrics-dashboard"
                        className={`p-2 rounded-md transition-colors ${
                          pathname === "/metrics-dashboard"
                            ? "bg-orange-100"
                            : "hover:bg-secondary/50"
                        }`}
                      >
                        <BarChart size={18} className={pathname === "/metrics-dashboard" ? "text-orange-800 dark:text-orange-400" : "text-muted-foreground dark:text-slate-300"} />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">Metrics Dashboard</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href="/annotations"
                        className={`p-2 rounded-md transition-colors ${
                          pathname === "/annotations"
                            ? "bg-primary"
                            : "hover:bg-secondary/50"
                        }`}
                      >
                        <FileText size={18} className={pathname === "/annotations" ? "text-primary-foreground dark:text-blue-300" : "text-muted-foreground dark:text-slate-300"} />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">Annotations</TooltipContent>
                  </Tooltip>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Chat History Popup */}
      <ChatHistory 
        isOpen={isChatHistoryOpen} 
        onClose={() => setIsChatHistoryOpen(false)} 
      />
    </motion.div>
  );
}
