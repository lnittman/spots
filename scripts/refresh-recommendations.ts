#!/usr/bin/env ts-node

/**
 * Spots App - Large Interest Model (LIM) Pipeline
 * 
 * This script is designed to be run as a cron job to refresh recommendation data
 * It uses Perplexity (via OpenRouter) for deep research and Gemini for formatting
 * 
 * Usage:
 *   npm run refresh-recommendations
 *   
 * Environment variables:
 *   OPENROUTER_API_KEY - API key for OpenRouter (Perplexity access)
 *   GEMINI_API_KEY - API key for Google's Gemini API
 *   DATABASE_URL - Connection string for the database
 */

import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

// Configuration
const CONFIG = {
  API_KEYS: {
    OPENROUTER: process.env.OPENROUTER_API_KEY || "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",
    GEMINI: process.env.GEMINI_API_KEY || "AIzaSyDtwd53YcpYsiYk5uXBZoPh0xiKxIQFmIk",
  },
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
};

// Initialize database client
const prisma = new PrismaClient();

/**
 * Main function to refresh all recommendation data
 */
async function refreshAllRecommendations() {
  console.log('🗺️ Spots App - Starting LIM Pipeline');
  console.log(`📅 ${new Date().toISOString()}`);
  console.log('-----------------------------------');

  // Ensure output directory exists
  if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
    fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true });
  }

  // Track statistics
  const stats = {
    totalCombinations: CONFIG.LOCATIONS.length * CONFIG.INTERESTS.length,
    processedCombinations: 0,
    successfulCombinations: 0,
    failedCombinations: 0,
    startTime: Date.now(),
  };

  // Process each location-interest combination
  for (const location of CONFIG.LOCATIONS) {
    for (const interest of CONFIG.INTERESTS) {
      try {
        console.log(`Processing: ${interest.name} in ${location.name}`);
        
        // Step 1: Deep research with Perplexity via OpenRouter
        const researchResults = await performDeepResearch(interest, location);
        
        // Step 2: Format and enhance with Gemini
        const enhancedResults = await enhanceWithGemini(researchResults, interest, location);
        
        // Step 3: Store results
        await storeResults(enhancedResults, interest, location);
        
        stats.processedCombinations++;
        stats.successfulCombinations++;
        
        console.log(`✅ Completed: ${interest.name} in ${location.name}`);
      } catch (error) {
        console.error(`❌ Failed: ${interest.name} in ${location.name}`, error);
        stats.processedCombinations++;
        stats.failedCombinations++;
      }
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Update trending interests based on processed data
  await updateTrendingInterests();

  // Print summary
  const duration = (Date.now() - stats.startTime) / 1000;
  console.log('\n-----------------------------------');
  console.log('📊 LIM Pipeline Summary:');
  console.log(`Total combinations: ${stats.totalCombinations}`);
  console.log(`Successful: ${stats.successfulCombinations}`);
  console.log(`Failed: ${stats.failedCombinations}`);
  console.log(`Duration: ${duration.toFixed(2)} seconds`);
  console.log('-----------------------------------');
}

/**
 * Perform deep research using Perplexity via OpenRouter
 */
async function performDeepResearch(interest: typeof CONFIG.INTERESTS[0], location: typeof CONFIG.LOCATIONS[0]) {
  console.log(`  🔍 Researching ${interest.name} spots in ${location.name}...`);
  
  // In production, this would make an actual API call to OpenRouter/Perplexity
  // For demo purposes, we'll simulate the response
  
  const prompt = `
    I need detailed recommendations for the best ${interest.name.toLowerCase()} spots in ${location.name}.
    
    For each recommendation, please provide:
    1. The name of the place
    2. A brief description (1-2 sentences)
    3. The address
    4. 3-4 tags that describe what makes this place special
    5. The type of establishment (cafe, park, museum, etc.)
    
    Focus on places that are highly regarded by locals, unique, and authentic.
    Provide exactly ${CONFIG.RECOMMENDATIONS_PER_COMBO} recommendations.
  `;
  
  try {
    // This would be a real API call in production
    if (process.env.NODE_ENV === 'production') {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CONFIG.API_KEYS.OPENROUTER}`,
          'HTTP-Referer': 'https://spots.app',
        },
        body: JSON.stringify({
          model: 'perplexity/sonar-small-online',
          messages: [
            { role: 'system', content: 'You are a local expert who knows the best spots in every city.' },
            { role: 'user', content: prompt }
          ],
        }),
      });
      
      const data = await response.json();
      return data.choices[0].message.content;
    } else {
      // For development, return mock data
      console.log('  ⚠️ Using mock data (development mode)');
      return mockPerplexityResponse(interest, location);
    }
  } catch (error) {
    console.error('  ❌ Perplexity API error:', error);
    throw new Error(`Perplexity research failed for ${interest.name} in ${location.name}`);
  }
}

/**
 * Enhance and format research results using Gemini
 */
async function enhanceWithGemini(researchResults: string, interest: typeof CONFIG.INTERESTS[0], location: typeof CONFIG.LOCATIONS[0]) {
  console.log(`  🤖 Enhancing results with Gemini...`);
  
  const prompt = `
    I have research about ${interest.name} spots in ${location.name}. 
    Please format this into a structured JSON array with the following fields for each spot:
    - id: a unique string identifier
    - name: the name of the place
    - description: a concise, engaging description
    - type: the type of establishment (cafe, park, museum, etc.)
    - address: the full address
    - tags: an array of 3-4 descriptive tags
    - coordinates: placeholder for coordinates [0, 0] (these will be filled in later)
    - checkIns: a random number between 50 and 500 representing visitor count
    
    Research data:
    ${researchResults}
    
    Return ONLY the JSON array with no additional text.
  `;
  
  try {
    // This would be a real API call in production
    if (process.env.NODE_ENV === 'production') {
      const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': CONFIG.API_KEYS.GEMINI,
        },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: prompt }] }
          ],
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
        }),
      });
      
      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } else {
      // For development, return mock data
      console.log('  ⚠️ Using mock data (development mode)');
      return mockGeminiResponse(interest, location);
    }
  } catch (error) {
    console.error('  ❌ Gemini API error:', error);
    throw new Error(`Gemini enhancement failed for ${interest.name} in ${location.name}`);
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
        await prisma.recommendation.upsert({
          where: {
            // Unique constraint would be on interest+location+name
            uniqueConstraint: {
              interestId: interest.id,
              locationId: location.id,
              name: rec.name
            }
          },
          update: {
            description: rec.description,
            address: rec.address,
            type: rec.type,
            tags: rec.tags,
            checkIns: rec.checkIns,
            lastUpdated: new Date()
          },
          create: {
            id: rec.id,
            interestId: interest.id,
            locationId: location.id,
            name: rec.name,
            description: rec.description,
            address: rec.address,
            type: rec.type,
            tags: rec.tags,
            checkIns: rec.checkIns,
            lastUpdated: new Date()
          }
        });
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
  console.log(`\n🔥 Updating trending interests...`);
  
  try {
    // In production, this would analyze check-in data and other factors
    // For demo, we'll use a simple algorithm
    
    // Get current month for seasonal weighting
    const currentMonth = new Date().getMonth();
    
    // Simple seasonal weights (just an example)
    const seasonalWeights: Record<string, number> = {
      coffee: 1.0,
      hiking: currentMonth >= 3 && currentMonth <= 8 ? 1.5 : 0.8, // Spring/Summer boost
      art: 1.0,
      food: 1.2, // Always popular
      music: currentMonth >= 5 && currentMonth <= 8 ? 1.4 : 1.0, // Summer boost
      books: currentMonth >= 9 && currentMonth <= 11 ? 1.3 : 1.0, // Fall boost
      shopping: currentMonth >= 10 || currentMonth <= 1 ? 1.5 : 0.9, // Holiday season boost
      nature: currentMonth >= 3 && currentMonth <= 8 ? 1.4 : 0.8, // Spring/Summer boost
    };
    
    // In production, this would update a database table
    // For demo, we'll just log the trending interests
    const trendingInterests = CONFIG.INTERESTS
      .map(interest => ({
        ...interest,
        score: Math.random() * seasonalWeights[interest.id] * 100
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4) // Top 4 trending
      .map(i => i.id);
    
    console.log(`  🔥 Trending interests: ${trendingInterests.join(', ')}`);
    
    // In production, save to database
    if (process.env.NODE_ENV === 'production') {
      await prisma.trendingInterest.deleteMany({});
      
      for (const interestId of trendingInterests) {
        await prisma.trendingInterest.create({
          data: {
            interestId,
            updatedAt: new Date()
          }
        });
      }
    }
    
    return trendingInterests;
  } catch (error) {
    console.error('  ❌ Failed to update trending interests:', error);
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