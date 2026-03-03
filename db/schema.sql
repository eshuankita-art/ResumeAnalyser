create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key references users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  file_url text not null,
  parsed_text text not null,
  ai_score int,
  ai_feedback jsonb,
  created_at timestamptz not null default now()
);

create index if not exists resumes_user_id_idx on resumes(user_id);

