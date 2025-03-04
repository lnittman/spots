import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

// Mock user database (replace with real database in production)
export let userProfiles: Record<string, any> = {};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    const userEmail = session.user.email;
    const profile = userProfiles[userEmail] || {
      name: session.user.name,
      email: userEmail,
      location: null,
      emoji: null,
      pronouns: null,
      bio: null
    };
    
    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    const data = await request.json();
    const userEmail = session.user.email;
    
    // Get current profile or create default
    const currentProfile = userProfiles[userEmail] || {
      name: session.user.name,
      email: userEmail,
      location: null,
      emoji: null,
      pronouns: null,
      bio: null
    };
    
    // Update profile with new data, preserving old data
    userProfiles[userEmail] = {
      ...currentProfile,
      ...data,
      email: userEmail, // Prevent email changes for this simplified version
    };
    
    return NextResponse.json({ 
      success: true, 
      profile: userProfiles[userEmail]
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
} 