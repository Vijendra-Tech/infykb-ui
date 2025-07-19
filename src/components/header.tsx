"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Search, Edit, Sparkles, RefreshCcw, History, Menu, X, Home, BotIcon, Database, Clock, BarChart, FileText, Settings } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { UserProfileDropdown } from "@/components/user-profile-dropdown";
import { useSidebar } from "@/context/sidebar-context";
import { Logo } from "@/components/ui/logo";
import { ChatHistory } from "@/components/chat-history";
import { useChatHistoryStore } from "@/store/use-chat-history-store";
import { useRoleStore } from "@/store/use-role-store";
import { motion, AnimatePresence } from "framer-motion";

interface MobileMenuItemProps {
  icon: React.ReactNode;
  label: string;
  href?: string;
  active?: boolean;
  badge?: string;
  onClick?: () => void;
}

function MobileMenuItem({ icon, label, href, active, badge, onClick }: MobileMenuItemProps) {
  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 }
  };
  
  const content = (
    <motion.div
      className={`flex items-center gap-3 px-3 py-2 rounded-md ${active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
      variants={itemVariants}
      whileHover={{ backgroundColor: active ? undefined : 'var(--muted)' }}
      whileTap={{ scale: 0.98 }}
    >
      <span className={active ? 'text-primary-foreground' : 'text-muted-foreground'}>
        {icon}
      </span>
      <span className="font-medium">{label}</span>
      {badge && (
        <span className="ml-auto text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </motion.div>
  );
  
  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  
  return <button onClick={onClick} className="w-full text-left">{content}</button>;
}

export function Header() {
  const { collapsed } = useSidebar();
  const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { addChat } = useChatHistoryStore();
  const { role } = useRoleStore();
  
  // Handle responsive view detection
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
  
  // Close mobile menu when navigating
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="h-14 border-b border-border bg-background flex items-center px-4 sticky top-0 z-20" style={{ minHeight: '3.5rem', maxHeight: '3.5rem' }}>
        {collapsed && (
          <div className="mr-4">
            <Logo size="sm" variant="default" />
          </div>
        )}
        <div className="flex-1 flex justify-center"></div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={() => setIsChatHistoryOpen(!isChatHistoryOpen)}
          >
            <History className="h-5 w-5" />
            <span className="sr-only">Chat History</span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={() => {
              addChat({ title: "New Chat" });
              router.push("/chat");
            }}
          >
            <Edit className="h-5 w-5" />
            <span className="sr-only">New Chat</span>
          </Button>
          <ModeToggle />
          <UserProfileDropdown
            userName="Vijendra Rana"
            userEmail="vijendra.rana@globallogic.com"
          />
        </div>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={() => setIsChatHistoryOpen(!isChatHistoryOpen)}
          >
            <History className="h-5 w-5" />
            <span className="sr-only">Chat History</span>
          </Button>
          <motion.button
            className="p-2 rounded-md hover:bg-muted transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
      </header>
      
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-10 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div 
              className="fixed right-0 top-14 bottom-auto rounded-bl-lg bg-background border-l border-b shadow-lg p-4"
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 250, mass: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* X icon removed */}
              <div className="w-60">
                <motion.div
                  className="flex flex-col space-y-3"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: {
                      transition: {
                        staggerChildren: 0.05
                      }
                    }
                  }}
                >
                  {/* Header Menu Items Only */}
                  <MobileMenuItem 
                    icon={<History size={18} />} 
                    label="Chat History" 
                    onClick={() => {
                      setIsChatHistoryOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                  />
                  <MobileMenuItem 
                    icon={<Edit size={18} />} 
                    label="New Chat" 
                    onClick={() => {
                      addChat({ title: "New Chat" });
                      router.push("/chat");
                      setIsMobileMenuOpen(false);
                    }}
                  />
                  {/* Premium features menu item removed */}
                  
                  <MobileMenuItem 
                    icon={<Settings size={18} />} 
                    label="Settings" 
                    href="/settings"
                    active={pathname === "/settings"}
                  />
                  
                  <div className="h-px bg-border my-1" />
                  
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-sm font-medium">Theme</span>
                    <ModeToggle />
                  </div>
                  
                  <div className="h-px bg-border my-1" />
                  
                  <div>
                    <UserProfileDropdown
                      userName="Vijendra Rana"
                      userEmail="vijendra.rana@globallogic.com"
                    />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Chat History Popup */}
      <ChatHistory 
        isOpen={isChatHistoryOpen} 
        onClose={() => setIsChatHistoryOpen(false)} 
      />
    </>
  );
}
