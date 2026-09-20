type ClassValue = string | number | null | undefined | false | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  for (const input of inputs) {
    if (!input) continue;
    if (Array.isArray(input)) {
      const nested = cn(...input);
      if (nested) out.push(nested);
    } else {
      out.push(String(input));
    }
  }
  return out.join(' ');
}

export function formatPKR(amount: number): string {
  return `₨${Math.round(amount).toLocaleString('en-PK')}`;
}

export function formatTime(time: string): string {
  const [hourStr, minuteStr] = time.split(':');
  const hour = parseInt(hourStr, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minuteStr} ${period}`;
}

export function formatDateLabel(date: string): string {
  const d = new Date(`${date}T00:00:00`);
  return d.toLocaleDateString('en-PK', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function getCourtPhotoUrl(storagePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/court-photos/${storagePath}`;
}

export function addHours(time: string, hours: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + hours * 60;
  const newH = Math.floor(total / 60) % 24;
  const newM = total % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

// This app has one market (Karachi) and no per-user timezone concept, so
// "today"/"now" must always mean Pakistan time — never the browser's or
// the server's own ambient timezone. `new Date().toISOString()` converts
// to UTC first, which silently rolls back to "yesterday" for part of
// every day in UTC+5 (e.g. any time before ~5 AM PKT); a server hosted in
// UTC (the default on most platforms) would be affected around the clock,
// not just near midnight. Every "what day/time is it" computation in this
// codebase should go through these helpers instead of raw `Date` methods.

export function todayISO(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' });
}

// True once a slot's start time is now or in the past (Karachi time) — a
// 4:00 PM slot stops being bookable/visible at 4:00 PM, not just once its
// hour is fully over.
export function isPastKarachi(date: string, startTime: string): boolean {
  const today = todayISO();
  if (date < today) return true;
  if (date > today) return false;
  const [h, m] = startTime.split(':').map(Number);
  return h * 60 + m <= karachiNowMinutes();
}

export function karachiNowMinutes(): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Karachi',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date());
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
  return hour * 60 + minute;
}

export function addDays(date: string, days: number): string {
  // Pure UTC arithmetic on the Y/M/D components — never interprets the
  // string as a local-time instant, so there's no ambient-timezone
  // round-trip for setDate()/toISOString() to get wrong.
  const [y, m, d] = date.split('-').map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d));
  utc.setUTCDate(utc.getUTCDate() + days);
  return utc.toISOString().slice(0, 10);
}
