import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

// Mock database for trips (in a real app, this would be a database)
interface TripData {
  id: string;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  isPublic: boolean;
  location: string | null;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  collaborators: {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    role: string;
  }[];
  spots: {
    id: string;
    spotId: string;
    spotName: string;
    order: number | null;
    day: number | null;
    time: string | null;
    duration: number | null;
    notes: string | null;
  }[];
}

// Mock trips storage
const trips: Record<string, TripData> = {};

// Validation schema for creating a trip
const createTripSchema = z.object({
  name: z.string().min(1, "Trip name is required"),
  description: z.string().nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  isPublic: z.boolean().default(false),
  location: z.string().nullable().optional(),
  spots: z.array(
    z.object({
      spotId: z.string(),
      order: z.number().nullable().optional(),
      day: z.number().nullable().optional(),
      time: z.string().nullable().optional(),
      duration: z.number().nullable().optional(),
      notes: z.string().nullable().optional(),
    })
  ).optional(),
  collaborators: z.array(
    z.object({
      userId: z.string(),
      role: z.enum(["viewer", "editor", "admin"]).default("viewer"),
    })
  ).optional(),
});

// Validation schema for updating a trip
const updateTripSchema = createTripSchema.partial();

// GET /api/trips - Get all trips for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    // In a real app, this would query the database for the user's trips
    // For now, just return all trips where the user is the creator or a collaborator
    const userEmail = session.user.email;
    const userTrips = Object.values(trips).filter(trip => {
      // User is creator or collaborator
      return (
        (trip.creatorId === userEmail) || 
        trip.collaborators.some(collaborator => collaborator.userEmail === userEmail)
      );
    });
    
    return NextResponse.json({ trips: userTrips });
  } catch (error) {
    console.error("Error fetching trips:", error);
    return NextResponse.json({ error: "Failed to fetch trips" }, { status: 500 });
  }
}

// POST /api/trips - Create a new trip
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    // Parse and validate request body
    const body = await request.json();
    const { name, description, startDate, endDate, isPublic, location, spots, collaborators } = 
      createTripSchema.parse(body);
    
    // Generate a unique ID for the trip
    const tripId = `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create the trip
    const newTrip: TripData = {
      id: tripId,
      name,
      description: description || null,
      startDate: startDate || null,
      endDate: endDate || null,
      isPublic: isPublic || false,
      location: location || null,
      creatorId: session.user.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      collaborators: collaborators?.map(c => ({
        id: `collab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: c.userId,
        userName: "Collaborator", // In a real app, fetch user details
        userEmail: c.userId, // In a real app, this would be the user's email
        role: c.role,
      })) || [],
      spots: spots?.map(s => ({
        id: `tripspot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        spotId: s.spotId,
        spotName: "Spot Name", // In a real app, fetch spot details
        order: s.order || null,
        day: s.day || null,
        time: s.time || null,
        duration: s.duration || null,
        notes: s.notes || null,
      })) || [],
    };
    
    // Store the trip
    trips[tripId] = newTrip;
    
    return NextResponse.json({ 
      success: true, 
      trip: newTrip 
    });
  } catch (error) {
    console.error("Error creating trip:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Invalid request data", 
        details: error.errors 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: "Failed to create trip" 
    }, { status: 500 });
  }
}

// PATCH /api/trips/:id - Update a trip
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    // Get trip ID from the URL
    const url = new URL(request.url);
    const tripId = url.searchParams.get("id");
    
    if (!tripId || !trips[tripId]) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }
    
    // Check if user has permission to update this trip
    const trip = trips[tripId];
    const userEmail = session.user.email;
    const isCreator = trip.creatorId === userEmail;
    const isAdmin = trip.collaborators.some(c => 
      c.userEmail === userEmail && c.role === "admin"
    );
    const isEditor = trip.collaborators.some(c => 
      c.userEmail === userEmail && c.role === "editor"
    );
    
    if (!isCreator && !isAdmin && !isEditor) {
      return NextResponse.json({ 
        error: "You don't have permission to update this trip" 
      }, { status: 403 });
    }
    
    // Parse and validate request body
    const body = await request.json();
    const updates = updateTripSchema.parse(body);
    
    // Update the trip
    const updatedTrip = {
      ...trip,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    // If updates include collaborators, handle them
    if (updates.collaborators) {
      // In a real app, we would handle adding/removing collaborators
      // For now, just replace the list
      updatedTrip.collaborators = updates.collaborators.map(c => ({
        id: `collab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: c.userId,
        userName: "Collaborator", // In a real app, fetch user details
        userEmail: c.userId, // In a real app, this would be the user's email
        role: c.role,
      }));
    }
    
    // If updates include spots, handle them
    if (updates.spots) {
      // In a real app, we would handle adding/removing spots
      // For now, just replace the list
      updatedTrip.spots = updates.spots.map(s => ({
        id: `tripspot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        spotId: s.spotId,
        spotName: "Spot Name", // In a real app, fetch spot details
        order: s.order || null,
        day: s.day || null,
        time: s.time || null,
        duration: s.duration || null,
        notes: s.notes || null,
      }));
    }
    
    // Store the updated trip
    trips[tripId] = updatedTrip as TripData;
    
    return NextResponse.json({ 
      success: true, 
      trip: updatedTrip 
    });
  } catch (error) {
    console.error("Error updating trip:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Invalid request data", 
        details: error.errors 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: "Failed to update trip" 
    }, { status: 500 });
  }
}

// DELETE /api/trips/:id - Delete a trip
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    // Get trip ID from the URL
    const url = new URL(request.url);
    const tripId = url.searchParams.get("id");
    
    if (!tripId || !trips[tripId]) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }
    
    // Check if user has permission to delete this trip
    const trip = trips[tripId];
    const userEmail = session.user.email;
    const isCreator = trip.creatorId === userEmail;
    const isAdmin = trip.collaborators.some(c => 
      c.userEmail === userEmail && c.role === "admin"
    );
    
    if (!isCreator && !isAdmin) {
      return NextResponse.json({ 
        error: "You don't have permission to delete this trip" 
      }, { status: 403 });
    }
    
    // Delete the trip
    delete trips[tripId];
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting trip:", error);
    return NextResponse.json({ error: "Failed to delete trip" }, { status: 500 });
  }
} 