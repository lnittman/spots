# API Documentation

This document provides detailed information about the Spots API endpoints, request/response formats, and usage examples.

## Base URL

- Development: `http://localhost:3000/api`
- Production: `https://spots.app/api`

## Authentication

Most endpoints require authentication using NextAuth.js with JWT strategy.

Authentication is handled automatically for logged-in users, or you can include a token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

To obtain a token, use the authentication endpoints described below.

## Error Handling

The API returns consistent error responses with the following format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}  // Optional additional error information
  }
}
```

Common error codes:
- `UNAUTHORIZED`: Authentication required or failed
- `FORBIDDEN`: Authenticated but insufficient permissions
- `BAD_REQUEST`: Invalid request parameters
- `NOT_FOUND`: Requested resource not found
- `INTERNAL_ERROR`: Server-side error

## API Endpoints

### Authentication

NextAuth.js handles authentication with the following endpoints:

#### Register/Login

```
POST /api/auth/[...nextauth]
```

Authentication is handled through NextAuth.js providers (email, Google, etc.).

For programmatic access, you can use the credentials provider:

Request body:
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

Response:
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "User Name",
    "image": "https://example.com/avatar.jpg"
  },
  "expires": "2024-06-15T10:30:00Z"
}
```

### User Management

#### Get User Profile

```
GET /api/users/me
```

Response:
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "username": "username",
  "name": "User Name",
  "avatar": "https://example.com/avatar.jpg",
  "interests": ["coffee", "hiking", "photography"],
  "createdAt": "2023-05-15T10:30:00Z"
}
```

#### Update User Profile

```
PATCH /api/users/me
```

Request body:
```json
{
  "name": "Updated Name",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

Response:
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "username": "username",
  "name": "Updated Name",
  "avatar": "https://example.com/new-avatar.jpg",
  "interests": ["coffee", "hiking", "photography"],
  "updatedAt": "2023-05-16T11:45:00Z"
}
```

#### Update User Interests

```
PUT /api/users/me/interests
```

Request body:
```json
{
  "interests": ["coffee", "hiking", "photography", "local cuisine"]
}
```

Response:
```json
{
  "interests": ["coffee", "hiking", "photography", "local cuisine"],
  "updatedAt": "2023-05-16T12:00:00Z"
}
```

### Places and Recommendations

#### Get Recommendations

```
GET /api/recommendations
```

Query parameters:
- `latitude` (required): User's latitude
- `longitude` (required): User's longitude
- `radius` (optional): Search radius in kilometers (default: 5)
- `limit` (optional): Number of recommendations to return (default: 10)
- `type` (optional): Type of places (e.g., "restaurant", "cafe", "museum")

Response:
```json
{
  "recommendations": [
    {
      "id": "place_123",
      "name": "Awesome Coffee Shop",
      "type": "cafe",
      "description": "A cozy cafe with great coffee and pastries.",
      "location": {
        "latitude": 37.7749,
        "longitude": -122.4194,
        "address": "123 Main St, San Francisco, CA 94105"
      },
      "photos": ["https://example.com/photo1.jpg"],
      "rating": 4.5,
      "ratingsCount": 128,
      "priceLevel": 2,
      "openNow": true,
      "hours": {
        "monday": "7:00 AM - 6:00 PM",
        "tuesday": "7:00 AM - 6:00 PM",
        // ...
      },
      "matchReason": "Matches your interest in artisanal coffee and cozy spaces",
      "matchScore": 0.92
    },
    // More recommendations...
  ],
  "meta": {
    "total": 25,
    "limit": 10,
    "offset": 0
  }
}
```

#### Get Place Details

```
GET /api/places/:placeId
```

Response:
```json
{
  "id": "place_123",
  "name": "Awesome Coffee Shop",
  "type": "cafe",
  "description": "A cozy cafe with great coffee and pastries.",
  "location": {
    "latitude": 37.7749,
    "longitude": -122.4194,
    "address": "123 Main St, San Francisco, CA 94105"
  },
  "photos": [
    "https://example.com/photo1.jpg",
    "https://example.com/photo2.jpg"
  ],
  "rating": 4.5,
  "ratingsCount": 128,
  "userRatings": {
    "food": 4.6,
    "service": 4.3,
    "atmosphere": 4.7
  },
  "priceLevel": 2,
  "openNow": true,
  "hours": {
    "monday": "7:00 AM - 6:00 PM",
    "tuesday": "7:00 AM - 6:00 PM",
    // ...
  },
  "contact": {
    "phone": "+1234567890",
    "website": "https://example.com",
    "social": {
      "instagram": "@awesomecoffee",
      "facebook": "awesomecoffeeshop"
    }
  },
  "amenities": ["WiFi", "Outdoor Seating", "Power Outlets"],
  "popularTimes": {
    "monday": [1, 2, 3, 5, 8, 10, 7, 5, 3, 2, 1, 0],
    // ... (hourly popularity for each day)
  }
}
```

#### Submit Feedback

```
POST /api/places/:placeId/feedback
```

Request body:
```json
{
  "rating": 4,
  "review": "Great place with wonderful atmosphere!",
  "visitDate": "2023-05-15",
  "tags": ["cozy", "friendly staff", "good value"]
}
```

Response:
```json
{
  "id": "feedback_123",
  "placeId": "place_123",
  "userId": "user_123",
  "rating": 4,
  "review": "Great place with wonderful atmosphere!",
  "visitDate": "2023-05-15",
  "tags": ["cozy", "friendly staff", "good value"],
  "createdAt": "2023-05-16T13:30:00Z"
}
```

### AI-Powered Endpoints

#### Interest Expansion (Streaming)

```
POST /api/ai/expand-interests
```

Request body:
```json
{
  "interests": ["coffee", "hiking", "photography"]
}
```

This endpoint returns a streaming response using Vercel AI SDK. The final complete response will have this structure:

```json
{
  "expandedInterests": {
    "coffee": ["specialty coffee", "coffee roasting", "pour-over", "espresso", "cafe culture"],
    "hiking": ["nature trails", "mountain views", "outdoor activities", "national parks", "backpacking"],
    "photography": ["street photography", "landscape photography", "camera gear", "photo exhibits", "scenic viewpoints"]
  },
  "recommendedQueries": [
    "specialty coffee shops with roasting on-site",
    "scenic hiking trails with photography opportunities",
    "cafes with gallery space for photography"
  ]
}
```

To handle streaming:

```javascript
const response = await fetch('/api/ai/expand-interests', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ interests: ['coffee', 'hiking', 'photography'] }),
});

if (!response.ok) throw new Error('Network response was not ok');

// For streaming responses using Vercel AI SDK
const reader = response.body.getReader();
const decoder = new TextDecoder();
let result = '';

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  result += decoder.decode(value);
  // Parse and handle partial result for UI updates
}

// Final complete response
const finalResult = JSON.parse(result);
```

#### Natural Language Query (Streaming)

```
POST /api/ai/query
```

Request body:
```json
{
  "query": "I'm looking for a quiet cafe where I can work for a few hours",
  "location": {
    "latitude": 37.7749,
    "longitude": -122.4194
  }
}
```

This endpoint uses Vercel AI SDK for streaming responses. The final complete response will have this structure:

```json
{
  "interpretedQuery": {
    "intent": "find_place",
    "placeType": "cafe",
    "attributes": ["quiet", "work-friendly"],
    "timeContext": "few hours"
  },
  "recommendations": [
    // List of places matching the query, same format as GET /recommendations
  ]
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse using Upstash Rate Limiting:

- Authentication endpoints: 10 requests per minute
- User management endpoints: 30 requests per minute
- Recommendation endpoints: 60 requests per minute
- AI endpoints: 20 requests per minute

When a rate limit is exceeded, the API returns a 429 Too Many Requests status code with headers indicating the rate limit and when it resets:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1589458800
```

## Pagination

List endpoints support pagination using the following query parameters:

- `limit`: Number of items per page (default: 10, max: 50)
- `offset`: Offset for pagination (default: 0)

The response includes metadata for pagination:

```json
{
  "items": [...],
  "meta": {
    "total": 100,
    "limit": 10,
    "offset": 0
  }
}
```

## Versioning

The API supports versioning through the URL path:

```
https://spots.app/api/v1/recommendations
```

If no version is specified, the latest stable version is used.

## Serverless Function Limits

Since the API runs on Vercel Edge Functions, be aware of the following limitations:

- Max duration: 30 seconds for regular functions, up to 60 seconds for Edge functions
- Max request body size: 4.5MB
- Max response size: 4.5MB
- Memory limit: Varies by plan

For AI-powered endpoints, responses are streamed to avoid timeout issues with longer AI processing time.

## Implementation Examples

### Client-side (React)

Here's an example of using the recommendations API with the `useSWR` hook:

```tsx
import useSWR from 'swr';

function useRecommendations(latitude, longitude, radius = 5) {
  const { data, error, isLoading } = useSWR(
    latitude && longitude 
      ? `/api/recommendations?latitude=${latitude}&longitude=${longitude}&radius=${radius}` 
      : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    recommendations: data?.recommendations || [],
    isLoading,
    error,
  };
}

// In your component
function RecommendationsList() {
  const { latitude, longitude } = useLocation(); // Your location hook
  const { recommendations, isLoading, error } = useRecommendations(latitude, longitude);

  if (isLoading) return <div>Loading recommendations...</div>;
  if (error) return <div>Error loading recommendations</div>;

  return (
    <div>
      {recommendations.map(place => (
        <PlaceCard key={place.id} place={place} />
      ))}
    </div>
  );
}
```

### Handling Streaming AI Responses

Using Vercel AI SDK with React:

```tsx
import { useCompletion } from 'ai/react';

function AskScreen() {
  const { completion, input, handleInputChange, handleSubmit, isLoading } = useCompletion({
    api: '/api/ai/query',
    body: {
      location: { 
        latitude: 37.7749, 
        longitude: -122.4194 
      }
    },
  });

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about places nearby..."
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Thinking...' : 'Ask'}
        </button>
      </form>

      <div className="recommendations">
        {completion && (
          /* Render the streaming AI response */
          <div dangerouslySetInnerHTML={{ __html: completion }} />
        )}
      </div>
    </div>
  );
}
```

For more detailed examples and best practices, refer to the Vercel AI SDK documentation. 