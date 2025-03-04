"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin, Loader2, AlertCircle } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof formSchema>;

export default function RegisterPage() {
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    setAuthError(null);

    try {
      // In a real app, you would call an API to register the user
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setAuthError(result.message || "Registration failed. Please try again.");
        setIsLoading(false);
        return;
      }

      // Sign in the user after successful registration
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        setAuthError("Registration successful, but could not sign in automatically. Please try signing in.");
        setIsLoading(false);
        router.push("/login");
        return;
      }

      // Redirect to onboarding after successful sign-in
      router.push("/onboarding");
      router.refresh();
    } catch (error) {
      console.error("Registration error:", error);
      setAuthError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/onboarding" });
    } catch (error) {
      console.error("Google sign-in error:", error);
      setAuthError("Could not sign in with Google. Please try again.");
      setIsLoading(false);
    }
  };

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

      <main className="flex-1 flex flex-col items-center justify-center py-8 sm:py-12 md:py-16 px-4">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white/3 border border-white/5 rounded-lg shadow-sm p-6 sm:p-8">
            <div className="space-y-3 sm:space-y-4 mb-6 text-center">
              <h1 className="text-2xl sm:text-3xl font-bold">Create an account</h1>
              <p className="text-white/60 text-sm sm:text-base max-w-[85%] mx-auto">
                Sign up to start discovering new places
              </p>
            </div>

            {authError && (
              <Alert variant="destructive" className="mb-6 bg-[#FF6B6B]/10 border-[#FF6B6B]/20 text-[#FF6B6B]">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your name"
                          {...field}
                          disabled={isLoading}
                          className="bg-white/5 border-white/10 focus:border-[#4ECDC4]/50 focus:ring-[#4ECDC4]/30 text-white"
                        />
                      </FormControl>
                      <FormMessage className="text-[#FF6B6B]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="name@example.com"
                          type="email"
                          {...field}
                          disabled={isLoading}
                          className="bg-white/5 border-white/10 focus:border-[#4ECDC4]/50 focus:ring-[#4ECDC4]/30 text-white"
                        />
                      </FormControl>
                      <FormMessage className="text-[#FF6B6B]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="••••••••"
                          type="password"
                          {...field}
                          disabled={isLoading}
                          className="bg-white/5 border-white/10 focus:border-[#4ECDC4]/50 focus:ring-[#4ECDC4]/30 text-white"
                        />
                      </FormControl>
                      <FormMessage className="text-[#FF6B6B]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="••••••••"
                          type="password"
                          {...field}
                          disabled={isLoading}
                          className="bg-white/5 border-white/10 focus:border-[#4ECDC4]/50 focus:ring-[#4ECDC4]/30 text-white"
                        />
                      </FormControl>
                      <FormMessage className="text-[#FF6B6B]" />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className={cn(
                    "w-full bg-[#4ECDC4]/90 hover:bg-[#4ECDC4] mt-2"
                  )}
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating account...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </Form>

            <div className="relative my-6">
              <Separator className="bg-white/10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-[#050A14] px-2 text-xs text-white/40">
                  OR CONTINUE WITH
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full border-white/10 hover:bg-white/5 text-white"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              size="lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                className="h-5 w-5 mr-2"
              >
                <path
                  fill="#FFC107"
                  d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
                />
                <path
                  fill="#4CAF50"
                  d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
                />
              </svg>
              Sign up with Google
            </Button>

            <div className="mt-6 text-center text-sm text-white/60">
              <p>
                Already have an account?{" "}
                <Link href="/login" className="text-[#4ECDC4] hover:text-[#4ECDC4]/80 hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
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