import { describe, it, expect } from 'vitest'
import { cleanTitle } from '../src/lib/conversations'

describe('Conversation Auto-Titling & Cleansing', () => {
  it('extracts the first 6 words from a user message', () => {
    const raw = 'I have a sore throat and fever since yesterday morning'
    expect(cleanTitle(raw)).toBe('I have a sore throat and')
  })

  it('strips email addresses from titles', () => {
    const raw = 'Contact doctor at dr.smith@nhs.net severe headache'
    expect(cleanTitle(raw)).toBe('Contact doctor at severe headache')
  })

  it('strips phone numbers from titles', () => {
    const raw = 'Call +91 9876543210 about persistent knee pain'
    expect(cleanTitle(raw)).toBe('Call about persistent knee pain')
  })

  it('strips HTML tags from titles', () => {
    const raw = '<b>Sudden</b> dizziness and nausea'
    expect(cleanTitle(raw)).toBe('Sudden dizziness and nausea')
  })

  it('returns default fallback when message is blank or only contact details', () => {
    expect(cleanTitle('')).toBe('New health assessment')
    expect(cleanTitle('   ')).toBe('New health assessment')
    expect(cleanTitle('9876543210 test@email.com')).toBe('New health assessment')
  })

  it('enforces maximum character length of 60', () => {
    const longWords = 'Supercalifragilisticexpialidocious Pneumonoultramicroscopicsilicovolcanoconiosis Antidisestablishmentarianism Floccinaucinihilipilification'
    const title = cleanTitle(longWords)
    expect(title.length).toBeLessThanOrEqual(60)
  })
})
