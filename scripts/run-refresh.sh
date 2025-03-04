#!/bin/bash

# Script to run the recommendation refresh process

echo "🗺️ Spots App - Running LIM Pipeline"
echo "📅 $(date)"
echo "-----------------------------------"

# Load environment variables from .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
  echo "✅ Loaded environment variables"
else
  echo "⚠️ No .env file found, using system environment variables"
fi

# Create data directory if it doesn't exist
mkdir -p data/recommendations
echo "✅ Ensured data directory exists"

# Set NODE_ENV to development for testing if not specified
if [ -z "$NODE_ENV" ]; then
  export NODE_ENV=development
  echo "⚠️ NODE_ENV not set, defaulting to development mode"
else
  echo "🔧 Running in $NODE_ENV mode"
fi

# Run the script
echo "🚀 Starting recommendation refresh..."
npx ts-node scripts/refresh-recommendations.ts $@

# Check exit code
if [ $? -eq 0 ]; then
  echo "✅ Recommendation refresh completed successfully"
else
  echo "❌ Recommendation refresh failed with exit code $?"
  exit 1
fi

echo "-----------------------------------"
echo "💾 Results saved to data/recommendations"
echo "🏁 Process complete" 