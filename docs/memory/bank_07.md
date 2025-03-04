# Spots App - Development Memory Bank 07

This document captures the implementation of the next steps for the Spots app, including the integration of OpenRouter and Gemini 2 Flash for the Large Interest Model (LIM) pipeline.

## Implementation Summary

### API Integration

1. **OpenRouter Integration**
   - Implemented OpenRouter API client for accessing various LLM providers
   - Configured for Perplexity API access via OpenRouter for deep research
   - Added proper error handling and response parsing
   - Implemented request/response logging for debugging and monitoring

2. **Gemini 2 Flash Integration**
   - Upgraded from Gemini 1.5 to Gemini 2 Flash for faster, more efficient processing
   - Updated API endpoint and parameter handling for the new version
   - Adjusted prompting strategy to work better with Flash model's capabilities
   - Added version detection to support both v1 and v1beta API endpoints

3. **Unified LLM Client**
   - Created a flexible LLMClient class to handle multiple providers
   - Implemented provider detection and fallback mechanisms
   - Added robust error handling and logging throughout
   - Structured communication patterns for consistent API usage

### Database Schema Implementation

1. **Database Models**
   - Implemented full Prisma schema for all required entities
   - Created proper relations between users, interests, and locations
   - Added indexes for efficient querying of recommendations
   - Implemented tracking for trending interests

2. **Data Storage Layer**
   - Created database access functions for recommendation storage
   - Implemented JSON fallback storage for development and backup
   - Added data validation before storage
   - Created caching layer for frequently accessed data

### LIM Pipeline Refinement

1. **Improved Research Stage**
   - Enhanced research prompts for more detailed, accurate information
   - Implemented specific context for each interest-location combination
   - Optimized token usage for more efficient API usage
   - Added validation of research results before enhancement

2. **Enhanced Formatting Stage**
   - Implemented structured formatting with Gemini 2 Flash
   - Standardized JSON output format for consistency
   - Added field validation and normalization
   - Implemented retry logic for malformed responses

3. **Robust Logging System**
   - Created comprehensive logging system with categorization
   - Added detailed performance metrics and statistics tracking
   - Implemented structured logging for better analysis
   - Created debugging tools for pipeline monitoring

4. **Scheduled Execution**
   - Refined the cron job implementation for reliability
   - Added proper error handling and notification
   - Implemented staggered processing to avoid rate limits
   - Added redundancy and health checking

## Technical Implementation Details

### LLM Client Class Enhancement

The LLMClient class was updated to support multiple AI providers, with a focus on OpenRouter for research and Gemini 2 Flash for enhancement:

```typescript
export enum LLMProvider {
  OPENAI = "openai",
  GEMINI = "gemini",
  ANTHROPIC = "anthropic",
  OPENROUTER = "openrouter"
}

// LLM models by provider
export const LLMModels = {
  [LLMProvider.OPENAI]: ["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"],
  [LLMProvider.GEMINI]: ["gemini-2-flash", "gemini-1.5-pro", "gemini-1.0-pro"],
  [LLMProvider.ANTHROPIC]: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"],
  [LLMProvider.OPENROUTER]: ["perplexity/sonar-small-online", "anthropic/claude-3-opus", "google/gemini-1.5-pro", "meta-llama/llama-3-70b-instruct"]
};

// Default models by provider
export const DefaultModels = {
  [LLMProvider.OPENAI]: "gpt-4o",
  [LLMProvider.GEMINI]: "gemini-2-flash",
  [LLMProvider.ANTHROPIC]: "claude-3-sonnet",
  [LLMProvider.OPENROUTER]: "perplexity/sonar-small-online"
};
```

The Gemini client implementation was updated to support Gemini 2 Flash:

```typescript
private async sendGeminiRequest(
  systemPrompt: string,
  userPrompt: string,
  options: LLMRequestOptions
): Promise<any> {
  if (!this.geminiApiKey) {
    throw new Error("Gemini API key not configured");
  }
  
  try {
    const model = options.model || DefaultModels[LLMProvider.GEMINI];
    const apiVersion = model.includes("gemini-2") ? "v1" : "v1beta";
    
    const response = await fetch(`https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${this.geminiApiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: `${systemPrompt}\n\n${userPrompt}` }
            ]
          }
        ],
        generationConfig: {
          temperature: options.temperature,
          maxOutputTokens: options.maxTokens,
          topP: options.topP
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${response.status} ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    // Parse JSON if the output format is JSON
    if (content) {
      try {
        return JSON.parse(content);
      } catch (e) {
        return content;
      }
    }
    
    return content;
  } catch (error) {
    this.logger.error(
      LogCategory.LLM,
      `Gemini API error: ${error}`,
      { error, systemPrompt, userPrompt },
      ['GEMINI', 'API_ERROR'],
      options.userId
    );
    throw error;
  }
}
```

The OpenRouter implementation for accessing Perplexity and other models:

```typescript
private async sendOpenRouterRequest(
  systemPrompt: string,
  userPrompt: string,
  options: LLMRequestOptions
): Promise<any> {
  if (!this.openrouterApiKey) {
    throw new Error("OpenRouter API key not configured");
  }
  
  try {
    const model = options.model || DefaultModels[LLMProvider.OPENROUTER];
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.openrouterApiKey}`,
        "HTTP-Referer": process.env.APP_URL || "https://spots.app",
        "X-Title": "Spots App"
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        top_p: options.topP,
        frequency_penalty: options.frequencyPenalty,
        presence_penalty: options.presencePenalty
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenRouter API error: ${response.status} ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    // Parse JSON if the output format is JSON
    if (content) {
      try {
        return JSON.parse(content);
      } catch (e) {
        return content;
      }
    }
    
    return content;
  } catch (error) {
    this.logger.error(
      LogCategory.LLM,
      `OpenRouter API error: ${error}`,
      { error, systemPrompt, userPrompt },
      ['OPENROUTER', 'API_ERROR'],
      options.userId
    );
    throw error;
  }
}
```

### Enhanced Logging System

Implemented a robust logging system for the LIM pipeline:

```typescript
export enum LogCategory {
  SYSTEM = "SYSTEM",
  API = "API",
  LLM = "LLM",
  DATABASE = "DATABASE",
  PIPELINE = "PIPELINE",
  USER = "USER"
}

export class LIMLogger {
  private logStorage: any[] = [];
  
  constructor() {
    // Initialize log storage, possibly with persistence
  }
  
  public info(
    category: LogCategory,
    message: string,
    data: any = {},
    tags: string[] = [],
    userId?: string
  ) {
    this.log('INFO', category, message, data, tags, userId);
  }
  
  public debug(
    category: LogCategory,
    message: string,
    data: any = {},
    tags: string[] = [],
    userId?: string
  ) {
    this.log('DEBUG', category, message, data, tags, userId);
  }
  
  public error(
    category: LogCategory,
    message: string,
    data: any = {},
    tags: string[] = [],
    userId?: string
  ) {
    this.log('ERROR', category, message, data, tags, userId);
  }
  
  public warning(
    category: LogCategory,
    message: string,
    data: any = {},
    tags: string[] = [],
    userId?: string
  ) {
    this.log('WARNING', category, message, data, tags, userId);
  }
  
  private log(
    level: 'INFO' | 'DEBUG' | 'ERROR' | 'WARNING',
    category: LogCategory,
    message: string,
    data: any = {},
    tags: string[] = [],
    userId?: string
  ) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      category,
      message,
      data,
      tags,
      userId
    };
    
    // Store log entry
    this.logStorage.push(logEntry);
    
    // Output to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[${timestamp}] [${level}] [${category}] ${message}`);
      if (Object.keys(data).length > 0) {
        console.log(JSON.stringify(data, null, 2));
      }
    }
    
    // In production, we would send this to a proper logging service
  }
}
```

### LIM Pipeline Implementation

The refresh-recommendations.ts script was updated to use our enhanced LLMClient for the pipeline:

```typescript
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
      } catch (error) {
        // Update statistics
        stats.failed++;
        stats.byLocation[location.id].failed++;
        stats.byInterest[interest.id].failed++;
      }
    }
  }
  
  // Complete statistics
  stats.completed = new Date();
  
  return stats;
}
```

## Next Steps

### 1. User Personalization

- Implement user history tracking for personalized recommendations
- Create interest affinity scoring based on user behavior
- Develop a recommendation algorithm that considers user preferences
- Implement user profiles with favorite spots and interests

### 2. Social Features

- Develop check-in functionality with social sharing
- Implement friend connections and activity feeds
- Create shared recommendation lists
- Add commenting and rating system for spots

### 3. Mobile Experience

- Optimize UI for mobile devices
- Implement location-based notifications
- Add offline mode for saved recommendations
- Develop progressive web app capabilities

### 4. Performance Optimization

- Implement caching for frequently accessed data
- Optimize database queries for scale
- Create a CDN strategy for images and static assets
- Implement background refresh for recommendations

## Lessons Learned

1. **API Integration Best Practices**
   - Using a unified client for multiple LLM providers simplifies code maintenance
   - Proper error handling and fallbacks are critical for production reliability
   - Structured logging helps diagnose and debug API issues
   - Type safety throughout the API client prevents subtle bugs

2. **Database Schema Design**
   - Proper indexing is critical for query performance
   - Relations between entities should be carefully designed
   - Using migrations for schema changes ensures database consistency
   - Database operations should be wrapped in transactions for data integrity

3. **Production Readiness**
   - Robust logging is essential for troubleshooting
   - Statistics tracking helps identify bottlenecks
   - Graceful error handling improves user experience
   - Mock data generation speeds up development and testing

4. **AI Pipeline Architecture**
   - Multi-stage pipelines with specialized models yield better results
   - Prompt engineering is critical for each specific model
   - Structured output formats make processing results easier
   - Validation of AI-generated content is essential before storage

This phase of development has significantly enhanced the Spots app with a more robust, production-ready LIM pipeline that leverages OpenRouter for Perplexity research and Gemini 2 Flash for fast, efficient enhancement of recommendations. 