import Link from 'next/link';
import { HeroSearchBar } from '@/components/landing/HeroSearchBar';
import { PitchWatermark } from '@/components/landing/PitchWatermark';
import { KARACHI_AREAS } from '@/lib/constants';

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-[72px] pt-16 sm:px-10 sm:pt-20 lg:px-20">
      <PitchWatermark
        className="right-[-60px] top-1/2 hidden h-[520px] w-[680px] -translate-y-1/2 text-black opacity-[0.06] dark:text-white dark:opacity-[0.04] lg:block"
      />

      <div className="relative">
        <div className="mb-7 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="text-[13px] font-medium uppercase tracking-wide text-primary">
            Karachi&apos;s Futsal Network
          </span>
        </div>

        <div className="mb-6 max-w-[720px]">
          <h1 className="font-heading text-5xl font-bold leading-[1.0] tracking-[-1.5px] text-fg sm:text-[72px] sm:tracking-[-2.5px]">
            The pitch
            <br />
            <span className="text-primary">is yours.</span>
          </h1>
        </div>

        <p className="mb-11 max-w-[460px] text-lg italic leading-relaxed text-muted">
          No calls. No WhatsApp. Book any court across Karachi in under a minute.
        </p>

        <HeroSearchBar />

        <p className="text-[13px] text-faint">
          Browse by area:
          {KARACHI_AREAS.slice(0, 5).map((area, i) => (
            <span key={area}>
              {i > 0 && <span className="mx-1.5 text-border">·</span>}
              <Link href={`/courts?areas=${area}`} className="ml-1 text-muted no-underline hover:text-fg">
                {area}
              </Link>
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
