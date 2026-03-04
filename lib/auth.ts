import { redirect } from "next/navigation";
import { auth } from "@/auth";

export type AuthUser = {
  id: string;
  email?: string | null;
};

export async function requireUser(): Promise<AuthUser> {
  const session = await auth();
  const user = session?.user as AuthUser | undefined;
  if (!user?.id) {
    redirect("/auth/login");
  }
  return user;
}

export async function getOptionalUser(): Promise<AuthUser | null> {
  const session = await auth();
  const user = session?.user as AuthUser | undefined;
  return user ?? null;
}

