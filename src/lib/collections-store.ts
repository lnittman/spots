import { Collection, CollectionCreateInput, CollectionUpdateInput } from "./types";
import { allMockSpots, Spot } from "./mock-data";

// In-memory store for collections (in a real app, this would use a database)
let collectionsStore: Collection[] = [
  {
    id: "default-1",
    name: "Favorite Coffee Shops",
    description: "My go-to places for great coffee",
    isPublic: true,
    userId: "default-user",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    spots: allMockSpots.filter(spot => spot.type === 'cafe').slice(0, 3),
    spotCount: 3,
    imageUrl: allMockSpots.find(spot => spot.type === 'cafe')?.imageUrl,
  },
  {
    id: "default-2",
    name: "Weekend Getaways",
    description: "Perfect spots for a quick weekend trip",
    isPublic: true,
    userId: "default-user",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    spots: allMockSpots.filter(spot => spot.interests.some(i => i === 'nature' || i === 'beach')).slice(0, 2),
    spotCount: 2,
    imageUrl: allMockSpots.find(spot => spot.interests.includes('nature'))?.imageUrl,
  }
];

// Get all collections for a user
export async function getUserCollections(userId: string): Promise<Collection[]> {
  return collectionsStore.filter(collection => collection.userId === userId);
}

// Get a collection by ID
export async function getCollectionById(collectionId: string): Promise<Collection | null> {
  return collectionsStore.find(collection => collection.id === collectionId) || null;
}

// Create a new collection
export async function createCollection(userId: string, input: CollectionCreateInput): Promise<Collection> {
  // Create new collection
  const newCollection: Collection = {
    id: `collection-${Date.now()}`,
    name: input.name,
    description: input.description,
    isPublic: input.isPublic,
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    spots: [],
    spotCount: 0,
  };
  
  // Add spots if provided
  if (input.spotIds && input.spotIds.length > 0) {
    newCollection.spots = allMockSpots.filter(spot => input.spotIds?.includes(spot.id));
    newCollection.spotCount = newCollection.spots.length;
    
    // Set collection image to the first spot's image if available
    if (newCollection.spots[0]?.imageUrl) {
      newCollection.imageUrl = newCollection.spots[0].imageUrl;
    }
  }
  
  // Add to store
  collectionsStore.push(newCollection);
  
  return newCollection;
}

// Update a collection
export async function updateCollection(
  userId: string, 
  collectionId: string, 
  input: CollectionUpdateInput
): Promise<Collection | null> {
  // Find collection
  const collectionIndex = collectionsStore.findIndex(c => c.id === collectionId && c.userId === userId);
  
  if (collectionIndex === -1) {
    return null;
  }
  
  // Update collection
  const updatedCollection = {
    ...collectionsStore[collectionIndex],
    ...input,
    updatedAt: new Date().toISOString(),
  };
  
  // Replace in store
  collectionsStore[collectionIndex] = updatedCollection;
  
  return updatedCollection;
}

// Delete a collection
export async function deleteCollection(userId: string, collectionId: string): Promise<boolean> {
  const initialLength = collectionsStore.length;
  
  collectionsStore = collectionsStore.filter(
    collection => !(collection.id === collectionId && collection.userId === userId)
  );
  
  return collectionsStore.length < initialLength;
}

// Add a spot to a collection
export async function addSpotToCollection(
  userId: string, 
  collectionId: string, 
  spotId: string
): Promise<Collection | null> {
  // Find collection
  const collectionIndex = collectionsStore.findIndex(c => c.id === collectionId && c.userId === userId);
  
  if (collectionIndex === -1) {
    return null;
  }
  
  // Find spot
  const spot = allMockSpots.find(s => s.id === spotId);
  
  if (!spot) {
    return null;
  }
  
  // Check if spot is already in collection
  if (collectionsStore[collectionIndex].spots.some(s => s.id === spotId)) {
    return collectionsStore[collectionIndex];
  }
  
  // Update collection
  const updatedCollection = {
    ...collectionsStore[collectionIndex],
    spots: [...collectionsStore[collectionIndex].spots, spot],
    spotCount: collectionsStore[collectionIndex].spotCount + 1,
    updatedAt: new Date().toISOString(),
  };
  
  // Set collection image if it doesn't have one
  if (!updatedCollection.imageUrl && spot.imageUrl) {
    updatedCollection.imageUrl = spot.imageUrl;
  }
  
  // Replace in store
  collectionsStore[collectionIndex] = updatedCollection;
  
  return updatedCollection;
}

// Remove a spot from a collection
export async function removeSpotFromCollection(
  userId: string, 
  collectionId: string, 
  spotId: string
): Promise<Collection | null> {
  // Find collection
  const collectionIndex = collectionsStore.findIndex(c => c.id === collectionId && c.userId === userId);
  
  if (collectionIndex === -1) {
    return null;
  }
  
  // Check if spot is in collection
  if (!collectionsStore[collectionIndex].spots.some(s => s.id === spotId)) {
    return collectionsStore[collectionIndex];
  }
  
  // Update collection
  const updatedCollection = {
    ...collectionsStore[collectionIndex],
    spots: collectionsStore[collectionIndex].spots.filter(s => s.id !== spotId),
    spotCount: collectionsStore[collectionIndex].spotCount - 1,
    updatedAt: new Date().toISOString(),
  };
  
  // Update image if we removed the spot that was the collection image
  if (updatedCollection.imageUrl === allMockSpots.find(s => s.id === spotId)?.imageUrl) {
    updatedCollection.imageUrl = updatedCollection.spots[0]?.imageUrl;
  }
  
  // Replace in store
  collectionsStore[collectionIndex] = updatedCollection;
  
  return updatedCollection;
} 