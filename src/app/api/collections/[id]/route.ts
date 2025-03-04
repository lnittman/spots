import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { 
  getCollectionById,
  updateCollection,
  deleteCollection
} from "@/lib/collections-store";

// Validation schema for collection updates
const collectionUpdateSchema = z.object({
  name: z.string().min(3).max(50).optional(),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().optional(),
});

// GET a specific collection
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
      collection,
    });
  } catch (error) {
    console.error("Error getting collection:", error);
    
    return NextResponse.json({ 
      error: "Failed to fetch collection" 
    }, { status: 500 });
  }
}

// PATCH update a collection
export async function PATCH(
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
    const input = collectionUpdateSchema.parse(body);
    
    // Update the collection
    const collection = await updateCollection(session.user.id, collectionId, input);
    
    if (!collection) {
      return NextResponse.json({ error: "Collection not found or you are not authorized to update it" }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true,
      collection,
    });
  } catch (error) {
    console.error("Error updating collection:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Invalid collection data", 
        details: error.errors 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: "Failed to update collection" 
    }, { status: 500 });
  }
}

// DELETE a collection
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
    
    // Delete the collection
    const success = await deleteCollection(session.user.id, collectionId);
    
    if (!success) {
      return NextResponse.json({ error: "Collection not found or you are not authorized to delete it" }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true,
      message: "Collection deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting collection:", error);
    
    return NextResponse.json({ 
      error: "Failed to delete collection" 
    }, { status: 500 });
  }
} 