import Link from 'next/link';
import { cn } from '@/lib/utils';

const sizes = {
  sm: { box: 'h-7 w-7', icon: 14, text: 'text-[17px]', radius: 'rounded-[7px]' },
  md: { box: 'h-[34px] w-[34px]', icon: 18, text: 'text-xl', radius: 'rounded-[8px]' },
};

export function Logo({ size = 'md', href = '/' }: { size?: keyof typeof sizes; href?: string }) {
  const s = sizes[size];

  return (
    <Link href={href} className="flex shrink-0 items-center gap-[9px]">
      <div className={cn('flex items-center justify-center bg-primary', s.box, s.radius)}>
        <svg width={s.icon} height={s.icon} viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="7" stroke="#051007" strokeWidth="1.8" />
          <path d="M10 3.5L10 16.5M3.5 10L16.5 10" stroke="#051007" strokeWidth="1.5" />
          <circle cx="10" cy="10" r="2.5" fill="#051007" />
        </svg>
      </div>
      <span className={cn('font-heading font-bold tracking-[-0.5px] text-fg', s.text)}>
        footy<span className="text-primary">.</span>
      </span>
    </Link>
  );
}
