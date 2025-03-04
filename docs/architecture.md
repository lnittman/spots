# Spots Architecture

This document describes the overall architecture of the Spots application, including components, data flow, and technical decisions.

## System Overview

Spots is a location recommendation platform that uses AI to help users discover places aligned with their interests. The system consists of several key components:

- **Web Application**: A Next.js 15-based web interface with React 19
- **AI Engine**: LLM-based recommendation and interest expansion system using Vercel AI SDK
- **API Layer**: Vercel API routes in edge runtime
- **Database**: Persistent storage for user data and recommendations

## High-Level Architecture

```
┌────────────────┐    
│                │    
│  Web Client    │    
│  (Next.js 15)  │    
│                │    
└───────┬────────┘    
        │                      
        ▼                      
┌────────────────────────────────────────┐
│                                        │
│       Vercel Edge API Routes           │
│                                        │
└───────────────────┬────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │
│  Vercel AI SDK  │     │  Database       │
│  (LLM Chains)   │     │  (NeonDB)       │
│                 │     │                 │
└─────────────────┘     └─────────────────┘
```

## Component Architecture

### Client Application

The web application follows this architecture:

- **Presentation Layer**: React 19 components with shadcn component library
- **State Management**: Zustand for global state, useSWR for server state
- **Navigation**: Next.js 15 App Router
- **API Integration**: Custom hooks to interact with Vercel API routes

#### Web-specific (Next.js 15)
- Server components for improved performance
- Edge API routes for backend functionality
- Static and dynamic rendering for content-heavy pages
- Progressive Web App (PWA) support

### AI Engine

The AI engine uses Vercel AI SDK to orchestrate multiple AI models:

- **Interest Expansion**: Transforms user interests into a broader taste graph (Claude)
- **Recommendation Pipeline**: Generates place recommendations based on user context (OpenAI)
- **Query Understanding**: Interprets natural language queries (Claude or OpenAI)
- **Experience Personalization**: Adapts recommendations based on user feedback (Perplexity)

Each AI flow follows a consistent pattern:
1. Input processing and validation
2. Context assembly
3. Streaming responses with Vercel AI SDK
4. Response parsing with structured outputs
5. Output validation with Zod

### API Layer

The API layer is built with Vercel Edge API routes and provides the following services:

- **User Management**: Authentication with NextAuth, profiles, preferences
- **Recommendation API**: AI-powered place recommendations
- **Places API**: Location data, details, and metadata
- **Feedback API**: User ratings and preferences

The API follows modern API design with:
- JWT-based authentication
- Request validation middleware
- Rate limiting with Upstash
- Error handling
- Logging and monitoring

### Database Architecture

The application uses a NeonDB PostgreSQL database with the following core models:

- **Users**: User accounts and authentication
- **Interests**: User interests and preferences
- **Places**: Location data and details
- **Recommendations**: Generated recommendations and metadata
- **Feedback**: User interaction with recommendations

## Data Flow

### Recommendation Flow

1. User inputs interests or makes a query
2. Client sends request to the Edge API route
3. API validates and prepares user context
4. Vercel AI SDK streams responses from appropriate AI models
5. AI expands interests into a detailed taste graph
6. AI generates recommendations based on taste graph and context
7. Client displays streaming recommendations to the user
8. User provides feedback which is stored and used for future improvements

### User Authentication Flow

1. User registers or logs in with NextAuth
2. JWT token is generated
3. Token is included in subsequent API requests
4. API validates token and grants access
5. On logout or expiration, token is invalidated

## Technology Stack

### Frontend
- **Framework**: Next.js 15, React 19, TypeScript
- **UI**: shadcn@canary, Tailwind CSS 4
- **State**: Zustand, useSWR
- **Animation**: Framer Motion

### Backend
- **API**: Vercel Edge Runtime API Routes
- **AI**: Vercel AI SDK with OpenAI, Claude, and Perplexity
- **Database**: NeonDB PostgreSQL, Prisma ORM
- **Caching**: Upstash Redis

### DevOps
- **Build**: Turborepo, pnpm workspaces
- **CI/CD**: GitHub Actions
- **Hosting**: Vercel (web and API)

## Security Architecture

- **Authentication**: NextAuth with JWT tokens
- **Authorization**: Role-based access control for API endpoints
- **Data Protection**: HTTPS for all communications, encryption at rest
- **Input Validation**: Server-side validation for all user inputs
- **Rate Limiting**: Protection against DDoS and brute force attacks with Upstash

## Scalability Considerations

- **Edge Network**: Vercel's global edge network for low-latency API responses
- **Caching Layer**: Upstash Redis for caching frequent queries and responses
- **Database Scaling**: NeonDB autoscaling for high load
- **AI Performance**: Streaming responses and caching of AI responses where appropriate
- **CDN**: Static assets served via Vercel's global CDN

## Monitoring and Observability

- **Application Monitoring**: Vercel Analytics and Sentry for error tracking
- **AI Monitoring**: Prompt performance, token usage, response quality
- **User Analytics**: Behavior tracking and conversion funnels with Mixpanel
- **Infrastructure Monitoring**: Vercel dashboard for application performance

## Future Architecture Evolution

- **Vector Database**: For more efficient semantic search of places
- **Real-time Features**: WebSocket integration for live updates
- **Edge Computing**: Moving more computations to the edge
- **Hybrid Rendering**: Optimizing between static, dynamic, and streaming rendering
- **PWA Capabilities**: Enhanced offline support 