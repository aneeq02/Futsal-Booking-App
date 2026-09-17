import { createClient } from '@/lib/supabase/server';
import type { Court, CourtPhoto } from '@/types/database.types';

export type CourtWithPrimaryPhoto = Court & { primaryPhoto: CourtPhoto | null };

async function attachPrimaryPhotos(courts: Court[]): Promise<CourtWithPrimaryPhoto[]> {
  if (courts.length === 0) return [];

  const supabase = createClient();
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

export async function getFeaturedCourts(limit = 6): Promise<CourtWithPrimaryPhoto[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('courts')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  return attachPrimaryPhotos(data ?? []);
}

export async function getActiveCourts(): Promise<CourtWithPrimaryPhoto[]> {
  const supabase = createClient();
  const { data } = await supabase.from('courts').select('*').eq('is_active', true).order('name', { ascending: true });
  return attachPrimaryPhotos(data ?? []);
}

export async function getCourtById(
  id: string
): Promise<(CourtWithPrimaryPhoto & { photos: CourtPhoto[] }) | null> {
  const supabase = createClient();

  // Opportunistically top up this court's rolling 14-day slot window on
  // every visit (in parallel with the court fetch below) — idempotent via
  // ON CONFLICT DO NOTHING in generate_slots_for_court, so this keeps
  // players seeing "the next two weeks" fresh without an owner having to
  // manually regenerate, even if the pg_cron daily job isn't available.
  const [{ data: court }, { data: photos }] = await Promise.all([
    supabase.from('courts').select('*').eq('id', id).single(),
    supabase.from('court_photos').select('*').eq('court_id', id).order('is_primary', { ascending: false }),
    supabase.rpc('generate_upcoming_slots', { p_court_id: id }),
  ]);

  if (!court) return null;

  return { ...court, primaryPhoto: photos?.[0] ?? null, photos: photos ?? [] };
}

export async function getFillingUpFastCourts(limit = 3): Promise<
  (CourtWithPrimaryPhoto & { availableSlots: number; totalSlots: number })[]
> {
  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: courts } = await supabase.from('courts').select('*').eq('is_active', true);
  if (!courts || courts.length === 0) return [];

  const { data: slots } = await supabase
    .from('time_slots')
    .select('court_id, status')
    .eq('date', today)
    .in('court_id', courts.map((c) => c.id));

  const withCounts = courts.map((court) => {
    const courtSlots = slots?.filter((s) => s.court_id === court.id) ?? [];
    const totalSlots = courtSlots.length;
    const availableSlots = courtSlots.filter((s) => s.status === 'available').length;
    return { court, totalSlots, availableSlots };
  });

  const filling = withCounts
    .filter((c) => c.totalSlots > 0 && c.availableSlots > 0)
    .sort((a, b) => a.availableSlots / a.totalSlots - b.availableSlots / b.totalSlots)
    .slice(0, limit);

  const withPhotos = await attachPrimaryPhotos(filling.map((f) => f.court));

  return withPhotos.map((court) => {
    const match = filling.find((f) => f.court.id === court.id)!;
    return { ...court, availableSlots: match.availableSlots, totalSlots: match.totalSlots };
  });
}
