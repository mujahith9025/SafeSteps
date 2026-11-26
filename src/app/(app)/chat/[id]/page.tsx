import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ChatWindow } from '@/components/chat'
import { Message } from '@/types/chat'
import { getProfileSummaryPill } from '@/lib/profileContext'

interface ChatIdPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ChatIdPageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: conv } = await supabase
    .from('conversations')
    .select('title')
    .eq('id', id)
    .single()

  return {
    title: conv?.title ? `${conv.title} | SafeSteps` : 'Conversation | SafeSteps',
    description: 'SafeSteps persistent clinical assessment history.',
  }
}

export default async function SavedChatPage({ params }: ChatIdPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?returnUrl=/chat/${id}`)
  }

  // Verify ownership and load conversation
  const { data: conv, error: convError } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (convError || !conv) {
    notFound()
  }

  // Fetch health profile to check personalization preferences
  const { data: profile } = await supabase
    .from('profiles')
    .select('age, sex, height_cm, weight_kg, pregnant, allergies, conditions, medicines, personalise')
    .eq('id', user.id)
    .single()

  const initialPersonalise = Boolean(profile?.personalise)
  const profileSummary = getProfileSummaryPill(profile)

  // Load all messages for this conversation ordered chronologically
  const { data: dbMessages } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true })

  const initialMessages: Message[] = (dbMessages || []).map((m) => {
    const time = new Date(m.created_at).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })

    const structured = (m.structured || null) as Record<string, unknown> | null
    return {
      id: m.id,
      role: m.role as 'user' | 'assistant',
      content: m.content,
      timestamp: time,
      type: structured?.type as Message['type'],
      result: (structured?.result as Message['result']) || (structured && !structured.type ? structured as unknown as Message['result'] : undefined),
      quick_replies: Array.isArray(structured?.quick_replies) ? (structured.quick_replies as string[]) : undefined,
      sources: Array.isArray(structured?.sources) ? (structured.sources as Message['sources']) : undefined,
    }
  })

  return (
    <div className="flex-1 w-full flex flex-col h-full min-h-[calc(100dvh-160px)]">
      <Suspense
        fallback={
          <div className="flex-1 w-full min-h-[calc(100dvh-160px)] bg-slate-50 animate-pulse" />
        }
      >
        <ChatWindow
          initialMessages={initialMessages}
          initialConversationId={conv.id}
          initialTitle={conv.title}
          initialPersonalise={initialPersonalise}
          profileSummary={profileSummary}
        />
      </Suspense>
    </div>
  )
}
