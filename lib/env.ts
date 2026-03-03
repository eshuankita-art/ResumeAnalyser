import { z } from "zod";

const serverEnvSchema = z.object({
  OPENAI_API_KEY: z
    .string()
    .min(1, "OPENAI_API_KEY is required for AI resume analysis"),
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required for Vercel Postgres")
    .optional(),
  POSTGRES_URL: z
    .string()
    .min(1, "POSTGRES_URL is required for Vercel Postgres")
    .optional(),
  NEXTAUTH_SECRET: z
    .string()
    .min(1, "NEXTAUTH_SECRET is required for NextAuth"),
  NEXTAUTH_URL: z
    .string()
    .min(1, "NEXTAUTH_URL is required for NextAuth")
    .optional(),
  BLOB_READ_WRITE_TOKEN: z
    .string()
    .min(1, "BLOB_READ_WRITE_TOKEN is required for Vercel Blob uploads")
    .optional()
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export const serverEnv: ServerEnv = serverEnvSchema.parse({
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  DATABASE_URL: process.env.DATABASE_URL,
  POSTGRES_URL: process.env.POSTGRES_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN
});

