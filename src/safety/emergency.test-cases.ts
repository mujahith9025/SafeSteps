/**
 * SafeSteps Emergency Detection Test Cases
 * Contains critical phrases that MUST trigger an emergency,
 * and benign / negated phrases that MUST NOT trigger an emergency.
 *
 * Covers English, Tamil (Tamil script + Tanglish transliterations),
 * and Hindi (Devanagari script + Hinglish transliterations).
 */

export const emergencyTriggerPhrases: string[] = [
  // ==========================================
  // ENGLISH TRIGGERS (30)
  // ==========================================
  // Cardiac (5)
  "I have severe chest pain and left arm sweating",
  "Sudden crushing chest tightness",
  "I think my father is having a heart attack",
  "Chest pain that radiates to my neck and jaw",
  "Unbearable pressure in my chest since 10 minutes",

  // Breathing (5)
  "I can't breathe and my chest hurts",
  "Help, my mother cannot breathe properly",
  "He is choking on food and turning blue",
  "Severe difficulty breathing and gasping for air",
  "My lips are turning blue and I am struggling to breathe",

  // Stroke (5)
  "My grandmother's face is drooping on one side",
  "Sudden slurred speech and confusion",
  "Sudden weakness on one side of my body and numbness",
  "Sudden loss of vision in my right eye",
  "This is the worst headache of my life, started like a thunderclap",

  // Bleeding (4)
  "Profuse severe bleeding from a deep wound that won't stop",
  "Vomiting large amounts of dark blood",
  "Coughing up bright red blood continuously",
  "The wound is spurting blood and bleeding won't stop",

  // Consciousness (3)
  "My brother fell unconscious and is not waking up",
  "She fainted and is unresponsive to our calls",
  "A child is having severe convulsions and seizing",

  // Allergy (3)
  "Severe allergic reaction with swelling of face and throat",
  "My throat is closing up after eating peanuts, anaphylaxis",
  "Sudden swelling of tongue and lips with rash",

  // Poisoning (2)
  "Accidental overdose, took too many pills",
  "A toddler swallowed bleach and poison",

  // Self-Harm (2)
  "I want to die and end my life, please help",
  "I am thinking about suicide and want to kill myself",

  // Pregnancy & Infants (1)
  "Newborn baby is not breathing and turning blue",

  // ==========================================
  // TAMIL & TANGLISH TRIGGERS (48)
  // ==========================================
  // Cardiac (8)
  "எனக்கு கடுமையான நெஞ்சு வலி உள்ளது",
  "மார்பு வலி அதிகமாக உள்ளது உடனடியாக வாருங்கள்",
  "திடீரென நெஞ்சு பாரம் மற்றும் வியர்வை கொட்டுகிறது",
  "அவருக்கு மாரடைப்பு வந்துவிட்டது என்று பயமாக உள்ளது",
  "இடது கை வலி மற்றும் நெஞ்சில் அழுத்தம் உள்ளது",
  "Enakku nenju vali romba athigama irukku",
  "Nenjula baram mathiri irukku left arm radiating pain",
  "Avarukku maaradaipu vandhuruchu help pannunga",

  // Breathing (8)
  "மூச்சு விட முடியவில்லை தயவுசெய்து உதவுங்கள்",
  "மூச்சு திணறல் அதிகமாக உள்ளது அவசர சிகிச்சை தேவை",
  "சுவாசிக்க முடியவில்லை தொண்டை அடைக்குது",
  "மூச்சு முட்டுகிறது உதடு நீலமாகிறது காப்பாற்றுங்கள்",
  "நோயாளிக்கு மூச்சு வாங்க முடியவில்லை",
  "Romba moochu thinaral irukku kashtama irukku",
  "Ennala moochu vida mudiyala help",
  "Thondai adaikkuthu swasikka mudiyala",

  // Stroke (8)
  "அம்மாவுக்கு முகம் கோணிவிட்டது பேச முடியவில்லை",
  "முகம் ஒரு பக்கமாக சரியுது மற்றும் நாக்கு குழறுகிறது",
  "திடீர் பக்கவாதம் வந்துவிட்டது உடனடியாக வரவும்",
  "ஒரு பக்கம் செயலிழந்துவிட்டது கை தூக்க முடியவில்லை",
  "திடீரென பேச்சு குளறல் வந்துள்ளது புரியவில்லை",
  "Mugam koni pochu oru pakkam",
  "Pechu kolarudhu thideernu",
  "Oru pakkam seyal izhanthuduchu thideer pakkavatham",

  // Bleeding (8)
  "அதிக ரத்தப்போக்கு நிற்கவில்லை",
  "காயம் அடைந்து ரத்தம் கொட்டுகிறது நில்லாமல்",
  "நோயாளிக்கு ரத்த வாந்தி வருகிறது உடனடியாக வாருங்கள்",
  "இருமலில் ரத்தம் வருகிறது தொடர்ந்து",
  "ரத்தம் பீறிட்டு அடிக்கிறது நரம்பு வெட்டிவிட்டது",
  "Ratham nikkala romba adhiga rathapokku",
  "Ratha vaandhi eduthaar achanak",
  "Irumalla ratham varudhu stop aagala",

  // Consciousness (8)
  "நோயாளி மயக்கம் அடைந்துவிட்டார் எழுப்ப முடியவில்லை",
  "திடீரென சுயநினைவு இல்லை என்ன செய்வது",
  "குழந்தைக்கு காக்கா வலிப்பு வருகிறது உடம்பு நடுங்குகிறது",
  "மயங்கி விழுந்துவிட்டார் பேச்சு மூச்சு இல்லை",
  "கடுமையான வலிப்பு வருகிறது உதவவும்",
  "Mayangi vizhundhutaar ezhundhirikkala",
  "Avarukku suyaninaivu illa",
  "Kozhandhaiku valippu vandhuruchu pechu moochu illa",

  // Self-Harm (8)
  "நான் தற்கொலை செய்து கொள்ளப் போகிறேன்",
  "உயிரை மாய்த்துக் கொள்ள தோன்றுகிறது வாழ விருப்பமில்லை",
  "வாழ பிடிக்கவில்லை சாக வேண்டும் இப்போது",
  "என்னை நானே காயப்படுத்திக்கொள்ள நினைக்கிறேன்",
  "உயிரை விட தோன்றுகிறது மன உளைச்சலில் உள்ளேன்",
  "Tharkolai seiya poren vazha pudikala",
  "Uyira maathukka poren romba kashtama irukku",
  "Enna naane kaayapaduthika poren saaga poren",

  // ==========================================
  // HINDI & HINGLISH TRIGGERS (48)
  // ==========================================
  // Cardiac (8)
  "मेरे सीने में दर्द और भारीपन हो रहा है",
  "अचानक छाती में दर्द और सांस लेने में तकलीफ हो रही है",
  "पिताजी को दिल का दौरा पड़ा है जल्दी मदद चाहिए",
  "सीने में दबाव और जकड़न महसूस हो रही है बहुत तेज",
  "बाएं हाथ में दर्द और पसीना आ रहा है",
  "Mujhe seene me dard aur ghabrahat ho rahi hai",
  "Chaati me dabav aur tez dard ho raha hai",
  "Aisa lag raha hai dil ka daura pada hai",

  // Breathing (8)
  "मुझे सांस लेने में दिक्कत हो रही है दम घुट रहा है",
  "मरीज को सांस नहीं आ रही है तुरंत एम्बुलेंस भेजो",
  "दम घुट रहा है और होंठ नीले पड़ रहे हैं",
  "गला घुट रहा है और सांस फूल रही है बहुत तेज",
  "अचानक सांस रुक रही है हवा नहीं मिल रही",
  "Mujhe saans lene me dikkat ho rahi hai bahot",
  "Saans nahi aa rahi gala band ho raha hai",
  "Dam ghut raha hai lips neele pad gaye",

  // Stroke (8)
  "चेहरे का टेढ़ापन और मुंह टेढ़ा हो गया है",
  "अचानक जुबान लड़खड़ा रही है और बोल नहीं पा रहे",
  "शरीर के एक तरफ लकवा मार गया है",
  "एक तरफ का शरीर सुन्न पड़ गया है हिल नहीं रहा",
  "अचानक फालिज मार गया है मुंह टेढ़ा है",
  "Chehra tedha ho gaya aur boli ladkhada rahi hai",
  "Achanak ek taraf lakwa maar gaya",
  "Muh tedha ho gaya aur zubaan ladkhada rahi hai",

  // Bleeding (8)
  "घाव से भारी रक्तस्राव हो रहा है और खून रुक नहीं रहा",
  "मरीज को खून की उल्टी हो रही है बहुत ज्यादा",
  "खांसी में खून आ रहा है लगातार",
  "बहुत ज्यादा खून बह रहा है बंद नहीं हो रहा",
  "अत्यधिक रक्तस्राव की वजह से चक्कर आ रहा है",
  "Bohot zyada khoon beh raha hai ghav se",
  "Khoon ruk nahi raha lagatar beh raha hai",
  "Khoon ki ulti aur khansi me khoon aa raha hai",

  // Consciousness (8)
  "मरीज बेहोश हो गया है और कोई होश नहीं है",
  "बच्चे को मिर्गी का दौरा पड़ रहा है शरीर कांप रहा है",
  "वह अचेत हो गया और होश नहीं आ रहा",
  "दौरा पड़ रहा है और शरीर अकड़ रहा है",
  "अचानक बेहोश पड़ा है हिलाने पर भी नहीं उठ रहा",
  "Achanak behosh ho gaya aur uth nahi raha",
  "Koi hosh nahi hai daura pad raha hai",
  "Achanak mirgi ka daura aa gaya jhatke lag rahe hain",

  // Self-Harm (8)
  "मैं आत्महत्या करने का विचार कर रहा हूं",
  "खुदकुशी करने का मन कर रहा है सब खत्म करना है",
  "मैं अपनी जान लेना चाहता हूं अब और नहीं सहा जाता",
  "अब जीने का मन नहीं है मरना चाहता हूं",
  "खुद को नुकसान पहुंचाना चाहता हूं बहुत परेशान हूं",
  "Aatmahatya karne ka man kar raha hai",
  "Khudkushi karna chahta hu zindgi se pareshan hu",
  "Marna chahta hu jaan de dunga abhi",
];

export const emergencyNonTriggerPhrases: string[] = [
  // ==========================================
  // ENGLISH NON-TRIGGERS (20)
  // ==========================================
  // Normal mild symptoms (10)
  "I have a mild headache after working on my laptop",
  "Slight tension in forehead, about 3/10",
  "Common cold with runny nose and sneezing",
  "Mild fever since yesterday evening",
  "Dry cough and tickle in my throat",
  "Feeling tired and fatigued after a long journey",
  "Minor paper cut on my index finger",
  "I have a mild sore throat when swallowing food",
  "Slight muscle soreness after exercise",
  "Feeling bloated after a heavy meal",

  // Negated emergency symptoms (10)
  "No chest pain, just a mild fever and cold",
  "I do not have chest pain or tightness",
  "Patient denies chest pain or arm discomfort",
  "Breathing is normal, without trouble breathing",
  "Can breathe fine, not choking or gasping",
  "No facial drooping or speech problems",
  "Without bleeding, the scrape is clean and dry",
  "Fully conscious, never had a seizure",
  "No swelling of face or throat, just mild seasonal itchiness",
  "Not suicidal and not having thoughts of self harm",

  // ==========================================
  // TAMIL & TANGLISH NON-TRIGGERS (10)
  // ==========================================
  "லேசான தலைவலி உள்ளது வேலை பார்த்ததால்",
  "சாதாரண சளி மற்றும் தும்மல் உள்ளது",
  "நேற்றிலிருந்து லேசான காய்ச்சல் மட்டும் தான்",
  "உடற்பயிற்சிக்குப் பின் லேசான தசை வலி",
  "வயிற்று உப்புசம் அதிகமாக சாப்பிட்டதால் வந்தது",
  "நெஞ்சு வலி எதுவும் இல்லை, சாதாரண சளி தான்",
  "சுவாசிப்பதில் சிரமம் இல்லை நன்றாக மூச்சு விடுகிறேன்",
  "Enakku nenju vali illa, verum cold mattum thaan",
  "Moochu vida kashtam edhuvum illa normal ah irukku",
  "Rathapokku illa, chinna viral keeral mattum thaan",

  // ==========================================
  // HINDI & HINGLISH NON-TRIGGERS (10)
  // ==========================================
  "मुझे लैपटॉप पर काम करने के बाद हल्का सिरदर्द है",
  "हल्का बुखार और जुकाम है मौसम बदलने से",
  "गले में हल्की खराश है बस",
  "सफर के बाद थोड़ी थकान महसूस हो रही है",
  "उंगली पर हल्का सा खरोंच आया है साफ कर लिया",
  "सीने में दर्द नहीं है, केवल गैस की समस्या है",
  "सांस लेने में कोई दिक्कत नहीं है सब सामान्य है",
  "Mujhe seene me dard nahi hai, bas thodi khansi hai",
  "Saans lene me koi dikkat nahi hai normal hai",
  "Khoon nahi beh raha, bas chhota sa cut hai",
];
