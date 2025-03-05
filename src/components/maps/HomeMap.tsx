'use client';

import { useState, useEffect, useRef } from 'react';
import { MapView } from './MapView';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LocationDropdown, type LocationItem } from '@/components/LocationDropdown';
import { defaultCities } from '@/lib/cities-data';

// Large Interest Model (LIM) Pipeline Configuration
// This system handles interest processing, spot discovery, and personalized recommendations
const LIM_CONFIG = {
  // API keys would be stored securely in environment variables in production
  API_KEYS: {
    OPENROUTER: process.env.OPENROUTER_API_KEY || "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",
    GEMINI: process.env.GEMINI_API_KEY || "AIzaSyDtwd53YcpYsiYk5uXBZoPh0xiKxIQFmIk",
  },
  REFRESH_INTERVAL: '24h', // How often the cron job refreshes data
  VERSION: '0.1.0',
  LAST_UPDATE: new Date().toISOString(),
};

// Use default cities from our cities-data module
const sampleLocations: LocationItem[] = defaultCities.map(city => ({
  id: city.id,
  title: city.name,
  coordinates: city.coordinates,
  emoji: city.emoji,
  trending: city.trending,
  type: city.type
}));

// These interests would be dynamically generated and updated by the LIM
const sampleInterests = [
  { id: '1', name: 'Coffee', emoji: '☕', color: '#4ECDC4', trending: true },
  { id: '2', name: 'Hiking', emoji: '🥾', color: '#AAC789', trending: true },
  { id: '3', name: 'Art', emoji: '🎨', color: '#FFD166', trending: false },
  { id: '4', name: 'Food', emoji: '🍜', color: '#FF6B6B', trending: true },
  { id: '5', name: 'Music', emoji: '🎵', color: '#4ECDC4', trending: false },
  { id: '6', name: 'Books', emoji: '📚', color: '#AAC789', trending: false },
  { id: '7', name: 'Shopping', emoji: '🛍️', color: '#FFD166', trending: true },
  { id: '8', name: 'Nature', emoji: '🌳', color: '#AAC789', trending: false }
];

// This would be populated by the LIM pipeline's deep research function
const sampleRecommendations = {
  'coffee-sf': [
    {
      id: 'c1',
      name: 'Ritual Coffee Roasters',
      description: 'Specialty coffee shop with single-origin beans and minimalist decor.',
      type: 'cafe',
      address: '1026 Valencia St, San Francisco',
      tags: ['Coffee', 'Wifi', 'Pastries'],
      checkIns: 128,
      lastUpdated: new Date().toLocaleDateString()
    },
    {
      id: 'c2',
      name: 'Sightglass Coffee',
      description: 'Industrial-chic coffee bar with house-roasted beans and light bites.',
      type: 'cafe',
      address: '270 7th St, San Francisco',
      tags: ['Coffee', 'Roastery', 'Avocado Toast'],
      checkIns: 97,
      lastUpdated: new Date().toLocaleDateString()
    }
  ],
  // More sample data...
  'coffee-la': [
    {
      id: 'cl1',
      name: 'Intelligentsia Coffee',
      description: 'Upscale coffeehouse chain known for direct-trade beans & creative drinks.',
      type: 'cafe',
      address: '3922 Sunset Blvd, Los Angeles',
      tags: ['Coffee', 'Hip', 'Pour Over'],
      checkIns: 152,
      lastUpdated: new Date().toLocaleDateString()
    },
    {
      id: 'cl2',
      name: 'Blue Bottle Coffee',
      description: 'Trendy cafe serving specialty coffee in a minimalist space.',
      type: 'cafe',
      address: '8301 Beverly Blvd, Los Angeles',
      tags: ['Coffee', 'Pastries', 'Minimalist'],
      checkIns: 86,
      lastUpdated: new Date().toLocaleDateString()
    }
  ],
  'hiking-la': [
    {
      id: 'hl1',
      name: 'Runyon Canyon Park',
      description: 'Popular hiking spot with panoramic views of LA and celebrity sightings.',
      type: 'park',
      address: '2000 N Fuller Ave, Los Angeles',
      tags: ['Hiking', 'Views', 'Celebrity Spotting'],
      checkIns: 310,
      lastUpdated: new Date().toLocaleDateString()
    },
    {
      id: 'hl2',
      name: 'Griffith Park',
      description: 'Vast urban park with hiking trails, the Observatory, and LA views.',
      type: 'park',
      address: '4730 Crystal Springs Dr, Los Angeles',
      tags: ['Hiking', 'Observatory', 'Vast'],
      checkIns: 427,
      lastUpdated: new Date().toLocaleDateString()
    }
  ],
  'nature-la': [
    {
      id: 'nl1',
      name: 'Los Angeles County Arboretum',
      description: 'Botanical garden featuring plants from around the world and roaming peacocks.',
      type: 'park',
      address: '301 N Baldwin Ave, Arcadia',
      tags: ['Nature', 'Botanical Garden', 'Peaceful'],
      checkIns: 189,
      lastUpdated: new Date().toLocaleDateString()
    },
    {
      id: 'nl2',
      name: 'Descanso Gardens',
      description: '150-acre botanical garden with seasonal flower displays and a Japanese garden.',
      type: 'park',
      address: '1418 Descanso Dr, La Cañada Flintridge',
      tags: ['Nature', 'Flowers', 'Serene'],
      checkIns: 142,
      lastUpdated: new Date().toLocaleDateString()
    }
  ],
  'art-la': [
    {
      id: 'al1',
      name: 'The Broad',
      description: 'Contemporary art museum housing the Broad collection with iconic architecture.',
      type: 'museum',
      address: '221 S Grand Ave, Los Angeles',
      tags: ['Art', 'Modern', 'Architecture'],
      checkIns: 278,
      lastUpdated: new Date().toLocaleDateString()
    },
    {
      id: 'al2',
      name: 'Los Angeles County Museum of Art (LACMA)',
      description: 'Expansive museum complex with diverse art collections spanning ancient to contemporary.',
      type: 'museum',
      address: '5905 Wilshire Blvd, Los Angeles',
      tags: ['Art', 'Culture', 'Exhibits'],
      checkIns: 391,
      lastUpdated: new Date().toLocaleDateString()
    }
  ],
  'food-la': [
    {
      id: 'fl1',
      name: 'Grand Central Market',
      description: 'Historic market featuring diverse food vendors, fresh produce, and specialty items.',
      type: 'food',
      address: '317 S Broadway, Los Angeles',
      tags: ['Food', 'Market', 'Variety'],
      checkIns: 467,
      lastUpdated: new Date().toLocaleDateString()
    },
    {
      id: 'fl2',
      name: 'Bestia',
      description: 'Rustic-chic restaurant serving Italian fare, house-made charcuterie, and wood-fired pizzas.',
      type: 'restaurant',
      address: '2121 E 7th Pl, Los Angeles',
      tags: ['Food', 'Italian', 'Trendy'],
      checkIns: 312,
      lastUpdated: new Date().toLocaleDateString()
    }
  ]
};

/**
 * Large Interest Model (LIM) class for generating AI-powered recommendations
 */
export class LargeInterestModel {
  // Identify trending interests based on user data and check-ins
  static generateTrendingInterests(userLocation: string) {
    // In reality, this would analyze check-in data, user profiles, and seasonal factors
    // For now, we'll return pre-defined trending interests
    return sampleInterests.filter(interest => interest.trending);
  }
  
  // Discover personalized spots based on user interests and previous behavior
  static async discoverSpots(interests: string[], location: string, userHistory: any[] = []) {
    // This would make API calls to the LLM pipeline in production
    // For demo, we'll return from our sample data
    
    // Find matching recommendations or generate new ones
    const locationKey = location.toLowerCase().replace(' ', '');
    const results: any[] = [];
    
    interests.forEach(interestId => {
      const interest = sampleInterests.find(i => i.id === interestId);
      if (!interest) return;
      
      const interestKey = interest.name.toLowerCase();
      const lookupKey = `${interestKey}-${locationKey}` as keyof typeof sampleRecommendations;
      
      if (sampleRecommendations[lookupKey]) {
        results.push(...sampleRecommendations[lookupKey]);
      }
    });
    
    // Sort by relevance (in this demo, by check-ins)
    return results.sort((a, b) => b.checkIns - a.checkIns);
  }
  
  // This would be the function called by the cron job to refresh recommendation data
  static async refreshRecommendationData() {
    console.log("LIM: Refreshing recommendation data");
    
    // In production, this would:
    // 1. Retrieve trending topics, locations, and interests
    // 2. For each combination, perform deep research using Perplexity/OpenRouter
    // 3. Analyze and format results with Gemini
    // 4. Store in database for fast retrieval
    
    // Mock the result for demo
    return {
      success: true,
      processedCombinations: 32,
      timestamp: new Date().toISOString()
    };
  }
}

export function HomeMap() {
  // Force log of locations to check what's available
  useEffect(() => {
    console.log("Available locations:", sampleLocations);
  }, []);

  const [selectedLocation, setSelectedLocation] = useState(sampleLocations[0]); // Los Angeles is first
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredInterest, setHoveredInterest] = useState<string | null>(null);
  const interestsContainerRef = useRef<HTMLDivElement>(null);

  // Function to toggle interest selection
  const toggleInterest = (interestId: string) => {
    setIsLoading(true);
    
    if (selectedInterests.includes(interestId)) {
      setSelectedInterests(selectedInterests.filter(id => id !== interestId));
    } else {
      setSelectedInterests([...selectedInterests, interestId]);
    }
    
    // Simulate loading delay for data refresh
    setTimeout(() => {
      setIsLoading(false);
    }, 400);
  };

  // Update recommendations based on selected location and interests
  useEffect(() => {
    if (selectedLocation && selectedInterests.length > 0) {
      setIsLoading(true);
      
      // Simulate API call to the LIM pipeline
      setTimeout(async () => {
        const spots = await LargeInterestModel.discoverSpots(
          selectedInterests, 
          selectedLocation.title
        );
        setRecommendations(spots);
        setIsLoading(false);
      }, 600);
    } else {
      setRecommendations([]);
    }
  }, [selectedLocation, selectedInterests]);

  // Get interest button color based on selection and hover
  const getInterestButtonStyle = (interest: typeof sampleInterests[0], isSelected: boolean, isHovered: boolean) => {
    const color = interest.color;
    
    // Calculate style based on state
    if (isSelected) {
      return {
        variant: "default" as const,
        className: `bg-[${color}]/70 hover:bg-[${color}]/80 border-[${color}]/30 text-white 
                   shadow-md` 
      };
    } else if (isHovered) {
      return {
        variant: "outline" as const,
        className: `border-[${color}]/30 bg-white/5 hover:bg-white/10 text-white/90
                   shadow-sm`
      };
    } else {
      return {
        variant: "outline" as const,
        className: `border-white/10 hover:bg-white/5 text-white/80
                   transition-all duration-300`
      };
    }
  };

  // Get tag color based on content
  const getTagStyle = (tag: string) => {
    const tagColors: {[key: string]: string} = {
      "Coffee": "bg-[#4ECDC4]/10 text-[#4ECDC4]/80 border-[#4ECDC4]/20",
      "Hiking": "bg-[#AAC789]/10 text-[#AAC789]/80 border-[#AAC789]/20",
      "Art": "bg-[#FFD166]/10 text-[#FFD166]/80 border-[#FFD166]/20",
      "Food": "bg-[#FF6B6B]/10 text-[#FF6B6B]/80 border-[#FF6B6B]/20",
      "Nature": "bg-[#AAC789]/10 text-[#AAC789]/80 border-[#AAC789]/20",
      "Views": "bg-[#4ECDC4]/10 text-[#4ECDC4]/80 border-[#4ECDC4]/20"
    };
    
    const colorKey = Object.keys(tagColors).find(key => 
      tag.toLowerCase().includes(key.toLowerCase())
    ) || "Coffee";
    
    return tagColors[colorKey] || "bg-white/5 text-white/70 border-white/10";
  };

  // Function to handle location change
  const handleLocationChange = (location: LocationItem) => {
    setSelectedLocation(location);
    
    // Log the change for analytics
    console.log("Location changed to:", location.title);
  };

  return (
    <div className="flex flex-col">
      {/* Horizontal Interest Picker with Scroll */}
      <div className="w-full mb-4">
        <h3 className="text-sm font-medium mb-2 text-white/50">Select your interests</h3>
        <div className="relative px-4">
          <div 
            ref={interestsContainerRef}
            className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar mx-[-1rem] px-[1rem]"
          >
            {sampleInterests.map((interest) => {
              const isSelected = selectedInterests.includes(interest.id);
              const isHovered = hoveredInterest === interest.id;
              const buttonStyle = getInterestButtonStyle(interest, isSelected, isHovered);
              
              return (
                <Button
                  key={interest.id}
                  variant={buttonStyle.variant}
                  size="sm"
                  className={`flex-shrink-0 flex items-center gap-1.5 min-w-fit ${buttonStyle.className} 
                             transition-all duration-300 ease-in-out`}
                  onClick={() => toggleInterest(interest.id)}
                  onMouseEnter={() => setHoveredInterest(interest.id)}
                  onMouseLeave={() => setHoveredInterest(null)}
                  style={{
                    borderColor: isSelected || isHovered ? interest.color + '40' : undefined,
                    backgroundColor: isSelected ? interest.color + '40' : isHovered ? 'rgba(255,255,255,0.05)' : undefined
                  }}
                >
                  <span className="text-lg">{interest.emoji}</span>
                  <span>{interest.name}</span>
                  {interest.trending && (
                    <span className="ml-1 text-xs px-1 py-0.5 bg-white/10 rounded-full">↑</span>
                  )}
                </Button>
              );
            })}
          </div>
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#050A14] to-transparent pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#050A14] to-transparent pointer-events-none"></div>
        </div>
      </div>

      {/* Map with Location Dropdown */}
      <div className="relative">
        <LocationDropdown
          locations={sampleLocations}
          selectedLocation={selectedLocation}
          onChange={handleLocationChange}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 w-72 shadow-lg"
        />
        
        <MapView 
          center={selectedLocation.coordinates}
          zoom={11}
          markers={sampleLocations}
          className="h-[350px] md:h-[400px] rounded-md border border-white/5 shadow-md w-full"
          onMarkerClick={(id) => {
            const location = sampleLocations.find(loc => loc.id === id);
            if (location) {
              setSelectedLocation(location);
            }
          }}
        />
      </div>

      {/* Recommendations Section - Only shown when there are results */}
      {!isLoading && recommendations.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold">Recommended in {selectedLocation.title}</h3>
            <Badge className="bg-[#4ECDC4]/20 text-[#4ECDC4]/90 hover:bg-[#4ECDC4]/30">
              {sampleInterests.find(i => i.id === selectedInterests[0])?.name}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec) => (
              <Card key={rec.id} className="bg-white/3 backdrop-blur-sm border border-white/5 transition-all duration-200 hover:bg-white/5">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-lg">{rec.name}</h3>
                    <Badge variant="outline" className="bg-white/10 text-white/80">
                      {rec.checkIns} visits
                    </Badge>
                  </div>
                  <p className="text-sm text-white/60 mb-2">{rec.address}</p>
                  <p className="text-sm mb-3">{rec.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {rec.tags.map((tag: string) => (
                      <Badge 
                        key={tag} 
                        variant="outline" 
                        className={`${getTagStyle(tag)} transition-all duration-200 hover:opacity-90`}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 