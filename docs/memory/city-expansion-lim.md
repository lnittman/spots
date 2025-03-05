# City Expansion Implementation Plan with LIM Integration

## Overview

This document outlines our plan to enhance the Spots application by expanding the city database through MapBox integration and implementing a LIM (Large Interest Model) based trending city detection system. The approach focuses on leveraging LLMs for structured outputs after providing rich contextual information, rather than implementing complex algorithmic solutions.

## Current Status

1. Basic city selection functionality is implemented
2. MapBox is already set up and working
3. Static list of cities with hardcoded data
4. Limited city discovery capabilities
5. Detroit has been added as a proof of concept for expanding the database

## Implementation Phases

### Phase 1: MapBox Geocoding Integration

**Goal:** Enable dynamic city lookup and coordinate retrieval for any city worldwide.

#### Tasks:

1. **Implement Geocoding Service**
   - Create a wrapper for MapBox's Geocoding API
   - Build caching layer to minimize API calls
   - Implement throttling to stay within API limits

```typescript
// src/lib/maps/geocoding.ts
export async function geocodeCity(cityName: string): Promise<{
  coordinates: [number, number];
  name: string;
  country: string;
  id: string;
} | null> {
  // Check cache first
  const cached = await getCachedCity(cityName);
  if (cached) return cached;
  
  // Call MapBox API
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(cityName)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&types=place`
    );
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const city = data.features[0];
      const result = {
        coordinates: city.center as [number, number],
        name: city.text,
        country: city.context.find(c => c.id.startsWith('country'))?.text || '',
        id: city.id
      };
      
      // Cache result
      await cacheCity(cityName, result);
      return result;
    }
    return null;
  } catch (error) {
    console.error('Error geocoding city:', error);
    return null;
  }
}
```

2. **Create City Auto-Complete Component**
   - Build a city search input with auto-complete
   - Display suggestions as user types
   - Include country information for disambiguation

3. **Enhance LocationDropdown**
   - Add dynamic search capabilities
   - Show loading states during geocoding
   - Handle errors gracefully

### Phase 2: LIM-Based Trending Cities

**Goal:** Implement a system that uses LLM interaction to determine trending cities based on meaningful context.

#### Tasks:

1. **Design LIM Prompt Template**
   - Create a specialized template for trending city detection
   - Include global events, seasonal factors, and travel trends

```typescript
// src/lib/lim/templates/trending-cities.ts
import { PromptTemplate, TemplateType, OutputFormat } from '@/lib/lim/templates';

export const trendingCitiesTemplate: PromptTemplate = {
  id: 'trending-cities',
  type: TemplateType.TREND_DETECTION,
  version: '1.0',
  description: 'Template for determining trending cities based on global events and travel patterns',
  systemPrompt: `You are an expert travel analyst with deep knowledge of global tourism trends, cultural events, 
and seasonal travel patterns. Your task is to identify cities that are currently trending or likely to trend 
in the near future for travelers, based on current global events, upcoming festivals, seasonal appeals, 
newly opened attractions, and recent travel pattern shifts.`,
  userPromptTemplate: `Please analyze the following context and identify {{count}} cities that are 
currently trending or likely to trend soon. For each city, provide:
1. The city name
2. Country
3. Coordinates (latitude, longitude)
4. A suitable emoji that represents the city
5. A brief reason why it's trending
6. Relevance score (1-10)

Current month: {{currentMonth}}
Current season (Northern Hemisphere): {{currentSeason}}
Major global events: {{globalEvents}}
Recent travel pattern changes: {{travelPatterns}}

Ensure your analysis considers seasonal appeal, current cultural or sporting events, recent infrastructure 
developments, and unique temporary attractions. Focus on a diverse global selection rather than 
concentrating on a single region.`,
  outputFormat: OutputFormat.JSON,
  outputSchema: {
    type: 'object',
    properties: {
      trendingCities: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            country: { type: 'string' },
            coordinates: { 
              type: 'array', 
              items: { type: 'number' },
              minItems: 2,
              maxItems: 2
            },
            emoji: { type: 'string' },
            trendingReason: { type: 'string' },
            relevanceScore: { type: 'number', minimum: 1, maximum: 10 },
          },
          required: ['name', 'country', 'coordinates', 'emoji', 'trendingReason', 'relevanceScore']
        }
      }
    },
    required: ['trendingCities']
  },
  tags: ['cities', 'trending', 'travel', 'recommendations'],
  category: LogCategory.RECOMMENDATION,
  examples: [
    {
      input: {
        count: 5,
        currentMonth: 'May',
        currentSeason: 'Spring',
        globalEvents: 'Paris Olympics preparation, Cherry blossom season in Japan',
        travelPatterns: 'Increase in sustainable tourism, rise in digital nomad destinations'
      },
      output: {
        trendingCities: [
          {
            name: 'Kyoto',
            country: 'Japan',
            coordinates: [135.7681, 35.0116],
            emoji: '🌸',
            trendingReason: 'Peak cherry blossom season attracting visitors worldwide',
            relevanceScore: 9
          },
          // Additional examples...
        ]
      }
    }
  ],
  parameters: [
    {
      name: 'count',
      description: 'Number of trending cities to return',
      required: true,
      type: 'number'
    },
    {
      name: 'currentMonth',
      description: 'Current month of the year',
      required: true,
      type: 'string'
    },
    {
      name: 'currentSeason',
      description: 'Current season in the Northern Hemisphere',
      required: true,
      type: 'string'
    },
    {
      name: 'globalEvents',
      description: 'Major global events happening currently',
      required: true,
      type: 'string'
    },
    {
      name: 'travelPatterns',
      description: 'Recent changes in travel patterns',
      required: true,
      type: 'string'
    }
  ]
};
```

2. **Implement Context Collection**
   - Gather relevant contextual data for the LIM
   - Include seasonal information, global events, and travel trends
   - Source data from trusted APIs or manual updates

3. **Create Scheduled Job for Updates**
   - Implement a cron job to update trending cities weekly
   - Store results in the database with timestamps
   - Track historical trending data for future analysis

```typescript
// src/app/api/cron/refresh-trending/route.ts
import { NextRequest } from 'next/server';
import { LLMClient } from '@/lib/lim/llm-client';
import { trendingCitiesTemplate } from '@/lib/lim/templates/trending-cities';
import { LIMLogger, LogCategory } from '@/lib/lim/logging';
import prisma from '@/lib/db/prisma';

const logger = LIMLogger.getInstance();

export async function GET(request: NextRequest) {
  // Check for authorization header (simple API key verification)
  const authHeader = request.headers.get('authorization');
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    logger.info(
      LogCategory.SYSTEM,
      'Starting trending cities refresh job',
      {},
      ['CRON', 'TRENDING', 'CITIES']
    );

    // Current date info for context
    const now = new Date();
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMonth = months[now.getMonth()];
    
    // Determine season (simplified)
    const monthNum = now.getMonth();
    let currentSeason = 'Winter';
    if (monthNum >= 2 && monthNum <= 4) currentSeason = 'Spring';
    else if (monthNum >= 5 && monthNum <= 7) currentSeason = 'Summer';
    else if (monthNum >= 8 && monthNum <= 10) currentSeason = 'Fall';
    
    // This would typically come from an API or database of current events
    const globalEvents = await fetchGlobalEvents();
    const travelPatterns = await fetchTravelTrends();
    
    // Initialize LLM client
    const llmClient = new LLMClient();
    
    // Process the trending cities request with LIM
    const result = await llmClient.processTemplate(trendingCitiesTemplate, {
      count: 10,
      currentMonth,
      currentSeason,
      globalEvents,
      travelPatterns
    });
    
    if (result && result.trendingCities) {
      // Store in database
      await storeTrendingCities(result.trendingCities);
      
      logger.info(
        LogCategory.SYSTEM,
        'Successfully refreshed trending cities',
        { count: result.trendingCities.length },
        ['CRON', 'TRENDING', 'CITIES', 'SUCCESS']
      );
      
      return new Response(JSON.stringify({ 
        success: true, 
        count: result.trendingCities.length,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      throw new Error('Invalid response format from LIM');
    }
  } catch (error) {
    logger.error(
      LogCategory.SYSTEM,
      'Error refreshing trending cities',
      { error },
      ['CRON', 'TRENDING', 'CITIES', 'ERROR']
    );
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function storeTrendingCities(cities) {
  // First, reset all trending cities
  await prisma.city.updateMany({
    where: { trending: true },
    data: { trending: false }
  });
  
  // Store each trending city
  for (const city of cities) {
    await prisma.city.upsert({
      where: { name_country: { name: city.name, country: city.country } },
      update: { 
        trending: true,
        coordinates: city.coordinates,
        emoji: city.emoji,
        trendingReason: city.trendingReason,
        trendingScore: city.relevanceScore,
        lastUpdated: new Date()
      },
      create: {
        name: city.name,
        country: city.country,
        coordinates: city.coordinates,
        emoji: city.emoji,
        trending: true,
        trendingReason: city.trendingReason,
        trendingScore: city.relevanceScore,
        lastUpdated: new Date(),
        type: 'city'
      }
    });
  }
}
```

### Phase 3: User Interaction Enhancements

**Goal:** Create a seamless user experience for discovering and suggesting cities.

#### Tasks:

1. **Implement City Search in UI**
   - Add global city search functionality
   - Highlight trending cities in search results
   - Show relevant information alongside search results

2. **Create City Suggestion System**
   - Allow users to suggest missing cities
   - Implement admin review workflow
   - Automatically geocode and validate suggestions

3. **Develop User Location Intelligence**
   - Track which cities users are interested in
   - Use this data to improve recommendations
   - Feed anonymized data back into the trending algorithm

### Phase 4: Database Enhancement

**Goal:** Expand the city database schema to store richer information.

#### Tasks:

1. **Enhance City Schema**
   - Add fields for population, timezone, and country
   - Include historical trending data
   - Store related points of interest

```prisma
// prisma/schema.prisma
model City {
  id                String      @id @default(cuid())
  name              String
  country           String
  coordinates       Float[]     @db.Float
  emoji             String
  type              String      @default("city")
  trending          Boolean     @default(false)
  trendingReason    String?
  trendingScore     Int?
  lastUpdated       DateTime    @default(now())
  population        Int?
  timezone          String?
  searchCount       Int         @default(0)
  suggestedBy       String?     // Reference to user who suggested it
  verified          Boolean     @default(true)
  
  // Unique constraint for name+country combination
  @@unique([name, country], name: "name_country")
  
  // Relations
  userInterests     UserCityInterest[]
  spotRecommendations Spot[]
  
  @@index([trending])
  @@index([searchCount])
}

model UserCityInterest {
  id                String      @id @default(cuid())
  userId            String
  cityId            String
  interactionType   String      // "visited", "saved", "interested"
  createdAt         DateTime    @default(now())
  
  user              User        @relation(fields: [userId], references: [id])
  city              City        @relation(fields: [cityId], references: [id])
  
  @@unique([userId, cityId, interactionType])
}
```

2. **Implement Migration Strategy**
   - Migrate existing city data to new schema
   - Create data backfill scripts
   - Ensure backward compatibility

## Technical Approach

### LIM Integration Philosophy

The LIM-based trending system differs from traditional algorithms in several key ways:

1. **Context-Rich Processing**: We provide extensive contextual information to the LLM rather than relying solely on metrics.

2. **Qualitative Analysis**: The LLM can interpret qualitative factors that traditional algorithms might miss, such as cultural significance or emerging travel trends.

3. **Explainable Results**: The system provides human-readable explanations for why cities are trending.

4. **Adaptive Reasoning**: As global events and trends change, the LLM can adapt its reasoning without requiring algorithmic updates.

### Data Flow

```
┌───────────────────┐      ┌─────────────────────┐      ┌──────────────────────┐
│ Context Collection│      │    LIM Processing    │      │  Database Storage    │
│ - Season          │──────▶ - OpenRouter/Perplx. ├─────▶│  - Trending cities   │
│ - Global events   │      │ - Context analysis   │      │  - Historical data   │
│ - Travel patterns │      │ - Structured output  │      │  - Metadata          │
└───────────────────┘      └─────────────────────┘      └──────────────────────┘
          │                                                       │
          │                                                       │
          │                     ┌──────────────────────┐          │
          │                     │     User Interface   │          │
          └────────────────────▶│ - City selection     │◀─────────┘
                                │ - Search & discovery │
                                │ - Recommendations    │
                                └──────────────────────┘
```

### API Design

We'll expose the following endpoints:

- `GET /api/cities/search?q={query}` - Search for cities
- `GET /api/cities/trending` - Get trending cities
- `POST /api/cities/suggest` - Suggest a new city
- `GET /api/cities/{id}` - Get city details
- `GET /api/cities/{id}/spots` - Get spots in a city

## Next Steps

1. **Immediate Tasks**
   - Set up database schema for enhanced city storage
   - Implement MapBox geocoding integration
   - Create the trending cities LIM template

2. **Key Dependencies**
   - Vercel Cron for scheduled jobs
   - MapBox Geocoding API
   - OpenRouter for LLM access
   - Prisma schema updates

3. **Success Metrics**
   - Number of unique cities accessed
   - User engagement with trending cities
   - System accuracy in identifying genuinely trending destinations
   - User satisfaction with city search functionality

This implementation plan leverages our existing MapBox integration and focuses on using LIM for intelligent trending city detection rather than building complex algorithmic solutions. The approach provides a scalable, adaptable system for global city discovery while maintaining high quality recommendations. 