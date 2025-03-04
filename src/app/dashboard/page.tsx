"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [interests, setInterests] = useState<string[]>([]);

  useEffect(() => {
    // Check if user is authenticated
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // If authenticated, fetch interests from API
    if (status === "authenticated") {
      setLoading(true);
      
      // Fetch the user's interests from API
      fetch('/api/user/interests')
        .then(res => {
          if (!res.ok) {
            throw new Error('Failed to fetch interests');
          }
          return res.json();
        })
        .then(data => {
          if (data.interests && Array.isArray(data.interests)) {
            setInterests(data.interests);
          } else {
            // If no interests found, we should show the empty state
            setInterests([]);
          }
        })
        .catch(error => {
          console.error("Error fetching user interests:", error);
          // Fall back to localStorage for backward compatibility
          try {
            const analyticsData = localStorage.getItem("onboarding-analytics-logs");
            if (analyticsData) {
              const logs = JSON.parse(analyticsData);
              const completionLog = logs.find((log: any) => log.type === "onboarding_complete");
              
              if (completionLog && completionLog.selected_interests) {
                setInterests(completionLog.selected_interests);
              }
            }
          } catch (e) {
            // Ignore localStorage errors
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container flex justify-center py-3">
            <div className="flex items-center">
              <span className="mr-2">🗺️</span>
              <h1 className="font-semibold text-xl tracking-tight">Spots</h1>
            </div>
          </div>
        </header>
        
        <main className="container py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-full max-w-md" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex justify-between items-center py-3">
          <div className="flex items-center">
            <span className="mr-2">🗺️</span>
            <h1 className="font-semibold text-xl tracking-tight">Spots</h1>
          </div>
          <nav className="flex space-x-4">
            <Link href="/explore" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Explore
            </Link>
            <Link href="/profile" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Profile
            </Link>
          </nav>
        </div>
      </header>
      
      <main className="container py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, {session?.user?.name || "Friend"}!</h1>
          <p className="text-muted-foreground">
            Your personalized dashboard for discovering new spots based on your interests.
          </p>
          
          <div className="mt-8 space-y-6">
            {interests.length > 0 ? (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Your Interests</h2>
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest) => (
                    <div 
                      key={interest}
                      className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                    >
                      {interest}
                    </div>
                  ))}
                </div>
                
                <div className="pt-4">
                  <Link href="/onboarding">
                    <Button variant="outline" size="sm">
                      Update Interests
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-muted rounded-lg text-center space-y-4">
                <h2 className="text-xl font-semibold">Complete Your Profile</h2>
                <p className="text-muted-foreground">
                  Tell us about your interests to get personalized spot recommendations.
                </p>
                <Link href="/onboarding">
                  <Button>Set Up Your Interests</Button>
                </Link>
              </div>
            )}
            
            <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-card rounded-lg border shadow-sm">
                <h3 className="text-lg font-semibold mb-2">Your Recent Activity</h3>
                <p className="text-muted-foreground text-sm">
                  You haven't visited any spots yet. Start exploring!
                </p>
                <div className="mt-4">
                  <Link href="/explore">
                    <Button variant="secondary" size="sm">Explore Spots</Button>
                  </Link>
                </div>
              </div>
              
              <div className="p-6 bg-card rounded-lg border shadow-sm">
                <h3 className="text-lg font-semibold mb-2">Upcoming Events</h3>
                <p className="text-muted-foreground text-sm">
                  No upcoming events in your area yet.
                </p>
                <div className="mt-4">
                  <Button variant="secondary" size="sm" disabled>
                    Coming Soon
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 