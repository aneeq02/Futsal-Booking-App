'use client';

const OPTIONS = [
  { value: '', label: 'Recommended' },
  { value: 'price', label: 'Price: Low to High' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'nearest', label: 'Nearest' },
];

export function SortBar({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-faint">Sort:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-secondary outline-none"
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
