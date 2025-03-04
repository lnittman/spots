import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import NextAuthProvider from "@/components/auth/NextAuthProvider";
import { AuthSync } from "@/components/auth/AuthSync";

import "@/styles/globals.css";

import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: {
    default: "Spots - Discover Places That Interest You",
    template: "%s | Spots"
  },
  description: "Discover spots in your city that match your interests, curated by AI.",
  keywords: ["spots", "discovery", "interests", "ai", "travel", "food", "attractions", "personalized"],
  creator: "Spots Team",
  authors: [
    {
      name: "Spots Team",
      url: "https://spots.app"
    }
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090B" }
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Log when the layout component renders
  console.log("[LAYOUT] Rendering RootLayout component");
  
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background antialiased",
        )}
      >
        <NextAuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* Sync NextAuth session with our store */}
            <AuthSync />
            
            {children}
            <Toaster />
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
} 