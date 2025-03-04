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
          className="container space-y-6 py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8"
        >
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold leading-[1.1] md:text-4xl lg:text-5xl">
              Features
            </h2>
            <p className="max-w-[95%] sm:max-w-[85%] leading-normal text-white/60 text-sm sm:text-base md:text-lg sm:leading-7">
              Discover the powerful features that make Spots your perfect companion for place discovery
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:gap-6 py-4 sm:py-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-white/5 bg-white/3 p-4 sm:p-6">
              <div className="mb-3 sm:mb-4 text-[#4ECDC4]/80">
                <Icon name="Star" size="xl" weight="duotone" />
              </div>
              <h3 className="mb-2 text-lg sm:text-xl font-bold">Personalized Recommendations</h3>
              <p className="text-white/60 text-sm sm:text-base">
                Get place recommendations based on your unique interests and preferences.
              </p>
            </div>
            <div className="rounded-lg border border-white/5 bg-white/3 p-4 sm:p-6">
              <div className="mb-3 sm:mb-4 text-[#AAC789]/80">
                <Icon name="ChatCircleText" size="xl" weight="duotone" />
              </div>
              <h3 className="mb-2 text-lg sm:text-xl font-bold">Natural Language Search</h3>
              <p className="text-white/60 text-sm sm:text-base">
                Ask for recommendations in natural language, just like chatting with a friend.
              </p>
            </div>
            <div className="rounded-lg border border-white/5 bg-white/3 p-4 sm:p-6">
              <div className="mb-3 sm:mb-4 text-[#FF6B6B]/80">
                <Icon name="Lightbulb" size="xl" weight="duotone" />
              </div>
              <h3 className="mb-2 text-lg sm:text-xl font-bold">Contextual Awareness</h3>
              <p className="text-white/60 text-sm sm:text-base">
                Get recommendations based on time, weather, and your current location.
              </p>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section id="cta" className="container py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-3 sm:gap-4 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold leading-[1.1] md:text-4xl lg:text-5xl">
              Ready to discover amazing places?
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