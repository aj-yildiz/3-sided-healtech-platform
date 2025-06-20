"use client";
import { AuthProvider } from "@/contexts/auth-context";
import { ClientLayoutWrapper } from "@/components/client-layout-wrapper";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

export default function DebugClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
} 