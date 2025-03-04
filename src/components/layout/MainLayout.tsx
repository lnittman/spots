"use client";

import React from 'react';
import { Sidebar } from './Sidebar';
import { List, User, SignOut } from '@phosphor-icons/react';
import { useUIStore, useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOut, signIn } from 'next-auth/react';
import Link from 'next/link';

interface MainLayoutProps {
  children: React.ReactNode;
}

function MobileHeader() {
  const { toggleSidebar } = useUIStore();
  const { user, isAuthenticated } = useAuthStore();
  
  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-background border-b z-20 px-4 flex items-center justify-between">
      {isAuthenticated ? (
        <button 
          className="text-foreground p-2 rounded-md"
          onClick={toggleSidebar}
          aria-label="Menu"
        >
          {React.createElement(List, { size: 24, weight: "duotone" })}
        </button>
      ) : (
        <div></div> // Empty div to maintain flex layout
      )}
      
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <span className="text-2xl font-bold" aria-label="reso logo">reso</span>
      </div>
      
      {isAuthenticated ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full overflow-hidden h-8 w-8">
              <Avatar>
                <AvatarImage src={user?.image || undefined} alt={user?.name || 'User'} />
                <AvatarFallback>
                  {user?.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="flex items-center gap-2">
              <span className="text-xl">💿</span>
              <span>reso</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => signIn()}
        >
          Sign in
        </Button>
      )}
    </header>
  );
}

function DesktopHeader() {
  const { user, isAuthenticated } = useAuthStore();
  
  return (
    <header className="hidden lg:flex h-14 bg-background border-b fixed top-0 right-0 left-64 z-10 px-8 items-center justify-end">
      {isAuthenticated ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 hover:bg-accent p-2 rounded-md">
              <Avatar>
                <AvatarImage src={user?.image || undefined} alt={user?.name || 'User'} />
                <AvatarFallback>
                  {user?.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline-block">{user?.name || 'Account'}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="flex items-center gap-2">
              <span className="text-xl">💿</span>
              <span>reso</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>
              <div className="flex items-center gap-2">
                {React.createElement(SignOut, { size: 16 })}
                <span>Sign out</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button onClick={() => signIn()} className="gap-2">
          {React.createElement(User, { size: 16 })}
          <span>Sign in</span>
        </Button>
      )}
    </header>
  );
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { isSidebarOpen } = useUIStore();
  const { isAuthenticated } = useAuthStore();
  
  return (
    <div className="flex min-h-screen bg-background">
      {isAuthenticated && <Sidebar />}
      
      {/* Mobile overlay when sidebar is open */}
      {isAuthenticated && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => useUIStore.getState().toggleSidebar()}
        />
      )}
      
      <MobileHeader />
      <DesktopHeader />
      
      <main className={cn(
        "flex-1 pt-14",
        isAuthenticated && "lg:pl-64"
      )}>
        <div className="container max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
} 