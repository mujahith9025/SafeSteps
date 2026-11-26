import { describe, it, expect } from 'vitest'
import {
  cleanFreeText,
  containsContactDetails,
  tagItemSchema,
  profileSchema,
} from '../src/lib/validations/profile'

describe('Health Profile Validation & Guardrails', () => {
  describe('Free text cleaning & tag stripping', () => {
    it('strips HTML tags and collapses spaces', () => {
      const raw = '  <script>alert("xss")</script> <b>Severe</b>   Penicillin allergy  '
      expect(cleanFreeText(raw)).toBe('alert("xss") Severe Penicillin allergy')
    })
  })

  describe('Personal Contact Details Detection', () => {
    it('detects email addresses inside free text', () => {
      expect(containsContactDetails('doctor.patel@healthnet.nhs.uk')).toBe(true)
      expect(containsContactDetails('Call clinic or email triage@hospital.com for refill')).toBe(true)
      expect(containsContactDetails('Penicillin')).toBe(false)
    })

    it('detects telephone numbers inside free text', () => {
      expect(containsContactDetails('+91 9876543210')).toBe(true)
      expect(containsContactDetails('Emergency Dr mobile: 09876543210')).toBe(true)
      expect(containsContactDetails('Ph: (555) 123-4567')).toBe(true)
      expect(containsContactDetails('Salbutamol 100mcg')).toBe(false)
    })
  })

  describe('Tag Item Schema', () => {
    it('accepts valid clinical names under 40 characters', () => {
      const res = tagItemSchema.safeParse('Type 2 Diabetes Mellitus')
      expect(res.success).toBe(true)
      if (res.success) {
        expect(res.data).toBe('Type 2 Diabetes Mellitus')
      }
    })

    it('rejects entries over 40 characters', () => {
      const longEntry = 'This is an excessively long medication name that exceeds the maximum limit'
      const res = tagItemSchema.safeParse(longEntry)
      expect(res.success).toBe(false)
    })

    it('rejects entries with contact details with friendly message', () => {
      const res = tagItemSchema.safeParse('Call me at 9876543210 if reaction')
      expect(res.success).toBe(false)
      if (!res.success) {
        expect(res.error.issues[0]?.message).toBe("Please don't include personal contact details")
      }
    })
  })

  describe('Full Profile Schema & Maternal Safety Rule', () => {
    it('validates a complete health profile', () => {
      const res = profileSchema.safeParse({
        age: 28,
        sex: 'female',
        height_cm: 165,
        weight_kg: 58,
        pregnant: true,
        allergies: ['Penicillin', 'Peanuts'],
        conditions: ['Asthma'],
        medicines: ['Salbutamol'],
        preferred_language: 'en',
        personalise: true,
      })
      expect(res.success).toBe(true)
      if (res.success) {
        expect(res.data.pregnant).toBe(true)
      }
    })

    it('enforces age boundary: 0 to 120', () => {
      expect(profileSchema.safeParse({ age: -1 }).success).toBe(false)
      expect(profileSchema.safeParse({ age: 121 }).success).toBe(false)
      expect(profileSchema.safeParse({ age: 0 }).success).toBe(true)
      expect(profileSchema.safeParse({ age: 120 }).success).toBe(true)
    })

    it('enforces height boundary: 30 to 250 cm', () => {
      expect(profileSchema.safeParse({ height_cm: 20 }).success).toBe(false)
      expect(profileSchema.safeParse({ height_cm: 260 }).success).toBe(false)
      expect(profileSchema.safeParse({ height_cm: 170 }).success).toBe(true)
    })

    it('enforces weight boundary: 2 to 400 kg', () => {
      expect(profileSchema.safeParse({ weight_kg: 1 }).success).toBe(false)
      expect(profileSchema.safeParse({ weight_kg: 450 }).success).toBe(false)
      expect(profileSchema.safeParse({ weight_kg: 70 }).success).toBe(true)
    })

    it('automatically disables pregnant toggle if sex is not female', () => {
      const res = profileSchema.safeParse({
        age: 30,
        sex: 'male',
        pregnant: true,
      })
      expect(res.success).toBe(true)
      if (res.success) {
        expect(res.data.pregnant).toBe(false)
      }
    })

    it('automatically disables pregnant toggle if age is outside 12-55', () => {
      const resUnder = profileSchema.safeParse({
        age: 10,
        sex: 'female',
        pregnant: true,
      })
      expect(resUnder.success).toBe(true)
      if (resUnder.success) {
        expect(resUnder.data.pregnant).toBe(false)
      }

      const resOver = profileSchema.safeParse({
        age: 65,
        sex: 'female',
        pregnant: true,
      })
      expect(resOver.success).toBe(true)
      if (resOver.success) {
        expect(resOver.data.pregnant).toBe(false)
      }
    })

    it('rejects more than 20 items per list', () => {
      const list21 = Array.from({ length: 21 }, (_, i) => `Medication ${i + 1}`)
      const res = profileSchema.safeParse({
        medicines: list21,
      })
      expect(res.success).toBe(false)
    })
  })
})
