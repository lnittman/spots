# Code Documentation

This document provides guidance on the codebase structure, coding conventions, and examples for common development tasks.

## Project Structure

```
spots/
├── app/                  # Next.js 15 App Router structure
│   ├── api/              # API routes (Edge runtime)
│   │   ├── ai/           # AI-powered API endpoints
│   │   ├── auth/         # Authentication API routes
│   │   ├── places/       # Places and recommendations API
│   │   └── users/        # User management API
│   ├── (auth)/           # Authentication-related pages
│   ├── dashboard/        # Authenticated user dashboard
│   ├── explore/          # Explore places pages
│   ├── profile/          # User profile pages
│   ├── onboarding/       # User onboarding flow
│   └── layout.tsx        # Root layout component
├── components/           # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   ├── forms/            # Form components
│   ├── maps/             # Map-related components
│   ├── places/           # Place-related components
│   └── shared/           # Shared components
├── lib/                  # Utility libraries and helpers
│   ├── ai/               # AI utilities using Vercel AI SDK
│   ├── auth/             # Authentication utilities
│   ├── db/               # Database utilities and schema
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Helper functions
│   └── validators/       # Input validation
├── public/               # Static assets
├── styles/               # Global styles
│   └── globals.css       # Global CSS with Tailwind 4
├── types/                # TypeScript type definitions
├── .env                  # Environment variables
├── next.config.js        # Next.js configuration
├── package.json          # Project dependencies
├── postcss.config.js     # PostCSS configuration for Tailwind
├── tailwind.config.js    # Tailwind 4 configuration
└── tsconfig.json         # TypeScript configuration
```

## Tech Stack

- **Frontend**:
  - React 19 with Server and Client Components
  - Next.js 15 with App Router
  - Tailwind CSS 4 for styling
  - shadcn/ui (canary) for UI components
  - Zustand for client-side state management
  - useSWR for data fetching

- **Backend**:
  - Next.js API Routes with Edge Runtime
  - NextAuth.js for authentication
  - Prisma ORM with PostgreSQL
  - Upstash for Redis caching

- **AI Integration**:
  - Vercel AI SDK for AI model integration
  - OpenAI API for natural language processing

- **Testing**:
  - Vitest for unit tests
  - Playwright for end-to-end tests

## Coding Conventions

- Use TypeScript for type safety
- Follow ESLint rules defined in the project
- Use React 19 features appropriately
- Use Server Components by default, only use Client Components when necessary

### Server vs. Client Components

In Next.js 15 with React 19, we use a combination of Server and Client Components:

```tsx
// app/places/[id]/page.tsx - Server Component (default)
export default async function PlaceDetailsPage({ params }: { params: { id: string } }) {
  // This code runs on the server
  const place = await getPlaceDetails(params.id);
  
  return (
    <div className="place-details-page">
      <PlaceHeader place={place} />
      <PlacePhotosGallery photos={place.photos} />
      <PlaceDescription description={place.description} />
      <ClientSideInteractions placeId={place.id} />
    </div>
  );
}
```

```tsx
// components/places/ClientSideInteractions.tsx - Client Component
'use client'; // This marks it as a Client Component

import { useState } from 'react';
import { useSWR } from 'swr';

export default function ClientSideInteractions({ placeId }: { placeId: string }) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // Client-side data fetching
  const { data: userInteractions } = useSWR(`/api/places/${placeId}/interactions`);
  
  const handleBookmark = async () => {
    // Client-side interaction
    await fetch(`/api/places/${placeId}/bookmark`, { 
      method: 'POST',
      body: JSON.stringify({ bookmarked: !isBookmarked })
    });
    setIsBookmarked(!isBookmarked);
  };
  
  return (
    <div className="place-interactions">
      <button onClick={handleBookmark}>
        {isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
      </button>
      {/* Other client-side interactions */}
    </div>
  );
}
```

### Data Fetching

Use Server Components for initial data loading and useSWR for client-side data fetching:

```tsx
// Server-side data fetching in a Server Component
export default async function RecommendationsPage() {
  const recommendations = await getRecommendations();
  
  return <RecommendationsList initialData={recommendations} />;
}
```

```tsx
// Client-side data fetching with useSWR for dynamic updates
'use client';

import useSWR from 'swr';

export function RecommendationsList({ initialData }) {
  const { data, error, isLoading } = useSWR('/api/recommendations', {
    fallbackData: initialData,
    refreshInterval: 60000 // Refresh every minute
  });
  
  if (error) return <div>Failed to load recommendations</div>;
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div className="recommendations-list">
      {data.map(item => (
        <RecommendationCard key={item.id} recommendation={item} />
      ))}
    </div>
  );
}
```

### State Management

Use Zustand for global state management:

```tsx
// lib/stores/userStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  interests: string[];
  recentSearches: string[];
  recentlyViewed: { id: string; name: string; timestamp: number }[];
  addInterest: (interest: string) => void;
  removeInterest: (interest: string) => void;
  addRecentSearch: (search: string) => void;
  addRecentlyViewed: (place: { id: string; name: string }) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      interests: [],
      recentSearches: [],
      recentlyViewed: [],
      
      addInterest: (interest) => 
        set((state) => ({
          interests: [...state.interests, interest]
        })),
        
      removeInterest: (interest) => 
        set((state) => ({
          interests: state.interests.filter(i => i !== interest)
        })),
        
      addRecentSearch: (search) => 
        set((state) => ({
          recentSearches: [search, ...state.recentSearches.slice(0, 9)]
        })),
        
      addRecentlyViewed: (place) => 
        set((state) => ({
          recentlyViewed: [
            { ...place, timestamp: Date.now() },
            ...state.recentlyViewed
              .filter(p => p.id !== place.id)
              .slice(0, 19)
          ]
        })),
    }),
    {
      name: 'user-preferences',
    }
  )
);
```

### API Routes with Edge Runtime

Use the Edge Runtime for API routes:

```tsx
// app/api/recommendations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getRecommendationsFromDb } from '@/lib/db/recommendations';

export const runtime = 'edge'; // Use Edge Runtime

const querySchema = z.object({
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  radius: z.coerce.number().optional().default(5),
  limit: z.coerce.number().optional().default(10),
  type: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const result = querySchema.safeParse({
      latitude: searchParams.get('latitude'),
      longitude: searchParams.get('longitude'),
      radius: searchParams.get('radius'),
      limit: searchParams.get('limit'),
      type: searchParams.get('type'),
    });
    
    if (!result.success) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Invalid parameters', details: result.error.format() } },
        { status: 400 }
      );
    }
    
    // Get recommendations
    const recommendations = await getRecommendationsFromDb(result.data);
    
    return NextResponse.json({
      recommendations,
      meta: {
        total: recommendations.length,
        limit: result.data.limit,
        offset: 0,
      }
    });
  } catch (error) {
    console.error('Recommendation API error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch recommendations' } },
      { status: 500 }
    );
  }
}
```

### AI Integration with Vercel AI SDK

Use the Vercel AI SDK for AI-powered features:

```tsx
// app/api/ai/query/route.ts
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { openai } from '@/lib/ai/openai-client';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { query, location } = await req.json();
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant helping users find places based on their preferences.'
        },
        {
          role: 'user',
          content: `Query: ${query}\nLocation: Latitude ${location.latitude}, Longitude ${location.longitude}`
        }
      ],
      stream: true,
    });
    
    const stream = OpenAIStream(response);
    
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('AI Query API error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process query' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

Client-side implementation for AI features:

```tsx
// components/AISearch.tsx
'use client';

import { useChat } from 'ai/react';
import { useState } from 'react';

export default function AISearch() {
  const [location, setLocation] = useState({ latitude: 0, longitude: 0 });
  
  // Use Vercel AI SDK's useChat hook
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/ai/query',
    body: {
      location,
    },
    onFinish: (message) => {
      console.log('Chat completed:', message);
    },
  });
  
  // Get user's location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };
  
  return (
    <div className="ai-search">
      <button onClick={getUserLocation}>Get My Location</button>
      
      <form onSubmit={handleSubmit} className="search-form">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about places nearby..."
          className="search-input"
        />
        <button type="submit" disabled={isLoading || !location.latitude}>
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>
      
      <div className="messages">
        {messages.map(message => (
          <div key={message.id} className={`message ${message.role}`}>
            <div className="content">{message.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Component Library with shadcn

Using shadcn components:

```tsx
// components/ui/custom-button.tsx
import { forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const CustomButton = forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ className, variant = 'default', size = 'md', isLoading, leftIcon, rightIcon, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant === 'primary' ? 'default' : variant}
        size={size === 'md' ? 'default' : size}
        className={cn(
          'flex items-center justify-center gap-2',
          isLoading && 'opacity-70 cursor-not-allowed',
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {!isLoading && leftIcon}
        {children}
        {rightIcon}
      </Button>
    );
  }
);
CustomButton.displayName = 'CustomButton';

export { CustomButton };
```

## Authentication

We use NextAuth.js for authentication:

```tsx
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/db/prisma';
import { verifyPassword } from '@/lib/auth/password';

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          return null;
        }

        const isValid = await verifyPassword(credentials.password, user.password);

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/auth/error',
    newUser: '/onboarding/profile',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

## Environment Variables

The project uses the following environment variables:

```
# Base
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/spots

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# AI
OPENAI_API_KEY=your-openai-api-key

# Maps
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token

# Cache and Rate Limiting
UPSTASH_REDIS_REST_URL=your-upstash-redis-rest-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-redis-rest-token
```

## Error Handling

Consistent error handling across the application:

```tsx
// lib/utils/api-error.ts
export class ApiError extends Error {
  code: string;
  status: number;
  details?: any;

  constructor(code: string, message: string, status: number = 500, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

// In your API route:
try {
  // Your code here
} catch (error) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      { status: error.status }
    );
  }
  
  // Unexpected errors
  console.error('Unexpected error:', error);
  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    },
    { status: 500 }
  );
}
```

## Testing

### Unit Testing with Vitest

```tsx
// components/places/PlaceCard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlaceCard } from './PlaceCard';

describe('PlaceCard', () => {
  const mockPlace = {
    id: 'place-1',
    name: 'Coffee Shop',
    type: 'cafe',
    rating: 4.5,
    description: 'A cozy cafe',
    location: {
      address: '123 Main St',
    },
    photos: ['https://example.com/photo.jpg'],
  };

  it('renders place information correctly', () => {
    render(<PlaceCard place={mockPlace} />);
    
    expect(screen.getByText('Coffee Shop')).toBeInTheDocument();
    expect(screen.getByText('cafe')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('A cozy cafe')).toBeInTheDocument();
    expect(screen.getByText('123 Main St')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', async () => {
    const handleSelect = vi.fn();
    render(<PlaceCard place={mockPlace} onSelect={handleSelect} />);
    
    await userEvent.click(screen.getByRole('button', { name: /view details/i }));
    
    expect(handleSelect).toHaveBeenCalledWith('place-1');
  });
});
```

### End-to-End Testing with Playwright

```tsx
// e2e/search.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Search functionality', () => {
  test('should allow users to search for places', async ({ page }) => {
    // Go to the homepage
    await page.goto('/');
    
    // Fill in the search input
    await page.fill('[data-testid="search-input"]', 'coffee shop');
    
    // Click the search button
    await page.click('[data-testid="search-button"]');
    
    // Wait for search results to load
    await page.waitForSelector('[data-testid="search-results"]');
    
    // Verify that results are displayed
    const results = await page.$$('[data-testid="place-card"]');
    expect(results.length).toBeGreaterThan(0);
    
    // Verify that at least one result contains "coffee"
    const resultText = await page.textContent('[data-testid="search-results"]');
    expect(resultText.toLowerCase()).toContain('coffee');
  });
  
  test('should display a message when no results are found', async ({ page }) => {
    await page.goto('/');
    
    // Search for something unlikely to have results
    await page.fill('[data-testid="search-input"]', 'xyzabcdefghijk123456789');
    await page.click('[data-testid="search-button"]');
    
    // Wait for no results message
    await page.waitForSelector('[data-testid="no-results"]');
    
    // Verify the message
    const noResultsMessage = await page.textContent('[data-testid="no-results"]');
    expect(noResultsMessage).toContain('No results found');
  });
});
```

## Performance Optimization

For optimal performance, utilize:

1. **React 19 Optimizations**:
   - Use Server Components for static content
   - Prefer useSWR for client-side data fetching
   - Utilize React.memo for expensive components

2. **Next.js 15 Features**:
   - Parallel Routes for complex layouts
   - Intercepting Routes for modal patterns
   - Route Groups for organizing routes

3. **Image Optimization**:
   - Use Next.js Image component with priority for LCP images
   ```tsx
   import Image from 'next/image';
   
   <Image
     src={place.image}
     alt={place.name}
     width={600}
     height={400}
     priority={isLCP}
     className="rounded-lg object-cover"
   />
   ```

4. **Bundle Optimization**:
   - Import only necessary shadcn components
   - Use dynamic imports for large components
   ```tsx
   const Map = dynamic(() => import('@/components/maps/Map'), {
     loading: () => <div className="h-[400px] w-full bg-gray-100 animate-pulse" />,
     ssr: false,
   });
   ```

## Accessibility

All components should follow WCAG 2.1 AA standards:

- Use semantic HTML elements
- Ensure proper keyboard navigation
- Include appropriate ARIA attributes
- Maintain sufficient color contrast
- Support screen readers
- Implement responsive design for different devices

Example of an accessible form:

```tsx
// components/forms/AccessibleForm.tsx
'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function AccessibleForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email');
      return;
    }
    // Form submission logic
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError('');
          }}
          aria-describedby={error ? 'email-error' : undefined}
          aria-invalid={!!error}
          placeholder="you@example.com"
          className={error ? 'border-red-500' : ''}
        />
        {error && (
          <div id="email-error" role="alert" className="text-red-500 text-sm">
            {error}
          </div>
        )}
      </div>
      
      <Button type="submit">
        Subscribe
      </Button>
    </form>
  );
}
```