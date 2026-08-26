"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { CapacitorProvider } from "@/components/native/CapacitorProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <CapacitorProvider>
          {children}
        </CapacitorProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
