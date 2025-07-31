"use client";

import { useSidebar } from "@/context/sidebar-context";
import { Logo } from "@/components/ui/logo";

export function Header() {
  const { collapsed } = useSidebar();

  return (
    <header className="h-14 border-b border-border bg-background flex items-center px-4 sticky top-0 z-20" style={{ minHeight: '3.5rem', maxHeight: '3.5rem' }}>
      {collapsed && (
        <div className="mr-4">
          <Logo size="sm" variant="default" />
        </div>
      )}
    </header>
  );
}
