# Large Interest Model (LIM) Architecture

This document describes the architecture and design decisions of the Large Interest Model (LIM) pipeline used in the Spots app.

## System Overview

The LIM pipeline is designed to generate high-quality, context-aware recommendations for various interests across different locations. It follows a multi-stage AI pipeline approach with specialized models for different tasks.

![LIM Architecture Diagram](../assets/lim-architecture.png)

## Components

### 1. LLM Client

The `LLMClient` class is the central component that interfaces with multiple LLM providers:

```typescript
export class LLMClient {
  private logger: LIMLogger;
  private openaiApiKey?: string;
  private geminiApiKey?: string;
  private anthropicApiKey?: string;
  private openrouterApiKey?: string;
  
  // Methods for sending requests to different providers
  private async sendOpenAIRequest(...) { ... }
  private async sendGeminiRequest(...) { ... }
  private async sendAnthropicRequest(...) { ... }
  private async sendOpenRouterRequest(...) { ... }
  
  // Template processing and request routing
  public async processTemplate(...) { ... }
}
```

Key features:
- Provider abstraction and automatic fallback
- Unified interface for all LLM requests
- Structured error handling and logging
- Template-based prompting

### 2. Logging System

The `LIMLogger` class provides structured logging capabilities:

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
  public info(category: LogCategory, message: string, ...) { ... }
  public debug(category: LogCategory, message: string, ...) { ... }
  public error(category: LogCategory, message: string, ...) { ... }
  public warning(category: LogCategory, message: string, ...) { ... }
}
```

Features:
- Category-based log organization
- Structured data attachment
- Tag-based filtering
- User context tracking

### 3. Pipeline Execution

The pipeline is executed through the `refresh-recommendations.ts` script, which orchestrates:

```typescript
async function refreshAllRecommendations() {
  // Initialize statistics
  // For each location and interest:
  //   1. Perform deep research
  //   2. Enhance with structured formatting
  //   3. Store results
  //   4. Update statistics
  // Return comprehensive statistics
}
```

### 4. Database Schema

The database schema supports storing structured recommendations:

```prisma
model Recommendation {
  id          String   @id @default(cuid())
  name        String
  description String?
  type        String
  interestId  String
  locationId  String
  neighborhood String?
  priceRange  Int?
  popularity  Int?
  coordinates Float[]
  tags        String[]
  website     String?
  imageUrl    String?
  checkIns    Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  interest    Interest @relation(fields: [interestId], references: [id])
  location    Location @relation(fields: [locationId], references: [id])
}
```

## Data Flow

1. **Configuration**: The pipeline begins with configuration of locations, interests, and LLM parameters
2. **Research**: For each location-interest pair, deep research is performed using Perplexity via OpenRouter
3. **Enhancement**: The raw research data is processed by Gemini 2 Flash into structured recommendations
4. **Storage**: Processed recommendations are stored in the database and backed up as JSON files
5. **Analytics**: Statistics are generated on success/failure rates and quality metrics

## Design Decisions

### Multi-Provider Strategy

We chose to implement a flexible multi-provider approach to:
- Leverage each model's strengths (Perplexity for research, Gemini for formatting)
- Provide fallback options if a service is unavailable
- Future-proof as new models become available

### Two-Stage Pipeline

The two-stage approach (research → enhancement) provides several benefits:
- Better quality through specialization
- More control over the formatting process
- Ability to validate and filter between stages
- Potentially lower costs by optimizing token usage

### Structured Logging

The comprehensive logging system enables:
- Debugging complex pipeline failures
- Performance monitoring and optimization
- Usage analytics
- Error tracking and resolution

### JSON Fallback Storage

In addition to database storage, we implemented JSON fallback to:
- Provide redundancy in case of database issues
- Enable easier debugging and data inspection
- Support development without a database connection
- Allow for data portability

## Performance Considerations

### Staggered Processing

To avoid rate limits and optimize performance:
- Requests are processed sequentially rather than in parallel
- Automatic retry logic with exponential backoff
- Batching of similar requests

### Caching Strategy

The system implements caching at several levels:
- API response caching to reduce duplicate requests
- Database query caching for frequently accessed data
- In-memory caching for configuration and templates

## Security

- API keys are stored securely in environment variables
- All external API calls use HTTPS
- Rate limiting and usage monitoring protect against excessive costs
- Input validation prevents prompt injection

## Future Enhancements

1. **Parallel Processing**: Implement parallel processing with rate limiting for faster execution
2. **User Feedback Loop**: Incorporate user feedback to improve recommendation quality
3. **Adaptive Prompting**: Dynamically adjust prompts based on previous results
4. **Streaming Support**: Add streaming for incremental processing of large datasets
5. **Recommendation Diversity**: Implement diversity measures to avoid recommendation homogeneity 