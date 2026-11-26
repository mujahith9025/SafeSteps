import { describe, it, expect } from 'vitest'
import {
  signUpSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  calculatePasswordStrength,
} from '../src/lib/validations/auth'
import { checkAuthRateLimit } from '../src/lib/rateLimit'

describe('SafeSteps Authentication Validation & Security', () => {
  describe('Sign Up Schema Validation', () => {
    it('accepts valid patient registration input', () => {
      const result = signUpSchema.safeParse({
        fullName: 'Ananya Patel',
        email: 'ananya.patel@healthnet.nhs.uk',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        consent: true,
      })
      expect(result.success).toBe(true)
    })

    it('rejects passwords with less than 8 characters', () => {
      const result = signUpSchema.safeParse({
        fullName: 'Ananya Patel',
        email: 'ananya@example.com',
        password: 'Pass1',
        confirmPassword: 'Pass1',
        consent: true,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message.includes('at least 8 characters'))).toBe(true)
      }
    })

    it('rejects passwords without numbers', () => {
      const result = signUpSchema.safeParse({
        fullName: 'Ananya Patel',
        email: 'ananya@example.com',
        password: 'PasswordOnly',
        confirmPassword: 'PasswordOnly',
        consent: true,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message.includes('at least one number'))).toBe(true)
      }
    })

    it('rejects mismatched password and confirmPassword', () => {
      const result = signUpSchema.safeParse({
        fullName: 'Ananya Patel',
        email: 'ananya@example.com',
        password: 'Password123!',
        confirmPassword: 'DifferentPassword123!',
        consent: true,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message.includes('do not match'))).toBe(true)
      }
    })

    it('rejects signups without required medical & legal consent', () => {
      const result = signUpSchema.safeParse({
        fullName: 'Ananya Patel',
        email: 'ananya@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        consent: false,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message.includes('must agree'))).toBe(true)
      }
    })

    it('rejects names exceeding 80 characters', () => {
      const result = signUpSchema.safeParse({
        fullName: 'A'.repeat(81),
        email: 'ananya@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        consent: true,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message.includes('80 characters'))).toBe(true)
      }
    })
  })

  describe('Login & Password Reset Schemas', () => {
    it('validates proper login credentials', () => {
      const valid = loginSchema.safeParse({
        email: 'patient@example.com',
        password: 'SecretPassword1',
      })
      expect(valid.success).toBe(true)

      const invalidEmail = loginSchema.safeParse({
        email: 'not-an-email',
        password: 'SecretPassword1',
      })
      expect(invalidEmail.success).toBe(false)
    })

    it('validates password recovery email requests', () => {
      const valid = forgotPasswordSchema.safeParse({
        email: 'patient@example.com',
      })
      expect(valid.success).toBe(true)
    })

    it('validates set new password matching and complexity', () => {
      const valid = resetPasswordSchema.safeParse({
        password: 'NewStrongPassword1',
        confirmPassword: 'NewStrongPassword1',
      })
      expect(valid.success).toBe(true)

      const mismatch = resetPasswordSchema.safeParse({
        password: 'NewStrongPassword1',
        confirmPassword: 'MismatchPassword1',
      })
      expect(mismatch.success).toBe(false)
    })
  })

  describe('Password Strength Evaluation', () => {
    it('evaluates strength progression accurately', () => {
      expect(calculatePasswordStrength('').label).toBe('Weak')
      expect(calculatePasswordStrength('abc').label).toBe('Weak')
      expect(calculatePasswordStrength('abcdefgh').label).toBe('Fair')
      expect(calculatePasswordStrength('Password123').label).toBe('Good')
      expect(calculatePasswordStrength('Password123!#').label).toBe('Strong')
    })
  })

  describe('Authentication Rate Limiter', () => {
    it('allows 5 attempts and blocks the 6th attempt', () => {
      const testIp = '192.0.2.' + Math.floor(Math.random() * 200)

      for (let i = 0; i < 5; i++) {
        const res = checkAuthRateLimit(testIp, 5, 60000)
        expect(res.allowed).toBe(true)
        expect(res.remaining).toBe(4 - i)
      }

      // 6th attempt should be blocked
      const blocked = checkAuthRateLimit(testIp, 5, 60000)
      expect(blocked.allowed).toBe(false)
      expect(blocked.remaining).toBe(0)
    })
  })
})
