"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Check, ChevronLeft, RefreshCw, PlusCircle, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { InterestSelector } from "@/components/interest-selector";
import { Input } from "@/components/ui/input";
import { Interest } from "@/components/interest-selector";
import { Badge } from "@/components/ui/badge";

// Create a subset of common interests to use in our component
const defaultInterests: Interest[] = [
  { id: "coffee", name: "Coffee", emoji: "☕", color: "#4ECDC4" },
  { id: "food", name: "Food", emoji: "🍽️", color: "#FF6B6B" },
  { id: "shopping", name: "Shopping", emoji: "🛍️", color: "#FFD166" },
  { id: "art", name: "Art", emoji: "🎨", color: "#FFD166" },
  { id: "music", name: "Music", emoji: "🎵", color: "#FF6B6B" },
  { id: "nature", name: "Nature", emoji: "🌿", color: "#AAC789" },
  { id: "tech", name: "Tech", emoji: "💻", color: "#4ECDC4" },
  { id: "sports", name: "Sports", emoji: "⚽", color: "#4ECDC4" },
  { id: "reading", name: "Reading", emoji: "📚", color: "#4ECDC4" },
];

// Popular cities for suggestions - expanded list for infinite scroll
const popularCities = [
  "San Francisco", "New York", "Los Angeles", "Chicago", "Seattle", 
  "London", "Paris", "Tokyo", "Berlin", "Sydney", "Toronto",
  "Barcelona", "Amsterdam", "Rome", "Miami", "Austin", "Portland",
  "Nashville", "Boston", "New Orleans", "Vancouver", "Dubai", 
  "Singapore", "Hong Kong", "Mexico City", "Montreal", "Madrid", 
  "Copenhagen", "Vienna", "Stockholm", "Dublin"
];

// Log analytics data for LIM pipeline improvement
function logAnalyticsData(data: any) {
  // In a real app, this would send the data to an analytics endpoint
  console.log("Analytics data:", data);
  
  // For demo, we'll store in localStorage
  try {
    // Get existing logs
    const existingLogs = localStorage.getItem("onboarding-analytics-logs");
    const logs = existingLogs ? JSON.parse(existingLogs) : [];
    
    // Add new log
    logs.push({
      ...data,
      timestamp: new Date().toISOString()
    });
    
    // Store back in localStorage (limit to last 10 entries)
    localStorage.setItem("onboarding-analytics-logs", JSON.stringify(logs.slice(-10)));
  } catch (error) {
    console.error("Error logging analytics data:", error);
  }
}

export default function OnboardingPage() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedInterestDetails, setSelectedInterestDetails] = useState<Interest[]>([]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [userLocation, setUserLocation] = useState("Los Angeles"); // Default to Los Angeles
  const [favoriteCities, setFavoriteCities] = useState<string[]>([]);
  const [newCityInput, setNewCityInput] = useState("");
  const [detectedLocation, setDetectedLocation] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [commonInterests, setCommonInterests] = useState<Interest[]>(defaultInterests);
  
  // Detect user's location on mount (simulated)
  useEffect(() => {
    const detectLocation = async () => {
      try {
        // In production, this would use geolocation API + reverse geocoding
        // For demo, we'll simulate a delay and a detected location
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Attempt to get user's location from browser API
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              
              // In production, we would use a reverse geocoding service here
              // For demo, we'll simulate a result based on known coordinates
              
              // Los Angeles: roughly 34.0522° N, 118.2437° W
              // San Francisco: roughly 37.7749° N, 122.4194° W
              // New York: roughly 40.7128° N, 74.0060° W
              
              let detected = "Los Angeles"; // Default fallback
              
              // Simple coordinate-based matching for demo
              if (latitude > 37 && latitude < 38 && longitude < -122 && longitude > -123) {
                detected = "San Francisco";
              } else if (latitude > 40 && latitude < 41 && longitude < -73 && longitude > -75) {
                detected = "New York";
              } else if (latitude > 33 && latitude < 35 && longitude < -118 && longitude > -119) {
                detected = "Los Angeles";
              }
              
              console.log("[LOCATION] [DETECTION] User location detected:", detected);
              setDetectedLocation(detected);
              setUserLocation(detected);
              
              // Fetch interests for the detected location
              fetchInterestsForLocation(detected);
            },
            (error) => {
              console.error("[LOCATION] [ERROR] Error getting location:", error);
              // Fall back to "Los Angeles" if geolocation fails
              const fallback = "Los Angeles";
              setDetectedLocation(fallback);
              setUserLocation(fallback);
              
              // Fetch interests for the fallback location
              fetchInterestsForLocation(fallback);
            }
          );
        } else {
          // Geolocation not supported, use fallback
          console.log("[LOCATION] [UNSUPPORTED] Geolocation not supported by browser");
          const fallback = "Los Angeles";
          setDetectedLocation(fallback);
          setUserLocation(fallback);
          
          // Fetch interests for the fallback location
          fetchInterestsForLocation(fallback);
        }
      } catch (error) {
        console.error("[LOCATION] [ERROR] Error detecting location:", error);
        // Use fallback
        const fallback = "Los Angeles";
        setDetectedLocation(fallback);
        setUserLocation(fallback);
        
        // Fetch interests for the fallback location
        fetchInterestsForLocation(fallback);
      } finally {
        setLoadingLocation(false);
      }
    };
    
    detectLocation();
  }, []);

  // Animation effect when component mounts
  useEffect(() => {
    setAnimate(true);
  }, []);

  // Fetch interests for a specific location, with option to force refresh
  const fetchInterestsForLocation = async (location: string, forceRefresh = false) => {
    if (!location) return;
    
    console.log(`[INTEREST] [FETCH] Fetching interests for ${location}${forceRefresh ? ' with refresh' : ''}`);
    setIsLoading(true);
    
    try {
      // Prepare favorite cities parameter if we have any
      const favCitiesParam = favoriteCities.length > 0 
        ? `&favoriteCities=${encodeURIComponent(JSON.stringify(favoriteCities))}` 
        : '';
      
      // Add a timestamp to force refresh if needed
      const refreshParam = forceRefresh ? `&refresh=${Date.now()}` : '';
      
      // Make the API request with all parameters
      const url = `/api/interests?location=${encodeURIComponent(location)}${favCitiesParam}${refreshParam}`;
      console.log(`[INTEREST] [REQUEST] ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch interests: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.interests && Array.isArray(data.interests)) {
        console.log(`[INTEREST] [RECEIVED] Received ${data.interests.length} interests for ${location}`);
        
        // Get recommended interests for this location
        const recommendedInterests = data.interests.slice(0, 15);
        
        // Update common interests to show these recommendations
        setCommonInterests(
          recommendedInterests.map((name: string) => ({
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name: name,
            emoji: getInterestEmoji(name),
            color: getInterestColor(name)
          }))
        );
      }
    } catch (error) {
      console.error("[INTEREST] [ERROR] Error fetching interests:", error);
      // Keep default common interests if fetch fails
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to get emoji for an interest
  const getInterestEmoji = (interest: string): string => {
    // Simple mapping of common interests to emojis
    const emojiMap: Record<string, string> = {
      "Coffee": "☕",
      "Food": "🍽️",
      "Shopping": "🛍️",
      "Art": "🎨",
      "Music": "🎵",
      "Nature": "🌿",
      "Tech": "💻",
      "Sports": "⚽",
      "Reading": "📚",
      "Nightlife": "🌃",
      "Wine": "🍷",
      "Beer": "🍺",
      "Hiking": "🥾",
      "Museums": "🏛️",
      "Photography": "📷",
      "Beaches": "🏖️",
      "Film": "🎬",
      "Tacos": "🌮",
    };
    
    // Try to find a direct match
    if (emojiMap[interest]) {
      return emojiMap[interest];
    }
    
    // Try to find a partial match
    for (const key of Object.keys(emojiMap)) {
      if (interest.toLowerCase().includes(key.toLowerCase()) || 
          key.toLowerCase().includes(interest.toLowerCase())) {
        return emojiMap[key];
      }
    }
    
    // Default emoji
    return "🔍";
  };
  
  const getInterestColor = (interest: string): string => {
    // Simple hashing function to get consistent colors
    let hash = 0;
    for (let i = 0; i < interest.length; i++) {
      hash = interest.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Common colors that look good
    const colors = [
      "#4ECDC4", "#FF6B6B", "#FFD166", "#AAC789", "#45B7D1", 
      "#F46036", "#E76F51", "#2A9D8F", "#6A994E", "#9B5DE5"
    ];
    
    // Use the hash to select a color
    return colors[Math.abs(hash) % colors.length];
  };
  
  const handleRefreshInterests = () => {
    fetchInterestsForLocation(userLocation, true);
  };

  const handleInterestChange = (interests: string[]) => {
    setSelectedInterests(interests);
    
    // Find the full interest details for the selected interests
    const interestDetails = interests.map(id => {
      // Look up in commonInterests first
      const foundInterest = commonInterests.find((interest: Interest) => interest.id === id);
      if (foundInterest) return foundInterest;
      
      // If not found, create a new interest object
      const name = id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      return {
        id,
        name,
        emoji: getInterestEmoji(name),
        color: getInterestColor(name)
      };
    }).filter(Boolean) as Interest[];
    
    setSelectedInterestDetails(interestDetails);
    
    // Log the selection for analytics
    logAnalyticsData({
      type: "interest_selection",
      action: "select",
      location: userLocation,
      interests,
      selected_count: interests.length
    });
  };

  const handleNext = async () => {
    if (step === 1) {
      if (selectedInterests.length === 0) {
        return; // Require at least one interest
      }
      
      // Log the completion of step 1
      logAnalyticsData({
        type: "onboarding_progress",
        action: "step_complete",
        step: 1,
        location: userLocation,
        favorite_cities: favoriteCities,
        selected_interests: selectedInterests
      });
      
      setAnimate(false);
      
      // Small delay before changing step for animation
      setTimeout(() => {
        setStep(2);
        setAnimate(true);
      }, 300);
      
      return;
    }

    if (step === 2) {
      setLoading(true);
      
      try {
        // Log the onboarding completion
        logAnalyticsData({
          type: "onboarding_complete",
          timestamp: new Date().toISOString(),
          location: userLocation,
          favorite_cities: favoriteCities,
          selected_interests: selectedInterests,
          interest_details: selectedInterestDetails
        });
        
        // Save interests to the database via API
        const response = await fetch('/api/user/interests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            interests: selectedInterests,
            location: userLocation,
            favoriteCities
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to save interests');
        }
        
        // Also set a cookie as a fallback for middleware
        document.cookie = "onboarding-complete=true; path=/; max-age=31536000"; // 1 year
        
        // Redirect to the dashboard
        window.location.href = "/dashboard";
      } catch (error) {
        console.error("Error saving interests:", error);
        setLoading(false);
      }
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLocation = e.target.value;
    setUserLocation(newLocation);
    
    // Log the location change for analytics
    logAnalyticsData({
      type: "location_change",
      action: "manual_input",
      location: newLocation
    });
  };

  const handleUseDetectedLocation = () => {
    setUserLocation(detectedLocation);
    
    // Log the use of detected location for analytics
    logAnalyticsData({
      type: "location_change",
      action: "use_detected",
      location: detectedLocation
    });
  };

  // Handle adding a new favorite city
  const handleAddFavoriteCity = () => {
    if (!newCityInput.trim() || favoriteCities.includes(newCityInput.trim())) {
      return;
    }
    
    setFavoriteCities([...favoriteCities, newCityInput.trim()]);
    setNewCityInput("");
    
    // Log analytics
    logAnalyticsData({
      type: "favorite_city_added",
      action: "add",
      city: newCityInput.trim()
    });
  };
  
  // Handle removing a favorite city
  const handleRemoveFavoriteCity = (city: string) => {
    setFavoriteCities(favoriteCities.filter(c => c !== city));
    
    // Log analytics
    logAnalyticsData({
      type: "favorite_city_removed",
      action: "remove",
      city
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex justify-center py-3 relative">
          {step > 1 && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute left-2" 
              onClick={() => {
                setAnimate(false);
                setTimeout(() => {
                  setStep(1);
                  setAnimate(true);
                }, 300);
              }}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
          )}
          <div className="flex items-center">
            <span className="mr-2">🗺️</span>
            <h1 className="font-semibold text-xl tracking-tight">Spots</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 container max-w-5xl py-8 px-4">
        <div className={`transition-opacity duration-300 ${animate ? 'opacity-100' : 'opacity-0'}`}>
          {step === 1 ? (
            <div className="space-y-8">
              <div className="space-y-2 text-center">
                <h1 className="text-2xl font-bold tracking-tight">Welcome to Spots!</h1>
                <p className="text-muted-foreground">
                  Tell us about what you're interested in to get personalized spot recommendations.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex justify-between items-center">
                    <span>Your Location</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleRefreshInterests}
                      disabled={isLoading}
                      className="h-8"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                      {isLoading ? 'Refreshing...' : 'Refresh'}
                    </Button>
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={userLocation}
                      onChange={handleLocationChange}
                      placeholder="Enter your primary location..."
                      className="flex-1"
                    />
                    {detectedLocation && userLocation !== detectedLocation && !loadingLocation && (
                      <Button 
                        variant="outline" 
                        onClick={handleUseDetectedLocation}
                        className="whitespace-nowrap"
                      >
                        Use {detectedLocation}
                      </Button>
                    )}
                    {loadingLocation && (
                      <Button variant="outline" disabled>
                        <span className="animate-pulse">Detecting...</span>
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Favorite Cities Section */}
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">
                    Favorite Cities (Optional)
                  </label>
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
                  {favoriteCities.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {favoriteCities.map(city => (
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
                      ))}
                    </div>
                  )}
                  
                  {/* Suggestions with horizontal scrolling */}
                  {favoriteCities.length < 5 && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground mb-1">Suggestions:</p>
                      <div className="relative">
                        <div className="overflow-x-auto pb-2 scrollbar-hide">
                          <div className="flex space-x-1 w-max px-1">
                            {popularCities
                              .filter(city => 
                                city !== userLocation && 
                                !favoriteCities.includes(city)
                              )
                              .map(city => (
                                <Badge 
                                  key={city} 
                                  variant="outline" 
                                  className="cursor-pointer hover:bg-secondary whitespace-nowrap"
                                  onClick={() => setFavoriteCities([...favoriteCities, city])}
                                >
                                  + {city}
                                </Badge>
                              ))
                            }
                          </div>
                        </div>
                        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none"></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Select Your Interests
                  </label>
                  
                  <div className="relative">
                    <div className="overflow-x-auto overflow-y-visible pb-2 scrollbar-hide">
                      <div className="overflow-y-visible flex-1">
                        <InterestSelector
                          interests={commonInterests}
                          selectedInterests={selectedInterests}
                          onInterestChange={handleInterestChange}
                          location={userLocation}
                        />
                      </div>
                    </div>
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none"></div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground text-right">
                    Selected: {selectedInterests.length}/5
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleNext}
                  disabled={selectedInterests.length === 0}
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="space-y-2 text-center">
                <h1 className="text-2xl font-bold tracking-tight">Spots selected!</h1>
                <p className="text-muted-foreground">
                  You've selected {selectedInterests.length} interest{selectedInterests.length !== 1 && 's'}.
                </p>
              </div>
              
              <div className="bg-muted p-6 rounded-lg">
                <h2 className="font-semibold mb-3">Your interests:</h2>
                <div className="flex flex-wrap gap-2">
                  {selectedInterestDetails.map((interest) => (
                    <div 
                      key={interest.id} 
                      className="bg-background rounded-full px-3 py-1 text-sm flex items-center space-x-1"
                    >
                      <span>{interest.emoji}</span>
                      <span>{interest.name}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Your location: {userLocation}</span>
                  </div>
                  
                  {favoriteCities.length > 0 && (
                    <div className="flex items-start space-x-2">
                      <Check className="h-4 w-4 text-green-500 mt-1" />
                      <div>
                        <span>Favorite cities: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {favoriteCities.map(city => (
                            <Badge key={city} variant="secondary">
                              {city}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleNext} disabled={loading}>
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-background" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      Finish Setup
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 