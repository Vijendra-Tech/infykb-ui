"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  User, 
  LogOut, 
  HelpCircle, 
  ShieldCheck, 
  Edit3,
  Settings
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRoleStore, Role as RoleType } from "@/store/use-role-store";

interface UserProfileDropdownProps {
  userEmail: string;
  userName: string;
}

interface Role {
  id: RoleType;
  name: string;
  icon: React.ReactNode;
  description: string;
};

export function UserProfileDropdown({ 
  userName, 
  userEmail 
}: UserProfileDropdownProps) {
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const { role: currentRole, setRole } = useRoleStore();
  
  const roles: Role[] = [
    {
      id: "Admin",
      name: "Admin",
      icon: <ShieldCheck className="h-5 w-5 text-primary" />,
      description: "Full access to all settings and content"
    },
    {
      id: "Editor",
      name: "Editor",
      icon: <Edit3 className="h-5 w-5 text-blue-500" />,
      description: "Can create and edit content"
    }
  ];
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full bg-orange-500 text-white hover:bg-orange-600">
            <User className="h-5 w-5" />
            <span className="sr-only">Profile</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[300px] p-0">
          <div className="p-4 bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-medium">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-muted-foreground">{userEmail}</p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">{currentRole}</div>
            </div>
            <div className="mt-3 space-y-2">
              <Button 
                className="w-full" 
                variant="default"
                onClick={() => setIsRoleDialogOpen(true)}
              >
                Switch Role
              </Button>
            </div>
          </div>
          <DropdownMenuSeparator />
          <div className="flex items-center justify-between px-2 py-1.5">
            <span className="text-sm">Language</span>
            <div className="flex items-center gap-1 text-sm">
              <span>English</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <Link href="/settings">
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
            <HelpCircle className="h-4 w-4" />
            <span>Help center</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-red-500 hover:text-red-600">
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Switch Role</DialogTitle>
            <DialogDescription>
              Select a role to switch to. Your permissions will change based on the selected role.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {roles.map((role) => (
              <div
                key={role.id}
                className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-colors ${currentRole === role.id ? 'border-primary bg-primary/5' : 'border-input hover:bg-muted/50'}`}
                onClick={() => {
                  setRole(role.id);
                  setIsRoleDialogOpen(false);
                }}
              >
                <div className="flex-shrink-0">
                  {role.icon}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{role.name}</span>
                  <span className="text-xs text-muted-foreground">{role.description}</span>
                </div>
                {currentRole === role.name && (
                  <div className="ml-auto h-2 w-2 rounded-full bg-primary"></div>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
