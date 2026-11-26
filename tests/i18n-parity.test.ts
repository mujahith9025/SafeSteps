import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

function getLeafKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  let keys: string[] = []
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys = keys.concat(getLeafKeys(value as Record<string, unknown>, fullKey))
    } else {
      keys.push(fullKey)
    }
  }
  return keys.sort()
}

describe('SafeSteps Internationalization (i18n) Key Parity & Safety Coverage', () => {
  const baseDir = process.cwd()
  const enPath = path.join(baseDir, 'messages', 'en.json')
  const taPath = path.join(baseDir, 'messages', 'ta.json')
  const hiPath = path.join(baseDir, 'messages', 'hi.json')

  it('verifies that all three translation files (en.json, ta.json, hi.json) exist', () => {
    expect(fs.existsSync(enPath)).toBe(true)
    expect(fs.existsSync(taPath)).toBe(true)
    expect(fs.existsSync(hiPath)).toBe(true)
  })

  it('successfully parses all three translation files as valid JSON', () => {
    expect(() => JSON.parse(fs.readFileSync(enPath, 'utf8'))).not.toThrow()
    expect(() => JSON.parse(fs.readFileSync(taPath, 'utf8'))).not.toThrow()
    expect(() => JSON.parse(fs.readFileSync(hiPath, 'utf8'))).not.toThrow()
  })

  it('guarantees exact 100% leaf key parity across English, Tamil, and Hindi', () => {
    const en = JSON.parse(fs.readFileSync(enPath, 'utf8'))
    const ta = JSON.parse(fs.readFileSync(taPath, 'utf8'))
    const hi = JSON.parse(fs.readFileSync(hiPath, 'utf8'))

    const enKeys = getLeafKeys(en)
    const taKeys = getLeafKeys(ta)
    const hiKeys = getLeafKeys(hi)

    // Expected key count across entire app
    expect(enKeys.length).toBeGreaterThanOrEqual(200)
    expect(taKeys.length).toBe(enKeys.length)
    expect(hiKeys.length).toBe(enKeys.length)

    // Check for any missing keys in Tamil
    const missingInTa = enKeys.filter((k) => !taKeys.includes(k))
    const extraInTa = taKeys.filter((k) => !enKeys.includes(k))
    expect(missingInTa, `Keys missing in ta.json: ${missingInTa.join(', ')}`).toEqual([])
    expect(extraInTa, `Unexpected extra keys in ta.json: ${extraInTa.join(', ')}`).toEqual([])

    // Check for any missing keys in Hindi
    const missingInHi = enKeys.filter((k) => !hiKeys.includes(k))
    const extraInHi = hiKeys.filter((k) => !enKeys.includes(k))
    expect(missingInHi, `Keys missing in hi.json: ${missingInHi.join(', ')}`).toEqual([])
    expect(extraInHi, `Unexpected extra keys in hi.json: ${extraInHi.join(', ')}`).toEqual([])
  })

  it('parity checker correctly detects missing keys in simulated incomplete translations', () => {
    const mockEn = {
      common: {
        save: 'Save',
        cancel: 'Cancel',
      },
      emergency: {
        call112: 'Call 112',
      },
    }

    const mockIncompleteTa = {
      common: {
        save: 'சேமி',
        // 'cancel' is missing
      },
      emergency: {
        call112: '112 ஐ அழைக்கவும்',
      },
    }

    const enKeys = getLeafKeys(mockEn)
    const taKeys = getLeafKeys(mockIncompleteTa)

    const missingInTa = enKeys.filter((k) => !taKeys.includes(k))
    expect(missingInTa).toContain('common.cancel')
    expect(missingInTa.length).toBe(1)
  })

  it('parity checker correctly detects extra/unmatched keys in simulated translations', () => {
    const mockEn = {
      common: { save: 'Save' },
    }

    const mockExtraHi = {
      common: { save: 'सहेजें', extraField: 'अतिरिक्त' },
    }

    const enKeys = getLeafKeys(mockEn)
    const hiKeys = getLeafKeys(mockExtraHi)

    const extraInHi = hiKeys.filter((k) => !enKeys.includes(k))
    expect(extraInHi).toContain('common.extraField')
  })

  it('verifies that clinical safety strings are present, non-empty, and localized across all 3 languages', () => {
    const en = JSON.parse(fs.readFileSync(enPath, 'utf8'))
    const ta = JSON.parse(fs.readFileSync(taPath, 'utf8'))
    const hi = JSON.parse(fs.readFileSync(hiPath, 'utf8'))

    // 1. Disclaimer banner
    expect(en.disclaimer.bannerText.length).toBeGreaterThan(10)
    expect(ta.disclaimer.bannerText.length).toBeGreaterThan(10)
    expect(hi.disclaimer.bannerText.length).toBeGreaterThan(10)

    // 2. Emergency phone call text (112)
    expect(en.shell.emergencyButton).toContain('112')
    expect(ta.shell.emergencyButton).toContain('112')
    expect(hi.shell.emergencyButton).toContain('112')

    // 3. Emergency page title and hotline
    expect(en.emergency.title.length).toBeGreaterThan(5)
    expect(ta.emergency.title.length).toBeGreaterThan(5)
    expect(hi.emergency.title.length).toBeGreaterThan(5)
    expect(en.emergency.callNow).toContain('112')
    expect(ta.emergency.callNow).toContain('112')
    expect(hi.emergency.callNow).toContain('112')
  })
})
