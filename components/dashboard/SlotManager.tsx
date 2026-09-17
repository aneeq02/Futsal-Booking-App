'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/client';
import { formatTime, cn } from '@/lib/utils';
import type { TimeSlot } from '@/types/database.types';

export function SlotManager({ courtId }: { courtId: string }) {
  const supabase = createClient();

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    setLoading(true);
    supabase
      .from('time_slots')
      .select('*')
      .eq('court_id', courtId)
      .eq('date', date)
      .order('start_time', { ascending: true })
      .then(({ data }) => {
        setSlots(data ?? []);
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, courtId]);

  async function handleGenerate() {
    setGenerating(true);
    // Delegates to the court's own opens_at/closes_at (set in Court
    // Details above) rather than a hardcoded window — see
    // generate_slots_for_court() in supabase/schema.sql.
    await supabase.rpc('generate_slots_for_court', { p_court_id: courtId, p_date: date });
    setGenerating(false);

    const { data: refreshed } = await supabase
      .from('time_slots')
      .select('*')
      .eq('court_id', courtId)
      .eq('date', date)
      .order('start_time', { ascending: true });
    setSlots(refreshed ?? []);
  }

  async function toggleBlocked(slot: TimeSlot) {
    if (slot.status === 'booked') return;
    const nextStatus = slot.status === 'available' ? 'blocked' : 'available';
    const { data } = await supabase.from('time_slots').update({ status: nextStatus }).eq('id', slot.id).select().single();
    if (data) setSlots((prev) => prev.map((s) => (s.id === slot.id ? data : s)));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-fg">Date</label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-auto" />
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={handleGenerate} disabled={generating}>
          {generating ? 'Generating…' : 'Generate Slots'}
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading slots…</p>
      ) : slots.length === 0 ? (
        <p className="text-sm text-muted">
          No slots for this date yet — this should fill in automatically, or use Generate Slots above to do it now.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {slots.map((slot) => (
            <button
              key={slot.id}
              type="button"
              onClick={() => toggleBlocked(slot)}
              disabled={slot.status === 'booked'}
              className={cn(
                'flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-xs font-medium transition-colors',
                slot.status === 'available' && 'border-border bg-surface text-fg hover:border-primary/50',
                slot.status === 'blocked' && 'border-border bg-bg text-muted',
                slot.status === 'booked' && 'cursor-not-allowed border-primary/30 bg-primary/10 text-primary'
              )}
            >
              {formatTime(slot.start_time)}
              <Badge tone={slot.status === 'available' ? 'green' : slot.status === 'blocked' ? 'neutral' : 'yellow'}>
                {slot.status}
              </Badge>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
