'use client';

import { useState } from 'react';

interface WeeklyChartProps {
  data: { label: string; value: number; previousValue: number }[];
}

const WIDTH = 520;
const HEIGHT = 130;
const PAD_X = 20;
const CHART_BOTTOM = 100;
const CHART_TOP = 10;

export function WeeklyChart({ data }: WeeklyChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (data.length === 0) {
    return <p className="py-10 text-center text-sm text-muted">No bookings yet this week.</p>;
  }

  const max = Math.max(4, ...data.map((d) => d.value), ...data.map((d) => d.previousValue));
  const niceMax = Math.ceil(max / 4) * 4 || 12;
  const stepX = (WIDTH - PAD_X * 2) / Math.max(1, data.length - 1);

  const y = (v: number) => CHART_BOTTOM - (v / niceMax) * (CHART_BOTTOM - CHART_TOP);
  const points = data.map((d, i) => ({ x: PAD_X + i * stepX, y: y(d.value), ...d }));
  const prevPoints = data.map((d, i) => ({ x: PAD_X + i * stepX, y: y(d.previousValue) }));

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const prevPath = prevPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${path} L ${points[points.length - 1].x} ${CHART_BOTTOM} L ${PAD_X} ${CHART_BOTTOM} Z`;

  const last = points[points.length - 1];
  const hovered = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div>
      <div className="mb-3.5 flex items-center gap-3 text-[10px]">
        <div className="flex items-center gap-1">
          <span className="h-0.5 w-4 rounded-sm bg-primary" />
          <span className="text-muted">This week</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-px w-4 border-b border-dashed border-border" />
          <span className="text-muted">Last week</span>
        </div>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" onMouseLeave={() => setHoverIndex(null)}>
          <defs>
            <linearGradient id="weeklyFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22C55E" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0, 0.25, 0.5, 0.75, 1].map((f) => (
            <line
              key={f}
              x1="0"
              y1={CHART_TOP + f * (CHART_BOTTOM - CHART_TOP)}
              x2={WIDTH}
              y2={CHART_TOP + f * (CHART_BOTTOM - CHART_TOP)}
              className="stroke-border-card"
              strokeWidth={1}
            />
          ))}
          <text x="2" y={CHART_BOTTOM + 3} fontSize="8" className="fill-faint">0</text>
          <text x="2" y={y(niceMax / 2) + 3} fontSize="8" className="fill-faint">{niceMax / 2}</text>
          <text x="2" y={CHART_TOP + 3} fontSize="8" className="fill-faint">{niceMax}</text>

          <path d={prevPath} fill="none" className="stroke-border" strokeWidth={1.5} strokeDasharray="3,3" />
          <path d={areaPath} fill="url(#weeklyFill)" stroke="none" />
          <path d={path} fill="none" stroke="#22C55E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

          {points.map((p, i) => (
            <g key={p.label + i}>
              <rect x={p.x - stepX / 2} y={0} width={stepX} height={HEIGHT} fill="transparent" onMouseEnter={() => setHoverIndex(i)} />
              <circle cx={p.x} cy={p.y} r={i === points.length - 1 ? 4 : 3} className="fill-surface" stroke="#22C55E" strokeWidth={1.5} />
            </g>
          ))}
          <circle cx={last.x} cy={last.y} r={7} fill="rgba(34,197,94,0.15)" />

          <rect x={last.x - 38} y={4} width="76" height="28" rx="5" className="fill-primary/10 stroke-primary/20" strokeWidth={1} />
          <text x={last.x} y={15} fontSize="7.5" textAnchor="middle" className="fill-muted">Today</text>
          <text x={last.x} y={27} fontSize="10" fontWeight="700" textAnchor="middle" className="fill-primary">
            {last.value} slots
          </text>

          {points.map((p, i) => (
            <text
              key={p.label + 'lbl'}
              x={p.x}
              y={HEIGHT - 12}
              fontSize="8"
              textAnchor="middle"
              fontWeight={i === points.length - 1 ? 600 : 400}
              className={i === points.length - 1 ? 'fill-primary' : 'fill-faint'}
            >
              {p.label}
            </text>
          ))}
        </svg>

        {hovered && (
          <div
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs shadow-lg"
            style={{ left: `${(hovered.x / WIDTH) * 100}%`, top: `${(hovered.y / HEIGHT) * 100}%` }}
          >
            <p className="font-medium text-fg">{hovered.value} bookings</p>
            <p className="text-muted">{hovered.label}</p>
          </div>
        )}
      </div>
    </div>
  );
}
