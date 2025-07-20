"use client";

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
  const { isAuthenticated } = useDexieAuthStore();
  
  // Check if current route is an auth page
  const isAuthPage = pathname?.startsWith('/auth');
  
  // If it's an auth page, render without sidebar and header
  if (isAuthPage) {
    return <>{children}</>;
  }
  
  // For non-auth pages, render with conditional sidebar based on authentication
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        {isAuthenticated() && <Sidebar />}
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
