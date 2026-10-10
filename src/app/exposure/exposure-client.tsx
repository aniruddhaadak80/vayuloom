"use client";

import { useMemo, useState } from "react";
import { exposureScore } from "@/lib/exposure";

const BAND_COLOR: Record<string, string> = {
  Low: "text-emerald-300",
  Moderate: "text-yellow-300",
  High: "text-orange-300",
  "Very High": "text-red-300",
};

function ScoreDial({ score }: { score: number }) {
  const r = 54;
  const c = 2 * Math.PI * r;
  const filled = (score / 100) * c;
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" role="img" aria-label={`Exposure score ${score}`}>
      <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="12" />
      <circle
        cx="70"
        cy="70"
        r={r}
        fill="none"
        stroke="#22d3ee"
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={`${filled} ${c}`}
        transform="rotate(-90 70 70)"
      />
      <text x="70" y="66" textAnchor="middle" fill="#f8fafc" fontSize="28" fontWeight="bold">
        {score}
      </text>
      <text x="70" y="86" textAnchor="middle" fill="#94a3b8" fontSize="11">
        / 100
      </text>
    </svg>
  );
}

export default function ExposureClient() {
  const [pm25, setPm25] = useState(180);
  const [hours, setHours] = useState(3);
  const [mask, setMask] = useState(false);
  const [purifier, setPurifier] = useState(true);

  const result = useMemo(
    () => exposureScore({ pm25, hoursOutdoor: hours, mask, purifier }),
    [pm25, hours, mask, purifier],
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">VayuLoom · Exposure</p>
      <h1 className="mt-2 text-3xl font-bold">How bad was today&apos;s air for you?</h1>
      <p className="mt-2 text-sm text-slate-300">
        Dose proxy (PM2.5 × outdoor hours × mask factor) scored against a severe reference day. WHO 2021
        guideline: 15 µg/m³ over 24 h.
      </p>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
        <label className="block text-sm">
          <span className="flex justify-between font-semibold">
            <span>Outdoor PM2.5 (µg/m³)</span>
            <span className="text-cyan-300">{pm25}</span>
          </span>
          <input
            type="range"
            min={0}
            max={500}
            value={pm25}
            onChange={(e) => setPm25(Number(e.target.value))}
            className="mt-2 w-full"
          />
        </label>
        <label className="mt-4 block text-sm">
          <span className="flex justify-between font-semibold">
            <span>Hours outdoors</span>
            <span className="text-cyan-300">{hours}h</span>
          </span>
          <input
            type="range"
            min={0}
            max={12}
            step={0.5}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="mt-2 w-full"
          />
        </label>
        <div className="mt-4 flex flex-wrap gap-5 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={mask} onChange={(e) => setMask(e.target.checked)} className="h-4 w-4" />
            N95 mask worn
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={purifier}
              onChange={(e) => setPurifier(e.target.checked)}
              className="h-4 w-4"
            />
            Purifier-cleaned room to recover in
          </label>
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 sm:flex-row">
        <ScoreDial score={result.score} />
        <div>
          <p className={`text-2xl font-bold ${BAND_COLOR[result.band]}`}>{result.band} exposure</p>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-200">
            {result.advice.map((a, i) => (
              <li key={i}>• {a}</li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
