"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Search, RefreshCw, PlusCircle, X } from "lucide-react";
import { InterestTile } from "@/components/interest-tile";
import { enhanceInterest } from "@/lib/interest-utils";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { Badge } from "@/components/ui/badge";

// Common interests for quick selection
const commonInterests = [
  "Coffee", "Food", "Shopping", "Art", "Music", 
  "Nature", "Tech", "Sports", "Reading", "Nightlife",
  "Wine", "Beer", "Yoga", "Hiking", "Museums",
  "Photography", "Theater", "Dance", "Film", "History"
];

interface EditInterestsDialogProps {
  userInterests: string[];
  userLocation?: string;
  userFavoriteCities?: string[];
  onSave: (interests: string[], location: string, favoriteCities?: string[]) => Promise<void>;
}

export function EditInterestsDialog({ 
  userInterests = [], 
  userLocation = "San Francisco",
  userFavoriteCities = [],
  onSave 
}: EditInterestsDialogProps) {
  const [open, setOpen] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);
  const [location, setLocation] = useState(userLocation);
  const [favoriteCities, setFavoriteCities] = useState<string[]>([]);
  const [newCityInput, setNewCityInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestedInterests, setSuggestedInterests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState("");
  
  // Debounced location search
  const debouncedLocation = useDebounce(location, 500);
  
  useEffect(() => {
    // Initialize with user's current interests
    setInterests([...userInterests]);
    setFavoriteCities([...userFavoriteCities]);
  }, [userInterests, userFavoriteCities]);
  
  // Fetch interests when location changes after debounce
  useEffect(() => {
    if (debouncedLocation && debouncedLocation !== userLocation) {
      fetchInterestsForLocation(debouncedLocation);
    }
  }, [debouncedLocation, userLocation]);
  
  // Fetch interests for a specific location, with option to force refresh
  const fetchInterestsForLocation = async (locationQuery: string, forceRefresh = false) => {
    if (!locationQuery) return;
    
    console.log(`[INTEREST] [FETCH] Fetching interests for ${locationQuery}${forceRefresh ? ' with refresh' : ''}`);
    setIsLoading(true);
    setLoadingLocation(locationQuery);
    
    try {
      // Prepare favorite cities parameter if we have any
      const favCitiesParam = favoriteCities.length > 0 
        ? `&favoriteCities=${encodeURIComponent(JSON.stringify(favoriteCities))}` 
        : '';
      
      // Add a timestamp to force refresh if needed
      const refreshParam = forceRefresh ? `&refresh=${Date.now()}` : '';
      
      // Make the API request with all parameters
      const url = `/api/interests?location=${encodeURIComponent(locationQuery)}${favCitiesParam}${refreshParam}`;
      console.log(`[INTEREST] [REQUEST] ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch interests: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.interests && Array.isArray(data.interests)) {
        console.log(`[INTEREST] [RECEIVED] Received ${data.interests.length} interests for ${locationQuery}`);
        
        // Filter out interests already selected
        const newInterests = data.interests.filter(
          (interest: string) => !interests.includes(interest)
        );
        setSuggestedInterests(newInterests);
      }
    } catch (error) {
      console.error("[INTEREST] [ERROR] Error fetching interests:", error);
      // Fallback to common interests
      setSuggestedInterests(
        commonInterests.filter(interest => !interests.includes(interest))
      );
    } finally {
      setIsLoading(false);
      setLoadingLocation("");
    }
  };
  
  const handleToggleInterest = (interest: string) => {
    setInterests(prev => {
      if (prev.includes(interest)) {
        return prev.filter(i => i !== interest);
      } else {
        return [...prev, interest];
      }
    });
  };
  
  const handleSave = async () => {
    try {
      await onSave(interests, location, favoriteCities);
      setOpen(false);
    } catch (error) {
      console.error("Error saving interests:", error);
    }
  };
  
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);
  };
  
  const handleRefresh = () => {
    fetchInterestsForLocation(location, true);
  };
  
  // Handle adding a new favorite city
  const handleAddFavoriteCity = () => {
    if (!newCityInput.trim() || favoriteCities.includes(newCityInput.trim())) {
      return;
    }
    
    setFavoriteCities([...favoriteCities, newCityInput.trim()]);
    setNewCityInput("");
  };
  
  // Handle removing a favorite city
  const handleRemoveFavoriteCity = (city: string) => {
    setFavoriteCities(favoriteCities.filter(c => c !== city));
  };
  
  // Filter suggested interests by search query
  const filteredSuggestions = searchQuery 
    ? suggestedInterests.filter(interest => 
        interest.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : suggestedInterests;
  
  // Combine common interests with API suggestions for a complete list
  const allSuggestions = [
    ...new Set([
      ...filteredSuggestions,
      ...commonInterests.filter(interest => 
        interest.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !interests.includes(interest) && 
        !filteredSuggestions.includes(interest)
      )
    ])
  ];
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <span id="edit-interests-dialog" className="hidden"></span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Your Interests</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          {/* Location input */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Your Location
            </Label>
            <div className="flex gap-2">
              <Input
                id="location"
                value={location}
                onChange={handleLocationChange}
                placeholder="Enter your location..."
                className="flex-1"
              />
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            {loadingLocation && (
              <p className="text-xs text-muted-foreground">
                Updating suggestions for {loadingLocation}...
              </p>
            )}
          </div>
          
          {/* Favorite Cities Section */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Favorite Cities
            </Label>
            <p className="text-xs text-muted-foreground">
              Add cities you plan to visit or want recommendations for.
            </p>
            
            <div className="flex gap-2">
              <Input
                value={newCityInput}
                onChange={(e) => setNewCityInput(e.target.value)}
                placeholder="Enter a city..."
                className="flex-1"
              />
              <Button 
                variant="outline" 
                onClick={handleAddFavoriteCity}
                disabled={!newCityInput.trim() || favoriteCities.includes(newCityInput.trim())}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
            
            {/* Display favorite cities */}
            <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[50px]">
              {favoriteCities.length > 0 ? (
                favoriteCities.map(city => (
                  <Badge key={city} variant="secondary" className="flex items-center gap-1">
                    {city}
                    <button 
                      onClick={() => handleRemoveFavoriteCity(city)}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove {city}</span>
                    </button>
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground w-full text-center py-2">
                  No favorite cities added yet.
                </p>
              )}
            </div>
          </div>
          
          {/* Selected interests */}
          <div className="space-y-2">
            <Label className="flex items-center justify-between">
              <span>Selected Interests ({interests.length})</span>
              {interests.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 text-xs"
                  onClick={() => setInterests([])}
                >
                  Clear All
                </Button>
              )}
            </Label>
            <div className="min-h-[50px] flex flex-wrap gap-2 p-2 border rounded-md">
              {interests.length > 0 ? (
                interests.map(interest => (
                  <InterestTile 
                    key={interest}
                    interest={enhanceInterest(interest)}
                    onClick={() => handleToggleInterest(interest)}
                    size="md"
                    selected={true}
                  />
                ))
              ) : (
                <p className="text-sm text-muted-foreground w-full text-center py-2">
                  No interests selected. Choose from suggestions below.
                </p>
              )}
            </div>
          </div>
          
          {/* Interest search */}
          <div className="space-y-2">
            <Label htmlFor="search" className="flex items-center gap-1">
              <Search className="h-4 w-4" />
              Search or Select Interests
            </Label>
            <Input
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search interests..."
            />
          </div>
          
          {/* Suggested interests */}
          <div className="space-y-2">
            <Label>Suggested For You</Label>
            <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[100px] max-h-[200px] overflow-y-auto">
              {isLoading ? (
                <div className="w-full flex justify-center items-center py-4">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                </div>
              ) : allSuggestions.length > 0 ? (
                allSuggestions.map(interest => (
                  <InterestTile 
                    key={interest}
                    interest={enhanceInterest(interest)}
                    onClick={() => handleToggleInterest(interest)}
                    size="md"
                    selected={false}
                  />
                ))
              ) : searchQuery ? (
                <p className="text-sm text-muted-foreground w-full text-center py-2">
                  No matching interests found.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground w-full text-center py-2">
                  Try changing your location or search for specific interests.
                </p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={interests.length === 0}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 