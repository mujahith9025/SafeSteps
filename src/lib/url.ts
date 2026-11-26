/**
 * SafeSteps URL & Redirection Security Utilities
 */

export const ALLOWED_REDIRECT_PATHS = [
  '/chat',
  '/consent',
  '/profile',
  '/history',
  '/reports',
  '/settings',
  '/summary',
]

/**
 * Validates a return target URL to protect against Open Redirect vulnerabilities.
 * Strictly verifies relative URLs, prevents protocol-relative bypasses, rejects backslashes
 * and encoded delimiters, and guarantees the destination begins with an allowed root path.
 */
export function sanitizeRedirectUrl(target?: string | null): string {
  if (!target || typeof target !== 'string') return '/chat'

  const trimmed = target.trim()
  if (!trimmed) return '/chat'

  // Reject any backslashes, control characters, or protocol-relative prefixes
  if (
    trimmed.startsWith('//') ||
    trimmed.includes('\\') ||
    /[\x00-\x1F\x7F]/.test(trimmed)
  ) {
    return '/chat'
  }

  // Must begin with a single slash
  if (!trimmed.startsWith('/')) {
    return '/chat'
  }

  try {
    // Parse using a fixed dummy base to isolate host and pathname
    const parsed = new URL(trimmed, 'http://localhost')

    // Origin must remain strictly localhost (blocks scheme injection)
    if (parsed.origin !== 'http://localhost') {
      return '/chat'
    }

    // Check root pathname segment against whitelist
    const rootSegment = '/' + parsed.pathname.split('/')[1]
    if (!ALLOWED_REDIRECT_PATHS.includes(rootSegment)) {
      return '/chat'
    }

    // Return the safe relative path with any query params
    return parsed.pathname + parsed.search
  } catch {
    return '/chat'
  }
}
