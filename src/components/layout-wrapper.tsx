"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useDexieAuthStore } from '@/store/use-dexie-auth-store';
import { SidebarProvider } from '@/context/sidebar-context';
import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const { user, initialize, isInitialized, isLoading } = useDexieAuthStore();
  
  // Initialize auth store and database on mount
  useEffect(() => {
    if (!isInitialized) {
      console.log('🚀 Layout wrapper initializing auth store...');
      initialize();
    }
  }, [initialize, isInitialized]);
  
  // Check if current route is an auth page
  const isAuthPage = pathname?.startsWith('/auth');
  
  // Show loading spinner during authentication initialization
  if (!isInitialized && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Initializing application...</p>
        </div>
      </div>
    );
  }
  
  // If it's an auth page, render without sidebar and header
  if (isAuthPage) {
    return <>{children}</>;
  }
  
  // For non-auth pages, render with conditional sidebar based on authentication
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        {user && <Sidebar />}
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto pt-4">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
