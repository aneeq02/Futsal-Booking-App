import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/landing/Hero';
import { FillingUpFast } from '@/components/courts/FillingUpFast';
import { FeaturedCourts } from '@/components/landing/FeaturedCourts';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { OwnerCTA } from '@/components/landing/OwnerCTA';
import { getFeaturedCourts, getFillingUpFastCourts } from '@/lib/supabase/queries';

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
