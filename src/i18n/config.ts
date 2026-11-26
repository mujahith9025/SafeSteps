export const locales = ['en', 'ta', 'hi'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';

export interface LanguageOption {
  code: Locale;
  label: string;
  native: string;
  subLabel: string;
  description: string;
  sampleQuote: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  {
    code: 'en',
    label: 'English',
    native: 'English (US)',
    subLabel: 'Default Active',
    description: 'Standard clinical terminology aligned with emergency guidance pathways.',
    sampleQuote: '“Hello, how can SafeSteps help you feel better today?”',
  },
  {
    code: 'ta',
    label: 'தமிழ் (Tamil)',
    native: 'தமிழ்',
    subLabel: 'South Asian localization',
    description: 'Native script responses with clear phonetic clinical explanations.',
    sampleQuote: '“வணக்கம், இன்று SafeSteps உங்களுக்கு எவ்வாறு உதவ முடியும்?”',
  },
  {
    code: 'hi',
    label: 'हिन्दी (Hindi)',
    native: 'हिन्दी',
    subLabel: 'Devanagari script',
    description: 'Care navigation and conversational support formulated in clear Devanagari.',
    sampleQuote: '“नमस्ते, आज SafeSteps आपकी सेहत में क्या मदद कर सकता है?”',
  },
];
