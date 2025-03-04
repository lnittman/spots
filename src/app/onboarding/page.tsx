"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { InterestSelector } from "@/components/interest-selector";

export default function OnboardingPage() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleInterestChange = (interests: string[]) => {
    setSelectedInterests(interests);
  };

  const handleNext = async () => {
    if (step === 1) {
      if (selectedInterests.length === 0) {
        return; // Require at least one interest
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      setLoading(true);
      
      // In a real app, you would save the user's interests to the database here
      // For demo purposes, we're just simulating a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Redirect to the dashboard
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <header className="border-b bg-background h-16 flex items-center px-4 md:px-6">
        <div className="container flex justify-center">
          <Link href="/" className="font-bold text-xl">Spots</Link>
        </div>
      </header>
      
      <main className="flex-1 py-12">
        <div className="container max-w-3xl">
          <div className="bg-background rounded-lg border shadow-sm p-6 md:p-8">
            <div className="space-y-2 mb-6">
              <h1 className="text-3xl font-bold">Welcome to Spots</h1>
              <p className="text-muted-foreground">
                Let's personalize your experience by understanding your interests
              </p>
            </div>

            <div className="space-y-2 mb-1">
              <div className="flex justify-between items-center">
                <div className="font-medium">Step {step} of 2</div>
                <div className="text-sm text-muted-foreground">
                  {step === 1 ? "Select interests" : "Review and confirm"}
                </div>
              </div>
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all duration-300 ease-in-out"
                  style={{ width: `${(step / 2) * 100}%` }}
                ></div>
              </div>
            </div>

            {step === 1 && (
              <div className="mt-8 space-y-6">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">What are you interested in?</h2>
                  <p className="text-muted-foreground">
                    Select your interests to help us recommend places you'll love
                  </p>
                </div>

                <InterestSelector 
                  selectedInterests={selectedInterests}
                  onInterestChange={handleInterestChange}
                  maxSelections={5}
                />

                <div className="flex justify-end">
                  <Button 
                    onClick={handleNext} 
                    disabled={selectedInterests.length === 0}
                    className="gap-1"
                  >
                    Continue <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="mt-8 space-y-6">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">Confirm your interests</h2>
                  <p className="text-muted-foreground">
                    We'll use these to recommend places that match your preferences
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="font-medium">Your selected interests</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedInterests.map(interest => (
                      <div 
                        key={interest} 
                        className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                      >
                        {interest}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    disabled={loading}
                  >
                    Back
                  </Button>
                  
                  <Button 
                    onClick={handleNext} 
                    disabled={loading}
                    className="gap-1"
                  >
                    {loading ? "Setting up your profile..." : "Complete Setup"}
                    {!loading && <ArrowRight className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 