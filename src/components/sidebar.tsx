"use client";
import { useState } from "react";
import { useSidebar } from "@/context/sidebar-context";
import { useRoleStore } from "@/store/use-role-store";
import { useDexieAuthStore } from "@/store/use-dexie-auth-store";
import { useChatHistoryStore } from "@/store/use-chat-history-store";
import { useDataIngestionStore } from "@/store/use-data-ingestion-store";
import { ChatHistory } from "@/components/chat-history";
import {
  BarChart,
  BotIcon,
  Clock,
  Database,
  FileText,
  Home,
  Menu,
  Pencil,
  Settings,
  Share2,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
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
      <Link
        href={href}
        className={`group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ease-out ${
          active 
            ? "bg-gradient-to-r from-indigo-100/80 via-blue-50/60 to-indigo-50/80 dark:from-indigo-900/40 dark:via-blue-900/30 dark:to-indigo-800/40 text-indigo-700 dark:text-indigo-300 shadow-lg shadow-indigo-200/30 dark:shadow-indigo-900/20 border border-indigo-200/50 dark:border-indigo-700/50 backdrop-blur-sm" 
            : "hover:bg-gradient-to-r hover:from-slate-50/80 hover:via-indigo-50/30 hover:to-slate-50/80 dark:hover:from-slate-800/60 dark:hover:via-slate-700/40 dark:hover:to-slate-800/60 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:shadow-md hover:shadow-slate-200/20 dark:hover:shadow-slate-900/30 hover:border hover:border-slate-200/40 dark:hover:border-slate-600/40 hover:backdrop-blur-sm"
        }`}
      >
        <div className={`transition-all duration-300 ease-out ${
          active ? "text-indigo-600 dark:text-indigo-400 drop-shadow-sm" : "text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 group-hover:drop-shadow-sm"
        }`}>
          {icon}
        </div>
        <span className={`flex-1 font-semibold text-sm transition-all duration-300 ease-out tracking-wide ${
          active ? "text-indigo-700 dark:text-indigo-300" : "text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-slate-100"
        }`}>{label}</span>
        {badge && (
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-all duration-300 ease-out ${
            active 
              ? "bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-900/60 dark:to-blue-900/60 text-indigo-700 dark:text-indigo-300 shadow-sm" 
              : "bg-slate-100/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-100/80 dark:group-hover:bg-indigo-900/40 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 group-hover:shadow-sm backdrop-blur-sm"
          }`}>
            {badge}
          </span>
        )}
      </Link>
    );
  } else {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={href}
            className={`flex justify-center items-center p-3 rounded-xl transition-all duration-300 ease-out ${
              active 
                ? "bg-gradient-to-r from-indigo-100/80 via-blue-50/60 to-indigo-50/80 dark:from-indigo-900/40 dark:via-blue-900/30 dark:to-indigo-800/40 text-indigo-600 dark:text-indigo-400 shadow-lg shadow-indigo-200/30 dark:shadow-indigo-900/20 border border-indigo-200/50 dark:border-indigo-700/50 backdrop-blur-sm" 
                : "hover:bg-gradient-to-r hover:from-slate-50/80 hover:via-indigo-50/30 hover:to-slate-50/80 dark:hover:from-slate-800/60 dark:hover:via-slate-700/40 dark:hover:to-slate-800/60 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:shadow-md hover:shadow-slate-200/20 dark:hover:shadow-slate-900/30 hover:border hover:border-slate-200/40 dark:hover:border-slate-600/40 hover:backdrop-blur-sm"
            }`}
          >
            <div className={`transition-all duration-300 ease-out ${
              active ? "text-indigo-600 dark:text-indigo-400 drop-shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:drop-shadow-sm"
            }`}>{icon}</div>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-700 dark:border-slate-300">
          <span className="font-medium">{label}</span>
          {badge && ` (${badge})`}
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
  const { role } = useRoleStore();
  const { isApprover } = useDexieAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(false);

  return (
    <motion.div
      className={`h-full ${
        collapsed ? "w-16" : "w-72"
      } border-r border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-b from-white via-slate-50/30 to-white dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900 flex flex-col transition-all duration-500 ease-out relative shadow-xl shadow-slate-200/20 dark:shadow-slate-900/40 backdrop-blur-sm`}
      animate={{ width: collapsed ? 70 : 288 }}
      transition={{ type: "spring", stiffness: 200, damping: 30, mass: 1 }}
    >
      <div className="h-18 px-6 flex items-center justify-between bg-gradient-to-r from-indigo-50/70 via-blue-50/50 to-slate-50/70 dark:from-slate-800/95 dark:via-indigo-900/40 dark:to-slate-800/95 border-b border-indigo-200/30 dark:border-slate-600/50 backdrop-blur-md">
        {!collapsed && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Logo size="md" variant="sidebar" />
            </motion.div>
            <motion.button
              className="p-2.5 rounded-xl hover:bg-white/60 dark:hover:bg-slate-700/60 hover:shadow-lg hover:shadow-indigo-200/20 dark:hover:shadow-slate-900/40 ml-auto flex items-center justify-center transition-all duration-300 ease-out backdrop-blur-sm border border-transparent hover:border-indigo-200/30 dark:hover:border-slate-600/30"
              onClick={() => setCollapsed(true)}
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
              whileTap={{ scale: 0.9 }}
              aria-label="Collapse sidebar"
            >
              <X size={18} className="text-slate-600 dark:text-slate-300" />
            </motion.button>
          </>
        )}
        {collapsed && (
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                className="p-2.5 rounded-xl hover:bg-white/60 dark:hover:bg-slate-700/60 hover:shadow-lg hover:shadow-indigo-200/20 dark:hover:shadow-slate-900/40 mx-auto flex items-center justify-center transition-all duration-300 ease-out backdrop-blur-sm border border-transparent hover:border-indigo-200/30 dark:hover:border-slate-600/30"
                onClick={() => setCollapsed(false)}
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                whileTap={{ scale: 0.9 }}
                aria-label="Expand sidebar"
              >
                <Menu size={20} className="text-slate-600 dark:text-slate-300" />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="right">Expand sidebar</TooltipContent>
          </Tooltip>
        )}
      </div>
      <div className="flex-1 overflow-auto py-6 px-4 bg-gradient-to-b from-white/80 via-indigo-50/20 to-slate-50/60 dark:from-slate-900/90 dark:via-slate-800/70 dark:to-slate-900/95 relative">
        <div className="space-y-1 mb-4">
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
                      className={`flex justify-center py-2 rounded-md transition-colors ${
                        pathname === "/" 
                          ? "bg-primary" 
                          : "hover:bg-secondary/50"
                      }`}
                    >
                      <Home size={18} className={pathname === "/" ? "text-primary-foreground" : "text-muted-foreground"} />
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
                  icon={<Home size={18} className={pathname === "/" ? "text-primary dark:text-blue-400" : "text-muted-foreground dark:text-slate-300"} />} 
                  label="Home" 
                  href="/"
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
              <div className="space-y-2 px-3 py-2">
                <Link
                  href="/chat"
                  onClick={() => {
                    const { addChat } = useChatHistoryStore.getState();
                    addChat({ title: "New Chat" });
                  }}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname === "/chat" && !pathname.includes("?id=") ? "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300" : "bg-secondary/30 dark:bg-slate-700/30 hover:bg-secondary/50 dark:hover:bg-slate-700/50"} border border-primary/10 dark:border-slate-600/30`}
                >
                  <div className={pathname === "/chat" && !pathname.includes("?id=") ? "text-orange-800 dark:text-orange-300" : "text-primary dark:text-blue-400"}>
                    <Pencil size={16} />
                  </div>
                  <span className="flex-1 font-medium text-sm text-slate-700 dark:text-slate-200">New Chat</span>
                </Link>
                
                <button
                  onClick={() => setIsChatHistoryOpen(true)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors w-full hover:bg-secondary/50 dark:hover:bg-slate-700/50 cursor-pointer`}
                >
                  <div className="text-muted-foreground dark:text-slate-400">
                    <Clock size={16} />
                  </div>
                  <span className="flex-1 font-medium text-sm text-left text-slate-700 dark:text-slate-200">Chats</span>
                </button>
              </div>

              {/* Organization Management - Admin/Approver sections */}
              {(role === "Admin" || isApprover()) && (
                <SidebarSection title="Organization">
                  {role === "Admin" && (
                    <SidebarItem
                      icon={
                        <Home size={18} className={pathname === "/dashboard" ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground dark:text-slate-300"}/>
                      }
                      label="Dashboard"
                      active={pathname === "/dashboard"}
                      href="/dashboard"
                    />
                  )}
                  {role === "Admin" && (
                    <SidebarItem
                      icon={
                        <Users size={18} className={pathname === "/organization/members" ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground dark:text-slate-300"}/>
                      }
                      label="Members"
                      active={pathname === "/organization/members"}
                      href="/organization/members"
                    />
                  )}
                  {role === "Admin" && (
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
              {role === "Admin" && (
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

              {/* Organization icons in collapsed mode */}
              {(role === "Admin" || isApprover()) && (
                <>
                  {role === "Admin" && (
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
                  {role === "Admin" && (
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
                  {role === "Admin" && (
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
              {role === "Admin" && (
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
