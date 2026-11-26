import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  checkExportRateLimit,
  checkDeleteRateLimit,
  resetSettingsRateLimitStore,
} from '@/lib/rateLimit'
import { GET as exportHandler } from '@/app/api/user/export/route'
import { POST as deleteHandler } from '@/app/api/user/delete/route'
import {
  changePasswordAction,
  updatePersonalisationAction,
} from '@/app/(app)/settings/actions'
import { NextRequest } from 'next/server'

// Mock Supabase Server and Admin clients
const mockGetUser = vi.fn()
const mockSignOut = vi.fn()
const mockSignInWithPassword = vi.fn()
const mockUpdateUser = vi.fn()
const mockSelect = vi.fn()
const mockDelete = vi.fn()
const mockInsert = vi.fn()
const mockAdminDeleteUser = vi.fn()

// In-memory mock database store to test strict data ownership and isolation
interface MockDb {
  profiles: { id: string; full_name: string; personalise: boolean; consent_version: string }[]
  conversations: { id: string; user_id: string; title: string }[]
  messages: { id: string; user_id: string; conversation_id: string; content: string }[]
  reports: { id: string; user_id: string; title: string }[]
  report_values: { id: string; user_id: string; report_id: string; test_name: string }[]
  audit_log: { id: string; user_id: string | null; action: string; entity: string }[]
}

let mockDb: MockDb = {
  profiles: [],
  conversations: [],
  messages: [],
  reports: [],
  report_values: [],
  audit_log: [],
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
      signOut: mockSignOut,
      signInWithPassword: mockSignInWithPassword,
      updateUser: mockUpdateUser,
    },
    from: (table: keyof MockDb) => {
      let filtered = [...mockDb[table]]
      let lastUserIdFilter: string | null = null
      let isSingle = false

      const queryBuilder: any = {
        select: vi.fn((_cols?: string) => queryBuilder),
        eq: vi.fn((col: string, val: any) => {
          if (col === 'user_id' || col === 'id') {
            lastUserIdFilter = val
          }
          filtered = filtered.filter((row: any) => row[col] === val)
          return queryBuilder
        }),
        order: vi.fn((_col: string, _opts: any) => queryBuilder),
        maybeSingle: vi.fn(async () => {
          return { data: filtered[0] || null, error: null }
        }),
        insert: vi.fn(async (data: any) => {
          const row = { id: `mock-${Date.now()}`, ...data }
          mockDb[table].push(row as any)
          return { data: row, error: null }
        }),
        update: vi.fn((data: any) => ({
          eq: async (col: string, val: any) => {
            const index = mockDb[table].findIndex((row: any) => row[col] === val)
            if (index !== -1) {
              mockDb[table][index] = { ...mockDb[table][index], ...data }
            }
            return { error: null }
          },
        })),
        delete: vi.fn(() => ({
          eq: vi.fn(async (col: string, val: any) => {
            mockDb[table] = (mockDb[table] as any[]).filter(
              (row: any) => row[col] !== val
            ) as any
            return { error: null }
          }),
        })),
        then: (resolve: any) => resolve({ data: filtered, error: null }),
      }

      return queryBuilder
    },
  })),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    auth: {
      admin: {
        deleteUser: mockAdminDeleteUser,
      },
    },
    from: (table: keyof MockDb) => ({
      delete: () => ({
        eq: async (col: string, val: any) => {
          mockDb[table] = (mockDb[table] as any[]).filter(
            (row: any) => row[col] !== val
          ) as any
          return { error: null }
        },
      }),
    }),
  })),
}))

describe('SafeSteps Settings Specifications', () => {
  beforeEach(() => {
    resetSettingsRateLimitStore()
    vi.clearAllMocks()

    // Initialize mock database with User A (Alice) and User B (Bob) data
    mockDb = {
      profiles: [
        { id: 'user-alice-111', full_name: 'Alice Smith', personalise: true, consent_version: '2026-11-v1' },
        { id: 'user-bob-222', full_name: 'Bob Jones', personalise: false, consent_version: '2026-11-v1' },
      ],
      conversations: [
        { id: 'conv-alice-1', user_id: 'user-alice-111', title: 'Chest tightness consultation' },
        { id: 'conv-bob-1', user_id: 'user-bob-222', title: 'Mild knee sprain' },
      ],
      messages: [
        { id: 'msg-alice-1', user_id: 'user-alice-111', conversation_id: 'conv-alice-1', content: 'Alice query' },
        { id: 'msg-bob-1', user_id: 'user-bob-222', conversation_id: 'conv-bob-1', content: 'Bob query' },
      ],
      reports: [
        { id: 'rep-alice-1', user_id: 'user-alice-111', title: 'Alice CBC Report' },
        { id: 'rep-bob-1', user_id: 'user-bob-222', title: 'Bob Lipid Panel' },
      ],
      report_values: [
        { id: 'val-alice-1', user_id: 'user-alice-111', report_id: 'rep-alice-1', test_name: 'Haemoglobin' },
        { id: 'val-bob-1', user_id: 'user-bob-222', report_id: 'rep-bob-1', test_name: 'Cholesterol' },
      ],
      audit_log: [
        { id: 'audit-1', user_id: 'user-alice-111', action: 'login', entity: 'session' },
        { id: 'audit-2', user_id: 'user-bob-222', action: 'login', entity: 'session' },
      ],
    }

    mockAdminDeleteUser.mockResolvedValue({ error: null })
    mockSignOut.mockResolvedValue({ error: null })
  })

  // ===========================================================================
  // 1. Rate Limiting Tests (3 operations per hour per user)
  // ===========================================================================
  describe('Rate Limiting (3 per hour per user)', () => {
    it('allows up to 3 data exports within 1 hour for a user and rejects the 4th', () => {
      const userId = 'user-alice-111'

      // First 3 requests must succeed
      for (let i = 1; i <= 3; i++) {
        const res = checkExportRateLimit(userId)
        expect(res.allowed).toBe(true)
        expect(res.remaining).toBe(3 - i)
      }

      // 4th request must be rate-limited
      const fourth = checkExportRateLimit(userId)
      expect(fourth.allowed).toBe(false)
      expect(fourth.remaining).toBe(0)
      expect(fourth.resetTime).toBeGreaterThan(Date.now())
    })

    it('allows up to 3 account deletion requests within 1 hour and rejects the 4th', () => {
      const userId = 'user-alice-111'

      for (let i = 1; i <= 3; i++) {
        const res = checkDeleteRateLimit(userId)
        expect(res.allowed).toBe(true)
        expect(res.remaining).toBe(3 - i)
      }

      const fourth = checkDeleteRateLimit(userId)
      expect(fourth.allowed).toBe(false)
      expect(fourth.remaining).toBe(0)
    })

    it('isolates rate limits independently between user A and user B', () => {
      const userA = 'user-alice-111'
      const userB = 'user-bob-222'

      // Exhaust User A's export quota
      checkExportRateLimit(userA)
      checkExportRateLimit(userA)
      checkExportRateLimit(userA)
      expect(checkExportRateLimit(userA).allowed).toBe(false)

      // User B must still have full quota available
      const userBRes = checkExportRateLimit(userB)
      expect(userBRes.allowed).toBe(true)
      expect(userBRes.remaining).toBe(2)
    })
  })

  // ===========================================================================
  // 2. Data Export & Strict Ownership Rules
  // ===========================================================================
  describe('GET /api/user/export (Data Portability)', () => {
    it('rejects unauthenticated requests with 401 Unauthorized', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: new Error('No session') })

      const res = await exportHandler()
      expect(res.status).toBe(401)
      const data = await res.json()
      expect(data.error).toContain('Unauthorized')
    })

    it("exports ONLY user A's data and strictly excludes user B's records", async () => {
      mockGetUser.mockResolvedValueOnce({
        data: {
          user: { id: 'user-alice-111', email: 'alice@safesteps.org', created_at: '2026-01-01T00:00:00Z' },
        },
        error: null,
      })

      const res = await exportHandler()
      expect(res.status).toBe(200)
      expect(res.headers.get('Content-Disposition')).toContain('attachment; filename="safesteps-data-export-')

      const exported = await res.json()

      // User A's profile verified
      expect(exported.user.id).toBe('user-alice-111')
      expect(exported.profile.full_name).toBe('Alice Smith')

      // User A's conversations only
      expect(exported.conversations.length).toBe(1)
      expect(exported.conversations[0].title).toBe('Chest tightness consultation')
      expect(exported.conversations.some((c: any) => c.user_id === 'user-bob-222')).toBe(false)

      // User A's messages only
      expect(exported.messages.length).toBe(1)
      expect(exported.messages[0].content).toBe('Alice query')
      expect(exported.messages.some((m: any) => m.user_id === 'user-bob-222')).toBe(false)

      // User A's reports & values only
      expect(exported.reports.length).toBe(1)
      expect(exported.reports[0].title).toBe('Alice CBC Report')
      expect(exported.report_values.length).toBe(1)
      expect(exported.report_values[0].test_name).toBe('Haemoglobin')

      // Bob's data must NOT be present anywhere in Alice's export
      const stringified = JSON.stringify(exported)
      expect(stringified).not.toContain('user-bob-222')
      expect(stringified).not.toContain('Bob Jones')
      expect(stringified).not.toContain('Mild knee sprain')
    })

    it('writes an action-only compliance entry to audit_log without medical content', async () => {
      mockGetUser.mockResolvedValueOnce({
        data: {
          user: { id: 'user-alice-111', email: 'alice@safesteps.org' },
        },
        error: null,
      })

      await exportHandler()

      const auditEntries = mockDb.audit_log.filter(
        (entry) => entry.user_id === 'user-alice-111' && entry.action === 'export_personal_data'
      )
      expect(auditEntries.length).toBe(1)
      expect(auditEntries[0].entity).toBe('user_archive')
    })

    it('enforces 3/hour rate limit and returns 429 when quota is exceeded', async () => {
      // Consume 3 allowed exports
      checkExportRateLimit('user-alice-111')
      checkExportRateLimit('user-alice-111')
      checkExportRateLimit('user-alice-111')

      mockGetUser.mockResolvedValueOnce({
        data: { user: { id: 'user-alice-111', email: 'alice@safesteps.org' } },
        error: null,
      })

      const res = await exportHandler()
      expect(res.status).toBe(429)
      const data = await res.json()
      expect(data.error).toContain('Export rate limit exceeded')
    })
  })

  // ===========================================================================
  // 3. Account Deletion & Strict Ownership Isolation
  // ===========================================================================
  describe('POST /api/user/delete (Right to Erasure)', () => {
    it('rejects unauthenticated requests with 401 Unauthorized', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: new Error('No session') })

      const req = new NextRequest('http://localhost/api/user/delete', {
        method: 'POST',
        body: JSON.stringify({ confirmation: 'DELETE' }),
      })

      const res = await deleteHandler(req)
      expect(res.status).toBe(401)
    })

    it('rejects deletion if confirmation keyword is not exactly DELETE', async () => {
      mockGetUser.mockResolvedValueOnce({
        data: { user: { id: 'user-alice-111', email: 'alice@safesteps.org' } },
        error: null,
      })

      const req = new NextRequest('http://localhost/api/user/delete', {
        method: 'POST',
        body: JSON.stringify({ confirmation: 'delete' }), // lowercase must be rejected
      })

      const res = await deleteHandler(req)
      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data.error).toContain('Confirmation failed')
    })

    it("deletes ONLY user A's data and preserves user B's records intact", async () => {
      mockGetUser.mockResolvedValueOnce({
        data: { user: { id: 'user-alice-111', email: 'alice@safesteps.org' } },
        error: null,
      })

      const req = new NextRequest('http://localhost/api/user/delete', {
        method: 'POST',
        body: JSON.stringify({ confirmation: 'DELETE' }),
      })

      const res = await deleteHandler(req)
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.success).toBe(true)
      expect(data.redirectUrl).toBe('/account-deleted')

      // 1. Verify User A's data was completely purged
      expect(mockDb.profiles.find((p) => p.id === 'user-alice-111')).toBeUndefined()
      expect(mockDb.conversations.find((c) => c.user_id === 'user-alice-111')).toBeUndefined()
      expect(mockDb.messages.find((m) => m.user_id === 'user-alice-111')).toBeUndefined()
      expect(mockDb.reports.find((r) => r.user_id === 'user-alice-111')).toBeUndefined()
      expect(mockDb.report_values.find((v) => v.user_id === 'user-alice-111')).toBeUndefined()

      // 2. Verify audit logs containing User A's ID were destroyed/anonymized
      expect(mockDb.audit_log.find((a) => a.user_id === 'user-alice-111')).toBeUndefined()

      // 3. Verify Admin deleteUser was called for User A
      expect(mockAdminDeleteUser).toHaveBeenCalledWith('user-alice-111')

      // 4. CRITICAL: User B's data MUST remain completely untouched!
      expect(mockDb.profiles.find((p) => p.id === 'user-bob-222')).toBeDefined()
      expect(mockDb.conversations.find((c) => c.user_id === 'user-bob-222')).toBeDefined()
      expect(mockDb.messages.find((m) => m.user_id === 'user-bob-222')).toBeDefined()
      expect(mockDb.reports.find((r) => r.user_id === 'user-bob-222')).toBeDefined()
      expect(mockDb.report_values.find((v) => v.user_id === 'user-bob-222')).toBeDefined()
      expect(mockDb.audit_log.find((a) => a.user_id === 'user-bob-222')).toBeDefined()
    })

    it('is idempotent: retrying deletion on already-purged records succeeds gracefully', async () => {
      // First deletion
      mockGetUser.mockResolvedValueOnce({
        data: { user: { id: 'user-alice-111', email: 'alice@safesteps.org' } },
        error: null,
      })

      const req1 = new NextRequest('http://localhost/api/user/delete', {
        method: 'POST',
        body: JSON.stringify({ confirmation: 'DELETE' }),
      })

      const res1 = await deleteHandler(req1)
      expect(res1.status).toBe(200)

      // Second deletion attempt (retry) with admin returning "User not found"
      mockGetUser.mockResolvedValueOnce({
        data: { user: { id: 'user-alice-111', email: 'alice@safesteps.org' } },
        error: null,
      })
      mockAdminDeleteUser.mockResolvedValueOnce({ error: { message: 'User not found' } })

      const req2 = new NextRequest('http://localhost/api/user/delete', {
        method: 'POST',
        body: JSON.stringify({ confirmation: 'DELETE' }),
      })

      const res2 = await deleteHandler(req2)
      expect(res2.status).toBe(200)
      const data2 = await res2.json()
      expect(data2.success).toBe(true)
      expect(data2.redirectUrl).toBe('/account-deleted')
    })

    it('enforces 3/hour rate limit on deletion attempts', async () => {
      // Consume 3 deletion attempts
      checkDeleteRateLimit('user-alice-111')
      checkDeleteRateLimit('user-alice-111')
      checkDeleteRateLimit('user-alice-111')

      mockGetUser.mockResolvedValueOnce({
        data: { user: { id: 'user-alice-111', email: 'alice@safesteps.org' } },
        error: null,
      })

      const req = new NextRequest('http://localhost/api/user/delete', {
        method: 'POST',
        body: JSON.stringify({ confirmation: 'DELETE' }),
      })

      const res = await deleteHandler(req)
      expect(res.status).toBe(429)
      const data = await res.json()
      expect(data.error).toContain('Deletion rate limit exceeded')
    })
  })

  // ===========================================================================
  // 4. Password Change & Personalisation Action Tests
  // ===========================================================================
  describe('Settings Server Actions', () => {
    describe('changePasswordAction', () => {
      it('rejects passwords shorter than 8 characters', async () => {
        const res = await changePasswordAction({
          currentPassword: 'CurrentPass1!',
          newPassword: 'Short1!',
          confirmPassword: 'Short1!',
        })
        expect(res.success).toBe(false)
        expect(res.error).toContain('at least 8 characters')
      })

      it('rejects passwords without special symbols or numbers', async () => {
        const res = await changePasswordAction({
          currentPassword: 'CurrentPass1!',
          newPassword: 'NoSpecialSymbol123',
          confirmPassword: 'NoSpecialSymbol123',
        })
        expect(res.success).toBe(false)
        expect(res.error).toContain('special symbol')
      })

      it('rejects mismatched confirm password', async () => {
        const res = await changePasswordAction({
          currentPassword: 'CurrentPass1!',
          newPassword: 'ValidPassword123!',
          confirmPassword: 'DifferentPassword123!',
        })
        expect(res.success).toBe(false)
        expect(res.error).toContain('do not match')
      })

      it('validates current password against auth and rejects if incorrect', async () => {
        mockGetUser.mockResolvedValueOnce({
          data: { user: { id: 'user-alice-111', email: 'alice@safesteps.org' } },
          error: null,
        })
        mockSignInWithPassword.mockResolvedValueOnce({
          error: { message: 'Invalid login credentials' },
        })

        const res = await changePasswordAction({
          currentPassword: 'WrongPassword1!',
          newPassword: 'NewValidPassword123!',
          confirmPassword: 'NewValidPassword123!',
        })

        expect(res.success).toBe(false)
        expect(res.error).toContain('Current password is incorrect')
      })

      it('successfully updates password when current password is verified', async () => {
        mockGetUser.mockResolvedValueOnce({
          data: { user: { id: 'user-alice-111', email: 'alice@safesteps.org' } },
          error: null,
        })
        mockSignInWithPassword.mockResolvedValueOnce({ error: null })
        mockUpdateUser.mockResolvedValueOnce({ error: null })

        const res = await changePasswordAction({
          currentPassword: 'CorrectPassword1!',
          newPassword: 'BrandNewPassword123!',
          confirmPassword: 'BrandNewPassword123!',
        })

        expect(res.success).toBe(true)
        expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'BrandNewPassword123!' })
        expect(mockSignOut).toHaveBeenCalledWith({ scope: 'others' })
      })
    })

    describe('updatePersonalisationAction', () => {
      it('updates profiles.personalise flag successfully', async () => {
        mockGetUser.mockResolvedValueOnce({
          data: { user: { id: 'user-alice-111', email: 'alice@safesteps.org' } },
          error: null,
        })

        const res = await updatePersonalisationAction(false)
        expect(res.success).toBe(true)

        const aliceProfile = mockDb.profiles.find((p) => p.id === 'user-alice-111')
        expect(aliceProfile?.personalise).toBe(false)
      })
    })
  })
})
