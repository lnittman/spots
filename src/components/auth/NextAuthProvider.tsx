"use client";

import { SessionProvider } from "next-auth/react";

/**
 * A wrapper around NextAuth's SessionProvider.
 * This component is needed for the client-side authentication to work.
 * It should be placed near the root of your app, such as in layout.tsx.
 */
export default function NextAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
} 