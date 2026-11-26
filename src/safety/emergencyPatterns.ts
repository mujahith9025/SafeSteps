/**
 * Emergency detection pattern definitions for SafeSteps.
 *
 * CLINICAL SAFETY PRINCIPLE:
 * Prefer false alarms over missed emergencies.
 * High sensitivity is strictly prioritized to ensure life-threatening symptoms
 * are caught before LLM inference, even if external services are unreachable.
 *
 * Supports English, Tamil (Tamil script + Tanglish transliterations),
 * and Hindi (Devanagari script + Hinglish transliterations).
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
      // English
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

      // Tamil (Native script)
      /(?:நெஞ்சு|மார்பு)\s*(?:வலி|பாரம்|அழுத்தம்|இறுக்கம்)/u,
      /மாரடைப்பு/u,
      /இடது\s*கை\s*வலி/u,
      /இதய\s*வலி/u,

      // Tanglish (Transliteration)
      /\b(?:nenju|maarbu|marbu)\s*(?:vali|baaram|baram|azhutham|pressure)\b/i,
      /\bnenjula\s*(?:vali|baaram|baram|erichal)\b/i,
      /\b(?:maaradaipu|maradaipu)\b/i,
      /\b(?:idathu|edathu)\s*kai\s*vali\b/i,

      // Hindi (Devanagari script)
      /(?:सीने|छाती)\s*में\s*(?:दर्द|दबाव|जकड़न|भारीपन)/u,
      /दिल\s*का\s*दौरा/u,
      /बाएं\s*हाथ\s*में\s*दर्द/u,
      /हार्ट\s*अटैक/u,

      // Hinglish (Transliteration)
      /\b(?:seene|chhati|chaati|sine)\s*me\s*(?:tez\s+)?(?:dard|dabav|pressure|jakdan|bhaaripan|bhari\s*pan)\b/i,
      /\bdil\s*ka\s*daura\b/i,
      /\b(?:baayein|baaye|bayen|left)\s*(?:haath|hath)\s*me\s*(?:tez\s+)?dard\b/i,
      /\bchhati\s*me\s*jalan\s*aur\s*dard\b/i,
    ],
  },
  {
    category: "breathing",
    reason:
      "Acute respiratory distress: severe breathing difficulty, choking, or airway compromise requires immediate emergency stabilization.",
    patterns: [
      // English
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

      // Tamil (Native script)
      /மூச்சு\s*(?:திணறல்|முட்டுகிறது|விட\s*முடியவில்லை|வாங்க\s*முடியவில்லை|விட\s*கஷ்டம்|நிற்கிறது)/u,
      /சுவாசிக்க\s*முடியவில்லை/u,
      /தொண்டை\s*அடைக்குது/u,
      /உதடு\s*(?:நீலமாகிறது|நீல\s*நிறம்)/u,

      // Tanglish (Transliteration)
      /\bmoochu\s*(?:vida\s*mudiyala|vida\s*mudiyavillai|vidamudiyala|thinaral|thinarudhu|muttudhu|vaanga\s*mudiyala|kashtam)\b/i,
      /\bsuvaasikka\s*mudiyala\b/i,
      /\bthonda(?:i)?\s*(?:adaik(?:k)?u(?:thu|dhu)|adaipathupola)\b/i,
      /\b(?:uthadu|udhadu)\s*(?:neelam|neelamaachu)\b/i,

      // Hindi (Devanagari script)
      /सांस\s*(?:लेने\s*में\s*(?:दिक्कत|तकलीफ|परेशानी)|नहीं\s*आ\s*रही|फूल\s*रही\s*है|रुक\s*रही\s*है|उखड़\s*रही\s*है)/u,
      /दम\s*घुट\s*रहा\s*है/u,
      /गला\s*घुट\s*रहा\s*है/u,
      /होंठ\s*नीले\s*पड़\s*रहे\s*हैं/u,

      // Hinglish (Transliteration)
      /\b(?:saans|sans)\s*(?:lene\s*me\s*(?:dikkat|takleef|pareshaani)|nahi\s*aa\s*rahi|nahi\s*le\s*pa\s*raha|phool\s*rahi\s*hai|ruk\s*rahi\s*hai)\b/i,
      /\bdam\s*ghut\s*raha\s*hai\b/i,
      /\bgala\s*(?:ghut\s*raha\s*hai|band\s*ho\s*raha\s*hai)\b/i,
      /\b(?:honth|lips)\s*(?:neele\s*pad\s*gaye|neele\s*ho\s*gaye)\b/i,
    ],
  },
  {
    category: "stroke",
    reason:
      "Signs of an acute neurological emergency (stroke): sudden facial drooping, speech changes, or unilateral weakness require immediate emergency care.",
    patterns: [
      // English
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

      // Tamil (Native script)
      /முகம்\s*(?:கோணிவிட்டது|ஒரு\s*பக்கமாக\s*சரியுது|கோணலாகிறது)/u,
      /(?:நாக்கு\s*குழறுகிறது|பேச்சு\s*குளறல்|பேச\s*முடியவில்லை)/u,
      /ஒரு\s*பக்கம்\s*(?:செயலிழந்துவிட்டது|சுயநினைவு\s*இல்லை|கை\s*கால்\s*வரவில்லை)/u,
      /(?:திடீர்\s*பக்கவாதம்|பக்கவாதம்)/u,

      // Tanglish (Transliteration)
      /\b(?:mugam|muham)\s*(?:koni\s*pochu|oru\s*pakkama\s*sariyuthu|konalayiruchu)\b/i,
      /\b(?:pechu\s*kolarudhu|pechu\s*kularal|naaku\s*kozharudhu)\b/i,
      /\boru\s*pakkam\s*(?:seyal\s*izhanthuduchu|kai\s*kaal\s*vilangala|paralysis|weakness)\b/i,
      /\b(?:thideer\s*pakkavatham|pakkavatham|pakkavaatham)\b/i,

      // Hindi (Devanagari script)
      /(?:चेहरे\s*का\s*टेढ़ापन|मुंह\s*टेढ़ा\s*हो\s*गया)/u,
      /(?:बोली|जुबान)\s*लड़खड़ा\s*रही\s*है/u,
      /(?:एक\s*तरफ\s*(?:का\s*शरीर\s*सुन्न|लकवा)|लकवा\s*मार\s*गया)/u,
      /फालिज\s*मार\s*गया/u,

      // Hinglish (Transliteration)
      /\b(?:chehra|muh|munh)\s*tedha\s*ho\s*gaya\b/i,
      /\b(?:zubaan|zuban|boli)\s*ladkhada\s*rahi\s*hai\b/i,
      /\b(?:ek\s*taraf\s*lakwa|lakwa\s*maar\s*gaya|ek\s*side\s*sunn|ek\s*taraf\s*kamzori)\b/i,
      /\b(?:faalij\s*ka\s*asar|faalij\s*maar\s*gaya)\b/i,
    ],
  },
  {
    category: "bleeding",
    reason:
      "Severe or uncontrolled hemorrhage requires immediate emergency care to prevent critical blood volume loss.",
    patterns: [
      // English
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

      // Tamil (Native script)
      /(?:அதிக\s*ரத்தப்போக்கு|ரத்தப்போக்கு\s*நிற்கவில்லை)/u,
      /ரத்தம்\s*(?:கொட்டுகிறது|நிற்கவில்லை|பீறிட்டு\s*அடிக்கிறது)/u,
      /ரத்த\s*வாந்தி/u,
      /இருமலில்\s*ரத்தம்/u,

      // Tanglish (Transliteration)
      /\b(?:adhiga\s*rathapokku|rathapokku)\b/i,
      /\bratham\s*(?:nikkala|stop\s*aagala|nikka\s*matenguthu|kottudhu|kottuthu)\b/i,
      /\bratha\s*vaandhi\b/i,
      /\birumall?a\s*ratham\b/i,

      // Hindi (Devanagari script)
      /(?:भारी\s*रक्तस्राव|अत्यधिक\s*रक्तस्राव|बहुत\s*ज्यादा\s*खून\s*बह\s*रहा\s*है)/u,
      /खून\s*(?:रुक\s*नहीं\s*रहा|निकलना\s*बंद\s*नहीं\s*हो\s*रहा)/u,
      /खून\s*की\s*उल्टी/u,
      /खांसी\s*में\s*खून/u,

      // Hinglish (Transliteration)
      /\b(?:bohot|bahut|zyada)\s*khoon\s*beh\s*raha\s*hai\b/i,
      /\bkhoon\s*(?:ruk\s*nahi\s*raha|nahi\s*ruk\s*raha|band\s*nahi\s*ho\s*raha)\b/i,
      /\bkhoon\s*ki\s*ulti\b/i,
      /\bkhaansi\s*me\s*khoon\b/i,
    ],
  },
  {
    category: "consciousness",
    reason:
      "Altered mental status, unresponsiveness, or active seizure requires immediate emergency medical evaluation.",
    patterns: [
      // English
      /\bunconscious\b/i,
      /\bfainted\s+and\s+(?:not|wont)\s+waking\b/i,
      /\bpassed\s+out\s+and\s+(?:not|wont)\s+wak(?:ing|e)\b/i,
      /\bunresponsive\b/i,
      /\bnon-?responsive\b/i,
      /\bseizure(?:s)?\b/i,
      /\bseizing\b/i,
      /\bconvulsion(?:s)?\b/i,
      /\bcollapsed\s+and\s+unresponsive\b/i,

      // Tamil (Native script)
      /(?:மயக்கம்\s*அடைந்துவிட்டார்|மயங்கி\s*விழுந்துவிட்டார்)/u,
      /சுயநினைவு\s*இல்லை/u,
      /(?:வலிப்பு\s*வருகிறது|காக்கா\s*வலிப்பு)/u,
      /பேச்சு\s*மூச்சு\s*இல்லை/u,

      // Tanglish (Transliteration)
      /\b(?:mayakkam\s*pottutar|mayangi\s*vizhundhutaar)\b/i,
      /\bsuyaninaivu\s*(?:illa|illai)\b/i,
      /\b(?:valippu\s*vandhuruchu|valippu\s*varudhu|kaaka\s*valippu)\b/i,
      /\bpechu\s*moochu\s*(?:illa|illai)\b/i,

      // Hindi (Devanagari script)
      /(?:बेहोश\s*हो\s*गया|बेहोश\s*पड़ा\s*है|अचेत\s*हो\s*गया)/u,
      /कोई\s*होश\s*नहीं/u,
      /(?:दौरा\s*पड़\s*रहा\s*है|मिर्गी\s*का\s*दौरा)/u,
      /होश\s*नहीं\s*आ\s*रहा/u,

      // Hinglish (Transliteration)
      /\b(?:behosh\s*ho\s*gaya|behosh\s*padi\s*hai|behosh\s*hai)\b/i,
      /\b(?:koi\s*hosh\s*nahi|hosh\s*me\s*nahi\s*hai)\b/i,
      /\b(?:mirgi\s*ka\s*daura|daura\s*pad\s*raha\s*hai|jhatke\s*aa\s*rahe\s*hain)\b/i,
      /\bhosh\s*nahi\s*aa\s*raha\b/i,
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
      /நாக்கு\s*வீக்கம்/u,
      /தொண்டை\s*வீக்கம்/u,
      /गले\s*में\s*सूजन/u,
      /जीभ\s*में\s*सूजन/u,
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
      /விஷம்\s*(?:குடித்துவிட்டார்|சாப்பிட்டுவிட்டார்)/u,
      /जहर\s*(?:खा\s*लिया|पी\s*लिया)/u,
      /\bvisham\s*(?:kudithu|saapitu)\b/i,
      /\bzehar\s*(?:kha\s*liya|pee\s*liya)\b/i,
    ],
  },
  {
    category: "selfharm",
    reason:
      "Crisis support required: immediate intervention is necessary for safety and mental health support. Tele-MANAS is available at 14416.",
    patterns: [
      // English
      /\bsuicid(?:e|al)\b/i,
      /\bkill\s+myself\b/i,
      /\bwant\s+to\s+die\b/i,
      /\bend\s+my\s+life\b/i,
      /\bself-?\s*harm\b/i,
      /\bhurt\s+myself\b/i,
      /\btake\s+my\s+own\s+life\b/i,
      /\bhang\s+myself\b/i,
      /\bending\s+it\s+all\b/i,

      // Tamil (Native script)
      /தற்கொலை/u,
      /உயிரை\s*(?:மாய்த்துக்\s*கொள்ள|விட\s*தோன்றுகிறது)/u,
      /வாழ\s*பிடிக்கவில்லை\s*சாக\s*வேண்டும்/u,
      /என்னை\s*நானே\s*காயப்படுத்திக்கொள்ள/u,

      // Tanglish (Transliteration)
      /\b(?:tharkolai\s*panna\s*thonudhu|tharkolai\s*seiya\s*poren|tharkolai)\b/i,
      /\b(?:uyira\s*maathukka\s*poren|uyira\s*vida\s*poren)\b/i,
      /\b(?:saaga\s*poren|saaganum\s*pola\s*irukku|vazha\s*pudikala\s*saavanum)\b/i,
      /\benna\s*naane\s*kaayapaduthika\s*poren\b/i,

      // Hindi (Devanagari script)
      /(?:आत्महत्या|खुदकुशी)/u,
      /(?:जान\s*दे\s*दूंगा|अपनी\s*जान\s*लेना\s*चाहता\s*हूं)/u,
      /(?:मरना\s*चाहता\s*हूं|जीने\s*का\s*मन\s*नहीं\s*है)/u,
      /(?:खुद\s*को\s*नुकसान\s*पहुंचाना|अपनी\s*जिंदगी\s*खत्म\s*करना)/u,

      // Hinglish (Transliteration)
      /\b(?:aatmahatya|atmahatya|khudkushi)\b/i,
      /\b(?:jaan\s*de\s*dunga|jaan\s*dene\s*ja\s*raha|apni\s*jaan\s*le\s*lunga)\b/i,
      /\b(?:marna\s*chahta\s*hu|jeena\s*nahi\s*chahta|zindagi\s*khatam\s*karne)\b/i,
      /\b(?:khud\s*ko\s*khatam\s*kar\s*dunga|khud\s*ko\s*chot\s*pahunchana)\b/i,
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
      /கர்ப்பிணிக்கு\s*அதிக\s*ரத்தப்போக்கு/u,
      /गर्भावस्था\s*में\s*भारी\s*रक्तस्राव/u,
    ],
  },
];
