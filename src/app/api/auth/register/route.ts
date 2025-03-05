import { NextRequest, NextResponse } from "next/server";

/**
 * User registration endpoint - disabled in production due to bcrypt native module issues
 */
export async function POST(request: NextRequest) {
  // In production, return a service temporarily unavailable response
  return NextResponse.json(
    { 
      success: false, 
      message: 'Registration is temporarily disabled. Please use the demo login or social login options.' 
    },
    { 
      status: 503 
    }
  );
} 