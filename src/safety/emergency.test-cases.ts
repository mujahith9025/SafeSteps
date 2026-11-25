/**
 * SafeSteps Emergency Detection Test Cases
 * Contains 30 critical phrases that MUST trigger an emergency,
 * and 20 benign / negated phrases that MUST NOT trigger an emergency.
 */

export const emergencyTriggerPhrases: string[] = [
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
];

export const emergencyNonTriggerPhrases: string[] = [
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
];
