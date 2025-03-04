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
}

export function SpotCard({
  spot,
  className,
  variant = "default",
  onClick,
  onSave,
  saved = false,
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
          "group relative bg-card border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer",
          "h-[160px] min-w-[160px] max-w-[240px]",
          className
        )}
        onClick={onClick}
      >
        {/* Image section */}
        <div 
          className={cn(
            "h-full w-full bg-muted",
            hasImage ? "bg-cover bg-center" : "flex items-center justify-center"
          )}
          style={hasImage ? { backgroundImage: `url(${spot.imageUrl})` } : {}}
        >
          {!hasImage && (
            <div className="text-3xl opacity-20">{spot.type === 'cafe' ? '☕' : '📍'}</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        </div>
        
        {/* Info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
          <h3 className="text-sm font-semibold line-clamp-1">{spot.name}</h3>
          <div className="flex items-center gap-1 text-xs text-white/90">
            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
            <span>{rating}</span>
            <span className="mx-1">•</span>
            <span>{priceDisplay}</span>
            <span className="mx-1">•</span>
            <span className="line-clamp-1">{spot.type}</span>
          </div>
        </div>
        
        {/* Badges */}
        {spot.popular && <PopularBadge />}
        
        {/* Save button */}
        {onSave && (
          <button 
            className="absolute top-2 right-2 h-8 w-8 bg-white/80 rounded-full flex items-center justify-center text-gray-700 hover:bg-white transition-colors z-10"
            onClick={(e) => {
              e.stopPropagation();
              onSave();
            }}
          >
            <Bookmark className={cn("h-4 w-4", saved && "fill-current text-primary")} />
          </button>
        )}
      </div>
    );
  }
  
  if (variant === "horizontal") {
    return (
      <div 
        className={cn(
          "group relative bg-card border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200",
          "flex h-28 w-full cursor-pointer",
          className
        )}
        onClick={onClick}
      >
        {/* Image section */}
        <div 
          className={cn(
            "h-full w-28 bg-muted",
            hasImage ? "bg-cover bg-center" : "flex items-center justify-center"
          )}
          style={hasImage ? { backgroundImage: `url(${spot.imageUrl})` } : {}}
        >
          {!hasImage && (
            <div className="text-3xl opacity-20">{spot.type === 'cafe' ? '☕' : '📍'}</div>
          )}
        </div>
        
        {/* Content section */}
        <div className="flex-1 p-3 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold line-clamp-1">{spot.name}</h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
              <span>{rating}</span>
              <span className="mx-1">•</span>
              <span>{priceDisplay}</span>
              <span className="mx-1">•</span>
              <span className="capitalize">{spot.type}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {spot.description}
            </p>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 mr-1" />
              {spot.neighborhood}
            </div>
            
            {/* Badges */}
            <div className="flex gap-1">
              {spot.popular && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded-full">
                  Popular
                </span>
              )}
              {spot.verified && (
                <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full flex items-center">
                  <span className="h-3 w-3 mr-0.5">✓</span> Verified
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Save button */}
        {onSave && (
          <button 
            className="absolute top-2 right-2 h-8 w-8 bg-white/80 rounded-full flex items-center justify-center text-gray-700 hover:bg-white transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onSave();
            }}
          >
            <Bookmark className={cn("h-4 w-4", saved && "fill-current text-primary")} />
          </button>
        )}
      </div>
    );
  }
  
  // Default variant
  return (
    <div 
      className={cn(
        "group relative bg-card border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {/* Image section */}
      <div 
        className={cn(
          "h-40 w-full bg-muted",
          hasImage ? "bg-cover bg-center" : "flex items-center justify-center"
        )}
        style={hasImage ? { backgroundImage: `url(${spot.imageUrl})` } : {}}
      >
        {!hasImage && (
          <div className="text-5xl opacity-20">{spot.type === 'cafe' ? '☕' : '📍'}</div>
        )}
        
        {/* Badges */}
        {spot.popular && <PopularBadge />}
        {spot.verified && <VerifiedBadge />}
        
        {/* Save button */}
        {onSave && (
          <button 
            className="absolute top-2 right-2 h-8 w-8 bg-white/80 rounded-full flex items-center justify-center text-gray-700 hover:bg-white transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onSave();
            }}
          >
            <Bookmark className={cn("h-4 w-4", saved && "fill-current text-primary")} />
          </button>
        )}
      </div>
      
      {/* Content section */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold truncate">{spot.name}</h3>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
            <span className="text-sm font-medium">{rating}</span>
          </div>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground mt-1">
          <span>{priceDisplay}</span>
          <span className="mx-1">•</span>
          <span className="capitalize">{spot.type}</span>
          <span className="mx-1">•</span>
          <span>{spot.neighborhood}</span>
        </div>
        
        <p className="text-sm mt-2 line-clamp-2 text-muted-foreground">
          {spot.description}
        </p>
        
        <div className="mt-3 flex flex-wrap gap-1">
          {spot.interests.slice(0, 3).map(interest => (
            <InterestTile
              key={interest}
              interest={enhanceInterest(interest)}
              size="sm"
              interactive={false}
            />
          ))}
          {spot.interests.length > 3 && (
            <span className="text-xs text-muted-foreground flex items-center px-2">
              +{spot.interests.length - 3} more
            </span>
          )}
        </div>
        
        <div className="mt-3 pt-3 border-t flex justify-between items-center text-sm">
          <div className="flex items-center text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            {spot.address}
          </div>
          
          <Link 
            href={`/spot/${spot.id}`}
            className="text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
} 