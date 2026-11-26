import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { buildVisitSummary } from '@/lib/summary'
import { VisitSummaryView } from '@/components/summary/VisitSummaryView'

interface VisitSummaryPageProps {
  params: Promise<{ conversationId: string }>
}

export async function generateMetadata({
  params,
}: VisitSummaryPageProps): Promise<Metadata> {
  const { conversationId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      title: 'Doctor Visit Summary | SafeSteps',
      description: 'Structured clinical consultation intake summary and doctor questions.',
    }
  }

  const { data: conv } = await supabase
    .from('conversations')
    .select('title')
    .eq('id', conversationId)
    .eq('user_id', user.id)
    .single()

  return {
    title: conv ? `Doctor Visit Summary - ${conv.title} | SafeSteps` : 'Doctor Visit Summary | SafeSteps',
    description: 'Structured clinical consultation intake summary and doctor questions.',
  }
}

export default async function VisitSummaryPage({ params }: VisitSummaryPageProps) {
  const { conversationId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  let result: Awaited<ReturnType<typeof buildVisitSummary>>
  try {
    result = await buildVisitSummary(conversationId)
  } catch {
    notFound()
  }

  const { summary, conversation, patientDetails } = result

  return (
    <div className="w-full pt-4 sm:pt-6">
      <VisitSummaryView
        summary={summary}
        conversation={conversation}
        patientDetails={patientDetails}
      />
    </div>
  )
}
