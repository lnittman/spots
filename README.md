# Spots

A modern, AI-powered location discovery application that helps users find interesting places based on their preferences and interests.

## Features

- Interactive map interface powered by Mapbox
- AI-generated recommendations using the Large Interest Model (LIM) pipeline
- Personalized spot discovery based on user interests
- Trending locations updated through a scheduled pipeline
- Responsive design for both desktop and mobile experiences

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API routes, Prisma ORM
- **Database**: PostgreSQL (Neon)
- **Storage**: Vercel Blob Storage
- **Caching**: Upstash Redis KV Store
- **AI**: OpenRouter (for Perplexity) and Google Gemini APIs
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- API keys for Mapbox, OpenRouter, and Google Gemini

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/spots.git
   cd spots
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   Create a `.env.local` file with the following variables:
   ```
   # Database
   DATABASE_URL=your_neon_postgres_url
   
   # KV Store
   UPSTASH_REDIS_REST_URL=your_upstash_url
   UPSTASH_REDIS_REST_TOKEN=your_upstash_token
   
   # Blob Storage
   BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
   
   # Maps
   NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
   
   # AI APIs
   OPENROUTER_API_KEY=your_openrouter_key
   GEMINI_API_KEY=your_gemini_key
   ```

4. Run the development server
   ```
   npm run dev
   ```

5. To refresh recommendation data (requires API keys):
   ```
   npm run refresh-recommendations
   ```

## Deployment

This application is configured for deployment on Vercel with the following integrations:
- Neon PostgreSQL for database
- Upstash KV for caching
- Vercel Blob for storage
- Vercel Edge Config for configuration

## License

[MIT](LICENSE) 