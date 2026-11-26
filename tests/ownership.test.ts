import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renameConversationAction, deleteConversationAction } from '@/app/(app)/history/actions'
import { GET as getReportHandler, PATCH as patchReportHandler, DELETE as deleteReportHandler } from '@/app/api/reports/[id]/route'
import { GET as getReportPdfHandler } from '@/app/api/reports/[id]/pdf/route'
import { GET as exportHandler } from '@/app/api/user/export/route'
import { NextRequest } from 'next/server'

// Mock database store for ownership testing
interface MockDatabase {
  conversations: { id: string; user_id: string; title: string; updated_at?: string }[]
  messages: { id: string; user_id: string; conversation_id: string; content: string }[]
  reports: { id: string; user_id: string; title: string; summary?: any; created_at: string; source_type: string }[]
  report_values: { id: string; user_id: string; report_id: string; test_name: string; value_numeric: number; unit: string; status: string }[]
  profiles: { id: string; full_name: string; personalise: boolean }[]
  audit_log: { id: string; user_id: string; action: string; entity: string }[]
}

let mockDb: MockDatabase

// Active user session state
let currentSessionUser: { id: string; email: string } | null = null

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: currentSessionUser },
        error: currentSessionUser ? null : new Error('No active session'),
      })),
    },
    from: (table: keyof MockDatabase) => {
      let filtered = [...(mockDb[table] || [])]
      let lastUserIdFilter: string | null = null
      let isSingle = false

      const queryBuilder: any = {
        select: vi.fn((_cols?: string) => queryBuilder),
        order: vi.fn(() => queryBuilder),
        eq: vi.fn((col: string, val: any) => {
          if (col === 'user_id' || col === 'id') {
            lastUserIdFilter = String(val)
          }
          filtered = filtered.filter((row: any) => String(row[col]) === String(val))
          return queryBuilder
        }),
        single: vi.fn(async () => {
          isSingle = true
          if (filtered.length === 0) {
            return { data: null, error: { message: 'Row not found or access denied' } }
          }
          return { data: { ...filtered[0] }, error: null }
        }),
        maybeSingle: vi.fn(async () => {
          if (filtered.length === 0) {
            return { data: null, error: null }
          }
          return { data: { ...filtered[0] }, error: null }
        }),
        update: vi.fn((updates: any) => ({
          eq: vi.fn((col1: string, val1: any) => ({
            eq: vi.fn(async (col2: string, val2: any) => {
              // Simulates Supabase RLS row update matching both filters
              const target = mockDb[table].find(
                (row: any) => String(row[col1]) === String(val1) && String(row[col2]) === String(val2)
              )
              if (!target) {
                return { error: { message: 'Row not found or permission denied' } }
              }
              Object.assign(target, updates)
              return { error: null }
            }),
          })),
        })),
        delete: vi.fn(() => ({
          eq: vi.fn((col1: string, val1: any) => ({
            eq: vi.fn(async (col2: string, val2: any) => {
              const beforeCount = mockDb[table].length
              mockDb[table] = (mockDb[table] as any[]).filter(
                (row: any) => !(String(row[col1]) === String(val1) && String(row[col2]) === String(val2))
              )
              const deletedCount = beforeCount - mockDb[table].length
              if (deletedCount === 0) {
                return { error: { message: 'Row not found or permission denied' } }
              }
              return { error: null }
            }),
          })),
        })),
        insert: vi.fn(async (payload: any) => {
          const entry = { id: `entry-${Date.now()}-${Math.random()}`, ...payload }
          mockDb.audit_log.push(entry)
          return { error: null }
        }),
        then: (resolve: any) => resolve({ data: filtered, error: null }),
      }

      return queryBuilder
    },
  })),
}))

// Mock cache revalidation
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('SafeSteps Strict Data Ownership & Tenant Isolation (User A vs User B)', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Populate dual-tenant database: User Alice (A) and User Bob (B)
    mockDb = {
      conversations: [
        { id: 'conv-alice-1', user_id: 'user-alice-111', title: "Alice's Headache Consultation" },
        { id: 'conv-bob-2', user_id: 'user-bob-222', title: "Bob's Knee Sprain Consultation" },
      ],
      messages: [
        { id: 'msg-alice-1', user_id: 'user-alice-111', conversation_id: 'conv-alice-1', content: 'Alice symptoms' },
        { id: 'msg-bob-2', user_id: 'user-bob-222', conversation_id: 'conv-bob-2', content: 'Bob symptoms' },
      ],
      reports: [
        {
          id: 'report-alice-1',
          user_id: 'user-alice-111',
          title: "Alice's CBC Lab Report",
          created_at: '2026-11-20T10:00:00Z',
          source_type: 'file',
          summary: { totalCount: 1, normalCount: 1 },
        },
        {
          id: 'report-bob-2',
          user_id: 'user-bob-222',
          title: "Bob's Lipid Panel",
          created_at: '2026-11-21T10:00:00Z',
          source_type: 'paste',
          summary: { totalCount: 1, normalCount: 1 },
        },
      ],
      report_values: [
        {
          id: 'val-alice-1',
          user_id: 'user-alice-111',
          report_id: 'report-alice-1',
          test_name: 'Haemoglobin',
          value_numeric: 13.5,
          unit: 'g/dL',
          status: 'normal',
        },
        {
          id: 'val-bob-2',
          user_id: 'user-bob-222',
          report_id: 'report-bob-2',
          test_name: 'Total Cholesterol',
          value_numeric: 210,
          unit: 'mg/dL',
          status: 'high',
        },
      ],
      profiles: [
        { id: 'user-alice-111', full_name: 'Alice Smith', personalise: true },
        { id: 'user-bob-222', full_name: 'Bob Jones', personalise: false },
      ],
      audit_log: [],
    }

    // Default authenticated session is Alice (User A)
    currentSessionUser = { id: 'user-alice-111', email: 'alice@safesteps.org' }
  })

  // ---------------------------------------------------------------------------
  // 1. Conversation Ownership
  // ---------------------------------------------------------------------------
  describe('Conversation Ownership Checks', () => {
    it("allows Alice (User A) to rename her own conversation", async () => {
      const res = await renameConversationAction('conv-alice-1', 'Updated Alice Title')
      expect(res.success).toBe(true)
      const conv = mockDb.conversations.find((c) => c.id === 'conv-alice-1')
      expect(conv?.title).toBe('Updated Alice Title')
    })

    it("strictly blocks Alice (User A) from renaming Bob's (User B) conversation", async () => {
      const res = await renameConversationAction('conv-bob-2', 'Malicious Rename Attempt')
      expect(res.success).toBe(false)
      expect(res.error).toContain('Conversation not found or access denied')

      // Bob's conversation must remain unchanged
      const conv = mockDb.conversations.find((c) => c.id === 'conv-bob-2')
      expect(conv?.title).toBe("Bob's Knee Sprain Consultation")
    })

    it("strictly blocks Alice (User A) from deleting Bob's (User B) conversation", async () => {
      const res = await deleteConversationAction('conv-bob-2')
      expect(res.success).toBe(false)
      expect(res.error).toContain('Conversation not found or access denied')

      // Bob's conversation must still exist in mockDb
      const conv = mockDb.conversations.find((c) => c.id === 'conv-bob-2')
      expect(conv).toBeDefined()
    })

    it("allows Alice to delete her own conversation", async () => {
      const res = await deleteConversationAction('conv-alice-1')
      expect(res.success).toBe(true)
      const conv = mockDb.conversations.find((c) => c.id === 'conv-alice-1')
      expect(conv).toBeUndefined()
    })
  })

  // ---------------------------------------------------------------------------
  // 2. Report & Parameter Ownership
  // ---------------------------------------------------------------------------
  describe('Laboratory Report & Parameter Ownership Checks', () => {
    it("allows Alice (User A) to retrieve her own report via GET /api/reports/[id]", async () => {
      const req = new NextRequest('http://localhost:3000/api/reports/report-alice-1')
      const res = await getReportHandler(req, { params: Promise.resolve({ id: 'report-alice-1' }) })

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.report.title).toBe("Alice's CBC Lab Report")
      expect(data.values.length).toBe(1)
      expect(data.values[0].test_name).toBe('Haemoglobin')
    })

    it("returns 404 Not Found when Alice tries to read Bob's report", async () => {
      const req = new NextRequest('http://localhost:3000/api/reports/report-bob-2')
      const res = await getReportHandler(req, { params: Promise.resolve({ id: 'report-bob-2' }) })

      expect(res.status).toBe(404)
      const data = await res.json()
      expect(data.error).toContain('Report not found or access denied')
    })

    it("returns 404 Not Found when Alice tries to download PDF for Bob's report", async () => {
      const req = new NextRequest('http://localhost:3000/api/reports/report-bob-2/pdf')
      const res = await getReportPdfHandler(req, { params: Promise.resolve({ id: 'report-bob-2' }) })

      expect(res.status).toBe(404)
      const data = await res.json()
      expect(data.error).toContain('Report not found or access denied')
    })

    it("returns 404 Not Found when Alice tries to delete Bob's report", async () => {
      const req = new NextRequest('http://localhost:3000/api/reports/report-bob-2', { method: 'DELETE' })
      const res = await deleteReportHandler(req, { params: Promise.resolve({ id: 'report-bob-2' }) })

      expect(res.status).toBe(404)

      // Bob's report must remain untouched
      const bobReport = mockDb.reports.find((r) => r.id === 'report-bob-2')
      expect(bobReport).toBeDefined()
    })
  })

  // ---------------------------------------------------------------------------
  // 3. User Data Export Isolation
  // ---------------------------------------------------------------------------
  describe('Data Portability / Export Strict Isolation', () => {
    it("ensures User A export archive never contains User B data", async () => {
      const res = await exportHandler()
      expect(res.status).toBe(200)

      const exported = await res.json()
      expect(exported.user.id).toBe('user-alice-111')
      expect(exported.profile.full_name).toBe('Alice Smith')

      // Assert zero records belonging to Bob
      expect(exported.conversations.every((c: any) => c.user_id === 'user-alice-111')).toBe(true)
      expect(exported.messages.every((m: any) => m.user_id === 'user-alice-111')).toBe(true)
      expect(exported.reports.every((r: any) => r.user_id === 'user-alice-111')).toBe(true)
      expect(exported.report_values.every((v: any) => v.user_id === 'user-alice-111')).toBe(true)

      const serialized = JSON.stringify(exported)
      expect(serialized).not.toContain('user-bob-222')
      expect(serialized).not.toContain('Bob Jones')
      expect(serialized).not.toContain("Bob's Knee Sprain Consultation")
      expect(serialized).not.toContain("Bob's Lipid Panel")
    })
  })
})
