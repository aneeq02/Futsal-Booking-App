'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { MapPin, CalendarDays, Clock } from 'lucide-react';

export function HeroSearchBar() {
  const router = useRouter();
  const [area, setArea] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (area.trim()) params.set('q', area.trim());
    router.push(`/courts?${params.toString()}`);
    void date;
    void time;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-5 flex max-w-[680px] flex-col gap-2 rounded-2xl border border-border bg-surface p-1.5 shadow-[0_4px_24px_rgba(0,0,0,0.07)] dark:shadow-none sm:flex-row sm:items-center sm:gap-0 sm:py-1.5 sm:pl-5"
    >
      <div className="flex flex-1 items-center gap-2 px-3 py-2 sm:px-0 sm:py-0">
        <MapPin size={16} className="shrink-0 text-faint" />
        <input
          value={area}
          onChange={(e) => setArea(e.target.value)}
          type="text"
          placeholder="Which area?"
          className="w-full min-w-0 bg-transparent text-[15px] text-fg placeholder:text-faint focus:outline-none"
        />
      </div>
      <div className="hidden h-7 w-px bg-border sm:mx-4 sm:block" />
      <div className="flex flex-1 items-center gap-2 border-t border-border px-3 py-2 sm:border-t-0 sm:px-0 sm:py-0">
        <CalendarDays size={16} className="shrink-0 text-faint" />
        <input
          value={date}
          onChange={(e) => setDate(e.target.value)}
          type="text"
          onFocus={(e) => (e.target.type = 'date')}
          placeholder="Pick a date"
          className="w-full min-w-0 bg-transparent text-[15px] text-fg placeholder:text-faint focus:outline-none"
        />
      </div>
      <div className="hidden h-7 w-px bg-border sm:mx-4 sm:block" />
      <div className="flex flex-1 items-center gap-2 border-t border-border px-3 py-2 sm:border-t-0 sm:px-0 sm:py-0">
        <Clock size={16} className="shrink-0 text-faint" />
        <input
          value={time}
          onChange={(e) => setTime(e.target.value)}
          type="text"
          placeholder="What time?"
          className="w-full min-w-0 bg-transparent text-[15px] text-fg placeholder:text-faint focus:outline-none"
        />
      </div>
      <button
        type="submit"
        className="m-1.5 shrink-0 whitespace-nowrap rounded-[10px] bg-primary px-7 py-3 font-heading text-sm font-bold text-primary-fg sm:m-0"
      >
        Find Courts
      </button>
    </form>
  );
}
