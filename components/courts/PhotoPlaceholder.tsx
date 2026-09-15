import { Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

const GRADIENTS = [
  'linear-gradient(160deg,#0A2218_0%,#030A06_100%)',
  'linear-gradient(160deg,#0F1B30_0%,#060B1A_100%)',
  'linear-gradient(160deg,#162208_0%,#0A1404_100%)',
  'linear-gradient(160deg,#201A0A_0%,#100A04_100%)',
];

export function PhotoPlaceholder({ className, seed = 0 }: { className?: string; seed?: number }) {
  const gradient = GRADIENTS[seed % GRADIENTS.length];

  return (
    <div className={cn('relative overflow-hidden', className)} style={{ background: gradient }}>
      <svg className="absolute inset-0 h-full w-full opacity-10" viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice" fill="none">
        <rect x="20" y="20" width="360" height="180" stroke="white" strokeWidth="1.2" />
        <line x1="200" y1="20" x2="200" y2="200" stroke="white" strokeWidth="1" />
        <circle cx="200" cy="110" r="45" stroke="white" strokeWidth="1" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <Camera className="text-white/30" size={26} strokeWidth={1.5} />
        <span className="text-[11px] text-white/30">Court photo</span>
      </div>
    </div>
  );
}
