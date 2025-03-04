"use client";

import { useState } from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export interface Interest {
  id: string;
  name: string;
  emoji: string;
  category?: string;
}

const defaultInterests: Interest[] = [
  { id: "coffee", name: "Coffee", emoji: "☕" },
  { id: "hiking", name: "Hiking", emoji: "🥾" },
  { id: "photography", name: "Photography", emoji: "📷" },
  { id: "art", name: "Art", emoji: "🎨" },
  { id: "music", name: "Music", emoji: "🎵" },
  { id: "food", name: "Food", emoji: "🍽️" },
  { id: "reading", name: "Reading", emoji: "📚" },
  { id: "shopping", name: "Shopping", emoji: "🛍️" },
  { id: "sports", name: "Sports", emoji: "⚽" },
  { id: "history", name: "History", emoji: "🏛️" },
  { id: "nature", name: "Nature", emoji: "🌿" },
  { id: "tech", name: "Tech", emoji: "💻" },
  { id: "museum", name: "Museums", emoji: "🏛️" },
  { id: "nightlife", name: "Nightlife", emoji: "🌃" },
  { id: "yoga", name: "Yoga", emoji: "🧘" },
  { id: "beach", name: "Beach", emoji: "🏖️" },
  { id: "architecture", name: "Architecture", emoji: "🏗️" },
  { id: "vintage", name: "Vintage", emoji: "🕰️" },
  { id: "crafts", name: "Crafts", emoji: "🧶" },
  { id: "gardening", name: "Gardening", emoji: "🌱" },
];

export interface InterestSelectorProps {
  interests?: Interest[];
  selectedInterests?: string[];
  onInterestChange?: (selectedIds: string[]) => void;
  maxSelections?: number;
  disabled?: boolean;
  className?: string;
}

export function InterestSelector({
  interests = defaultInterests,
  selectedInterests = [],
  onInterestChange,
  maxSelections = 5,
  disabled = false,
  className,
}: InterestSelectorProps) {
  const [selected, setSelected] = useState<string[]>(selectedInterests);

  const toggleInterest = (id: string) => {
    if (disabled) return;

    const isSelected = selected.includes(id);
    
    if (isSelected) {
      // Remove interest if already selected
      const newSelected = selected.filter((interestId) => interestId !== id);
      setSelected(newSelected);
      onInterestChange?.(newSelected);
    } else {
      // Add interest if not at max selections
      if (selected.length < maxSelections) {
        const newSelected = [...selected, id];
        setSelected(newSelected);
        onInterestChange?.(newSelected);
      }
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <p className="text-sm text-muted-foreground">
        Select up to {maxSelections} interests ({selected.length}/{maxSelections})
      </p>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {interests.map((interest) => {
          const isSelected = selected.includes(interest.id);
          return (
            <button
              key={interest.id}
              onClick={() => toggleInterest(interest.id)}
              className={cn(
                "flex items-center space-x-3 rounded-lg border p-3 text-left",
                "transition-colors hover:bg-accent",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isSelected && "border-primary bg-primary/5 text-primary",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              disabled={disabled}
              type="button"
            >
              <div className="flex-shrink-0 text-2xl">{interest.emoji}</div>
              <div className="flex-grow">
                <div className="font-medium">{interest.name}</div>
              </div>
              {isSelected && <Check className="h-4 w-4 text-primary" />}
            </button>
          );
        })}
      </div>
      
      {selected.length === maxSelections && (
        <p className="text-sm text-amber-500 dark:text-amber-400">
          Maximum selections reached. Remove some to select others.
        </p>
      )}
    </div>
  );
} 