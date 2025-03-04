"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Check, ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { InterestSelector } from "@/components/interest-selector";
import { Input } from "@/components/ui/input";
import { Interest } from "@/components/interest-selector";

// Create a subset of common interests to use in our component
const commonInterests: Interest[] = [
  { id: "coffee", name: "Coffee", emoji: "☕", color: "#4ECDC4" },
  { id: "food", name: "Food", emoji: "🍽️", color: "#FF6B6B" },
  { id: "shopping", name: "Shopping", emoji: "🛍️", color: "#FFD166" },
  { id: "art", name: "Art", emoji: "🎨", color: "#FFD166" },
  { id: "music", name: "Music", emoji: "🎵", color: "#FF6B6B" },
  { id: "nature", name: "Nature", emoji: "🌿", color: "#AAC789" },
  { id: "tech", name: "Tech", emoji: "💻", color: "#4ECDC4" },
  { id: "sports", name: "Sports", emoji: "⚽", color: "#4ECDC4" },
  { id: "reading", name: "Reading", emoji: "📚", color: "#4ECDC4" },
];

// Log analytics data for LIM pipeline improvement
function logAnalyticsData(data: any) {
  // In a real app, this would send the data to an analytics endpoint
  console.log("Analytics data:", data);
  
  // For demo, we'll store in localStorage
  try {
    // Get existing logs
    const existingLogs = localStorage.getItem("onboarding-analytics-logs");
    const logs = existingLogs ? JSON.parse(existingLogs) : [];
    
    // Add new log
    logs.push({
      ...data,
      timestamp: new Date().toISOString()
    });
    
    // Store back in localStorage (limit to last 10 entries)
    localStorage.setItem("onboarding-analytics-logs", JSON.stringify(logs.slice(-10)));
  } catch (error) {
    console.error("Error logging analytics data:", error);
  }
}

export default function OnboardingPage() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedInterestDetails, setSelectedInterestDetails] = useState<Interest[]>([]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [userLocation, setUserLocation] = useState("San Francisco");
  const [detectedLocation, setDetectedLocation] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(true);
  
  // Detect user's location on mount (simulated)
  useEffect(() => {
    const detectLocation = async () => {
      try {
        // In production, this would use geolocation API + reverse geocoding
        // For demo, we'll simulate a delay and a detected location
        await new Promise(resolve => setTimeout(resolve, 1500));
        const detected = "San Francisco"; // Simulated result
        setDetectedLocation(detected);
        setUserLocation(detected);
      } catch (error) {
        console.error("Error detecting location:", error);
      } finally {
        setLoadingLocation(false);
      }
    };
    
    detectLocation();
  }, []);

  // Animation effect when component mounts
  useEffect(() => {
    setAnimate(true);
  }, []);

  const handleInterestChange = (interests: string[]) => {
    setSelectedInterests(interests);
    
    // Find the full interest details for the selected interests
    const interestDetails = interests.map(id => {
      return commonInterests.find((interest: Interest) => interest.id === id) || { id, name: id, emoji: "🔍" };
    }).filter(Boolean) as Interest[];
    
    setSelectedInterestDetails(interestDetails);
    
    // Log the selection for analytics
    logAnalyticsData({
      type: "interest_selection",
      action: "select",
      location: userLocation,
      interests,
      selected_count: interests.length
    });
  };

  const handleNext = async () => {
    if (step === 1) {
      if (selectedInterests.length === 0) {
        return; // Require at least one interest
      }
      
      // Log the completion of step 1
      logAnalyticsData({
        type: "onboarding_progress",
        action: "step_complete",
        step: 1,
        location: userLocation,
        selected_interests: selectedInterests
      });
      
      setAnimate(false);
      
      // Small delay before changing step for animation
      setTimeout(() => {
        setStep(2);
        setAnimate(true);
      }, 300);
      
      return;
    }

    if (step === 2) {
      setLoading(true);
      
      try {
        // Log the onboarding completion
        logAnalyticsData({
          type: "onboarding_complete",
          timestamp: new Date().toISOString(),
          location: userLocation,
          selected_interests: selectedInterests,
          interest_details: selectedInterestDetails
        });
        
        // Save interests to the database via API
        const response = await fetch('/api/user/interests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            interests: selectedInterests,
            location: userLocation
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to save interests');
        }
        
        // Also set a cookie as a fallback for middleware
        document.cookie = "onboarding-complete=true; path=/; max-age=31536000"; // 1 year
        
        // Redirect to the dashboard
        window.location.href = "/dashboard";
      } catch (error) {
        console.error("Error saving interests:", error);
        setLoading(false);
      }
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLocation = e.target.value;
    setUserLocation(newLocation);
    
    // Log the location change for analytics
    logAnalyticsData({
      type: "location_change",
      action: "manual_input",
      location: newLocation
    });
  };

  const handleUseDetectedLocation = () => {
    setUserLocation(detectedLocation);
    
    // Log the use of detected location for analytics
    logAnalyticsData({
      type: "location_change",
      action: "use_detected",
      location: detectedLocation
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex justify-center py-3 relative">
          {step > 1 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1 absolute left-4" 
              onClick={() => {
                setAnimate(false);
                setTimeout(() => {
                  setStep(1);
                  setAnimate(true);
                  
                  // Log going back to step 1
                  logAnalyticsData({
                    type: "onboarding_progress",
                    action: "step_back",
                    from_step: 2,
                    to_step: 1
                  });
                }, 300);
              }}
              disabled={loading}
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          <div className="flex items-center">
            <span className="mr-2">🗺️</span>
            <h1 className="font-semibold text-xl tracking-tight">Spots</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 container max-w-4xl py-6 px-4 sm:py-10">
        <div className="max-w-2xl mx-auto">
          <div 
            className={`bg-background rounded-lg border p-6 shadow-sm transition-all duration-500 ${
              animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <div className="space-y-1 sm:space-y-2 mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome to Spots</h1>
              <p className="text-muted-foreground text-sm">
                Let's personalize your experience by understanding your interests
              </p>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between items-center">
                <div className="font-medium text-sm">Step {step} of 2</div>
                <div className="text-xs text-muted-foreground">
                  {step === 1 ? "Select interests" : "Review and confirm"}
                </div>
              </div>
              <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all duration-500 ease-in-out"
                  style={{ width: `${(step / 2) * 100}%` }}
                ></div>
              </div>
            </div>

            {step === 1 && (
              <div className={`mt-4 space-y-6 transition-all duration-300 ${
                animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4">
                    <div className="flex-grow space-y-1">
                      <label htmlFor="location" className="text-sm font-medium text-muted-foreground">Your location</label>
                      <Input
                        id="location"
                        type="text"
                        value={userLocation}
                        onChange={handleLocationChange}
                        placeholder="Enter your city"
                        className="w-full"
                      />
                    </div>
                    {loadingLocation ? (
                      <div className="self-center sm:self-end text-xs text-muted-foreground flex items-center gap-1 h-9 sm:mb-0.5">
                        <div className="w-3 h-3 rounded-full border-2 border-t-transparent border-primary animate-spin"></div>
                        Detecting location...
                      </div>
                    ) : detectedLocation ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-9 self-start sm:self-end text-xs"
                        onClick={handleUseDetectedLocation}
                      >
                        Use detected: {detectedLocation}
                      </Button>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-base font-semibold">What are you interested in?</h2>
                  <p className="text-muted-foreground text-xs">
                    Select up to 5 interests to help us recommend places you'll love. These are tailored to {userLocation}.
                  </p>
                </div>

                <InterestSelector 
                  selectedInterests={selectedInterests}
                  onInterestChange={handleInterestChange}
                  maxSelections={5}
                  location={userLocation}
                  className="py-2"
                />

                <div className="pt-2">
                  <Button 
                    onClick={handleNext} 
                    disabled={selectedInterests.length === 0}
                    className="w-full gap-1"
                    size="default"
                  >
                    Continue <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className={`mt-4 space-y-5 transition-all duration-300 ${
                animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}>
                <div className="space-y-1">
                  <h2 className="text-base font-semibold">Almost there!</h2>
                  <p className="text-muted-foreground text-xs">
                    We'll use these interests to recommend places in {userLocation} that match your preferences
                  </p>
                </div>

                <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-3">
                  <div className="font-medium text-sm flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    Your selected interests
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedInterestDetails.length > 0 ? (
                      selectedInterestDetails.map(interest => (
                        <div 
                          key={interest.id} 
                          className={`bg-[${interest.color || "#4ECDC4"}]/10 text-[${interest.color || "#4ECDC4"}] px-3 py-1 rounded-full text-sm flex items-center gap-1`}
                        >
                          <span className="mr-1">{interest.emoji}</span>
                          <span>{interest.name}</span>
                          {interest.trending && <span className="ml-1 text-[#FF6B6B]">↑</span>}
                        </div>
                      ))
                    ) : (
                      selectedInterests.map(interest => (
                        <div 
                          key={interest} 
                          className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-1"
                        >
                          <span>{interest}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={handleNext} 
                    disabled={loading}
                    className="w-full gap-1"
                    size="lg"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin"></span>
                        Setting up your profile...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        Complete Setup <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>Already have an account? <Link href="/login" className="text-primary hover:underline">Sign in</Link></p>
          </div>
        </div>
      </main>
    </div>
  );
} 