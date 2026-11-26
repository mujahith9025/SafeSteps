/**
 * SafeSteps AI Output Guardrail Patterns
 *
 * Checks AI responses BEFORE they are transmitted to the user.
 * Catches clinical safety violations:
 * 1. Dosage patterns (e.g., 500mg, 10ml, take 2 tablets, every 6 hours combined with medicine)
 * 2. Diagnosis assertions (e.g., you have [condition], you are suffering from)
 * 3. Prescription language (e.g., I prescribe, you should take [drug], start taking antibiotics)
 * 4. Leaked instructions (e.g., system prompt, my instructions, role: you are safesteps)
 */

export const HARMLESS_YOU_HAVE_FOLLOWING = [
  "mentioned",
  "described",
  "reported",
  "experienced",
  "stated",
  "said",
  "shared",
  "noted",
  "noticed",
  "indicated",
  "felt",
  "been",
  "had",
  "taken",
  "already",
  "just",
  "access",
  "someone",
  "time",
  "questions?",
  "trouble",
  "difficulty",
  "a\\s+headache",
  "headaches?",
  "stomach\\s+pain",
  "abdominal\\s+pain",
  "vomiting",
  "nausea",
  "a\\s+fever",
  "fever",
  "a\\s+cold",
  "cough",
  "a\\s+cough",
  "sore\\s+throat",
  "body\\s+aches?",
  "body\\s+pain",
  "dizziness",
  "fatigue",
  "tiredness",
  "weakness",
  "a\\s+cut",
  "a\\s+rash",
  "these",
  "those",
  "this",
  "any",
  "some",
  "such",
  "a\\s+history",
  "existing",
  "chronic",
  "other",
  "additional",
];

export const HARMLESS_YOU_HAVE_PRECEDING = [
  "if",
  "whether",
  "when",
  "in case",
  "check if",
  "ensure",
  "make sure",
  "to see if",
  "unless",
  "do",
  "did",
  "does",
  "could",
  "might",
  "would",
  "should",
  "can",
  "may",
  "that",
  "hear\\s+that",
  "heard\\s+that",
  "sorry\\s+(?:to\\s+hear\\s+)?that",
  "sorry",
  "understand\\s+that",
  "understand",
  "since",
  "because",
  "as",
  "given\\s+that",
  "given",
  "told\\s+me\\s+that",
  "told\\s+me",
  "said\\s+that",
  "shared\\s+that",
  "noted\\s+that",
  "see\\s+that",
  "know\\s+that",
  "which",
  "where",
  "sounds?\\s+like",
  "feels?\\s+like",
  "symptoms?\\s+(?:that\\s+)?",
  "pain\\s+(?:that\\s+)?",
  "headache\\s+(?:that\\s+)?",
  "discomfort\\s+(?:that\\s+)?",
  "issues?\\s+(?:that\\s+)?",
  "trouble\\s+(?:that\\s+)?",
];

const MED_KEYWORDS =
  "(?:paracetamol|ibuprofen|aspirin|acetaminophen|amoxicillin|azithromycin|ciprofloxacin|crocin|calpol|dolo|antibiotics?|antihistamines?|cough\\s+syrup|syrup|painkillers?|tablets?|pills?|capsules?|drops?|medication|medicine|drugs?|dose|dosage)";

/**
 * 1. DOSAGE PATTERNS
 * Numbers combined with medicine units (mg, mcg, ml, tablets, pills, capsules, drops)
 * or dosing frequency instructions (e.g., 'take 2', 'every 6 hours' combined with a medicine name).
 */
export const DOSAGE_PATTERNS: RegExp[] = [
  // Numbers with medicine units: 500mg, 500 mg, 0.5mcg, 10ml, 2 tablets, 1-2 pills, 5 drops
  /\b\d+(?:\.\d+)?\s*(?:-|to)?\s*\d*(?:\.\d+)?\s*(?:mg|milligrams?|mcg|micrograms?|ml|millilit(?:er|re)s?|tablets?|pills?|capsules?|drops?|suppositor(?:y|ies)|tsps?|tbsps?|teaspoons?|tablespoons?|puffs?|sachets?)\b/i,

  // "Take 1", "take 2", "take 3" when referring to medicine units or doses
  /\btake\s+(?:\d+|one|two|three|four)\s+(?:to\s+(?:\d+|one|two|three|four)\s+)?(?:of\s+)?(?:the\s+)?(?:tablets?|pills?|capsules?|drops?|doses?|spoonfuls?)\b/i,

  // "Take X tablets/pills/capsules/drops" or "take X" combined with medication context
  /\btake\s+(?:\d+|one|two|three|four)\s*(?:to|-)?\s*\d*\s*(?!minutes?|seconds?|hours?|hrs?|days?|weeks?|months?|breaths?|steps?|sips?|glasses?|break\b|nap\b|rest\b|care\b|shower\b|bath\b)[a-z0-9_-]/i,

  // Dosage amounts: e.g. "dose of 2", "dosage: 5"
  /\b(?:dose|dosage)(?:\s+is|\s+of)?\s+\d+\b/i,

  // "every 6 hours" combined with medicine name, medication, or ingestion verb (take/drink/administer/repeat)
  new RegExp(
    `\\b(?:take|administer|consume|give|repeat)\\s+.*?\\bevery\\s+\\d+\\s*(?:to|-)?\\s*\\d*\\s*(?:hours?|hrs?)\\b`,
    "i"
  ),
  new RegExp(
    `\\b${MED_KEYWORDS}\\s+.*?\\bevery\\s+\\d+\\s*(?:to|-)?\\s*\\d*\\s*(?:hours?|hrs?)\\b`,
    "i"
  ),
  new RegExp(
    `\\bevery\\s+\\d+\\s*(?:to|-)?\\s*\\d*\\s*(?:hours?|hrs?)\\s+.*?\\b${MED_KEYWORDS}\\b`,
    "i"
  ),

  // Daily dosing frequency combined with medication context
  new RegExp(
    `\\b(?:once|twice|thrice|\\d+\\s*times)\\s+(?:a|per)\\s+day\\s+(?:with|after|before)?\\s*(?:food|meals|water)?\\s*(?:of\\s+)?${MED_KEYWORDS}\\b`,
    "i"
  ),
];

/**
 * 2. PRESCRIPTION LANGUAGE
 * Prescribing medications or directing the user to start specific pharmaceutical drugs.
 */
export const PRESCRIPTION_PATTERNS: RegExp[] = [
  /\bi\s+(?:prescribe|am\s+prescribing)\b/i,
  /\b(?:i|we)\s+prescription\b/i,
  /\bstart\s+taking\s+(?:antibiotics?|medication|medicine|[a-z]+\b)/i,
  /\bgo\s+buy\s+(?:some\s+)?[a-z]+(?:\s+tablets?|\s+pills?)?\b/i,

  // "You should take [medication]" (distinguishing from "you should take rest/care/a shower")
  /\byou\s+(?:should|must|need\s+to)\s+take\s+(?:some\s+|a\s+|an\s+|the\s+)?[a-z0-9_-]*(?:antibiotics?|paracetamol|ibuprofen|aspirin|acetaminophen|amoxicillin|azithromycin|ciprofloxacin|antihistamines?|cough\s+syrup|painkillers?|medication|medicine|tablets?|pills?|capsules?)\b/i,

  // General "you should take" not followed by harmless non-medicinal actions
  /\byou\s+(?:should|must)\s+take\s+(?!rest\b|care\b|a\s+break\b|a\s+shower\b|a\s+bath\b|a\s+nap\b|deep\s+breaths?\b|slow\s+breaths?\b|time\s+off\b|precautions?\b|notes?\b)[a-z]/i,

  // Direct drug administration imperatives
  /\b(?:take|administer|consume)\s+(?:some\s+)?(?:antibiotics?|paracetamol|ibuprofen|aspirin|acetaminophen|amoxicillin|azithromycin|ciprofloxacin|painkillers?)\b/i,

  // Recommending medications
  /\b(?:i\s+recommend|i\s+suggest)\s+(?:taking|starting|using)\s+(?:some\s+)?[a-z0-9_-]*(?:antibiotics?|paracetamol|ibuprofen|aspirin|medication|medicine|tablets?|pills?)\b/i,

  /\bprescribed\s+(?:for\s+you|by\s+me)\b/i,
];

/**
 * 3. LEAKED INSTRUCTIONS
 * Leaked prompt instructions, meta-prompts, or developer identity instructions.
 */
export const LEAKED_INSTRUCTION_PATTERNS: RegExp[] = [
  /\bsystem\s+prompt\b/i,
  /\bmy\s+instructions\b/i,
  /\bmy\s+system\s+instructions\b/i,
  /\bmy\s+prompt\b/i,
  /\bdeveloper\s+instructions\b/i,
  /\bas\s+an\s+ai(?:\s+language\s+model)?\b/i,
  /\bas\s+a\s+language\s+model\b/i,
  /\brole:\s*you\s+are\s+safesteps\b/i,
  /\bhard\s+rules:?\b/i,
  /\burgency\s+levels\s*\(/i,
  /\bnever\s+diagnose\.\s*use\s+phrases\b/i,
  /\bconversation\s+flow:?\b/i,
  /\bresponse\s+format:?\b/i,
  /\bi\s+was\s+instructed\s+to\b/i,
  /\baccording\s+to\s+my\s+instructions\b/i,
  /\baccording\s+to\s+my\s+guidelines\b/i,
  /\bmy\s+safety\s+rules\s+state\b/i,
];

/**
 * 4. DIAGNOSIS ASSERTIONS
 * Definite diagnostic proclamations asserting the user has a specific pathology.
 */
export const DIAGNOSIS_PATTERNS: RegExp[] = [
  /\b(?:you\s+are|the\s+patient\s+is|patient\s+is)\s+suffering\s+from\b/i,
  /\bsuffers?\s+from\b/i,
  /\byou\s+definitely\s+have\b/i,
  /\bthis\s+is\s+definitely\b/i,
  /\b(?:you\s+are|the\s+patient\s+is|patient\s+is)\s+diagnosed(?:\s+with)?\b/i,
  /\b(?:i|my)\s+diagnos(?:e|is)\b/i,
  /\bwe\s+diagnose\b/i,
  /\bthe\s+diagnosis\s+is\b/i,
  /\byou\s+most\s+likely\s+have\b/i,
  /\byou\s+certainly\s+have\b/i,
  /\byou\s+clearly\s+have\b/i,
  /\bconfirm(?:s|ed)?\s+that\s+(?:you|the\s+patient)\s+have?\b/i,
  /\bconclude\s+that\s+(?:you|the\s+patient)\s+have?\b/i,
  /\b(?:you|the\s+patient|patient)\s+has?\s+(?:a\s+|an\s+|severe\s+|mild\s+|acute\s+|chronic\s+|bacterial\s+|viral\s+)?(?:migraine|bronchitis|pneumonia|covid|flu|gastroenteritis|food\s+poisoning|angina|concussion|infection|disease|disorder|syndrome)\b/i,
];
