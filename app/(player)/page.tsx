import dynamic from 'next/dynamic';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { OwnerCTA } from '@/components/landing/OwnerCTA';
import { Skeleton } from '@/components/ui/Skeleton';
import { getFeaturedCourts, getFillingUpFastCourts } from '@/lib/supabase/queries';

const FillingUpFast = dynamic(() => import('@/components/courts/FillingUpFast').then((m) => m.FillingUpFast), {
  loading: () => (
    <div className="grid gap-4 px-6 py-14 sm:grid-cols-3 sm:px-10 lg:px-20">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-[84px] rounded-2xl" />
      ))}
    </div>
  ),
});

const FeaturedCourts = dynamic(() => import('@/components/landing/FeaturedCourts').then((m) => m.FeaturedCourts), {
  loading: () => (
    <div className="grid gap-5 px-6 py-14 sm:grid-cols-2 sm:px-10 lg:grid-cols-3 lg:px-20">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-[340px] rounded-2xl" />
      ))}
    </div>
  ),
});

export default async function LandingPage() {
  const [featuredCourts, fillingUpFast] = await Promise.all([
    getFeaturedCourts(6),
    getFillingUpFastCourts(3),
  ]);

  return (
    <>
      <Navbar />
      <Hero />
      <FillingUpFast courts={fillingUpFast} />
      <FeaturedCourts courts={featuredCourts} />
      <HowItWorks />
      <OwnerCTA />
      <Footer />
    </>
  );
}
