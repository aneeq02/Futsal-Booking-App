'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, Smartphone, Wallet, Star, ArrowRight } from 'lucide-react';
import { DateStrip } from '@/components/courts/DateStrip';
import { SlotGrid } from '@/components/courts/SlotGrid';
import { PhotoPlaceholder } from '@/components/courts/PhotoPlaceholder';
import { Input } from '@/components/ui/Input';
import { createClient } from '@/lib/supabase/client';
import { sendBookingConfirmationSms } from '@/lib/notifications';
import { cn, formatDateLabel, formatPKR, formatTime, getCourtPhotoUrl } from '@/lib/utils';
import type { Court, CourtPhoto, CourtPortion, Profile, TimeSlot } from '@/types/database.types';

const PAYMENT_METHODS = [
  { id: 'jazzcash', label: 'JazzCash', icon: Smartphone, tag: 'Jazz', tagClass: 'bg-[#E91E8C] text-white' },
  { id: 'easypaisa', label: 'Easypaisa', icon: Smartphone, tag: null, tagClass: '' },
  { id: 'cash', label: 'Pay at Venue', icon: Wallet, tag: null, tagClass: '' },
] as const;

export function BookingFlow({
  court,
  primaryPhoto,
  profile,
}: {
  court: Court;
  primaryPhoto: CourtPhoto | null;
  profile: Profile;
}) {
  const supabase = createClient();

  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
  const [portion, setPortion] = useState<CourtPortion>('full');
  const [paymentMethod, setPaymentMethod] = useState<(typeof PAYMENT_METHODS)[number]['id']>('jazzcash');
  const [promoCode, setPromoCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedSlots, setConfirmedSlots] = useState<TimeSlot[] | null>(null);

  useEffect(() => {
    setSelectedSlots([]);
    setLoadingSlots(true);

    supabase
      .from('time_slots')
      .select('*')
      .eq('court_id', court.id)
      .eq('date', selectedDate)
      .eq('status', 'available')
      .order('start_time', { ascending: true })
      .then(({ data }) => {
        setSlots(data ?? []);
        setLoadingSlots(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, court.id]);

  const duration = selectedSlots.length;
  const firstSlot = selectedSlots[0] ?? null;
  const lastSlot = selectedSlots[selectedSlots.length - 1] ?? null;
  const rate = court.price_per_hour * (portion === 'half' ? 0.5 : 1);
  const total = rate * duration;
  const photoUrl = primaryPhoto ? getCourtPhotoUrl(primaryPhoto.storage_path) : null;

  function toggleSlot(slot: TimeSlot) {
    setSelectedSlots((prev) => {
      if (prev.length === 0) return [slot];

      const first = prev[0];
      const last = prev[prev.length - 1];

      // Extend the selection when the clicked slot is immediately
      // before/after the current contiguous run.
      if (last.end_time === slot.start_time) return [...prev, slot];
      if (slot.end_time === first.start_time) return [slot, ...prev];

      // Clicking an already-selected slot shrinks the run back to that
      // point instead of leaving a gap in the middle.
      if (slot.id === last.id) return prev.slice(0, -1);
      if (slot.id === first.id) return prev.slice(1);
      const idx = prev.findIndex((s) => s.id === slot.id);
      if (idx !== -1) return prev.slice(0, idx + 1);

      // Non-contiguous, unselected slot: start a fresh selection there.
      return [slot];
    });
  }

  async function handleConfirm() {
    if (!firstSlot) return;
    setSubmitting(true);
    setError(null);

    const { data, error: rpcError } = await supabase.rpc('create_booking', {
      p_slot_id: firstSlot.id,
      p_duration_hours: duration,
      p_payment_method: paymentMethod,
      p_court_portion: portion,
    });

    setSubmitting(false);

    if (rpcError) {
      setError(
        rpcError.message.includes('consecutive')
          ? 'One of the selected slots was just taken — please re-select your slots.'
          : 'This slot was just booked by someone else. Please pick another.'
      );
      return;
    }

    await sendBookingConfirmationSms(
      profile.phone,
      `Your court "${court.name}" is booked for ${formatDateLabel(selectedDate)} at ${formatTime(firstSlot.start_time)}.`
    );

    setConfirmedSlots(selectedSlots);
    void data;
  }

  if (confirmedSlots && confirmedSlots.length > 0) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <CheckCircle2 size={48} className="mx-auto text-primary" />
        <h1 className="mt-4 font-heading text-2xl font-bold text-fg">Slot Locked In!</h1>
        <p className="mt-2 text-sm text-muted">
          {court.name} — {formatDateLabel(selectedDate)} at {formatTime(confirmedSlots[0].start_time)} for{' '}
          {confirmedSlots.length}h.
        </p>
        <p className="mt-1 text-sm text-muted">Total: {formatPKR(total)}</p>
        <Link href="/courts" className="mt-6 inline-block text-sm font-medium text-primary">
          Browse more courts
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <div className="flex-1 overflow-y-auto bg-bg px-6 py-6 sm:px-10 lg:px-14">
        {/* Mini court card */}
        <div className="mb-6 flex items-center gap-4 rounded-xl border border-border-card bg-surface p-4 shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-none">
          <div className="relative h-[52px] w-[52px] shrink-0 overflow-hidden rounded-lg">
            {photoUrl ? (
              <Image src={photoUrl} alt="" fill sizes="52px" className="object-cover" />
            ) : (
              <PhotoPlaceholder className="h-full w-full" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-heading text-[15px] font-bold text-fg">{court.name}</div>
            <div className="truncate text-xs text-muted">{court.area}</div>
          </div>
          {court.rating !== null && (
            <div className="flex shrink-0 items-center gap-[3px]">
              <Star size={12} className="fill-gold text-gold" />
              <span className="font-heading text-[13px] font-semibold text-fg">{court.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <section className="mb-6">
          <h2 className="mb-3 font-heading text-xs font-bold uppercase tracking-wide text-muted">Select Date</h2>
          <DateStrip selectedDate={selectedDate} onSelect={setSelectedDate} days={14} />
        </section>

        <section className="mb-6">
          <h2 className="mb-3 font-heading text-xs font-bold uppercase tracking-wide text-muted">
            Available Slots — {formatDateLabel(selectedDate)}
          </h2>
          <p className="mb-3 text-xs text-faint">Tap a slot to select it, then tap consecutive slots to book multiple hours.</p>
          {loadingSlots ? (
            <p className="py-8 text-center text-sm text-muted">Loading slots…</p>
          ) : (
            <SlotGrid
              slots={slots}
              selectedSlots={selectedSlots}
              onToggle={toggleSlot}
              pricePerHour={court.price_per_hour}
            />
          )}
        </section>

        {court.allows_half_court && (
          <section className="mt-6">
            <h2 className="mb-2.5 font-heading text-xs font-bold uppercase tracking-wide text-muted">Court</h2>
            <div className="flex gap-2">
              {(['full', 'half'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPortion(p)}
                  className={cn(
                    'rounded-[9px] border px-6 py-2.5 font-heading text-[13px] font-semibold capitalize transition-colors',
                    portion === p ? 'border-primary bg-primary text-primary-fg' : 'border-border text-muted hover:border-primary/40'
                  )}
                >
                  {p} Court
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Summary panel */}
      <div className="flex w-full shrink-0 flex-col border-t border-border-card bg-surface-2 p-6 lg:w-[340px] lg:border-l lg:border-t-0">
        <h2 className="mb-5 font-heading text-base font-bold text-fg">Your booking</h2>

        {firstSlot && lastSlot ? (
          <div className="mb-[18px] rounded-[10px] border border-primary/20 bg-primary/[0.06] p-3.5">
            <div className="mb-0.5 flex items-center gap-[7px]">
              <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-primary shadow-[0_0_6px_#22C55E]" />
              <span className="font-heading text-sm font-bold text-primary">
                {formatTime(firstSlot.start_time)} — {formatTime(lastSlot.end_time)}
              </span>
            </div>
            <div className="pl-[14px] text-xs text-muted">{formatDateLabel(selectedDate)}</div>
          </div>
        ) : (
          <div className="mb-[18px] rounded-[10px] border border-border-card bg-surface p-3.5 text-xs text-faint">
            Pick one or more consecutive slots to continue
          </div>
        )}

        <div className="mb-[18px] flex flex-col gap-3">
          <Row label="Court" value={court.name} />
          {court.allows_half_court && <Row label="Booking" value={portion === 'half' ? 'Half Court' : 'Full Court'} />}
          {duration > 0 && <Row label="Duration" value={`${duration} Hour${duration > 1 ? 's' : ''}`} />}
          <Row label="Rate" value={`${formatPKR(rate)}/hr`} />
        </div>

        <div className="mb-[18px] h-px bg-border-card" />

        <div className="mb-[18px] flex gap-[7px]">
          <Input
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="Promo code"
            className="!rounded-[9px] !border-border !bg-surface !py-2.5"
          />
          <button
            type="button"
            className="shrink-0 whitespace-nowrap rounded-[9px] border border-primary/30 px-3.5 font-heading text-xs font-semibold text-primary"
          >
            Apply
          </button>
        </div>

        <div className="mb-3 flex flex-col gap-2.5">
          <Row label="Court hire" value={formatPKR(total)} />
          <div className="flex justify-between">
            <span className="text-[13px] text-muted">Service fee</span>
            <span className="text-[13px] font-medium text-primary">Free</span>
          </div>
        </div>

        <div className="mb-3.5 h-px bg-border-card" />

        <div className="mb-5 flex items-center justify-between">
          <span className="font-heading text-sm font-bold text-fg">Total</span>
          <span className="font-heading text-[22px] font-extrabold text-primary">{formatPKR(total)}</span>
        </div>

        <div className="mb-[18px]">
          <div className="mb-2.5 text-[11px] font-bold uppercase tracking-wide text-muted">Pay with</div>
          <div className="flex flex-col gap-[7px]">
            {PAYMENT_METHODS.map(({ id, label, icon: Icon, tag, tagClass }) => (
              <button
                key={id}
                type="button"
                onClick={() => setPaymentMethod(id)}
                className={cn(
                  'flex items-center gap-2.5 rounded-[9px] border px-3.5 py-3 text-left transition-colors',
                  paymentMethod === id ? 'border-[1.5px] border-primary/30 bg-primary/[0.06]' : 'border-border-card bg-surface'
                )}
              >
                <span
                  className={cn(
                    'flex h-4 w-4 shrink-0 items-center justify-center rounded-full',
                    paymentMethod === id ? 'bg-primary' : 'border-[1.5px] border-border'
                  )}
                >
                  {paymentMethod === id && <span className="h-[5px] w-[5px] rounded-full bg-primary-fg" />}
                </span>
                <Icon size={14} className="text-faint" />
                <span className="text-[13px] font-medium text-fg">{label}</span>
                {tag && (
                  <span className={cn('ml-auto rounded px-2 py-0.5 font-heading text-[10px] font-bold', tagClass)}>
                    {tag}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

        <button
          type="button"
          disabled={!firstSlot || submitting}
          onClick={handleConfirm}
          className="flex w-full items-center justify-center gap-[7px] rounded-[11px] bg-primary py-[15px] font-heading text-[15px] font-bold text-primary-fg disabled:opacity-50"
        >
          {submitting ? 'Locking in…' : 'Lock In My Slot'}
          {!submitting && <ArrowRight size={16} />}
        </button>
        <p className="mt-2.5 text-center text-[11px] leading-relaxed text-faint">
          Free cancellation up to 2 hrs before. SMS confirmation sent.
        </p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px] text-muted">{label}</span>
      <span className="max-w-[160px] text-right text-[13px] font-medium text-fg">{value}</span>
    </div>
  );
}
