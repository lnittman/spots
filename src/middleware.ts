import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma"; // Import the shared Prisma instance

// Routes that don't require authentication
const publicRoutes = ["/", "/login", "/register", "/api/auth"];

// Routes that new users are always allowed to access
const newUserRoutes = ["/onboarding"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public routes, static files, and API routes except user-related ones
  if (
    publicRoutes.some(route => pathname.startsWith(route)) ||
    pathname.includes("_next") || 
    pathname.includes("favicon") ||
    (pathname.startsWith("/api") && !pathname.startsWith("/api/user"))
  ) {
    return NextResponse.next();
  }

  // Get the token and verify the user is authenticated
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  // If not authenticated and trying to access a protected route, redirect to login
  if (!token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // First check cookie for backward compatibility
  const onboardingCompleteCookie = request.cookies.get("onboarding-complete");
  let hasCompletedOnboarding = onboardingCompleteCookie?.value === "true";

  // If cookie doesn't confirm onboarding completion, check the database
  if (!hasCompletedOnboarding && token.sub) {
    try {
      // Look up user in database
      const user = await prisma.user.findUnique({
        where: { id: token.sub },
        select: { onboardingComplete: true }
      });
      
      // Update status based on database value
      if (user && user.onboardingComplete) {
        hasCompletedOnboarding = true;
        
        // Set cookie for future requests to avoid database lookup
        const response = NextResponse.next();
        response.cookies.set("onboarding-complete", "true", { 
          path: "/",
          maxAge: 31536000 // 1 year
        });
        
        return response;
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      // Continue with cookie value if database check fails
    }
  }

  // If user hasn't completed onboarding and isn't on the onboarding page, redirect to onboarding
  // Exception: Allow API requests
  if (
    !hasCompletedOnboarding && 
    !newUserRoutes.some(route => pathname.startsWith(route)) && 
    !pathname.startsWith("/api")
  ) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files and api routes
    "/((?!_next/static|_next/image|favicon.ico).*)"
  ],
}; 