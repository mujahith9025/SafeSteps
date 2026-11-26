import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ResultsView } from '@/components/reports/ResultsView'

interface ReportPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ReportPageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()

  const { data: report } = await supabase
    .from('reports')
    .select('title')
    .eq('id', id)
    .single()

  return {
    title: report ? `${report.title} | SafeSteps` : 'Report Explanation | SafeSteps',
    description: 'Plain-language clinical lab report explanation and reference intervals.',
  }
}

export default async function ReportResultPage({ params }: ReportPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch report
  const { data: report, error: reportError } = await supabase
    .from('reports')
    .select('id, user_id, title, source_type, raw_text_deleted_at, summary, created_at')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (reportError || !report) {
    notFound()
  }

  // Fetch report values
  const { data: values, error: valuesError } = await supabase
    .from('report_values')
    .select('*')
    .eq('report_id', id)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (valuesError) {
    throw new Error('Failed to load report parameters.')
  }

  return (
    <div className="w-full pt-4 sm:pt-6">
      <ResultsView
        report={{
          id: report.id,
          title: report.title,
          source_type: report.source_type,
          summary: report.summary as any,
          created_at: report.created_at,
        }}
        initialValues={(values || []) as any}
      />
    </div>
  )
}
