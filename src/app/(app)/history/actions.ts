'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { cleanTitle } from '@/lib/conversations'

export interface ConversationActionResult {
  success: boolean
  error?: string
  title?: string
}

/**
 * Server Action: Rename Conversation
 * Verifies ownership, sanitizes title, updates DB, and logs audit record (action only).
 */
export async function renameConversationAction(
  conversationId: string,
  newTitle: string
): Promise<ConversationActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'You must be signed in to rename conversations.' }
    }

    if (!conversationId || typeof conversationId !== 'string') {
      return { success: false, error: 'Invalid conversation ID.' }
    }

    const sanitizedTitle = cleanTitle(newTitle)
    if (!sanitizedTitle) {
      return { success: false, error: 'Please enter a valid title.' }
    }

    // Verify ownership
    const { data: conv, error: fetchError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !conv) {
      return { success: false, error: 'Conversation not found or access denied.' }
    }

    // Update title
    const { error: updateError } = await supabase
      .from('conversations')
      .update({
        title: sanitizedTitle,
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId)
      .eq('user_id', user.id)

    if (updateError) {
      return { success: false, error: updateError.message || 'Failed to rename conversation.' }
    }

    // Audit log (action and entity only - NEVER store message content)
    await supabase.from('audit_log').insert({
      user_id: user.id,
      action: 'conversation_renamed',
      entity: 'conversations',
    })

    revalidatePath('/history')
    revalidatePath(`/chat/${conversationId}`)
    return { success: true, title: sanitizedTitle }
  } catch {
    return { success: false, error: 'Please check your connection and try again.' }
  }
}

/**
 * Server Action: Delete Conversation
 * Verifies ownership, cascade deletes messages, and logs audit record (action only).
 */
export async function deleteConversationAction(
  conversationId: string
): Promise<ConversationActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'You must be signed in to delete conversations.' }
    }

    if (!conversationId || typeof conversationId !== 'string') {
      return { success: false, error: 'Invalid conversation ID.' }
    }

    // Verify ownership
    const { data: conv, error: fetchError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !conv) {
      return { success: false, error: 'Conversation not found or access denied.' }
    }

    // Delete conversation (Postgres foreign key cascade deletes associated messages)
    const { error: deleteError } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId)
      .eq('user_id', user.id)

    if (deleteError) {
      return { success: false, error: deleteError.message || 'Failed to delete conversation.' }
    }

    // Audit log (action and entity only - NEVER store message content)
    await supabase.from('audit_log').insert({
      user_id: user.id,
      action: 'conversation_deleted',
      entity: 'conversations',
    })

    revalidatePath('/history')
    return { success: true }
  } catch {
    return { success: false, error: 'Please check your connection and try again.' }
  }
}
