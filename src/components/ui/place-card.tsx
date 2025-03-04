"use client"

import * as React from "react"
import Image from "next/image"
import { Heart, Clock, MapPin, DollarSign, Tag } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface PlaceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  place: {
    id: string
    name: string
    description: string
    type: string
    imageUrl: string
    address: string
    rating: number
    openHours: string
    priceLevel: string
    tags: string[]
    matchReason?: string
    distance?: string
  }
  isSaved?: boolean
  onSave?: (id: string) => void
}

export function PlaceCard({
  place,
  isSaved = false,
  onSave,
  className,
  ...props
}: PlaceCardProps) {
  return (
    <div
      className={cn(
        "group overflow-hidden rounded-lg border bg-background shadow-sm transition-all hover:shadow-md",
        className
      )}
      {...props}
    >
      <div className="relative h-48 w-full">
        <Image
          src={place.imageUrl}
          alt={place.name}
          fill
          className="object-cover"
        />
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "absolute right-2 top-2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm",
            isSaved ? "text-red-500" : "text-muted-foreground"
          )}
          onClick={(e) => {
            e.stopPropagation()
            onSave?.(place.id)
          }}
        >
          <Heart className={cn("h-4 w-4", isSaved ? "fill-current" : "")} />
          <span className="sr-only">{isSaved ? "Unsave" : "Save"}</span>
        </Button>
      </div>
      <div className="p-4">
        <div className="mb-2 flex items-start justify-between">
          <div>
            <h3 className="font-semibold line-clamp-1">{place.name}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="line-clamp-1">{place.address}</span>
              {place.distance && (
                <span className="text-xs text-muted-foreground">
                  ({place.distance})
                </span>
              )}
            </div>
          </div>
        </div>
        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
          {place.description}
        </p>
        <div className="mb-2 flex flex-wrap gap-1">
          {place.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{place.openHours}</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            <span>{place.priceLevel}</span>
          </div>
          {place.matchReason && (
            <div className="flex items-center gap-1 text-primary">
              <Tag className="h-3 w-3" />
              <span>{place.matchReason}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 