# City-Interest Graph Architecture

## Overview

The City-Interest Graph is a core enhancement to the Spots application that creates a living, dynamic relationship between cities, interests, and places. This architecture allows users to see personalized, contextual content that updates based on the selected city and provides a more immersive and engaging experience.

## Goals

1. **Dynamic Content**: Display city-specific features and recommendations that update in real-time as users switch cities
2. **Contextual Awareness**: Provide time, weather, and location-aware recommendations
3. **Zero Latency Experience**: Leverage caching, pre-fetching, and streaming data to ensure instant feedback
4. **LLM-Enhanced Knowledge**: Use the existing LIM pipeline to generate rich, contextual content

## System Architecture

The City-Interest Graph architecture extends the existing LIM (Large Interest Model) pipeline with additional components:

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                           City-Interest Graph System                           │
└───────────────────────────────────────────────────────────────────────────────┘
                                      │
              ┌─────────────────────────────────────────────┐
              │                                             │
              ▼                                             ▼
┌──────────────────────────┐                 ┌───────────────────────────────┐
│      Data Collection     │                 │      Content Generation       │
│  ┌────────────────────┐  │                 │  ┌────────────────────────┐  │
│  │ City Information   │  │                 │  │ Personalized           │  │
│  │ - Location         │◄─┼─────────────────┼─►│ Recommendations        │  │
│  │ - Weather          │  │                 │  │                        │  │
│  │ - Timezone         │  │                 │  └────────────────────────┘  │
│  └────────────────────┘  │                 │  ┌────────────────────────┐  │
│  ┌────────────────────┐  │                 │  │ Natural Language       │  │
│  │ Interest Data      │  │                 │  │ Search Results         │  │
│  │ - User Interests   │◄─┼─────────────────┼─►│                        │  │
│  │ - Trending Topics  │  │                 │  └────────────────────────┘  │
│  └────────────────────┘  │                 │  ┌────────────────────────┐  │
│  ┌────────────────────┐  │                 │  │ Contextual Suggestions │  │
│  │ Place Database     │  │                 │  │ - Time-based           │  │
│  │ - Venue Details    │◄─┼─────────────────┼─►│ - Weather-based        │  │
│  │ - Ratings/Reviews  │  │                 │  │ - Event-based          │  │
│  └────────────────────┘  │                 │  └────────────────────────┘  │
└──────────────────────────┘                 └───────────────────────────────┘
              │                                             │
              │                                             │
              ▼                                             ▼
┌──────────────────────────┐                 ┌───────────────────────────────┐
│    LLM Enhancement       │                 │      UI Presentation          │
│  ┌────────────────────┐  │                 │  ┌────────────────────────┐  │
│  │ OpenRouter/        │  │                 │  │ Feature Demos          │  │
│  │ Perplexity Research │◄┼─────────────────┼─►│ - Dynamic Components   │  │
│  │                    │  │                 │  │ - City-specific Content │  │
│  └────────────────────┘  │                 │  └────────────────────────┘  │
│  ┌────────────────────┐  │                 │  ┌────────────────────────┐  │
│  │ Gemini Enhancement │  │                 │  │ Homepage Integration   │  │
│  │ - Structure        │◄─┼─────────────────┼─►│ - Location Dropdown    │  │
│  │ - Enrichment       │  │                 │  │ - Feature Cards        │  │
│  └────────────────────┘  │                 │  └────────────────────────┘  │
└──────────────────────────┘                 └───────────────────────────────┘
              │                                             │
              └─────────────────────────────────────────────┘
                                      │
                                      ▼
                      ┌─────────────────────────────┐
                      │      Storage Layer           │
                      │  ┌─────────────────────┐    │
                      │  │   Database          │    │
                      │  │ - Cache Layer       │    │
                      │  │ - Graph Relations   │    │
                      │  └─────────────────────┘    │
                      └─────────────────────────────┘
```

## Key Components

### 1. Data Collection System

The Data Collection system gathers information about cities, interests, and places from various sources:

- **City Information**: Geographic data, weather, time zones, local events
- **Interest Data**: User interests, trending topics, seasonal relevance 
- **Place Database**: Venue details, ratings, reviews, operating hours

### 2. LLM Enhancement Pipeline

The LLM Enhancement Pipeline uses the existing LIM architecture to enrich the data:

- **Research Stage**: Uses Perplexity via OpenRouter to perform deep research on city-interest combinations
- **Enhancement Stage**: Uses Gemini 2 Flash to structure and enrich the results
- **Validation Stage**: Ensures data quality and relevance

### 3. Content Generation System

The Content Generation system creates three types of content based on city and interests:

- **Personalized Recommendations**: Tailored suggestions based on interests and location
- **Natural Language Search Results**: City-specific search capabilities
- **Contextual Suggestions**: Time, weather, and event-aware recommendations

### 4. UI Presentation Layer

The UI Presentation layer displays the dynamic content to users:

- **Feature Demos**: Interactive showcases that update based on selected city
- **Homepage Integration**: Central location to demonstrate functionality
- **Main App Integration**: Consistent experience across explore and dashboard pages

### 5. Storage Layer

The Storage Layer maintains the relationships between cities, interests, and places:

- **Cache Layer**: Fast access to frequently requested combinations
- **Graph Relations**: Mapping the connections between entities
- **Versioning**: Historical data for comparative analysis

## Data Flow

1. **Initial Page Load**:
   - Load default city data (e.g., Los Angeles)
   - Display pre-cached feature demos for the default city

2. **City Selection**:
   - User selects a different city from the dropdown
   - UI shows loading state for features
   - Request city-specific data from cache or API

3. **Content Update**:
   - Update all three feature demos with city-specific content
   - Log the selection for analytics

4. **Background Processing**:
   - Prefetch data for likely next cities
   - Update cache with new combinations

## Cron Job Workflow

### Refresh Trending Cities (Daily)

```
┌───────────┐     ┌─────────────┐     ┌───────────────┐     ┌─────────────┐
│  Start    │────►│  Perplexity │────►│ Gemini        │────►│  Store in   │
│  Cron Job │     │  Research   │     │ Enhancement   │     │  Database   │
└───────────┘     └─────────────┘     └───────────────┘     └─────────────┘
```

1. Cron job triggers at midnight UTC daily
2. Calls Perplexity via OpenRouter to research trending cities
3. Processes results with Gemini 2 Flash for structured data
4. Stores results in database with timestamp
5. Updates cache for web app

### Refresh Interest Data (Weekly)

```
┌───────────┐     ┌─────────────┐     ┌───────────────┐     ┌─────────────┐
│  Start    │────►│  Process    │────►│  Generate     │────►│  Update     │
│  Cron Job │     │  Top Cities │     │  Combinations │     │  Content    │
└───────────┘     └─────────────┘     └───────────────┘     └─────────────┘
```

1. Cron job triggers weekly on Sunday
2. Identifies top cities from analytics
3. Generates city-interest combinations
4. Updates content for each combination

## Implementation Details

### Recommendations API

```typescript
// API routes
GET /api/recommendations?city={cityName}&interests={interestIds}
GET /api/search?city={cityName}&query={searchQuery}
GET /api/contextual?city={cityName}&time={timeOfDay}
```

### Caching Strategy

1. **Edge Caching**: Frequently accessed city-interest combinations
2. **Tiered Expiration**: Different TTLs based on data volatility
3. **Background Updates**: Refresh cache before expiration

### UI Components

1. **LocationDropdown**: City selection with emojis and trending indicators
2. **DynamicFeatures**: Container for city-specific feature demos
3. **FeatureDemo**: Individual feature showcase with loading states

## Future Enhancements

1. **Real-time Weather Integration**: Live weather data for contextual suggestions
2. **User Feedback Loop**: Incorporate user interactions to improve recommendations
3. **Social Graph Integration**: Show friends' favorite places in each city
4. **Timeline View**: Historical and upcoming events for each city
5. **AR Integration**: Visual overlay of recommendations on city map

## Performance Metrics

1. **Time to Interactive**: Target < 2 seconds for initial load
2. **City Switch Latency**: Target < 500ms for city change
3. **Cache Hit Rate**: Target > 90% for common cities
4. **API Response Time**: Target < 200ms for cached responses 