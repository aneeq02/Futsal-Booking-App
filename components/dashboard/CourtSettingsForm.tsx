'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Label, Select, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { KARACHI_AREAS, SURFACE_TYPES } from '@/lib/constants';
import type { Court, SurfaceType } from '@/types/database.types';

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
  const [description, setDescription] = useState(court?.description ?? '');
  const [pricePerHour, setPricePerHour] = useState(String(court?.price_per_hour ?? ''));
  const [surfaceType, setSurfaceType] = useState<SurfaceType>(court?.surface_type ?? 'artificial_turf');
  const [capacity, setCapacity] = useState(String(court?.capacity ?? 10));
  const [tagline, setTagline] = useState(court?.tagline ?? '');
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
      description: description || null,
      price_per_hour: Number(pricePerHour),
      surface_type: surfaceType,
      capacity: Number(capacity),
      tagline: tagline || null,
      is_active: isActive,
    };

    if (court) {
      const { data, error } = await supabase.from('courts').update(payload).eq('id', court.id).select().single();
      setSaving(false);
      if (error) {
        setError(error.message);
        return;
      }
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

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Floodlit turf, parking available…" />
      </div>

      <div>
        <Label htmlFor="tagline">Player quote (shown on your card)</Label>
        <Input
          id="tagline"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          placeholder={'"Always well maintained. Go-to for our weekly game."'}
          maxLength={120}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="price">Price / hour (₨)</Label>
          <Input id="price" type="number" min={0} value={pricePerHour} onChange={(e) => setPricePerHour(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="surface">Surface</Label>
          <Select id="surface" value={surfaceType} onChange={(e) => setSurfaceType(e.target.value as SurfaceType)}>
            {SURFACE_TYPES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="capacity">Capacity</Label>
          <Input id="capacity" type="number" min={1} value={capacity} onChange={(e) => setCapacity(e.target.value)} />
        </div>
      </div>

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
