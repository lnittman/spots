# Spots

A modern, AI-powered location discovery application that helps users find interesting places based on their preferences and interests.

## Features

- Interactive map interface powered by Mapbox
- AI-generated recommendations using the Large Interest Model (LIM) pipeline
- Personalized spot discovery based on user interests
- Trending locations updated through a scheduled pipeline
- Responsive design for both desktop and mobile experiences

## Tech Stack

- **Frontend**: Next.js 15.2, React 19, Tailwind CSS
- **Backend**: Next.js API routes in edge runtime
- **Database**: PostgreSQL via Neon
- **Storage**: Vercel Blob Storage
- **Caching**: Upstash Redis KV Store
- **AI**: OpenAI GPT and Google Gemini APIs
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- API keys for:
  - Mapbox
  - OpenAI
  - Google Gemini
  - Neon (PostgreSQL)
  - Upstash Redis
  - Vercel Blob Storage

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/spots.git
   cd spots
   ```

2. Install dependencies
   ```
   pnpm install
   ```

3. Set up environment variables
   Create a `.env.local` file with the following variables:
   ```
   # Database - Neon
   DATABASE_URL=your_neon_postgres_url

   # KV Store - Upstash Redis
   UPSTASH_REDIS_REST_URL=your_upstash_url
   UPSTASH_REDIS_REST_TOKEN=your_upstash_token

   # Blob Storage
   BLOB_READ_WRITE_TOKEN=your_vercel_blob_token

   # Maps
   NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token

   # AI APIs
   OPENAI_API_KEY=your_openai_key
   GEMINI_API_KEY=your_gemini_key
   ```

4. Initialize the database (if needed)
   ```
   pnpm db:push
   ```

5. Run the development server
   ```
   pnpm dev
   ```

6. To refresh recommendation data (requires API keys):
   ```
   pnpm refresh-recommendations
   ```

## Deployment to Vercel

### Setup

1. Push your repository to GitHub
2. Create a new project in Vercel
3. Connect your repository
4. Configure environment variables in Vercel's dashboard
5. Deploy

### Using Vercel CLI

1. Install Vercel CLI:
   ```
   npm i -g vercel
   ```

2. Login to Vercel:
   ```
   vercel login
   ```

3. Deploy the project:
   ```
   vercel deploy --prod
   ```

## Storage Configuration

### Neon PostgreSQL

Connection string format:
```
postgres://username:password@hostname/database?sslmode=require
```

Use with Prisma:
```
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
}
```

### Upstash Redis

```typescript
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})
```

### Vercel Blob Storage

```typescript
import { put } from "@vercel/blob";

const { url } = await put('filename.txt', 'Hello World!', { access: 'public' });
```

## Cron Jobs

Recommendation data is refreshed daily via a Vercel Cron Job configured in `vercel.json`:

```json
"crons": [
  {
    "path": "/api/cron/refresh-recommendations",
    "schedule": "0 0 * * *"
  }
]
```

## License

[MIT](LICENSE) 