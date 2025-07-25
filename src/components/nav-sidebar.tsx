"use client";

import { useState } from "react";
import { 
  Home, 
  Database, 
  Clock, 
  BarChart3, 
  FileText,
  Menu,
  Briefcase,
  LayoutDashboard,
  Cpu
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const NavItem = ({ icon, label, active, onClick }: NavItemProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={`w-full p-3 flex justify-center items-center ${
            active 
              ? "bg-primary text-primary-foreground" 
              : "hover:bg-muted text-muted-foreground hover:text-foreground"
          } transition-colors`}
        >
          {icon}
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">
        {label}
      </TooltipContent>
    </Tooltip>
  );
};

export function NavSidebar() {
  const [activeItem, setActiveItem] = useState("home");

  return (
    <div className="h-full w-16 border-r border-border bg-background flex flex-col">
      <NavItem 
        icon={<Menu className="h-5 w-5" />} 
        label="Menu" 
        active={activeItem === "menu"}
        onClick={() => setActiveItem("menu")}
      />
      
      <div className="border-t border-border mt-1"></div>
      
      <NavItem 
        icon={<Home className="h-5 w-5" />} 
        label="Home" 
        active={activeItem === "home"}
        onClick={() => setActiveItem("home")}
      />
      
      <NavItem 
        icon={<Briefcase className="h-5 w-5" />} 
        label="Knowledge Base" 
        active={activeItem === "kb"}
        onClick={() => setActiveItem("kb")}
      />
      
      <NavItem 
        icon={<Cpu className="h-5 w-5" />} 
        label="Agent Chat" 
        active={activeItem === "agent-chat"}
        onClick={() => {
          setActiveItem("agent-chat");
          window.location.href = "/agent-chat";
        }}
      />
      
      <NavItem 
        icon={<Database className="h-5 w-5" />} 
        label="Data Sources" 
        active={activeItem === "data"}
        onClick={() => setActiveItem("data")}
      />
      
      <NavItem 
        icon={<Clock className="h-5 w-5" />} 
        label="History" 
        active={activeItem === "history"}
        onClick={() => setActiveItem("history")}
      />
      
      <NavItem 
        icon={<BarChart3 className="h-5 w-5" />} 
        label="Analytics" 
        active={activeItem === "analytics"}
        onClick={() => setActiveItem("analytics")}
      />
      
      <NavItem 
        icon={<FileText className="h-5 w-5" />} 
        label="Documents" 
        active={activeItem === "documents"}
        onClick={() => setActiveItem("documents")}
      />
      
      <div className="mt-auto">
        <NavItem 
          icon={<LayoutDashboard className="h-5 w-5" />} 
          label="Dashboard" 
          active={activeItem === "dashboard"}
          onClick={() => setActiveItem("dashboard")}
        />
      </div>
    </div>
  );
}
