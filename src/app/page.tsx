import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { HomeMap } from "@/components/maps/HomeMap";

export default function HomePage() {
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
              <HomeMap />
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
          className="container mx-auto space-y-6 py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8"
        >
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold leading-[1.1] md:text-4xl lg:text-5xl">
              Features
            </h2>
            <p className="max-w-[95%] sm:max-w-[85%] leading-normal text-white/60 text-sm sm:text-base md:text-lg sm:leading-7">
              Discover the powerful features that make Spots your perfect companion for place discovery
            </p>
          </div>

          {/* Feature Cards Container */}
          <div className="mx-auto grid justify-items-center max-w-6xl grid-cols-1 gap-8 sm:gap-10 py-6 sm:py-8 lg:grid-cols-3">
            {/* Personalized Recommendations Feature */}
            <div className="rounded-lg border border-white/5 bg-white/3 p-4 sm:p-6 flex flex-col items-center text-center w-full max-w-md hover:bg-white/5 transition-all duration-300">
              <div className="mb-3 sm:mb-4 text-[#4ECDC4]/80">
                <Icon name="Star" size="xl" weight="duotone" />
              </div>
              <h3 className="mb-2 text-lg sm:text-xl font-bold">Personalized Recommendations</h3>
              <p className="text-white/60 text-sm sm:text-base mb-4">
                Get place recommendations based on your unique interests and preferences.
              </p>
              
              {/* Component Showcase - Personalized Recommendations */}
              <div className="w-full mt-2 mb-4 p-3 bg-[#0A121F] rounded-lg border border-white/10">
                <div className="flex flex-wrap gap-2 mb-3">
                  <div className="px-2.5 py-1 bg-[#4ECDC4]/20 text-[#4ECDC4] rounded-full text-xs flex items-center gap-1">
                    <span>☕</span> Coffee
                  </div>
                  <div className="px-2.5 py-1 bg-[#AAC789]/20 text-[#AAC789] rounded-full text-xs flex items-center gap-1">
                    <span>🥾</span> Hiking
                  </div>
                  <div className="px-2.5 py-1 bg-[#FF6B6B]/20 text-[#FF6B6B] rounded-full text-xs flex items-center gap-1">
                    <span>🌳</span> Nature
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="p-2 bg-white/5 rounded flex gap-3 items-center">
                    <div className="w-8 h-8 flex-shrink-0 bg-[#4ECDC4]/20 rounded-md flex items-center justify-center text-lg">☕</div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium">Ritual Coffee Roasters</div>
                      <div className="text-xs text-white/50">Specialty coffee with minimalist decor</div>
                    </div>
                  </div>
                  <div className="p-2 bg-white/5 rounded flex gap-3 items-center">
                    <div className="w-8 h-8 flex-shrink-0 bg-[#AAC789]/20 rounded-md flex items-center justify-center text-lg">🥾</div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium">Runyon Canyon Park</div>
                      <div className="text-xs text-white/50">Popular hiking with panoramic views</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Natural Language Search Feature */}
            <div className="rounded-lg border border-white/5 bg-white/3 p-4 sm:p-6 flex flex-col items-center text-center w-full max-w-md hover:bg-white/5 transition-all duration-300">
              <div className="mb-3 sm:mb-4 text-[#AAC789]/80">
                <Icon name="ChatCircleText" size="xl" weight="duotone" />
              </div>
              <h3 className="mb-2 text-lg sm:text-xl font-bold">Natural Language Search</h3>
              <p className="text-white/60 text-sm sm:text-base mb-4">
                Ask for recommendations in natural language, just like chatting with a friend.
              </p>
              
              {/* Component Showcase - Natural Language Search */}
              <div className="w-full mt-2 mb-4 p-3 bg-[#0A121F] rounded-lg border border-white/10">
                <div className="flex mb-3 p-2 bg-white/5 rounded-lg">
                  <div className="text-sm text-left text-white/80">
                    Find me cozy coffee shops in LA with outdoor seating
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="p-2 bg-white/5 rounded flex gap-3 items-center">
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium">Verve Coffee Roasters</div>
                      <div className="text-xs text-white/50">Stylish cafe with spacious patio</div>
                    </div>
                  </div>
                  <div className="p-2 bg-white/5 rounded flex gap-3 items-center">
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium">Intelligentsia Coffee</div>
                      <div className="text-xs text-white/50">Upscale coffeehouse with outdoor tables</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contextual Awareness Feature */}
            <div className="rounded-lg border border-white/5 bg-white/3 p-4 sm:p-6 flex flex-col items-center text-center w-full max-w-md hover:bg-white/5 transition-all duration-300">
              <div className="mb-3 sm:mb-4 text-[#FF6B6B]/80">
                <Icon name="Lightbulb" size="xl" weight="duotone" />
              </div>
              <h3 className="mb-2 text-lg sm:text-xl font-bold">Contextual Awareness</h3>
              <p className="text-white/60 text-sm sm:text-base mb-4">
                Get recommendations based on time, weather, and your current location.
              </p>
              
              {/* Component Showcase - Contextual Awareness */}
              <div className="w-full mt-2 mb-4 p-3 bg-[#0A121F] rounded-lg border border-white/10">
                <div className="flex justify-between items-center mb-3 p-2 bg-white/5 rounded-lg">
                  <div className="text-xs text-white/60">Saturday, 6:30 PM</div>
                  <div className="text-xs text-white/60 flex items-center gap-1">
                    <span>🌤️</span> 72°F
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="p-2 bg-white/5 rounded flex gap-3 items-start">
                    <div className="w-8 h-8 flex-shrink-0 bg-[#FF6B6B]/20 rounded-md flex items-center justify-center text-lg mt-1">🍽️</div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium">Dinner Suggestions Nearby</div>
                      <div className="text-xs text-white/50 mb-1">Perfect for warm evening dining</div>
                      <div className="text-xs font-medium text-[#FF6B6B]/80">Bestia, Grand Central Market</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section id="cta" className="container py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-3 sm:gap-4 text-center">
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