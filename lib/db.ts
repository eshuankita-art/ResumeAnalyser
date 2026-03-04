import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface ResumeRow {
  id: string;
  user_id: string;
  file_url: string;
  parsed_text: string;
  ai_score: number | null;
  ai_feedback: unknown | null;
  created_at: string;
}

export async function findUserByEmail(email: string) {
  const rows = await sql`SELECT id, email, password_hash, created_at FROM users WHERE email = ${email} LIMIT 1`;
  return (rows[0] as UserRow | undefined) ?? null;
}

export async function createUser(email: string, passwordHash: string) {
  const rows = await sql`INSERT INTO users (email, password_hash) VALUES (${email}, ${passwordHash}) RETURNING id, email, password_hash, created_at`;
  const user = rows[0] as UserRow;
  await sql`INSERT INTO profiles (id) VALUES (${user.id})`;
  return user;
}

export async function insertResume(params: {
  userId: string;
  fileUrl: string;
  parsedText: string;
}) {
  const rows = await sql`INSERT INTO resumes (user_id, file_url, parsed_text) VALUES (${params.userId}, ${params.fileUrl}, ${params.parsedText}) RETURNING *`;
  return rows[0] as ResumeRow;
}

export async function getLatestResumeForUser(userId: string) {
  const rows = await sql`SELECT * FROM resumes WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 1`;
  return (rows[0] as ResumeRow | undefined) ?? null;
}

export async function getResumeByIdForUser(resumeId: string, userId: string) {
  const rows = await sql`SELECT * FROM resumes WHERE id = ${resumeId} AND user_id = ${userId} LIMIT 1`;
  return (rows[0] as ResumeRow | undefined) ?? null;
}

export async function updateResumeAnalysis(params: {
  resumeId: string;
  userId: string;
  aiScore: number;
  aiFeedback: unknown;
}) {
  const feedbackJson = JSON.stringify(params.aiFeedback);
  const rows = await sql`UPDATE resumes SET ai_score = ${params.aiScore}, ai_feedback = ${feedbackJson}::jsonb WHERE id = ${params.resumeId} AND user_id = ${params.userId} RETURNING *`;
  return (rows[0] as ResumeRow | undefined) ?? null;
}
