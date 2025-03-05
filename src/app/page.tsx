"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { HomeMap } from "@/components/maps/HomeMap";
import { DynamicFeatures } from "@/components/features/DynamicFeatures";
import { useState } from "react";
import { defaultCities } from "@/lib/cities-data";
import { LocationDropdown } from "@/components/LocationDropdown";
import type { LocationItem } from "@/components/LocationDropdown";

// Convert city data to location items for dropdown
const cityLocations: LocationItem[] = defaultCities.map(city => ({
  id: city.id,
  title: city.name,
  coordinates: city.coordinates,
  emoji: city.emoji,
  trending: city.trending,
  type: city.type
}));

export default function HomePage() {
  // Shared location state
  const [selectedLocation, setSelectedLocation] = useState<LocationItem>(cityLocations[0]);
  
  // Handle location change - will be passed to both location dropdowns
  const handleLocationChange = (location: LocationItem) => {
    setSelectedLocation(location);
    console.log("Location changed to:", location.title);
  };
  
  // Add debug log for vercel deployment
  console.log("Home page rendering");
  
  return (
    <div className="flex min-h-screen flex-col bg-[#050A14] text-white">
      <header className="container z-40 px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between py-4 sm:py-6">
          <div className="flex-1 flex justify-start">
            <Link
              href="/explore"
              className="hidden md:inline-block font-medium transition-colors hover:text-white/80 text-white/60"
            >
              Explore
            </Link>
          </div>
          
          <div className="flex-1 flex justify-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl sm:text-2xl">🗺️</span>
              <span className="font-bold inline-block text-xl sm:text-2xl">Spots</span>
            </Link>
          </div>
          
          <div className="flex-1 flex justify-end">
            <Link
              href="/login"
              className="font-medium text-white/60 transition-colors hover:text-white/80"
            >
              Login
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {/* Hero Section with Map */}
        <section className="py-4 sm:py-6 md:py-8 lg:py-10">
          <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
            {/* Interactive Map */}
            <div className="max-w-[90rem] mx-auto mb-8 sm:mb-12">
              <HomeMap 
                selectedLocation={selectedLocation} 
                onChange={handleLocationChange} 
              />
            </div>
            
            {/* Hero Text */}
            <div className="max-w-[64rem] mx-auto flex flex-col items-center gap-3 sm:gap-4 text-center px-2 sm:px-4">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                Discover amazing places tailored to{" "}
                <span className="text-[#4ECDC4]/80">your interests</span>
              </h1>
              <p className="max-w-[42rem] leading-normal text-white/60 text-sm sm:text-base md:text-xl sm:leading-8">
                Spots uses AI to understand your preferences and recommend the perfect locations.
                From hidden cafes to scenic viewpoints, find your next favorite spot.
              </p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-4 w-full sm:w-auto">
                <Link 
                  href="/onboarding" 
                  className={cn(
                    buttonVariants({ size: "lg", variant: "default" }),
                    "bg-[#4ECDC4]/90 hover:bg-[#4ECDC4] w-full sm:w-auto"
                  )}
                >
                  <Icon name="Compass" className="mr-2" weight="duotone" />
                  Get Started
                </Link>
                <Link 
                  href="/explore" 
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "border-white/10 hover:bg-white/5 w-full sm:w-auto"
                  )}
                >
                  <Icon name="MagnifyingGlass" className="mr-2" weight="duotone" />
                  Explore
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section
          id="features"
          className="w-full py-12 md:py-16 lg:py-20"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <div className="w-full mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold leading-[1.1] md:text-4xl lg:text-5xl">
                Features
              </h2>
              <p className="max-w-[95%] sm:max-w-[85%] leading-normal text-white/60 text-sm sm:text-base md:text-lg sm:leading-7">
                Discover the powerful features that make Spots your perfect companion for place discovery
              </p>
            </div>
            
            {/* Dynamic features component */}
            <DynamicFeatures 
              selectedLocation={selectedLocation}
              onChange={handleLocationChange}
            />
          </div>
        </section>
        
        {/* CTA Section */}
        <section id="cta" className="w-full py-12 md:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <div className="w-full mx-auto flex max-w-[58rem] flex-col items-center gap-3 sm:gap-4 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold leading-[1.1] md:text-4xl lg:text-5xl">
                Ready to discover your spots?
              </h2>
              <p className="max-w-[95%] sm:max-w-[85%] leading-normal text-white/60 text-sm sm:text-base md:text-lg sm:leading-7">
                Create your profile and start getting personalized recommendations today.
              </p>
              <Link 
                href="/onboarding" 
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "mt-4 bg-[#4ECDC4]/90 hover:bg-[#4ECDC4] w-full sm:w-auto max-w-xs"
                )}
              >
                <Icon name="ArrowRight" className="mr-2" weight="duotone" />
                Get Started
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-white/5 py-6 md:py-0 px-4 sm:px-6 lg:px-8">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-xs sm:text-sm text-white/60 md:text-left">
            © {new Date().getFullYear()} Spots. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-xs sm:text-sm text-white/60 underline underline-offset-4">
              Terms
            </Link>
            <Link href="/privacy" className="text-xs sm:text-sm text-white/60 underline underline-offset-4">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
} 