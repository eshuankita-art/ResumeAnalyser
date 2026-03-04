import { z } from "zod";
import fs from "node:fs";
import path from "node:path";

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

// #region agent log
fetch("http://127.0.0.1:7669/ingest/ed35a363-b5ac-4ce7-a1e6-702928801c4f", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Debug-Session-Id": "85d3b0"
  },
  body: JSON.stringify({
    sessionId: "85d3b0",
    runId: "pre-fix",
    hypothesisId: "H_ENV",
    location: "lib/env.ts:31-36",
    message: "serverEnv initialized",
    data: {
      hasOpenAi: !!process.env.OPENAI_API_KEY,
      hasDb: !!process.env.DATABASE_URL,
      hasPostgres: !!process.env.POSTGRES_URL,
      hasBlob: !!process.env.BLOB_READ_WRITE_TOKEN
    },
    timestamp: Date.now()
  })
}).catch(() => {});
try {
  const logLine = JSON.stringify({
    sessionId: "85d3b0",
    runId: "pre-fix",
    hypothesisId: "H_ENV_FS",
    location: "lib/env.ts:30-36",
    message: "serverEnv initialized (fs)",
    data: {
      hasOpenAi: !!process.env.OPENAI_API_KEY,
      hasDb: !!process.env.DATABASE_URL,
      hasPostgres: !!process.env.POSTGRES_URL,
      hasBlob: !!process.env.BLOB_READ_WRITE_TOKEN
    },
    timestamp: Date.now()
  });
  const logPath = path.join(process.cwd(), ".cursor", "debug-85d3b0.log");
  fs.appendFileSync(logPath, `${logLine}\n`, { encoding: "utf8" });
} catch {
  // ignore fs logging errors
}
// #endregion

