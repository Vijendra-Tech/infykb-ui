"use client";
import { useState } from "react";
import { useSidebar } from "@/context/sidebar-context";
import { useDexieAuthStore } from "@/store/use-dexie-auth-store";
import { useChatHistoryStore } from "@/store/use-chat-history-store";
import {
  Home,
  Database,
  Users,
  FileText,
  Menu,
  X,
  Clock,
  Bot,
  BarChart,
  UserCheck,
  Search,
  Settings,
  Palette,
  ChevronUp,
  LogOut,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { AnimationToggle } from "@/components/animation-toggle";
import { ChatHistory } from "@/components/chat-history";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { InfinityKBLogoCompact } from "@/components/ui/infinity-kb-logo";

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
  onClick?: () => void;
  disabled?: boolean;
  disabledTooltip?: string;
}

const SidebarItem = ({
  icon,
  label,
  active,
  badge,
  href = "#",
  onClick,
  disabled = false,
  disabledTooltip,
}: SidebarItemProps) => {
  const { collapsed } = useSidebar();

  if (!collapsed) {
    const className = `group flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors duration-150 ease-out relative ${
      disabled
        ? "text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60"
        : active
        ? "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm border border-slate-300 dark:border-slate-600"
        : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
    }`;

    const content = (
      <>
        <div
          className={`${
            disabled
              ? "text-slate-400 dark:text-slate-500"
              : active
              ? "text-slate-700 dark:text-slate-300"
              : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300"
          }`}
        >
          {icon}
        </div>
        <span
          className={`text-sm font-medium ${
            disabled
              ? "text-slate-400 dark:text-slate-500"
              : active
              ? "text-slate-800 dark:text-slate-200"
              : "text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100"
          }`}
        >
          {label}
        </span>
        {badge && (
          <span
            className={`relative z-10 ml-auto text-xs px-1.5 py-0.5 rounded-full font-medium ${
              disabled
                ? "bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400"
                : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
            }`}
          >
            {badge}
          </span>
        )}
      </>
    );

    if (disabled) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={className}>{content}</div>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            className="bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 border-slate-700 dark:border-slate-300 shadow-lg"
          >
            {disabledTooltip || "Coming Soon"}
          </TooltipContent>
        </Tooltip>
      );
    }

    if (onClick) {
      return (
        <button
          onClick={(e) => {
            e.preventDefault();
            onClick();
          }}
          className={className}
          type="button"
        >
          {content}
        </button>
      );
    }

    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  const className = `group flex items-center justify-center w-10 h-10 rounded-md transition-colors duration-150 ease-out relative ${
    disabled
      ? "text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60"
      : active
      ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm border border-slate-300 dark:border-slate-600"
      : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
  }`;

  const content = (
    <>
      <div className={disabled ? "text-slate-400 dark:text-slate-500" : ""}>
        {icon}
      </div>
      {badge && (
        <span
          className={`absolute -top-1 -right-1 text-xs px-1.5 py-0.5 rounded-full font-medium ${
            disabled
              ? "bg-slate-400 dark:bg-slate-500 text-slate-300 dark:text-slate-400"
              : "bg-slate-600 dark:bg-slate-400 text-white dark:text-slate-900"
          }`}
        >
          {badge}
        </span>
      )}
    </>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {disabled ? (
          <div className={className}>{content}</div>
        ) : onClick ? (
          <button
            onClick={(e) => {
              e.preventDefault();
              onClick();
            }}
            className={className}
            type="button"
          >
            {content}
          </button>
        ) : (
          <Link href={href} className={className}>
            {content}
          </Link>
        )}
      </TooltipTrigger>
      <TooltipContent
        side="right"
        className="bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 border-slate-700 dark:border-slate-300 shadow-lg"
      >
        {disabled ? disabledTooltip || "Coming Soon" : label}
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

export const Sidebar = () => {
  const { collapsed, setCollapsed } = useSidebar();
  const { user, isAuthenticated, logout, isAdmin, isApprover, isMember } =
    useDexieAuthStore();
  const { chats, addChat } = useChatHistoryStore();
  const pathname = usePathname();
  const router = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCollapsedUserMenuOpen, setIsCollapsedUserMenuOpen] = useState(false);

  // Custom logout handler that navigates to login page
  const handleLogout = async () => {
    try {
      await logout();
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Navigate to login even if logout fails
      router.push("/auth/login");
    }
  };

  return (
    <div
      className={`h-full transition-all duration-300 ease-out ${
        collapsed ? "w-16" : "w-72"
      } border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 flex flex-col relative shadow-lg shadow-slate-200/20 dark:shadow-slate-900/30`}
    >
      {/* Header */}
      <div className="h-18 px-6 flex items-center justify-between bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-100/30 dark:bg-slate-800/30" />

        <div className="relative z-10">
          <InfinityKBLogoCompact size="md" />
        </div>

        {!collapsed && (
          <button
            onClick={() => {
              console.log("Collapse button clicked");
              setCollapsed(true);
            }}
            className="relative z-20 p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="Collapse sidebar"
            type="button"
          >
            <X className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </button>
        )}

        {collapsed && (
          <button
            onClick={() => {
              console.log("Expand button clicked");
              setCollapsed(false);
            }}
            className="absolute top-1/2 -translate-y-1/2 right-2 p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors z-20 cursor-pointer"
            title="Expand sidebar"
            type="button"
          >
            <Menu className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto py-6 px-4 bg-white dark:bg-slate-950 relative">
        <div className="absolute inset-0 bg-slate-50/20 dark:bg-slate-900/20" />
        {!collapsed && (
          <SidebarSection title="Main">
            <SidebarItem
              icon={<Home className="h-5 w-5" />}
              label="Home"
              active={pathname === "/"}
              href="/"
            />
            <SidebarItem
              icon={<Bot className="h-5 w-5" />}
              label="Chat"
              active={pathname === "/chat"}
              href="/chat"
            />
            <SidebarItem
              icon={<Clock className="h-5 w-5" />}
              label="Chat History"
              active={false}
              href="#"
              badge={chats.length > 0 ? chats.length.toString() : undefined}
              disabled={true}
              disabledTooltip="Coming Soon"
            />
          </SidebarSection>
        )}

        {/* Issue Search Navigation */}
        {!collapsed && (
          <SidebarSection title="Search">
            <SidebarItem
              icon={<Search className="h-5 w-5" />}
              label="Issue Search"
              active={false}
              href="#"
              disabled={true}
              disabledTooltip="Coming Soon"
            />
          </SidebarSection>
        )}

        {!collapsed && isMember() && (
          <SidebarSection title="Workspace">
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
          </SidebarSection>
        )}

        {!collapsed && (isAdmin() || isApprover()) && (
          <SidebarSection title="Management">
            <SidebarItem
              icon={<BarChart className="h-5 w-5" />}
              label="Dashboard"
              active={pathname === "/dashboard"}
              href="/dashboard"
            />
            <SidebarItem
              icon={<Activity className="h-5 w-5" />}
              label="API Logs"
              active={pathname === "/logs"}
              href="/logs"
            />
            <SidebarItem
              icon={<Users className="h-5 w-5" />}
              label="Organization"
              active={false}
              href="#"
              disabled={true}
              disabledTooltip="Coming Soon"
            />
            <SidebarItem
              icon={<UserCheck className="h-5 w-5" />}
              label="Requests"
              active={false}
              href="#"
              disabled={true}
              disabledTooltip="Coming Soon"
            />
          </SidebarSection>
        )}

        {collapsed && (
          <div className="flex flex-col items-center space-y-2">
            <SidebarItem
              icon={<Home className="h-5 w-5" />}
              label="Home"
              active={pathname === "/"}
              href="/"
            />
            <SidebarItem
              icon={<Bot className="h-5 w-5" />}
              label="Chat"
              active={pathname === "/chat"}
              href="/chat"
            />
            <SidebarItem
              icon={<Search className="h-5 w-5" />}
              label="Issue Search"
              active={false}
              href="#"
              disabled={true}
              disabledTooltip="Coming Soon"
            />
            <SidebarItem
              icon={<Clock className="h-5 w-5" />}
              label="Chat History"
              badge={chats.length > 0 ? chats.length.toString() : undefined}
              disabled={true}
              disabledTooltip="Coming Soon"
            />
            {isMember() && (
              <>
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
              </>
            )}
            {(isAdmin() || isApprover()) && (
              <>
                <SidebarItem
                  icon={<BarChart className="h-5 w-5" />}
                  label="Dashboard"
                  active={pathname === "/dashboard"}
                  href="/dashboard"
                />
                <SidebarItem
                  icon={<Users className="h-5 w-5" />}
                  label="Organization"
                  active={false}
                  href="#"
                  disabled={true}
                  disabledTooltip="Coming Soon"
                />
                <SidebarItem
                  icon={<UserCheck className="h-5 w-5" />}
                  label="Requests"
                  active={false}
                  href="#"
                  disabled={true}
                  disabledTooltip="Coming Soon"
                />
              </>
            )}
            <SidebarItem
              icon={<Clock className="h-5 w-5" />}
              label="Chat History"
              active={pathname === "/chat-history"}
              badge={chats.length > 0 ? chats.length.toString() : undefined}
              href="/chat-history"
              disabled={true}
              disabledTooltip="Coming Soon" 
            />
          </div>
        )}
      </div>

      {/* Bottom Corner User Menu */}
      {user && (
        <div className="mt-auto border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
          {!collapsed ? (
            /* Expanded User Menu */
            <DropdownMenu
              open={isUserMenuOpen}
              onOpenChange={setIsUserMenuOpen}
            >
              <DropdownMenuTrigger asChild>
                <button
                  className="w-full p-4 flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                  onClick={() => {
                    console.log(
                      "User menu button clicked, current state:",
                      isUserMenuOpen
                    );
                    setIsUserMenuOpen(!isUserMenuOpen);
                  }}
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-slate-700 dark:text-slate-300 text-sm">
                      {user?.name}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs capitalize">
                      {user?.role?.replace("_", " ")}
                    </div>
                  </div>
                  <ChevronUp className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                className="w-56 mb-2 ml-4"
              >
                <div className="p-2 space-y-2">
                  <div className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex items-center">
                      <Palette className="h-4 w-4 mr-2 text-slate-600 dark:text-slate-400" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Theme
                      </span>
                    </div>
                    <ModeToggle />
                  </div>
                  <div className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex items-center">
                      <Settings className="h-4 w-4 mr-2 text-slate-600 dark:text-slate-400" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Animation
                      </span>
                    </div>
                    <AnimationToggle />
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* Collapsed User Menu */
            <DropdownMenu
              open={isCollapsedUserMenuOpen}
              onOpenChange={setIsCollapsedUserMenuOpen}
            >
              <DropdownMenuTrigger asChild>
                <button
                  className="w-full p-2 flex justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  onClick={() => {
                    console.log(
                      "Collapsed user menu button clicked, current state:",
                      isCollapsedUserMenuOpen
                    );
                    setIsCollapsedUserMenuOpen(!isCollapsedUserMenuOpen);
                  }}
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="right"
                align="end"
                className="w-56 mb-2"
              >
                <div className="px-2 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                  {user?.name}
                </div>
                <div className="px-2 pb-2 text-xs text-slate-500 dark:text-slate-400 capitalize">
                  {user?.role?.replace("_", " ")}
                </div>
                <DropdownMenuSeparator />
                <div className="p-2 space-y-2">
                  <div className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex items-center">
                      <Palette className="h-4 w-4 mr-2 text-slate-600 dark:text-slate-400" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Theme
                      </span>
                    </div>
                    <ModeToggle />
                  </div>
                  <div className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex items-center">
                      <Settings className="h-4 w-4 mr-2 text-slate-600 dark:text-slate-400" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Animation
                      </span>
                    </div>
                    <AnimationToggle />
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}
    </div>
  );
};
