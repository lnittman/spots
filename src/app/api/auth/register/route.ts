import { NextRequest } from "next/server";

/**
 * User registration endpoint - disabled in production due to bcrypt native module issues
 */
export const dynamic = 'force-dynamic';
export const preferredRegion = 'iad1';

export async function POST(request: NextRequest) {
  return new Response(
    JSON.stringify({
      success: false,
      message: 'Registration is temporarily unavailable.',
    }),
    {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
} 