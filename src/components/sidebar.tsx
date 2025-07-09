"use client";
import { useState } from "react";
import { useSidebar } from "@/context/sidebar-context";
import { useRoleStore } from "@/store/use-role-store";
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
        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
          active 
            ? "bg-orange-100 text-orange-800" 
            : "hover:bg-secondary/50"
        }`}
      >
        <div className={active ? "text-orange-800" : "text-muted-foreground"}>{icon}</div>
        <span className={`flex-1 ${active ? "font-medium text-orange-800" : ""}`}>{label}</span>
        {badge && (
          <span className="px-1.5 py-0.5 text-xs bg-white/20 text-white rounded-md">
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
            className={`flex justify-center items-center p-2 rounded-md transition-colors ${
              active 
                ? "bg-orange-100 text-orange-800" 
                : "hover:bg-secondary/50"
            }`}
          >
            <div className={active ? "text-orange-800" : "text-muted-foreground"}>{icon}</div>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">
          {label}
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
    <div className="space-y-1">
      <div className="flex items-center justify-between px-3 py-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
        <button
          className="h-5 w-5 rounded-md hover:bg-secondary/50 flex items-center justify-center"
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
            className="text-muted-foreground"
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
  const pathname = usePathname();
  const router = useRouter();
  const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(false);

  return (
    <motion.div
      className={`h-full ${
        collapsed ? "w-16" : "w-64"
      } border-r bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 ease-in-out relative`}
      animate={{ width: collapsed ? 70 : 240 }}
      transition={{ type: "spring", stiffness: 250, damping: 25, mass: 0.8 }}
    >
      <div className="h-14 px-4 flex items-center justify-between bg-gradient-to-r from-sidebar to-sidebar/95">
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
              className="p-2 rounded-full hover:bg-muted/30 ml-auto flex items-center justify-center"
              onClick={() => setCollapsed(true)}
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
              whileTap={{ scale: 0.9 }}
              aria-label="Collapse sidebar"
            >
              <X size={18} />
            </motion.button>
          </>
        )}
        {collapsed && (
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                className="p-2 rounded-full hover:bg-muted/30 mx-auto flex items-center justify-center"
                onClick={() => setCollapsed(false)}
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                whileTap={{ scale: 0.9 }}
                aria-label="Expand sidebar"
              >
                <Menu size={20} />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="right">Expand sidebar</TooltipContent>
          </Tooltip>
        )}
      </div>
      <div className="h-1 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/10"></div>

      <div className="flex-1 overflow-auto py-2 px-2">
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
                  icon={<Home size={18} className={pathname === "/" ? "text-primary" : "text-muted-foreground"} />} 
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
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname === "/chat" && !pathname.includes("?id=") ? "bg-orange-100 text-orange-800" : "bg-secondary/30 hover:bg-secondary/50"} border border-primary/10`}
                >
                  <div className={pathname === "/chat" && !pathname.includes("?id=") ? "text-orange-800" : "text-primary"}>
                    <Pencil size={16} />
                  </div>
                  <span className="flex-1 font-medium text-sm">New Chat</span>
                </Link>
                
                <button
                  onClick={() => setIsChatHistoryOpen(true)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors w-full hover:bg-secondary/50 cursor-pointer`}
                >
                  <div className="text-muted-foreground">
                    <Clock size={16} />
                  </div>
                  <span className="flex-1 font-medium text-sm text-left">Chats</span>
                </button>
              </div>

              {/* Admin-only sections */}
              {role === "Admin" && (
                <SidebarSection title="Administration">
                  <SidebarItem
                    icon={
                      <Database size={18} className={pathname === "/data-ingestion" ? "text-orange-800" : "text-muted-foreground"}/>
                    }
                    label="Data Ingestion"
                    active={pathname === "/data-ingestion"}
                    href="/data-ingestion"
                  />
                  <SidebarItem
                    icon={
                      <Clock size={18} className={pathname === "/periodic-ingestion" ? "text-primary-foreground" : "text-muted-foreground"} />
                    }
                    label="Periodic Ingestion"
                    active={pathname === "/periodic-ingestion"}
                    href="/periodic-ingestion"
                  />
                  <SidebarItem
                    icon={
                      <BarChart size={18} className={pathname === "/metrics-dashboard" ? "text-primary-foreground" : "text-muted-foreground"} />
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
                      <Share2 size={18} className={pathname === "/relationship-graph" ? "text-primary-foreground" : "text-muted-foreground"} />
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
                    <Pencil size={16} className={pathname === "/chat" && !pathname.includes("?id=") ? "text-orange-800" : "text-muted-foreground"} />
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
                    <Clock size={16} className="text-muted-foreground" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Chats</TooltipContent>
              </Tooltip>

              {/* Admin-only icons in collapsed mode */}
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
                        <Database size={18} className={pathname === "/data-ingestion" ? "text-orange-800" : "text-muted-foreground"} />
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
                        <Clock size={18} className={pathname === "/periodic-ingestion" ? "text-orange-800" : "text-muted-foreground"} />
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
                        <BarChart size={18} className={pathname === "/metrics-dashboard" ? "text-orange-800" : "text-muted-foreground"} />
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
                        <FileText size={18} className={pathname === "/annotations" ? "text-primary-foreground" : "text-muted-foreground"} />
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
