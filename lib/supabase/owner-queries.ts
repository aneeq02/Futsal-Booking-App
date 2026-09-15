import { createClient } from '@/lib/supabase/server';
import type { Court, CourtPhoto } from '@/types/database.types';

export interface OwnerBookingRow {
  id: string;
  court_id: string;
  duration_hours: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  status: string;
  created_at: string;
  slot: { date: string; start_time: string } | null;
  court: { name: string } | null;
  player: { full_name: string; phone: string | null } | null;
}

export async function getOwnerCourts(
  ownerId: string
): Promise<(Court & { primaryPhoto: CourtPhoto | null })[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('courts')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });

  const courts = data ?? [];
  if (courts.length === 0) return [];

  const { data: photos } = await supabase
    .from('court_photos')
    .select('*')
    .in('court_id', courts.map((c) => c.id))
    .eq('is_primary', true);

  return courts.map((court) => ({
    ...court,
    primaryPhoto: photos?.find((p) => p.court_id === court.id) ?? null,
  }));
}

export async function getOwnerBookings(ownerId: string): Promise<OwnerBookingRow[]> {
  const supabase = createClient();
  const { data: courts } = await supabase.from('courts').select('id').eq('owner_id', ownerId);
  const courtIds = (courts ?? []).map((c) => c.id);
  if (courtIds.length === 0) return [];

  const { data } = await supabase
    .from('bookings')
    .select(
      'id, court_id, duration_hours, total_amount, payment_method, payment_status, status, created_at, slot:time_slots(date, start_time), court:courts(name), player:profiles(full_name, phone)'
    )
    .in('court_id', courtIds)
    .order('created_at', { ascending: false });

  return (data ?? []) as unknown as OwnerBookingRow[];
}

export async function getOwnerStats(ownerId: string) {
  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: courts } = await supabase.from('courts').select('id').eq('owner_id', ownerId);
  const courtIds = (courts ?? []).map((c) => c.id);

  if (courtIds.length === 0) {
    return { todayRevenue: 0, bookingsToday: 0, occupancyPct: 0, pendingRequests: 0 };
  }

  const { data: todaySlots } = await supabase
    .from('time_slots')
    .select('status')
    .eq('date', today)
    .in('court_id', courtIds);

  const totalSlots = todaySlots?.length ?? 0;
  const bookedSlots = todaySlots?.filter((s) => s.status === 'booked').length ?? 0;
  const occupancyPct = totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0;

  const { data: bookingsToday } = await supabase
    .from('bookings')
    .select('total_amount, status, payment_status, slot:time_slots!inner(date)')
    .in('court_id', courtIds)
    .eq('slot.date', today);

  const confirmedToday = (bookingsToday ?? []).filter((b) => b.status === 'confirmed');
  const todayRevenue = confirmedToday.reduce((sum, b) => sum + Number(b.total_amount), 0);
  const pendingRequests = (bookingsToday ?? []).filter((b) => b.payment_status === 'pending').length;

  return {
    todayRevenue,
    bookingsToday: confirmedToday.length,
    occupancyPct,
    pendingRequests,
  };
}

export interface TimelineSlot {
  id: string;
  startTime: string;
  status: 'live' | 'booked' | 'pending' | 'open';
  courtName: string;
  playerName: string | null;
  paymentMethod: string | null;
  price: number;
}

export async function getUpcomingToday(ownerId: string): Promise<TimelineSlot[]> {
  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();

  const { data: courts } = await supabase.from('courts').select('id, name, price_per_hour').eq('owner_id', ownerId);
  if (!courts || courts.length === 0) return [];
  const courtIds = courts.map((c) => c.id);

  const { data: slots } = await supabase
    .from('time_slots')
    .select('id, court_id, start_time, status')
    .in('court_id', courtIds)
    .eq('date', today)
    .neq('status', 'blocked')
    .order('start_time', { ascending: true });

  if (!slots || slots.length === 0) return [];

  const { data: bookings } = await supabase
    .from('bookings')
    .select('slot_id, payment_method, status, player:profiles(full_name)')
    .in('slot_id', slots.map((s) => s.id));

  return slots.map((slot) => {
    const court = courts.find((c) => c.id === slot.court_id)!;
    const booking = bookings?.find((b) => b.slot_id === slot.id);
    const [h, m] = slot.start_time.split(':').map(Number);
    const slotMinutes = h * 60 + m;
    const isNow = nowMinutes >= slotMinutes && nowMinutes < slotMinutes + 60;

    let status: TimelineSlot['status'] = 'open';
    if (booking?.status === 'pending') status = 'pending';
    else if (booking?.status === 'confirmed') status = isNow ? 'live' : 'booked';

    return {
      id: slot.id,
      startTime: slot.start_time,
      status,
      courtName: court.name,
      playerName: (booking?.player as unknown as { full_name: string } | null)?.full_name ?? null,
      paymentMethod: booking?.payment_method ?? null,
      price: court.price_per_hour,
    };
  });
}

export async function getWeeklyBookingCounts(
  ownerId: string
): Promise<{ label: string; value: number; previousValue: number }[]> {
  const supabase = createClient();

  const { data: courts } = await supabase.from('courts').select('id').eq('owner_id', ownerId);
  const courtIds = (courts ?? []).map((c) => c.id);
  if (courtIds.length === 0) return [];

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
  const previousDays = days.map((day) => {
    const d = new Date(`${day}T00:00:00`);
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  });

  const { data } = await supabase
    .from('bookings')
    .select('status, slot:time_slots!inner(date)')
    .in('court_id', courtIds)
    .eq('status', 'confirmed')
    .gte('slot.date', previousDays[0]);

  const countFor = (day: string) =>
    (data ?? []).filter((b) => (b.slot as unknown as { date: string })?.date === day).length;

  return days.map((day, i) => ({
    label: new Date(`${day}T00:00:00`).toLocaleDateString('en-PK', { weekday: 'short' }),
    value: countFor(day),
    previousValue: countFor(previousDays[i]),
  }));
}
