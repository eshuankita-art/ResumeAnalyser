import { sql } from "@vercel/postgres";

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
  const { rows } =
    await sql<UserRow>`select id, email, password_hash, created_at from users where email = ${email} limit 1`;
  return rows[0] ?? null;
}

export async function createUser(email: string, passwordHash: string) {
  const { rows } =
    await sql<UserRow>`insert into users (email, password_hash) values (${email}, ${passwordHash}) returning id, email, password_hash, created_at`;
  const user = rows[0];
  await sql`insert into profiles (id) values (${user.id})`;
  return user;
}

export async function insertResume(params: {
  userId: string;
  fileUrl: string;
  parsedText: string;
}) {
  const { rows } =
    await sql<ResumeRow>`insert into resumes (user_id, file_url, parsed_text) values (${params.userId}, ${params.fileUrl}, ${params.parsedText}) returning *`;
  return rows[0];
}

export async function getLatestResumeForUser(userId: string) {
  const { rows } =
    await sql<ResumeRow>`select * from resumes where user_id = ${userId} order by created_at desc limit 1`;
  return rows[0] ?? null;
}

export async function getResumeByIdForUser(resumeId: string, userId: string) {
  const { rows } =
    await sql<ResumeRow>`select * from resumes where id = ${resumeId} and user_id = ${userId} limit 1`;
  return rows[0] ?? null;
}

export async function updateResumeAnalysis(params: {
  resumeId: string;
  userId: string;
  aiScore: number;
  aiFeedback: unknown;
}) {
  const { rows } =
    await sql<ResumeRow>`update resumes set ai_score = ${params.aiScore}, ai_feedback = ${params.aiFeedback} where id = ${params.resumeId} and user_id = ${params.userId} returning *`;
  return rows[0] ?? null;
}

