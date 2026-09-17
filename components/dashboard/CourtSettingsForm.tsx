'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Label, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { KARACHI_AREAS, COURT_FORMATS } from '@/lib/constants';
import { formatTime } from '@/lib/utils';
import type { Court, CourtFormat } from '@/types/database.types';

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, h) => {
  const value = `${String(h).padStart(2, '0')}:00`;
  return { value, label: formatTime(value) };
});

interface Props {
  ownerId: string;
  court: Court | null;
  onSaved?: (court: Court) => void;
}

export function CourtSettingsForm({ ownerId, court, onSaved }: Props) {
  const supabase = createClient();
  const router = useRouter();

  const [name, setName] = useState(court?.name ?? '');
  const [area, setArea] = useState(court?.area ?? KARACHI_AREAS[0]);
  const [address, setAddress] = useState(court?.address ?? '');
  const [pricePerHour, setPricePerHour] = useState(String(court?.price_per_hour ?? ''));
  const [format, setFormat] = useState<CourtFormat>(court?.format ?? '7v7');
  const [opensAt, setOpensAt] = useState(court?.opens_at?.slice(0, 5) ?? '16:00');
  const [closesAt, setClosesAt] = useState(court?.closes_at?.slice(0, 5) ?? '23:00');
  const [allowsHalfCourt, setAllowsHalfCourt] = useState(court?.allows_half_court ?? false);
  const [isActive, setIsActive] = useState(court?.is_active ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name || !area || !address || !pricePerHour) {
      setError('Please fill in all required fields.');
      return;
    }

    setSaving(true);

    const payload = {
      name,
      area,
      address,
      price_per_hour: Number(pricePerHour),
      format,
      opens_at: opensAt,
      closes_at: closesAt,
      allows_half_court: allowsHalfCourt,
      is_active: isActive,
    };

    if (court) {
      const { data, error } = await supabase.from('courts').update(payload).eq('id', court.id).select().single();
      setSaving(false);
      if (error) {
        setError(error.message);
        return;
      }
      // Top up the rolling window in case hours just changed — a pure
      // insert-missing-slots operation, safe to call on every save.
      await supabase.rpc('generate_upcoming_slots', { p_court_id: data.id });
      onSaved?.(data);
    } else {
      const { data, error } = await supabase
        .from('courts')
        .insert({ ...payload, owner_id: ownerId })
        .select()
        .single();
      setSaving(false);
      if (error) {
        setError(error.message);
        return;
      }
      await supabase.rpc('generate_upcoming_slots', { p_court_id: data.id });
      router.push(`/dashboard/court-settings?courtId=${data.id}`);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Court name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Champions Arena" />
        </div>
        <div>
          <Label htmlFor="area">Area</Label>
          <Select id="area" value={area} onChange={(e) => setArea(e.target.value)}>
            {KARACHI_AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, landmark" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="price">Price / hour (₨)</Label>
          <Input id="price" type="number" min={0} value={pricePerHour} onChange={(e) => setPricePerHour(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="format">Format</Label>
          <Select id="format" value={format} onChange={(e) => setFormat(e.target.value as CourtFormat)}>
            {COURT_FORMATS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="opensAt">Opens at</Label>
          <Select id="opensAt" value={opensAt} onChange={(e) => setOpensAt(e.target.value)}>
            {HOUR_OPTIONS.map((h) => (
              <option key={h.value} value={h.value}>
                {h.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="closesAt">Closes at</Label>
          <Select id="closesAt" value={closesAt} onChange={(e) => setClosesAt(e.target.value)}>
            {HOUR_OPTIONS.map((h) => (
              <option key={h.value} value={h.value}>
                {h.label}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <p className="-mt-2 text-xs text-faint">
        Pick a closing time earlier than or equal to opening time for an overnight session (e.g. 4:00 PM – 12:00 PM the next day).
      </p>

      <label className="flex items-center gap-2 text-sm text-fg">
        <input
          type="checkbox"
          checked={allowsHalfCourt}
          onChange={(e) => setAllowsHalfCourt(e.target.checked)}
          className="h-4 w-4 rounded border-border text-primary"
        />
        Players can book half the court (at half price)
      </label>

      <label className="flex items-center gap-2 text-sm text-fg">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 rounded border-border text-primary" />
        Listed publicly (active)
      </label>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" disabled={saving}>
        {saving ? 'Saving…' : court ? 'Save Changes' : 'Create Court'}
      </Button>
    </form>
  );
}
