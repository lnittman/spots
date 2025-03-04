import { NextResponse } from 'next/server';
import { LargeInterestModel } from '@/components/maps/HomeMap';

export const runtime = 'edge';

/**
 * API route that refreshes recommendation data
 * This endpoint is called by a Vercel cron job daily
 * It uses the LargeInterestModel to generate fresh recommendations
 */
export async function GET(request: Request) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('Authorization');
  const isVercelCron = authHeader === `Bearer ${process.env.CRON_SECRET_KEY}`;
  
  if (!isVercelCron && process.env.VERCEL_ENV === 'production') {
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401 }
    );
  }

  try {
    // Start the refresh process
    console.log('Starting recommendation refresh via cron...');
    
    // Call the LargeInterestModel to refresh data
    const result = await LargeInterestModel.refreshRecommendationData();
    
    console.log('Recommendation refresh completed successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Recommendations refreshed successfully',
      timestamp: new Date().toISOString(),
      result
    });
  } catch (error) {
    console.error('Error refreshing recommendations:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to refresh recommendations',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 