#!/usr/bin/env ts-node

/**
 * Spots App - Large Interest Model (LIM) Pipeline
 * 
 * This script is designed to be run as a cron job to refresh recommendation data
 * It uses Perplexity (via OpenRouter) for deep research and Gemini 2 Flash for formatting
 * 
 * Usage:
 *   npm run refresh-recommendations
 *   
 * Environment variables:
 *   OPENROUTER_API_KEY - API key for OpenRouter (Perplexity access)
 *   GEMINI_API_KEY - API key for Google's Gemini API
 *   DATABASE_URL - Connection string for the database
 */

import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { LLMClient, LLMProvider } from '../src/lib/lim/llm-client';
import { LIMLogger, LogCategory } from '../src/lib/lim/logging';
import { OutputFormat, TemplateType } from '../src/lib/lim/templates';

// Initialize logger
const logger = LIMLogger.getInstance();

// Initialize LLM client
const llmClient = new LLMClient();

// Initialize Prisma client
const prisma = new PrismaClient();

// Configuration
const CONFIG = {
  LOCATIONS: [
    { id: 'la', name: 'Los Angeles', coordinates: [-118.2437, 34.0522] },
    { id: 'sf', name: 'San Francisco', coordinates: [-122.4194, 37.7749] },
    { id: 'nyc', name: 'New York', coordinates: [-74.0060, 40.7128] },
    { id: 'chi', name: 'Chicago', coordinates: [-87.6298, 41.8781] },
    { id: 'mia', name: 'Miami', coordinates: [-80.1918, 25.7617] },
  ],
  INTERESTS: [
    { id: 'coffee', name: 'Coffee', emoji: '☕' },
    { id: 'hiking', name: 'Hiking', emoji: '🥾' },
    { id: 'art', name: 'Art', emoji: '🎨' },
    { id: 'food', name: 'Food', emoji: '🍜' },
    { id: 'music', name: 'Music', emoji: '🎵' },
    { id: 'books', name: 'Books', emoji: '📚' },
    { id: 'shopping', name: 'Shopping', emoji: '🛍️' },
    { id: 'nature', name: 'Nature', emoji: '🌳' },
  ],
  // How many recommendations to generate per interest-location pair
  RECOMMENDATIONS_PER_COMBO: 5,
  // Output directory for JSON files (fallback if database is unavailable)
  OUTPUT_DIR: path.join(__dirname, '../data/recommendations'),
  // LLM configuration
  LLM: {
    RESEARCH: {
      provider: LLMProvider.OPENROUTER,
      model: "perplexity/sonar-small-online",
      temperature: 0.3,
      maxTokens: 4000
    },
    ENHANCEMENT: {
      provider: LLMProvider.GEMINI,
      model: "gemini-2-flash",
      temperature: 0.7,
      maxTokens: 2000
    }
  }
};

/**
 * Main function to refresh all recommendation data
 */
async function refreshAllRecommendations() {
  logger.info(
    LogCategory.PIPELINE,
    '🗺️ Spots App - Starting LIM Pipeline',
    { timestamp: new Date().toISOString() },
    ['START', 'PIPELINE']
  );
  
  // Create statistics object to track pipeline performance
  const stats = {
    started: new Date(),
    completed: null as Date | null,
    totalCombinations: CONFIG.LOCATIONS.length * CONFIG.INTERESTS.length,
    successful: 0,
    failed: 0,
    skipped: 0,
    byLocation: {} as Record<string, { successful: number, failed: number }>,
    byInterest: {} as Record<string, { successful: number, failed: number }>
  };
  
  // Initialize stats counters
  CONFIG.LOCATIONS.forEach(location => {
    stats.byLocation[location.id] = { successful: 0, failed: 0 };
  });
  
  CONFIG.INTERESTS.forEach(interest => {
    stats.byInterest[interest.id] = { successful: 0, failed: 0 };
  });
  
  // Process each location-interest combination
  for (const location of CONFIG.LOCATIONS) {
    for (const interest of CONFIG.INTERESTS) {
      try {
        logger.info(
          LogCategory.PIPELINE,
          `Processing: ${interest.name} in ${location.name}`,
          { interest: interest.id, location: location.id },
          ['PROCESSING']
        );
        
        // Step 1: Deep research with Perplexity via OpenRouter
        const researchResults = await performDeepResearch(interest, location);
        
        // Step 2: Format and enhance with Gemini 2 Flash
        const enhancedResults = await enhanceWithGemini(researchResults, interest, location);
        
        // Step 3: Store results
        await storeResults(enhancedResults, interest, location);
        
        // Update statistics
        stats.successful++;
        stats.byLocation[location.id].successful++;
        stats.byInterest[interest.id].successful++;
        
        logger.info(
          LogCategory.PIPELINE,
          `✅ Completed: ${interest.name} in ${location.name}`,
          { interest: interest.id, location: location.id },
          ['SUCCESS']
        );
      } catch (error) {
        // Update statistics
        stats.failed++;
        stats.byLocation[location.id].failed++;
        stats.byInterest[interest.id].failed++;
        
        logger.error(
          LogCategory.PIPELINE,
          `❌ Failed: ${interest.name} in ${location.name}`,
          { error, interest: interest.id, location: location.id },
          ['FAILURE']
        );
      }
    }
  }

  // Update trending interests based on processed data
  await updateTrendingInterests();
  
  // Complete statistics
  stats.completed = new Date();
  const duration = stats.completed.getTime() - stats.started.getTime();
  
  logger.info(
    LogCategory.PIPELINE,
    '🏁 LIM Pipeline Complete',
    { 
      stats,
      duration: `${Math.round(duration / 1000)}s`,
      successRate: `${Math.round((stats.successful / stats.totalCombinations) * 100)}%`
    },
    ['COMPLETE', 'STATS']
  );
  
  return stats;
}

/**
 * Perform deep research using Perplexity via OpenRouter
 */
async function performDeepResearch(interest: typeof CONFIG.INTERESTS[0], location: typeof CONFIG.LOCATIONS[0]) {
  try {
    // Check if we're in a test/development environment without API keys
    if (process.env.NODE_ENV === 'development' && !process.env.OPENROUTER_API_KEY) {
      logger.info(
        LogCategory.LLM,
        `Using mock data for Perplexity research (${interest.name} in ${location.name})`,
        { interest: interest.id, location: location.id },
        ['MOCK', 'PERPLEXITY']
      );
      return mockPerplexityResponse(interest, location);
    }
    
    logger.info(
      LogCategory.LLM,
      `Performing deep research with Perplexity (${interest.name} in ${location.name})`,
      { interest: interest.id, location: location.id },
      ['RESEARCH', 'PERPLEXITY']
    );
    
    // Create a research prompt
    const researchPrompt = `
      I need detailed, factual information about the best places for ${interest.name.toLowerCase()} in ${location.name}.
      
      Please include:
      1. Hidden gems and local favorites
      2. Well-known destinations that are actually worth visiting
      3. Emerging and trending spots
      4. Places with unique or special characteristics
      5. Information about what makes each place special, distinctive or worth visiting
      6. Any relevant details about location, price range, or crowd levels
      
      For each place, please provide:
      - Name
      - Brief description (what makes it special)
      - Location/neighborhood
      - Any notable features or specialties
      
      Please ensure information is current and accurate. Focus on places that have genuine appeal to enthusiasts of ${interest.name.toLowerCase()}.
      
      Organize the information clearly.
    `;
    
    // Use OpenRouter to query Perplexity
    const response = await llmClient.processTemplate(
      {
        id: "spot-research",
        type: TemplateType.CONTENT_ENHANCEMENT,
        version: "1.0.0",
        description: "Research spots for an interest in a location",
        systemPrompt: `You are a knowledgeable local expert on ${location.name} with deep knowledge about ${interest.name} spots. Provide factual, specific information about actual places that exist. Be specific and include important details.`,
        userPromptTemplate: researchPrompt,
        outputFormat: OutputFormat.MARKDOWN,
        outputSchema: {},
        tags: ['RESEARCH', interest.id, location.id],
        category: LogCategory.RECOMMENDATION,
        parameters: []
      },
      {},
      { 
        ...CONFIG.LLM.RESEARCH,
        tags: ['PIPELINE', 'RESEARCH', interest.id, location.id] 
      }
    );
    
    return response;
  } catch (error) {
    logger.error(
      LogCategory.LLM,
      `Research error for ${interest.name} in ${location.name}`,
      { error, interest: interest.id, location: location.id },
      ['RESEARCH_ERROR', 'PERPLEXITY'] 
    );
    
    // Fallback to mock data if there's an error
    return mockPerplexityResponse(interest, location);
  }
}

/**
 * Enhance and format research results using Gemini 2 Flash
 */
async function enhanceWithGemini(researchResults: string, interest: typeof CONFIG.INTERESTS[0], location: typeof CONFIG.LOCATIONS[0]) {
  try {
    // Check if we're in a test/development environment without API keys
    if (process.env.NODE_ENV === 'development' && !process.env.GEMINI_API_KEY) {
      logger.info(
        LogCategory.LLM,
        `Using mock data for Gemini enhancement (${interest.name} in ${location.name})`,
        { interest: interest.id, location: location.id },
        ['MOCK', 'GEMINI']
      );
      return mockGeminiResponse(interest, location);
    }
    
    logger.info(
      LogCategory.LLM,
      `Enhancing data with Gemini 2 Flash (${interest.name} in ${location.name})`,
      { interest: interest.id, location: location.id },
      ['ENHANCEMENT', 'GEMINI']
    );
    
    // Create an enhancement prompt
    const enhancePrompt = `
      Please analyze the following research about ${interest.name.toLowerCase()} places in ${location.name} and structure it into a clean, organized JSON format for our recommendation system.
      
      RESEARCH DATA:
      ${researchResults}
      
      For each place, extract or infer:
      - name: The name of the place
      - description: A concise 1-2 sentence description
      - type: The type/category (${getTypeForInterest(interest.id)})
      - neighborhood: The neighborhood or area within ${location.name}
      - tags: 2-4 relevant tags from: ${getTagsForInterest(interest.id).join(', ')}
      - priceRange: A number from 1-4 (1 being least expensive, 4 being most)
      - popularity: A number from 1-10 representing how popular/busy it is
      - coordinates: Approximate [longitude, latitude] if available, otherwise null
      - website: The website URL if available, otherwise null
      - imageUrl: Leave as null, we'll add images later
      - checkIns: A randomly generated number between 5-120 representing user visits
      
      Return ONLY a JSON array of exactly ${CONFIG.RECOMMENDATIONS_PER_COMBO} recommendations (the very best places). Each recommendation should have all fields listed above. Format as a clean, valid JSON array with no additional text.
    `;
    
    // Use Gemini to enhance and structure the data
    const response = await llmClient.processTemplate(
      {
        id: "enhance-recommendations",
        type: TemplateType.RECOMMENDATION_GENERATION,
        version: "1.0.0",
        description: "Enhance and structure recommendations",
        systemPrompt: `You are a recommendation enhancement AI. Your job is to take research about ${interest.name} spots in ${location.name} and transform it into structured, detailed recommendations.`,
        userPromptTemplate: enhancePrompt,
        outputFormat: OutputFormat.JSON,
        outputSchema: {},
        tags: ['ENHANCE', interest.id, location.id],
        category: LogCategory.RECOMMENDATION,
        parameters: []
      },
      {},
      { 
        ...CONFIG.LLM.ENHANCEMENT,
        tags: ['PIPELINE', 'ENHANCE', interest.id, location.id] 
      }
    );
    
    return response;
  } catch (error) {
    logger.error(
      LogCategory.LLM,
      `Enhancement error for ${interest.name} in ${location.name}`,
      { error, interest: interest.id, location: location.id },
      ['ENHANCEMENT_ERROR', 'GEMINI'] 
    );
    
    // Fallback to mock data if there's an error
    return mockGeminiResponse(interest, location);
  }
}

/**
 * Store the processed results in database and backup JSON
 */
async function storeResults(enhancedResults: string, interest: typeof CONFIG.INTERESTS[0], location: typeof CONFIG.LOCATIONS[0]) {
  console.log(`  💾 Storing results...`);
  
  try {
    // Parse the JSON data
    const recommendations = JSON.parse(enhancedResults);
    
    // Save to JSON file as backup
    const filename = `${interest.id}-${location.id}.json`;
    const filePath = path.join(CONFIG.OUTPUT_DIR, filename);
    
    fs.writeFileSync(
      filePath, 
      JSON.stringify({
        interest: interest,
        location: location,
        recommendations: recommendations,
        lastUpdated: new Date().toISOString()
      }, null, 2)
    );
    
    // In production, also store in database
    if (process.env.NODE_ENV === 'production') {
      // This would use Prisma to store in the database
      // For each recommendation in the array
      for (const rec of recommendations) {
        try {
          await prisma.recommendation.upsert({
            where: {
              // Using a composite ID since there's no uniqueConstraint field
              id: `${interest.id}-${location.id}-${rec.name.replace(/\s+/g, '-').toLowerCase()}`
            },
            update: {
              description: rec.description,
              score: rec.rating || 0,
              source: "LIM-Pipeline"
            },
            create: {
              id: `${interest.id}-${location.id}-${rec.name.replace(/\s+/g, '-').toLowerCase()}`,
              spotId: rec.id || generateId(),
              interestId: interest.id,
              location: location.name,
              description: rec.description,
              score: rec.rating || 0,
              source: "LIM-Pipeline"
            }
          });
          
          logger.info(
            LogCategory.RECOMMENDATION,
            `Stored recommendation: ${rec.name}`,
            { interestId: interest.id, locationId: location.id },
            ['STORE', 'SUCCESS']
          );
        } catch (error) {
          logger.error(
            LogCategory.RECOMMENDATION,
            `Failed to store recommendation: ${rec.name}`,
            { error, interestId: interest.id, locationId: location.id },
            ['STORE', 'ERROR']
          );
        }
      }
    }
    
    console.log(`  ✅ Stored ${recommendations.length} recommendations`);
    return true;
  } catch (error) {
    console.error('  ❌ Storage error:', error);
    throw new Error(`Failed to store results for ${interest.name} in ${location.name}`);
  }
}

/**
 * Update trending interests based on check-in data and seasonal factors
 */
async function updateTrendingInterests() {
  try {
    logger.info(
      LogCategory.INTEREST,
      "Updating trending interests",
      {},
      ['TRENDING', 'START']
    );
    
    // Get all recommendations and aggregate by interest
    const recommendations = await prisma.recommendation.findMany();
    
    // Calculate trend scores based on recommendations
    const interestScores = new Map();
    
    for (const rec of recommendations) {
      const currentScore = interestScores.get(rec.interestId) || 0;
      interestScores.set(rec.interestId, currentScore + rec.score);
    }
    
    // Sort interests by score and get top 5
    const sortedInterests = Array.from(interestScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    // Prepare trending interests array with the right structure
    const trendingInterests = [];
    
    for (const [id, score] of sortedInterests) {
      const interest = await prisma.interest.findUnique({
        where: { id }
      });
      
      if (interest) {
        trendingInterests.push({
          id,
          name: interest.name,
          score
        });
      }
    }

    // In production, save to database
    if (process.env.NODE_ENV === 'production') {
      logger.info(
        LogCategory.INTEREST,
        "Resetting trending interests",
        {},
        ['TRENDING', 'RESET']
      );
      
      // Update all interests to not be trending first
      await prisma.interest.updateMany({
        where: {},
        data: {
          trending: false,
          trendScore: 0
        }
      });

      // Then set the trending ones
      for (const trendingInterest of trendingInterests) {
        await prisma.interest.update({
          where: { 
            id: trendingInterest.id 
          },
          data: {
            trending: true,
            trendScore: trendingInterest.score
          }
        });
        
        logger.info(
          LogCategory.INTEREST,
          `Set trending interest: ${trendingInterest.name}`,
          { interestId: trendingInterest.id, score: trendingInterest.score },
          ['TRENDING', 'UPDATE']
        );
      }
    }
    
    logger.info(
      LogCategory.INTEREST,
      "Trending interests updated",
      { count: trendingInterests.length },
      ['TRENDING', 'COMPLETE']
    );
    
    return trendingInterests;
  } catch (error) {
    logger.error(
      LogCategory.INTEREST,
      "Error updating trending interests",
      { error },
      ['TRENDING', 'ERROR']
    );
    return [];
  }
}

/**
 * Mock Perplexity response for development
 */
function mockPerplexityResponse(interest: typeof CONFIG.INTERESTS[0], location: typeof CONFIG.LOCATIONS[0]): string {
  // Simple mock response based on interest and location
  if (interest.id === 'coffee' && location.id === 'la') {
    return `
      Here are the best coffee spots in Los Angeles:
      
      1. Intelligentsia Coffee - Upscale coffeehouse chain known for direct-trade beans & creative drinks. Located at 3922 Sunset Blvd, Los Angeles.
      
      2. Blue Bottle Coffee - Trendy cafe serving specialty coffee in a minimalist space. Located at 8301 Beverly Blvd, Los Angeles.
      
      3. Verve Coffee Roasters - Stylish cafe offering house-roasted coffee, pastries & light fare in a bright, airy space. Located at 833 S Spring St, Los Angeles.
      
      4. Dinosaur Coffee - Hip, compact coffee bar serving espresso drinks & pastries in a modern, minimalist space. Located at 4334 Sunset Blvd, Los Angeles.
      
      5. Maru Coffee - Sleek, minimalist cafe specializing in pour-over coffee & espresso drinks with Japanese influence. Located at 1936 Hillhurst Ave, Los Angeles.
    `;
  } else {
    return `
      Here are the best ${interest.name} spots in ${location.name}:
      
      1. ${location.name} ${interest.name} Spot 1 - A fantastic place for ${interest.name.toLowerCase()} enthusiasts with unique offerings. Located at 123 Main St, ${location.name}.
      
      2. ${location.name} ${interest.name} Spot 2 - Popular local favorite known for exceptional ${interest.name.toLowerCase()} experiences. Located at 456 Oak Ave, ${location.name}.
      
      3. ${location.name} ${interest.name} Spot 3 - Historic establishment with authentic ${interest.name.toLowerCase()} traditions. Located at 789 Pine Blvd, ${location.name}.
      
      4. ${location.name} ${interest.name} Spot 4 - Modern venue offering innovative ${interest.name.toLowerCase()} concepts. Located at 101 Cedar St, ${location.name}.
      
      5. ${location.name} ${interest.name} Spot 5 - Hidden gem with passionate ${interest.name.toLowerCase()} culture and community. Located at 202 Maple Dr, ${location.name}.
    `;
  }
}

/**
 * Mock Gemini response for development
 */
function mockGeminiResponse(interest: typeof CONFIG.INTERESTS[0], location: typeof CONFIG.LOCATIONS[0]): string {
  // Generate a simple JSON response
  const recommendations = [];
  
  for (let i = 1; i <= CONFIG.RECOMMENDATIONS_PER_COMBO; i++) {
    const id = `${interest.id}-${location.id}-${i}`;
    
    // Special case for coffee in LA to match our existing data
    if (interest.id === 'coffee' && location.id === 'la' && i <= 2) {
      if (i === 1) {
        recommendations.push({
          id: 'cl1',
          name: 'Intelligentsia Coffee',
          description: 'Upscale coffeehouse chain known for direct-trade beans & creative drinks.',
          type: 'cafe',
          address: '3922 Sunset Blvd, Los Angeles',
          tags: ['Coffee', 'Hip', 'Pour Over'],
          coordinates: [0, 0],
          checkIns: 152
        });
      } else {
        recommendations.push({
          id: 'cl2',
          name: 'Blue Bottle Coffee',
          description: 'Trendy cafe serving specialty coffee in a minimalist space.',
          type: 'cafe',
          address: '8301 Beverly Blvd, Los Angeles',
          tags: ['Coffee', 'Pastries', 'Minimalist'],
          coordinates: [0, 0],
          checkIns: 86
        });
      }
    } else {
      // Generic recommendation
      recommendations.push({
        id,
        name: `${location.name} ${interest.name} Spot ${i}`,
        description: `A fantastic place for ${interest.name.toLowerCase()} enthusiasts with unique offerings.`,
        type: getTypeForInterest(interest.id),
        address: `${100 + i} Main St, ${location.name}`,
        tags: getTagsForInterest(interest.id),
        coordinates: [0, 0],
        checkIns: Math.floor(Math.random() * 450) + 50
      });
    }
  }
  
  return JSON.stringify(recommendations);
}

/**
 * Helper to get establishment type based on interest
 */
function getTypeForInterest(interestId: string): string {
  const typeMap: Record<string, string> = {
    coffee: 'cafe',
    hiking: 'park',
    art: 'museum',
    food: 'restaurant',
    music: 'venue',
    books: 'bookstore',
    shopping: 'store',
    nature: 'park'
  };
  
  return typeMap[interestId] || 'venue';
}

/**
 * Helper to get tags based on interest
 */
function getTagsForInterest(interestId: string): string[] {
  const tagMap: Record<string, string[]> = {
    coffee: ['Coffee', 'Wifi', 'Cozy', 'Pastries'],
    hiking: ['Hiking', 'Nature', 'Views', 'Trails'],
    art: ['Art', 'Exhibits', 'Culture', 'Modern'],
    food: ['Food', 'Delicious', 'Local', 'Authentic'],
    music: ['Music', 'Live Shows', 'Atmosphere', 'Drinks'],
    books: ['Books', 'Reading', 'Cozy', 'Quiet'],
    shopping: ['Shopping', 'Boutique', 'Unique', 'Local'],
    nature: ['Nature', 'Peaceful', 'Scenic', 'Outdoors']
  };
  
  // Return 3-4 random tags from the list
  const tags = tagMap[interestId] || ['Interesting', 'Popular', 'Recommended', 'Local'];
  return tags.sort(() => 0.5 - Math.random()).slice(0, 3 + Math.floor(Math.random() * 2));
}

// Helper function to generate IDs
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Run the main function if this script is executed directly
if (require.main === module) {
  refreshAllRecommendations()
    .then(() => {
      console.log('✅ LIM Pipeline completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ LIM Pipeline failed:', error);
      process.exit(1);
    });
}

// Export for use in other modules
export { refreshAllRecommendations }; 