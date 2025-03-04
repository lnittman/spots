# Prompt Engineering Guidelines

This document outlines best practices for crafting prompts when working with the AI components in Spots using the Vercel AI SDK.

## Introduction

Effective prompt engineering is crucial for getting high-quality, consistent results from AI models. The Spots app uses the Vercel AI SDK to interact with large language models (LLMs) for features such as personalized recommendations, natural language search, and conversational interfaces.

## Vercel AI SDK Integration

Spots uses the Vercel AI SDK to streamline AI integration:

```tsx
// app/api/ai/recommendations/route.ts
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { openai } from '@/lib/ai/openai-client';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const { query, userInterests, location } = await req.json();
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [
      {
        role: 'system',
        content: getSystemPrompt(userInterests),
      },
      {
        role: 'user',
        content: formatUserQuery(query, location),
      },
    ],
    temperature: 0.7,
    stream: true,
  });
  
  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
```

## Prompt Structure

For consistent results, structure prompts with the following components:

### System Prompts

System prompts set the context and persona for the AI. They should be clear, specific, and establish:

1. The AI's role and persona
2. Task-specific context
3. Output format requirements
4. Constraints or limitations

**Example System Prompt:**

```typescript
function getSystemPrompt(userInterests: string[]): string {
  return `You are Spots, an AI travel assistant specialized in providing personalized place recommendations.

CONTEXT:
- The user's interests include: ${userInterests.join(', ')}
- You should prioritize places that match these interests
- Consider the time of day and season when making recommendations
- Focus on local, authentic experiences over tourist traps

TASK:
- Recommend places based on the user's query and interests
- Explain why each place matches their preferences
- Include practical details like approximate cost and busy times

RESPONSE FORMAT:
- Respond in a conversational, friendly tone
- Structure your response with clear sections for each recommendation
- Include 3-5 recommendations unless the user specifies otherwise
- Format each recommendation with: Name, Description, Why It Matches, Practical Tips

CONSTRAINTS:
- Never recommend places that are permanently closed
- If you're uncertain about details, acknowledge the limitation
- Don't make up fictitious places
- If the query is outside your knowledge, say so rather than inventing information`;
}
```

### User Prompts

User prompts should be formatted consistently to include all relevant information:

```typescript
function formatUserQuery(query: string, location: { latitude: number, longitude: number }): string {
  return `I'm looking for: ${query}

My current location: ${location.latitude}, ${location.longitude}

Current time: ${new Date().toLocaleTimeString()}
Current date: ${new Date().toLocaleDateString()}

Please recommend places that match my interests and current query.`;
}
```

## Vercel AI SDK Components

### Chat Interface

When implementing chat functionality, use the `useChat` hook from Vercel AI SDK:

```tsx
'use client';

import { useChat } from 'ai/react';

export function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/ai/chat',
    initialMessages: [
      {
        id: 'welcome-message',
        role: 'assistant',
        content: "Hi! I'm your Spots assistant. Ask me for recommendations around you or tell me what you're looking for!",
      },
    ],
  });
  
  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map(message => (
          <div key={message.id} className={`message ${message.role}`}>
            <div className="content">{message.content}</div>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="input-area">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about places nearby..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Thinking...' : 'Ask'}
        </button>
      </form>
    </div>
  );
}
```

### Completion Interface

For simpler AI interactions, use the `useCompletion` hook:

```tsx
'use client';

import { useCompletion } from 'ai/react';

export function QuickSearch() {
  const { completion, input, handleInputChange, handleSubmit, isLoading } = useCompletion({
    api: '/api/ai/quick-search',
    body: {
      // Additional context sent with every request
      userPreferences: {
        priceRange: 'moderate',
        accessibility: true,
      },
    },
  });
  
  return (
    <div className="quick-search">
      <form onSubmit={handleSubmit}>
        <input 
          value={input} 
          onChange={handleInputChange} 
          placeholder="I'm looking for..." 
        />
        <button disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>
      
      {completion && (
        <div className="results">
          {completion}
        </div>
      )}
    </div>
  );
}
```

## Prompt Templates

### Location Recommendations

```typescript
export function createLocationRecommendationPrompt(query: string, userProfile: UserProfile, coords: Coordinates): ChatCompletionMessageParam[] {
  return [
    {
      role: 'system',
      content: `You are an expert local guide who provides personalized place recommendations.
      
You know the user has the following interests: ${userProfile.interests.join(', ')}.
Their past visits indicate they enjoy: ${userProfile.pastVisits.map(v => v.category).join(', ')}.
      
Provide 3-5 specific recommendations for places that match their query and profile.
For each recommendation, include:
1. Name of the place
2. Brief description
3. Why it matches their interests
4. One insider tip`
    },
    {
      role: 'user',
      content: `I'm at ${coords.latitude}, ${coords.longitude}.
      
${query}
      
Please recommend places nearby that I might enjoy.`
    }
  ];
}
```

### Natural Language Search Query

```typescript
export function createSearchQueryPrompt(userInput: string): ChatCompletionMessageParam[] {
  return [
    {
      role: 'system',
      content: `You are a search query optimizer for a location discovery app.
      
Your job is to convert user natural language into structured search parameters.
Output should be valid JSON with these possible fields:
- query: string (main search term)
- categories: string[] (place categories like "restaurant", "museum", etc.)
- priceLevel: number (1-4, from least to most expensive)
- openNow: boolean (if user wants places open now)
- sortBy: "relevance" | "distance" | "rating" (how to sort results)
- radius: number (search radius in meters, default 1500)

Only include fields that can be confidently inferred from the user input.`
    },
    {
      role: 'user',
      content: userInput
    }
  ];
}
```

### Interest Expansion

```typescript
export function createInterestExpansionPrompt(interests: string[]): ChatCompletionMessageParam[] {
  return [
    {
      role: 'system',
      content: `You are an expert in categorizing and expanding user interests for a travel recommendation system.
      
Given a set of user interests, your task is to:
1. Group them into logical categories
2. Expand each interest with 3-5 related sub-interests
3. Suggest 2-3 completely new interests that complement their existing ones
      
Format the response as JSON:
{
  "categories": {
    "categoryName": ["interest1", "interest2"]
  },
  "expansions": {
    "interest": ["subInterest1", "subInterest2"]
  },
  "suggestions": ["newInterest1", "newInterest2"]
}`
    },
    {
      role: 'user',
      content: `Here are my current interests: ${interests.join(', ')}.
      
Please categorize and expand them, and suggest new interests I might enjoy.`
    }
  ];
}
```

## Advanced Techniques

### Chain of Thought

For complex reasoning tasks, use chain of thought prompting to guide the model through a step-by-step process:

```typescript
export function createItineraryPlanPrompt(preferences: UserPreferences, location: string, duration: number): ChatCompletionMessageParam[] {
  return [
    {
      role: 'system',
      content: `You are an expert travel planner creating personalized itineraries.
      
When planning, follow these steps:
1. First, analyze the location and identify key attractions that match user interests
2. Consider travel times between locations and logical grouping by proximity
3. Account for typical opening hours and busy periods
4. Balance the itinerary with variety (activities, food, culture, relaxation)
5. Finally, organize into a day-by-day plan with specific time blocks
      
Format as a readable itinerary with days, times, and brief descriptions.`
    },
    {
      role: 'user',
      content: `I'm visiting ${location} for ${duration} days.
      
My interests are: ${preferences.interests.join(', ')}
My travel style is: ${preferences.travelStyle}
My budget level is: ${preferences.budgetLevel}
      
Please create a detailed day-by-day itinerary.`
    }
  ];
}
```

### Few-Shot Learning

Provide examples to demonstrate the expected output format:

```typescript
export function createPlaceDescriptionPrompt(placeData: PlaceData): ChatCompletionMessageParam[] {
  return [
    {
      role: 'system',
      content: `You create engaging, personalized descriptions of places based on factual data.
      
Your descriptions should be:
- Conversational and friendly
- Highlight unique aspects
- Include practical information
- 2-3 paragraphs in length`
    },
    {
      role: 'user',
      content: `Example place:
Name: Cafe Artemis
Type: Coffee Shop
Features: Roasts own beans, outdoor seating, local art
Hours: 7am-8pm daily
Rating: 4.7/5 from 283 reviews
      
Example description:
Cafe Artemis isn't just another coffee shop - it's a local haven for coffee enthusiasts where the rich aroma of freshly roasted beans greets you at the door. Their in-house roasting process ensures exceptional freshness, and the baristas are passionate about crafting the perfect cup to your preferences.
      
The spacious outdoor patio showcases rotating exhibits from local artists, making it an ideal spot to sip your latte while soaking in some culture. Open from early morning until evening every day, it's a reliable retreat whether you're starting your day or winding down. With consistently high praise from nearly 300 reviewers, it's clear why locals consider this their go-to coffee destination.`
    },
    {
      role: 'user',
      content: `Now, please create a description for this place:
Name: ${placeData.name}
Type: ${placeData.type}
Features: ${placeData.features.join(', ')}
Hours: ${placeData.hours}
Rating: ${placeData.rating}/5 from ${placeData.reviewCount} reviews`
    }
  ];
}
```

### Function Calling with AI

Utilize AI function calling for structured data extraction:

```tsx
// app/api/ai/extract-preferences/route.ts
import { openai } from '@/lib/ai/openai-client';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const extractPreferencesFunction = {
  name: "extractPreferences",
  description: "Extract user preferences from their natural language input",
  parameters: {
    type: "object",
    properties: {
      interests: {
        type: "array",
        items: { type: "string" },
        description: "Activities, cuisines, or experiences the user is interested in"
      },
      priceRange: {
        type: "string",
        enum: ["budget", "moderate", "premium", "luxury"],
        description: "User's price preference"
      },
      mealTime: {
        type: "string",
        enum: ["breakfast", "lunch", "dinner", "snack"],
        description: "What meal the user is looking for, if applicable"
      },
      occasionType: {
        type: "string",
        description: "Type of occasion (romantic, family, business, etc.)"
      },
      accessibility: {
        type: "boolean",
        description: "Whether user needs accessible options"
      }
    },
    required: ["interests"]
  }
};

export async function POST(req: NextRequest) {
  const { userInput } = await req.json();
  
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [
      {
        role: "system",
        content: "You are an AI assistant that helps extract user preferences for place recommendations."
      },
      {
        role: "user",
        content: userInput
      }
    ],
    functions: [extractPreferencesFunction],
    function_call: { name: "extractPreferences" }
  });
  
  const functionCall = response.choices[0].message.function_call;
  
  if (functionCall && functionCall.name === "extractPreferences") {
    const extractedPreferences = JSON.parse(functionCall.arguments);
    return Response.json({ preferences: extractedPreferences });
  }
  
  return Response.json({ error: "Failed to extract preferences" }, { status: 500 });
}
```

## Prompt Testing and Optimization

### Testing Framework

Set up a testing framework to evaluate prompt performance:

```typescript
// lib/ai/promptTesting.ts
interface PromptTest {
  name: string;
  prompt: ChatCompletionMessageParam[];
  evaluationCriteria: Array<{
    name: string;
    weight: number;
    evaluationFn: (response: string) => number; // 0-1 score
  }>;
}

async function runPromptTest(test: PromptTest, runs = 3): Promise<{
  averageScore: number;
  criteriaScores: Record<string, number>;
  responses: string[];
}> {
  const responses: string[] = [];
  
  // Run the prompt multiple times
  for (let i = 0; i < runs; i++) {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: test.prompt,
      temperature: 0.7,
    });
    
    responses.push(response.choices[0].message.content || '');
  }
  
  // Evaluate each criterion
  const criteriaScores: Record<string, number> = {};
  let totalWeightedScore = 0;
  let totalWeight = 0;
  
  for (const criterion of test.evaluationCriteria) {
    const scores = responses.map(r => criterion.evaluationFn(r));
    const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    
    criteriaScores[criterion.name] = avgScore;
    totalWeightedScore += avgScore * criterion.weight;
    totalWeight += criterion.weight;
  }
  
  const averageScore = totalWeightedScore / totalWeight;
  
  return {
    averageScore,
    criteriaScores,
    responses,
  };
}
```

### Evaluation Criteria

Define specific evaluation criteria for prompts:

```typescript
// Example criteria for place recommendations
const placeRecommendationCriteria = [
  {
    name: 'relevance',
    weight: 0.4,
    evaluationFn: (response: string) => {
      // Count specific mentions of user interests
      const interestMentions = userInterests.filter(interest => 
        response.toLowerCase().includes(interest.toLowerCase())
      ).length;
      
      return Math.min(interestMentions / userInterests.length, 1);
    }
  },
  {
    name: 'specificity',
    weight: 0.3,
    evaluationFn: (response: string) => {
      // Check for specific place names, addresses, etc.
      const hasSpecificPlaces = /[A-Z][a-z]+ (Restaurant|Cafe|Museum|Park|Shop|Theater)/g.test(response);
      const hasAddresses = /\d+ [A-Za-z]+ (Street|Avenue|Road|Lane|Drive)/g.test(response);
      
      return (hasSpecificPlaces ? 0.5 : 0) + (hasAddresses ? 0.5 : 0);
    }
  },
  {
    name: 'diversity',
    weight: 0.2,
    evaluationFn: (response: string) => {
      // Count unique place types
      const placeTypes = ['restaurant', 'cafe', 'museum', 'park', 'shop', 'theater', 'gallery', 'bar'];
      const mentionedTypes = placeTypes.filter(type => 
        response.toLowerCase().includes(type)
      ).length;
      
      return Math.min(mentionedTypes / 3, 1); // Expect at least 3 types
    }
  },
  {
    name: 'practicality',
    weight: 0.1,
    evaluationFn: (response: string) => {
      // Check for practical information
      const hasPricing = /(\$\$?|\$\$\$|\$\$\$\$|budget|affordable|expensive)/i.test(response);
      const hasHours = /open until|open from|hours|close at/i.test(response);
      
      return (hasPricing ? 0.5 : 0) + (hasHours ? 0.5 : 0);
    }
  }
];
```

## Handling AI Limitations

### Uncertainty

Guide the model to express uncertainty rather than hallucinate:

```typescript
// Add to system prompts:
const uncertaintyGuidance = `
If you're uncertain about specific details:
1. Clearly state what you know with confidence
2. Express uncertainty about specific details you're unsure of
3. Provide general guidance based on what you do know
4. NEVER make up specific details like addresses, phone numbers, or operating hours
5. Suggest ways the user could verify the uncertain information`;
```

### Rate Limiting and Pricing

Implement proper rate limiting:

```typescript
// lib/ai/rate-limiting.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Create a Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Create a rate limiter that allows 20 requests per minute
export const aiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 m'),
  analytics: true,
  prefix: 'ai-api',
});

// Usage in API routes
export async function checkRateLimit(userId: string): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const identifier = `user_${userId}`;
  const result = await aiRateLimit.limit(identifier);
  
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}
```

### Content Filtering

Implement content moderation:

```typescript
// lib/ai/content-moderation.ts
import { openai } from './openai-client';

export async function moderateContent(text: string): Promise<{ flagged: boolean; categories: string[] }> {
  try {
    const moderation = await openai.moderations.create({
      input: text,
    });
    
    const result = moderation.results[0];
    
    if (result.flagged) {
      const flaggedCategories = Object.entries(result.categories)
        .filter(([_, value]) => value)
        .map(([key, _]) => key);
      
      return {
        flagged: true,
        categories: flaggedCategories,
      };
    }
    
    return {
      flagged: false,
      categories: [],
    };
  } catch (error) {
    console.error('Moderation API error:', error);
    return {
      flagged: true, // Fail safe: treat errors as potentially problematic content
      categories: ['error_during_moderation'],
    };
  }
}
```

## Best Practices for Prompt Management

### Centralized Prompt Repository

Store prompts in a centralized location:

```typescript
// lib/ai/prompts/index.ts
export { createLocationRecommendationPrompt } from './location-recommendations';
export { createSearchQueryPrompt } from './search-query';
export { createInterestExpansionPrompt } from './interest-expansion';
export { createItineraryPlanPrompt } from './itinerary';
export { createPlaceDescriptionPrompt } from './place-description';

// lib/ai/prompts/location-recommendations.ts
import { ChatCompletionMessageParam } from 'openai/resources/chat';
import { UserProfile, Coordinates } from '@/types';

export function createLocationRecommendationPrompt(
  query: string, 
  userProfile: UserProfile, 
  coords: Coordinates
): ChatCompletionMessageParam[] {
  // Implementation as shown earlier
}
```

### Version Control for Prompts

Implement versioning for prompts:

```typescript
// lib/ai/prompts/prompt-versions.ts
interface PromptVersion {
  version: string;
  date: string;
  changes: string;
  promptFn: Function;
}

const locationRecommendationVersions: Record<string, PromptVersion> = {
  'v1': {
    version: 'v1',
    date: '2023-11-01',
    changes: 'Initial version',
    promptFn: createLocationRecommendationPromptV1,
  },
  'v2': {
    version: 'v2',
    date: '2023-12-15',
    changes: 'Added budget preferences and accessibility options',
    promptFn: createLocationRecommendationPromptV2,
  },
  'current': {
    version: 'v2',
    date: '2023-12-15',
    changes: 'Added budget preferences and accessibility options',
    promptFn: createLocationRecommendationPromptV2,
  }
};

export function getPromptVersion(type: string, version = 'current'): PromptVersion {
  const promptTypes: Record<string, Record<string, PromptVersion>> = {
    'location-recommendation': locationRecommendationVersions,
    // Other prompt types...
  };
  
  if (!promptTypes[type]) {
    throw new Error(`Unknown prompt type: ${type}`);
  }
  
  if (!promptTypes[type][version]) {
    throw new Error(`Unknown version ${version} for prompt type ${type}`);
  }
  
  return promptTypes[type][version];
}
```

## Conclusion

Effective prompt engineering is critical for harnessing AI capabilities in Spots. By following these guidelines, you can create consistent, high-quality interactions that enhance the user experience.

Remember that prompt engineering is an iterative process. Continuously test, refine, and adapt your prompts based on user feedback and changing requirements. 