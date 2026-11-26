# SafeSteps Design Specification & Implementation Blueprint

> **Source Project:** SafeSteps Health Design System (Stitch Project ID: `27670201492838515`)  
> **Tagline:** *"Know your next step, safely."*  
> **Document Purpose:** Complete UI/UX design specification, design tokens, component catalog, exact copy inventory, and gap analysis against the project brief.  
> **Status:** Draft / Awaiting Confirmation. *(No application code written).*

---

## 1. Screen Inventory Table

| Screen Name (Stitch) | Device Target | Dimensions (px) | Application Route Mapping | Purpose & Architectural Role |
| :--- | :--- | :--- | :--- | :--- |
| **SafeSteps Logo** | Asset (Vector/SVG) | 320 × 64 | Reusable Brand Asset | Global header logo, brand icon, and wordmark. |
| **SafeSteps - Home** | Desktop | 1280 × 4040 | `/` (Landing Page) | Main desktop landing experience: hero symptom preview, 3-step process, 3 triage tiers, safety promise, and call-to-action banner. |
| **SafeSteps - Mobile Landing Page** | Mobile | 390 × 4400 | `/` (Responsive Mobile View) | Mobile-optimized landing page with sticky safe-area headers, compact triage cards, direct dispatch dials, and persistent emergency action bar. |
| **SafeSteps - Clinical AI Chat** | Desktop | 1280 × 1044 | `/chat` | Core conversational consultation UI: end-to-end encrypted session bar, message stream, red-flag monitoring indicator, and symptom input dock. |
| **SafeSteps - Urgency Result Cards** | Desktop / Component | 1280 × 3576 | Component in `/chat` | Standardized clinical triage result cards displayed upon session completion for Level 1 (Self-Care), Level 2 (See Doctor Soon), and Level 3 (Emergency Care). |
| **SafeSteps - Emergency Alert** | Desktop / Full Takeover | 1280 × 1212 | `/emergency` | High-acuity takeover screen triggered by red-flag symptoms or emergency button click: immediate 112/108 dials, waiting instructions, and mental health crisis hotline. |
| **SafeSteps - Chat States & Edge Cases** | Desktop / Components | 1280 × 5180 | Components in `/chat` & `not-found` | 7 system edge states: 01 Loading stream, 02 Empty welcoming state, 03 Inline error recovery, 04 Offline network banner, 05 Validation boundaries, 06 Rate-limit cooldown, and 07 Full 404 page. |
| **SafeSteps Style Guide & Design Foundation** | Desktop / Reference | 1280 × 5597 | Reference / `/docs` | Living design system reference: color swatches, typography scale, component specimens, and regulatory disclaimers. |

---

## 2. Design Tokens

### 2.1 Color Palette

#### Core Brand & Surface Colors
| Token Name | Hex Value | Role & Usage | Contrast / WCAG |
| :--- | :--- | :--- | :--- |
| `--primary` | `#0F766E` | Deep calm teal. Primary buttons, active nav links, brand accents, and key interactive triggers. | 4.88:1 on White (Pass AA) |
| `--primary-hover` | `#115E59` | Hover fill for primary interactive components. | Pass AA |
| `--primary-active` | `#134E4A` | Active / pressed state for primary components. | Pass AA |
| `--primary-light` / `--mint` | `#CCFBF1` | Soft mint wash. Chip selection background, badge tint, and primary focus halo rings. | Pass AAA with `#0F766E` text |
| `--page-background` | `#F8FAFC` *(Brief)* / `#F8F9FF` *(Stitch)* | Soft slate/blue canvas backdrop designed to diminish screen glare relative to harsh pure white. | Base canvas |
| `--surface-card` | `#FFFFFF` | Elevated foreground surface for content cards, guidance panels, input boxes, and chat bubbles. | Structural Tier 1 |
| `--surface-container-low`| `#EFF4FF` / `#F1F5F9` | Section alternating background (How It Works, feature blocks). | Subtle depth separation |
| `--border-subtle` | `#E2E8F0` / `#BDC9C6` | Continuous 1px border stroke for cards, input containers, and dividers. | Boundary line |
| `--border-focus` | `#0F766E` | Input active border color paired with `0 0 0 3px #CCFBF1`. | Accessible focus ring |
| `--text-primary` | `#0F172A` / `#0D1C2E` | Deep slate. Primary headings, triage steps, user inputs, and body text. | 15.8:1 on White (Pass AAA) |
| `--text-secondary` | `#475569` / `#3E4947` | Muted slate. Supporting descriptions, helper hints, timestamps, and metadata. | 6.9:1 on White (Pass AA) |

#### Clinical Triage & Urgency Hues
| Triage Level | Text / Icon Hex | Container / Background Hex | Border / Rail Hex | Clinical Application |
| :--- | :--- | :--- | :--- | :--- |
| **Level 1: Low / Self-Care** | `#16A34A` (Green) | `#DCFCE7` | `#86EFAC` | Mild, reversible conditions manageable at home with rest, fluids, and OTC care. |
| **Level 2: Moderate / Consult Doctor** | `#D97706` / `#B45309` (Amber) | `#FEF3C7` | `#FDE68A` | Non-emergent clinical review recommended within 24 to 48 hours. |
| **Level 3: Critical / Emergency** | `#DC2626` / `#BA1A1A` (Red) | `#FEE2E2` / `#FEF2F2` | `#FCA5A5` | Immediate life-safety intervention; dispatch 112/108 or hospital ER immediately. |
| **Clinical Notice / Legal Banner** | `#075985` (Deep Sky Blue) | `#E0F2FE` (Light Ice Blue) | `#BAE6FD` | Mandatory disclaimer banner at the top of every screen and diagnostic boundary notes. |

---

### 2.2 Typography Scale

- **Font Family:** `Inter`, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif.
- **Strict Size Floor:** informatory copy, helper text, and disclaimers **must never drop below 14px** (`caption-md`).
- **Reading Rhythm:** Body text maintains a 1.625 line-height ratio (`16px` font on `26px` line-height) to prevent eye fatigue.

| Typographic Style | Font Size | Line Height | Weight | Letter Spacing | Purpose & Elements |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `headline-xl` | 40px (2.5rem) | 48px | 700 (Bold) | -0.02em | Hero headline (desktop), major page banners. |
| `headline-xl-mobile` | 32px (2.0rem) | 40px | 700 (Bold) | -0.015em | Hero headline (mobile viewports). |
| `headline-lg` | 28px (1.75rem) | 36px | 600 (Semibold) | -0.01em | Section titles, empty state greetings, style foundation titles. |
| `headline-md` | 20px (1.25rem) | 28px | 600 (Semibold) | -0.005em | Card headings, triage urgency titles, modal titles. |
| `body-lg` | 18px (1.125rem) | 28px | 400 (Regular) | Normal | Hero subtitles, emergency waiting instructions. |
| `body-md` | 16px (1.0rem) | 26px | 400 (Regular) | Normal | General body copy, chat messages, guidance paragraphs. |
| `body-md-medium` | 16px (1.0rem) | 26px | 500 (Medium) | Normal | Emphasized chat responses, actionable checklist items. |
| `label-md` | 16px (1.0rem) | 24px | 600 (Semibold) | Normal | Primary button labels, form field labels, key actions. |
| `caption-medium` | 14px (0.875rem) | 20px | 500 (Medium) | Normal | Status pills, badge text, quick symptom chips, metadata. |
| `caption-md` | 14px (0.875rem) | 20px | 400 (Regular) | Normal | *(Strict floor)* Secondary hints, character counters, disclaimers. |

---

### 2.3 Spacing Scale & Layout Constraints

- **Max Content Container Width:** `1120px` (Desktop; prevents excessively long reading lines for health data).
- **Mobile Grid:** 4-column layout, `1rem` (16px) margins, `1rem` (16px) gutters.
- **Tablet Grid:** 8-column layout, `1.5rem` (24px) margins, `1.5rem` (24px) gutters.
- **Desktop Grid:** 12-column layout, `2rem` (32px) margins, `1.5rem` (24px) gutters.

| Spacing Token | Value | Equivalent | Functional Context |
| :--- | :--- | :--- | :--- |
| `space-xs` | 0.25rem | 4px | Icon gaps, tight badge margins. |
| `space-sm` | 0.5rem | 8px | Button icon spacing, chip padding, item gaps. |
| `space-md` | 1rem | 16px | Container padding, standard element gaps, form controls. |
| `space-lg` | 1.5rem | 24px | Card inner padding, section sub-gaps, modal padding. |
| `space-xl` | 2rem | 32px | Section outer margins, triage tier card separation. |

---

### 2.4 Border Radius

| Radius Token | Value | Applied To |
| :--- | :--- | :--- |
| `rounded-sm` | 0.25rem (4px) | Checkboxes, tiny indicators. |
| `rounded-DEFAULT` | 0.5rem (8px) | Small chips, secondary status tags. |
| `rounded-md` / `rounded-xl`| 0.75rem (12px) | Standard action buttons (48px height), input fields, symptom chips. |
| `rounded-lg` / `rounded-2xl`| 1.0rem (16px) | Content cards, triage guidance containers, chat bubbles. |
| `rounded-full` | 9999px | Triage status pills, badge tags, icon circle action triggers. |

---

### 2.5 Elevation & Shadow Tiers

| Shadow Tier | Definition | Usage |
| :--- | :--- | :--- |
| **Tier 0 (Flat)** | `none` | Background canvas (`#F8FAFC`), full screen containers. |
| **Tier 1 (Subtle)** | `0px 1px 3px rgba(15, 23, 42, 0.04), 0px 1px 2px rgba(15, 23, 42, 0.02)` | Content cards, header navigation bar, input containers. |
| **Tier 2 (Floating)**| `0px 4px 12px -2px rgba(15, 23, 42, 0.06), 0px 2px 6px -1px rgba(15, 23, 42, 0.03)` | Card hover states, floating symptom chip docks, dropdowns. |
| **Tier 3 (Overlay)** | `0px 12px 24px -4px rgba(15, 23, 42, 0.08), 0px 4px 8px -2px rgba(15, 23, 42, 0.04)` | Emergency takeover sheets, modal alerts, popover checklists. |

---

## 3. Component Inventory & Variants

### 3.1 Buttons

1. **Primary Button (`PrimaryCTA`):**
   - Height: `48px`, padding: `0 24px`, radius: `12px` (`rounded-xl`).
   - Default: Background `#0F766E`, text `#FFFFFF`, font `label-md` (16px semibold).
   - Hover: `#115E59`, Active: `#134E4A`, Focus: `ring-3 ring-[#CCFBF1]`.
   - Examples: `"Start Symptom Chat"`, `"Start Free Assessment"`, `"Submit Symptom"`.
2. **Emergency Action Button (`EmergencyRedCTA`):**
   - Height: `48px` (Header) / `64px` (Emergency Takeover), radius: `12px` / `16px`.
   - Default: Background `#DC2626`, text `#FFFFFF`, font `label-md` / `headline-md`.
   - Icon: `phone_in_talk`, `ambulance`, or `e911_emergency` (Lucide `PhoneCall`, `Ambulance`, `AlertOctagon`).
   - Examples: `"Emergency Help (112)"`, `"Call Emergency Services: 112"`, `"Call Ambulance: 108"`.
3. **Secondary Soft Button (`SoftMintCTA`):**
   - Height: `40px` or `48px`, padding: `0 16px`, radius: `12px`.
   - Default: Background `#CCFBF1`, text `#0F766E`, font `caption-medium` (14px) or `label-md` (16px).
   - Hover: `#99F6E4`.
   - Examples: Quick filter chips, `"How to prepare for your visit"`.
4. **Secondary Outlined Button (`OutlineButton`):**
   - Height: `48px`, border `1.5px solid #E2E8F0`, text `#0F172A`, radius `12px`.
   - Hover: Background `#F8FAFC`.
   - Examples: `"How it works"`, `"Browse Health Library"`, `"View Guardrails"`.
5. **Icon Circle Action Button (`CircleIconButton`):**
   - Dimensions: `40px × 40px` or `48px × 48px`, radius `9999px`.
   - Used for send button (teal circle with upward arrow), voice mic trigger, export, and reset.

---

### 3.2 Cards & Guidance Containers

1. **Default Content Card:**
   - Background `#FFFFFF`, border `1px solid #E2E8F0`, radius `16px`, padding `24px`.
   - Used in: "How It Works" 3-step cards, "Our Safety Promise" 4 pillars.
2. **Clinical Urgency Result Cards (3 Severity Tiers):**
   - Background `#FFFFFF`, radius `16px`, padding `24px`, ambient shadow.
   - **Level 1 (Self-Care):**
     - Badge: `#DCFCE7` with text `#16A34A` ("Level 1: Self-Care").
     - Title: "This can usually be managed at home".
     - Left accent rail: `#16A34A`.
     - Checkmarked action list (green checkmarks).
     - Watch-for warning signs box (amber warning icon).
     - Bottom persistent buttons: "Start a new chat", "Show summary".
   - **Level 2 (See Doctor Soon):**
     - Badge: `#FEF3C7` with text `#B45309` / `#D97706` ("Level 2: See Doctor Soon").
     - Title: "It's a good idea to see a doctor in the next day or two".
     - Left accent rail: `#D97706`.
     - Checkmarked clinical recommendations.
     - Sub-card: "Doctor visit preparation" with "How to prepare for your visit" button.
     - Urgent escalation warnings list (red warning icon).
   - **Level 3 (Emergency Care):**
     - Badge: `#FEE2E2` with text `#DC2626` ("Level 3: Immediate Care Required").
     - Title: "Please seek urgent medical care now" (text in `#DC2626`).
     - Direct dispatch buttons: "Call Emergency Help (112)", "Call Ambulance (108)".
     - Immediate safety instructions ("Do not wait", "Do not drive yourself", "Stay with someone").
     - Red-flag warning symptoms list.
3. **Emergency Alert Takeover Container:**
   - Full screen background `#FEF2F2`, border `2px solid #FCA5A5`, radius `24px`.
   - High-contrast emergency cards and mental crisis helpline box (`#FFFFFF` with `#E0F2FE` accent).

---

### 3.3 Badges & Status Pills

1. **Triage Severity Pills (`full` rounded):**
   - Green pill: `#DCFCE7` background, `#16A34A` text.
   - Amber pill: `#FEF3C7` background, `#D97706` text.
   - Red alert pill: `#FEE2E2` background, `#DC2626` text.
2. **Security & Session Pill:**
   - Background `#EFF4FF`, border `#CBD5E1`, text `#0F766E`, font `14px caption-medium`.
   - Copy: `"Encrypted Session #SF-204 | Clinical Guidance Mode"`.
3. **Validation / Required Badge:**
   - Background `#FFDAD6`, text `#93000a`, font `14px caption-medium`.

---

### 3.4 Chat Bubbles & Conversational Stream

1. **Assistant Welcome & Guidance Bubble:**
   - Background: `#FFFFFF` (surface-container-lowest), border `1px solid #E2E8F0`, text `#0F172A`.
   - Border radius: `16px` on top-right, bottom-right, bottom-left; `4px` on top-left (`rounded-tl-sm`).
   - Max width: `620px`.
   - Timestamp and verified clinical badge underneath.
2. **User Message Bubble:**
   - Background: `#0F766E` (`--primary`), text `#FFFFFF`.
   - Border radius: `16px` on top-left, bottom-left, bottom-right; `4px` on top-right (`rounded-tr-sm`).
   - Max width: `560px`.
   - Timestamp, "Delivered" label, and double-check delivery icon.
3. **Red-Flag Clinical Monitoring Indicator:**
   - Background: `#EFF4FF` (surface-container-low), border `1px solid #BAE6FD`, radius `12px`.
   - Title: "Red Flag Check in Progress", subtitle: "Checking: airway patency, rash, stiff neck, extreme lethargy".

---

### 3.5 Disclaimer Banners

1. **Global Persistent Header Banner:**
   - Fixed at the very top of all screens (above main nav).
   - Height: `32px` - `36px`, background `#E0F2FE`, border-bottom `1px solid #BAE6FD`, text `#075985`.
   - Typography: `caption-medium` (14px).
   - Copy: `"General information only. Not a diagnosis. In an emergency call 112."`
2. **In-Page Medical Disclaimer Callout:**
   - Background `#E0F2FE`, border `1px solid #BAE6FD`, text `#075985`, radius `12px`, padding `16px 20px`.
   - Copy: *"SafeSteps provides general health information only. It is not a doctor and does not diagnose or prescribe. If you are experiencing a medical emergency, call emergency services (112) immediately."*

---

### 3.6 Form Inputs & Textarea Dock

1. **Symptom Chat Input Dock:**
   - White container shell (`#FFFFFF`), border `1px solid #CBD5E1`, radius `16px`, padding `12px 16px`.
   - Textarea: auto-expanding (height 48px up to 140px), placeholder *"Describe your symptoms in your own words..."*.
   - Live Character Counter: `0 / 1000` (`caption-md`, 14px floor).
   - Action cluster: Voice Dictation mic button, Add symptom details button, Send button (circle arrow icon).
   - Privacy footnote: *"Do not share your name, phone number or other personal details."*
2. **Quick Suggestion Chips:**
   - Pill radius `9999px` or `12px`, white background, border `1px solid #CBD5E1`, text `#475569`.
   - Options: `+ I have a headache`, `+ I feel dizzy`, `+ My child has a fever`.

---

## 4. Exact Copy for Every Screen (Word for Word)

### Screen 1: SafeSteps Logo
- **Main Text:** `SafeSteps` (with `Safe` in `#0F172A` and `Steps` in `#0F766E`)
- **Subtext:** `HEALTH GUIDANCE ASSISTANT`

---

### Screen 2: SafeSteps - Home (Desktop)
- **Top Disclaimer Banner:**
  `General information only. Not a diagnosis. In an emergency call 112.`
- **Navigation Links:**
  `How it works` | `Safety` | `Urgency Levels`
- **Emergency Button:**
  `Emergency Help (112)`
- **Start Chat Button:**
  `Start Chat`
- **Hero Section:**
  - Headline: `Understand your symptoms. Know your next step.`
  - Subtitle: `Describe how you feel and get calm, clear guidance on whether to rest at home, see a doctor, or seek urgent care.`
  - Primary CTA: `Start Symptom Chat`
  - Secondary CTA: `How it works`
- **Interactive Triage Preview Card:**
  - Header: `SafeSteps Triage Assistant`
  - User prompt: `I've had a dull headache behind my eyes and light sensitivity since this morning. What should I do next?`
  - Assistant response: `I understand this can feel draining. A dull headache with light sensitivity often stems from digital eye strain, dehydration, or mild tension.`
  - Step 1: `1. Hydrate & Screen Rest: Drink 16 oz water and step away from digital displays for 20 minutes.`
  - Step 2: `2. Dim Ambient Light: Rest your eyes in a softly lit or dark, quiet space.`
  - Input Placeholder: `Type symptoms... e.g. mild fever, persistent cough`
- **Section: "How SafeSteps Guides You":**
  - Section Title: `How SafeSteps Guides You`
  - Subtitle: `Three straightforward steps designed to ease uncertainty in minutes, keeping you safe and informed.`
  - Step 1 Title: `Describe your symptoms`
  - Step 1 Text: `Type in your own words how you are feeling, how long symptoms have lasted, and what hurts. No complicated medical jargon required.`
  - Step 2 Title: `Answer a few questions`
  - Step 2 Text: `The assistant asks simple follow-up questions to understand severity, pain levels, and any key warning signs calmly.`
  - Step 3 Title: `Get your next step`
  - Step 3 Text: `See a clear urgency level with safe guidance on whether home remedies suffice, a clinic visit is best, or urgent care is needed.`
- **Section: "Understand the Urgency Levels":**
  - Section Title: `Understand the Urgency Levels`
  - Subtitle: `Every assessment maps directly to verified medical triage categories so you always know your next action with zero guesswork.`
  - Card 1:
    - Tier: `Self-Care` | Sub-label: `Mild • Reversible`
    - Body: `Can usually be managed safely at home with rest, hydration, over-the-counter care, and simple symptom monitoring.`
    - Examples: `Mild tension headache`, `Seasonal common cold`, `Minor muscular fatigue`
  - Card 2:
    - Tier: `See a Doctor Soon` | Sub-label: `Moderate • Non-Emergency`
    - Body: `Book an appointment within 24 to 48 hours. Symptoms require clinical evaluation, diagnostic tests, or prescription care.`
    - Examples: `Fever persisting beyond 48 hours`, `Earache with unusual discharge`, `Deep, productive chest cough`
  - Card 3:
    - Tier: `Emergency Care` | Sub-label: `Immediate • Critical Attention`
    - Body: `Call emergency dispatch (112 / 108) or proceed to the nearest hospital ER right now. Signs of potentially life-threatening conditions.`
    - Examples: `Crushing chest pain or pressure`, `Sudden weakness, facial drooping`, `Severe, unyielding shortness of breath`
    - Button: `Emergency 112 Dispatch`
- **Section: "Our Safety Promise":**
  - Section Title: `Our Safety Promise`
  - Subtitle: `Engineered with clinical safeguards and ethical guardrails at every touchpoint to protect user safety above all else.`
  - Pillar 1: `We never diagnose` — `We provide structured health guidance and triage context, never definitive medical diagnoses or clinical verdicts.`
  - Pillar 2: `We never recommend medicine doses` — `We will never suggest specific prescription dosages, medication schedules, or pharmaceutical changes without a physician.`
  - Pillar 3: `We always show emergency numbers` — `If your inputs match high-acuity red flags, we instantly surface direct dispatch buttons for 112 and 108.`
  - Pillar 4: `We encourage professional care` — `We always prompt you to consult qualified physicians and provide organized symptom summaries you can readily share.`
- **Call-to-Action Banner:**
  - Headline: `Take the guesswork out of your health symptoms.`
  - Subtitle: `Start a free, confidential guidance conversation now and know exactly what steps to take next.`
  - Button 1: `Start Free Assessment`
  - Button 2: `View Guardrails`
- **Footer:**
  - Tagline: `Know your next step, safely.`
  - Disclaimer 1: `SafeSteps provides automated guidance based on standardized triage algorithms. It does not replace medical consultation, clinical diagnosis, or emergency dispatch protocols.`
  - Disclaimer 2: `This is a college project and not a medical service.`
  - Links: `Safety Protocols` | `Triage Tiers` | `Privacy & Terms`

---

### Screen 3: SafeSteps - Clinical AI Chat (Desktop)
- **Top Disclaimer Banner:**
  `General information only. Not a diagnosis. In an emergency call 112.`
- **Header Actions:**
  `+ New chat` | `Guidance` | `Library` | `History`
- **Session Indicators:**
  `Encrypted Session #SF-204` | `Clinical Guidance Mode` | `Emergency Help (112)`
- **Sub-Header:**
  `Active Health Triage • Session #SF-9140` | `Export` | `Reset`
- **Session Timestamp:**
  `Today, SafeSteps Triage Session • End-to-End Encrypted`
- **Initial Assistant Message:**
  `Hello, I'm SafeSteps. Tell me what you're feeling, and I'll ask a few questions to understand better. How can I help today?`
  *(Timestamp: 10:14 AM • SafeSteps AI Guidance)*
- **User Message:**
  `I've had a fever and a sore throat since yesterday.`
  *(Timestamp: 10:15 AM • Delivered)*
- **Assistant Response:**
  `I'm sorry you're feeling unwell. A few quick questions: How high has the fever been? Do you have difficulty swallowing or breathing? Have you had any cough or body aches?`
  `Preliminary assessment in progress • Non-diagnostic clinical triage`
  *(Timestamp: 10:15 AM • SafeSteps AI Guidance)*
- **Monitoring Card:**
  `Red Flag Check in Progress`
  `Checking: airway patency, rash, stiff neck, extreme lethargy`
  `Private & Secure`
- **Quick Symptom Chips:**
  `+ I have a headache` | `+ I feel dizzy` | `+ My child has a fever`
- **Input Area:**
  - Placeholder: `Describe your symptoms in your own words...`
  - Counter: `0 / 1000`
  - Secondary Action: `Add symptom details`
  - Privacy Reminder: `Do not share your name, phone number or other personal details.`
- **Footer:**
  `Certified SafeSteps Health Protocol • End-to-end encrypted` | `Privacy & Data Ethics` | `Clinical Standards`

---

### Screen 4: SafeSteps - Urgency Result Cards
- **Header Title:**
  `Clinical Guidance Result Cards — 3 Severity Tiers`
  `Standardized Triage Completion Components`
- **Tier Selector Tabs:**
  `Level 1` | `Level 2` | `Level 3`

#### Card Level 1: Self-Care
- **Header Pill:** `SafeSteps AI • Triage Completed • Level 1 Guidance`
- **Badge:** `Level 1: Self-Care`
- **Headline:** `This can usually be managed at home`
- **Section: What this suggests:**
  `Your symptoms appear consistent with a common, mild viral cold. There are currently no red-flag warning signs present, meaning standard home recuperation and supportive care should allow your body to heal comfortably.`
- **Section: What you can do now:**
  - `Rest adequately and avoid strenuous physical activity for the next 24 to 48 hours.`
  - `Maintain continuous hydration with room-temperature water, herbal teas, or warm broths.`
  - `Use safe over-the-counter saline sprays or mild lozenges to soothe throat irritation.`
  - `Monitor your body temperature twice daily (morning and evening).`
- **Section: Warning signs to watch for:**
  - `Fever persisting or climbing above 38.5°C (101.3°F) for more than 3 consecutive days.`
  - `Sudden onset of breathing difficulty, chest tightness, or wheezing.`
  - `Inability to keep fluids down or extreme lightheadedness when standing.`
- **Disclaimer & Actions:**
  - `This is general guidance, not a medical diagnosis.`
  - Buttons: `Start a new chat` | `Show summary`

#### Card Level 2: See Doctor Soon
- **Header Pill:** `SafeSteps AI • Triage Completed • Level 2 Advisory`
- **Badge:** `Level 2: See Doctor Soon`
- **Headline:** `It's a good idea to see a doctor in the next day or two`
- **Section: What this suggests:**
  `Your symptoms indicate a persistent fever and accompanying discomfort that warrants clinical evaluation. While not an immediate emergency, a qualified healthcare professional should examine you within 24 to 48 hours to confirm the underlying cause and recommend targeted care.`
- **Section: What you can do now:**
  - `Schedule an appointment with your family physician, primary care clinic, or general practitioner.`
  - `Log your temperature readings and any medication taken to present directly to your doctor.`
  - `Stay hydrated with electrolyte solutions and rest in a well-ventilated, quiet room.`
  - `Avoid strenuous travel or work commitments until clinically evaluated.`
- **Doctor Preparation Sub-box:**
  - `Doctor visit preparation`
  - `Generate a structured checklist of your reported symptoms.`
  - Button: `How to prepare for your visit`
- **Section: Warning signs that require immediate care:**
  - `Rapid temperature spike over 39.5°C (103°F) unresponsive to standard antipyretics.`
  - `New or spreading rash, stiff neck, or extreme lethargy.`
  - `Severe worsening of throat pain causing difficulty swallowing saliva.`
- **Disclaimer & Actions:**
  - `This is general guidance, not a medical diagnosis.`
  - Buttons: `Start a new chat` | `Show summary`

#### Card Level 3: Immediate Care Required
- **Header Pill:** `SafeSteps AI • Triage Completed • Level 3 Critical Escalation`
- **Badge:** `Level 3: Immediate Care Required`
- **Headline:** `Please seek urgent medical care now`
- **Emergency Call Actions:**
  - Button 1: `Call Emergency Help (112)`
  - Button 2: `Call Ambulance (108)`
- **Section: Immediate Safety Instructions:**
  - `Do not wait to see if symptoms improve on their own.`
  - `Do not drive yourself to the hospital. Arrange emergency transport or ask someone to drive you.`
  - `Stay with someone or keep a trusted contact on the phone line while awaiting emergency assistance.`
- **Section: What this suggests:**
  `The combination of symptoms described poses acute clinical risk that requires immediate emergency evaluation. A hospital emergency department or paramedic team is equipped to diagnose and stabilize this immediately.`
- **Section: Red-flag signs that need instantaneous response:**
  - `Sudden shortness of breath, bluish tint to lips or fingertips, or acute chest pressure.`
  - `Loss of consciousness, confusion, slurred speech, or sudden facial droop.`
- **Disclaimer & Actions:**
  - `This is urgent guidance, not a medical diagnosis. Prioritize calling 112.`
  - Buttons: `Start a new chat` | `Show summary`

---

### Screen 5: SafeSteps - Emergency Alert
- **Top Disclaimer Banner:**
  `General information only. Not a diagnosis. In an emergency call 112.`
- **Main Heading:**
  `This may be an emergency`
- **Subtitle:**
  `Based on what you described, you should get help right now. Please do not wait.`
- **Primary Call Buttons:**
  - Button 1 (64px red): `Call Emergency Services: 112`
  - Button 2 (64px red outlined): `Call Ambulance: 108`
- **Section: "While you wait for help":**
  - Section Title: `While you wait for help`
  - Step 1: `1. Stay calm and sit down if possible.`
  - Step 2: `2. Unlock your door and stay near it.`
  - Step 3: `3. Tell someone nearby.`
  - Step 4: `4. Do not eat or drink anything.`
- **Mental Health Crisis Box:**
  - Title: `If you are having thoughts of harming yourself`
  - Body: `You are not alone. Please reach out to someone you trust or a mental health helpline right now.`
  - Helpline Button: `Tele-MANAS: 14416`
- **Safe Exit:**
  `I'm safe, return to chat`
- **Footer Note:**
  `SafeSteps cannot provide emergency medical care.`

---

### Screen 6: SafeSteps - Chat States & Edge Cases

- **State 01: Loading & Processing State**
  - Badge: `STATE 01` | Title: `Loading & Processing State`
  - Subtitle: `Container constraint: 760px fluid`
  - Description: `Shown while SafeSteps parses symptom context against clinical safety guidelines. Retains steady reassurance, soft movement without aggressive strobing, and temporarily locks inputs to prevent duplicate prompt submission.`
  - Simulated User Message: `I woke up with a dull pressure behind my left temple that throbs when I bend over. It started about 3 hours ago.`
  - Assistant Loading Indicator: `SafeSteps is reviewing your symptoms...` (with 3 pulsating typing dots)
  - Locked Input: lock icon, disabled send button
  - Footnote: `Responses are referenced against verified clinical triage guidelines.`

- **State 02: Empty Welcoming Chat State**
  - Badge: `STATE 02` | Title: `Empty Welcoming Chat State`
  - Subtitle: `First-time consultation entry`
  - Description: `Greets the patient with calming, non-intimidating cues. Prompts initial symptom exploration without requiring clinical terminology.`
  - Hero Prompt: `How are you feeling today?`
  - Body: `Tell me what symptoms or health concerns you're experiencing in your own words. We'll take it step by step together.`
  - Quick Suggestion Chips: `I have a headache` | `I feel dizzy` | `My child has a fever`
  - Trust Badge: `Private, Encrypted & Non-Diagnostic Guidance`

- **State 03: Inline Error Recovery (Failed Response)**
  - Badge: `STATE 03` | Title: `Inline Error Recovery (Failed Response)`
  - Subtitle: `Graceful LLM timeout fallback`
  - Description: `Avoids intimidating stack traces, status 500 codes, or alert fatigue. Replaces an interrupted stream with an actionable retry affordance right inside the stream.`
  - Simulated Question: `Can I take ibuprofen if I already took 500mg paracetamol an hour ago?`
  - Error Box Title: `Sorry, something went wrong on our end. Please try again.`
  - Error Box Subtext: `Your question has been saved. No need to retype.`
  - Buttons: `Retry` | `Start new chat`
  - Advisory Footnote: `If you need urgent dosage guidance, consult a pharmacist or call non-emergency health lines.`

- **State 04: Network Offline Top Sticky Banner**
  - Badge: `STATE 04` | Title: `Network Offline Top Sticky Banner`
  - Subtitle: `Loss of Internet connection`
  - Description: `A calm, non-blocking notification that floats at the top of active consultations. Reassures users their drafted context is retained in local memory while polling for connectivity.`
  - Banner Title: `You appear to be offline. Check your connection to continue.`
  - Banner Subtext: `We'll reconnect automatically as soon as your signal returns.`
  - Status Tag: `Reconnecting...`
  - Footer Note: `Offline mode enabled • Emergency calling remains active at any time`

- **State 05: Input Validation & Constraint States**
  - Badge: `STATE 05` | Title: `Input Validation & Constraint States`
  - Case 5A: `Case 5A • Empty Prompt` (Required badge)
    - Field Label: `Describe your primary symptom`
    - Helper Error: `Please type something before sending.`
    - Disabled Button: `Submit Symptom`
  - Case 5B: `Case 5B • Length Boundary`
    - Counter: `1,042 / 1,000` (in red)
    - Field Label: `Additional medical context & history`
    - Helper Error: `Your message is too long. Please keep it under 1000 characters.`
    - Action: `Trim Automatically`
    - Disabled Button: `Send Update`

- **State 06: Rate Limit & Fast Typing Cooldown**
  - Badge: `STATE 06` | Title: `Rate Limit & Fast Typing Cooldown`
  - Subtitle: `Conversational throttling`
  - Description: `When rapid messages are triggered in short succession, a gentle pause allows SafeSteps to synthesize symptoms accurately without overwhelming the triage model.`
  - Cooldown Title: `Taking a quick breather`
  - Cooldown Message: `You're sending messages very quickly. Please wait a moment so we can carefully organize your guidance notes.`

- **State 07: 404 Not Found Full Screen Layout**
  - Badge: `STATE 07` | Title: `404 Not Found Full Screen Layout`
  - Large Display Number: `404`
  - Heading: `We couldn't find that page`
  - Subtitle: `The health guidance page or triage session you're looking for doesn't exist or may have been moved.`
  - Buttons: `Back to home` | `Start a symptom chat`
  - Emergency Crisis Box:
    - `In a medical crisis?`
    - `Immediate Help: Emergency 112 • Ambulance 108`
    - Button: `Call 112 Now`

---

### Screen 7: SafeSteps - Mobile Landing Page
- **Top Sticky Disclaimer Banner:**
  `General information only. Not a diagnosis. In an emergency call 112.`
- **Header:**
  Brand Icon & `menu` trigger
- **Hero Badge:**
  `Clinical AI Guidance • Non-Diagnostic`
- **Hero Heading:**
  `Understand your symptoms. Know your next step.`
- **Hero Subtitle:**
  `Describe how you feel and get calm, clear guidance on whether to rest at home, see a doctor, or seek urgent care.`
- **Action Buttons:**
  - `Start Symptom Chat` (Primary full-width teal button)
  - `How it works` (Soft container secondary button)
  - Trust Note: `Free. No diagnosis. Your guidance, not a verdict.`
- **Mobile Interactive Triage Preview:**
  - Header: `Interactive Triage Preview • Just now`
  - User snippet: `I've had a dull headache behind my eyes and light sensitivity for about 4 hours.`
  - Response badge: `Level 1: Self-Care Recommended`
  - Summary: `Your symptoms align with a common tension or strain pattern. Initial supportive measures:`
  - Bullet 1: `Hydrate with 300-500ml water & rest`
  - Bullet 2: `Dim ambient light and take a screen break`
- **Section: "How SafeSteps Guides You":**
  - Pill: `Simple Process`
  - Title: `How SafeSteps Guides You`
  - Subtitle: `Three straightforward steps designed to ease uncertainty in minutes.`
  - 01: `Describe your symptoms` — `Type in your own words how you are feeling, how long symptoms have lasted, and what hurts. No complicated medical jargon required.`
  - 02: `Answer a few questions` — `The assistant asks simple follow-up questions to understand severity, pain levels, and any key warning signs calmly.`
  - 03: `Get your next step` — `See a clear urgency level with safe guidance on whether home remedies suffice, a clinic visit is best, or urgent care is needed.`
- **Section: "Understand the Urgency Levels":**
  - Pill: `Clinical Framework`
  - Title: `Understand the Urgency Levels`
  - Subtitle: `Color-coded triaging helps identify the safest course of action without guesswork.`
  - Level 1: `Level 1: Self-Care` (Mild • Reversible) -> `Can usually be managed at home` (Non-acute symptoms that typically resolve with supportive home measures: Adequate sleep and monitored rest, Continuous hydration & balanced electrolytes, Monitor body temperature twice daily)
  - Level 2: `Level 2: See a Doctor Soon` (Non-Emergency) -> `Book an appointment within 24 to 48 hours` (Symptoms requiring formal in-person assessment: Fever > 48 hours, Persistent earache, Deep chest cough) -> Button: `How to prepare for visit`
  - Level 3: `Level 3: Emergency Care` (Urgent) -> `Call 112 or proceed to hospital ER immediately` (Critical warning signs: Crushing chest pain or heart pressure, Sudden limb weakness or slurred speech, Severe shortness of breath or blue lips) -> Button: `Call Emergency 112`
- **Section: "Our Safety Promise":**
  - Pill: `Responsible AI`
  - Title: `Our Safety Promise`
  - 4 Pillars: `We never diagnose`, `We never recommend medicine doses`, `We always show emergency numbers`, `We encourage professional care`
- **Bottom Call-to-Action:**
  - `Take the guesswork out of your health symptoms.`
  - `Get calm, structured guidance in under 3 minutes.`
  - Button: `Start Free Assessment`
- **Footer:**
  - Direct Dispatch Lines: `Police/All (112)` | `Ambulance (108)`
  - Legal Note: `This is a college project and not a medical service. Not evaluated by health regulatory bodies.`
  - Links: `Privacy Policy` | `Terms of Service` | `Clinical Sources`
- **Fixed Bottom Sticky Action Bar:**
  - Red Emergency Help Button: `Emergency Help (112)`

---

## 5. Differences Noticed Between Stitch and the Written Brief

Below is an exhaustive comparison between the initial written brief and the Stitch design system implementation:

| Feature / Attribute | Written Brief | Stitch Design Foundation & Screens | Observed Discrepancy & Technical Impact | Recommended Implementation Choice |
| :--- | :--- | :--- | :--- | :--- |
| **Emergency Telephone Numbers** | Mentions generic *"Emergency Help"* without regional digits. | Uses Indian emergency numbers across screens: **112** (All emergencies), **108** (Ambulance), and **14416** (Tele-MANAS Mental Health). One Style Guide card references **911**. | Inconsistency between regional dispatch codes (India 112/108 vs US 911). | Adopt **112** as the primary national emergency number (consistent across all 7 user-facing Stitch screens) with a configurable environment variable `NEXT_PUBLIC_EMERGENCY_NUMBER=112`. |
| **Background Canvas Color** | Background specified as `#F8FAFC` (Slate 50). | Stitch CSS theme sets `surface: #F8F9FF` (a cool blue tint), while the Style Guide markdown specifies `--page-background: #F8FAFC / #F8F9FF`. | Slight color tint variance between `#F8FAFC` (neutral warm slate) and `#F8F9FF` (cool tinted ice). | Use `#F8FAFC` as the base canvas with `#FFFFFF` for content cards and `#EFF4FF` for subtle container contrast. |
| **Primary Color Mapping** | Primary teal specified as `#0F766E`. | Stitch Material tokens define `primary: #005c55` and `primary-container: #0f766e`, but all interactive buttons and highlights explicitly render in `#0F766E`. | The visual UI is strictly `#0F766E`, but backend Material theme variables contain `#005C55`. | Keep `--primary: #0F766E` as the authoritative single source of truth across all components. |
| **Top Disclaimer Banner Copy** | Brief specifies: `disclaimer banner #E0F2FE with #075985 text`. | Stitch implements this as a fixed, 32px top strip on every screen with exact copy: *"General information only. Not a diagnosis. In an emergency call 112."* | The brief specified color tokens; Stitch provided the exact persistent layout placement and string copy. | Adopt the Stitch persistent top banner with `#E0F2FE` background, `#BAE6FD` border, and `#075985` text. |
| **Emergency Button Placement** | Brief asks for: *"an always-visible red Emergency Help button"*. | Desktop screens place it in the top header (`Emergency Help (112)` in Red `#DC2626`). Mobile places it in both the header and as a sticky bottom bar. | Both approaches fulfill the brief; mobile provides an additional persistent bottom floating action. | Implement desktop header anchor + mobile bottom sticky dock for 100% viewport reachability. |
| **Disclaimer & Academic Scope** | Standard disclaimer: *"SafeSteps provides general health information only. It is not a doctor and does not diagnose or prescribe."* | Stitch includes an additional footnote in Home & Mobile landing footers: *"This is a college project and not a medical service."* | Additional transparency copy present in Stitch. | Include both disclaimers in the footer to preserve full compliance with academic/portfolio transparency. |
| **Clinical Session & Security Badges** | Not explicitly mentioned in the brief. | Stitch includes rich UX metadata tags: `"Encrypted Session #SF-204"`, `"Clinical Guidance Mode"`, `"Red Flag Check in Progress"`, and `"End-to-End Encrypted"`. | Adds significant clinical credibility and reassurance to the patient experience. | Implement these badges as lightweight, reusable component props. |
| **Doctor Preparation Feature** | Not mentioned in the brief. | Level 2 results and Mobile landing include a *"How to prepare for your visit"* symptom checklist generator. | Significant UX enhancement that helps users prepare questions before speaking to a doctor. | Include the checklist button on Level 2 result cards. |

---

---

## 7. Level 2 Design Specification & Implementation Blueprint

> **Level 2 Architectural Scope:** Full authenticated patient experience, secure account management, clinical health profile baseline, persistent triage consultation history, multi-stage medical report explainer with OCR extraction, doctor visit summary preview & printable consultation brief, user preferences and GDPR data management, multi-lingual localization (English, தமிழ், हिन्दी), and comprehensive system resiliency specimens.  
> **Status:** Draft / Specification Phase *(No application code written)*.

---

### 7.1 Screen Inventory Table (Level 2)

| Screen Name (Stitch) | Device Target | Dimensions (px) | Application Route Mapping | Purpose & Architectural Role |
| :--- | :--- | :--- | :--- | :--- |
| **SafeSteps - Level 2 Component Library & Style Guide** | Desktop / Master | 1280 × 4200 | Design Token Specimen | Master component library specifying form fields, button states, confirmation modals, toasts, vitals table, dropzone, language switcher, citations, and skeletons. |
| **SafeSteps - Sign Up (Create Account)** | Desktop | 1280 × 960 | `/signup` | User onboarding with full name, email, password strength meter, confirmation matching, and mandatory health data processing consent. |
| **SafeSteps - Sign Up Mobile** | Mobile | 390 × 1020 | `/signup` (Mobile) | Mobile-adapted registration flow with 48px touch targets, expandable medical disclaimer, and sticky 112 emergency trigger. |
| **SafeSteps - Log In (Sign In)** | Desktop | 1280 × 900 | `/login` | Patient login interface with email/password inputs, "Keep me signed in" checkbox, password reset navigation, and 256-bit encryption trust badges. |
| **SafeSteps - Log In Mobile** | Mobile | 390 × 960 | `/login` (Mobile) | Mobile-optimized sign in screen featuring single-column touch fields, privacy reassurance banner, and quick registration links. |
| **SafeSteps - Log In Error States & Validation** | Desktop / State | 1280 × 1100 | `/login` (Error States) | Resilient authentication failure states: global invalid credentials banner, inline field format errors, empty input boundaries, and rate-limiting lockout banner. |
| **SafeSteps - Forgot Password (Request Reset)** | Desktop | 1280 × 900 | `/forgot-password` | Account recovery entry point: email submission field, 60-minute link expiry notice, and return to sign in link. |
| **SafeSteps - Check Email Confirmation** | Desktop | 1280 × 900 | `/check-email` *(or `/forgot-password/sent`)* | Immediate user feedback upon requesting reset: dynamic email confirmation, instructions notice, and 45-second resend cooldown timer. |
| **SafeSteps - Set New Password** | Desktop | 1280 × 900 | `/reset-password` | Secure password update interface: new password field with progressive 4-segment strength meter, confirmation match check, and automatic login redirect. |
| **SafeSteps - Privacy & Consent Onboarding** | Desktop | 1280 × 1060 | `/consent` | Clinical onboarding step: 4 structured privacy cards ("What we store", "What we never do", "Your control", "What SafeSteps is"), and mandatory legal checkboxes. |
| **SafeSteps - Privacy & Consent Onboarding Mobile** | Mobile | 390 × 1180 | `/consent` (Mobile) | Mobile-tailored consent flow with card-based readability, explicit non-diagnostic acknowledgements, and full-width "Agree & Continue" button. |
| **SafeSteps - Signed-in App Shell with Collapsible Sidebar** | Desktop / Layout | 1280 × 900 | App Shell / Root Layout | Global authenticated application shell: 240px expanded / 64px collapsed sidebar, user profile card, route breadcrumbs, language switcher, and emergency 112 trigger. |
| **SafeSteps - Health Profile** | Desktop | 1280 × 1260 | `/profile` | Clinical baseline management: age, sex at birth, height, weight, language preference, allergy tags (e.g. Penicillin), chronic conditions (Asthma), regular medications, and destructive delete zone. |
| **SafeSteps - Signed-in Chat Updates** | Desktop | 1280 × 1040 | `/chat` (Authenticated) | Enhanced triage consultation incorporating patient health profile context, red-flag monitoring pill, tap-to-answer quick replies, 3-step progress bar, and GP summary generator. |
| **SafeSteps - Conversations History** | Desktop | 1280 × 1060 | `/history` | Consultation archive: keyword symptom search, urgency filter tabs (All, Level 3, Level 2, Level 1), chronological session cards, empty states, and clear history modal. |
| **SafeSteps - Report Explainer: Upload Document** | Desktop | 1280 × 1060 | `/reports` | Medical document intake: drag-and-drop dropzone supporting PDF, JPG, PNG (max 10MB), feature highlights (Translations, Reference Ranges, GP Questions), and past report list. |
| **SafeSteps - Report Explainer: Processing & Parsing** | Desktop / Pipeline | 1280 × 1040 | `/reports/processing` | Visual parsing pipeline: 4-stage stepper (Upload -> Extraction -> Plain English Translation -> GP Questions), percentage bar, and privacy enclave note. |
| **SafeSteps - Report Explainer: Results & Plain English Breakdown** | Desktop | 1280 × 1640 | `/reports/[id]` | Comprehensive report analysis: executive summary card, interactive lab parameter table with normal/elevated/low badges, expandable clinical notes, doctor discussion questions, and PDF export. |
| **SafeSteps - Doctor Visit Summary Preview** | Desktop | 1280 × 1240 | `/summary/[conversationId]` | Standardized clinical intake brief for doctors: patient info, reported symptoms & timeline, triage assessment with NICE/NHS citations, suggested doctor questions with checkboxes, and print/PDF triggers. |
| **SafeSteps - Settings & Preferences** | Desktop | 1280 × 1240 | `/settings` | User configuration: personal details, JSON data archive download, consultation history purge, health profile personalization toggle, language picker, consent audit trail, and account deletion. |
| **SafeSteps - Level 2 New States & Interactive Components** | Desktop / Resiliency | 1280 × 2800 | System Resiliency | Edge states library: 3 empty states, skeleton data hydration loaders, file upload validation errors (unsupported type, >5MB, illegible OCR), session timeout warning, and 403 access control. |

---

### 7.2 Level 2 Design Tokens & Reusable Component Catalog

#### 1. Form Fields & Input Controls
- **Standard Input Box:** Height 48px, 12px border radius (`rounded-md`), 1px solid `#E2E8F0` border, 16px font size with 24px line height (`body-md`). Focus state: `border-color: #0F766E` with `box-shadow: 0 0 0 3px #CCFBF1`.
- **Floating / Stacked Labels:** 14px medium slate (`#475569`) positioned with 6px vertical spacing above input. Required fields indicated with a prominent red asterisk `*` (`#DC2626`).
- **Password Input with Visibility Toggle:** Includes an embedded end-adornment icon button (`visibility` / `visibility_off`) with 20px SVG icon and 48px touch target.
- **Real-Time Password Strength Meter:**
  - 4 progressive horizontal indicator bars (25% each, 4px height, 4px rounded).
  - Strength states: **Weak** (1 bar, `#DC2626`), **Fair** (2 bars, `#EA580C`), **Good** (3 bars, `#D97706`), **Strong** (4 bars, `#16A34A`).
  - Validation requirement pills: `8+ chars`, `letters & numbers`, `special character` rendering green with checkmark when satisfied.
- **Validation Error States:**
  - Container border turns solid 1.5px `#DC2626`.
  - Background tints to subtle `#FEF2F2`.
  - Helper message appears below with `error` icon in 14px `#DC2626`.

#### 2. Clinical Data Table (Lab Parameters)
- **Container:** Elevated white surface card (`#FFFFFF`) with 1px border (`#E2E8F0`) and 12px border radius.
- **Table Headers (`<th>`):** 14px semibold slate (`#475569`), uppercase tracking `0.05em`, light background (`#F8FAFC`), 12px vertical and 16px horizontal padding.
- **Table Rows (`<tr>`):** 16px regular text (`#0F172A`), alternating subtle zebra striping, smooth hover highlight (`#F1F5F9`).
- **Interactive Accordion Details:** Clicking any row expands an inline panel revealing:
  - *What this test measures* (Plain English summary).
  - *Standard reference ranges* with demographic baseline.
  - *Clinical insight & doctor guidance*.
- **Mobile Responsive Transformation:** On viewports < 768px, the table collapses gracefully into stacked, touch-friendly parameter cards with prominent status chips.

#### 3. Status Chips & Urgency Indicators
- **Normal / In Range:** Text & Icon `#16A34A`, Background `#DCFCE7`, Border `#86EFAC`.
- **Elevated / High:** Text & Icon `#D97706`, Background `#FEF3C7`, Border `#FDE68A`.
- **Low / Below Range:** Text & Icon `#0284C7`, Background `#E0F2FE`, Border `#BAE6FD`.
- **Critical / Out of Range:** Text & Icon `#DC2626`, Background `#FEE2E2`, Border `#FCA5A5`.
- **Triage Badges:**
  - `Level 1: Self-Care` (Green pill)
  - `Level 2: See Doctor Soon` (Amber pill)
  - `Level 3: Emergency Care` (Red pill with pulsating beacon)
- **Tag Attributes:** 8px horizontal padding, 4px vertical padding, 9999px pill border radius, 13px font size with 600 weight.

#### 4. Modals & Dialog Overlays
- **Backdrop:** `rgba(15, 23, 42, 0.6)` with `backdrop-filter: blur(4px)`.
- **Dialog Surface:** Centered elevated card, max width 480px, 16px border radius, 24px inner padding, accessible focus trap and Escape key listener.
- **Dialog Variants:**
  - *Clear Conversation History Modal:* Title "Clear Conversation History?", warning text, secondary "Keep history" button, primary destructive "Yes, clear history" button (`#DC2626`).
  - *Delete Account Modal:* Irreversible warning banner, requires typing "DELETE" to confirm, primary destructive "Delete account permanently" action.
  - *Edit Measured Lab Value Modal:* Allows manual numeric correction of misread OCR lab numbers with value field and unit selector.
  - *Sign Out Modal:* Clean confirmation dialog preventing accidental session dismissal.

#### 5. Toast Notifications & System Alerts
- **Positioning:** Fixed top-right (desktop) / top-center (mobile) with z-index 9999, 12px margins, entrance slide-down animation.
- **Success Toast:** Icon `check_circle`, border `#86EFAC`, background `#F0FDF4`, text `#15803D`. e.g., *"Profile updated successfully"*, *"Link copied to clipboard"*.
- **Error Toast:** Icon `error`, border `#FCA5A5`, background `#FEF2F2`, text `#B91C1C`. e.g., *"Unable to save your changes"*.
- **Warning Toast:** Icon `warning`, border `#FDE68A`, background `#FFFBEB`, text `#B45309`. e.g., *"Session will expire in 5 minutes"*.
- **Auto-dismiss:** Automatically slides out after 4000ms with manual close button.

#### 6. Drag-and-Drop Document Dropzone
- **Idle State:** 2px dashed border (`#CBD5E1`), background `#F8FAFC`, centered cloud upload icon (`#0F766E`), heading "Drag and drop your medical report here", subtitle with file constraints (PDF, JPG, PNG up to 10MB), and secondary "Browse files" button.
- **Drag-Over State:** Border turns solid 2px `#0F766E`, background shifts to soft teal wash `#F0FDFA`, scale transforms `scale(1.01)`.
- **Upload Progress State:** Displays file name, file size (MB), animated indeterminate / progress bar (0% to 100%), and cancel button.
- **Success Preview Card:** Shows file thumbnail icon, file name, upload timestamp, green `check_circle` "Ready to analyze", and "Remove / Replace" action.
- **Error States:** Distinct red warning states for unsupported format (e.g. DOCX), oversized file (>10MB), or unreadable OCR document.

#### 7. Tabs & Filter Navigation
- **History Tabs:** Horizontal pills with active indicator: `All Consultations`, `Urgent (Level 3)`, `Doctor Review (Level 2)`, `Self-Care (Level 1)`.
- **Settings Tabs:** Segmented navigation: `Account`, `Privacy & Data`, `Health Personalisation`, `Consent Records`.
- **Report Breakdown Tabs:** `Plain English Summary`, `Biomarker Table`, `Doctor Questions`.
- **Tokens:** Active tab has solid primary fill (`#0F766E`) or primary underline (2px `#0F766E`) with bold text; inactive tabs use muted slate (`#475569`).

#### 8. Multi-Language Switcher
- **Supported Locales:**
  - **English (US / UK):** Default interface language.
  - **Tamil (தமிழ்):** Native script translations for symptom guidance, emergency alerts, and questions.
  - **Hindi (हिन्दी):** Devanagari script translations for triage outcomes and navigation.
- **Component Style:** Header dropdown button displaying language globe icon (`translate`), current language label, and chevron. Dropdown menu lists native language names in their respective scripts.

#### 9. Clinical Citation Chips
- **Purpose:** Provide transparent evidence base for recommendations, fulfilling NHS DCB0129 clinical safety principles.
- **Visual Token:** Compact pill with `menu_book` or `verified` icon, 12px font size, subtle slate border (`#E2E8F0`), soft background (`#F1F5F9`), text `#0F766E`.
- **Instances:**
  - `NICE Guideline CG191 (Pneumonia in adults)`
  - `NHS Pathways v31 Clinical Triage`
  - `NHS DCB0129 Clinical Safety Aligned`
  - `PubMed / BMJ Best Practice Reference`
- **Interaction:** Hover/click displays an accessible tooltip or modal with guideline summary and official external source link.

#### 10. Collapsible Navigation Sidebar (App Shell)
- **Dimensions:** Expanded width **240px**; Collapsed icon-rail width **64px**; Smooth 200ms cubic-bezier transition.
- **Header:** SafeSteps brand icon + wordmark, accompanied by sidebar collapse toggle button (`menu_open` / `menu`).
- **Primary CTA:** `+ New chat` full-width button (44px height, teal fill `#0F766E`, white text). In collapsed mode, shrinks to circle button with `+` icon.
- **Navigation Links:**
  - `Chat` (`chat_bubble` icon, route: `/chat`, shows active teal left border indicator).
  - `My reports` (`description` icon, route: `/reports`, shows numerical count badge e.g. "2").
  - `Health profile` (`verified_user` icon, route: `/profile`).
  - `History` (`history` icon, route: `/history`).
  - `Settings` (`settings` icon, route: `/settings`).
- **User Profile Footer:**
  - User avatar circle with patient initials (`AP`), patient name (**Ananya Patel**), and email address (**ananya.patel@healthnet.nhs.uk**).
  - Quick menu trigger offering "View Profile" and "Sign out".
- **Mobile Drawer:** On mobile viewports (< 1024px), collapses off-canvas and opens via header hamburger icon with backdrop dimming.

#### 11. Skeleton Loaders & Perceptual Loading
- **Animation:** Continuous subtle shimmer gradient (`linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)`, 1.5s infinite pulse).
- **Primitives:** Text line skeletons (heights 16px, 20px, 28px with `rounded-md`), avatar circle skeleton (40px `rounded-full`), card skeleton containers, and table row skeletons.

---

### 7.3 Exact Copy Inventory for Every Level 2 Screen

#### Screen 9: SafeSteps - Sign Up (Create Account) (`/signup`)
- **Top Disclaimer Banner:** `General information only. Not a diagnosis. In an emergency call 112.` | Button: `Call 112`
- **Brand Wordmark:** `SafeSteps Health Guidance Assistant`
- **Card Heading:** `Create your SafeSteps account`
- **Card Subtitle:** `Join SafeSteps for calm, guided triage and personalized care tracking.`
- **Field 1:** Label: `Full name *` | Placeholder: `e.g. Ananya Patel`
- **Field 2:** Label: `Email address *` | Placeholder: `name@example.com`
- **Field 3:** Label: `Password *` | Visibility toggle: `visibility` | Strength label: `Strong password` | Status pills: `8+ characters`, `letters & numbers`, `special character`
- **Field 4:** Label: `Confirm password *` | Visibility toggle: `visibility` | Match indicator: `Passwords match`
- **Checkbox:** `I agree to SafeSteps Terms of Service and Privacy Policy, including processing my health-related information as described.`
- **Primary Button:** `Create account arrow_forward`
- **Footer Text:** `Already have an account? Sign in`
- **Trust Badge:** `verified_user We never share your health information. All data encrypted end-to-end.`

#### Screen 10: SafeSteps - Sign Up Mobile (`/signup` - Mobile)
- **Header:** Brand Logo | Disclaimer trigger: `info General information only. Not a diagnosis. In an emergency call 112. expand_more`
- **Expandable Note:** `SafeSteps provides supportive health guidance and does not replace professional medical evaluation. Always contact local emergency services if symptoms are severe or rapidly worsening.`
- **Hero Badge:** `verified_user Private & secure`
- **Heading:** `Create your SafeSteps account`
- **Subtitle:** `We never share your personal health details. Sign up for calm, structured guidance.`
- **Inputs:** Same fields as desktop optimized for touch targets (48px input height, 16px font to prevent iOS auto-zoom).
- **Button:** `Create account arrow_forward`
- **Bottom Link:** `Already registered? Sign in`

#### Screen 11: SafeSteps - Log In (Sign In) (`/login`)
- **Top Disclaimer Banner:** `General information only. Not a diagnosis. In an emergency call 112.` | Button: `Call 112`
- **Heading:** `Welcome back`
- **Subtitle:** `Sign in to access your previous symptom assessments and care summaries.`
- **Field 1:** Label: `Email address` | Placeholder: `name@example.com`
- **Field 2:** Label: `Password` | Right link: `Forgot password?`
- **Row:** Checkbox: `Keep me signed in on this device`
- **Primary Button:** `Log in arrow_forward`
- **Footer Text:** `Don't have an account? Create one`
- **Trust Note:** `lock We never share your health information. 256-bit clinical encryption.`

#### Screen 12: SafeSteps - Log In Mobile (`/login` - Mobile)
- **Top Bar:** Brand Wordmark | Emergency trigger `call 112`
- **Badge:** `verified_user Welcome back`
- **Heading:** `Sign in to access your health profile and history`
- **Inputs:** `Email address`, `Password`
- **Options:** `Keep me signed in`, `Forgot password?`
- **Action Button:** `Sign In arrow_forward`
- **Alternative:** `New to SafeSteps? Create account`

#### Screen 13: SafeSteps - Log In Error States & Validation (`/login` - Errors)
- **Global Error Banner:**
  - Icon: `error`
  - Title: `Email or password is incorrect`
  - Body: `Please double-check your credentials and try again.`
  - Action: `close`
- **Field Format Error:**
  - Field: `Email address *`
  - Error: `Invalid format e.g. name@example.com`
- **Field Required Error:**
  - Field: `Password *`
  - Error: `Password is required`
- **Rate Limit Lockout Banner:**
  - Icon: `lock_clock`
  - Title: `Taking a quick breather`
  - Body: `Too many unsuccessful login attempts. For security, please wait 60 seconds before trying again.`

#### Screen 14: SafeSteps - Forgot Password (Request Reset) (`/forgot-password`)
- **Icon:** `lock_reset`
- **Heading:** `Reset your password`
- **Subtitle:** `Enter the email associated with your account, and we’ll send you a secure link to reset your password.`
- **Field:** Label: `Email address` | Placeholder: `ananya.patel@healthnet.nhs.uk`
- **Primary Button:** `Send reset link arrow_forward`
- **Back Navigation:** `arrow_back Back to log in`
- **Helper Note:** `The link expires after 60 minutes for your security.`

#### Screen 15: SafeSteps - Check Email Confirmation (`/check-email`)
- **Icon Badge:** `mark_email_unread` with green checkmark
- **Heading:** `Check your email`
- **Subtitle:** `We've sent a reset link to your email`
- **Body:** `We sent a password reset link to ananya.patel@healthnet.nhs.uk. Click the link inside the email to set a new password. The link will expire in 60 minutes.`
- **Secondary Action:** `Resend email (wait 45s)` / `Resend reset email`
- **Return Action:** `Back to login`

#### Screen 16: SafeSteps - Set New Password (`/reset-password`)
- **Icon:** `lock_reset`
- **Heading:** `Set new password`
- **Subtitle:** `Your new password must be different from previously used passwords for security.`
- **Field 1:** Label: `New password` | Placeholder: `Enter new password` | Visibility toggle: `visibility` | Strength: `Strength: Strong` | Status checklist: `check_circle 8+ chars, letters & numbers`
- **Field 2:** Label: `Confirm new password` | Placeholder: `Re-enter new password` | Visibility toggle: `visibility`
- **Primary Button:** `Update password and log in arrow_forward`
- **Success Notice:** `check_circle Password updated successfully. Redirecting to your dashboard...`

#### Screen 17: SafeSteps - Privacy & Consent Onboarding (`/consent`)
- **Step Pill:** `Step 1 of 2`
- **Heading:** `Your privacy matters`
- **Subtitle:** `Here is how SafeSteps handles your health information with care.`
- **Security Notice:** `verified_user Your data is encrypted end-to-end. We maintain clinical-grade safeguards that put your safety and autonomy first.`
- **Card 1 (What we store):** Heading: `What we store` | Body: `Your profile, past consultation summaries, and uploaded lab documents are securely stored in encrypted vaults so you can reference them across sessions.`
- **Card 2 (What we never do):** Heading: `What we never do` | Body: `We never sell your data, use your private medical details to train public AI models, or share information with insurance companies or employers.`
- **Card 3 (Your control):** Heading: `Your control` | Body: `You can download your entire medical record archive, purge consultation history, or permanently delete your account anytime in Settings.`
- **Card 4 (What SafeSteps is):** Heading: `What SafeSteps is` | Body: `A non-diagnostic guidance assistant. SafeSteps provides supportive clinical triaging and educational explanations. It does not replace emergency medical services or doctors.`
- **Consent Checks:**
  - `[x] I understand SafeSteps provides general health information and cannot diagnose or prescribe (Mandatory).`
  - `[x] I consent to the processing of my health data to receive personalized triage assessments (Mandatory).`
  - `[ ] I agree to share anonymized interaction logs to help improve triage safety (Optional).`
- **Buttons:** `Agree & Continue arrow_forward` | `Decline & Exit`

#### Screen 18: SafeSteps - Privacy & Consent Onboarding Mobile (`/consent` - Mobile)
- **Top Badge:** `verified_user Quick setup`
- **Heading:** `Your privacy & consent`
- **Subtitle:** `Before we begin, please review how SafeSteps safeguards your private health details.`
- **Mobile Cards:** Compact presentation of the 4 principles with easy-to-tap checkboxes (min 44px hit target).
- **Bottom Dock:** Sticky "Agree & Continue" button with reassuring subtext: `You can change your consent preferences anytime in Settings.`

#### Screen 19: SafeSteps - Signed-in App Shell with Collapsible Sidebar (Global Layout)
- **Persistent Top Disclaimer:** `info General information only. Not a diagnosis. In an emergency call 112.` | Button: `Emergency 112`
- **Top Navigation Bar:**
  - Breadcrumbs: `SafeSteps Portal / Care Navigation`
  - Language Picker: `translate English (US) expand_more` (Options: English, தமிழ், हिन्दी)
  - Emergency Trigger: `call 112 Emergency Help`
- **Collapsible Sidebar:**
  - Brand Header: SafeSteps Logo + `menu_open` collapse button
  - CTA Button: `add New chat`
  - Menu Item 1: `chat_bubble Chat` (Active pill)
  - Menu Item 2: `description My reports` (Badge: `2`)
  - Menu Item 3: `verified_user Health profile`
  - Menu Item 4: `history History`
  - Menu Item 5: `settings Settings`
  - User Card: Avatar `AP` | Name: `Ananya Patel` | Email: `ananya.patel@healthnet.nhs.uk` | Trigger: `expand_more` (Menu: "View profile", "Sign out")

#### Screen 20: SafeSteps - Health Profile (`/profile`)
- **Breadcrumb:** `SafeSteps Portal / Health profile`
- **Heading:** `Health profile`
- **Subtitle:** `Help SafeSteps tailor symptom guidance by keeping your personal background, allergies, and regular medications up to date.`
- **Section 1: Basics**
  - `Age`: 32
  - `Sex at birth`: Female
  - `Height`: 165 cm
  - `Weight`: 62 kg
  - `Preferred consultation language`: English (Dropdown: English, தமிழ், हिन्दी)
- **Section 2: Allergies**
  - Section note: `Medications or foods that cause adverse reactions.`
  - Existing Tag 1: `warning Penicillin (Severe - hives / wheeze)`
  - Existing Tag 2: `Peanuts (Mild)`
  - Action: `+ Add allergy`
- **Section 3: Health conditions**
  - Section note: `Pre-existing or long-term chronic conditions.`
  - Existing Tag: `Asthma (mild intermittent)`
  - Action: `+ Add health condition`
- **Section 4: Current medicines**
  - Section note: `Regular prescriptions or over-the-counter drugs.`
  - Card 1: `Salbutamol inhaler` — `100mcg PRN (as needed)`
  - Card 2: `Cetirizine` — `10mg daily`
  - Action: `+ Add medicine`
- **Section 5: Preferences**
  - `Consultation tone`: Calm & Detailed (Radio options: Calm & Detailed, Quick & Direct)
  - `Measurement units`: Metric (kg, cm, °C) / Imperial (lbs, ft, °F)
- **Section 6: Destructive Zone**
  - Title: `Delete my health profile`
  - Warning: `Permanently erases all clinical baseline data from SafeSteps servers.`
  - Button: `Delete profile`

#### Screen 21: SafeSteps - Signed-in Chat Updates (`/chat` - Authenticated)
- **Active Context Banner:** `verified_user Profile Active: Ananya Patel (Age 32 • Asthma • Penicillin Allergy)`
- **Red Flag Monitor:** `security Red-Flag Monitoring Active • End-to-End Encrypted #SF-84920`
- **AI Response Integration Example:**
  - AI Message: `"Hello Ananya. I see in your health profile that you have a history of mild intermittent asthma. Given your report of fever and new dry cough, does your chest tightness feel like your usual asthma symptoms, or is it different this time?"`
- **Interactive Quick-Reply Chips:**
  - `"Feels like asthma"`
  - `"Different / tighter"`
  - `"No wheezing"`
  - `"Short of breath walking"`
- **Progress Tracker:** `1. Reported Symptoms (Done) -> 2. Clinical Questions (Active) -> 3. Care Next Step`
- **Post-Triage Action Dock:**
  - `assignment_turned_in View Doctor Visit Summary` (Navigates to `/summary/[conversationId]`)
  - `download Download PDF Brief`
  - `bookmark Save to My Reports`

#### Screen 22: SafeSteps - Conversations History (`/history`)
- **Breadcrumb:** `SafeSteps Portal / History`
- **Heading:** `Your conversations`
- **Subtitle:** `Review your previous symptom assessments, advice summaries, and GP visit briefs.`
- **Controls Bar:**
  - Search Input: `search Search conversations by symptom...`
  - Filter Tabs: `All`, `Urgent (Level 3)`, `Doctor Review (Level 2)`, `Self-Care (Level 1)`
  - Secondary Action: `delete_outline Clear history` (Opens confirmation modal)
- **History Cards:**
  - **Item 1:** Title: `Fever & Chills Assessment` | Date: `24 October 2024, 19:47` | Badge: `Level 2: Consult Doctor` (Amber) | Excerpt: `3-day persistent fever (38.6°C) and new dry cough with mild chest tightness. Advised GP review within 24–48 hours.` | Actions: `View Summary` | `Download PDF`
  - **Item 2:** Title: `Dull Tension Headache` | Date: `12 October 2024, 14:15` | Badge: `Level 1: Self-Care` (Green) | Excerpt: `Frontal headache following screen exposure. Recommended hydration, rest, and dim environment.` | Actions: `View Summary`
- **Pagination:** `Showing 1–2 of 2 conversations`

#### Screen 23: SafeSteps - Report Explainer: Upload Document (`/reports`)
- **Breadcrumb:** `SafeSteps Portal / My reports`
- **Heading:** `Medical Report Explainer`
- **Subtitle:** `Upload your lab results or clinical letters to get clear, plain-English explanations without confusing medical jargon.`
- **Pillars:**
  - `description Plain-English Translations` — `Translates complex pathology metrics into simple, understandable terms.`
  - `tune Reference Range Context` — `Visualizes whether your biomarkers fall in normal, low, or high clinical ranges.`
  - `quiz Doctor Discussion Questions` — `Prepares targeted, intelligent questions to ask your GP at your next visit.`
- **Dropzone Area:**
  - Icon: `cloud_upload`
  - Primary Text: `Drag and drop your medical report here`
  - Subtext: `Supports PDF, JPG, PNG up to 10MB (blood tests, pathology, radiology summaries).`
  - Button: `Browse files`
  - Compliance Note: `lock Your files are encrypted and processed securely in compliance with UK GDPR / HIPAA principles.`
- **Previous Reports Section:**
  - Heading: `Previous reports`
  - Card 1: `Complete Blood Count (CBC) & Iron Panel` — `Uploaded 22 Oct 2024 • Status: Ready` — Button: `View Breakdown`
  - Card 2: `Comprehensive Metabolic Panel (CMP)` — `Uploaded 10 Sep 2024 • Status: Ready` — Button: `View Breakdown`

#### Screen 24: SafeSteps - Report Explainer: Processing & Parsing (`/reports/processing`)
- **Heading:** `Analyzing your document...`
- **Subtitle:** `SafeSteps is extracting lab parameters, evaluating clinical reference ranges, and generating clear explanations.`
- **Stepper Timeline:**
  - Step 1: `check_circle Uploading document` — `Completed`
  - Step 2: `check_circle Extracting lab values & test metrics` — `Completed (14 parameters found)`
  - Step 3: `sync Translating medical jargon to plain English` — `In progress...`
  - Step 4: `radio_button_unchecked Preparing GP discussion questions` — `Pending`
- **Progress Bar:** `75% Complete` (Animated teal fill)
- **Security Callout:** `security Strict privacy safeguards active: Document processed in an ephemeral memory enclave. Files are never used for public AI model training.`
- **Timing Note:** `Usually takes 10–15 seconds. Please do not close this window.`

#### Screen 25: SafeSteps - Report Explainer: Results & Plain English Breakdown (`/reports/[id]`)
- **Breadcrumb:** `My reports / Complete Blood Count (CBC) & Iron Panel`
- **Document Header:**
  - Title: `Complete Blood Count (CBC) & Iron Panel`
  - Metadata: `Analyzed on 24 Oct 2024 • Source: Quest Diagnostics / NHS Lab`
  - Actions: `print Print` | `download Download PDF` | `edit_note Edit values (Correct misread numbers)`
- **Executive Card ("At a glance"):**
  - Badge: `Overall Status: 1 Value Outside Standard Range`
  - Text: `Your test results show a slightly elevated white blood cell count (WBC), which is common when your body is fighting off a mild viral or bacterial infection. Your hemoglobin, platelet count, and red blood cells are all in optimal healthy ranges.`
- **Interactive Lab Results Table:**
  - Header Columns: `Parameter`, `Your Result`, `Reference Range`, `Status`, `Clinical Context`
  - Row 1: `White Blood Cells (WBC)` | `11.8 x10^9/L` | `4.0 - 11.0 x10^9/L` | Status: `Elevated` (Amber) | Context: `Slightly elevated. Indicates active immune response (e.g. fever/infection).`
  - Row 2: `Hemoglobin (Hb)` | `13.5 g/dL` | `12.0 - 15.5 g/dL` | Status: `Normal` (Green) | Context: `Optimal oxygen delivery capacity in blood.`
  - Row 3: `Platelet Count` | `240 x10^9/L` | `150 - 450 x10^9/L` | Status: `Normal` (Green) | Context: `Normal clotting ability.`
  - Row 4: `Serum Ferritin (Iron)` | `48 ng/mL` | `20 - 200 ng/mL` | Status: `Normal` (Green) | Context: `Healthy iron stores.`
- **Section: "Questions for Your Doctor":**
  - Q1: `"Could my slightly elevated WBC count be related to my recent 3-day fever and cough?"`
  - Q2: `"Do I need any follow-up blood tests in a few weeks to ensure levels have normalized?"`
- **Regulatory Disclaimer:** `Medical report analysis is for educational purposes only. Never adjust medication dosages or diagnose conditions without a doctor.`

#### Screen 26: SafeSteps - Doctor Visit Summary Preview (`/summary/[conversationId]`)
- **Breadcrumb:** `Consultations / Fever & Chills Assessment / Visit Summary Preview`
- **Action Bar:** `arrow_back Back to chat` | `content_copy Copy link` | `print Print summary` | `download Download PDF`
- **Clinical Banner:**
  - Icon: `assignment_turned_in`
  - Title: `Prepared for medical consultation`
  - Subtitle: `This printable summary is structured to take directly to your GP appointment, show to an out-of-hours triage nurse, or upload to your surgery's online consultation service (eConsult / Patchs / Accurx).`
  - Verification Badge: `verified SafeSteps Patient Health Record Intake • Verification #SF-84920 • Reference: SS-UK-9021`
- **Document Content:**
  - **Header:** `Visit summary for your doctor` | `Consultation ID: #SF-84920` | `Date: 24 October 2024, 19:47 BST`
  - **Patient Card:**
    - Full Name: `Ananya Patel` | Age: `32` | Sex at birth: `Female` | NHS ID: `SS-8492-UK`
    - Known Allergies (Critical): `Penicillin, Peanuts` (Note: No reported reactions to paracetamol)
    - Pre-existing Conditions: `Asthma (mild intermittent)`
    - Current Regular Medicines: `Salbutamol inhaler (100mcg PRN)`, `Cetirizine (10mg daily)`
  - **1. What I told SafeSteps (Symptoms & Timeline):**
    - Primary Presentation: `38.6°C (101.5°F)` | `Fever duration: 3 consecutive days` (Recorded with digital oral thermometer)
    - Associated Symptoms: `Moderate evening chills & rigors`, `Generalised lethargy and fatigue`, `Mild sensation of chest tightness`
    - New Onset: `Dry, non-productive cough emerging on evening of Day 3`, `No hemoptysis (coughing blood)`
    - Progression: `Tuesday Eve: Fever chills began` -> `Thursday (Today): Peak temp & new dry cough`
  - **2. Questions SafeSteps Asked & Patient Responses:**
    - Q: `Any shortness of breath or wheezing?` -> R: `Mild chest tightness during coughing bouts, no audible wheezing.`
    - Q: `Any neck stiffness, light sensitivity, or confusion?` -> R: `None.`
  - **3. SafeSteps Guidance & Triage Assessment:**
    - Urgency Result: `Level 2: See a Doctor Soon (Within 24 to 48 Hours)`
    - Clinical Rationale: `Persistent fever exceeding 72 hours coupled with new lower-airway cough in a patient with underlying asthma warrants clinical chest examination and lung auscultation.`
    - Benchmarks Cited: `NICE Guideline CG191 (Pneumonia in adults) • NHS Pathways v31`
  - **4. Suggested Questions for Your Consultation:**
    - [ ] `1. Could this prolonged fever and new cough indicate a secondary chest infection that requires prescription treatment?`
    - [ ] `2. Should I adjust my asthma management plan or peak flow monitoring frequency while recovering?`
    - [ ] `3. What specific worsening symptoms should prompt me to go straight to Urgent Care or A&E rather than waiting?`
- **Clinical Footer:** `Patient-authorized consultation intake • NHS DCB0129 Clinical Safety Aligned • 256-bit Encrypted • UK GDPR Compliant`

#### Screen 27: SafeSteps - Settings & Preferences (`/settings`)
- **Breadcrumb:** `SafeSteps Portal / Settings`
- **Heading:** `Settings`
- **Subtitle:** `Manage your SafeSteps account, privacy choices, clinical preferences, and personal data records.`
- **Section 1: Account details**
  - Name: `Ananya Patel`
  - Email: `ananya.patel@healthnet.nhs.uk`
  - Password: `••••••••••••` | Button: `Change password`
- **Section 2: Privacy and data management**
  - `Download my data archive` — `Export all past consultation records, lab reports, and profile metadata in machine-readable JSON format.` | Button: `Download JSON Archive`
  - `Clear consultation history` — `Erase all previous chat conversations and triage records while keeping your health profile.` | Button: `Clear all history` (Destructive)
- **Section 3: Health profile personalisation**
  - Toggle: `Include health profile in symptom triage` (Enabled) — `Allows SafeSteps to consider known allergies and conditions during chat triage.`
  - Preferred language: `English (US) / தமிழ் / हिन्दी`
- **Section 4: Consent record**
  - `Terms of Service`: `Accepted on 20 Oct 2024`
  - `Health Data Processing`: `Active (Revocable)`
  - `Anonymous Telemetry`: `Disabled`
- **Section 5: Delete account**
  - Warning Card: `Irreversible action. Permanently deletes your SafeSteps account, all consultation records, lab reports, and profile details.`
  - Button: `Delete account permanently` (Opens confirmation modal)

#### Screen 28: SafeSteps - Level 2 New States & Interactive Components (Resiliency Specimen)
- **Section 1: Empty States**
  - Empty History: Icon `chat_bubble_outline` | Heading: `No conversations yet` | Body: `When you complete a symptom consultation, it will appear here for your records.` | Button: `Start a consultation`
  - Empty Reports: Icon `upload_file` | Heading: `No reports uploaded yet` | Body: `Upload a blood test or medical report to receive a clear plain-English explanation.` | Button: `Upload document`
  - Incomplete Profile: Icon `person_add` | Heading: `Help SafeSteps tailor care` | Body: `Adding your baseline health conditions and allergies helps improve triage accuracy.` | Button: `Complete profile`
- **Section 2: Skeleton Loaders & Data Hydration**
  - Shimmer placeholders for history cards, report table rows, and profile input controls during network fetch.
- **Section 3: Upload Validation & Document Quality Errors**
  - Error 1: Icon `attachment` | Title: `This file type isn't supported` | Subtitle: `Please upload a PDF, JPG, or PNG document.`
  - Error 2: Icon `sd_card_alert` | Title: `File is larger than 10 MB` | Subtitle: `Please compress your document or select a smaller file.`
  - Error 3: Icon `visibility_off` | Title: `We couldn't read this clearly` | Subtitle: `The text in this image is too blurry for reliable OCR extraction. Please upload a sharper photo.`
- **Section 4: Toasts & Session Continuity**
  - Error Toast: `Unable to save your changes. Please check your network connection.`
  - Session Expiry Modal / Banner: `For your privacy, your session has expired. Please sign in again to continue.`
- **Section 5: Supportive Access Control (403 Unauthorized)**
  - Icon: `lock`
  - Title: `You don't have access to this page`
  - Body: `This medical report or consultation summary belongs to another authenticated account or session has timed out.`
  - Button: `Back to dashboard`

---

### 7.4 Differences Noticed Between Stitch and Written Descriptions

| Feature / Dimension | Written Level 2 Brief | Stitch Design Implementation | Observed Discrepancy & Technical Impact | Architectural Decision |
| :--- | :--- | :--- | :--- | :--- |
| **Password Recovery Flow** | Simple request & reset routes (`/forgot-password`, `/reset-password`). | Dedicated 3-step sequence: `/forgot-password` -> `/check-email` (with countdown & email masking) -> `/reset-password`. | Provides clearer user reassurance and prevents spam resends. | Implement `/check-email` as an explicit view or state within the password recovery workflow. |
| **Report Explainer Workflow** | Mentioned as `/reports` and `/reports/[id]`. | Stitch includes 3 distinct screen workflows: `/reports` (Upload & Past list), `/reports/processing` (Live 4-step OCR parsing pipeline), and `/reports/[id]` (Results & Table). | Adds visual feedback during OCR and prevents user drop-off while parsing. | Implement `/reports/processing` as a real-time progress state between upload and results. |
| **Authentication Error States** | Implicit validation errors on `/login`. | Stitch provides a dedicated comprehensive screen showing global alerts, inline format errors, and rate-limiting lockout cooldowns. | Demonstrates resilient UX boundaries against brute force. | Implement both global alert banner and field-level inline error messages. |
| **Mobile Variations** | Generic responsive behavior implied. | Stitch provides 4 dedicated mobile screens: `/signup` (Mobile), `/login` (Mobile), `/consent` (Mobile), and Mobile App Drawer. | Mobile layouts feature stacked inputs, sticky emergency bars, and enlarged 48px hit areas. | Implement dedicated responsive layouts with Tailwind breakpoint classes (`md:hidden`, `block`). |
| **Emergency Numbers vs Guidelines** | Generic emergency help. | Stitch displays Indian emergency numbers (**112**, **108**, **14416**) while referencing UK NHS clinical standards (**NHS ID**, **NICE CG191**, **NHS Pathways v31**, **DCB0129**). | Inconsistency between regional dispatch codes (India 112/108 vs UK NHS). | Use **112** as the primary universal emergency dispatch number, configurable via `NEXT_PUBLIC_EMERGENCY_NUMBER=112`. |
| **Biomarker Editing Capability** | Not specified in brief. | Stitch includes an interactive button: `Edit values (Correct misread numbers)` on the report results screen. | Allows patients to correct OCR misread figures before showing them to a clinician. | Implement an accessible modal to manually edit and re-calculate parameter reference bounds. |
| **Multi-Lingual Localization** | Not specified in brief. | Stitch integrates English, Tamil (`தமிழ்`), and Hindi (`हिन्दी`) in the top app bar, health profile preferences, and component library. | Enhances accessibility for non-English native speakers in multilingual regions. | Implement Next.js lightweight localization context with language selector supporting English, தமிழ், and हिन्दी. |

---

### 7.5 Level 2 Implementation Roadmap & Architectural Guardrails

1. **Routing Architecture:**
   - Public Routes: `/`, `/emergency`
   - Auth Routes: `/signup`, `/login`, `/forgot-password`, `/check-email`, `/reset-password`
   - Protected Routes (Authenticated Shell): `/consent`, `/profile`, `/chat`, `/history`, `/reports`, `/reports/processing`, `/reports/[id]`, `/summary/[conversationId]`, `/settings`
2. **State Management & Persistence:**
   - React Context or Zustand store for user session (`useAuthStore`), health profile baseline (`useProfileStore`), and uploaded reports (`useReportStore`).
   - Mock patient data initialized with Ananya Patel profile to facilitate immediate testing and evaluation.
3. **Accessibility & Clinical Safety Standards:**
   - Strict WCAG 2.1 AA compliance (4.5:1 minimum contrast for body text, 3:1 for large headings and UI boundaries).
   - Strict size floor: No clinical guidance, disclaimer, or helper text below 14px (`caption-md`).
   - Accessible ARIA attributes (`role="alert"`, `aria-live="polite"`, `aria-expanded`, modal focus trapping).
   - Prominent, persistent emergency access (112) visible at all times.

---

## 8. Summary & Awaiting User Confirmation

- **Git Branch:** `level-2` (checked out from `main`).
- **Level 1 Baseline Verification:**
  - `npm run build`: **PASSED** (0 errors).
  - `npm test`: **PASSED** (15/15 unit tests passing).
  - `npm run lint`: **FAILED** (12 TypeScript `any` / unused variable warnings; kept untouched as instructed).
- **Stitch MCP Review:** 21 Level 2 screens thoroughly inspected in READ-ONLY mode.
- **Design Specification:** Comprehensive Level 2 specification, 21-screen inventory table, component catalog, exact copy inventory, and discrepancy analysis appended to [docs/design-spec.md](file:///d:/My%20Project/Safe%20Steps/docs/design-spec.md).
- **Application Code Status:** **No application code written.**

*Awaiting user confirmation to begin Level 2 implementation.*
