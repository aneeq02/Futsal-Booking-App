'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Input';
import { createClient } from '@/lib/supabase/client';

type Mode = 'password' | 'phone';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      if (error.message.toLowerCase().includes('email not confirmed')) {
        setError('Please confirm your email first — check the inbox for the address you signed up with.');
      } else if (error.message.toLowerCase().includes('invalid login credentials')) {
        setError('Incorrect email or password.');
      } else {
        setError(error.message);
      }
      return;
    }

    router.push('/');
    router.refresh();
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!phone) {
      setError('Please enter your phone number.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setOtpSent(true);
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!otp) {
      setError('Please enter the code we sent you.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' });
    setLoading(false);

    if (error) {
      setError('Invalid or expired code.');
      return;
    }

    router.push('/');
    router.refresh();
  }

  return (
    <Card className="w-full max-w-sm p-8">
      <h1 className="font-heading text-2xl font-bold text-fg">Welcome back</h1>
      <p className="mt-1 text-sm text-muted">Log in to book your next futsal slot.</p>

      <div className="mt-6 flex gap-1 rounded-xl border border-border bg-bg p-1">
        <button
          type="button"
          onClick={() => setMode('password')}
          className={`flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors ${
            mode === 'password' ? 'bg-primary text-primary-fg' : 'text-muted'
          }`}
        >
          Email
        </button>
        <button
          type="button"
          onClick={() => setMode('phone')}
          className={`flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors ${
            mode === 'phone' ? 'bg-primary text-primary-fg' : 'text-muted'
          }`}
        >
          Phone OTP
        </button>
      </div>

      {mode === 'password' ? (
        <form onSubmit={handlePasswordLogin} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Logging in…' : 'Log In'}
          </Button>
        </form>
      ) : !otpSent ? (
        <form onSubmit={handleSendOtp} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="phone">Phone number</Label>
            <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+923001234567" />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Sending code…' : 'Send Code'}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="otp">Verification code</Label>
            <Input id="otp" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit code" />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Verifying…' : 'Verify & Log In'}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-medium text-primary">
          Sign up
        </Link>
      </p>
    </Card>
  );
}
