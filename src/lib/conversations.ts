import { cleanFreeText, containsContactDetails } from './validations/profile'

/**
 * Auto-titles a conversation from the first user message:
 * - Strips personal contact details (emails, phone numbers)
 * - Strips HTML tags
 * - Takes first 6 words
 * - Max 60 characters
 */
export function cleanTitle(input?: string | null): string {
  if (!input) return 'New health assessment'

  // 1. Strip script and style tags along with their contents, then strip all other HTML tags
  let text = (input || '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
  text = cleanFreeText(text)

  // 2. Remove email addresses
  text = text.replace(/[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g, '').trim()

  // 3. Remove phone numbers (7+ digits)
  text = text.replace(/(?:(?:\+|00)\d{1,3}[\s-]*)?(?:\(?\d{2,5}\)?[\s-]*)?\d{3,5}[\s-]*\d{3,5}/g, '').trim()

  // 4. Split into words and take up to 6 words
  const words = text.split(/\s+/).filter(Boolean)
  if (words.length === 0) return 'New health assessment'

  let title = words.slice(0, 6).join(' ')

  // 5. Trim to 60 characters without cutting words awkwardly
  if (title.length > 60) {
    title = title.substring(0, 57) + '...'
  }

  // 6. Capitalize first letter
  title = title.charAt(0).toUpperCase() + title.slice(1)

  return title || 'New health assessment'
}

export type UrgencyTier = 'self_care' | 'see_doctor_soon' | 'emergency'

export interface ConversationSummary {
  id: string
  userId: string
  title: string
  urgency: UrgencyTier | null
  language: string
  createdAt: string
  updatedAt: string
  preview?: string
  messageCount?: number
}

export interface ConversationMessage {
  id: string
  conversationId: string
  userId: string
  role: 'user' | 'assistant'
  content: string
  structured: any | null
  createdAt: string
}
