# SafeSteps Level 2 — Production Deployment Guide (Vercel + Supabase)

This document provides exact, step-by-step instructions for deploying SafeSteps Level 2 to **Vercel** with a **production Supabase** database.

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:
- [x] A [Supabase](https://supabase.com/) account and a new production project.
- [x] A [Vercel](https://vercel.com/) account.
- [x] A [Google AI Studio](https://aistudio.google.com/) API Key (for Gemini).
- [ ] *(Optional)* A [Groq Console](https://console.groq.com/) API Key (for primary high-speed inference).
- [x] Verified local quality gates pass:
  ```bash
  npm run build     # Must compile with zero errors
  npm run lint      # Must exit code 0
  npm test          # All 19 test files / 226 tests must pass
  npm run check-i18n# Exactly 216 identical keys across en, ta, hi
  ```

---

## Step 1: Run SQL Migrations in Production Supabase

1. Open your production project in the [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to the **SQL Editor** (icon `>_` in the left sidebar).
3. Click **New query** and run the following two migration scripts in sequential order:

### 1.1 First Migration: SafeSteps Core Schema
Open [supabase/migrations/20261126000000_create_safesteps_schema.sql](file:///d:/My%20Project/Safe%20Steps/supabase/migrations/20261126000000_create_safesteps_schema.sql), copy its full contents, paste into the SQL editor, and click **Run**.

**What this sets up:**
- Extensions: `uuid-ossp` and `vector` (pgvector 768-dimension support).
- Tables: `profiles`, `conversations`, `messages`, `reports`, `report_values`, `kb_documents`, `kb_chunks`, `audit_logs`.
- Indexes: Foreign key indexes, semantic search HNSW index (`idx_kb_chunks_embedding`).
- Row Level Security (RLS): Strict tenant isolation for every table preventing cross-user data access.
- Automation triggers: Auto-updating `updated_at` timestamps, audit log triggers.

### 1.2 Second Migration: Conversation Summary Cache
Open [supabase/migrations/20261126000001_add_conversation_summary.sql](file:///d:/My%20Project/Safe%20Steps/supabase/migrations/20261126000001_add_conversation_summary.sql), copy its contents, paste into the SQL editor, and click **Run**:
```sql
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS summary jsonb;
```

### 1.3 Verify Database Tables
Go to **Table Editor** in the Supabase Dashboard. Confirm the following 8 tables are present with green RLS badges:
- `profiles` (RLS active)
- `conversations` (RLS active)
- `messages` (RLS active)
- `reports` (RLS active)
- `report_values` (RLS active)
- `kb_documents` (RLS active)
- `kb_chunks` (RLS active)
- `audit_logs` (RLS active)

---

## Step 2: Configure Supabase Authentication & Redirect URLs

1. In the Supabase Dashboard, navigate to **Authentication** (left sidebar) -> **URL Configuration**.
2. Set the **Site URL** to your production Vercel domain:
   ```text
   https://<your-project>.vercel.app
   ```
3. In **Redirect URLs**, click **Add URL** and add each of the following:
   ```text
   https://<your-project>.vercel.app/**
   https://<your-project>.vercel.app/auth/callback
   https://<your-project>.vercel.app/login
   https://<your-project>.vercel.app/reset-password
   https://<your-project>.vercel.app/consent
   http://localhost:3000/**
   ```
4. Click **Save**.
5. *(Optional)* Under **Authentication** -> **Email Templates**, customize the sender name to `SafeSteps Health Portal` and ensure email confirmation is enabled or configured as required.

---

## Step 3: Configure Environment Variables in Vercel

1. In the [Vercel Dashboard](https://vercel.com/dashboard), select your project (or import the repository).
2. Go to **Settings** -> **Environment Variables**.
3. Add the following variables across **Production**, **Preview**, and **Development** environments:

| Variable Name | Description | Example / Value Source | Secret? |
| :--- | :--- | :--- | :---: |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | `https://xyzprojectref.supabase.co`<br>*(From Supabase Settings > API)* | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anonymous Key (subject to RLS) | `eyJhbGciOi...`<br>*(From Supabase Settings > API)* | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Secret (Bypasses RLS) | `eyJhbGciOi...`<br>*(From Supabase Settings > API > service_role)* | **YES (Server-only)** |
| `GEMINI_API_KEY` | Google Gemini API Key | `AIzaSy...`<br>*(From Google AI Studio)* | **YES (Server-only)** |
| `GEMINI_MODEL` | Gemini Model Identifier | `gemini-3.5-flash` | Public |
| `GEMINI_EMBEDDING_MODEL` | Gemini Embedding Model Identifier | `text-embedding-004` | Public |
| `GROQ_API_KEY` *(Optional)* | Groq Primary Inference API Key | `gsk_...`<br>*(From Groq Console)* | **YES (Server-only)** |
| `GROQ_MODEL` *(Optional)* | Groq Model Identifier | `openai/gpt-oss-120b` | Public |

> [!CAUTION]
> **Never prefix `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, or `GROQ_API_KEY` with `NEXT_PUBLIC_`.**  
> `SUPABASE_SERVICE_ROLE_KEY` has full administrative database access and must never leak into client bundles.

---

## Step 4: Run Knowledge Base Ingestion Once Against Production

SafeSteps uses pgvector semantic search over verified clinical guidelines (stored in `knowledge/`). Seed the production database once:

### Method A: Using Command-Line Environment Overrides
```bash
NEXT_PUBLIC_SUPABASE_URL="https://<your-production-ref>.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="<your-production-service-role-key>" \
GEMINI_API_KEY="<your-gemini-api-key>" \
GEMINI_EMBEDDING_MODEL="text-embedding-004" \
npx tsx scripts/ingest-kb.ts
```

### Method B: Using Windows PowerShell
```powershell
$env:NEXT_PUBLIC_SUPABASE_URL="https://<your-production-ref>.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="<your-production-service-role-key>"
$env:GEMINI_API_KEY="<your-gemini-api-key>"
$env:GEMINI_EMBEDDING_MODEL="text-embedding-004"
npx tsx scripts/ingest-kb.ts
```

**Verification:**  
The terminal output will show documents parsed, 768-dimensional embeddings generated with `text-embedding-004`, and chunks upserted into `kb_documents` and `kb_chunks`. Confirm in the Supabase Table Editor that rows exist in `kb_chunks`.

---

## Step 5: Deploy to Vercel

### Method A: Git Push (Recommended)
If your repository is connected to Vercel via GitHub:
```bash
git checkout level-2
git push origin level-2:main
```
Vercel will automatically trigger a production build using Next.js Turbopack.

### Method B: Vercel CLI
If deploying via command line:
```bash
# 1. Login to Vercel CLI (if not already logged in)
vercel login

# 2. Link local directory to Vercel project
vercel link

# 3. Pull environment variables to verify synchronization
vercel env pull .env.production.local

# 4. Trigger production deployment
vercel --prod
```

---

## Step 6: Post-Deployment Smoke Test Checklist

Execute this checklist on the live deployment URL (`https://<your-project>.vercel.app`) to verify end-to-end clinical and technical integrity:

### 1. Account & Consent Flow
- [ ] **Sign Up (`/signup`)**: Register a throwaway test account (`test-smoke@example.com`). Check that confirmation works or user is redirected to `/consent`.
- [ ] **Consent Gate (`/consent`)**: Attempt to navigate to `/chat` or `/profile` directly. Confirm middleware forces redirect back to `/consent`. Check all mandatory consent boxes, set personalisation to ON, and submit. Confirm redirect to `/profile` or `/chat`.
- [ ] **Profile Save (`/profile`)**: Fill in age (32), sex, height, weight, allergies ("Penicillin"), and conditions ("Asthma"). Click "Save profile". Verify toast notification and database persistence.

### 2. Clinical Chat & Triage
- [ ] **Conversation Persistence (`/chat`)**: Send a mild symptom inquiry: *"I have a mild tension headache from screen work."* Confirm the response appears with quick replies, auto-generates a conversation title, and saves into the sidebar history.
- [ ] **RAG Clinical Citation**: Ask a covered guideline question: *"What should I do if my child has a fever of 38.5°C?"* Confirm the response includes a numbered citation bracket (e.g. `[1]`) with verified source details.
- [ ] **Pre-Flight Emergency Redirection (`/emergency`)**: Send an acute red-flag message: *"Crushing chest pain radiating down left arm with cold sweat."* Confirm **instant** bypass to `/emergency` without LLM delay. Verify `112` and `108` emergency calling buttons are visible.

### 3. Lab Report Explainer
- [ ] **Pasted Text Extraction (`/reports`)**: Click "Paste text" tab. Paste a synthetic report:
  ```text
  Fasting Blood Glucose: 138 mg/dL (Reference: 70 - 99 mg/dL)
  Hemoglobin A1c: 6.8 % (Reference: 4.0 - 5.6 %)
  Total Cholesterol: 245 mg/dL (Reference: < 200 mg/dL)
  ```
  Submit and verify extraction into the interactive table with "High" status badges and plain-language patient explanations.
- [ ] **File Upload Extraction**: Upload a synthetic PDF or PNG lab report. Confirm file byte sniffing validates file magic numbers (not just extension) and generates accurate explanations.
- [ ] **Critical Alert Banner**: Upload or paste a report with a critical value (e.g., Potassium `6.8 mmol/L`). Verify the amber-to-red alert banner renders immediately.

### 4. PDF Document Generation
- [ ] **Doctor Visit Summary PDF**: Open a completed consultation, navigate to `/summary/[id]`, and click "Download PDF". Confirm the generated A4 PDF includes the SafeSteps header, patient summary, triage urgency level, GP questions, and mandatory clinical disclaimer footer.
- [ ] **Lab Report PDF**: Open a report at `/reports/[id]` and click "Export PDF". Confirm clean A4 PDF rendering with biomarker table and reference intervals.

### 5. Multilingual Localization
- [ ] **Language Switcher**: Click the language selector in the navigation bar. Switch to **தமிழ் (Tamil)** and **हिन्दी (Hindi)**. Confirm:
  - Navigation links, disclaimer banner, and form labels translate immediately.
  - Emergency hotline calling bridge remains prominently legible in the selected language.
  - In Tamil and Hindi, PDFs correctly embed `Noto Sans Tamil` and `Noto Sans Devanagari` glyphs.

### 6. Privacy & Data Deletion Cascade (`/settings`)
- [ ] **JSON Data Export**: Go to Settings -> **Privacy & data** -> Click "Export as JSON". Confirm a `.json` file downloads containing the user's profile, conversations, messages, reports, report values, and consent history.
- [ ] **Account Deletion Cascade**: Click "Delete my account and all data". Type `DELETE` in the confirmation modal. Confirm:
  - All user rows across all 8 tables are deleted via the administrative service-role client.
  - Auth user is deleted from Supabase Auth.
  - Session is terminated and user is redirected to `/account-deleted`.
  - Attempting to log back in with deleted credentials fails.

### 7. Security & Isolation Verification
- [ ] **No Client-Side Secrets**: Open Browser DevTools -> Network and Sources tabs. Filter for `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, or `GROQ_API_KEY`. Confirm **zero** occurrences in client scripts or responses.
- [ ] **Signed-Out Protection**: Open an incognito window. Attempt to visit `/profile`, `/reports`, `/history`, or `/settings`. Confirm immediate redirect to `/login`.
- [ ] **Row Level Security (RLS) Cross-User Isolation**: Sign in as User A. Note the ID of a conversation or report. Sign in as User B in another browser and attempt to access `/reports/<user-a-id>` or `/summary/<user-a-conv-id>`. Confirm server returns `404 Not Found` or `401 Unauthorized`.
- [ ] **Settings Version Badge**: Go to Settings page footer. Confirm status note renders: `SafeSteps Platform • Operational • App Version v2 • Level 2 Clinical Architecture`.
