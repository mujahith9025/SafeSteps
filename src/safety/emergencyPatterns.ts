/**
 * Emergency detection pattern definitions for SafeSteps.
 *
 * CLINICAL SAFETY PRINCIPLE:
 * Prefer false alarms over missed emergencies.
 * High sensitivity is strictly prioritized to ensure life-threatening symptoms
 * are caught before LLM inference, even if external services are unreachable.
 */

export interface EmergencyPatternGroup {
  category: string;
  reason: string;
  patterns: RegExp[];
}

export const EMERGENCY_PATTERN_GROUPS: EmergencyPatternGroup[] = [
  {
    category: "cardiac",
    reason:
      "Potential cardiovascular emergency: acute chest pain, tightness, or radiating arm pain requires immediate emergency medical evaluation.",
    patterns: [
      /\bchest\s+pain\b/i,
      /\bchest\s+tightness\b/i,
      /\btight\s+chest\b/i,
      /\btightness\s+(?:in|across)\s+(?:my\s+)?chest\b/i,
      /\bpressure\s+in\s+(?:my\s+)?chest\b/i,
      /\bcrushing\s+(?:chest\s+pain|pain\s+in\s+chest|pressure)\b/i,
      /\bheart\s*attack\b/i,
      /\bmyocardial\s+infarction\b/i,
      /\bpain\s+in\s+(?:my\s+|the\s+)?left\s+arm(?:\s+(?:with|and)\s+sweat(?:ing)?|\s+radiating|\s+spreading)?\b/i,
      /\bleft\s+arm\s+(?:and\s+jaw\s+)?pain\b/i,
      /\bchestpain\b/i,
    ],
  },
  {
    category: "breathing",
    reason:
      "Acute respiratory distress: severe breathing difficulty, choking, or airway compromise requires immediate emergency stabilization.",
    patterns: [
      /\b(?:can['’]?t|cannot|cant)\s+breath(?:e)?\b/i,
      /\bstruggling\s+to\s+breath(?:e)?\b/i,
      /\bdifficulty\s+breath(?:ing)?\b/i,
      /\btrouble\s+breath(?:ing)?\b/i,
      /\bhard\s+to\s+breath(?:e)?\b/i,
      /\bunable\s+to\s+breath(?:e)?\b/i,
      /\bshortness\s+of\s+breath\b/i,
      /\bgasping\s+for\s+(?:air|breath)\b/i,
      /\bsuffocating\b/i,
      /\bchoking\b/i,
      /\bturn(?:ing)?\s+blue\b/i,
      /\bblue\s+lips\b/i,
      /\bbluish\s+(?:lips|face|fingertips)\b/i,
      /\bthroat\s+(?:is\s+)?closing\s*(?:up)?\b/i,
    ],
  },
  {
    category: "stroke",
    reason:
      "Signs of an acute neurological emergency (stroke): sudden facial drooping, speech changes, or unilateral weakness require immediate emergency care.",
    patterns: [
      /\b(?:face\s+(?:is\s+)?drooping|facial\s+droop|drooping\s+face)\b/i,
      /\bslurred\s+speech\b/i,
      /\bsudden\s+weakness\s+(?:on\s+)?(?:one|1)\s+side\b/i,
      /\bweakness\s+on\s+one\s+side\s+of\s+(?:my\s+)?(?:body|face)\b/i,
      /\bone\s+side\s+of\s+(?:my\s+)?(?:face|body)\s+(?:is\s+)?(?:numb|weak|droop(?:ing)?|paralyzed)\b/i,
      /\bsudden\s+loss\s+of\s+vision\b/i,
      /\bsudden\s+(?:blindness|vision\s+loss)\b/i,
      /\bworst\s+headache\s+of\s+my\s+life\b/i,
      /\bthunderclap\s+headache\b/i,
      /\bsudden\s+paralysis\b/i,
    ],
  },
  {
    category: "bleeding",
    reason:
      "Severe or uncontrolled hemorrhage requires immediate emergency care to prevent critical blood volume loss.",
    patterns: [
      /\bsevere\s+bleeding\b/i,
      /\bheavy\s+bleeding\b/i,
      /\bmassive\s+bleeding\b/i,
      /\buncontrolled\s+bleeding\b/i,
      /\bbleeding\s+(?:won['’]?t|wont|cannot|does\s+not)\s+stop\b/i,
      /\bvomit(?:ing)?\s+(?:(?:\w+\s+){0,5})?blood\b/i,
      /\bthrowing\s+up\s+(?:(?:\w+\s+){0,5})?blood\b/i,
      /\bcough(?:ing)?\s+(?:up\s+)?(?:(?:\w+\s+){0,5})?blood\b/i,
      /\bblood\s+(?:in|from)\s+(?:my\s+)?vomit\b/i,
      /\bspurting\s+blood\b/i,
    ],
  },
  {
    category: "consciousness",
    reason:
      "Altered mental status, unresponsiveness, or active seizure requires immediate emergency medical evaluation.",
    patterns: [
      /\bunconscious\b/i,
      /\bfainted\s+and\s+(?:not|wont)\s+waking\b/i,
      /\bpassed\s+out\s+and\s+(?:not|wont)\s+wak(?:ing|e)\b/i,
      /\bunresponsive\b/i,
      /\bnon-?responsive\b/i,
      /\bseizure(?:s)?\b/i,
      /\bseizing\b/i,
      /\bconvulsion(?:s)?\b/i,
      /\bcollapsed\s+and\s+unresponsive\b/i,
    ],
  },
  {
    category: "allergy",
    reason:
      "Suspected anaphylaxis: rapid swelling of the airway, tongue, or severe allergic reaction requires emergency epinephrine and medical intervention.",
    patterns: [
      /\bswelling\s+of\s+(?:the\s+)?(?:face|throat|tongue|lips)(?:\s+or\s+(?:face|throat|tongue|lips))?\b/i,
      /\b(?:face|throat|tongue|lips)\s+(?:is\s+|are\s+)?swelling\b/i,
      /\bsevere\s+allergic\s+reaction\b/i,
      /\banaphylaxi[sc]\b/i,
      /\banaphylactic\b/i,
      /\bthroat\s+closing\b/i,
    ],
  },
  {
    category: "poisoning",
    reason:
      "Suspected acute poisoning or overdose requires immediate poison control and emergency department resuscitation.",
    patterns: [
      /\bover-?dose(?:d)?\b/i,
      /\bswallowed\s+poison\b/i,
      /\bingested\s+poison\b/i,
      /\bdrank\s+poison\b/i,
      /\btook\s+too\s+many\s+pills\b/i,
      /\bswallowed\s+(?:bleach|chemical|toxic)\b/i,
      /\bdrank\s+bleach\b/i,
      /\bpoisoning\b/i,
    ],
  },
  {
    category: "selfharm",
    reason:
      "Crisis support required: immediate intervention is necessary for safety and mental health support. Tele-MANAS is available at 14416.",
    patterns: [
      /\bsuicid(?:e|al)\b/i,
      /\bkill\s+myself\b/i,
      /\bwant\s+to\s+die\b/i,
      /\bend\s+my\s+life\b/i,
      /\bself-?\s*harm\b/i,
      /\bhurt\s+myself\b/i,
      /\btake\s+my\s+own\s+life\b/i,
      /\bhang\s+myself\b/i,
      /\bending\s+it\s+all\b/i,
    ],
  },
  {
    category: "pregnancy and infants",
    reason:
      "Critical obstetrical or pediatric emergency: urgent clinical stabilization is required immediately.",
    patterns: [
      /\bheavy\s+bleeding\s+(?:in|during)\s+pregnancy\b/i,
      /\bpregnant\s+(?:and\s+)?bleeding\s+heavily\b/i,
      /\bbleeding\s+heavily\s+while\s+pregnant\b/i,
      /\bnewborn\s+(?:is\s+)?not\s+breath(?:ing)?\b/i,
      /\bbaby\s+(?:is\s+)?not\s+breath(?:ing)?\b/i,
      /\binfant\s+(?:is\s+)?not\s+breath(?:ing)?\b/i,
      /\b(?:baby|infant|newborn)\s+(?:is\s+)?blue\b/i,
      /\b(?:baby|infant|newborn)\s+turning\s+blue\b/i,
    ],
  },
];
