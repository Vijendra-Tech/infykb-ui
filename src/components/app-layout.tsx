"use client";

import { ReactNode } from "react";
import { NavSidebar } from "./nav-sidebar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen w-full bg-background">
      <NavSidebar />
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
