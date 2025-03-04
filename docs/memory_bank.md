# Spots App - Development Memory Bank

This document serves as a knowledge repository for the Spots application development, capturing key decisions, architectural insights, and implementation notes. It is intended to be a living document that evolves throughout the development process.

## Project Structure

The project is organized as a monorepo using pnpm workspaces with the following structure:

```
spots/
├── apps/
│   ├── mobile/               # React Native mobile app
│   └── web/                  # Next.js web application
├── packages/
│   ├── ai/                   # Shared AI logic
│   ├── api/                  # Backend API services
│   ├── database/             # Database schemas and utilities
│   └── ui/                   # Shared UI components
├── docs/                     # Project documentation
├── pnpm-workspace.yaml       # pnpm workspace configuration
└── package.json              # Root package.json
```

## Technology Stack

- **Frontend**: 
  - Web: Next.js with TypeScript, Tailwind CSS
  - Mobile: React Native with Expo, NativeWind
  - Shared: Framer Motion, Radix UI, React Query, Zustand

- **Backend**:
  - Prisma ORM with PostgreSQL (NeonDB)
  - Express.js for API endpoints
  - LangChain.js for AI orchestration

- **AI Components**:
  - OpenAI (GPT-4) for recommendation curation
  - Anthropic (Claude) for interest expansion
  - Structured output parsing with Zod schemas

## Development Decisions

### Package Manager
- Using pnpm instead of npm for improved performance and disk space efficiency
- Configured via pnpm-workspace.yaml to manage the monorepo packages

### State Management
- Zustand selected for global state management due to its simplicity and Redux-like approach without the boilerplate
- React Query for server state and caching with automatic refetching

### Design System
- Following the atomic design methodology for UI components
- Implementing consistent design tokens across platforms
- Shared UI components package to maintain consistency

### AI Pipeline Architecture
- Multi-stage pipeline with specialized models for different tasks
- Interest expansion: Using Claude for more nuanced understanding of preferences
- Query generation: Specialized prompts to create effective search queries
- Recommendation curation: GPT-4 for final formatting and personalization
- Structured outputs enforced via Zod schemas

## Implementation Status

### Completed
- Project scaffolding with monorepo structure
- Basic package configuration for all modules
- Core type definitions for AI and API packages
- Initial UI component library structure
- Database schema design
- Mobile app foundation
  - Location tracking with Expo Location API
  - User authentication state management with Zustand
  - Recommendation service with mock data
  - UI components for displaying recommendations
  - Discover screen implementation with React Query

### In Progress
- AI chain implementation (interest expansion, recommendation pipeline)
- API service development
- Mobile and web app core screens
- Authentication flow integration
- Maps integration
- Ask screen implementation

### Pending
- Integration testing
- Performance optimization
- Deployment pipeline setup
- Analytics implementation
- Web application UI implementation

## Implementation Notes

### Database Schema
- User model connected to interests through many-to-many relationship
- Places contain rich metadata including coordinates, categories, and operating hours
- Collections feature allows users to group places into shareable maps
- SavedPlace joins table tracks user-specific place metadata like notes and ratings

### Interest Selection System
- Emoji-driven UI with categories for intuitive interaction
- Interest expansion algorithm transforms high-level interests into detailed taste graphs
- Local storage for offline capability with sync when online

### Mobile-specific Considerations
- Using React Native Maps for map integration
- SafeAreaView and platform-specific styling
- Optimizing for both iOS and Android

### Mobile App Structure
- Using React Navigation for tab-based navigation
- React Query for data fetching and caching
- Zustand for global state management
- Location tracking with Expo Location
- Mock services with simulated network delays for development

### React Native Best Practices
- Functional components with hooks
- Separated concerns with custom hooks, services, and components
- Strong typing with TypeScript interfaces
- Loading, error, and empty states for data-driven views
- Pull-to-refresh for content updates

### UI Components Implementation
- RecommendationCard: Displays place information with personalized reasoning
- SaveButton: Heart icon toggle for saving favorite places
- Location-aware context provider for entire application 

## Documentation Structure

We've established a comprehensive documentation framework that includes:

1. **Memory Bank** (this document) - Core knowledge repository capturing decisions and insights

2. **Architecture Document** (`architecture.md`) - Detailed technical architecture including system overview, component design, data flow, technology stack, security measures, and scalability considerations

3. **API Documentation** (`api_documentation.md`) - Comprehensive API reference covering all endpoints, authentication mechanisms, request/response formats, error handling, and usage examples

4. **Development Workflow** (`development_workflow.md`) - Guidelines for development processes including environment setup, coding standards, branch management, testing requirements, and deployment procedures

5. **Prompt Engineering Guide** (`prompt_engineering.md`) - Documentation of AI prompt templates and strategies, including structured approaches to different recommendation tasks, temperature settings, and output validation methods

6. **Design System Documentation** (`design.md`) - Detailed UI/UX guidelines including color palettes, typography, component specifications, and responsive design principles

## Testing Strategy
- Unit tests with Jest for utility functions and hooks
- Component testing with React Testing Library
- Integration tests for API endpoints
- Manual testing for AI outputs and personalization

## Performance Optimizations
- Image optimization and lazy loading
- Server-side rendering for web SEO
- Virtualized lists for recommendation feeds
- Intelligent caching for AI responses

## Security Considerations
- Environment variables for API keys
- Rate limiting for AI service calls
- Proper input validation and sanitization
- Authentication flow with secure token handling

## Future Roadmap
- Real-time collaboration features
- Enhanced offline capabilities
- Augmented reality integration for mobile
- Advanced personalization based on usage patterns
- Integration with third-party APIs (weather, events, etc.)

## Debugging and Troubleshooting
- Setting up Sentry for error tracking
- Consistent logging patterns
- Fallback mechanisms for AI service disruptions

## Known Issues and Solutions

### Expo Configuration
- Entry file needs to be correctly specified and created (index.js)
- Package versions must be compatible with the Expo SDK version
- For specific version requirements with Expo SDK 52:
  - react: 18.3.1
  - react-native: 0.76.7
  - @react-native-async-storage/async-storage: 1.23.1
  - expo-status-bar: ~2.0.1
  - expo-location: ~18.0.7
  - react-native-maps: 1.18.0
  - react-native-safe-area-context: 4.12.0
  - react-native-screens: ~4.4.0
  - @types/react: ~18.3.12
- The `sdkVersion` field must be explicitly defined in both app.json and app.config.js
- Common error: "AssertionError [ERR_ASSERTION]: SDK Version is missing" when sdkVersion is not defined
- Advanced solution for SDK version issues:
  - Use only app.config.js (remove or rename app.json to avoid conflicts)
  - Add `platforms: ["ios", "android", "web"]` explicitly in app.config.js
  - Install additional required packages: `@babel/runtime` and `expo-modules-core`
  - Use `npx expo start --clear` to ensure the cache is cleared
  - Remove competing NativeWind plugins in app.config.js
  - Add eas configuration in extra section: `eas: { projectId: "your-project-id" }`

### Asset Path Resolution
- When assets fail to resolve with errors like "Unable to resolve asset './assets/icon.png'":
  - Use absolute paths with `path.resolve(__dirname, './assets/icon.png')` in app.config.js
  - Ensure physical asset files exist and are properly formatted 
  - For prebuild to work correctly, app.json is required and must have correct assets too
  - Remove trailing commas in configuration arrays as they can cause issues

### Babel Configuration Issues
- For ".plugins is not a valid Plugin property" errors:
  - Check babel.config.js for syntax errors like trailing commas in plugin arrays
  - Make sure all plugins are properly formatted as strings or arrays
  - Explicit import of `@babel/runtime/helpers/interopRequireDefault` in index.js can fix import issues
  - Clearing the .expo directory and node_modules/.cache helps with persistent Babel issues
  - The babel configuration for Expo and NativeWind must be compatible
  - If issues persist, try removing problematic plugins and adding them back one at a time
  - Last resort: simplify to just `'babel-preset-expo'` preset and essential plugins

### Metro Bundler Configuration
- Create a metro.config.js file to customize Metro bundler behavior:
  ```js
  // metro.config.js
  const { getDefaultConfig } = require('expo/metro-config');
  const path = require('path');

  // Find the project and workspace directories
  const projectRoot = __dirname;
  const workspaceRoot = path.resolve(projectRoot, '../..');

  const config = getDefaultConfig(projectRoot);

  // 1. Watch all files in the monorepo
  config.watchFolders = [workspaceRoot];

  // 2. Let Metro know where to resolve packages
  config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(workspaceRoot, 'node_modules'),
  ];

  // 3. Force Metro to resolve (sub)dependencies only from the root node_modules
  config.resolver.disableHierarchicalLookup = true;

  module.exports = config;
  ```
- For monorepos, ensure the Metro config includes watchFolders for the workspace root
- When asset resolution fails, verify asset extensions are included in resolver.assetExts
- Use `npx expo start --clear` to ensure Metro uses the updated configuration

### App Component Resolution in Monorepos
- Error: `Unable to resolve "../../App" from "node_modules/.../expo/AppEntry.js"` indicates Expo can't find the App component
- Solutions:
  - Use `registerRootComponent` in index.js instead of `import 'expo/AppEntry'`
  - Ensure App.tsx or App.jsx is in the root of the mobile app directory (not in src/)
  - Configure metro.config.js with proper resolver settings for monorepo structure
  - Set nodeModulesPaths to include both project and workspace node_modules
  - Use disableHierarchicalLookup: true to force resolution from root node_modules
  - When using pnpm, configure Metro to understand pnpm's node_modules structure
  - Restart the Metro server with the `--clear` flag after configuration changes

### PNPM-Specific Fixes for Expo
- Use absolute paths in imports: `import App from '/absolute/path/to/App';`
- Use absolute paths in package.json main field:
  ```json
  {
    "main": "/absolute/path/to/index.js"
  }
  ```
- Create symlinks to important directories:
  ```bash
  # In project root
  ln -sf apps/mobile/assets assets
  
  # In mobile app directory
  ln -sf ../../node_modules node_modules_root
  ```
- Copy app code to expected locations relative to node_modules:
  ```bash
  cp apps/mobile/App.tsx App.tsx
  cp apps/mobile/App.tsx node_modules/App.js
  mkdir -p app && cp apps/mobile/App.tsx app/App.tsx
  ```
- Modify node_modules/expo/AppEntry.js directly:
  ```js
  // Change this
  import App from '../../apps/mobile/App';
  
  // To this
  import App from '/absolute/path/to/apps/mobile/App';
  ```
- Add special pnpm configuration to metro.config.js:
  ```js
  config.resolver.resolveSymlinksInRoot = true;
  ```
- Replace `import 'expo/AppEntry';` in index.js with direct registration:
  ```js
  import { registerRootComponent } from 'expo';
  import App from './App';
  
  registerRootComponent(App);
  ```
- Create root-level metro.config.js that points to mobile app
- Run Expo from project root if metro.config.js is in project root
- Specify watchFolders as array of absolute paths to avoid resolution issues
- Try native builds with `expo run:ios` or `expo run:android` after prebuild

### Resolving PNPM Dependency Resolution Issues with Metro

When facing dependency resolution errors like "Unable to resolve X module", it's often related to pnpm's symlink structure. Here's a comprehensive solution:

1. Add custom resolver to metro.config.js:
   ```js
   config.resolver.resolveRequest = (context, moduleName, platform) => {
     // Resolve specific modules directly
     if (moduleName === 'problem-module') {
       return {
         filePath: path.resolve(workspaceRoot, 'node_modules/problem-module'),
         type: 'sourceFile',
       };
     }
     return context.resolveRequest(context, moduleName, platform);
   };
   ```

2. Create direct symlinks for problematic dependencies:
   ```bash
   mkdir -p node_modules/module-namespace
   ln -sf node_modules/.pnpm/module-namespace+module-name@version/node_modules/module-namespace/module-name node_modules/module-namespace/module-name
   ```

3. Explicitly install missing dependencies:
   ```bash
   pnpm add missing-dependency --filter=mobile
   ```

4. Configure Metro for pnpm workspace:
   ```js
   // metro.config.js
   config.resolver.resolveSymlinksInRoot = true;
   config.resolver.disableHierarchicalLookup = true;
   config.watchFolders = [workspaceRoot]; // Absolute path to workspace root
   ```

5. Clear cache between changes:
   ```bash
   rm -rf node_modules/.cache
   npx expo start --clear
   ```

These steps solve common Metro bundler issues in pnpm monorepos like missing dependencies, incorrect module paths, and symlink resolution failures.

### Common PNPM Dependency Issues in React Native and Solutions

Certain packages frequently require special handling when using pnpm with React Native/Expo projects:

#### React Navigation Dependencies

React Navigation packages often have complex dependency relationships that cause resolution issues in pnpm:

1. **Missing @react-navigation/core**:
   - Error: `Unable to resolve "@react-navigation/core" from "@react-navigation/native"`
   - Solution: 
     - Install explicitly: `pnpm add @react-navigation/core --filter=mobile`
     - Create symlink: `ln -sf node_modules/.pnpm/@react-navigation+core@version/node_modules/@react-navigation/core node_modules/@react-navigation/core`
     - Add to Metro resolver:
       ```js
       if (moduleName === '@react-navigation/core') {
         return {
           filePath: path.resolve(workspaceRoot, 'node_modules/@react-navigation/core'),
           type: 'sourceFile',
         };
       }
       ```

2. **Web Platform Issues**:
   - Error: `500 (Internal Server Error)` for AppEntry.bundle, or `MIME type ('application/json') is not executable`
   - Cause: Metro is sending error JSON responses instead of JavaScript bundles due to unresolved dependencies
   - Solution: Apply dependency resolution fixes and clear cache completely between attempts

3. **Version Mismatches**:
   - Various React Navigation packages should have compatible versions
   - Use `npx expo install @react-navigation/native @react-navigation/native-stack` to install compatible versions

These approaches can be applied to other complex dependency packages that face similar issues with pnpm's symlink structure.

#### SHA-1 Calculation Errors

When working with symlinks in pnpm, Metro may encounter SHA-1 calculation errors:

1. **SHA-1 Calculation Error for Symlinked Files**:
   - Error: `Failed to get the SHA-1 for: /path/to/node_modules/package-name`
   - Cause: Metro cannot correctly process the symlink to calculate a file hash
   - Solutions:
     - Use actual file copies instead of symlinks:
       ```bash
       rm -rf node_modules/package-name
       mkdir -p node_modules/package-namespace
       cp -R node_modules/.pnpm/package-namespace+package-name@version/node_modules/package-namespace/package-name node_modules/package-namespace/
       ```
     - Explicitly add the package to watchFolders in metro.config.js:
       ```js
       config.watchFolders = [
         workspaceRoot,
         path.resolve(workspaceRoot, 'node_modules/package-namespace'),
       ];
       ```
     - Ensure sourceExts includes all required extensions:
       ```js
       config.resolver.sourceExts = [...(config.resolver.sourceExts || []), 'jsx', 'js', 'ts', 'tsx', 'json'];
       ```
     - Add resolveSymlinksInRoot configuration:
       ```js
       config.resolver.resolveSymlinksInRoot = true;
       ```

2. **Persisting SHA-1 Errors**:
   - If SHA-1 errors persist after the above solutions, it may indicate deeper issues with Metro's hashing
   - Additional solutions:
     - Clear all caches thoroughly: `rm -rf node_modules/.cache .expo`
     - Try using the development build: `npx expo run:ios` or `npx expo run:android`
     - As a last resort, consider alternative approaches like using npm/yarn instead of pnpm

These solutions address the majority of dependency resolution and hashing issues in pnpm monorepos with React Native/Expo projects.

## Recent Developments

### Week 1
- Established project structure and monorepo configuration
- Created basic package scaffolding for all modules
- Set up documentation framework and memory bank

### Week 2
- Developed core type definitions for AI and API packages
- Implemented initial UI component library
- Defined database schema with Prisma
- Created comprehensive documentation suite

### Week 3
- Implemented location tracking with Expo Location API
- Created authentication state management with Zustand
- Built recommendation service with mock data
- Developed UI components for mobile app
- Implemented Discover screen with React Query integration
- Updated project to use Expo SDK 52 and compatible dependencies
- Fixed dependency version conflicts across the monorepo
- Implemented AskScreen with natural language query functionality
- Created aiService with query parsing and recommendation integration

### Week 4
- Fixed TypeScript JSX syntax issues by converting .ts files to .tsx
- Created proper asset generation for app icons and splash screens
- Added Babel configuration for Expo SDK 52 compatibility
- Installed required dependencies for web support
- Resolved runtime errors related to missing modules
- Improved development workflow with better error handling
- Updated documentation with troubleshooting information
- Fixed NativeWind CSS processing issues
- Implemented StyleSheet approach as a workaround for styling issues
- Added proper configuration files (postcss.config.js, app.config.js)
- Configured Metro bundler for better error handling

### Implementation Progress

#### Completed Features
- Project structure and monorepo setup
- Mobile app screens:
  - Discover screen with recommendation feed
  - Ask screen with natural language query interface
  - Basic Maps screen structure
- Core services:
  - Location tracking
  - Authentication state management
  - Recommendation service with mock data
  - AI service with query interpretation

#### Next Implementation Steps
- Improve Maps screen with place markers and collections
- Complete mobile navigation between screens
- Implement user profile functionality
- Connect with backend AI services when available
- Implement web application UI components
- Create shared UI components for consistent design
- Add saving and favoriting functionality with persistence
- Implement social sharing features 

## Known Issues and Solutions

### Next.js 15 Issues

#### App Router Caching

**Issue**: Overly aggressive caching in Next.js App Router may cause stale data to be displayed.

**Solution**: 
- Use the `revalidate` option in fetch requests to control cache lifetime:
  ```tsx
  const data = await fetch('https://api.example.com/data', { 
    next: { revalidate: 60 } // Revalidate every 60 seconds
  });
  ```
- For data that should never be cached, use the `no-store` option:
  ```tsx
  const data = await fetch('https://api.example.com/dynamic-data', { 
    cache: 'no-store' 
  });
  ```
- For client-side requests, use `useSWR` with appropriate revalidation strategies.

#### Route Handling

**Issue**: Complex route patterns with catch-all or optional catch-all routes may cause unexpected behavior.

**Solution**:
- Use more specific routes where possible
- For nested dynamic routes, consider using route groups with parentheses to create logical groupings:
  ```
  app/
    (auth)/
      login/
      register/
    (main)/
      dashboard/
      profile/
    [...catchAll]/
  ```

#### Metadata

**Issue**: Dynamic metadata generation can cause hydration mismatches.

**Solution**:
- Use the metadata API with generateMetadata function:
  ```tsx
  export async function generateMetadata({ params }) {
    return {
      title: `Item ${params.id}`,
      description: `Description for item ${params.id}`,
    };
  }
  ```
- Use `viewport` export for consistent device width handling across routes.

### React 19 Issues

#### Server Components Constraints

**Issue**: Server Components have limitations: no hooks, no state, no browser APIs.

**Solution**:
- Clearly separate concerns between Server and Client components
- Use the "use client" directive only when necessary
- Leverage React.cache for memoizing expensive server-side operations:
  ```tsx
  import { cache } from 'react';

  export const getUser = cache(async (id: string) => {
    const user = await db.user.findUnique({ where: { id } });
    return user;
  });
  ```

#### Hydration Errors

**Issue**: Mismatches between server-rendered and client-rendered content cause hydration errors.

**Solution**:
- Ensure consistent rendering between server and client
- Use `useEffect` for client-side only code:
  ```tsx
  'use client';
  
  import { useEffect, useState } from 'react';
  
  export function ClientComponent() {
    const [windowWidth, setWindowWidth] = useState(0);
    
    useEffect(() => {
      setWindowWidth(window.innerWidth);
      
      const handleResize = () => setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    return <div>Window width: {windowWidth}px</div>;
  }
  ```
- For content that depends on browser-only APIs, use dynamic imports with suspense:
  ```tsx
  import dynamic from 'next/dynamic';
  import { Suspense } from 'react';
  
  const ClientOnlyComponent = dynamic(() => import('./ClientOnlyComponent'), {
    ssr: false,
  });
  
  export default function Page() {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <ClientOnlyComponent />
      </Suspense>
    );
  }
  ```

#### useFormStatus Usage

**Issue**: The new `useFormStatus` hook only works with native form actions.

**Solution**:
- Use the hook directly within the form, not in parent or sibling components
- Create wrapper components specifically for form elements that need status:
  ```tsx
  'use client';
  
  import { useFormStatus } from 'react-dom';
  
  function SubmitButton() {
    const { pending } = useFormStatus();
    return (
      <button type="submit" disabled={pending}>
        {pending ? 'Submitting...' : 'Submit'}
      </button>
    );
  }
  
  export function ContactForm() {
    return (
      <form action={submitContactForm}>
        {/* Form fields */}
        <SubmitButton />
      </form>
    );
  }
  ```

### Vercel AI SDK Issues

#### Streaming Response Handling

**Issue**: Client-side handling of streaming responses can be complex for different UI patterns.

**Solution**:
- Use the Vercel AI React hooks for simplest integration:
  ```tsx
  'use client';
  
  import { useCompletion } from 'ai/react';
  
  export function AISearchForm() {
    const { completion, input, handleInputChange, handleSubmit, isLoading } = 
      useCompletion({
        api: '/api/ai/completion',
      });
      
    return (
      <div>
        <form onSubmit={handleSubmit}>
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask anything..."
          />
          <button type="submit" disabled={isLoading}>
            Send
          </button>
        </form>
        <div>{completion}</div>
      </div>
    );
  }
  ```
- For more complex UI patterns, use the `useChat` hook to get full message history:
  ```tsx
  'use client';
  
  import { useChat } from 'ai/react';
  
  export function ChatInterface() {
    const { messages, input, handleInputChange, handleSubmit, isLoading } = 
      useChat({
        api: '/api/ai/chat',
      });
      
    return (
      <div>
        <div className="messages">
          {messages.map(message => (
            <div key={message.id} className={`message ${message.role}`}>
              {message.content}
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit}>
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Type a message..."
          />
          <button disabled={isLoading}>Send</button>
        </form>
      </div>
    );
  }
  ```

#### Token Limits

**Issue**: Long conversations can exceed token limits of the underlying AI models.

**Solution**:
- Implement conversation summarization for long chats
- Use a sliding window approach, keeping only recent messages:
  ```tsx
  // api/ai/chat/route.ts
  import { OpenAIStream, StreamingTextResponse } from 'ai';
  import { openai } from '@/lib/ai/openai-client';

  export async function POST(req: Request) {
    const { messages } = await req.json();
    
    // Keep only the last 10 messages if the conversation is too long
    const recentMessages = messages.slice(-10);
    
    // Add a system message with context from earlier in the conversation
    const systemMessage = {
      role: 'system',
      content: 'You are a helpful assistant. The conversation has been ongoing, and previous topics included: [summary of earlier messages].'
    };
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [systemMessage, ...recentMessages],
      stream: true,
    });
    
    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  }
  ```

#### Error Handling

**Issue**: AI service errors need graceful handling to prevent breaking the user experience.

**Solution**:
- Implement fallback content for AI failures
- Use error boundaries for client components
- Create retry mechanisms with exponential backoff:
  ```tsx
  async function queryAIWithRetry(prompt, maxRetries = 3) {
    let retries = 0;
    
    while (retries < maxRetries) {
      try {
        const response = await fetch('/api/ai/completion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });
        
        if (!response.ok) throw new Error('AI service error');
        
        return response;
      } catch (error) {
        retries++;
        
        if (retries >= maxRetries) {
          console.error('AI service failed after max retries', error);
          throw error;
        }
        
        // Exponential backoff
        const delay = 2 ** retries * 1000; // 2s, 4s, 8s
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  ```

### shadcn/ui Integration

#### Theme Customization

**Issue**: Customizing the shadcn theme to match design system can be challenging.

**Solution**:
- Use CSS variables for theme configuration:
  ```css
  /* app/globals.css */
  :root {
    /* Light mode */
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    /* Other variables */
  }

  .dark {
    /* Dark mode */
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    /* Other variables */
  }
  ```
- Use `cn` utility for conditional class application:
  ```tsx
  import { cn } from "@/lib/utils";
  
  function Button({ className, variant, ...props }) {
    return (
      <button 
        className={cn(
          "base-styles", 
          variant === 'primary' && "primary-styles",
          variant === 'secondary' && "secondary-styles",
          className
        )} 
        {...props} 
      />
    );
  }
  ```

#### Component Import Size

**Issue**: Importing all shadcn components can increase bundle size.

**Solution**:
- Only import components you need
- Use dynamic imports for less frequently used components
- Consider code-splitting heavy UI sections:
  ```tsx
  import dynamic from 'next/dynamic';
  
  const ComplexDashboard = dynamic(
    () => import('@/components/dashboard/ComplexDashboard'),
    {
      loading: () => <div>Loading dashboard...</div>,
    }
  );
  ```

## Performance Optimizations

### Image Optimization

- Use the Next.js Image component with proper dimensions and quality settings
- Consider using a CDN like Vercel's Edge Network or Cloudinary for image hosting
- Implement responsive images based on viewport size
- Use WebP or AVIF formats where supported:
  ```tsx
  <Image
    src="/hero.jpg"
    alt="Hero image"
    width={1200}
    height={600}
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    priority={isLCP} // For largest contentful paint images
    quality={85}
  />
  ```

### Bundle Optimization

- Use dynamic imports for large components or libraries
- Set up module/nomodule pattern for modern browsers
- Implement code splitting along routes
- Analyze your bundle with `@next/bundle-analyzer`:
  ```bash
  pnpm add -D @next/bundle-analyzer
  ```
  
  ```js
  // next.config.js
  const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
  });
  
  module.exports = withBundleAnalyzer({
    // next.js config
  });
  ```

### Edge Runtime

- Use Edge Runtime for APIs that don't require Node.js-specific features:
  ```tsx
  // app/api/route.ts
  export const runtime = 'edge';
  
  export async function GET() {
    return Response.json({ message: 'Hello from the Edge!' });
  }
  ```
- Deploy functions to Vercel's Edge Network for minimal cold starts and global distribution

## Debugging Techniques

### Server Component Debugging

- Use `console.log` statements in server components (visible in server console)
- Add comments for async data fetching operation results
- For RSC-specific debugging, use the React DevTools experimental flags

### Client Component Debugging

- Use React DevTools for component inspection
- Implement custom logging with context for client-side debugging:
  ```tsx
  'use client';
  
  import { createContext, useContext, useState } from 'react';
  
  const LogContext = createContext({
    logs: [],
    addLog: (message) => {},
    clearLogs: () => {},
  });
  
  export function LogProvider({ children }) {
    const [logs, setLogs] = useState([]);
    
    const addLog = (message) => {
      setLogs(prev => [...prev, { message, timestamp: new Date() }]);
    };
    
    const clearLogs = () => setLogs([]);
    
    return (
      <LogContext.Provider value={{ logs, addLog, clearLogs }}>
        {children}
      </LogContext.Provider>
    );
  }
  
  export const useLogger = () => useContext(LogContext);
  ```

### Network Debugging

- Use the Network tab in browser DevTools
- Implement request logging middleware:
  ```tsx
  // middleware.ts
  import { NextResponse } from 'next/server';
  
  export function middleware(request) {
    console.log(`[${new Date().toISOString()}] ${request.method} ${request.url}`);
    return NextResponse.next();
  }
  
  export const config = {
    matcher: '/api/:path*',
  };
  ```

## Best Practices

### State Management

- Use Server Components for static content whenever possible
- For client-side state, use React's built-in hooks for component-local state
- For shared state, use Zustand:
  ```tsx
  // stores/useUserStore.ts
  import { create } from 'zustand';
  
  interface UserState {
    user: User | null;
    setUser: (user: User | null) => void;
    isLoading: boolean;
    error: string | null;
  }
  
  export const useUserStore = create<UserState>((set) => ({
    user: null,
    isLoading: false,
    error: null,
    setUser: (user) => set({ user }),
    fetchUser: async (id) => {
      set({ isLoading: true, error: null });
      try {
        const response = await fetch(`/api/users/${id}`);
        if (!response.ok) throw new Error('Failed to fetch user');
        const user = await response.json();
        set({ user, isLoading: false });
      } catch (error) {
        set({ error: error.message, isLoading: false });
      }
    },
  }));
  ```

### File Organization

- Group files by feature rather than type when possible
- Use barrel exports (index.js) to simplify imports
- Create purpose-specific directories for related functionality
- Use co-location for tightly coupled components and their tests

### Handling Environment Variables

- Validate environment variables at build time
- Use a schema validation library like Zod:
  ```tsx
  // lib/env.ts
  import { z } from 'zod';
  
  const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    NEXTAUTH_SECRET: z.string().min(1),
    OPENAI_API_KEY: z.string().min(1),
    NODE_ENV: z.enum(['development', 'production', 'test']),
  });
  
  try {
    envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Invalid environment variables:', error.errors);
    throw new Error('Invalid environment variables');
  }
  
  export const env = process.env;
  ```

### Optimizing Data Fetching

- Use React Server Components for initial data loading
- Implement useSWR for client-side data fetching with stale-while-revalidate pattern
- Use suspense boundaries for loading states
- Implement optimistic updates for better UX

## Feature Implementation Guides

### Implementing Authentication

- Use NextAuth.js with your preferred auth providers
- Protect routes with middleware:
  ```tsx
  // middleware.ts
  import { getToken } from 'next-auth/jwt';
  import { NextResponse } from 'next/server';
  
  export async function middleware(req) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    
    return NextResponse.next();
  }
  
  export const config = {
    matcher: ['/dashboard/:path*', '/profile/:path*'],
  };
  ```

### Implementing File Uploads

- Use client-side form handling with FormData
- Implement progress tracking for uploads
- Consider direct-to-CDN uploads for large files:
  ```tsx
  'use client';

  import { useState } from 'react';
  
  export function FileUpload() {
    const [progress, setProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    
    async function handleSubmit(e) {
      e.preventDefault();
      const formData = new FormData(e.target);
      const file = formData.get('file');
      
      if (!file) return;
      
      setUploading(true);
      setProgress(0);
      
      try {
        // Get presigned URL
        const { url, fields } = await fetchPresignedUrl(file.name);
        
        const uploadFormData = new FormData();
        Object.entries(fields).forEach(([key, value]) => {
          uploadFormData.append(key, value);
        });
        uploadFormData.append('file', file);
        
        // Upload with progress tracking
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            setProgress(Math.round((event.loaded / event.total) * 100));
          }
        });
        
        xhr.open('POST', url);
        xhr.send(uploadFormData);
        
        xhr.onload = () => {
          if (xhr.status === 204) {
            // Upload successful
            setUploading(false);
          } else {
            throw new Error('Upload failed');
          }
        };
      } catch (error) {
        console.error('Upload error:', error);
        setUploading(false);
      }
    }
    
    return (
      <form onSubmit={handleSubmit}>
        <input type="file" name="file" />
        <button type="submit" disabled={uploading}>
          Upload
        </button>
        {uploading && <progress value={progress} max="100" />}
      </form>
    );
  }
  ```

### Implementing Real-time Features

- Use WebSockets or Server-Sent Events for real-time updates
- Consider Vercel Edge Functions with streaming responses:
  ```tsx
  // app/api/events/route.ts
  export const runtime = 'edge';
  
  export async function GET() {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (data) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };
        
        // Send initial data
        sendEvent({ type: 'connected' });
        
        // Set up interval for demo purposes
        const interval = setInterval(() => {
          sendEvent({ 
            type: 'update',
            timestamp: Date.now() 
          });
        }, 1000);
        
        // Cleanup on close
        return () => clearInterval(interval);
      }
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }
  ```

## Deployment Tips

### Vercel Custom Domains

- Set up custom domains via the Vercel dashboard
- Configure DNS records as instructed
- Enable automatic HTTPS certificate management

### Preview Deployments

- Each pull request gets a unique preview URL
- Use the Vercel GitHub integration for automatic previews
- Share preview links with stakeholders for feedback

### A/B Testing

- Implement A/B testing using Edge Config and middleware:
  ```tsx
  // middleware.ts
  import { NextResponse } from 'next/server';
  import { getRandomVariant } from '@/lib/ab-testing';
  
  export async function middleware(request) {
    const response = NextResponse.next();
    
    // Check for existing variant cookie
    const variant = request.cookies.get('ab-variant')?.value || 
      getRandomVariant(['control', 'test'], 0.5);
    
    // Set the variant cookie if it doesn't exist
    if (!request.cookies.has('ab-variant')) {
      response.cookies.set('ab-variant', variant, { 
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
    }
    
    return response;
  }
  ```

### Performance Monitoring

- Set up Vercel Analytics for Core Web Vitals monitoring
- Implement custom performance markers for critical user journeys:
  ```tsx
  'use client';
  
  import { useEffect } from 'react';
  
  export function PerformanceMonitor() {
    useEffect(() => {
      const reportWebVitals = ({ name, delta, id }) => {
        // Send to your analytics
        console.log(`${name}: ${delta}ms (ID: ${id})`);
      };
      
      // Report Web Vitals
      if (typeof window !== 'undefined') {
        // @ts-ignore - web-vitals is imported dynamically
        import('web-vitals').then(({ onCLS, onFID, onLCP }) => {
          onCLS(reportWebVitals);
          onFID(reportWebVitals);
          onLCP(reportWebVitals);
        });
      }
    }, []);
    
    return null;
  }
  ```

## Useful Resources

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev/)
- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/) 