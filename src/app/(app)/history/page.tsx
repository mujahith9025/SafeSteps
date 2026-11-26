import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ConversationSummary } from '@/lib/conversations'
import { HistoryList, HistorySkeleton } from '@/components/history'

export const metadata: Metadata = {
  title: 'Your Conversations | SafeSteps',
  description:
    'Review past symptom assessments, download summaries for your doctor, or resume consultations.',
}

export default async function HistoryPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?returnUrl=/history')
  }

  // Fetch all conversations belonging to the signed-in user
  const { data: convData } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch recent messages to populate previews
  const { data: messagesData } = await supabase
    .from('messages')
    .select('conversation_id, content, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const previewMap = new Map<string, string>()
  for (const m of messagesData || []) {
    if (!previewMap.has(m.conversation_id)) {
      previewMap.set(m.conversation_id, m.content.substring(0, 160))
    }
  }

  const initialConversations: ConversationSummary[] = (convData || []).map((c) => ({
    id: c.id,
    userId: c.user_id,
    title: c.title,
    urgency: c.urgency as ConversationSummary['urgency'],
    language: c.language,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
    preview: previewMap.get(c.id) || 'Assessment started.',
  }))

  return (
    <div className="flex-1 w-full bg-surface min-h-[calc(100dvh-120px)]">
      <Suspense fallback={<HistorySkeleton />}>
        <HistoryList initialConversations={initialConversations} />
      </Suspense>
    </div>
  )
}
