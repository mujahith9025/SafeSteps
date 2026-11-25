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

## 6. Next Steps & Confirmation Request

The complete design specification is saved in [docs/design-spec.md](file:///d:/My%20Project/Safe%20Steps/docs/design-spec.md).

Please review and confirm this specification (including the choice of emergency number **112** vs **911** and the background color **#F8FAFC**). Once you confirm, we will proceed to building the application routes and components.
