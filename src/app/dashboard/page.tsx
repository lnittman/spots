"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bookmark, Filter, MapPin, Star } from "lucide-react";
import dynamic from "next/dynamic";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MapView } from "@/components/map/map-view";
import { InterestTile } from "@/components/interest-tile";
import { SpotCard } from "@/components/spot-card";
import { Spot, getRecommendedSpots } from "@/lib/mock-data";
import { enhanceInterest } from "@/lib/interest-utils";
import { EditInterestsDialog } from "@/components/edit-interests-dialog";

// Dynamic import of map component to prevent SSR issues with Leaflet
const DashboardMap = dynamic(
  () => import("@/components/maps/DashboardMap").then(mod => mod.DashboardMap),
  { ssr: false, loading: () => <Skeleton className="h-[400px] w-full rounded-lg" /> }
);

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [interests, setInterests] = useState<string[]>([]);
  const [activeInterest, setActiveInterest] = useState<string | null>(null);
  const [recommendedSpots, setRecommendedSpots] = useState<Spot[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number]>([-122.4194, 37.7749]); // Default to SF
  const [savedSpots, setSavedSpots] = useState<Set<string>>(new Set());
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocationName, setUserLocationName] = useState("San Francisco");
  const [profileData, setProfileData] = useState<any>({});
  const [favoriteCities, setFavoriteCities] = useState<string[]>([]);

  // Render skeletons for loading state
  const renderSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
      {Array(8).fill(0).map((_, i) => (
        <div key={i} className="flex flex-col space-y-3 w-full">
          <Skeleton className="h-[200px] w-full rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-16 rounded-full" />
              <Skeleton className="h-8 w-16 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Fetch user data
  useEffect(() => {
    // Check if user is authenticated
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // If authenticated, fetch interests from API
    if (status === "authenticated") {
      setLoading(true);
      
      // Fetch both user interests and profile data
      Promise.all([
        fetch('/api/user/interests')
          .then(res => {
            if (!res.ok) {
              if (res.status !== 401) {
                throw new Error('Failed to fetch interests');
              }
              return { interests: [] };
            }
            return res.json();
          }),
        fetch('/api/user/profile')
          .then(res => {
            if (!res.ok) {
              if (res.status !== 401) {
                throw new Error('Failed to fetch profile');
              }
              return { profile: {} };
            }
            return res.json();
          })
      ])
        .then(([interestsData, profileData]) => {
          if (interestsData.interests && Array.isArray(interestsData.interests)) {
            setInterests(interestsData.interests);
            
            // Set the first interest as active
            if (interestsData.interests.length > 0) {
              setActiveInterest(interestsData.interests[0]);
            }
            
            // Get recommended spots based on interests
            const spots = getRecommendedSpots(interestsData.interests, 8);
            setRecommendedSpots(spots);
          } else {
            // If no interests found, we should show the empty state
            setInterests([]);
          }
          
          // Handle profile data
          if (profileData.profile) {
            setProfileData(profileData.profile);
            
            // Handle location from profile data
            if (profileData.profile.location) {
              // Store the location name for display
              setUserLocationName(profileData.profile.location);
              
              // In a real app, we would geocode the location string to coordinates
              // For this demo, we'll just simulate coordinates for a few cities
              const locationCoords: Record<string, [number, number]> = {
                "San Francisco": [-122.4194, 37.7749],
                "New York": [-74.0060, 40.7128],
                "London": [-0.1278, 51.5074],
                "Tokyo": [139.6503, 35.6762],
                "Paris": [2.3522, 48.8566],
                "Los Angeles": [-118.2437, 34.0522]
              };
              
              const coords = locationCoords[profileData.profile.location] || [-122.4194, 37.7749];
              setUserLocation(coords);
            }
            
            // Set favorite cities if available
            if (profileData.profile.favoriteCities && Array.isArray(profileData.profile.favoriteCities)) {
              setFavoriteCities(profileData.profile.favoriteCities);
            }
          }
        })
        .catch(error => {
          console.error("Error fetching user data:", error);
          // Fall back to localStorage for backward compatibility
          try {
            const analyticsData = localStorage.getItem("onboarding-analytics-logs");
            if (analyticsData) {
              const logs = JSON.parse(analyticsData);
              const completionLog = logs.find((log: any) => log.type === "onboarding_complete");
              
              if (completionLog) {
                if (completionLog.selected_interests) {
                  const interests = completionLog.selected_interests;
                  setInterests(interests);
                  
                  // Set the first interest as active
                  if (interests.length > 0) {
                    setActiveInterest(interests[0]);
                  }
                  
                  // Get recommended spots based on interests
                  const spots = getRecommendedSpots(interests, 8);
                  setRecommendedSpots(spots);
                }
                
                // Load location from localStorage fallback
                if (completionLog.location) {
                  setUserLocationName(completionLog.location);
                  
                  const locationCoords: Record<string, [number, number]> = {
                    "San Francisco": [-122.4194, 37.7749],
                    "New York": [-74.0060, 40.7128],
                    "London": [-0.1278, 51.5074],
                    "Tokyo": [139.6503, 35.6762],
                    "Paris": [2.3522, 48.8566],
                    "Los Angeles": [-118.2437, 34.0522]
                  };
                  
                  const coords = locationCoords[completionLog.location] || [-122.4194, 37.7749];
                  setUserLocation(coords);
                }
                
                // Load favorite cities from localStorage fallback
                if (completionLog.favorite_cities) {
                  setFavoriteCities(completionLog.favorite_cities);
                }
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

  // Handle spot click on map
  const handleSpotClick = useCallback((spotId: string) => {
    // In a real app, we would navigate to spot details
    console.log(`Clicked spot: ${spotId}`);
  }, []);

  // Toggle spot save status
  const toggleSaveSpot = useCallback((spotId: string) => {
    setSavedSpots(prev => {
      const newSaved = new Set(prev);
      if (newSaved.has(spotId)) {
        newSaved.delete(spotId);
      } else {
        newSaved.add(spotId);
      }
      return newSaved;
    });
  }, []);

  // Filter spots based on active interest
  const filteredSpots = activeInterest
    ? recommendedSpots.filter(spot => spot.interests.includes(activeInterest))
    : recommendedSpots;

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
  
  // Handle saving updated interests and location
  const handleSaveInterests = async (newInterests: string[], newLocation: string, newFavoriteCities?: string[]) => {
    setLoading(true);
    
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
      
      if (newFavoriteCities) {
        setFavoriteCities(newFavoriteCities);
      }
      
      if (newLocation !== userLocationName) {
        setUserLocationName(newLocation);
        
        // Update location coordinates (simplified for demo)
        const locationCoords: Record<string, [number, number]> = {
          "San Francisco": [-122.4194, 37.7749],
          "New York": [-74.0060, 40.7128],
          "London": [-0.1278, 51.5074],
          "Tokyo": [139.6503, 35.6762],
          "Paris": [2.3522, 48.8566],
          "Los Angeles": [-118.2437, 34.0522],
        };
        
        const coords = locationCoords[newLocation] || userLocation;
        setUserLocation(coords);
      }
      
      // Get recommended spots based on new interests
      const spots = getRecommendedSpots(newInterests, 8);
      setRecommendedSpots(spots);
      
      // Set the first interest as active
      if (newInterests.length > 0 && !newInterests.includes(activeInterest || '')) {
        setActiveInterest(newInterests[0]);
      }
    } catch (error) {
      console.error("Error saving interests:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-full max-w-md" />
            </div>
            
            {/* Skeleton for map */}
            <div className="rounded-lg border p-6">
              <Skeleton className="h-6 w-40 mb-4" />
              <Skeleton className="h-[400px] w-full rounded-lg" />
            </div>
            
            {/* Skeleton for interests */}
            <div className="rounded-lg border p-6">
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="flex space-x-2">
                {Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-24 rounded-full" />
                ))}
              </div>
            </div>
            
            {/* Skeleton for recommendations */}
            <div className="rounded-lg border p-6">
              <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-9 w-56 rounded-lg" />
              </div>
              {renderSkeletons()}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Show dashboard with interests
  if (interests.length === 0) {
    return (
      <div className="container max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:space-y-0">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        </div>
        
        <div className="p-6 bg-muted rounded-lg text-center space-y-4 border mt-6">
          <h2 className="text-xl font-semibold">Complete Your Profile</h2>
          <p className="text-muted-foreground">
            Tell us about your interests to get personalized spot recommendations.
          </p>
          <Link href="/onboarding">
            <Button>Set Up Your Interests</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:space-y-0">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome{session?.user?.name ? `, ${session.user.name.split(' ')[0]}` : ''}!
        </h1>
      </div>
      
      <div className="grid gap-6 mt-6">
        {/* User's Location Section with Map */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            Your Location: {userLocationName}
          </h2>
          <DashboardMap 
            userLocation={userLocation}
            userInterests={interests}
            spots={filteredSpots.slice(0, 10)} // Just show a few spots on the map
          />
        </div>
      
        {/* Interests Section */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-muted-foreground" />
            Your Interests
          </h2>
          <ScrollArea className="pb-2 -mx-2 px-2">
            <div className="flex space-x-2 py-1">
              {interests.map(interest => (
                <InterestTile
                  key={interest}
                  interest={enhanceInterest(interest)}
                  onClick={() => setActiveInterest(activeInterest === interest ? null : interest)}
                  selected={activeInterest === interest}
                  size="lg"
                />
              ))}
              <Button 
                variant="outline" 
                size="sm" 
                className="h-10 px-4"
                onClick={() => document.getElementById('edit-interests-dialog')?.click()}
              >
                Edit Interests
              </Button>
            </div>
          </ScrollArea>
        </div>
      
        {/* Recommendations Section */}
        <div className="rounded-lg border bg-card p-6">
          <Tabs defaultValue="all">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Star className="h-5 w-5 text-muted-foreground" />
                Recommended for you
              </h2>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="new">What's New</TabsTrigger>
                <TabsTrigger value="trending">Trending</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredSpots.map(spot => (
                  <SpotCard
                    key={spot.id}
                    spot={spot}
                    saved={savedSpots.has(spot.id)}
                    onSave={() => toggleSaveSpot(spot.id)}
                    onClick={() => handleSpotClick(spot.id)}
                    tooltip={`Based on your interest in ${spot.interests[0]}`}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="new" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredSpots
                  .filter(spot => spot.tags.includes('new'))
                  .map(spot => (
                    <SpotCard
                      key={spot.id}
                      spot={spot}
                      saved={savedSpots.has(spot.id)}
                      onSave={() => toggleSaveSpot(spot.id)}
                      onClick={() => handleSpotClick(spot.id)}
                      tooltip="Recently opened in your area"
                    />
                  ))}
              </div>
            </TabsContent>
            
            <TabsContent value="trending" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredSpots
                  .filter(spot => spot.tags.includes('trending'))
                  .map(spot => (
                    <SpotCard
                      key={spot.id}
                      spot={spot}
                      saved={savedSpots.has(spot.id)}
                      onSave={() => toggleSaveSpot(spot.id)}
                      onClick={() => handleSpotClick(spot.id)}
                      tooltip="Popular with users who share your interests"
                    />
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Include EditInterestsDialog component */}
      <EditInterestsDialog 
        userInterests={interests}
        userLocation={userLocationName}
        userFavoriteCities={favoriteCities}
        onSave={handleSaveInterests}
      />
      
      {/* Hidden trigger for the edit interests dialog */}
      <span id="edit-interests-dialog" className="hidden"></span>
    </div>
  );
} 