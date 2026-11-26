import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { locales, defaultLocale, Locale, LOCALE_COOKIE_NAME } from './config';
import { createClient } from '@/lib/supabase/server';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;

  let activeLocale: Locale = defaultLocale;

  // 1. If signed in, check user profile preferred_language
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('preferred_language')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.preferred_language && locales.includes(profile.preferred_language as Locale)) {
        activeLocale = profile.preferred_language as Locale;
      } else if (cookieLocale && locales.includes(cookieLocale as Locale)) {
        activeLocale = cookieLocale as Locale;
      }
    } else if (cookieLocale && locales.includes(cookieLocale as Locale)) {
      activeLocale = cookieLocale as Locale;
    }
  } catch {
    if (cookieLocale && locales.includes(cookieLocale as Locale)) {
      activeLocale = cookieLocale as Locale;
    }
  }

  // Fallback to default if somehow invalid
  if (!locales.includes(activeLocale)) {
    activeLocale = defaultLocale;
  }

  const messages = (await import(`../../messages/${activeLocale}.json`)).default;

  return {
    locale: activeLocale,
    messages,
  };
});
