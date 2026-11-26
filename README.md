# SafeSteps — Clinical AI Health Guidance Assistant

> **Tagline:** *Understand your symptoms. Know your next step, safely.*

SafeSteps is a calm, compassionate AI health guidance assistant engineered for the general public in India. It empowers individuals experiencing non-emergency health symptoms to describe what they feel in everyday language and receive structured, reassuring guidance on care urgency — whether to rest at home, schedule a doctor appointment, or seek immediate emergency care.

Built with a **safety-first clinical architecture**, SafeSteps runs high-sensitivity emergency detection *before* any AI call and executes strict output guardrails *after* model inference to ensure zero diagnoses, zero drug dosages, and zero unprescribed pharmaceutical recommendations.

---

## 🌐 Live Production Deployment

- **Production URL:** [https://safesteps-kappa.vercel.app](https://safesteps-kappa.vercel.app)
- **Alternate Domain:** [https://safesteps-projects-f4ef.vercel.app](https://safesteps-projects-f4ef.vercel.app)
- **Health Check Probe:** [https://safesteps-kappa.vercel.app/api/health](https://safesteps-kappa.vercel.app/api/health)
- **GitHub Repository:** [https://github.com/mujahith9025/SafeSteps](https://github.com/mujahith9025/SafeSteps)

---

## ⚠️ Mandatory Medical Disclaimer

> [!IMPORTANT]
> **SafeSteps provides general health information and triage guidance only. It is NOT a doctor, medical service, or diagnostic device.**
> - SafeSteps does **not** diagnose medical conditions.
> - SafeSteps does **not** prescribe medications or recommend specific dosages.
> - **In an acute medical emergency, do NOT use this application. Call Emergency Services (112) or Ambulance (108) immediately, or go to the nearest hospital emergency room.**
> - If you are experiencing thoughts of self-harm or a mental health crisis, call **Tele-MANAS** at **14416** immediately.
> - *This project is developed as an academic engineering project and has not been evaluated by health regulatory authorities.*

---

## 🌟 Key Features

- **Dual-Engine AI Architecture**: Powered by **Groq** (`openai/gpt-oss-120b`) delivering ultra-fast 300ms clinical triage with 14,400 daily requests, backed by **Google Gemini** (`gemini-3.5-flash`) with automatic graceful failover.
- **Clinical Triage Follow-Up**: Gathers symptom context through 3 to 5 targeted, conversational questions (duration, severity, age group, existing conditions) in a single calming message without demanding personal identifiers.
- **3-Tier Urgency Classification**:
  - 🟢 **Level 1 (Self-Care at Home)**: Mild, reversible symptoms manageable with rest, hydration, comfort measures, and watchful waiting.
  - 🟡 **Level 2 (See a Doctor Soon)**: Moderate symptoms requiring clinical evaluation, diagnostic tests, or doctor review within 24 to 48 hours.
  - 🔴 **Level 3 (Emergency Care)**: Red-flag symptoms requiring immediate hospital emergency dispatch.
- **Pre-Flight Emergency Detection Engine**:
  - Scans user input **before** invoking Gemini with 100% recall across 30 red-flag phrases (cardiac, breathing, stroke, profuse bleeding, altered consciousness, severe allergic anaphylaxis, poisoning, self-harm, and infant distress).
  - Bypasses LLM completely during emergencies, eliminating inference delays or API failure risks.
  - Instantly redirects the client to `/emergency` with one-tap `112` and `108` calling bridges.
- **Post-Flight Output Guardrails**:
  - Scans model outputs before transmission to the user for drug dosages (e.g. `500mg`, `10ml`, `take 2 tablets`), diagnostic assertions (`"you have [illness]"`), prescriptions (`"I prescribe"`, `"you should take [drug]"`), and prompt leakage.
  - Automatically retries Gemini once with safety instructions or delivers a safe fallback response without exposing unsafe text.
- **Zero-Footprint Privacy Architecture**:
  - Symptom inquiries and chat turns reside exclusively in volatile client-side React memory.
  - Zero messages saved to `localStorage`, `sessionStorage`, cookies, or remote databases. All conversation data is instantly wiped on page reload or tab closure.
- **Production Edge Resilience**:
  - In-memory rate limiting (15 requests/minute per IP) with friendly cooldown timers.
  - Browser online/offline detection with sticky top status banners and automatic reconnection.
  - Standalone 404 page with emergency dispatch integration.
  - Health check endpoint at `/api/health`.
- **Accessibility & WCAG 2.1 Level AA**:
  - Fully keyboard operable with visible 2px teal focus rings.
  - Strict heading hierarchy (single `H1` per page, sequential `H2` / `H3`).
  - Screen reader message stream (`role="log"`, `aria-live="polite"`).
  - Programmatic focus on emergency alert headings upon navigation.
  - Comprehensive `prefers-reduced-motion` animation suppression.
  - Mobile dynamic viewport units (`dvh`) for virtual keyboard accommodation.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router, Turbopack, Server-Side API Routes) |
| **Language** | TypeScript 5 (Strict Mode) |
| **Styling & Design** | Tailwind CSS v4, Google Stitch Clinical Design System |
| **Icons & Typography** | Lucide React, Google Font `Inter` |
| **AI SDK & Model** | Google Gen AI SDK (`@google/genai`), Google Gemini 3.5 Flash (`gemini-3.5-flash`) |
| **Validation** | Zod v4 (Request payloads and response schemas) |
| **Unit Testing** | Vitest 5 |
| **Deployment** | Vercel Serverless Edge Platform |

---

## 📸 Screenshots & UI Showcase

<!--
Place real screenshots in docs/screenshots/ and update the paths below.
-->

| Desktop Landing (`/`) | Mobile Viewport with Sticky CTA (390px) |
| :---: | :---: |
| *(Screenshot Placeholder: Landing Hero & Interactive Preview)* | *(Screenshot Placeholder: Mobile Landing with Sticky 112 Bar)* |

| Clinical Symptom Chat (`/chat`) | Urgency Result Card (Level 2) |
| :---: | :---: |
| *(Screenshot Placeholder: Chat Consultation & Suggestion Chips)* | *(Screenshot Placeholder: Structured Urgency Card & Actions)* |

| Emergency Alert Takeover (`/emergency`) | 404 Exception Page (`/not-found`) |
| :---: | :---: |
| *(Screenshot Placeholder: 112/108 Dials & Tele-MANAS Support)* | *(Screenshot Placeholder: Standalone 404 with Emergency Box)* |

---

## 🛡️ How the Multi-Layer Safety Architecture Works

SafeSteps implements defense-in-depth across the conversational lifecycle:

```
User Input
    │
    ▼
┌────────────────────────────────────────────────────────┐
│ Layer 1: Pre-Flight Emergency Check (BEFORE the Model) │
│ - Regex catalog across 9 acute emergency categories     │
│ - Clause-isolated negation engine (ignores "no pain")   │
│ - Immediate bypass to /emergency on positive match     │
└──────────────────────────┬─────────────────────────────┘
                           │ (Safe / Non-Emergency)
                           ▼
┌────────────────────────────────────────────────────────┐
│ Layer 2: System Prompt Triage Constraints               │
│ - 3-5 clarifying questions, strict Indian triage norms │
│ - Never diagnose ("this may suggest", never "you have")│
│ - Never prescribe medications, dosages, or durations   │
│ - Output forced to strict JSON response schema         │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Layer 3: Gemini Inference & Zod Schema Validation      │
│ - Gemini 3.5 Flash with responseMimeType="app/json"    │
│ - Validated against QuestionResponse / ResultResponse  │
│ - Automatic single retry if JSON formatting fails       │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Layer 4: Post-Flight Output Guardrail (AFTER the Model)│
│ - Scans message, headline, suggests, actions, warnings │
│ - Blocks dosages (500mg, 10ml, take 2, every 6 hrs)    │
│ - Blocks diagnostic claims & prescription language      │
│ - Blocks prompt leakage ("system prompt", instructions)│
│ - Single retry with correction; safe fallback on fail   │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
Valid, Guardrailed Response Delivered to Browser
```

---

## ⚙️ Environment Variables

Create `.env.local` in the project root based on `.env.example`:

| Variable | Description | Required | Scope / Prefix Rule |
| :--- | :--- | :---: | :--- |
| `GROQ_API_KEY` | Server-side API key for Groq clinical triage engine. | Optional | Server-only (No prefix) |
| `GROQ_MODEL` | Groq model identifier (`openai/gpt-oss-120b`). | Optional | Server-only (No prefix) |
| `GEMINI_API_KEY` | Server-side API key for Google Gemini from Google AI Studio. | **Yes** | Server-only (No prefix) |
| `GEMINI_MODEL` | Gemini model identifier (`gemini-3.5-flash`). | **Yes** | Server-only (No prefix) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project API URL. | **Yes** | Client & Server (`NEXT_PUBLIC_`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous API key (subject to RLS). | **Yes** | Client & Server (`NEXT_PUBLIC_`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (bypasses RLS). | **Yes** | **Server-only (Never prefix)** |
| `GEMINI_EMBEDDING_MODEL` | Gemini model for vector embeddings (`text-embedding-004`). | Optional | Server-only (No prefix) |

> 🔒 **Security Rules:**
> - Never prefix secret keys (`GEMINI_API_KEY`, `GROQ_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) with `NEXT_PUBLIC_`.
> - `SUPABASE_SERVICE_ROLE_KEY` has full administrative database privileges. It is strictly guarded by `'server-only'` in `src/lib/supabase/admin.ts` and must never be exposed to browser bundles.
> - Never commit `.env.local` or any secrets to version control.

---

## 🗄️ Supabase Setup

### 1. Create a Supabase Project
1. Log in to [Supabase](https://supabase.com/).
2. Click **New Project**, choose your organization, enter a project name (e.g., `safesteps`), and select a database region close to your users.
3. Set a strong database password and click **Create new project**.

### 2. Copy the Project URL and API Keys
1. In your Supabase project dashboard, navigate to **Project Settings** (gear icon in sidebar) -> **API**.
2. Copy the credentials into your local `.env.local` file:
   - **Project URL:** Copy the URL and assign it to `NEXT_PUBLIC_SUPABASE_URL`.
   - **Project API Keys -> `anon` (public):** Copy the key and assign it to `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - **Project API Keys -> `service_role` (secret):** Click reveal, copy the secret key, and assign it to `SUPABASE_SERVICE_ROLE_KEY`.

### 3. Understanding Which Key is Which
- **`NEXT_PUBLIC_SUPABASE_ANON_KEY` (Anon Key):**
  - **What it is:** The public client-side API key.
  - **Where it is used:** In browser Client Components via `src/lib/supabase/client.ts` and authenticated Server Components / Route Handlers via `src/lib/supabase/server.ts`.
  - **Security:** Safe for client-side inclusion because all requests are restricted by Supabase **Row Level Security (RLS)** policies.
- **`SUPABASE_SERVICE_ROLE_KEY` (Service Role Key):**
  - **What it is:** The root administrator secret key.
  - **Where it is used:** Exclusively on the server via `src/lib/supabase/admin.ts` for specialized backend tasks (data ingestion, clinical guideline seeding, permanent account deletion).
  - **Security:** **Bypasses all Row Level Security.** Must NEVER have the `NEXT_PUBLIC_` prefix, must NEVER be imported into Client Components, and must NEVER be committed to Git. Guarded by the `'server-only'` import guard.

### 4. Verify Database Connectivity
Once configured in `.env.local`, start your local server and verify the database connection:
```bash
# Check database health check probe
curl http://localhost:3000/api/health/db
# Expected response: {"status":"ok"}
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Node.js**: v18.18.0 or newer (v20+ recommended)
- **npm**: v9+

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/safesteps.git
cd safesteps

# Install dependencies
npm install
```

### 3. Environment Configuration
```bash
# Copy example environment configuration
cp .env.example .env.local

# Edit .env.local with your Gemini API credentials
# GEMINI_API_KEY=your_key_here
# GEMINI_MODEL=gemini-3.5-flash
```

### 4. Running the App
```bash
# Start local development server with Turbopack
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Running Tests & Quality Checks
```bash
# Run Vitest unit test suite (emergency recall, guardrails, rate limit, validation)
npm test

# Run ESLint code quality audit
npm run lint

# Build production bundle
npm run build
```

---

## 📂 Folder Structure

```text
Safe Steps/
├── docs/
│   ├── design-review.md        # Cross-screen design audit & WCAG AA verification table
│   ├── design-spec.md          # Comprehensive design tokens, copy inventory & Stitch spec
│   └── manual-test-plan.md     # 27-row manual QA test matrix & execution script
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts   # Core backend chat endpoint (rate limit, emergency, Gemini, guardrail)
│   │   │   ├── health/
│   │   │   │   ├── route.ts    # Application health check endpoint (GET /api/health)
│   │   │   │   └── db/route.ts # Database connectivity health probe (GET /api/health/db)
│   │   │   └── ...
│   │   ├── chat/page.tsx       # Conversational symptom triage page
│   │   ├── emergency/page.tsx  # High-acuity emergency takeover screen with 112/108 dials
│   │   ├── error.tsx           # Global Next.js runtime error boundary
│   │   ├── globals.css         # Tailwind v4 theme, contrast colors, focus outlines, reduced motion
│   │   ├── layout.tsx          # Root HTML layout with skip link, header disclaimer, navbar & footer
│   │   ├── not-found.tsx       # Standalone 404 page matching Stitch design
│   │   └── page.tsx            # Main landing page composing all landing sections
│   ├── components/
│   │   ├── chat/               # Chat UI: Window, Bubble, Input, Chips, UrgencyCard, States
│   │   ├── landing/            # Landing UI: Hero, HowItWorks, UrgencyLevels, Safety, CTA, StickyCTA
│   │   ├── layout/             # Global Layout: Navbar, Footer, Logo, DisclaimerBanner
│   │   └── ui/                 # Foundational primitives: Button, Card, Badge
│   ├── hooks/
│   │   └── useChat.ts          # Client-side chat state machine, retry support, error classification
│   ├── lib/
│   │   ├── chatClient.ts       # Client API fetcher & custom ChatApiError mapping
│   │   ├── gemini.ts           # Singleton Google Gen AI client & model resolver
│   │   ├── rateLimit.ts        # In-memory sliding window rate limiter (15 req/min per IP)
│   │   └── supabase/           # Supabase client factory (browser, server, admin)
│   │       ├── admin.ts        # Service role client with 'server-only' guard
│   │       ├── client.ts       # Browser client using anon key
│   │       └── server.ts       # Server client using cookies via @supabase/ssr
│   ├── prompts/
│   │   └── system.txt          # Production SafeSteps clinical system instructions
│   ├── safety/
│   │   ├── emergency.ts        # Pre-flight emergency detection engine & clause negation
│   │   ├── emergencyPatterns.ts# Regex patterns for 9 emergency categories
│   │   ├── emergency.test-cases.ts # 30 trigger & 20 non-trigger benchmark test phrases
│   │   ├── guardrail.ts        # Post-flight AI output guardrail engine
│   │   ├── guardrailPatterns.ts# Regex patterns for dosages, diagnoses, prescriptions, leaks
│   │   └── guardrail.test-cases.ts # 10 unsafe & 10 safe benchmark response test cases
│   └── types/
│       ├── chat.ts             # Message, ChatState, ApiChatMessage, UrgencyResult interfaces
│       └── response.ts         # Zod schemas for QuestionResponse, ResultResponse, EmergencyResponse
├── tests/
│   ├── emergency.test.ts       # Vitest suite verifying 100% emergency recall (30/30 triggers)
│   ├── guardrail.test.ts       # Vitest suite verifying output guardrail blocking & passing
│   └── validation-ratelimit.test.ts # Vitest suite for Zod payload checks & rate limiting
├── .env.example                # Example environment variables template
├── .gitignore                  # Git ignore rules (protecting .env.local, .next, node_modules)
├── DEPLOY.md                   # Step-by-step Vercel deployment guide & smoke test checklist
├── next.config.ts              # Next.js security headers (nosniff, DENY, strict-origin)
├── package.json                # Project dependencies, scripts & metadata
├── tsconfig.json               # TypeScript compiler configuration
└── vitest.config.mjs           # Vitest configuration with @ alias resolution
```

---

## ⚠️ Known Limitations

1. **No User Accounts or Authentication**: Intentionally designed without sign-in or user profiles to prevent storing identifiable medical history.
2. **Volatile In-Memory Session**: Conversations exist only in active browser memory. Refreshing or closing the tab permanently clears the conversation.
3. **Single-Instance Rate Limiting**: The built-in rate limiter operates in-memory (`Map<string, RateLimitRecord>`) suitable for Level 1 single-instance deployments. Multi-instance serverless deployments require a shared store (e.g. Upstash Redis).
4. **General Health Guidance Only**: SafeSteps assists in determining urgency level; it cannot confirm diagnoses, order blood tests, or replace direct physician examination.
5. **English Primary Interface**: Level 1 focuses on English-language interactions with Indian emergency dispatch phone integration (112, 108, 14416).

---

## 📄 License & Credits

- Developed for academic health-tech demonstration.
- Design specifications inspired by the Google Stitch Clinical Design System.
