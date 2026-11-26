'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { locales, Locale, LOCALE_COOKIE_NAME, defaultLocale } from './config';
import { createClient } from '@/lib/supabase/server';

export async function setLocaleAction(newLocale: string): Promise<{ success: boolean; locale: Locale }> {
  const targetLocale: Locale = locales.includes(newLocale as Locale) ? (newLocale as Locale) : defaultLocale;

  // 1. Set the cookie for immediate persistence (works for guests & SSR)
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE_NAME, targetLocale, {
    path: '/',
    maxAge: 31536000, // 1 year
    sameSite: 'lax',
    httpOnly: false, // Accessible to client scripts if needed
  });

  // 2. If signed in, persist to user's profile
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase
        .from('profiles')
        .update({
          preferred_language: targetLocale,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
    }
  } catch (err) {
    console.error('Failed to update user profile language preference:', err);
  }

  // 3. Revalidate current layout to update SSR translations
  revalidatePath('/', 'layout');

  return { success: true, locale: targetLocale };
}
