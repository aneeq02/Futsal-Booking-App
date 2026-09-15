import { cn } from '@/lib/utils';

export function PitchWatermark({ className, stroke = 'currentColor' }: { className?: string; stroke?: string }) {
  return (
    <svg
      className={cn('pointer-events-none absolute', className)}
      viewBox="0 0 680 520"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
    >
      <rect x="10" y="10" width="660" height="500" stroke={stroke} strokeWidth="2.5" />
      <line x1="340" y1="10" x2="340" y2="510" stroke={stroke} strokeWidth="2" />
      <circle cx="340" cy="260" r="80" stroke={stroke} strokeWidth="2" />
      <circle cx="340" cy="260" r="4" fill={stroke} />
      <rect x="10" y="185" width="90" height="150" stroke={stroke} strokeWidth="2" />
      <rect x="580" y="185" width="90" height="150" stroke={stroke} strokeWidth="2" />
    </svg>
  );
}
