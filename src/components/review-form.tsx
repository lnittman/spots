"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ReviewFormProps {
  spotId: string;
  onReviewSubmitted?: (review: any) => void;
  onCancel?: () => void;
  className?: string;
}

export function ReviewForm({
  spotId,
  onReviewSubmitted,
  onCancel,
  className,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    
    if (review.trim().length < 3) {
      setError("Please write a review (minimum 3 characters)");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/spot/${spotId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          text: review,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit review");
      }
      
      const data = await response.json();
      
      if (onReviewSubmitted) {
        onReviewSubmitted(data.review);
      }
      
      // Reset form
      setRating(0);
      setReview("");
    } catch (error) {
      console.error("Error submitting review:", error);
      setError(error instanceof Error ? error.message : "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <div className="text-sm font-medium">Your Rating</div>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              className="p-1 focus:outline-none"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(0)}
            >
              <Star
                className={cn(
                  "h-6 w-6 transition-colors",
                  (hoverRating ? value <= hoverRating : value <= rating)
                    ? "fill-yellow-500 text-yellow-500"
                    : "text-muted-foreground"
                )}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-muted-foreground">
            {rating > 0 ? `${rating} star${rating !== 1 ? 's' : ''}` : 'Select a rating'}
          </span>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="text-sm font-medium">Your Review</div>
        <Textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Share your experience at this place..."
          className="min-h-[100px]"
          disabled={loading}
        />
      </div>
      
      {error && (
        <div className="text-sm text-red-500">
          {error}
        </div>
      )}
      
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button 
            type="button"
            variant="outline" 
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Review"}
        </Button>
      </div>
    </form>
  );
} 