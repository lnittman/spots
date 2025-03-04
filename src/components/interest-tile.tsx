"use client";

import { cn } from "@/lib/utils";
import { Interest } from "@/components/interest-selector";

interface InterestTileProps {
  interest: Interest | { id: string; name: string; emoji?: string; color?: string };
  selected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  className?: string;
}

export function InterestTile({
  interest,
  selected = false,
  onClick,
  size = 'md',
  interactive = true,
  className,
}: InterestTileProps) {
  // Get size classes based on size prop
  const sizeClasses = {
    sm: 'text-xs py-1 px-2',
    md: 'text-sm py-1.5 px-3',
    lg: 'text-base py-2 px-4',
  }[size];
  
  return (
    <div
      className={cn(
        "flex items-center transition-colors",
        "border font-medium rounded-md",
        sizeClasses,
        selected ? "border-primary bg-primary/10" : "border-transparent bg-accent/30",
        interactive && "hover:bg-accent/50 cursor-pointer",
        "min-w-fit",
        className
      )}
      style={{
        backgroundColor: selected ? `${interest.color || "#4ECDC4"}20` : undefined,
        borderColor: selected ? interest.color || "#4ECDC4" : undefined,
      }}
      onClick={interactive ? onClick : undefined}
    >
      {interest.emoji && (
        <span className="mr-1.5" style={{ minWidth: '1em' }}>{interest.emoji}</span>
      )}
      <span className="overflow-hidden text-ellipsis whitespace-nowrap">
        {interest.name}
      </span>
    </div>
  );
} 