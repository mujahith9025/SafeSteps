import { describe, it, expect, vi, beforeEach } from 'vitest'
import { submitConsentAction } from '@/app/consent/actions'
import { CURRENT_CONSENT_VERSION } from '@/lib/consent'

// Mock Supabase
const mockGetUser = vi.fn()
const mockUpsert = vi.fn()
const mockInsert = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: (table: string) => {
      if (table === 'profiles') {
        return {
          upsert: mockUpsert,
        }
      }
      if (table === 'audit_log') {
        return {
          insert: mockInsert,
        }
      }
      return {
        upsert: vi.fn(),
        insert: vi.fn(),
      }
    },
  })),
}))

describe('SafeSteps Consent & Privacy Logic (submitConsentAction)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects submission when termsAccepted is false', async () => {
    const res = await submitConsentAction(false, true, true)
    expect(res.success).toBe(false)
    expect(res.error).toContain('accept both required items')
    expect(mockGetUser).not.toHaveBeenCalled()
  })

  it('rejects submission when medicalAccepted is false', async () => {
    const res = await submitConsentAction(true, false, true)
    expect(res.success).toBe(false)
    expect(res.error).toContain('accept both required items')
    expect(mockGetUser).not.toHaveBeenCalled()
  })

  it('rejects submission when both required checkboxes are false', async () => {
    const res = await submitConsentAction(false, false, false)
    expect(res.success).toBe(false)
    expect(res.error).toContain('accept both required items')
  })

  it('redirects to login if user is unauthenticated', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: null },
      error: new Error('Session not found'),
    })

    const res = await submitConsentAction(true, true, true)
    expect(res.success).toBe(false)
    expect(res.error).toContain('session has expired')
    expect(res.redirectTo).toBe('/login?returnUrl=/consent')
  })

  it('saves consent version, timestamp, and personalisation preference for authenticated user', async () => {
    const testUserId = 'user-consent-uuid-123'
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: testUserId, email: 'patient@example.com' } },
      error: null,
    })
    mockUpsert.mockResolvedValueOnce({ error: null })
    mockInsert.mockResolvedValueOnce({ error: null })

    const res = await submitConsentAction(true, true, true)
    expect(res.success).toBe(true)

    // Verify profile upsert payload
    expect(mockUpsert).toHaveBeenCalledTimes(1)
    const [upsertPayload, upsertOptions] = mockUpsert.mock.calls[0]
    expect(upsertPayload.id).toBe(testUserId)
    expect(upsertPayload.consent_version).toBe(CURRENT_CONSENT_VERSION)
    expect(upsertPayload.personalise).toBe(true)
    expect(upsertPayload.consent_accepted_at).toBeDefined()
    expect(upsertOptions).toEqual({ onConflict: 'id' })

    // Verify audit log entry
    expect(mockInsert).toHaveBeenCalledTimes(1)
    const [auditPayload] = mockInsert.mock.calls[0]
    expect(auditPayload.user_id).toBe(testUserId)
    expect(auditPayload.action).toBe('consent_accepted')
    expect(auditPayload.entity).toBe('profiles')
    // Must NOT contain personal health data in audit_log
    expect(JSON.stringify(auditPayload)).not.toContain('symptoms')
    expect(JSON.stringify(auditPayload)).not.toContain('conditions')
  })

  it('correctly sets personalise to false when optional personalisation toggle is off', async () => {
    const testUserId = 'user-consent-uuid-456'
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: testUserId } },
      error: null,
    })
    mockUpsert.mockResolvedValueOnce({ error: null })
    mockInsert.mockResolvedValueOnce({ error: null })

    const res = await submitConsentAction(true, true, false)
    expect(res.success).toBe(true)

    const [upsertPayload] = mockUpsert.mock.calls[0]
    expect(upsertPayload.personalise).toBe(false)
    expect(upsertPayload.consent_version).toBe(CURRENT_CONSENT_VERSION)
  })

  it('returns friendly error when database upsert fails', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'user-789' } },
      error: null,
    })
    mockUpsert.mockResolvedValueOnce({ error: { message: 'Database connection failed' } })

    const res = await submitConsentAction(true, true, true)
    expect(res.success).toBe(false)
    expect(res.error).toContain('Unable to save your consent record')
  })
})
