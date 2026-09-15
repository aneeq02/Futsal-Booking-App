import { ButtonLink } from '@/components/ui/Button';
import { PitchWatermark } from '@/components/landing/PitchWatermark';

export function OwnerCTA() {
  return (
    <section className="px-6 py-14 sm:px-10 lg:px-20">
      <div className="relative flex flex-col items-start gap-8 overflow-hidden rounded-[20px] border border-[#1A3020] bg-[#1A3020] px-8 py-11 dark:border-[#1A3A22] dark:bg-[#0B1E0F] sm:flex-row sm:items-center sm:justify-between sm:px-[60px] sm:py-[52px]">
        <PitchWatermark className="right-10 top-1/2 hidden h-60 w-80 -translate-y-1/2 text-white opacity-[0.04] lg:block" />

        <div className="relative">
          <div className="mb-3 font-heading text-[28px] font-bold leading-tight tracking-[-0.5px] text-[#F0FDF4] sm:text-[32px]">
            Running a court?
            <br />
            Join footy for free.
          </div>
          <p className="max-w-[420px] text-[15px] leading-relaxed text-[#F0FDF4]/55">
            List your courts, manage bookings in real time, and get paid faster. Thousands of players looking for
            their next game are already here.
          </p>
        </div>

        <div className="relative shrink-0">
          <ButtonLink href="/register" size="lg" className="!block whitespace-nowrap !px-9">
            List Your Court — Free
          </ButtonLink>
          <p className="mt-3 text-center text-xs text-[#F0FDF4]/35">No setup fees. Cancel anytime.</p>
        </div>
      </div>
    </section>
  );
}
