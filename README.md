## AI Resume Analyzer (Vercel Stack)

**Stack**: Next.js 14 (App Router, TypeScript, TailwindCSS), NextAuth (credentials + JWT), Vercel Postgres, Vercel Blob, OpenAI, pdf-parse.

### Features

- **Auth**: Email/password with NextAuth credentials provider, JWT sessions.
- **Protected dashboard**: `/dashboard` requires authentication.
- **Resume upload**: PDF upload to Vercel Blob with 5MB limit and type validation.
- **Parsing**: Extracts text from PDFs using `pdf-parse` (Node runtime).
- **AI analysis**: Uses OpenAI to extract skills, missing skills, score (0–100), suggestions, and ATS feedback; persisted in Postgres.
- **UI**: Clean SaaS-style dashboard with score progress bar, skills/missing skills badges, suggestions list, ATS feedback card, drag-and-drop upload, and toasts.

### Folder structure (key parts)

- `app/`
  - `layout.tsx` — root layout, theme provider, navbar, toaster.
  - `page.tsx` — marketing/landing page.
  - `(auth)/auth/login/page.tsx` — login page.
  - `(auth)/auth/register/page.tsx` — registration page.
  - `(dashboard)/dashboard/page.tsx` — protected dashboard.
  - `(dashboard)/dashboard/actions.ts` — server actions for upload and analysis.
  - `api/auth/[...nextauth]/route.ts` — NextAuth configuration.
  - `api/auth/register/route.ts` — registration endpoint.
- `components/`
  - `navbar.tsx`, `session-provider.tsx`, `theme-provider.tsx`.
  - `resume-upload-card.tsx`, `resume-analysis.tsx`.
  - `ui/*` — button, input, label, card, progress, switch, toaster.
- `lib/`
  - `env.ts` — Zod-validated environment variables.
  - `db.ts` — Vercel Postgres helpers.
  - `auth.ts` — server-side auth helpers using NextAuth `auth()`.
  - `ai.ts` — OpenAI resume analysis with Zod schema and strict JSON.
  - `pdf.ts` — PDF text extraction via `pdf-parse`.
  - `rate-limit.ts` — simple in-memory rate limiting for AI calls.
  - `utils.ts` — Tailwind `cn` helper.
- `db/schema.sql` — Postgres schema for `users`, `profiles`, `resumes`.
- `.env.example` — required environment variables.

### Database (Vercel Postgres)

1. In Vercel, create a **Postgres** database.
2. Connect locally (psql or any Postgres client) using the `DATABASE_URL` provided by Vercel.
3. Apply the schema:

```bash
psql "$DATABASE_URL" -f db/schema.sql
```

This creates:

- `users` (id, email, password_hash, created_at)
- `profiles` (id, created_at)
- `resumes` (id, user_id, file_url, parsed_text, ai_score, ai_feedback, created_at)

### Vercel Blob

1. Enable **Vercel Blob** in your project.
2. Create a read/write token and set it as `BLOB_READ_WRITE_TOKEN` in your environment.
3. PDFs are stored under `resumes/{userId}/{timestamp}-{filename}.pdf` with `access: "private"`.

### OpenAI

1. Create an API key at OpenAI.
2. Set `OPENAI_API_KEY` in your environment.
3. The app uses `gpt-4.1-mini` with `response_format: { type: "json_object" }` and a strict Zod schema.

### NextAuth

1. Generate a random `NEXTAUTH_SECRET` (e.g. `openssl rand -hex 32`) and set it in `.env`.
2. For local development set `NEXTAUTH_URL=http://localhost:3000`.
3. The credentials provider:
   - Looks up users in `users` by email.
   - Verifies passwords using bcrypt hashes.
   - Issues JWT-based sessions with `user.id` attached.

### Environment variables

Copy `.env.example` to `.env.local` and fill in:

```bash
DATABASE_URL=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
OPENAI_API_KEY=...
BLOB_READ_WRITE_TOKEN=...
```

### Running locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

### Deployment (Vercel)

1. Push this repo to GitHub/GitLab/Bitbucket.
2. Import the project in Vercel.
3. Attach your Vercel Postgres database and Blob store.
4. Configure all environment variables in the Vercel dashboard (matching `.env.example`).
5. Deploy. Vercel will run `next build` using the App Router and server actions.

Notes:

- Actions using `pdf-parse` and AI analysis are marked with `runtime = "nodejs"` to ensure Node compatibility.
- Rate limiting is in-memory and scoped per server instance; for stricter limits, move to a shared store (Redis, Upstash, etc.).

