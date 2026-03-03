import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { findUserByEmail } from "@/lib/db";
import { serverEnv } from "@/lib/env";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  csrfToken: z.string().optional()
});

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut
} = NextAuth({
  providers: [
    Credentials({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) {
          return null;
        }
        const { email, password } = parsed.data;

        const user = await findUserByEmail(email);
        if (!user) {
          return null;
        }

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
          return null;
        }

        return { id: user.id, email: user.email };
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  secret: serverEnv.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as any).id = token.id as string;
      }
      return session;
    }
  }
});

export { GET, POST };

