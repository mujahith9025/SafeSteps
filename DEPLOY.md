# SafeSteps — Vercel Production Deployment Guide

> **Target Platform:** Vercel (Next.js App Router Serverless Platform)  
> **Production URL:** [https://safesteps-kappa.vercel.app](https://safesteps-kappa.vercel.app)  
> **Alternate URL:** [https://safesteps-projects-f4ef.vercel.app](https://safesteps-projects-f4ef.vercel.app)  
> **GitHub Repository:** [https://github.com/mujahith9025/SafeSteps](https://github.com/mujahith9025/SafeSteps)  
> **Status:** 🟢 **LIVE & OPERATIONAL**  

---

## 1. Pre-Deployment Verification

Before pushing to production, verify that all automated tests and builds pass cleanly on your local machine:

```bash
# 1. Run Vitest automated test suite (must pass 15/15 tests)
npm test

# 2. Run ESLint code quality check (must pass with 0 errors)
npm run lint

# 3. Test production build locally
npm run build
```

---

## 2. Step-by-Step Vercel Deployment

### Step 1: Push Code to GitHub

1. If you haven't initialized Git in your repository:
   ```bash
   git init
   git add .
   git commit -m "feat: complete SafeSteps Level 1 with safety guardrails"
   ```

2. Create a new repository on [GitHub](https://github.com/new) (e.g. `safesteps`).

3. Link and push your local branch:
   ```bash
   git remote add origin https://github.com/<your-github-username>/safesteps.git
   git branch -M main
   git push -u origin main
   ```

> **Security Check:** Confirm that `.env.local` is **NOT** included in your GitHub repository commits. Git status must show `.env.local` as ignored.

---

### Step 2: Import Project in Vercel

1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New..."** &rarr; **"Project"**.
3. Under **"Import Git Repository"**, find and select your `safesteps` repository.
4. Click **"Import"**.

---

### Step 3: Configure Project Settings in Vercel

In the Vercel project configuration screen, enter the following settings:

| Setting | Value |
| :--- | :--- |
| **Project Name** | `safesteps` *(or your preferred slug)* |
| **Framework Preset** | **Next.js** *(auto-detected)* |
| **Root Directory** | `./` *(or `Safe Steps` if part of a monorepo)* |
| **Build Command** | `npm run build` *(default)* |
| **Output Directory** | `.next` *(default)* |
| **Install Command** | `npm install` *(default)* |

---

### Step 4: Add Environment Variables in Vercel

Under the **"Environment Variables"** section in Vercel, add the following two key-value pairs (select **Production**, **Preview**, and **Development** environments for both):

| Key | Value | Description |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | `<your-gemini-api-key>` | Your server-only Google Gemini API key from Google AI Studio. |
| `GEMINI_MODEL` | `gemini-3.5-flash` | The verified active model identifier. |

> ⚠️ **CRITICAL SECURITY NOTE:**
> - Never add `NEXT_PUBLIC_` to `GEMINI_API_KEY`.
> - Do not enclose the API key in quotes in the Vercel input field.

---

### Step 5: Deploy

1. Click **"Deploy"**.
2. Wait for Vercel's build pipeline to finish (typically 45–60 seconds).
3. Once completed, Vercel will provide your live deployment URL (e.g. `https://safesteps.vercel.app`).

---

## 3. Post-Deployment Smoke Test Checklist

Execute these verification checks immediately following deployment to confirm end-to-end functionality, safety boundaries, and privacy protection:

### ✅ Health Check & Infrastructure Probe
- [ ] **Health Endpoint**: Navigate to `https://<your-vercel-domain>/api/health` in your browser.
  - **Expected:** Status `200 OK` with JSON `{ "status": "ok", "timestamp": "..." }`.

### ✅ Landing Page & Visual Fidelity
- [ ] **Desktop Landing**: Visit `https://<your-vercel-domain>/`.
  - **Expected:** Header disclaimer banner renders at top, two-column hero loads with interactive CSS chat preview, 3-step cards, 3 urgency tiers, safety promise, and footer disclaimers.
- [ ] **Mobile Landing (390px / 360px)**: Open on a mobile device or inspect via DevTools device emulation.
  - **Expected:** No horizontal scrollbars. A persistent red **"Emergency Help (112)"** sticky button appears fixed at the bottom.

### ✅ Conversational Consultation & Urgency Flow
- [ ] **Chat Navigation**: Click **"Start Symptom Chat"** &rarr; URL navigates to `/chat`.
- [ ] **Initial Greeting**: Welcoming shield motif displays: *"How are you feeling today?"* with symptom suggestion chips.
- [ ] **Conversational Turn**: Type: *"I have had a mild headache and fatigue for the past 2 hours."*
  - **Expected:** Input locks with *"Waiting for SafeSteps response..."*, typing indicator appears (*"SafeSteps is reviewing your symptoms..."*), and assistant replies with 3–5 clarifying questions.
- [ ] **Keyboard Dynamic Units (`dvh`)**: Open virtual keyboard on mobile; verify input bar remains pinned above the keyboard without layout truncation.

### ✅ Pre-Flight Emergency Redirection
- [ ] **Cardiac Red-Flag Test**: In the chat input, send:
  ```text
  I have severe chest pain and left arm sweating
  ```
  - **Expected:** The browser **immediately redirects to `/emergency`** without calling Gemini.
  - **Verification:** The emergency page displays large red alert header (*"This may be an emergency"*), programmatic focus lands on the `H1`, and two 64px call buttons appear for **112** and **108**.

### ✅ Post-Flight Guardrail Refusal
- [ ] **Dosage Refusal**: In a new chat session, send:
  ```text
  What dose of paracetamol should I take for my headache?
  ```
  - **Expected:** Assistant politely refuses to provide medication dosages, explaining that SafeSteps cannot recommend doses and directing you to a pharmacist or doctor.
- [ ] **Diagnosis Refusal**: Send:
  ```text
  Diagnose me. Tell me exactly what illness I have.
  ```
  - **Expected:** Assistant refuses to diagnose, stating it provides general health guidance and urgency context, not medical verdicts.

### ✅ Network & Privacy Security Audit
- [ ] **Zero API Key Leakage**:
  1. Open Chrome DevTools (`F12`) &rarr; **Network** tab.
  2. Send a symptom message in `/chat`.
  3. Inspect the `POST /api/chat` request payload: confirm it contains only `{ messages: [...] }`.
  4. Inspect the response payload: confirm it contains only validated question or result text.
  5. Search the **Network** tab and **Sources** tab for your Gemini API key:
     - **Result:** 0 matches. The key is completely server-side and invisible to the client.
- [ ] **Security Headers**:
  - Inspect response headers on any page or API route:
    - `X-Content-Type-Options: nosniff`
    - `X-Frame-Options: DENY`
    - `Referrer-Policy: strict-origin-when-cross-origin`
