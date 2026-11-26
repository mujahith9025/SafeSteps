import { cleanFreeText, containsContactDetails } from './validations/profile'

export interface ProfileContextInput {
  age?: number | null
  sex?: string | null
  height_cm?: number | null
  weight_kg?: number | null
  pregnant?: boolean | null
  allergies?: string[] | null
  conditions?: string[] | null
  medicines?: string[] | null
  personalise?: boolean | null
}

/**
 * Sanitizes a list of health tags (allergies, conditions, medicines)
 * - Strips script/HTML tags
 * - Strips contact details (phone numbers, email addresses)
 * - Limits length
 */
function cleanTagList(items?: string[] | null): string[] {
  if (!items || !Array.isArray(items)) return []

  return items
    .map((item) => {
      if (typeof item !== 'string') return ''
      let cleaned = cleanFreeText(item)
      // Remove contact info if accidentally present
      if (containsContactDetails(cleaned)) {
        cleaned = cleaned
          .replace(/[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g, '')
          .replace(/(?:(?:\+|00)\d{1,3}[\s-]*)?(?:\(?\d{2,5}\)?[\s-]*)?\d{3,5}[\s-]*\d{3,5}/g, '')
          .trim()
      }
      // Max 40 chars per item
      if (cleaned.length > 40) {
        cleaned = cleaned.substring(0, 40).trim()
      }
      return cleaned
    })
    .filter((item) => item.length > 0)
}

/**
 * Builds a safe, short plain-text block summarizing self-reported user health profile.
 *
 * Rules:
 * - Returns empty string if profile is missing or personalise is false.
 * - Never includes name or contact details.
 * - Includes ONLY fields the user explicitly filled in.
 * - Capped at 600 characters maximum.
 *
 * Example:
 * "User context (self-reported, unverified): age 34, female, allergies: penicillin, conditions: asthma, medicines: salbutamol."
 */
export function buildProfileContext(
  profile?: ProfileContextInput | null
): string {
  if (!profile || !profile.personalise) {
    return ''
  }

  const parts: string[] = []

  // 1. Age
  if (profile.age != null && profile.age >= 0 && profile.age <= 120) {
    parts.push(`age ${profile.age}`)
  }

  // 2. Sex
  if (profile.sex && typeof profile.sex === 'string') {
    const s = cleanFreeText(profile.sex).toLowerCase()
    if (s && s !== 'prefer_not_to_say') {
      parts.push(s)
    }
  }

  // 3. Pregnancy (only when true)
  if (profile.pregnant === true) {
    parts.push('pregnant')
  }

  // 4. Height
  if (profile.height_cm != null && profile.height_cm > 0) {
    parts.push(`height ${profile.height_cm}cm`)
  }

  // 5. Weight
  if (profile.weight_kg != null && profile.weight_kg > 0) {
    parts.push(`weight ${profile.weight_kg}kg`)
  }

  // 6. Allergies
  const allergies = cleanTagList(profile.allergies)
  if (allergies.length > 0) {
    parts.push(`allergies: ${allergies.join(', ')}`)
  }

  // 7. Conditions
  const conditions = cleanTagList(profile.conditions)
  if (conditions.length > 0) {
    parts.push(`conditions: ${conditions.join(', ')}`)
  }

  // 8. Medicines
  const medicines = cleanTagList(profile.medicines)
  if (medicines.length > 0) {
    parts.push(`medicines: ${medicines.join(', ')}`)
  }

  if (parts.length === 0) {
    return ''
  }

  let text = `User context (self-reported, unverified): ${parts.join(', ')}.`

  // Cap at 600 characters maximum
  if (text.length > 600) {
    text = text.substring(0, 597) + '...'
  }

  return text
}

/**
 * Returns a short display summary for the Stitch chat personalization pill,
 * e.g. "(Age: 32 • Allergies: Penicillin • Asthma)"
 */
export function getProfileSummaryPill(
  profile?: ProfileContextInput | null
): string {
  if (!profile) return ''

  const chips: string[] = []

  if (profile.age != null && profile.age > 0) {
    chips.push(`Age: ${profile.age}`)
  }

  if (profile.pregnant) {
    chips.push('Pregnant')
  }

  const allergies = cleanTagList(profile.allergies)
  if (allergies.length > 0) {
    chips.push(`Allergies: ${allergies.slice(0, 2).join(', ')}`)
  }

  const conditions = cleanTagList(profile.conditions)
  if (conditions.length > 0) {
    chips.push(conditions.slice(0, 2).join(', '))
  }

  if (chips.length === 0 && profile.sex) {
    const s = cleanFreeText(profile.sex)
    if (s && s !== 'prefer_not_to_say') {
      chips.push(s.charAt(0).toUpperCase() + s.slice(1))
    }
  }

  if (chips.length === 0) return ''

  return `(${chips.join(' • ')})`
}
