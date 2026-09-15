import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = ['Choose Court', 'Pick Your Slot', 'Confirm & Pay'];

export function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex h-14 items-center border-b border-border/40 bg-surface px-6 dark:bg-bg sm:px-10 lg:px-14">
      <div className="flex items-center">
        {steps.map((label, i) => {
          const step = i + 1;
          const done = step < current;
          const active = step === current;

          return (
            <div key={label} className="flex items-center">
              {i > 0 && <div className={cn('mx-3 h-px w-10', done || active ? 'bg-primary' : 'bg-border')} />}
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                    done || active ? 'bg-primary' : 'border-[1.5px] border-border bg-surface-2'
                  )}
                >
                  {done ? (
                    <Check size={11} strokeWidth={2.5} className="text-primary-fg" />
                  ) : (
                    <span
                      className={cn(
                        'font-heading text-[11px] font-bold',
                        active ? 'text-primary-fg' : 'text-faint'
                      )}
                    >
                      {step}
                    </span>
                  )}
                </div>
                <span className={cn('font-heading text-[13px] font-semibold', done || active ? 'text-fg' : 'text-faint')}>
                  {label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
