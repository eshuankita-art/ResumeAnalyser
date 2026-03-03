"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const isAuthPage =
    pathname?.startsWith("/auth/login") ||
    pathname?.startsWith("/auth/register");

  return (
    <header className="border-b">
      <div className="container flex h-14 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-semibold tracking-tight">
            AI Resume Analyzer
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Toggle theme"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-background text-sm"
            onClick={() =>
              setTheme(theme === "dark" ? "light" : "dark")
            }
          >
            <Sun className="h-4 w-4 dark:hidden" />
            <Moon className="hidden h-4 w-4 dark:block" />
          </button>
          {status === "loading" ? null : session?.user ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Log out
              </Button>
            </>
          ) : !isAuthPage ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/auth/login">Log in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/auth/register">Get started</Link>
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}

