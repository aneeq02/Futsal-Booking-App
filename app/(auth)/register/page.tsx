'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import type { UserRole } from '@/types/database.types';

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [role, setRole] = useState<UserRole>('player');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!fullName || !email || !phone || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone, role },
      },
    });
    setLoading(false);

    if (error) {
      if (error.message.toLowerCase().includes('already registered')) {
        setError('An account with this email already exists. Please log in instead.');
      } else {
        setError(error.message);
      }
      return;
    }

    if (data.session) {
      // Email confirmation is off for this project — the user is already logged in.
      router.push('/');
      router.refresh();
      return;
    }

    // Email confirmation is required — signing in now would just fail, so
    // tell the user to check their inbox instead of bouncing to /login.
    setConfirmationSent(true);
  }

  if (confirmationSent) {
    return (
      <Card className="w-full max-w-sm p-8 text-center">
        <h1 className="font-heading text-2xl font-bold text-fg">Check your email</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          We sent a confirmation link to <span className="font-medium text-fg">{email}</span>. Click it to activate
          your account, then come back and log in.
        </p>
        <Link href="/login" className="mt-6 inline-block text-sm font-medium text-primary">
          Back to login
        </Link>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm p-8">
      <h1 className="font-heading text-2xl font-bold text-fg">Create your account</h1>
      <p className="mt-1 text-sm text-muted">Join Karachi&apos;s futsal community.</p>

      <div className="mt-6 flex gap-1 rounded-xl border border-border bg-bg p-1">
        <button
          type="button"
          onClick={() => setRole('player')}
          className={cn(
            'flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors',
            role === 'player' ? 'bg-primary text-primary-fg' : 'text-muted'
          )}
        >
          I&apos;m a Player
        </button>
        <button
          type="button"
          onClick={() => setRole('owner')}
          className={cn(
            'flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors',
            role === 'owner' ? 'bg-primary text-primary-fg' : 'text-muted'
          )}
        >
          I&apos;m a Court Owner
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ali Khan" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div>
          <Label htmlFor="phone">Phone number</Label>
          <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+923001234567" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating account…' : 'Sign Up'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary">
          Log in
        </Link>
      </p>
    </Card>
  );
}
