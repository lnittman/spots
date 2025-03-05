import { NextRequest, NextResponse } from 'next/server';
import { refreshTrendingCities } from '@/lib/lim/trending-cities';
import { LIMLogger, LogCategory } from '@/lib/lim/logging';

// Logger instance
const logger = LIMLogger.getInstance();

/**
 * GET /api/cron/refresh-trending - Cron job to refresh trending cities
 */
export async function GET(request: NextRequest) {
  // Check for authorization header (simple API key verification)
  const authHeader = request.headers.get('authorization');
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Create a unique request ID for tracking
  const requestId = logger.createRequestId();

  try {
    logger.info(
      LogCategory.SYSTEM,
      'Starting trending cities refresh cron job',
      { requestId },
      ['CRON', 'TRENDING', 'CITIES']
    );

    // Refresh trending cities
    const result = await refreshTrendingCities();

    if (result.success) {
      logger.info(
        LogCategory.SYSTEM,
        'Successfully refreshed trending cities',
        { count: result.count, timestamp: result.timestamp, requestId },
        ['CRON', 'TRENDING', 'CITIES', 'SUCCESS']
      );

      return NextResponse.json({
        success: true,
        count: result.count,
        timestamp: result.timestamp,
        requestId
      });
    } else {
      logger.error(
        LogCategory.SYSTEM,
        `Error refreshing trending cities: ${result.error}`,
        { error: result.error, requestId },
        ['CRON', 'TRENDING', 'CITIES', 'ERROR']
      );

      return NextResponse.json({
        success: false,
        error: result.error,
        requestId
      }, { status: 500 });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    logger.error(
      LogCategory.SYSTEM,
      `Unexpected error in trending cities cron job: ${errorMessage}`,
      { error, requestId },
      ['CRON', 'TRENDING', 'CITIES', 'ERROR']
    );

    return NextResponse.json({
      success: false,
      error: errorMessage,
      requestId
    }, { status: 500 });
  }
} 