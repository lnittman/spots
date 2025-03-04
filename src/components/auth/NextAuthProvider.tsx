"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";

/**
 * A minimal wrapper around NextAuth's SessionProvider.
 * 
 * This is kept as minimal as possible - we use Zustand for app state,
 * but NextAuth still needs this provider for its internal workings.
 */
export default function NextAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
} 