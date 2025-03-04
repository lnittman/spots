import { NextRequest, NextResponse } from "next/server";
import { LIMLogger, LogCategory } from "@/lib/lim/logging";
import { LLMClient, LLMProvider } from "@/lib/lim/llm-client";
import { PromptTemplate, TemplateType, OutputFormat, getTemplate, fillTemplate } from "@/lib/lim/templates";

// Initialize logger
const logger = LIMLogger.getInstance();

// Cache for location-based interests
const interestsCache: Record<string, { interests: string[], timestamp: number }> = {};

// Cache TTL (2 hours)
const CACHE_TTL = 1000 * 60 * 60 * 2;

// Sample interests data for different locations as fallback
const locationInterests: Record<string, string[]> = {
  "San Francisco": [
    "Coffee", "Tech", "Hiking", "Startups", "Seafood", 
    "Wine", "Art Galleries", "Bay Views", "Cycling", "Dim Sum"
  ],
  "New York": [
    "Theater", "Pizza", "Museums", "Fashion", "Finance", 
    "Jazz", "Bagels", "City Parks", "Skyscrapers", "Bookstores"
  ],
  "Los Angeles": [
    "Beaches", "Film", "Tacos", "Celebrity Spotting", "Hiking", 
    "Smoothies", "Vintage Shopping", "Street Art", "Yoga", "Rooftop Bars"
  ],
  "London": [
    "Pubs", "Museums", "Theatre", "Parks", "Afternoon Tea", 
    "Markets", "History", "Architecture", "Football", "Live Music"
  ],
  "Tokyo": [
    "Ramen", "Anime", "Cherry Blossoms", "Technology", "Street Fashion", 
    "Temples", "Karaoke", "Gaming", "Sushi", "Night Life"
  ],
  "Paris": [
    "Cafés", "Art", "Fashion", "Pastries", "Wine", 
    "Architecture", "Museums", "Seine", "Cheese", "Literature"
  ]
};

// Default interests for fallback
const defaultInterests = [
  "Coffee", "Food", "Shopping", "Art", "Music", 
  "Nature", "Tech", "Sports", "Reading", "Nightlife",
  "Wine", "Beer", "Yoga", "Hiking", "Museums",
  "Photography", "Theater", "Dance", "Film", "History"
];

// GET /api/interests - Get interests for a location
export async function GET(request: NextRequest) {
  // Create a unique request ID for tracking
  const requestId = logger.createRequestId();
  
  try {
    // Extract location from query params
    const url = new URL(request.url);
    const location = url.searchParams.get("location");
    const refresh = url.searchParams.has("refresh");
    const favCitiesParam = url.searchParams.get("favoriteCities");
    
    // Parse favorite cities if provided
    let favoriteCities: string[] = [];
    if (favCitiesParam) {
      try {
        favoriteCities = JSON.parse(favCitiesParam);
        if (!Array.isArray(favoriteCities)) {
          favoriteCities = [];
        }
      } catch (e) {
        logger.warn(
          LogCategory.API,
          `Invalid favoriteCities parameter: ${favCitiesParam}`,
          { favCitiesParam },
          ['API_WARNING', 'INTERESTS']
        );
      }
    }
    
    if (!location) {
      // If no location provided, return an error
      logger.error(
        LogCategory.API,
        "Missing location parameter",
        { requestId },
        ['API_ERROR', 'INTERESTS']
      );
      
      return NextResponse.json({ 
        error: "Location parameter is required",
        requestId 
      }, { status: 400 });
    }
    
    logger.info(
      LogCategory.API,
      `Processing interests request for ${location}`,
      { location, refresh, favoriteCities, requestId },
      ['API_REQUEST', 'INTERESTS']
    );
    
    // Check if we have cached interests for this location and it's not a forced refresh
    const cacheKey = `${location.toLowerCase()}:${favoriteCities.sort().join(',')}`;
    const cachedInterests = interestsCache[cacheKey];
    const cacheValid = cachedInterests && 
      (Date.now() - cachedInterests.timestamp < CACHE_TTL) && 
      !refresh;
    
    if (cacheValid) {
      // Return cached interests
      logger.info(
        LogCategory.CACHE,
        `Cache hit for interests:${cacheKey}`,
        { location, favoriteCities, count: cachedInterests.interests.length },
        ['CACHE_HIT', 'INTERESTS']
      );
      
      return NextResponse.json({ 
        interests: cachedInterests.interests,
        fromCache: true,
        cachedAt: new Date(cachedInterests.timestamp).toISOString(),
        requestId
      });
    }
    
    logger.info(
      LogCategory.CACHE,
      `Cache miss for interests:${cacheKey}`,
      { location, favoriteCities },
      ['CACHE_MISS', 'INTERESTS']
    );
    
    // Generate interests using the LIM pipeline
    let interests = await generateInterestsWithLIM(location, favoriteCities, requestId);
    
    // Cache the results
    interestsCache[cacheKey] = {
      interests,
      timestamp: Date.now()
    };
    
    logger.info(
      LogCategory.CACHE,
      `Cached interests for ${cacheKey}`,
      { location, favoriteCities, count: interests.length },
      ['CACHE_SET', 'INTERESTS']
    );
    
    return NextResponse.json({ 
      interests,
      fromCache: false,
      location,
      favoriteCities,
      requestId
    });
  } catch (error) {
    logger.error(
      LogCategory.API,
      `Error fetching interests: ${error}`,
      { error },
      ['API_ERROR', 'INTERESTS']
    );
    
    return NextResponse.json({ 
      error: "Failed to fetch interests",
      interests: defaultInterests,
      requestId
    }, { status: 500 });
  }
}

/**
 * Generate interests using the LIM pipeline
 */
async function generateInterestsWithLIM(
  location: string, 
  favoriteCities: string[] = [], 
  requestId: string
): Promise<string[]> {
  logger.info(
    LogCategory.INTEREST,
    `Generating interests for location: ${location}`,
    { location, favoriteCities, requestId },
    ['INTEREST_GENERATION', 'LOCATION_BASED']
  );
  
  try {
    // Get the current season for context
    const currentSeason = getCurrentSeason();
    
    // Start timer for LLM request
    const endTimer = logger.startTimer(
      LogCategory.INTEREST,
      `Generating interests for ${location}`,
      ['INTEREST_GENERATION', 'LLM_REQUEST'],
    );
    
    // Initialize LLM client
    const llmClient = new LLMClient();
    
    // Get the interest generation template
    const template = getTemplate(TemplateType.INTEREST_GENERATION);
    
    // Fill the template with parameters
    const params = {
      location,
      favoriteCities: favoriteCities.join(', '),
      season: currentSeason,
      currentDate: new Date().toISOString().split('T')[0],
    };
    
    // Process the template using the LLM client
    const result = await llmClient.processTemplate(template, params, {
      temperature: 0.7,
      tags: ['INTEREST_GENERATION', 'LOCATION_BASED', location.replace(/\s+/g, '_').toUpperCase()]
    });
    
    // End the timer
    await endTimer();
    
    // Extract interests from the LLM response
    let interests: string[] = [];
    
    if (result && result.interests && Array.isArray(result.interests)) {
      interests = result.interests;
      
      logger.info(
        LogCategory.INTEREST,
        `Generated ${interests.length} interests for ${location}`,
        { location, interestCount: interests.length },
        ['INTEREST_GENERATION', 'SUCCESS']
      );
    } else {
      logger.warn(
        LogCategory.INTEREST,
        `Invalid LLM response format for interests`,
        { location, result },
        ['INTEREST_GENERATION', 'INVALID_RESPONSE']
      );
      
      // Fall back to sample data
      interests = generateSampleInterests(location, favoriteCities);
    }
    
    return interests;
  } catch (error) {
    // Log the error
    logger.error(
      LogCategory.INTEREST,
      `Error generating interests with LIM: ${error}`,
      { error, location, favoriteCities },
      ['INTEREST_GENERATION', 'ERROR']
    );
    
    // Fall back to sample data
    logger.warn(
      LogCategory.LLM,
      `LLM request failed, falling back to sample data: ${error}`,
      { error, location },
      ['FALLBACK', 'LLM_ERROR']
    );
    
    return generateSampleInterests(location, favoriteCities);
  }
}

/**
 * Generate sample interests for a location based on default data
 */
function generateSampleInterests(location: string, favoriteCities: string[] = []): string[] {
  // Try to match with our predefined locations
  const normalizedLocation = location.toLowerCase();
  let interests: string[] = [];
  
  // Add interests for the primary location
  const matchedLocation = Object.keys(locationInterests).find(
    loc => loc.toLowerCase().includes(normalizedLocation) || 
           normalizedLocation.includes(loc.toLowerCase())
  );
  
  if (matchedLocation) {
    // Use predefined interests for this location
    interests = [...locationInterests[matchedLocation]];
  } else {
    // Try to find a partial match
    for (const [loc, locInterests] of Object.entries(locationInterests)) {
      if (loc.toLowerCase().includes(normalizedLocation) || 
          normalizedLocation.includes(loc.toLowerCase())) {
        interests.push(...locInterests.slice(0, 5));
      }
    }
  }
  
  // Add some interests from favorite cities
  const allFavCityInterests: string[] = [];
  favoriteCities.forEach(city => {
    const cityMatch = Object.keys(locationInterests).find(
      loc => loc.toLowerCase().includes(city.toLowerCase()) || 
             city.toLowerCase().includes(loc.toLowerCase())
    );
    
    if (cityMatch && locationInterests[cityMatch]) {
      // Take a random subset of interests from this city
      const cityInterests = locationInterests[cityMatch];
      const randomCount = Math.min(3, cityInterests.length);
      const randomIndices = Array.from({ length: cityInterests.length }, (_, i) => i)
        .sort(() => Math.random() - 0.5)
        .slice(0, randomCount);
      
      randomIndices.forEach(idx => {
        allFavCityInterests.push(cityInterests[idx]);
      });
    }
  });
  
  // Add favorite city interests
  interests.push(...allFavCityInterests);
  
  // If still no matches, use default interests plus some randomized ones
  if (interests.length < 5) {
    interests = [...defaultInterests].sort(() => Math.random() - 0.5).slice(0, 15);
  }
  
  // Deduplicate
  interests = [...new Set(interests)];
  
  // Shuffle and limit to 20 interests
  return interests.sort(() => Math.random() - 0.5).slice(0, 20);
}

/**
 * Get the current season based on the date
 */
function getCurrentSeason(): string {
  const now = new Date();
  const month = now.getMonth();
  
  if (month >= 2 && month <= 4) return "Spring";
  if (month >= 5 && month <= 7) return "Summer";
  if (month >= 8 && month <= 10) return "Fall";
  return "Winter";
} 