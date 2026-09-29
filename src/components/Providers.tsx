'use client';

import { SessionProvider } from "next-auth/react";
import { SalesProvider } from "@/lib/salesContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SalesProvider>
        {children}
      </SalesProvider>
    </SessionProvider>
  );
}
