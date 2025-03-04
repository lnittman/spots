"use client";

import { useState, useEffect, useRef } from "react";
import { CheckCircle, RefreshCw, MapPin } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface Interest {
  id: string;
  name: string;
  emoji: string;
  category?: string;
  trending?: boolean;
  color?: string;
  size?: "sm" | "md" | "lg";
}

const defaultInterests: Interest[] = [
  { id: "coffee", name: "Coffee", emoji: "☕", trending: true, color: "#4ECDC4" },
  { id: "food", name: "Food", emoji: "🍽️", trending: true, color: "#FF6B6B" },
  { id: "shopping", name: "Shopping", emoji: "🛍️", trending: false, color: "#FFD166" },
  { id: "history", name: "History", emoji: "🏛️", trending: false, color: "#AAC789" },
  { id: "art", name: "Art", emoji: "🎨", trending: true, color: "#FFD166" },
  { id: "music", name: "Music", emoji: "🎵", trending: true, color: "#FF6B6B" },
  { id: "gardens", name: "Gardens", emoji: "🌷", trending: true, color: "#FF6B6B" },
  { id: "picnics", name: "Picnics", emoji: "🧺", trending: true, color: "#AAC789" },
  { id: "cycling", name: "Cycling", emoji: "🚲", trending: true, color: "#4ECDC4" },
  { id: "brunch", name: "Brunch", emoji: "🥓", trending: true, color: "#FFD166" },
  { id: "tech", name: "Tech", emoji: "💻", trending: true, color: "#4ECDC4" },
  { id: "sourdough", name: "Sourdough", emoji: "🍞", trending: true, color: "#FFD166" },
  { id: "golden_gate", name: "Golden Gate", emoji: "🌉", trending: true, color: "#FF6B6B" },
  { id: "fog_chasing", name: "Fog Chasing", emoji: "🌫️", trending: false, color: "#4ECDC4" },
  { id: "hiking", name: "Hiking", emoji: "🥾", trending: false, color: "#AAC789" },
  { id: "photography", name: "Photography", emoji: "📷", trending: false, color: "#4ECDC4" },
  { id: "reading", name: "Reading", emoji: "📚", trending: false, color: "#4ECDC4" },
  { id: "sports", name: "Sports", emoji: "⚽", trending: false, color: "#4ECDC4" },
  { id: "nature", name: "Nature", emoji: "🌿", trending: true, color: "#AAC789" },
  { id: "farmers_markets", name: "Farmers Markets", emoji: "🌽", trending: true, color: "#AAC789" },
  { id: "wine_tasting", name: "Wine Tasting", emoji: "🍷", trending: false, color: "#FF6B6B" },
  { id: "craft_beer", name: "Craft Beer", emoji: "🍺", trending: true, color: "#FFD166" },
  { id: "tacos", name: "Tacos", emoji: "🌮", trending: true, color: "#FF6B6B" },
  { id: "dim_sum", name: "Dim Sum", emoji: "🥟", trending: true, color: "#FF6B6B" },
  { id: "burritos", name: "Burritos", emoji: "🌯", trending: true, color: "#FF6B6B" },
  { id: "beach", name: "Beach", emoji: "🏖️", trending: false, color: "#4ECDC4" },
  { id: "architecture", name: "Architecture", emoji: "🏛️", trending: false, color: "#AAC789" },
  { id: "surfing", name: "Surfing", emoji: "🏄", trending: false, color: "#4ECDC4" },
  { id: "climbing", name: "Climbing", emoji: "🧗", trending: false, color: "#AAC789" },
  { id: "yoga", name: "Yoga", emoji: "🧘", trending: false, color: "#AAC789" },
  { id: "mindfulness", name: "Mindfulness", emoji: "🧠", trending: true, color: "#4ECDC4" },
  { id: "bookstores", name: "Bookstores", emoji: "📚", trending: false, color: "#FFD166" },
  { id: "vintage", name: "Vintage", emoji: "👒", trending: false, color: "#FFD166" },
  { id: "biking", name: "Biking", emoji: "🚴", trending: true, color: "#4ECDC4" },
  { id: "cocktails", name: "Cocktails", emoji: "🍸", trending: true, color: "#FF6B6B" },
  { id: "museums", name: "Museums", emoji: "🏛️", trending: false, color: "#AAC789" },
  { id: "parks", name: "Parks", emoji: "🌳", trending: false, color: "#AAC789" },
  { id: "tea", name: "Tea", emoji: "🍵", trending: false, color: "#4ECDC4" },
  { id: "seafood", name: "Seafood", emoji: "🦞", trending: true, color: "#FF6B6B" },
  { id: "bakeries", name: "Bakeries", emoji: "🥐", trending: true, color: "#FFD166" },
  { id: "ice_cream", name: "Ice Cream", emoji: "🍦", trending: true, color: "#FFD166" },
  { id: "coit_tower", name: "Coit Tower", emoji: "🗼", trending: false, color: "#AAC789" },
  { id: "alcatraz", name: "Alcatraz", emoji: "🏝️", trending: false, color: "#AAC789" },
  { id: "chinatown", name: "Chinatown", emoji: "🏮", trending: false, color: "#FF6B6B" },
  { id: "lgbtq", name: "LGBTQ", emoji: "🏳️‍🌈", trending: false, color: "#FF6B6B" },
  { id: "street_art", name: "Street Art", emoji: "🎨", trending: true, color: "#FFD166" },
  { id: "napa", name: "Napa", emoji: "🍇", trending: false, color: "#AAC789" },
  { id: "running", name: "Running", emoji: "🏃", trending: false, color: "#4ECDC4" },
  { id: "waterfront", name: "Waterfront", emoji: "⚓", trending: false, color: "#4ECDC4" }
];

// Group interests by category for a better display
const interestCategories = [
  { name: "Popular", interests: ["coffee", "food", "shopping", "nature", "beach"] },
  { name: "Activities", interests: ["hiking", "sports", "yoga", "reading", "crafts", "gardening"] },
  { name: "Arts & Culture", interests: ["art", "music", "photography", "history", "museum", "architecture", "vintage"] },
  { name: "Lifestyle", interests: ["tech", "nightlife"] },
];

export interface InterestSelectorProps {
  interests?: Interest[];
  selectedInterests?: string[];
  onInterestChange?: (selectedIds: string[]) => void;
  maxSelections?: number;
  disabled?: boolean;
  className?: string;
  showCategories?: boolean;
  location?: string;
}

export function InterestSelector({
  interests: initialInterests = defaultInterests,
  selectedInterests = [],
  onInterestChange,
  maxSelections = 5,
  disabled = false,
  className,
  showCategories = false,
  location = "San Francisco",
}: InterestSelectorProps) {
  const [selected, setSelected] = useState<string[]>(selectedInterests);
  const [animatingItems, setAnimatingItems] = useState<{[key: string]: boolean}>({});
  const [interests, setInterests] = useState<Interest[]>(initialInterests);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const interestsContainerRef = useRef<HTMLDivElement>(null);
  
  // On mount, fetch personalized interests based on location
  useEffect(() => {
    const fetchInterests = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // First check browser localStorage for cached interests
        const localCacheKey = `interests-${location?.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}`;
        const cachedInterests = localStorage.getItem(localCacheKey);
        
        if (cachedInterests) {
          setInterests(JSON.parse(cachedInterests));
          setIsLoading(false);
          return;
        }
        
        // If not in localStorage, fetch from API
        const response = await fetch(`/api/interests?location=${encodeURIComponent(location)}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch interests: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.interests && Array.isArray(data.interests)) {
          // Cache in localStorage
          localStorage.setItem(localCacheKey, JSON.stringify(data.interests));
          
          // Update state
          setInterests(data.interests);
        } else {
          // Fallback to shuffled default interests
          const shuffled = [...initialInterests]
            .sort(() => Math.random() - 0.5);
          
          setInterests(shuffled);
        }
      } catch (err) {
        console.error("Error fetching interests:", err);
        setError("Failed to load personalized interests");
        
        // Fallback to default interests
        const shuffled = [...initialInterests]
          .sort(() => Math.random() - 0.5);
        
        setInterests(shuffled);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInterests();
  }, [location, initialInterests]);

  useEffect(() => {
    // Update if selectedInterests prop changes
    if (selectedInterests.length !== selected.length || 
        !selectedInterests.every(id => selected.includes(id))) {
      setSelected(selectedInterests);
    }
  }, [selectedInterests]);

  const toggleInterest = (id: string) => {
    if (disabled) return;

    const isSelected = selected.includes(id);
    
    // Start animation
    setAnimatingItems({...animatingItems, [id]: true});
    
    // Reset animation state after animation completes
    setTimeout(() => {
      setAnimatingItems(prev => ({...prev, [id]: false}));
    }, 300);
    
    if (isSelected) {
      // Remove interest if already selected
      const newSelected = selected.filter((interestId) => interestId !== id);
      setSelected(newSelected);
      onInterestChange?.(newSelected);
    } else {
      // Add interest if not at max selections
      if (selected.length < maxSelections) {
        const newSelected = [...selected, id];
        setSelected(newSelected);
        onInterestChange?.(newSelected);
      }
    }
  };
  
  // Refresh the interests with a new set from the API
  const refreshInterests = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Clear the local cache for this location
      const localCacheKey = `interests-${location?.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}`;
      localStorage.removeItem(localCacheKey);
      
      // Fetch fresh interests with cache-busting query param
      const response = await fetch(`/api/interests?location=${encodeURIComponent(location)}&refresh=${Date.now()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to refresh interests: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.interests && Array.isArray(data.interests)) {
        // Cache new results
        localStorage.setItem(localCacheKey, JSON.stringify(data.interests));
        
        // Update state
        setInterests(data.interests);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Error refreshing interests:", err);
      setError("Failed to refresh interests");
      
      // Shuffle existing interests as fallback
      const shuffled = [...interests]
        .sort(() => Math.random() - 0.5);
      
      setInterests(shuffled);
    } finally {
      setIsLoading(false);
    }
  };

  // Render a flowing grid of interests with uniform height
  const renderFlowGrid = () => {
    // Show loading skeleton
    if (isLoading && interests.length === 0) {
      return (
        <div className="flex flex-wrap gap-2 sm:gap-3 max-h-[400px] overflow-y-auto p-1">
          {Array.from({ length: 12 }).map((_, index) => (
            <div 
              key={index} 
              className="animate-pulse h-14 w-32 bg-muted/40 rounded-lg"
            />
          ))}
        </div>
      );
    }
    
    return (
      <div className="flex flex-wrap gap-2 sm:gap-3 max-h-[400px] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent pr-2">
        {interests.map(interest => {
          const isSelected = selected.includes(interest.id);
          const isAnimating = animatingItems[interest.id];
          
          return (
            <button
              key={interest.id}
              onClick={() => toggleInterest(interest.id)}
              disabled={disabled || isLoading}
              className={cn(
                "relative group flex items-center px-3 py-2 rounded-full select-none transition-colors",
                "hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                selected.includes(interest.id) ? "border-primary bg-primary/10" : "border-transparent bg-accent/30",
                "text-sm font-medium border animate-fade-in",
                className
              )}
              style={{
                backgroundColor: selected.includes(interest.id) ? `${interest.color}20` : undefined,
                borderColor: selected.includes(interest.id) ? interest.color : undefined,
                transitionProperty: "border-color, background-color",
                transitionDuration: "300ms",
                minHeight: "36px", // Ensure consistent height
                minWidth: "fit-content", // Ensure width is based on content
                width: "auto", // Allow natural width
              }}
            >
              <div className="flex items-center min-w-0">
                {interest.emoji && (
                  <span className="mr-1.5 text-base" style={{ minWidth: '1.25rem' }}>{interest.emoji}</span>
                )}
                <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                  {interest.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Select up to {maxSelections} interests
          </p>
          
          <Badge variant="outline" className="text-xs">
            {selected.length}/{maxSelections}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {location && (
            <div className="flex items-center text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 mr-1" />
              {location}
            </div>
          )}
          
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-8 w-8 p-0" 
            onClick={refreshInterests}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            <span className="sr-only">Refresh interests</span>
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="text-sm text-amber-500 dark:text-amber-400">
          {error}
        </div>
      )}
      
      {renderFlowGrid()}
      
      {selected.length === maxSelections && (
        <p className="text-sm text-amber-500 dark:text-amber-400 mt-2">
          Maximum selections reached. Remove some to select others.
        </p>
      )}
    </div>
  );
} 