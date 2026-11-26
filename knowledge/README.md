# SafeSteps Clinical Knowledge Base (RAG)

Welcome to the **SafeSteps Clinical Knowledge Base**. This repository directory houses curated, trusted public health reference documents used by the SafeSteps Retrieval-Augmented Generation (RAG) pipeline to ground symptom evaluations in standardized clinical protocols.

---

## 1. Document File Format

Every reference document in `knowledge/` must be a plain `.md` (Markdown) or `.txt` text file that begins with standard YAML front matter:

```markdown
---
title: "Fever in Adults: Triage & Supportive Care"
source_name: "NHS 111 & Pathways"
source_url: "https://www.nhs.uk/conditions/fever-in-adults/"
language: "en"
licence_note: "Open Government Licence v3.0 (Crown Copyright) - summarized for non-commercial educational triage"
---

# Fever in Adults

## Overview & Temperature Ranges
A normal body temperature is generally around 37°C (98.6°F), though normal baseline varies between 36.1°C and 37.2°C. A fever is typically considered a core body temperature of 38°C (100.4°F) or above...

## Red Flag Warning Signs
Seek immediate emergency medical care (call 112 / 108) if an adult with fever develops:
- Stiff neck or severe neck rigidity
- Sudden rash that does not fade when pressed with a glass (petechial rash)
- Confusion, extreme drowsiness, or slurred speech
- Difficulty breathing or severe chest pain
```

### Front Matter Schema
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `title` | `string` | **Yes** | Clear clinical title of the guideline or topic. |
| `source_name` | `string` | **Yes** | Name of the issuing public health agency (e.g. *WHO*, *NHS*, *MedlinePlus*, *ICMR*, *CDC*). |
| `source_url` | `string` | **Yes** | Canonical web URL of the original published guidance. Used as unique key during ingestion. |
| `language` | `string` | **Yes** | ISO-639 language code: `en` (English), `ta` (Tamil), or `hi` (Hindi). Defaults to `en`. |
| `licence_note` | `string` | **Yes** | License note verifying public redistribution rights or educational fair-use summary status. |

---

## 2. Ingestion & Chunking Behavior

When `npm run ingest` runs:
1. **Front Matter Parsing**: Parses metadata and extracts clinical text body.
2. **Structural Chunking**: Splits text into chunks of **~500 to 800 characters** with **~100 characters overlap**.
3. **Context Preservation**: Section headings (`#`, `##`, `###`) are tracked and embedded into each chunk's `metadata.heading`.
4. **Vector Embeddings**: Generates 768-dimensional vector embeddings with Gemini `text-embedding-004` (batching + exponential backoff).
5. **Idempotent Upsert**: Matches on `source_url`. If a document was previously ingested, old chunks are purged and replaced with the updated chunks without creating duplicates.

---

## 3. Recommended Trusted Sources

When collecting and preparing reference guidance, prioritize public, national, and multilateral health organizations:

1. **World Health Organization (WHO)**
   - Fact sheets on acute respiratory infections, diarrhoeal diseases, hypertension, and diabetes.
   - Website: [https://www.who.int/news-room/fact-sheets](https://www.who.int/news-room/fact-sheets)
2. **National Health Service (NHS UK)**
   - Symptom guides, NHS 111 triage protocols, and medicine factsheets.
   - License: Open Government Licence (OGL v3.0).
   - Website: [https://www.nhs.uk/conditions/](https://www.nhs.uk/conditions/)
3. **MedlinePlus (National Library of Medicine / NIH)**
   - Health topics, medical encyclopedia articles, and diagnostic test explanations.
   - License: U.S. Government Public Domain.
   - Website: [https://medlineplus.gov/](https://medlineplus.gov/)
4. **ICMR & Ministry of Health and Family Welfare (MoHFW India)**
   - Standard treatment guidelines for primary care in India, seasonal fevers (Dengue, Malaria, Typhoid), and diabetes management.
   - Website: [https://www.icmr.gov.in/](https://www.icmr.gov.in/) & [https://main.mohfw.gov.in/](https://main.mohfw.gov.in/)
5. **Centers for Disease Control and Prevention (CDC)**
   - Public health summaries on infectious disease spread, hydration, and injury care.
   - License: Public Domain (US Federal Government).
   - Website: [https://www.cdc.gov/](https://www.cdc.gov/)

---

## 4. Copyright & Redistribution Guidance

> [!IMPORTANT]
> **Check Each Source's Reuse License Before Ingesting**:
> - **Public Domain / OGL / CC-BY**: Safe to summarize and attribute directly with source URLs.
> - **All Rights Reserved**: **DO NOT** copy verbatim paragraphs. Instead, **paraphrase into your own words**, extract key clinical thresholds (e.g. fever > 38°C, duration > 3 days, warning signs), and include the canonical link in `source_url`.
> - Always maintain educational fair-use integrity and attribute the issuing public health body.

---

## 5. Target Topic Checklist (20–30 Documents)

Aim for 20 to 30 concise documents covering everyday primary triage categories:

- [ ] **1. Fever in Adults & Children** (Temperature thresholds, red flags, hydration, when to see a doctor)
- [ ] **2. Common Cold, Flu & Viral Rhinitis** (Symptom progression, soothing care, secondary infection signs)
- [ ] **3. Cough (Acute vs Persistent)** (Dry vs productive cough, red flags like hemoptysis or wheeze)
- [ ] **4. Headache & Migraine** (Tension headaches vs emergency red flags like thunderclap onset)
- [ ] **5. Stomach Upset, Heartburn & Dyspepsia** (Post-meal discomfort, antacid guidance, red flags)
- [ ] **6. Acute Diarrhoea & Gastroenteritis** (Infectious signs, hydration necessity, danger signs)
- [ ] **7. Dehydration & Oral Rehydration Salts (ORS)** (Signs of mild vs severe dehydration, ORS mixing rules)
- [ ] **8. Sore Throat & Pharyngitis** (Centor criteria basics, viral vs bacterial, swallowing difficulty)
- [ ] **9. Lower Back Pain (Non-specific)** (Mechanical strain, posture, red flags like cauda equina signs)
- [ ] **10. Dizziness & Lightheadedness** (Postural hypotension, inner ear vs cardiovascular emergencies)
- [ ] **11. Skin Rashes & Allergic Hives** (Benign rash vs anaphylaxis or meningococcal glass test)
- [ ] **12. Minor Injuries, Bruises & Sprains** (R.I.C.E protocol, Ottawa ankle rules for weight-bearing)
- [ ] **13. Cuts, Scrapes & Minor Burns** (Wound cleansing, tetanus awareness, burn cooling rules)
- [ ] **14. When to Seek Emergency Care (Red Flags)** (Chest pain, stroke signs FAST, severe bleeding, 112 protocols)
- [ ] **15. Diabetes Mellitus Basics** (Hypoglycemia vs hyperglycemia signs, foot care, infection risks)
- [ ] **16. High Blood Pressure Basics** (Normal ranges, hypertensive crisis signs, lifestyle precautions)
- [ ] **17. Asthma Flare-ups & Wheezing** (Reliever inhaler use, avoiding NSAIDs, acute breathlessness signs)
- [ ] **18. Common Blood Tests: Complete Blood Count (CBC)** (Hemoglobin, white cell counts, platelet roles)
- [ ] **19. Common Blood Tests: Fasting Blood Sugar & HbA1c** (Diagnostic thresholds, pre-diabetes awareness)
- [ ] **20. Common Blood Tests: Lipid Profile & Kidney Function (Creatinine)** (Basic interpretation limits)
- [ ] **21. Urinary Tract Discomfort in Adults** (Dysuria, hydration, red flags like flank pain or high fever)
- [ ] **22. Sleep Hygiene & Stress Management** (Non-pharmacological approaches to restorative rest)

---

## 6. How to Run Ingestion

Once your documents are placed in `knowledge/`, run the ingestion script from the project root:

```bash
npm run ingest
```

The script will validate front matter, generate vector embeddings, upsert into Supabase, and output an execution summary table.
