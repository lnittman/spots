import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Interest } from "@/components/interest-selector";
import { LIMLogger, LogCategory } from "@/lib/lim/logging";
import { LLMClient, LLMProvider } from "@/lib/lim/llm-client";
import { TemplateType, getTemplate } from "@/lib/lim/templates";

// Cache TTL in seconds (3 days)
const CACHE_TTL = 60 * 60 * 24 * 3;

// Initialize Redis client if environment variables are available
let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// Initialize logger
const logger = LIMLogger.getInstance();

// Initialize LLM client
const llmClient = new LLMClient();

// Default colors for interests based on category
const interestColors: Record<string, string> = {
  food: "#FF6B6B",
  drink: "#4ECDC4",
  activity: "#AAC789",
  culture: "#FFD166",
  outdoors: "#1A535C",
  social: "#FF6B6B",
  shopping: "#FFD166",
  wellness: "#AAC789",
  education: "#4ECDC4",
  default: "#4ECDC4"
};

// Categories for interests
const interestCategories: Record<string, string> = {
  "coffee": "drink",
  "tea": "drink",
  "hiking": "outdoors",
  "biking": "outdoors",
  "swimming": "activity",
  "photography": "activity",
  "art": "culture",
  "music": "culture",
  "food": "food",
  "dining": "food",
  "reading": "education",
  "shopping": "shopping",
  "sports": "activity",
  "history": "culture",
  "nature": "outdoors",
  "tech": "education",
  "museum": "culture",
  "nightlife": "social",
  "yoga": "wellness",
  "meditation": "wellness",
  "beach": "outdoors",
  "architecture": "culture",
  "vintage": "shopping",
  "crafts": "activity",
  "gardening": "outdoors",
  "cooking": "food",
  "dancing": "activity",
  "movies": "culture",
  "theater": "culture",
  "wine": "drink",
  "beer": "drink",
  "fitness": "wellness",
  "running": "activity",
  "festivals": "social",
  "parks": "outdoors",
  "markets": "shopping",
  "bookstores": "shopping",
  "cafes": "food",
  "dessert": "food"
};

// Helper to get category and color for an interest
function getCategoryAndColor(interestId: string): { category: string; color: string } {
  const normalized = interestId.toLowerCase();
  const category = interestCategories[normalized] || "default";
  const color = interestColors[category] || interestColors.default;
  return { category, color };
}

// Get current season based on month
function getCurrentSeason(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "Spring";
  if (month >= 5 && month <= 7) return "Summer";
  if (month >= 8 && month <= 10) return "Fall";
  return "Winter";
}

// Create sample interests (seasonal based on month)
async function generateInterestsForLocation(location: string): Promise<Interest[]> {
  logger.info(
    LogCategory.INTEREST,
    `Generating interests for location: ${location}`,
    { location },
    ['INTEREST_GENERATION', 'LOCATION_BASED']
  );
  
  try {
    // Check if we have available LLM providers
    const availableProviders = llmClient.getAvailableProviders();
    
    if (availableProviders.length === 0) {
      logger.warn(
        LogCategory.LLM,
        "No LLM providers available, falling back to sample data",
        { location },
        ['FALLBACK', 'NO_PROVIDERS']
      );
      return generateSampleInterests(location);
    }
    
    // Get current month and season
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentSeason = getCurrentSeason();
    
    // Get the interest generation template
    const template = getTemplate(TemplateType.INTEREST_GENERATION);
    
    // Process the template with the LLM
    const endTimer = logger.startTimer(
      LogCategory.INTEREST,
      `Generating interests for ${location}`,
      ['INTEREST_GENERATION', 'LLM_REQUEST'],
    );
    
    try {
      // Call LLM with the template
      const interests = await llmClient.processTemplate(
        template,
        {
          location,
          month: currentMonth,
          season: currentSeason,
          context: `Generate interests that would be relevant for users in ${location} during ${currentSeason}.`
        },
        {
          provider: LLMProvider.GEMINI,
          temperature: 0.7,
          tags: ['INTEREST_GENERATION', 'LOCATION_BASED', location.toUpperCase().replace(/\s+/g, '_')]
        }
      );
      
      // Add random sizes for asymmetric grid
      const sizes = ["sm", "md", "lg"];
      const enhancedInterests = interests.map((interest: Interest) => ({
        ...interest,
        size: sizes[Math.floor(Math.random() * sizes.length)] as "sm" | "md" | "lg"
      }));
      
      // End timer with success
      await endTimer();
      
      return enhancedInterests;
    } catch (error) {
      // Log error and end timer
      await endTimer();
      
      // Fall back to sample data
      logger.warn(
        LogCategory.LLM,
        `LLM request failed, falling back to sample data: ${error}`,
        { location, error },
        ['FALLBACK', 'LLM_ERROR']
      );
      
      return generateSampleInterests(location);
    }
  } catch (error) {
    logger.error(
      LogCategory.INTEREST,
      `Error generating interests: ${error}`,
      { location, error },
      ['ERROR', 'INTEREST_GENERATION']
    );
    
    // Fall back to sample data
    return generateSampleInterests(location);
  }
}

// Generate sample interests as fallback
function generateSampleInterests(location: string): Interest[] {
  const currentMonth = new Date().getMonth();
  const isSummer = currentMonth >= 5 && currentMonth <= 8;
  const isWinter = currentMonth === 11 || currentMonth === 0 || currentMonth === 1;
  const isSpring = currentMonth >= 2 && currentMonth <= 4;
  const isFall = currentMonth >= 9 && currentMonth <= 10;
  
  // Base interests that are always available
  const baseInterests = [
    { id: "coffee", name: "Coffee", emoji: "☕", trending: true },
    { id: "food", name: "Food", emoji: "🍽️", trending: true },
    { id: "shopping", name: "Shopping", emoji: "🛍️", trending: false },
    { id: "history", name: "History", emoji: "🏛️", trending: false },
    { id: "art", name: "Art", emoji: "🎨", trending: false },
    { id: "music", name: "Music", emoji: "🎵", trending: false },
  ];
  
  // Seasonal interests
  const seasonalInterests = [
    // Summer interests
    ...(isSummer ? [
      { id: "beach", name: "Beach", emoji: "🏖️", trending: true },
      { id: "hiking", name: "Hiking", emoji: "🥾", trending: true },
      { id: "swimming", name: "Swimming", emoji: "🏊", trending: true },
      { id: "festivals", name: "Festivals", emoji: "🎪", trending: true },
      { id: "parks", name: "Parks", emoji: "🌳", trending: true },
      { id: "ice-cream", name: "Ice Cream", emoji: "🍦", trending: true },
    ] : []),
    
    // Winter interests
    ...(isWinter ? [
      { id: "skiing", name: "Skiing", emoji: "⛷️", trending: true },
      { id: "hot-drinks", name: "Hot Drinks", emoji: "☕", trending: true },
      { id: "holiday-markets", name: "Holiday Markets", emoji: "🎄", trending: true },
      { id: "museums", name: "Museums", emoji: "🏛️", trending: true },
      { id: "comfort-food", name: "Comfort Food", emoji: "🍲", trending: true },
    ] : []),
    
    // Spring interests
    ...(isSpring ? [
      { id: "gardens", name: "Gardens", emoji: "🌷", trending: true },
      { id: "picnics", name: "Picnics", emoji: "🧺", trending: true },
      { id: "cycling", name: "Cycling", emoji: "🚲", trending: true },
      { id: "brunch", name: "Brunch", emoji: "🥞", trending: true },
      { id: "farmers-markets", name: "Farmers Markets", emoji: "🥕", trending: true },
    ] : []),
    
    // Fall interests
    ...(isFall ? [
      { id: "foliage", name: "Fall Foliage", emoji: "🍂", trending: true },
      { id: "pumpkin", name: "Pumpkin Patches", emoji: "🎃", trending: true },
      { id: "cider", name: "Cider", emoji: "🍎", trending: true },
      { id: "hiking", name: "Hiking", emoji: "🥾", trending: true },
      { id: "baking", name: "Baking", emoji: "🥧", trending: true },
    ] : []),
  ];
  
  // Location-specific interests (very basic implementation for demo)
  let locationInterests: Interest[] = [];
  
  if (location.toLowerCase().includes("san francisco")) {
    locationInterests = [
      { id: "tech", name: "Tech", emoji: "💻", trending: true },
      { id: "sourdough", name: "Sourdough", emoji: "🍞", trending: true },
      { id: "golden-gate", name: "Golden Gate", emoji: "🌉", trending: true },
      { id: "fog", name: "Fog Chasing", emoji: "🌫️", trending: false },
    ];
  } else if (location.toLowerCase().includes("new york")) {
    locationInterests = [
      { id: "pizza", name: "Pizza", emoji: "🍕", trending: true },
      { id: "broadway", name: "Broadway", emoji: "🎭", trending: true },
      { id: "central-park", name: "Central Park", emoji: "🏞️", trending: true },
      { id: "bagels", name: "Bagels", emoji: "🥯", trending: true },
    ];
  } else if (location.toLowerCase().includes("los angeles")) {
    locationInterests = [
      { id: "hiking", name: "Hiking", emoji: "🥾", trending: true },
      { id: "beaches", name: "Beaches", emoji: "🏖️", trending: true },
      { id: "movies", name: "Movie Spots", emoji: "🎬", trending: true },
      { id: "celeb-spotting", name: "Celeb Spotting", emoji: "🤩", trending: false },
    ];
  }
  
  // Combine all interests, remove duplicates, and add metadata
  const allInterests = [...baseInterests, ...seasonalInterests, ...locationInterests];
  
  // Create a Set of unique IDs to track duplicates
  const uniqueIds = new Set<string>();
  
  return allInterests
    .filter(interest => {
      // Only keep the first occurrence of each interest ID
      if (uniqueIds.has(interest.id)) {
        return false;
      }
      uniqueIds.add(interest.id);
      return true;
    })
    .map(interest => {
      const { category, color } = getCategoryAndColor(interest.id);
      // Random sizing for asymmetric grid
      const size = ["sm", "md", "lg"][Math.floor(Math.random() * 3)] as "sm" | "md" | "lg";
      
      return {
        ...interest,
        category,
        color,
        size
      };
    });
}

export async function GET(request: NextRequest) {
  // Create a request ID for tracking
  const requestId = logger.createRequestId();
  
  // Get the location from query params
  const searchParams = request.nextUrl.searchParams;
  const location = searchParams.get("location") || "San Francisco";
  const refresh = searchParams.has("refresh");
  
  // Start timer for the entire request
  const endTimer = logger.startTimer(
    LogCategory.API,
    `GET /api/interests for ${location}`,
    ['API', 'INTERESTS', 'GET'],
  );
  
  try {
    logger.info(
      LogCategory.API,
      `Processing interests request for ${location}`,
      { location, refresh, requestId },
      ['API_REQUEST', 'INTERESTS']
    );
    
    // Try to get from cache first (unless refresh is requested)
    if (!refresh && redis) {
      const cacheKey = `interests:${location.toLowerCase().replace(/\s+/g, "-")}`;
      
      try {
        const cached = await redis.get<Interest[]>(cacheKey);
        
        if (cached) {
          logger.info(
            LogCategory.CACHE,
            `Cache hit for interests:${location}`,
            { location, count: cached.length },
            ['CACHE_HIT', 'INTERESTS']
          );
          
          await endTimer();
          
          return NextResponse.json({
            interests: cached,
            source: "cache",
            requestId
          });
        } else {
          logger.info(
            LogCategory.CACHE,
            `Cache miss for interests:${location}`,
            { location },
            ['CACHE_MISS', 'INTERESTS']
          );
        }
      } catch (error) {
        logger.error(
          LogCategory.CACHE,
          `Redis error: ${error}`,
          { error, location },
          ['REDIS_ERROR', 'INTERESTS']
        );
      }
    }
    
    // Generate interests for the location
    const interests = await generateInterestsForLocation(location);
    
    // Store in Redis cache if available
    if (redis) {
      try {
        await redis.set(`interests:${location.toLowerCase().replace(/\s+/g, "-")}`, interests, { ex: CACHE_TTL });
        
        logger.info(
          LogCategory.CACHE,
          `Cached interests for ${location}`,
          { location, count: interests.length },
          ['CACHE_SET', 'INTERESTS']
        );
      } catch (error) {
        logger.error(
          LogCategory.CACHE,
          `Failed to cache interests: ${error}`,
          { error, location },
          ['CACHE_ERROR', 'INTERESTS']
        );
      }
    }
    
    // End timer with success
    await endTimer();
    
    // Return the interests
    return NextResponse.json({
      interests,
      source: "generated",
      requestId
    });
  } catch (error) {
    // Log error and end timer
    logger.error(
      LogCategory.API,
      `Error processing interests request: ${error}`,
      { error, location },
      ['API_ERROR', 'INTERESTS']
    );
    
    await endTimer();
    
    return NextResponse.json(
      { error: "Failed to fetch interests", requestId },
      { status: 500 }
    );
  }
} 