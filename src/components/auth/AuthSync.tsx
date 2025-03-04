"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useAuthStore } from '@/lib/store';

/**
 * AuthSync is a component that syncs NextAuth session state
 * with our Zustand store, without using React Context.
 * 
 * Place this component near the root of your app.
 */
export function AuthSync() {
  const { data: session, status } = useSession();
  const { setUser, setAuthenticated, setLoading } = useAuthStore();
  const [authTimeout, setAuthTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Effect to clear loading state after a timeout (fallback)
  useEffect(() => {
    // Set a maximum loading time of 3 seconds to prevent infinite loading
    const timeout = setTimeout(() => {
      if (status === 'loading') {
        console.warn('[AuthSync] Authentication loading timed out, forcing unauthenticated state');
        setLoading(false);
        setAuthenticated(false);
      }
    }, 3000);
    
    setAuthTimeout(timeout);
    
    return () => {
      if (authTimeout) clearTimeout(authTimeout);
    };
  }, [status]);
  
  useEffect(() => {
    // Update loading state based on NextAuth status
    setLoading(status === 'loading');
    
    // Update auth state when session changes
    if (status === 'authenticated' && session?.user) {
      // Clear any timeout if auth succeeds
      if (authTimeout) clearTimeout(authTimeout);
      
      setUser({
        id: session.user.id || 'unknown',
        name: session.user.name || undefined,
        email: session.user.email || undefined,
        image: session.user.image || undefined,
      });
      setAuthenticated(true);
    } else if (status === 'unauthenticated') {
      // Handle unauthenticated state explicitly
      if (authTimeout) clearTimeout(authTimeout);
      
      setUser(null);
      setAuthenticated(false);
    }
  }, [session, status, setUser, setAuthenticated, setLoading, authTimeout]);
  
  // This component doesn't render anything
  return null;
} 