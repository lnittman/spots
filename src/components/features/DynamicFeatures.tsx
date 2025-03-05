"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { LIMLogger, LogCategory } from '@/lib/lim/logging';
import { defaultCities, getCityData } from '@/lib/cities-data';
import { LocationDropdown, type LocationItem } from '@/components/LocationDropdown';

// Get city data from the cities-data module
const cityLocations = defaultCities.map(city => ({
  id: city.id,
  title: city.name,
  coordinates: city.coordinates,
  emoji: city.emoji,
  trending: city.trending || false,
  type: city.type
}));

// Logger for this component
const logger = LIMLogger.getInstance();

// Feature demonstration data types
interface FeatureDemo {
  title: string;
  content: React.ReactNode;
  loading: boolean;
}

// Types of recommendations by feature
interface PersonalizedRecommendation {
  id: string;
  name: string;
  description: string;
  type: string;
  emoji: string;
  tags: string[];
}

interface SearchResult {
  id: string;
  name: string;
  description: string;
}

interface ContextualSuggestion {
  type: string;
  emoji: string;
  name: string;
  description: string;
  context: {
    time?: string;
    weather?: string;
    season?: string;
  };
}

// Sample interests for demo
const demoInterests = [
  { id: 'coffee', name: 'Coffee', emoji: '☕', color: '#4ECDC4' },
  { id: 'hiking', name: 'Hiking', emoji: '🥾', color: '#AAC789' },
  { id: 'art', name: 'Art', emoji: '🎨', color: '#FFD166' },
  { id: 'food', name: 'Food', emoji: '🍜', color: '#FF6B6B' },
  { id: 'nature', name: 'Nature', emoji: '🌳', color: '#AAC789' }
];

// Interface for DynamicFeatures props
interface DynamicFeaturesProps {
  selectedLocation?: LocationItem;
  onChange?: (location: LocationItem) => void;
}

export function DynamicFeatures({ selectedLocation, onChange }: DynamicFeaturesProps) {
  // Use props if provided, otherwise use local state
  const [localSelectedLocation, setLocalSelectedLocation] = useState(cityLocations[0]);
  const effectiveLocation = selectedLocation || localSelectedLocation;
  
  // Function to handle location change
  const handleLocationChange = (location: LocationItem) => {
    if (onChange) {
      onChange(location);
    } else {
      setLocalSelectedLocation(location);
    }
    logger.info(
      LogCategory.USER,
      'Location changed in feature demos',
      { cityId: location.id, cityName: location.title },
      ['HOME', 'FEATURES', 'CITY_CHANGE']
    );
  };
  
  const [personalized, setPersonalized] = useState<FeatureDemo>({
    title: "Personalized Recommendations",
    content: null,
    loading: true
  });
  const [search, setSearch] = useState<FeatureDemo>({
    title: "Natural Language Search",
    content: null,
    loading: true
  });
  const [contextual, setContextual] = useState<FeatureDemo>({
    title: "Contextual Awareness",
    content: null,
    loading: true
  });

  // Effect to load feature data based on selected location
  useEffect(() => {
    // Load data for each feature
    loadPersonalizedRecommendations();
    loadSearchResults();
    loadContextualSuggestions();
    
    // Log the change for analytics
    logger.info(
      LogCategory.USER,
      'Loading features for city',
      { cityId: effectiveLocation.id, cityName: effectiveLocation.title },
      ['HOME', 'FEATURES', 'INIT']
    );
  }, [effectiveLocation]); // Update when location changes

  // Load personalized recommendations for the selected location
  const loadPersonalizedRecommendations = async () => {
    setPersonalized(prev => ({ ...prev, loading: true }));
    
    try {
      // In a real implementation, this would call the API to get personalized recommendations
      // For now, we'll simulate a delay and return mock data
      setTimeout(() => {
        const recommendations = generatePersonalizedRecommendations(effectiveLocation.title);
        
        setPersonalized({
          title: "Personalized Recommendations",
          content: renderPersonalizedContent(recommendations),
          loading: false
        });
      }, 800);
    } catch (error) {
      console.error("Error loading personalized recommendations:", error);
      setPersonalized(prev => ({ ...prev, loading: false }));
    }
  };

  // Load search results for the selected location
  const loadSearchResults = async () => {
    setSearch(prev => ({ ...prev, loading: true }));
    
    try {
      // In a real implementation, this would call the API to get search results
      // For now, we'll simulate a delay and return mock data
      setTimeout(() => {
        const results = generateSearchResults(effectiveLocation.title);
        
        setSearch({
          title: "Natural Language Search",
          content: renderSearchContent(results, effectiveLocation.title),
          loading: false
        });
      }, 1000);
    } catch (error) {
      console.error("Error loading search results:", error);
      setSearch(prev => ({ ...prev, loading: false }));
    }
  };

  // Load contextual suggestions for the selected location
  const loadContextualSuggestions = async () => {
    setContextual(prev => ({ ...prev, loading: true }));
    
    try {
      // In a real implementation, this would call the API to get contextual suggestions
      // For now, we'll simulate a delay and return mock data
      setTimeout(() => {
        const suggestions = generateContextualSuggestions(effectiveLocation.title);
        
        setContextual({
          title: "Contextual Awareness",
          content: renderContextualContent(suggestions),
          loading: false
        });
      }, 1200);
    } catch (error) {
      console.error("Error loading contextual suggestions:", error);
      setContextual(prev => ({ ...prev, loading: false }));
    }
  };

  // Render personalized recommendations content
  const renderPersonalizedContent = (recommendations: PersonalizedRecommendation[]) => (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 mb-3">
        {demoInterests.slice(0, 3).map(interest => (
          <div 
            key={interest.id}
            className={`px-2.5 py-1 bg-[${interest.color}]/20 text-[${interest.color}] rounded-full text-xs flex items-center gap-1`}
            style={{ 
              backgroundColor: `${interest.color}20`,
              color: interest.color
            }}
          >
            <span>{interest.emoji}</span> {interest.name}
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {recommendations.map((rec, index) => (
          <div key={index} className="p-2 bg-white/5 rounded flex gap-3 items-center">
            <div className="w-8 h-8 flex-shrink-0 bg-[#4ECDC4]/20 rounded-md flex items-center justify-center text-lg">
              {rec.emoji}
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium">{rec.name}</div>
              <div className="text-xs text-white/50">{rec.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render search results content
  const renderSearchContent = (results: SearchResult[], location: string) => (
    <div className="w-full">
      <div className="flex mb-3 p-2 bg-white/5 rounded-lg">
        <div className="text-sm text-left text-white/80">
          Find me the best places to visit in {location}
        </div>
      </div>
      <div className="space-y-2">
        {results.map((result, index) => (
          <div key={index} className="p-2 bg-white/5 rounded flex gap-3 items-center">
            <div className="flex-1 text-left">
              <div className="text-sm font-medium">{result.name}</div>
              <div className="text-xs text-white/50">{result.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render contextual suggestions content
  const renderContextualContent = (suggestions: ContextualSuggestion[]) => (
    <div className="w-full">
      <div className="flex justify-between items-center mb-3 p-2 bg-white/5 rounded-lg">
        <div className="text-xs text-white/60">Saturday, 6:30 PM</div>
        <div className="text-xs text-white/60 flex items-center gap-1">
          <span>🌤️</span> {getWeatherForLocation(effectiveLocation.title)}
        </div>
      </div>
      <div className="space-y-2">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="p-2 bg-white/5 rounded flex gap-3 items-start">
            <div className="w-8 h-8 flex-shrink-0 bg-[#FF6B6B]/20 rounded-md flex items-center justify-center text-lg mt-1">
              {suggestion.emoji}
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium">{suggestion.type}</div>
              <div className="text-xs text-white/50 mb-1">{suggestion.description}</div>
              <div className="text-xs font-medium text-[#FF6B6B]/80">{suggestion.name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Generate mock data for features
  function generatePersonalizedRecommendations(location: string): PersonalizedRecommendation[] {
    const cityData = getCityData(location);
    
    // City-specific recommendations
    switch (location) {
      case 'Tokyo':
        return [
          { id: '1', name: 'Chatei Hatou', description: 'Traditional coffee experience in Shibuya', type: 'cafe', emoji: '☕', tags: ['Coffee', 'Traditional'] },
          { id: '2', name: 'Mount Takao', description: 'Popular hiking spot with temple views', type: 'nature', emoji: '🥾', tags: ['Hiking', 'Temple'] }
        ];
      case 'New York':
        return [
          { id: '1', name: 'Stumptown Coffee', description: 'Artisanal coffee roasters in Manhattan', type: 'cafe', emoji: '☕', tags: ['Coffee', 'Artisanal'] },
          { id: '2', name: 'The High Line', description: 'Elevated linear park on former rail track', type: 'park', emoji: '🌳', tags: ['Nature', 'Walking'] }
        ];
      case 'London':
        return [
          { id: '1', name: 'Monmouth Coffee', description: 'Specialty coffee at Borough Market', type: 'cafe', emoji: '☕', tags: ['Coffee', 'Market'] },
          { id: '2', name: 'Hampstead Heath', description: 'Ancient park with swimming ponds', type: 'park', emoji: '🌳', tags: ['Nature', 'Swimming'] }
        ];
      default:
        return [
          { id: '1', name: `${location} Coffee House`, description: 'Popular local coffee shop', type: 'cafe', emoji: '☕', tags: ['Coffee', 'Local'] },
          { id: '2', name: `${location} Park Trails`, description: 'Nature trails close to the city', type: 'park', emoji: '🥾', tags: ['Hiking', 'Nature'] }
        ];
    }
  }

  function generateSearchResults(location: string): SearchResult[] {
    // City-specific search results
    switch (location) {
      case 'Tokyo':
        return [
          { id: '1', name: 'Shinjuku Gyoen', description: 'Beautiful park with traditional gardens' },
          { id: '2', name: 'Meiji Shrine', description: 'Historic shrine surrounded by forest' }
        ];
      case 'New York':
        return [
          { id: '1', name: 'Central Park', description: 'Massive urban park in the city center' },
          { id: '2', name: 'The Metropolitan Museum', description: 'One of the world\'s largest art museums' }
        ];
      case 'London':
        return [
          { id: '1', name: 'The British Museum', description: 'World-class collection of art and artifacts' },
          { id: '2', name: 'Hyde Park', description: 'Historic park in the center of London' }
        ];
      default:
        return [
          { id: '1', name: `${location} Central Park`, description: 'Main city park with attractions' },
          { id: '2', name: `${location} Museum`, description: 'The city\'s main cultural museum' }
        ];
    }
  }

  function generateContextualSuggestions(location: string): ContextualSuggestion[] {
    // City-specific contextual suggestions
    switch (location) {
      case 'Tokyo':
        return [
          { 
            type: 'Dinner Suggestion', 
            emoji: '🍜', 
            name: 'Ichiran Ramen, Roppongi Branch', 
            description: 'Perfect for a Saturday evening meal',
            context: { time: 'evening', weather: 'clear' }
          }
        ];
      case 'New York':
        return [
          { 
            type: 'Evening Entertainment', 
            emoji: '🎭', 
            name: 'Broadway Shows - Times Square', 
            description: 'Perfect time for an evening show',
            context: { time: 'evening', weather: 'clear' }
          }
        ];
      case 'London':
        return [
          { 
            type: 'Evening Dining', 
            emoji: '🍽️', 
            name: 'Covent Garden Restaurants', 
            description: 'Vibrant atmosphere on Saturday night',
            context: { time: 'evening', weather: 'light rain' }
          }
        ];
      default:
        return [
          { 
            type: 'Local Experience', 
            emoji: '🍽️', 
            name: `${location} Downtown District`, 
            description: 'Best area for evening dining',
            context: { time: 'evening' }
          }
        ];
    }
  }

  function getWeatherForLocation(location: string): string {
    // Mock weather for different locations
    const weatherMap: Record<string, string> = {
      'Tokyo': '72°F Clear',
      'New York': '68°F Partly Cloudy',
      'London': '64°F Light Rain',
      'San Francisco': '62°F Foggy',
      'Los Angeles': '75°F Sunny',
      'Paris': '66°F Cloudy',
      'Sydney': '80°F Sunny'
    };
    
    return weatherMap[location] || '70°F Clear';
  }

  return (
    <div className="w-full">
      {/* City Location Selector - centered above feature cards */}
      <div className="flex flex-col sm:flex-row justify-center items-center mb-6 relative z-10">
        <div className="mb-2 sm:mb-0 sm:mr-3 text-white/60 text-sm">
          Select a city:
        </div>
        <LocationDropdown
          locations={cityLocations}
          selectedLocation={effectiveLocation}
          onChange={handleLocationChange}
          className="w-64"
        />
      </div>
      
      {/* Feature Cards Grid - Centered with flex */}
      <div className="flex flex-col lg:flex-row justify-center items-stretch gap-8 sm:gap-10 py-6 sm:py-8 w-full">
        {/* Personalized Recommendations */}
        <div className="rounded-lg border border-white/5 bg-white/3 p-4 sm:p-6 flex flex-col items-center text-center w-full lg:w-1/3 max-w-sm mx-auto hover:bg-white/5 transition-all duration-300">
          <div className="mb-3 sm:mb-4 text-[#4ECDC4]/80">
            <Icon name="Star" size="xl" weight="duotone" />
          </div>
          <h3 className="mb-2 text-lg sm:text-xl font-bold">{personalized.title}</h3>
          <p className="text-white/60 text-sm sm:text-base mb-4">
            Get place recommendations based on your unique interests and preferences.
          </p>
          
          {/* Component Showcase - Personalized Recommendations */}
          <div className="w-full mt-2 mb-4 p-3 bg-[#0A121F] rounded-lg border border-white/10">
            {personalized.loading ? (
              <div className="animate-pulse space-y-3">
                <div className="flex gap-2">
                  <div className="h-6 bg-white/10 rounded w-16"></div>
                  <div className="h-6 bg-white/10 rounded w-16"></div>
                </div>
                <div className="h-12 bg-white/10 rounded"></div>
                <div className="h-12 bg-white/10 rounded"></div>
              </div>
            ) : personalized.content}
          </div>
        </div>

        {/* Natural Language Search */}
        <div className="rounded-lg border border-white/5 bg-white/3 p-4 sm:p-6 flex flex-col items-center text-center w-full lg:w-1/3 max-w-sm mx-auto hover:bg-white/5 transition-all duration-300">
          <div className="mb-3 sm:mb-4 text-[#AAC789]/80">
            <Icon name="ChatCircleText" size="xl" weight="duotone" />
          </div>
          <h3 className="mb-2 text-lg sm:text-xl font-bold">{search.title}</h3>
          <p className="text-white/60 text-sm sm:text-base mb-4">
            Ask for recommendations in natural language, just like chatting with a friend.
          </p>
          
          {/* Component Showcase - Natural Language Search */}
          <div className="w-full mt-2 mb-4 p-3 bg-[#0A121F] rounded-lg border border-white/10">
            {search.loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-10 bg-white/10 rounded"></div>
                <div className="h-12 bg-white/10 rounded"></div>
                <div className="h-12 bg-white/10 rounded"></div>
              </div>
            ) : search.content}
          </div>
        </div>

        {/* Contextual Awareness */}
        <div className="rounded-lg border border-white/5 bg-white/3 p-4 sm:p-6 flex flex-col items-center text-center w-full lg:w-1/3 max-w-sm mx-auto hover:bg-white/5 transition-all duration-300">
          <div className="mb-3 sm:mb-4 text-[#FF6B6B]/80">
            <Icon name="Lightbulb" size="xl" weight="duotone" />
          </div>
          <h3 className="mb-2 text-lg sm:text-xl font-bold">{contextual.title}</h3>
          <p className="text-white/60 text-sm sm:text-base mb-4">
            Get recommendations based on time, weather, and your current location.
          </p>
          
          {/* Component Showcase - Contextual Awareness */}
          <div className="w-full mt-2 mb-4 p-3 bg-[#0A121F] rounded-lg border border-white/10">
            {contextual.loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-8 bg-white/10 rounded flex justify-between">
                  <div className="w-20 bg-white/20 rounded"></div>
                  <div className="w-20 bg-white/20 rounded"></div>
                </div>
                <div className="h-20 bg-white/10 rounded"></div>
              </div>
            ) : contextual.content}
          </div>
        </div>
      </div>
    </div>
  );
} 