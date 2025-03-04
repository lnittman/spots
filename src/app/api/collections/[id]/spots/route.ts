import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { 
  addSpotToCollection,
  removeSpotFromCollection,
  getCollectionById
} from "@/lib/collections-store";

// Validation schema for adding a spot
const addSpotSchema = z.object({
  spotId: z.string().min(1),
});

// GET spots in a collection
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions as any) as any;
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const collectionId = params.id;
    
    // Get the collection
    const collection = await getCollectionById(collectionId);
    
    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }
    
    // Check if the user is allowed to view this collection
    if (collection.userId !== session.user.id && !collection.isPublic) {
      return NextResponse.json({ error: "Not authorized to view this collection" }, { status: 403 });
    }
    
    return NextResponse.json({ 
      success: true,
      spots: collection.spots,
      count: collection.spotCount,
    });
  } catch (error) {
    console.error("Error getting collection spots:", error);
    
    return NextResponse.json({ 
      error: "Failed to fetch collection spots" 
    }, { status: 500 });
  }
}

// POST add a spot to a collection
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions as any) as any;
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const collectionId = params.id;
    
    // Parse and validate the request body
    const body = await request.json();
    const { spotId } = addSpotSchema.parse(body);
    
    // Add spot to collection
    const collection = await addSpotToCollection(session.user.id, collectionId, spotId);
    
    if (!collection) {
      return NextResponse.json({ error: "Collection not found or spot doesn't exist" }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true,
      collection,
    });
  } catch (error) {
    console.error("Error adding spot to collection:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Invalid spot data", 
        details: error.errors 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: "Failed to add spot to collection" 
    }, { status: 500 });
  }
}

// DELETE remove a spot from a collection
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions as any) as any;
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const collectionId = params.id;
    const url = new URL(request.url);
    const spotId = url.searchParams.get("spotId");
    
    if (!spotId) {
      return NextResponse.json({ error: "Spot ID is required" }, { status: 400 });
    }
    
    // Remove spot from collection
    const collection = await removeSpotFromCollection(session.user.id, collectionId, spotId);
    
    if (!collection) {
      return NextResponse.json({ error: "Collection not found or you are not authorized to modify it" }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true,
      collection,
    });
  } catch (error) {
    console.error("Error removing spot from collection:", error);
    
    return NextResponse.json({ 
      error: "Failed to remove spot from collection" 
    }, { status: 500 });
  }
} 