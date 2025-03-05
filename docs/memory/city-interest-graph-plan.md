# City-Interest Graph Implementation Plan

## Project Overview

The City-Interest Graph is a fundamental enhancement to the Spots application that creates a dynamic relationship between cities, interests, and spot recommendations. This feature will make the application more engaging by showing personalized, contextually relevant content based on the selected city.

## Business Objectives

1. **Increase User Engagement**: By showing dynamic, city-specific content that updates in real-time
2. **Improve First-Time User Experience**: Create a more compelling demo of the app's capabilities
3. **Increase Conversion Rates**: Drive more users from homepage to sign-up through engaging feature demos
4. **Extend Platform Capabilities**: Create a foundation for more advanced contextual recommendations

## Technical Goals

1. Create a seamless, responsive UI that updates as users switch cities
2. Implement a robust caching system to minimize latency
3. Integrate with existing LIM pipeline for rich, AI-enhanced content
4. Establish proper data structures for the city-interest-spot graph

## Project Phases

### Phase 1: Foundation (Week 1)

**Goal**: Establish core components and data structures

#### Tasks:

1. **Design System Enhancement**
   - [ ] Create detailed architecture document
   - [ ] Define data models and relationships
   - [ ] Design API endpoints and interfaces

2. **Update City Data System**
   - [ ] Enhance city data structure with additional metadata
   - [ ] Implement emoji assignments for all cities
   - [ ] Add trending status capability

3. **Create UI Components**
   - [x] Develop LocationDropdown component
   - [x] Create DynamicFeatures component
   - [x] Integrate components into homepage

4. **Implement Basic Content Generation**
   - [ ] Create mock data generators for each feature type
   - [ ] Develop city-specific content variants
   - [ ] Add loading states and transitions

### Phase 2: AI Integration (Week 2)

**Goal**: Connect to LIM pipeline for enhanced content

#### Tasks:

1. **Enhance LIM Templates**
   - [ ] Create city-interest combination templates
   - [ ] Develop context-aware prompt structures
   - [ ] Implement structured output schemas

2. **Implement API Endpoints**
   - [ ] `/api/recommendations` with city parameter
   - [ ] `/api/search` with city-specific results
   - [ ] `/api/contextual` for time/weather awareness

3. **Develop Caching System**
   - [ ] Implement Redis cache for city-interest combinations
   - [ ] Create cache warming mechanism for top cities
   - [ ] Set up cache invalidation rules

4. **Create Background Processors**
   - [ ] Develop city trend detection service
   - [ ] Implement prefetching for likely next cities
   - [ ] Set up data refresh pipeline

### Phase 3: Production Readiness (Week 3)

**Goal**: Polish, test, and optimize for production

#### Tasks:

1. **Testing and Optimization**
   - [ ] Perform load testing for popular cities
   - [ ] Optimize cache hit rates
   - [ ] Test across devices and screen sizes

2. **Logging and Analytics**
   - [ ] Implement detailed logging for city changes
   - [ ] Set up tracking for feature engagement
   - [ ] Create dashboard for monitoring

3. **Documentation**
   - [ ] Update API documentation
   - [ ] Create developer guide for city-interest integration
   - [ ] Document caching strategies

4. **Deployment**
   - [ ] Set up cron jobs for data refresh
   - [ ] Configure production environment
   - [ ] Deploy to staging for final testing

## Timeline

```
Week 1: Foundation
├── Days 1-2: Design and Planning
├── Days 3-4: City Data System Updates
└── Days 5-7: UI Component Development

Week 2: AI Integration
├── Days 8-9: LIM Template Enhancement
├── Days 10-11: API Endpoint Implementation
└── Days 12-14: Caching System Development

Week 3: Production Readiness
├── Days 15-16: Testing and Optimization
├── Days 17-18: Logging and Analytics
└── Days 19-21: Documentation and Deployment
```

## Technical Implementation Details

### Data Models

```typescript
// City Data
interface CityData {
  id: string;
  name: string;
  coordinates: [number, number];
  emoji: string;
  trending: boolean;
  type: string;
  lastUpdated?: Date;
  rank?: number;
  trendingReason?: string;
  timezone: string;
  weatherInfo?: {
    temperatureRange: [number, number];
    conditions: string;
    seasonalInfo: string;
  };
}

// City-Interest Relationship
interface CityInterestRelation {
  cityId: string;
  interestId: string;
  relevanceScore: number;
  recommendations: Recommendation[];
  lastUpdated: Date;
  cachedUntil: Date;
}

// Recommendation
interface Recommendation {
  id: string;
  name: string;
  description: string;
  type: string;
  coordinates: [number, number];
  address?: string;
  rating?: number;
  tags: string[];
  imageUrl?: string;
  contextualRelevance?: {
    time?: string[]; // e.g., ["morning", "evening"]
    weather?: string[]; // e.g., ["sunny", "rainy"]
    season?: string[]; // e.g., ["summer", "winter"]
  };
}
```

### Cache Strategy

```
CACHE KEY STRUCTURE:
  city:{cityId}:basic              // Basic city information
  city:{cityId}:weather            // Weather information (TTL: 1 hour)
  city:{cityId}:interest:{intId}   // City-interest recommendations (TTL: 1 day)
  city:{cityId}:trending           // Trending status (TTL: 1 day)
  city:{cityId}:search:{query}     // Search results (TTL: 1 week)
```

### API Endpoints

```typescript
// Get recommendations for a city and interests
GET /api/recommendations
  Query Parameters:
    - city: string       // City name or ID
    - interests: string  // Comma-separated interest IDs
    - limit: number      // Maximum number of results (default: 10)

// Search in a specific city context
GET /api/search
  Query Parameters:
    - city: string       // City name or ID
    - query: string      // Natural language query
    - limit: number      // Maximum number of results (default: 5)

// Get contextual suggestions
GET /api/contextual
  Query Parameters:
    - city: string       // City name or ID
    - time: string       // Time of day (optional)
    - weather: string    // Weather condition (optional)
    - season: string     // Current season (optional)
```

## Integration with Existing Components

### LIM Pipeline Integration

The City-Interest Graph will leverage the existing LIM pipeline:

1. **Input**: City-interest combinations
2. **Research Stage**: OpenRouter/Perplexity for information gathering
3. **Enhancement Stage**: Gemini 2 Flash for structure and enrichment
4. **Output**: Structured recommendations, search results, and contextual suggestions

### UI Component Hierarchy

```
HomePage
└── DynamicFeatures
    ├── LocationDropdown (City Selector)
    └── FeatureCards
        ├── PersonalizedRecommendations
        ├── NaturalLanguageSearch
        └── ContextualAwareness
```

## Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| API rate limits with LLM providers | High | Medium | Implement aggressive caching, batch processing |
| Long loading times for uncached cities | Medium | Low | Add skeleton loaders, progressive enhancement |
| Data quality issues from LLMs | Medium | Medium | Add validation layer, human review for top cities |
| Browser compatibility issues | Low | Low | Test across browsers, progressive enhancement |

## Success Metrics

1. **Performance**:
   - Time to first meaningful paint: < 1.5s
   - City switching response time: < 500ms
   - Cache hit rate: > 90%

2. **Engagement**:
   - Feature section dwell time: > 30s
   - City switching actions per session: > 2
   - CTR on feature demos: > 15%

3. **Business Impact**:
   - Homepage to signup conversion: +5%
   - Return visitor rate: +10%
   - Feature usage in main app: +20%

## Future Roadmap

1. **Phase 1 (Current)**: Basic city-interest graph with static data enhancement
2. **Phase 2**: Real-time weather and event integration
3. **Phase 3**: Personalized city recommendations based on user history
4. **Phase 4**: Social layer showing friend activity by city
5. **Phase 5**: AR integration with city visualization 