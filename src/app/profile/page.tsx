"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InterestTile } from "@/components/interest-tile";
import { enhanceInterest } from "@/lib/interest-utils";
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog";
import { EditInterestsDialog } from "@/components/edit-interests-dialog";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [interests, setInterests] = useState<string[]>([]);
  const [profileData, setProfileData] = useState<any>({});
  
  useEffect(() => {
    // Check if user is authenticated
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      setLoading(true);
      // Fetch user interests
      Promise.all([
        fetch('/api/user/interests')
          .then(res => {
            if (!res.ok) {
              // Only throw if it's not an auth error, as that will be handled by NextAuth
              if (res.status !== 401) {
                throw new Error(`Failed to fetch interests: ${res.status}`);
              }
              return { interests: [] };
            }
            return res.json();
          }),
        fetch('/api/user/profile')
          .then(res => {
            if (!res.ok) {
              // Only throw if it's not an auth error, as that will be handled by NextAuth
              if (res.status !== 401) {
                throw new Error(`Failed to fetch profile: ${res.status}`);
              }
              return { profile: {} };
            }
            return res.json();
          })
      ])
        .then(([interestsData, profileData]) => {
          if (interestsData.interests && Array.isArray(interestsData.interests)) {
            setInterests(interestsData.interests);
          }
          
          if (profileData.profile) {
            setProfileData(profileData.profile);
          }
        })
        .catch(error => {
          console.error("Error fetching user data:", error);
          // Try localStorage fallback for interests
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
  
  // Function to refresh profile data
  const refreshProfileData = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        if (data.profile) {
          setProfileData(data.profile);
        }
      }
    } catch (error) {
      console.error("Error refreshing profile data:", error);
    }
  };
  
  // Refresh interests data
  const refreshInterestsData = async () => {
    try {
      const response = await fetch('/api/user/interests');
      if (response.ok) {
        const data = await response.json();
        if (data.interests && Array.isArray(data.interests)) {
          setInterests(data.interests);
        }
      }
    } catch (error) {
      console.error("Error refreshing interest data:", error);
    }
  };

  // Handle saving updated interests and location
  const handleSaveInterests = async (newInterests: string[], newLocation: string, newFavoriteCities?: string[]) => {
    try {
      // Save interests via API
      const response = await fetch('/api/user/interests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interests: newInterests,
          location: newLocation,
          favoriteCities: newFavoriteCities || []
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save interests');
      }
      
      // Update local state
      setInterests(newInterests);
      
      // Refresh profile data to get updated location and favorite cities
      await refreshProfileData();
    } catch (error) {
      console.error("Error saving interests:", error);
    }
  };
  
  // Handle user logout
  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      router.push('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
          <div className="container px-4 max-w-full flex justify-between items-center py-3">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center">
                <span className="mr-2">🗺️</span>
                <h1 className="font-semibold text-xl tracking-tight">Spots</h1>
              </Link>
            </div>
            <nav className="flex space-x-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </nav>
          </div>
        </header>
        
        <main className="container px-4 max-w-full py-6 max-w-4xl mx-auto">
          <div className="space-y-6">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-full max-w-md" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </main>
      </div>
    );
  }

  // Render interests section
  const renderInterests = () => {
    if (interests.length === 0) {
      return (
        <div className="bg-muted p-4 rounded-lg text-center">
          <p className="text-muted-foreground">No interests yet!</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => document.getElementById('edit-interests-dialog')?.click()}
          >
            Add Interests
          </Button>
        </div>
      );
    }
    
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Interests</h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => document.getElementById('edit-interests-dialog')?.click()}
          >
            Edit Interests
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {interests.map(interest => (
            <InterestTile 
              key={interest} 
              interest={enhanceInterest(interest)} 
              size="md"
              interactive={false}
            />
          ))}
        </div>
      </div>
    );
  };

  // Show the user's profile information
  const renderProfile = () => {
    return (
      <div className="grid gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold">
            {profileData.name || session?.user?.name || "Anonymous User"}
          </h2>
          {profileData.pronouns && (
            <p className="text-muted-foreground">{profileData.pronouns}</p>
          )}
          {profileData.emoji && (
            <div className="text-3xl my-2">{profileData.emoji}</div>
          )}
          {profileData.location && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{profileData.location}</span>
            </div>
          )}
        </div>
        
        {profileData.bio && (
          <p className="text-muted-foreground">{profileData.bio}</p>
        )}
        
        {/* Display favorite cities if available */}
        {profileData.favoriteCities && profileData.favoriteCities.length > 0 && (
          <div className="mt-2">
            <h3 className="text-sm font-medium mb-1">Favorite Cities</h3>
            <div className="flex flex-wrap gap-1">
              {profileData.favoriteCities.map((city: string) => (
                <Badge key={city} variant="secondary">
                  {city}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-2 mt-2">
          <EditProfileDialog 
            initialData={profileData} 
            onProfileUpdated={refreshProfileData}
          />
          
          <Button variant="outline" onClick={handleLogout}>
            Log Out
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="container px-4 max-w-full flex justify-between items-center py-3">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center">
              <span className="mr-2">🗺️</span>
              <h1 className="font-semibold text-xl tracking-tight">Spots</h1>
            </Link>
          </div>
          <nav className="flex space-x-4">
            <Link href="/explore" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Explore
            </Link>
            <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
          </nav>
        </div>
      </header>
      
      <main className="container px-4 max-w-full py-6 max-w-5xl mx-auto">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Your Profile
            </h1>
            <p className="text-muted-foreground">
              Manage your profile information and preferences
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Information */}
            <div className="bg-card border rounded-lg p-6 shadow-sm">
              {renderProfile()}
            </div>
            
            {/* Interests */}
            <div className="bg-card border rounded-lg p-6 shadow-sm">
              {renderInterests()}
            </div>
          </div>
          
          {/* Tabs section for additional content */}
          <div className="bg-card border rounded-lg p-6 shadow-sm">
            <Tabs defaultValue="activity">
              <TabsList className="mb-4">
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="saved">Saved Spots</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="activity">
                <div className="text-center p-6 bg-muted/30 rounded-lg">
                  <p className="text-muted-foreground mb-4">
                    Your activity history will appear here once you start exploring spots.
                  </p>
                  <Link href="/explore">
                    <Button>Explore Spots</Button>
                  </Link>
                </div>
              </TabsContent>
              
              <TabsContent value="saved">
                <div className="text-center p-6 bg-muted/30 rounded-lg">
                  <p className="text-muted-foreground mb-4">
                    You haven't saved any spots yet.
                  </p>
                  <Link href="/explore">
                    <Button>Find Spots</Button>
                  </Link>
                </div>
              </TabsContent>
              
              <TabsContent value="settings">
                <div className="space-y-4">
                  <h3 className="font-medium">Account Settings</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">Notifications</p>
                        <p className="text-sm text-muted-foreground">Manage email notifications</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">Privacy</p>
                        <p className="text-sm text-muted-foreground">Control your privacy settings</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">Sign Out</p>
                        <p className="text-sm text-muted-foreground">Sign out of your account</p>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => signOut({ callbackUrl: "/login" })}
                      >
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Add EditInterestsDialog component */}
        <EditInterestsDialog 
          userInterests={interests}
          userLocation={profileData.location}
          onSave={handleSaveInterests}
        />
      </main>
    </div>
  );
} 