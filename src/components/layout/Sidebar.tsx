"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { House, Compass, MagnifyingGlass, Clock, Heart, Plus, Queue } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/lib/store';

interface NavItem {
  label: string;
  href: string;
  icon: typeof House;
}

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen } = useUIStore();
  
  const navItems: NavItem[] = [
    {
      label: 'Home',
      href: '/',
      icon: House,
    },
    {
      label: 'Search',
      href: '/search',
      icon: MagnifyingGlass,
    },
    {
      label: 'Discover',
      href: '/discover',
      icon: Compass,
    },
  ];

  const libraryItems: NavItem[] = [
    {
      label: 'Recently Played',
      href: '/history',
      icon: Clock,
    },
    {
      label: 'Liked Songs',
      href: '/liked',
      icon: Heart,
    },
    {
      label: 'Your Playlists',
      href: '/playlists',
      icon: Queue,
    },
  ];

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-30 h-full w-64 bg-background border-r transition-transform duration-300 lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex flex-col h-full px-3 py-4">
        <div className="mb-6 px-3">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-2xl">💿</span>
            <Link href="/">reso</Link>
          </h1>
        </div>
        
        <nav className="space-y-1 mb-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                pathname === item.href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              {React.createElement(item.icon, { size: 20, weight: "duotone" })}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        
        <div className="px-3 mb-2">
          <h2 className="text-sm font-semibold text-muted-foreground mb-2">Your Library</h2>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-muted-foreground">Playlists • Albums • Artists</span>
            <button className="text-muted-foreground hover:text-foreground">
              {React.createElement(Plus, { size: 16, weight: "duotone" })}
            </button>
          </div>
        </div>
        
        <nav className="space-y-1">
          {libraryItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                pathname === item.href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              {React.createElement(item.icon, { size: 20, weight: "duotone" })}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        
        <div className="mt-4 px-3 space-y-1">
          <h3 className="text-xs font-medium text-muted-foreground pt-3 border-t">Your Playlists</h3>
          {['Chill Vibes', 'Workout Mix', 'Study Focus'].map((playlist) => (
            <Link
              key={playlist}
              href={`/playlist/${playlist.toLowerCase().replace(/\s+/g, '-')}`}
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
            >
              <span>{playlist}</span>
            </Link>
          ))}
        </div>
        
        <div className="mt-auto px-3 py-4">
          <Link 
            href="/profile" 
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
              pathname === '/profile'
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-purple-600" />
            <span>Your Profile</span>
          </Link>
        </div>
      </div>
    </aside>
  );
} 