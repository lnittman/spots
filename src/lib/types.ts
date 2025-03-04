import { Spot } from "./mock-data";

export interface User {
  id: string;
  name?: string;
  email?: string;
  image?: string;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isPublic: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  spots: Spot[];
  spotCount: number;
}

export interface CollectionCreateInput {
  name: string;
  description?: string;
  isPublic: boolean;
  spotIds?: string[];
}

export interface CollectionUpdateInput {
  name?: string;
  description?: string;
  isPublic?: boolean;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  rating: number;
  text: string;
  createdAt: string;
} 