"use client";

import { SessionProvider } from "next-auth/react";
//Wrapping children in SessionProvider
export default function AuthProvider({
  children
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
