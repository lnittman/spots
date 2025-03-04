"use client";

import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Sparkles, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlaceCard } from "@/components/ui/place-card";
import { useToast } from "@/components/ui/use-toast";

// Mock data for demonstration purposes
const mockPlaces = [
  {
    id: "1",
    name: "Café Moderne",
    description: "A stylish café with specialty coffee, pastries, and a relaxed atmosphere. Perfect for working or catching up with friends.",
    type: "Café",
    imageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    address: "123 Main St, City",
    rating: 4.5,
    openHours: "8am - 8pm",
    priceLevel: "$$",
    tags: ["Coffee", "Pastries", "Wifi"],
    matchReason: "Matches your interest in coffee",
    distance: "0.3 miles"
  },
  {
    id: "2",
    name: "Urban Hiking Trail",
    description: "A scenic urban trail with beautiful city views and moderate difficulty. Great for morning exercise or weekend adventures.",
    type: "Outdoor",
    imageUrl: "https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    address: "456 Park Ave, City",
    rating: 4.8,
    openHours: "24/7",
    priceLevel: "Free",
    tags: ["Hiking", "Views", "Nature"],
    matchReason: "Matches your interest in hiking",
    distance: "1.2 miles"
  }
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState("");
  const [displayedPlaces, setDisplayedPlaces] = useState<typeof mockPlaces>([]);
  const [savedPlaces, setSavedPlaces] = useState<Set<string>>(new Set());
  const responseRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Mock user location - in a real app, you would get this from browser or user input
  const userLocation = {
    latitude: 40.7128,
    longitude: -74.0060
  };
  
  // Mock user interests - in a real app, these would come from user profile
  const userInterests = ["Coffee", "Hiking", "Photography"];
  
  useEffect(() => {
    // If we have a streamedResponse and it's finished loading, show mock places
    if (streamedResponse && !loading) {
      // In a real app, you would parse the AI response and fetch actual places
      // For demo, we're just showing mock data after a delay
      setDisplayedPlaces(mockPlaces);
    }
  }, [streamedResponse, loading]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setLoading(true);
    setStreamedResponse("");
    setDisplayedPlaces([]);
    
    try {
      const response = await fetch("/api/ai/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          location: userLocation,
          userInterests
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to get response");
      }
      
      // Handle the streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error("Failed to get reader");
      }
      
      let done = false;
      let accumulated = "";
      
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        
        if (value) {
          const chunkText = decoder.decode(value);
          accumulated += chunkText;
          setStreamedResponse(accumulated);
          
          // Auto-scroll the response area to the bottom
          if (responseRef.current) {
            responseRef.current.scrollTop = responseRef.current.scrollHeight;
          }
        }
      }
    } catch (error) {
      console.error("Error querying AI:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (placeId: string) => {
    const newSavedPlaces = new Set(savedPlaces);
    
    if (newSavedPlaces.has(placeId)) {
      newSavedPlaces.delete(placeId);
      toast({
        title: "Place removed",
        description: "This place has been removed from your saved places.",
      });
    } else {
      newSavedPlaces.add(placeId);
      toast({
        title: "Place saved",
        description: "This place has been added to your saved places.",
      });
    }
    
    setSavedPlaces(newSavedPlaces);
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <main className="flex-1 py-6 px-4 md:px-6 container max-w-6xl">
        <div className="space-y-2 mb-6">
          <h1 className="text-3xl font-bold">Discover Places</h1>
          <p className="text-muted-foreground">
            Search for places using natural language. Try "coffee shops with outdoor seating" or "family-friendly hikes"
          </p>
        </div>
        
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2 w-full items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="What are you looking for?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                title="Use current location"
              >
                <MapPin className="h-4 w-4" />
              </Button>
              <Button type="submit" disabled={loading || !query.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  "Search"
                )}
              </Button>
            </div>
          </div>
        </form>

        {streamedResponse && (
          <div className="mb-8 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">AI Recommendations</h2>
            </div>
            <div 
              ref={responseRef}
              className="bg-background border rounded-lg p-4 max-h-60 overflow-y-auto whitespace-pre-wrap"
            >
              {streamedResponse || "Thinking..."}
            </div>
          </div>
        )}

        {displayedPlaces.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Places for You</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
              {displayedPlaces.map((place) => (
                <PlaceCard
                  key={place.id}
                  id={place.id}
                  name={place.name}
                  description={place.description}
                  type={place.type}
                  imageUrl={place.imageUrl}
                  address={place.address}
                  rating={place.rating}
                  openHours={place.openHours}
                  priceLevel={place.priceLevel}
                  tags={place.tags}
                  matchReason={place.matchReason}
                  distance={place.distance}
                  savedByUser={savedPlaces.has(place.id)}
                  onSave={() => handleSave(place.id)}
                />
              ))}
            </div>
          </div>
        )}
        
        {!streamedResponse && !loading && (
          <div className="py-12 text-center text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg">
              Enter a query to discover places that match your interests.
            </p>
            <p className="mt-2">
              Try asking for "coffee shops near me" or "hiking trails with great views"
            </p>
          </div>
        )}
      </main>
    </div>
  );
} 