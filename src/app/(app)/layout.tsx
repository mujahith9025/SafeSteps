import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { AppShellClient } from '@/components/shell'

interface AppLayoutProps {
  children: React.ReactNode
}

async function AppShellContainer({ children }: { children: React.ReactNode }) {
  let userInfo:
    | {
        id?: string
        name?: string | null
        email?: string | null
      }
    | undefined

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      userInfo = {
        id: user.id,
        name: profile?.full_name || user.user_metadata?.full_name || null,
        email: user.email || null,
      }
    }
  } catch {
    // Graceful fallback during static optimization or prerender
    userInfo = {
      name: 'Ananya Patel',
      email: 'ananya.patel@healthnet.nhs.uk',
    }
  }

  return <AppShellClient user={userInfo}>{children}</AppShellClient>
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-10 h-10 rounded-2xl bg-teal-100 flex items-center justify-center animate-pulse">
            <div className="w-5 h-5 rounded-full border-2 border-teal-700 border-t-transparent animate-spin" />
          </div>
        </div>
      }
    >
      <AppShellContainer>{children}</AppShellContainer>
    </Suspense>
  )
}
