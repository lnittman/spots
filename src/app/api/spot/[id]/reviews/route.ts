import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// In-memory store for reviews (in a real app, this would use a database)
let reviewsStore: {
  [spotId: string]: Array<{
    id: string;
    userId: string;
    userName: string;
    userImage?: string;
    rating: number;
    text: string;
    createdAt: string;
  }>
} = {};

// Validation schema for review creation
const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  text: z.string().min(3).max(500),
});

// GET reviews for a spot
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const spotId = params.id;
    
    // Get reviews for the spot
    const reviews = reviewsStore[spotId] || [];
    
    return NextResponse.json({ 
      success: true,
      reviews,
      count: reviews.length,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    
    return NextResponse.json({ 
      error: "Failed to fetch reviews" 
    }, { status: 500 });
  }
}

// POST a new review
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
    
    const spotId = params.id;
    
    // Parse and validate the request body
    const body = await request.json();
    const { rating, text } = reviewSchema.parse(body);
    
    // Create a new review
    const review = {
      id: Math.random().toString(36).substring(2, 15),
      userId: session.user.id,
      userName: session.user.name || "Anonymous",
      userImage: session.user.image,
      rating,
      text,
      createdAt: new Date().toISOString(),
    };
    
    // Initialize the reviews array for this spot if it doesn't exist
    if (!reviewsStore[spotId]) {
      reviewsStore[spotId] = [];
    }
    
    // Add the review
    reviewsStore[spotId].push(review);
    
    return NextResponse.json({ 
      success: true,
      review,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Invalid review data", 
        details: error.errors 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: "Failed to create review" 
    }, { status: 500 });
  }
}

// DELETE a review
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
    
    const spotId = params.id;
    const url = new URL(request.url);
    const reviewId = url.searchParams.get("reviewId");
    
    if (!reviewId) {
      return NextResponse.json({ error: "Review ID is required" }, { status: 400 });
    }
    
    // Check if the review exists
    if (!reviewsStore[spotId]) {
      return NextResponse.json({ error: "Spot not found" }, { status: 404 });
    }
    
    const reviewIndex = reviewsStore[spotId].findIndex(r => r.id === reviewId);
    
    if (reviewIndex === -1) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }
    
    // Check if the user is the owner of the review
    if (reviewsStore[spotId][reviewIndex].userId !== session.user.id) {
      return NextResponse.json({ error: "Not authorized to delete this review" }, { status: 403 });
    }
    
    // Remove the review
    reviewsStore[spotId].splice(reviewIndex, 1);
    
    return NextResponse.json({ 
      success: true,
      message: "Review deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    
    return NextResponse.json({ 
      error: "Failed to delete review" 
    }, { status: 500 });
  }
} 