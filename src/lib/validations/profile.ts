import { z } from 'zod'

/**
 * Strips HTML tags and trims leading/trailing whitespace
 */
export function cleanFreeText(input: string): string {
  if (!input) return ''
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Collapse multiple whitespace to single space
    .trim()
}

/**
 * Checks whether a text string contains email addresses or phone numbers
 */
export function containsContactDetails(text: string): boolean {
  if (!text) return false

  // Email pattern check
  const emailRegex = /[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/
  if (emailRegex.test(text)) {
    return true
  }

  // Phone number pattern check:
  // Detects international format (+91...), domestic digits with hyphens/spaces, or 7+ consecutive/separated digits
  const phonePattern = /(?:(?:\+|00)\d{1,3}[\s-]*)?(?:\(?\d{2,5}\)?[\s-]*)?\d{3,5}[\s-]*\d{3,5}/
  const digitCount = (text.match(/\d/g) || []).length

  if (digitCount >= 7 && phonePattern.test(text)) {
    return true
  }

  return false
}

/**
 * Single tag item validation schema
 */
export const tagItemSchema = z
  .string()
  .transform(cleanFreeText)
  .pipe(
    z
      .string()
      .min(1, 'Item cannot be empty')
      .max(40, 'Maximum 40 characters per entry')
      .refine(
        (val) => !containsContactDetails(val),
        {
          message: "Please don't include personal contact details",
        }
      )
  )

/**
 * Full Health Profile Validation Schema
 */
export const profileSchema = z
  .object({
    age: z
      .union([
        z.number().int().min(0, 'Age must be at least 0').max(120, 'Age must be 120 or less'),
        z.literal(''),
        z.null(),
        z.undefined(),
      ])
      .transform((val) => (val === '' || val === undefined || val === null ? null : Number(val)))
      .nullable()
      .optional()
      .default(null),

    sex: z
      .enum(['female', 'male', 'undisclosed'])
      .nullable()
      .optional()
      .default(null),

    height_cm: z
      .union([
        z.number().min(30, 'Height must be between 30 and 250 cm').max(250, 'Height must be between 30 and 250 cm'),
        z.literal(''),
        z.null(),
        z.undefined(),
      ])
      .transform((val) => (val === '' || val === undefined || val === null ? null : Number(val)))
      .nullable()
      .optional()
      .default(null),

    weight_kg: z
      .union([
        z.number().min(2, 'Weight must be between 2 and 400 kg').max(400, 'Weight must be between 2 and 400 kg'),
        z.literal(''),
        z.null(),
        z.undefined(),
      ])
      .transform((val) => (val === '' || val === undefined || val === null ? null : Number(val)))
      .nullable()
      .optional()
      .default(null),

    pregnant: z.boolean().optional().default(false),

    allergies: z
      .array(tagItemSchema)
      .max(20, 'Maximum 20 items allowed in this list')
      .optional()
      .default([]),

    conditions: z
      .array(tagItemSchema)
      .max(20, 'Maximum 20 items allowed in this list')
      .optional()
      .default([]),

    medicines: z
      .array(tagItemSchema)
      .max(20, 'Maximum 20 items allowed in this list')
      .optional()
      .default([]),

    preferred_language: z.enum(['en', 'ta', 'hi']).optional().default('en'),
    personalise: z.boolean().optional().default(false),
  })
  .transform((data) => {
    // Maternal safety rule: Pregnant is only applicable when sex is female and age is 12 to 55
    const isEligibleFemale =
      data.sex === 'female' &&
      data.age !== null &&
      data.age >= 12 &&
      data.age <= 55

    return {
      ...data,
      pregnant: isEligibleFemale ? Boolean(data.pregnant) : false,
    }
  })

export type ProfileFormValues = z.infer<typeof profileSchema>
