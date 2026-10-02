'use client';

import { SessionProvider } from "next-auth/react";
import { SalesProvider } from "@/lib/salesContext";
import { PrivacyProvider } from "@/lib/privacyContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SalesProvider>
        <PrivacyProvider>
          {children}
        </PrivacyProvider>
      </SalesProvider>
    </SessionProvider>
  );
}
