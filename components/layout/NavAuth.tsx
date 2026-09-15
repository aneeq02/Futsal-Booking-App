'use client';

import { useRouter } from 'next/navigation';
import { ButtonLink } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types/database.types';

export function NavAuth({ profile }: { profile: Profile | null }) {
  const router = useRouter();

  if (!profile) {
    return (
      <div className="flex items-center gap-2.5">
        <ButtonLink href="/login" variant="outline" size="sm">
          Sign in
        </ButtonLink>
        <ButtonLink href="/register" size="sm">
          Get Started
        </ButtonLink>
      </div>
    );
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-sm font-medium text-fg sm:inline">{profile.full_name}</span>
      <button
        type="button"
        onClick={handleLogout}
        className="text-sm font-medium text-muted hover:text-fg"
      >
        Logout
      </button>
    </div>
  );
}
