"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bookmark, Filter, MapPin, Star } from "lucide-react";

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

  // Fetch user interests
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
          
          // Handle location from profile data
          if (profileData.profile && profileData.profile.location) {
            // In a real app, we would geocode the location string to coordinates
            // For this demo, we'll just simulate coordinates for a few cities
            const locationCoords: Record<string, [number, number]> = {
              "San Francisco": [-122.4194, 37.7749],
              "New York": [-74.0060, 40.7128],
              "London": [-0.1278, 51.5074],
              "Tokyo": [139.6503, 35.6762],
              "Paris": [2.3522, 48.8566]
            };
            
            const coords = locationCoords[profileData.profile.location] || [-122.4194, 37.7749];
            setUserLocation(coords);
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
                  const locationCoords: Record<string, [number, number]> = {
                    "San Francisco": [-122.4194, 37.7749],
                    "New York": [-74.0060, 40.7128],
                    "London": [-0.1278, 51.5074],
                    "Tokyo": [139.6503, 35.6762],
                    "Paris": [2.3522, 48.8566]
                  };
                  
                  const coords = locationCoords[completionLog.location] || [-122.4194, 37.7749];
                  setUserLocation(coords);
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

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.longitude, position.coords.latitude]);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Keep default SF location
        }
      );
    }
  }, []);

  // Toggle saving a spot
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

  // Handle clicking on a spot
  const handleSpotClick = useCallback((spotId: string) => {
    router.push(`/spot/${spotId}`);
  }, [router]);

  // Filter spots by active interest
  const filteredSpots = activeInterest 
    ? recommendedSpots.filter(spot => 
        spot.interests.some(i => 
          i.toLowerCase().includes(activeInterest.toLowerCase()) || 
          activeInterest.toLowerCase().includes(i.toLowerCase())
        )
      )
    : recommendedSpots;

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
          <div className="container flex justify-between items-center py-3">
            <div className="flex items-center">
              <span className="mr-2">🗺️</span>
              <h1 className="font-semibold text-xl tracking-tight">Spots</h1>
            </div>
            <nav className="flex space-x-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </nav>
          </div>
        </header>
        
        <main className="container py-4 md:py-6">
          <div className="space-y-6">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-full max-w-md" />
            
            <div className="h-[300px] md:h-[400px] rounded-lg overflow-hidden relative">
              <Skeleton className="h-full w-full" />
            </div>
            
            <div className="space-y-4">
              <Skeleton className="h-6 w-40" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Skeleton className="h-80 w-full" />
                <Skeleton className="h-80 w-full" />
                <Skeleton className="h-80 w-full" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="container px-4 max-w-full flex justify-between items-center py-3">
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
      
      <main className="container px-4 max-w-full py-4 md:py-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome{session?.user?.name ? `, ${session.user.name.split(' ')[0]}` : ''}!
            </h1>
            <p className="text-muted-foreground">
              Your personalized dashboard for discovering new spots based on your interests.
            </p>
          </div>
          
          {interests.length > 0 ? (
            <>
              {/* Interests scrolling bar */}
              <div className="relative">
                <ScrollArea className="pb-2 -mx-2 px-2">
                  <div className="flex space-x-2 py-1">
                    {interests.map(interest => (
                      <InterestTile
                        key={interest}
                        interest={enhanceInterest(interest)}
                        selected={activeInterest === interest}
                        onClick={() => setActiveInterest(activeInterest === interest ? null : interest)}
                        size="md"
                      />
                    ))}
                    <Link href="/onboarding">
                      <Button variant="outline" size="sm" className="ml-2">
                        Edit Interests
                      </Button>
                    </Link>
                  </div>
                </ScrollArea>
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
              </div>
              
              {/* Map section */}
              <div className="h-[300px] md:h-[400px] rounded-lg overflow-hidden relative border">
                <MapView
                  center={userLocation}
                  zoom={13}
                  markers={filteredSpots.map(spot => ({
                    id: spot.id,
                    name: spot.name,
                    description: spot.description,
                    coordinates: spot.coordinates,
                    color: enhanceInterest(spot.interests[0]).color,
                  }))}
                  onMarkerClick={handleSpotClick}
                  className="w-full h-full"
                  style="light"
                  controls={true}
                />
                
                {/* Filter toggle */}
                <div className="absolute top-4 right-4 z-10">
                  <Button variant="secondary" size="sm" className="bg-background/80 backdrop-blur-sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter Map
                  </Button>
                </div>
                
                {/* Location badge */}
                <div className="absolute bottom-4 left-4 z-10">
                  <Badge className="bg-background/80 backdrop-blur-sm">
                    <MapPin className="h-3 w-3 mr-1" />
                    San Francisco
                  </Badge>
                </div>
              </div>
              
              {/* Recommendations section */}
              <div className="space-y-4">
                <Tabs defaultValue="all">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Recommended for you</h2>
                    <TabsList>
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="nearby">Nearby</TabsTrigger>
                      <TabsTrigger value="popular">Popular</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="all" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredSpots.length > 0 ? (
                        filteredSpots.map(spot => (
                          <SpotCard
                            key={spot.id}
                            spot={spot}
                            onClick={() => handleSpotClick(spot.id)}
                            onSave={() => toggleSaveSpot(spot.id)}
                            saved={savedSpots.has(spot.id)}
                          />
                        ))
                      ) : (
                        <div className="col-span-full p-8 text-center border rounded-lg bg-muted/30">
                          <h3 className="font-semibold mb-2">No spots found</h3>
                          <p className="text-muted-foreground text-sm mb-4">
                            We couldn't find any spots matching your active interest.
                          </p>
                          <Button variant="default" onClick={() => setActiveInterest(null)}>
                            Clear Filter
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="nearby" className="mt-4 space-y-4">
                    {/* Nearby spots - would be a subset based on location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredSpots.slice(0, 4).map(spot => (
                        <SpotCard
                          key={spot.id}
                          spot={spot}
                          variant="horizontal"
                          onClick={() => handleSpotClick(spot.id)}
                          onSave={() => toggleSaveSpot(spot.id)}
                          saved={savedSpots.has(spot.id)}
                        />
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="popular" className="mt-4">
                    {/* Popular spots - would be those marked as popular */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {filteredSpots
                        .filter(spot => spot.popular)
                        .map(spot => (
                          <SpotCard
                            key={spot.id}
                            spot={spot}
                            variant="compact"
                            onClick={() => handleSpotClick(spot.id)}
                            onSave={() => toggleSaveSpot(spot.id)}
                            saved={savedSpots.has(spot.id)}
                          />
                        ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </>
          ) : (
            <div className="p-6 bg-muted rounded-lg text-center space-y-4 border">
              <h2 className="text-xl font-semibold">Complete Your Profile</h2>
              <p className="text-muted-foreground">
                Tell us about your interests to get personalized spot recommendations.
              </p>
              <Link href="/onboarding">
                <Button>Set Up Your Interests</Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 