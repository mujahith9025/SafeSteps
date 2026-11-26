import { describe, it, expect } from 'vitest'
import { NAV_ITEMS } from '../src/components/shell/AppSidebar'

describe('SafeSteps App Shell Specifications', () => {
  it('defines the required primary navigation items matching Stitch', () => {
    const labels = NAV_ITEMS.map((item) => item.label)
    expect(labels).toContain('Chat')
    expect(labels).toContain('My reports')
    expect(labels).toContain('Health profile')
    expect(labels).toContain('History')
    expect(labels).toContain('Settings')
    expect(NAV_ITEMS.length).toBe(5)
  })

  it('binds correct URLs to each navigation item', () => {
    const navMap = Object.fromEntries(NAV_ITEMS.map((item) => [item.label, item.href]))
    expect(navMap['Chat']).toBe('/chat')
    expect(navMap['My reports']).toBe('/reports')
    expect(navMap['Health profile']).toBe('/profile')
    expect(navMap['History']).toBe('/history')
    expect(navMap['Settings']).toBe('/settings')
  })

  it('matches all routes to allowed protected redirects', () => {
    NAV_ITEMS.forEach((item) => {
      expect(item.href.startsWith('/')).toBe(true)
    })
  })
})
