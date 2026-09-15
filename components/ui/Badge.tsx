import { cn } from '@/lib/utils';

type Tone = 'green' | 'yellow' | 'red' | 'neutral';

const toneClasses: Record<Tone, string> = {
  green: 'bg-primary/10 text-primary',
  yellow: 'bg-gold/10 text-gold',
  red: 'bg-red-500/10 text-red-500',
  neutral: 'bg-muted/10 text-muted',
};

export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[5px] px-[7px] py-0.5 font-heading text-[10px] font-bold capitalize',
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
