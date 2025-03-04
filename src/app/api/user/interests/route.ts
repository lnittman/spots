import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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

export async function POST(request: NextRequest) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions as any) as any;
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Parse and validate the request body
    const body = await request.json();
    const { interests, location } = interestsSchema.parse(body);
    
    // Update user's location if provided and mark onboarding as complete
    if (location) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { 
          location,
          onboardingComplete: true // Mark onboarding as complete
        },
      });
    } else {
      // Just update onboardingComplete status
      await prisma.user.update({
        where: { id: session.user.id },
        data: { 
          onboardingComplete: true // Mark onboarding as complete
        },
      });
    }
    
    // Delete existing user interests
    await prisma.userInterest.deleteMany({
      where: { userId: session.user.id },
    });
    
    // Create or get interest records
    const interestRecords = await Promise.all(
      interests.map(async (interestName) => {
        // Try to find existing interest
        let interest = await prisma.interest.findUnique({
          where: { name: interestName },
        });
        
        // Create if not exists
        if (!interest) {
          interest = await prisma.interest.create({
            data: {
              name: interestName,
              description: `Interest in ${interestName}`,
              trending: false,
              trendScore: 0,
            },
          });
        }
        
        return interest;
      })
    );
    
    // Create user interest relations
    await Promise.all(
      interestRecords.map((interest: InterestRecord) =>
        prisma.userInterest.create({
          data: {
            userId: session.user.id as string,
            interestId: interest.id,
            strength: 1.0, // Default strength
          },
        })
      )
    );
    
    return NextResponse.json({ 
      success: true,
      message: "Interests saved successfully",
      interests: interestRecords.map((i: InterestRecord) => i.name),
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
    // Get the user session
    const session = await getServerSession(authOptions as any) as any;
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Fetch user's interests from database
    const userInterests = await prisma.userInterest.findMany({
      where: { userId: session.user.id },
      include: { interest: true }
    });
    
    // Extract and return interest names
    const interests = userInterests.map((ui: { interest: { name: string } }) => ui.interest.name);
    
    return NextResponse.json({ 
      interests,
      count: interests.length
    });
  } catch (error) {
    console.error("Error getting user interests:", error);
    
    return NextResponse.json({ 
      error: "Failed to fetch interests" 
    }, { status: 500 });
  }
} 