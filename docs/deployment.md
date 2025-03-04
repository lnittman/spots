# Deploying Spots to Vercel

This guide details how to deploy the Spots application to Vercel with all required integrations.

## Prerequisites

- GitHub repository with your Spots code
- Vercel account
- API keys for:
  - Mapbox
  - OpenRouter (for Perplexity)
  - Google Gemini
- Accounts with:
  - Neon (PostgreSQL)
  - Upstash (Redis KV)
  - Vercel Blob
  - Vercel Edge Config

## Step 1: Set Up Database with Neon

1. Create a new Neon project
2. Copy the connection string
3. Set up in Vercel as `DATABASE_URL` environment variable

## Step 2: Set Up Upstash KV

1. Create a new Upstash Redis database
2. Get the REST URL and token
3. Set up in Vercel as:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

## Step 3: Set Up Vercel Blob

1. Add Vercel Blob to your project
2. Set up the token as `BLOB_READ_WRITE_TOKEN` in your environment variables

## Step 4: Set Up Edge Config

1. Create a new Edge Config in the Vercel dashboard
2. Add the connection string as `EDGE_CONFIG` in your environment variables

## Step 5: Set Up API Keys

Add the following environment variables to your Vercel project:

- `NEXT_PUBLIC_MAPBOX_TOKEN`: Your Mapbox public token
- `OPENROUTER_API_KEY`: Your OpenRouter API key for accessing Perplexity
- `GEMINI_API_KEY`: Your Google Gemini API key

## Step 6: Set Up Cron Job

1. Add a Vercel Cron job to run daily at midnight (already configured in vercel.json)
2. Generate a secure random key and add it as `CRON_SECRET_KEY` in your environment variables

## Step 7: Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Configure the build settings:
   - Framework preset: Next.js
   - Build command: `npm run build`
   - Output directory: `.next`
3. Add all environment variables from the steps above
4. Deploy!

## Step 8: Database Migrations

After the first deployment, you need to run the Prisma migrations:

```bash
npx prisma migrate deploy
```

## Step 9: Seed Initial Data

If you need to seed initial data (interests, locations), you can create a seed script and run:

```bash
npx prisma db seed
```

## Troubleshooting

- **Database Connection Issues**: Check your Neon connection string and make sure IP allow lists include Vercel's IP ranges
- **Cron Job Failures**: Check the Vercel logs and ensure your `CRON_SECRET_KEY` is properly set
- **Map Loading Problems**: Verify your Mapbox token and domain restrictions

## Monitoring

- Set up Vercel Analytics to monitor performance
- Set up logging for the LIM pipeline to track errors
- Monitor database performance in the Neon dashboard 