// Trip related types
export interface Trip {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  description?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  isPublic: boolean;
  location?: string | null;
  creatorId: string;
}

export interface TripCollaborator {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  role: 'viewer' | 'editor' | 'admin';
  tripId: string;
  userId: string;
}

export interface TripSpot {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  order?: number | null;
  day?: number | null;
  time?: string | null;
  duration?: number | null;
  notes?: string | null;
  tripId: string;
  spotId: string;
} 