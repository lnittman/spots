"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, 
  Bookmark, 
  ExternalLink, 
  Heart, 
  MapPin, 
  Phone, 
  Share, 
  Star, 
  ChevronRight, 
  Users,
  Clock,
  DollarSign
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MapView } from "@/components/map/map-view";
import { SpotCard } from "@/components/spot-card";
import { InterestTile } from "@/components/interest-tile";
import { allMockSpots, Spot, getSpotsByInterests } from "@/lib/mock-data";
import { enhanceInterest } from "@/lib/interest-utils";
import { ReviewForm } from "@/components/review-form";

export default function SpotPage() {
  const params = useParams();
  const router = useRouter();
  const [spot, setSpot] = useState<Spot | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [liked, setLiked] = useState(false);
  const [relatedSpots, setRelatedSpots] = useState<Spot[]>([]);
  const [reviews, setReviews] = useState<any[]>([
    { id: 1, user: "Alex Johnson", rating: 4.5, date: "2 weeks ago", text: "Really enjoyed this place! Great atmosphere and friendly staff.", avatar: "https://i.pravatar.cc/150?u=alex" },
    { id: 2, user: "Sam Taylor", rating: 5, date: "1 month ago", text: "One of my favorite spots in the city. Highly recommend the specialty coffee here.", avatar: "https://i.pravatar.cc/150?u=sam" },
    { id: 3, user: "Jordan Lee", rating: 4, date: "3 months ago", text: "Nice location and good service. A bit crowded on weekends but worth the wait.", avatar: "https://i.pravatar.cc/150?u=jordan" },
  ]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  // Fetch spot data
  useEffect(() => {
    if (!params.id) return;
    
    const spotId = Array.isArray(params.id) ? params.id[0] : params.id;
    
    // In a real app, this would be an API call
    const foundSpot = allMockSpots.find(s => s.id === spotId);
    
    if (foundSpot) {
      setSpot(foundSpot);
      
      // Get related spots based on this spot's interests
      const related = getSpotsByInterests(foundSpot.interests)
        .filter(s => s.id !== foundSpot.id)
        .slice(0, 5);
      
      setRelatedSpots(related);
    }
    
    setLoading(false);
  }, [params.id]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-background/95 backdrop-blur-sm border-b">
          <div className="container py-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
        </header>
        
        <main className="container py-4 pb-12">
          <div className="space-y-6 max-w-4xl mx-auto">
            <Skeleton className="h-[300px] w-full rounded-lg" />
            <Skeleton className="h-10 w-3/4 rounded-lg" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-[300px] w-full rounded-lg" />
          </div>
        </main>
      </div>
    );
  }
  
  if (!spot) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-background/95 backdrop-blur-sm border-b">
          <div className="container py-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
        </header>
        
        <main className="container py-12">
          <div className="text-center max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Spot Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The spot you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/explore">
              <Button>Explore Other Spots</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }
  
  // Format price range
  const priceDisplay = Array(spot.priceRange)
    .fill("$")
    .join("");
  
  // Handle new review submission
  const handleReviewSubmitted = (review: any) => {
    // Add the new review to the list
    setReviews([
      {
        id: review.id,
        user: review.userName,
        rating: review.rating,
        date: "Just now",
        text: review.text,
        avatar: review.userImage || "https://i.pravatar.cc/150?u=user",
      },
      ...reviews,
    ]);
    
    // Hide the form
    setShowReviewForm(false);
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col pb-12">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="container flex justify-between items-center py-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setSaved(!saved)}
            >
              <Bookmark className={`h-4 w-4 ${saved ? "fill-primary text-primary" : ""}`} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setLiked(!liked)}
            >
              <Heart className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container py-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Hero section */}
          <div className="relative h-[300px] overflow-hidden rounded-lg">
            {spot.imageUrl ? (
              <Image 
                src={spot.imageUrl} 
                alt={spot.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full bg-muted flex items-center justify-center">
                <div className="text-6xl opacity-20">{spot.type === 'cafe' ? '☕' : '📍'}</div>
              </div>
            )}
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              {spot.popular && (
                <Badge className="bg-yellow-500 text-black">Popular</Badge>
              )}
              {spot.verified && (
                <Badge className="bg-blue-500 text-white">Verified</Badge>
              )}
            </div>
          </div>
          
          {/* Title and info */}
          <div>
            <h1 className="text-3xl font-bold">{spot.name}</h1>
            <div className="flex flex-wrap gap-2 mt-2 items-center text-sm text-muted-foreground">
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-1 fill-yellow-500 text-yellow-500" />
                <span className="font-medium">{spot.rating.toFixed(1)}</span>
                <span className="ml-1">({reviews.length} reviews)</span>
              </div>
              <span>•</span>
              <span className="capitalize">{spot.type}</span>
              <span>•</span>
              <span>{priceDisplay}</span>
              <span>•</span>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {spot.neighborhood}
              </div>
            </div>
          </div>
          
          {/* Interests */}
          <div className="flex flex-wrap gap-2">
            {spot.interests.map(interest => (
              <InterestTile
                key={interest}
                interest={enhanceInterest(interest)}
                size="sm"
                interactive={false}
              />
            ))}
          </div>
          
          {/* Quick actions */}
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <Button className="gap-2">
              <MapPin className="h-4 w-4" />
              Get Directions
            </Button>
            {spot.website && (
              <Button variant="outline" className="gap-2" asChild>
                <a href={spot.website} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Website
                </a>
              </Button>
            )}
            {spot.phone && (
              <Button variant="outline" className="gap-2" asChild>
                <a href={`tel:${spot.phone}`}>
                  <Phone className="h-4 w-4" />
                  Call
                </a>
              </Button>
            )}
            <Button variant="outline" className="gap-2">
              <Users className="h-4 w-4" />
              Check In
            </Button>
          </div>
          
          <Separator />
          
          {/* Main content */}
          <Tabs defaultValue="about">
            <TabsList className="mb-4">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="nearby">Nearby</TabsTrigger>
            </TabsList>
            
            <TabsContent value="about" className="space-y-6">
              {/* Description */}
              <div>
                <h2 className="text-lg font-semibold mb-2">About</h2>
                <p className="text-muted-foreground">{spot.description}</p>
              </div>
              
              {/* Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted/30 p-4 rounded-lg border space-y-4">
                  <h3 className="font-medium">Details</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Address</p>
                        <p className="text-sm text-muted-foreground">{spot.address}, {spot.city}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <DollarSign className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Price Range</p>
                        <p className="text-sm text-muted-foreground">{priceDisplay} - {spot.priceRange === 1 ? 'Budget' : spot.priceRange === 2 ? 'Moderate' : spot.priceRange === 3 ? 'Expensive' : 'Very Expensive'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Clock className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Hours</p>
                        <p className="text-sm text-muted-foreground">9:00 AM - 6:00 PM (Demo hours)</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-muted/30 p-4 rounded-lg border space-y-4">
                  <h3 className="font-medium">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {spot.tags.map(tag => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Map */}
              <div>
                <h2 className="text-lg font-semibold mb-2">Location</h2>
                <div className="h-[300px] rounded-lg overflow-hidden border">
                  <MapView
                    center={spot.coordinates}
                    zoom={15}
                    markers={[{
                      id: spot.id,
                      name: spot.name,
                      coordinates: spot.coordinates,
                      color: enhanceInterest(spot.interests[0]).color,
                    }]}
                    className="w-full h-full"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {spot.address}, {spot.neighborhood}, {spot.city}
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Reviews</h2>
                {!showReviewForm && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowReviewForm(true)}
                  >
                    Write a Review
                  </Button>
                )}
              </div>
              
              {showReviewForm && (
                <div className="p-4 border rounded-lg bg-muted/10">
                  <h3 className="font-medium mb-4">Write a Review</h3>
                  <ReviewForm 
                    spotId={spot.id}
                    onReviewSubmitted={handleReviewSubmitted}
                    onCancel={() => setShowReviewForm(false)}
                  />
                </div>
              )}
              
              <div className="bg-muted/30 p-4 rounded-lg border">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{spot.rating.toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">{reviews.length} reviews</div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">5</div>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="bg-yellow-500 h-full w-[65%]"></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">4</div>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="bg-yellow-500 h-full w-[25%]"></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">3</div>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="bg-yellow-500 h-full w-[10%]"></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">2</div>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="bg-yellow-500 h-full w-[0%]"></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">1</div>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="bg-yellow-500 h-full w-[0%]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-full overflow-hidden relative">
                        <Image 
                          src={review.avatar} 
                          alt={review.user}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{review.user}</div>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <div className="flex items-center mr-2">
                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500 mr-1" />
                            {review.rating}
                          </div>
                          <span>{review.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm">{review.text}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="nearby" className="space-y-6">
              <h2 className="text-lg font-semibold">Nearby Spots</h2>
              
              {relatedSpots.length > 0 ? (
                <div className="space-y-4">
                  {relatedSpots.map(relatedSpot => (
                    <SpotCard
                      key={relatedSpot.id}
                      spot={relatedSpot}
                      variant="horizontal"
                      onClick={() => router.push(`/spot/${relatedSpot.id}`)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center p-6 bg-muted/30 border rounded-lg">
                  <p className="text-muted-foreground">
                    No nearby spots found.
                  </p>
                </div>
              )}
              
              <div className="flex justify-center pt-4">
                <Button asChild>
                  <Link href="/explore" className="gap-1">
                    Explore More
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
} 