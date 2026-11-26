import { describe, it, expect, vi, beforeEach } from 'vitest'
import { cleanTitle } from '@/lib/conversations'
import { renameConversationAction, deleteConversationAction } from '@/app/(app)/history/actions'

// Mock createClient
const mockGetUser = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()
const mockSingle = vi.fn()
const mockEq = vi.fn()
const mockSelect = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  })),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('Conversation Auto-titling & Clean Title', () => {
  it('takes first 6 words and capitalizes first letter', () => {
    const input = 'i have had a persistent migraine since this morning'
    const title = cleanTitle(input)
    expect(title).toBe('I have had a persistent migraine')
  })

  it('strips phone numbers and contact details', () => {
    const input = 'Call +91 9876543210 about severe fever and chills'
    const title = cleanTitle(input)
    expect(title).not.toContain('9876543210')
    expect(title).toBe('Call about severe fever and chills')
  })

  it('strips email addresses', () => {
    const input = 'Contact doctor@hospital.com regarding severe chest tightness'
    const title = cleanTitle(input)
    expect(title).not.toContain('doctor@hospital.com')
    expect(title).toBe('Contact regarding severe chest tightness')
  })

  it('strips HTML tags cleanly', () => {
    const input = '<script>alert("xss")</script> I have a bad stomach ache'
    const title = cleanTitle(input)
    expect(title).not.toContain('<script>')
    expect(title).toBe('I have a bad stomach ache')
  })

  it('truncates to at most 60 characters with ellipsis if needed', () => {
    const input = 'Supercalifragilisticexpialidocious pneumonoultramicroscopicsilicovolcanoconiosis symptoms in chest'
    const title = cleanTitle(input)
    expect(title.length).toBeLessThanOrEqual(60)
  })

  it('provides sensible fallback for empty or stripped inputs', () => {
    expect(cleanTitle('')).toBe('New health assessment')
    expect(cleanTitle('   ')).toBe('New health assessment')
    expect(cleanTitle(null)).toBe('New health assessment')
    expect(cleanTitle('<b></b>')).toBe('New health assessment')
  })
})

describe('Conversation Server Actions Security & Audit Logging', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renameConversationAction rejects signed-out requests', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: new Error('Not signed in') })

    const result = await renameConversationAction('conv-123', 'Updated Title')
    expect(result.success).toBe(false)
    expect(result.error).toContain('signed in')
  })

  it('renameConversationAction verifies ownership before renaming', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'user-abc', email: 'test@example.com' } },
      error: null,
    })

    // Mock ownership check failing (not found or different user)
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValueOnce({ data: null, error: new Error('Not found') }),
    })

    const result = await renameConversationAction('conv-999', 'Hacked Title')
    expect(result.success).toBe(false)
    expect(result.error).toContain('access denied')
  })

  it('renameConversationAction logs audit record without storing personal message content', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'user-abc', email: 'test@example.com' } },
      error: null,
    })

    // 1. Ownership check passes
    const selectMock = vi.fn().mockReturnThis()
    const eqMock1 = vi.fn().mockReturnThis()
    const eqMock2 = vi.fn().mockReturnThis()
    const singleMock = vi.fn().mockResolvedValueOnce({ data: { id: 'conv-123' }, error: null })

    // 2. Update passes
    const updateMock = vi.fn().mockReturnThis()
    const updateEqMock1 = vi.fn().mockReturnThis()
    const updateEqMock2 = vi.fn().mockResolvedValueOnce({ error: null })

    // 3. Audit log insert
    const insertMock = vi.fn().mockResolvedValueOnce({ error: null })

    mockFrom
      .mockReturnValueOnce({
        select: selectMock,
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: singleMock,
          }),
        }),
      })
      .mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: updateEqMock2,
          }),
        }),
      })
      .mockReturnValueOnce({
        insert: insertMock,
      })

    const result = await renameConversationAction('conv-123', 'New Clean Title')
    expect(result.success).toBe(true)
    expect(result.title).toBe('New Clean Title')

    // Verify audit log call (action and entity only - NO message content)
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-abc',
        action: 'conversation_renamed',
        entity: 'conversations',
      })
    )
    expect(insertMock).not.toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.anything(),
        message: expect.anything(),
      })
    )
  })

  it('deleteConversationAction verifies ownership and logs audit record on delete', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'user-abc', email: 'test@example.com' } },
      error: null,
    })

    const singleMock = vi.fn().mockResolvedValueOnce({ data: { id: 'conv-123' }, error: null })
    const deleteEqMock = vi.fn().mockResolvedValueOnce({ error: null })
    const insertMock = vi.fn().mockResolvedValueOnce({ error: null })

    mockFrom
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: singleMock,
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: deleteEqMock,
          }),
        }),
      })
      .mockReturnValueOnce({
        insert: insertMock,
      })

    const result = await deleteConversationAction('conv-123')
    expect(result.success).toBe(true)

    // Verify audit log contains NO personal message content
    expect(insertMock).toHaveBeenCalledWith({
      user_id: 'user-abc',
      action: 'conversation_deleted',
      entity: 'conversations',
    })
  })
})
