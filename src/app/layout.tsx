import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

import "@/styles/globals.css";

export const metadata = {
  title: "Spots - Discover Amazing Places",
  description: "Discover and explore amazing places with AI-powered recommendations tailored to your interests.",
  keywords: ["location discovery", "travel", "recommendations", "places", "AI"],
  authors: [{ name: "Spots Team" }],
  creator: "Spots Team",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://spots.app"),
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: "Spots - Discover Amazing Places",
    description: "Discover and explore amazing places with AI-powered recommendations tailored to your interests.",
    siteName: "Spots",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Spots - Discover Amazing Places",
    description: "Discover and explore amazing places with AI-powered recommendations tailored to your interests.",
    images: ["/og-image.jpg"],
    creator: "@spotsapp",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#171717" },
  ],
  manifest: "/manifest.json",
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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
} 