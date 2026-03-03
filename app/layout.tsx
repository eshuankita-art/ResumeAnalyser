import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/navbar";
import { SessionProviderWrapper } from "@/components/session-provider";

export const metadata: Metadata = {
  title: "AI Resume Analyzer",
  description: "AI-powered resume analyzer with structured feedback"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased")}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SessionProviderWrapper>
            <Navbar />
            <main className="container py-8">{children}</main>
            <Toaster />
          </SessionProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}

