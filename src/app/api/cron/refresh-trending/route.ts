import { NextResponse } from 'next/server';
import { refreshTrendingCities } from '@/lib/cities-data';
import { LIMLogger, LogCategory } from '@/lib/lim/logging';

const logger = LIMLogger.getInstance();

// This API route will be called by Vercel Cron
// See docs: https://vercel.com/docs/cron-jobs

export async function GET(request: Request) {
  // Verify request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  // Basic auth check
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    logger.warn(
      LogCategory.SYSTEM,
      'Unauthorized attempt to run trending cities refresh cron',
      { ip: request.headers.get('x-forwarded-for') || 'unknown' },
      ['CRON', 'TRENDING', 'CITIES', 'UNAUTHORIZED']
    );
    
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  try {
    logger.info(
      LogCategory.SYSTEM,
      'Starting trending cities refresh cron job',
      {},
      ['CRON', 'TRENDING', 'CITIES', 'START']
    );
    
    // Refresh trending cities data
    await refreshTrendingCities();
    
    logger.info(
      LogCategory.SYSTEM,
      'Completed trending cities refresh cron job',
      {},
      ['CRON', 'TRENDING', 'CITIES', 'COMPLETE']
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Trending cities refreshed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error(
      LogCategory.SYSTEM,
      'Error running trending cities refresh cron job',
      { error },
      ['CRON', 'TRENDING', 'CITIES', 'ERROR']
    );
    
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to refresh trending cities',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 