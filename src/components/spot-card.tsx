"use client";

import { Spot } from "@/lib/mock-data";
import { InterestTile } from "@/components/interest-tile";
import { enhanceInterest } from "@/lib/interest-utils";
import { Bookmark, MapPin, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface SpotCardProps {
  spot: Spot;
  className?: string;
  variant?: "default" | "compact" | "horizontal";
  onClick?: () => void;
  onSave?: () => void;
  saved?: boolean;
  tooltip?: string;
}

export function SpotCard({
  spot,
  className,
  variant = "default",
  onClick,
  onSave,
  saved = false,
  tooltip,
}: SpotCardProps) {
  // Price range display
  const priceDisplay = Array(spot.priceRange)
    .fill("$")
    .join("");
  
  // Rating display
  const rating = spot.rating.toFixed(1);
  
  // Check if the spot has an image
  const hasImage = !!spot.imageUrl;
  
  // Badge components
  const PopularBadge = () => (
    <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs font-medium px-2 py-0.5 rounded-full">
      Popular
    </div>
  );
  
  const VerifiedBadge = () => (
    <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
      <span className="h-3 w-3">✓</span> Verified
    </div>
  );
  
  // Render the card based on the variant
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "group relative border rounded-lg overflow-hidden bg-card hover:shadow-md transition-all cursor-pointer",
          className
        )}
        onClick={onClick}
      >
        <div className="relative aspect-square bg-muted">
          {spot.imageUrl ? (
            <img
              src={spot.imageUrl}
              alt={spot.name}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-gray-100 to-gray-200">
              {spot.emoji || "📍"}
            </div>
          )}

          {spot.popular && <PopularBadge />}
          {spot.verified && <VerifiedBadge />}
        </div>

        <div className="p-3 space-y-1">
          <h3 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
            {spot.name}
          </h3>
          
          {/* Tooltip for recommendation context */}
          {tooltip && (
            <p className="text-xs text-muted-foreground italic">{tooltip}</p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
              <span className="text-xs">{rating}</span>
            </div>
            <span className="text-xs text-muted-foreground">{priceDisplay}</span>
          </div>
        </div>

        {onSave && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSave();
            }}
            className="absolute top-2 right-2 h-7 w-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-background transition-colors"
            aria-label={saved ? "Unsave spot" : "Save spot"}
          >
            <Bookmark
              className={cn(
                "h-4 w-4",
                saved ? "fill-primary text-primary" : "text-muted-foreground"
              )}
            />
          </button>
        )}
      </div>
    );
  }
  
  if (variant === "horizontal") {
    return (
      <div
        className={cn(
          "group relative flex border rounded-lg overflow-hidden bg-card hover:shadow-md transition-all cursor-pointer",
          className
        )}
        onClick={onClick}
      >
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-muted">
          {spot.imageUrl ? (
            <img
              src={spot.imageUrl}
              alt={spot.name}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-gray-100 to-gray-200">
              {spot.emoji || "📍"}
            </div>
          )}

          {spot.popular && <PopularBadge />}
        </div>

        <div className="p-3 flex-1">
          <h3 className="font-medium text-sm sm:text-base group-hover:text-primary transition-colors">
            {spot.name}
          </h3>
          
          {/* Tooltip for recommendation context */}
          {tooltip && (
            <p className="text-xs text-muted-foreground italic mt-1">{tooltip}</p>
          )}
          
          <div className="flex items-center mt-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 mr-1" />
            <span className="line-clamp-1">{spot.neighborhood}</span>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-1">
              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
              <span className="text-xs">{rating}</span>
            </div>
            <span className="text-xs">{priceDisplay}</span>
          </div>
          
          <div className="flex flex-wrap gap-1 mt-2">
            {spot.interests.slice(0, 2).map((interest, i) => (
              <span key={i} className="text-[10px] px-1.5 py-0.5 bg-muted rounded-sm">
                {interest}
              </span>
            ))}
          </div>
        </div>

        {onSave && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSave();
            }}
            className="absolute top-2 right-2 h-7 w-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-background transition-colors"
            aria-label={saved ? "Unsave spot" : "Save spot"}
          >
            <Bookmark
              className={cn(
                "h-4 w-4",
                saved ? "fill-primary text-primary" : "text-muted-foreground"
              )}
            />
          </button>
        )}
      </div>
    );
  }
  
  // Default variant
  return (
    <div
      className={cn(
        "group relative border rounded-lg overflow-hidden bg-card hover:shadow-md transition-all cursor-pointer h-full flex flex-col",
        className
      )}
      onClick={onClick}
    >
      <div className="relative aspect-video bg-muted">
        {spot.imageUrl ? (
          <img
            src={spot.imageUrl}
            alt={spot.name}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-gray-100 to-gray-200">
            {spot.emoji || "📍"}
          </div>
        )}
        
        {spot.popular && <PopularBadge />}
        {spot.verified && <VerifiedBadge />}
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-medium text-base group-hover:text-primary transition-colors">
          {spot.name}
        </h3>
        
        {/* Tooltip for recommendation context */}
        {tooltip && (
          <p className="text-xs text-muted-foreground italic mt-1">{tooltip}</p>
        )}
        
        <div className="flex items-center mt-1 text-sm text-muted-foreground">
          <MapPin className="h-3 w-3 mr-1" />
          <span className="line-clamp-1">{spot.neighborhood}</span>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span className="font-medium">{rating}</span>
            <span className="text-xs text-muted-foreground">({spot.reviewCount})</span>
          </div>
          <div>
            <span className="font-medium">{priceDisplay}</span>
            <span className="text-xs text-muted-foreground ml-1">{spot.type}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mt-3 mb-1">
          {spot.interests.map((interest, i) => (
            <span key={i} className="text-xs px-2 py-0.5 bg-muted rounded-full">
              {interest}
            </span>
          ))}
        </div>
      </div>
      
      {onSave && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSave();
          }}
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-background transition-colors"
          aria-label={saved ? "Unsave spot" : "Save spot"}
        >
          <Bookmark
            className={cn(
              "h-5 w-5",
              saved ? "fill-primary text-primary" : "text-muted-foreground"
            )}
          />
        </button>
      )}
    </div>
  );
} 