import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { userProfiles } from "../profile/route";

// Extend the session user type to include id
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

// Define the validation schema for the request body
const interestsSchema = z.object({
  interests: z.array(z.string()),
  location: z.string().optional(),
});

// Type for the Interest record
type InterestRecord = {
  id: string;
  name: string;
  [key: string]: any;
}

// Mock database for user interests (in a real app, this would be a database)
export const userInterests: Record<string, string[]> = {};

export async function POST(request: NextRequest) {
  try {
    // Get the user session
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    // Parse and validate the request body
    const body = await request.json();
    const { interests, location } = interestsSchema.parse(body);
    
    // Store in mock database
    const userEmail = session.user.email;
    userInterests[userEmail] = interests;
    
    // For storing in profile if available
    if (location) {
      try {
        // Update the profile in the shared mock database
        const currentProfile = userProfiles[userEmail] || {
          name: session.user.name,
          email: userEmail,
          location: null,
          emoji: null,
          pronouns: null,
          bio: null
        };
        
        userProfiles[userEmail] = {
          ...currentProfile,
          location: location
        };
        
        console.log(`Location updated to ${location} for user ${userEmail}`);
      } catch (e) {
        console.error("Error updating location:", e);
      }
    }
    
    return NextResponse.json({ 
      success: true,
      message: "Interests saved successfully",
      interests: interests,
    });
  } catch (error) {
    console.error("Error saving user interests:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Invalid request data", 
        details: error.errors 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: "Failed to save interests" 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userEmail = session.user.email;
    const interests = userInterests[userEmail] || [];

    return NextResponse.json({ interests });
  } catch (error) {
    console.error("Error fetching interests:", error);
    return NextResponse.json({ error: "Failed to fetch interests" }, { status: 500 });
  }
} 