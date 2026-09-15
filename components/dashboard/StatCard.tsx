import type { LucideIcon } from 'lucide-react';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StatCard({
  label,
  value,
  suffix,
  icon: Icon,
  tone = 'primary',
  footer,
  progress,
}: {
  label: string;
  value: string;
  suffix?: string;
  icon: LucideIcon;
  tone?: 'primary' | 'gold';
  footer?: React.ReactNode;
  progress?: number;
}) {
  return (
    <div className="rounded-xl border border-border-card bg-surface p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wide text-muted">{label}</span>
        <div
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-[7px]',
            tone === 'primary' ? 'bg-primary/10' : 'bg-gold/10'
          )}
        >
          <Icon size={13} className={tone === 'primary' ? 'text-primary' : 'text-gold'} />
        </div>
      </div>

      <div className="mb-1 font-heading text-2xl font-extrabold text-fg">
        {value}
        {suffix && <span className="ml-1 text-[13px] font-normal text-muted">{suffix}</span>}
      </div>

      {progress !== undefined ? (
        <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-border-card">
          <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
      ) : (
        footer
      )}
    </div>
  );
}

export function StatDelta({ value }: { value: string }) {
  return (
    <div className="flex items-center gap-1 text-[11px] text-primary">
      <TrendingUp size={11} />
      {value}
    </div>
  );
}
