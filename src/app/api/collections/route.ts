import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { 
  getUserCollections,
  createCollection
} from "@/lib/collections-store";

// Validation schema for collection creation
const collectionCreateSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().default(true),
  spotIds: z.array(z.string()).optional(),
});

// GET all collections for the authenticated user
export async function GET(request: NextRequest) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions as any) as any;
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get collections for the user
    const collections = await getUserCollections(session.user.id);
    
    return NextResponse.json({ 
      success: true,
      collections,
      count: collections.length,
    });
  } catch (error) {
    console.error("Error getting collections:", error);
    
    return NextResponse.json({ 
      error: "Failed to fetch collections" 
    }, { status: 500 });
  }
}

// POST a new collection
export async function POST(request: NextRequest) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions as any) as any;
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Parse and validate the request body
    const body = await request.json();
    const input = collectionCreateSchema.parse(body);
    
    // Create collection
    const collection = await createCollection(session.user.id, input);
    
    return NextResponse.json({ 
      success: true,
      collection,
    });
  } catch (error) {
    console.error("Error creating collection:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Invalid collection data", 
        details: error.errors 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: "Failed to create collection" 
    }, { status: 500 });
  }
} 