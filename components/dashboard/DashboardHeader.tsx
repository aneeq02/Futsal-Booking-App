import Link from 'next/link';
import { SlidersHorizontal, Plus } from 'lucide-react';

export function DashboardHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex h-[60px] items-center justify-between border-b border-border-card bg-surface px-6 sm:px-8">
      <div>
        <div className="font-heading text-[17px] font-bold text-fg">{title}</div>
        <div className="text-[11px] text-faint">{subtitle}</div>
      </div>

      <div className="flex items-center gap-2.5">
        <button className="flex items-center gap-1.5 rounded-[9px] border border-border px-3.5 py-[7px] text-xs font-medium text-muted">
          <SlidersHorizontal size={13} />
          Filter
        </button>
        <Link
          href="/dashboard/court-settings"
          className="flex items-center gap-1.5 rounded-[9px] bg-primary px-3.5 py-2 font-heading text-xs font-semibold text-primary-fg"
        >
          <Plus size={13} />
          Block Slot
        </Link>
      </div>
    </div>
  );
}
