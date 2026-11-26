import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If Supabase environment variables are missing, pass through
  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  // Revalidate auth token on every request
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Protected paths requiring active user authentication
  // Note: /chat-guest is explicitly excluded and remains 100% public
  const isProtectedPath =
    (pathname.startsWith('/chat') && pathname !== '/chat-guest') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/history') ||
    pathname.startsWith('/reports') ||
    pathname.startsWith('/summary') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/consent')

  // If user is not authenticated and attempts to access protected route, redirect to /login
  if (!user && isProtectedPath) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('returnUrl', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If authenticated user attempts to access protected routes without consent, redirect to /consent
  if (user && isProtectedPath && pathname !== '/consent') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('consent_version')
      .eq('id', user.id)
      .single()

    if (!profile?.consent_version) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/consent'
      return NextResponse.redirect(redirectUrl)
    }
  }

  // If authenticated user visits /consent but has already accepted, forward to /chat
  if (user && pathname === '/consent') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('consent_version')
      .eq('id', user.id)
      .single()

    if (profile?.consent_version) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/chat'
      return NextResponse.redirect(redirectUrl)
    }
  }

  // If already authenticated and visiting auth entry pages, forward to /chat
  if (user && (pathname === '/login' || pathname === '/signup')) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/chat'
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static assets)
     * - _next/image (image optimization files)
     * - favicon.ico, robot.txt
     * - Static asset extensions (.svg, .png, .jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
