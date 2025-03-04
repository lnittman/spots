# AI Development Protocol for Spots

> This guide provides comprehensive instructions for AI assistants to implement the Spots discovery app efficiently and effectively.

## 1. Project Understanding

### Core Concept
Spots is an AI-native discovery app delivering personalized place recommendations through a multi-stage LLM pipeline. 

### Key Features
- Emoji-driven interest selection creating a personalized "taste graph"
- Contextual recommendation engine using natural language interfaces
- Curated discovery feed with 5-7 daily personalized recommendations
- Social cartography with shareable maps and collaborative features

### System Architecture
- **Frontend**: React 19 with Next.js (web) on vercel
- **Backend**: vercel api routes in edge runtime, vercel ai sdk orchestrating multiple AI models (Claude, OpenAI, Perplexity)
- **UI**: shadcn with custom effective design system
- **Data Layer**: NeonDB with Prisma ORM, Upstash Redis for caching
- **State Management**: Zustand, useSWR, Zod for type validation

## 2. Implementation Strategy

### Phase 1: Foundation Setup (2-3 weeks)
1. **Project Scaffolding**
   - Initialize Next.js web application with TypeScript
   - Set up React/Next/Vercel
   - Configure shared libraries and dependencies
   - Implement base design system with Tailwind CSS

2. **Core Infrastructure**
   - Establish database schema with Prisma
   - Configure Redis caching with Upstash
   - Set up authentication flow with next auth
   - Implement basic state management with Zustand

3. **AI Pipeline Foundation**
   - Establish API connections (OpenRouter, Claude, OpenAI, Perplexity)
   - Build prompt engineering templates
   - Implement basic interest expansion model

### Phase 2: Core Features (3-4 weeks)
1. **Interest Selection System**
   - Build emoji-driven UI components
   - Implement interest expansion algorithm using Claude API
   - Create taste graph data structure and storage
   - Develop interest refinement mechanisms

2. **Recommendation Engine**
   - Build multi-stage LLM pipeline for recommendations
   - Implement query generation from user interests
   - Create web research module using Perplexity API
   - Develop result curation system

3. **User Interface Development**
   - Build the three main tabs (Discover, Ask, Maps)
   - Implement responsive design for both platforms
   - Add animations with Framer Motion
   - Create shared component library

### Phase 3: Advanced Features & Refinement (3-4 weeks)
1. **Maps Integration**
   - Implement Map
   - Build location saving and sharing functionality
   - Create collaborative map features
   - Integrate with Google Places API

2. **Recommendation Enhancement**
   - Refine contextual awareness (time, weather, events)
   - Implement feedback loop for recommendation improvement
   - Add personalization layers based on user behavior
   - Optimize AI response formatting

3. **Performance & Polish**
   - Implement caching strategies
   - Optimize API calls and reduce latency
   - Add error boundaries and fallbacks
   - Conduct cross-platform testing

## 3. Technical Best Practices

### Frontend Development
- **Component Architecture**: Use atomic design principles with shared components between platforms where possible
- **Style Management**: Implement Tailwind CSS with consistent design tokens, shadcnui@canary
- **State Management**:
  - Use Zustand for global application state
  - useSWR for server state and caching
  - Apply Zod for runtime type validation

### AI Implementation
- **Prompt Engineering**: Create systematic, versioned prompts with clear instruction layers
- **Chain Management**: Build modular LangChain components with:
  - Clear input/output contracts
  - Error handling and fallbacks
  - Logging and observability
- **Temperature Settings**: Use lower temperatures (0.1-0.3) for structured tasks, higher (0.7-0.9) for creative content

### Backend & Data
- **Database Schema**: Design normalized Prisma schema with proper relations
- **API Architecture**: Implement RESTful endpoints with proper versioning
- **Caching Strategy**:
  - Use Redis for frequent queries and session data
  - Implement stale-while-revalidate patterns with React Query

### Mobile-Specific
- **PWA**: next-pwa for full pwa setup for 2025, service worker optimized
- **Performance**: Implement virtualized lists for recommendation feeds
- **Offline Support**: Build offline capabilities with local storage

## 4. Testing & Validation Requirements

### AI Pipeline Validation
- **Prompt Testing**: Validate prompts across different scenarios
- **Output Validation**: Implement Zod schemas to validate AI outputs
- **Hallucination Detection**: Create checks for factual accuracy
- **Fallback Systems**: Test degraded performance scenarios

### User Experience Validation
- **Usability Testing**: Conduct sessions with representative users
- **Performance Metrics**: Monitor and optimize:
  - Time to first meaningful recommendation
  - AI response latency
  - Application load time
- **Accessibility**: Verify WCAG compliance across platforms

### Monitoring & Analytics
- **Error Tracking**: Implement Sentry for real-time error monitoring
- **User Analytics**: Set up Mixpanel for behavior tracking
- **Performance Monitoring**: Track API response times and model performance

## 5. Deployment Workflow

### CI/CD Pipeline
- Configure GitHub Actions for:
  - Automated testing on pull requests
  - Build verification
  - Deployment to staging environments

### Environment Management
- **Development**: Local environment with mock AI services
- **Staging**: Full integration with rate-limited AI services
- **Production**: Optimized performance with production API keys

### Release Strategy
- Implement feature flags for gradual rollout
- Use canary deployments for risk mitigation
- Establish rollback procedures for critical issues

## 6. Documentation Requirements

Maintain comprehensive documentation including:
- API specifications and endpoints
- Prompt engineering templates and rationales
- Component library with usage examples
- Database schema and relationships
- AI pipeline architecture and decision flow
- Environment setup and configuration

## 7. Implementation Priorities

Focus implementation efforts in this order:
1. Core recommendation engine and AI pipeline
2. User interest collection and refinement
3. Discovery feed and basic UI
4. Maps integration and location features
5. Social and sharing capabilities
6. Advanced contextual features

Always prioritize recommendation quality and user experience over feature quantity. The system's value lies in its ability to deliver highly personalized, contextual recommendations that feel tailored to each user.