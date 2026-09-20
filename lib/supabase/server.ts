import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database.types';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll called from a Server Component — ignored because
            // middleware refreshes the session on every request instead.
          }
        },
      },
      global: {
        // Next.js caches server-side fetch() calls by default (force-cache),
        // independent of whether the page itself is dynamically rendered —
        // without this, Supabase reads from Server Components can silently
        // serve stale data (e.g. a court's opens_at/closes_at reflecting an
        // earlier request instead of the current row).
        fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
      },
    }
  );
}
