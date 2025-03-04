"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Filter, List, Map, Search, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MapView } from "@/components/map/map-view";
import { InterestTile } from "@/components/interest-tile";
import { SpotCard } from "@/components/spot-card";
import { allMockSpots, Spot, getSpotsByInterests, getSpotsByLocation } from "@/lib/mock-data";
import { enhanceInterest } from "@/lib/interest-utils";

export default function ExplorePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [filteredSpots, setFilteredSpots] = useState<Spot[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState<[number, number]>([-122.4194, 37.7749]); // Default to SF
  const [mapCenter, setMapCenter] = useState<[number, number]>([-122.4194, 37.7749]);
  const [savedSpots, setSavedSpots] = useState<Set<string>>(new Set());
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mapStyle, setMapStyle] = useState<"light" | "dark" | "streets">("light");
  
  // Fetch user interests and spots
  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const res = await fetch('/api/user/interests');
        if (!res.ok) throw new Error('Failed to fetch interests');
        
        const data = await res.json();
        if (data.interests && Array.isArray(data.interests)) {
          setUserInterests(data.interests);
          // Set as initial selected interests for filtering
          setSelectedInterests(data.interests);
        }
      } catch (error) {
        console.error("Error fetching interests:", error);
        // Try localStorage fallback
        try {
          const analyticsData = localStorage.getItem("onboarding-analytics-logs");
          if (analyticsData) {
            const logs = JSON.parse(analyticsData);
            const completionLog = logs.find((log: any) => log.type === "onboarding_complete");
            
            if (completionLog && completionLog.selected_interests) {
              const interests = completionLog.selected_interests;
              setUserInterests(interests);
              setSelectedInterests(interests);
            }
          }
        } catch (e) {
          // Ignore localStorage errors
        }
      }
    };
    
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: [number, number] = [position.coords.longitude, position.coords.latitude];
          setUserLocation(location);
          setMapCenter(location);
        },
        () => {
          // Keep default SF location if geolocation fails
        }
      );
    }
    
    // Fetch all spots - in a real app, this would be from an API
    setSpots(allMockSpots);
    
    fetchInterests().finally(() => setLoading(false));
  }, []);
  
  // Filter spots based on selected interests and search query
  useEffect(() => {
    let filtered = spots;
    
    // Filter by interests if any selected
    if (selectedInterests.length > 0) {
      filtered = getSpotsByInterests(selectedInterests);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(spot => 
        spot.name.toLowerCase().includes(query) ||
        spot.description.toLowerCase().includes(query) ||
        spot.type.toLowerCase().includes(query) ||
        spot.neighborhood.toLowerCase().includes(query) ||
        spot.tags.some(tag => tag.toLowerCase().includes(query)) ||
        spot.interests.some(interest => interest.toLowerCase().includes(query))
      );
    }
    
    setFilteredSpots(filtered);
  }, [spots, selectedInterests, searchQuery]);
  
  const toggleInterest = useCallback((interest: string) => {
    setSelectedInterests(prev => {
      if (prev.includes(interest)) {
        return prev.filter(i => i !== interest);
      } else {
        return [...prev, interest];
      }
    });
  }, []);
  
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
  
  const handleSpotClick = useCallback((spotId: string) => {
    // Navigate to spot detail page
    router.push(`/spot/${spotId}`);
  }, [router]);
  
  const handleClearFilters = useCallback(() => {
    setSelectedInterests(userInterests);
    setSearchQuery("");
  }, [userInterests]);
  
  const handleMapCenterChange = useCallback((newCenter: [number, number]) => {
    setMapCenter(newCenter);
  }, []);
  
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
          <div className="container px-4 max-w-full flex justify-between items-center py-3">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center mr-6">
                <span className="mr-2">🗺️</span>
                <h1 className="font-semibold text-xl tracking-tight">Spots</h1>
              </Link>
              <Skeleton className="h-10 w-64" />
            </div>
            <nav className="flex space-x-2">
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-md" />
            </nav>
          </div>
        </header>
        
        <main className="h-[calc(100vh-57px)]">
          <Skeleton className="h-full w-full" />
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="container px-4 max-w-full flex justify-between items-center py-3">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Link href="/dashboard" className="flex items-center">
              <span className="mr-2">🗺️</span>
              <h1 className="font-semibold text-xl tracking-tight">Spots</h1>
            </Link>
            
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search spots by name, type, or area..."
                className="pl-9 h-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 h-5 w-5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-2">
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                  {selectedInterests.length > 0 && (
                    <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                      {selectedInterests.length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full max-w-sm">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>
                    Refine spots based on your interests and preferences.
                  </SheetDescription>
                </SheetHeader>
                
                <div className="mt-6 space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium">Interests</h3>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="h-auto p-0 text-xs"
                        onClick={handleClearFilters}
                      >
                        Reset
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {userInterests.map(interest => (
                        <InterestTile
                          key={interest}
                          interest={enhanceInterest(interest)}
                          selected={selectedInterests.includes(interest)}
                          onClick={() => toggleInterest(interest)}
                          size="sm"
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Additional filters would go here */}
                  
                  <div className="pt-4 border-t">
                    <Button 
                      className="w-full" 
                      onClick={() => setFiltersOpen(false)}
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            <div className="border rounded-md overflow-hidden">
              <Button 
                variant={viewMode === "map" ? "secondary" : "ghost"} 
                size="sm" 
                className="rounded-none border-0"
                onClick={() => setViewMode("map")}
              >
                <Map className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === "list" ? "secondary" : "ghost"} 
                size="sm" 
                className="rounded-none border-0"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            
            <Link href="/profile" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Profile
            </Link>
          </nav>
          
          <div className="md:hidden flex space-x-2">
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setFiltersOpen(true)}>
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
            <div className="border rounded-md overflow-hidden h-9">
              <Button 
                variant={viewMode === "map" ? "secondary" : "ghost"} 
                size="sm" 
                className="h-full rounded-none border-0 px-2"
                onClick={() => setViewMode("map")}
              >
                <Map className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === "list" ? "secondary" : "ghost"} 
                size="sm" 
                className="h-full rounded-none border-0 px-2"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col">
        {viewMode === "map" ? (
          <div className="relative flex-1">
            <MapView
              center={mapCenter}
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
              style={mapStyle}
              controls={true}
            />
            
            {/* Map overlay controls */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
              <div className="bg-background/80 backdrop-blur-sm rounded-md p-1 shadow-sm">
                <Button 
                  variant={mapStyle === "light" ? "secondary" : "ghost"} 
                  size="sm" 
                  className="h-8 px-3"
                  onClick={() => setMapStyle("light")}
                >
                  Light
                </Button>
                <Button 
                  variant={mapStyle === "dark" ? "secondary" : "ghost"} 
                  size="sm" 
                  className="h-8 px-3"
                  onClick={() => setMapStyle("dark")}
                >
                  Dark
                </Button>
                <Button 
                  variant={mapStyle === "streets" ? "secondary" : "ghost"} 
                  size="sm" 
                  className="h-8 px-3"
                  onClick={() => setMapStyle("streets")}
                >
                  Streets
                </Button>
              </div>
            </div>
            
            {/* Bottom card area */}
            <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
              <ScrollArea className="pb-2 -mx-2 px-2 max-w-full">
                <div className="flex space-x-4">
                  {filteredSpots.slice(0, 10).map(spot => (
                    <SpotCard
                      key={spot.id}
                      spot={spot}
                      variant="compact"
                      className="min-w-[200px] shadow-lg"
                      onClick={() => handleSpotClick(spot.id)}
                      onSave={() => toggleSaveSpot(spot.id)}
                      saved={savedSpots.has(spot.id)}
                    />
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : (
          <div className="container px-4 max-w-full py-4">
            <div className="mb-4">
              <h2 className="text-xl font-bold tracking-tight mb-1">Explore Spots</h2>
              <p className="text-muted-foreground text-sm">
                Showing {filteredSpots.length} spots {selectedInterests.length > 0 ? `matching your interests` : ``}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
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
                    We couldn't find any spots matching your filters.
                  </p>
                  <Button variant="default" onClick={handleClearFilters}>
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 