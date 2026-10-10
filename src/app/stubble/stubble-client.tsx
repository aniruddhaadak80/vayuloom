"use client";

import { useMemo } from "react";
import { FIRE_CLUSTERS, WIND, forecastSeries, totalForecast, transport48h } from "@/lib/stubble";

export default function StubbleClient() {
  const perFire = useMemo(() => transport48h(), []);
  const forecast = useMemo(() => totalForecast(), []);
  const series = useMemo(() => forecastSeries(), []);
  const maxFire = Math.max(...perFire.map((f) => f.contributionPM25), 1);
  const maxSeries = Math.max(...series, 1);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">VayuLoom · Stubble tracer</p>
      <h1 className="mt-2 text-3xl font-bold">Where Delhi&apos;s smoke comes from</h1>
      <p className="mt-2 text-sm text-slate-300">
        {FIRE_CLUSTERS.length} fire clusters · Wind {WIND.label} · {forecast.note}
      </p>

      <div className="mt-6 grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 sm:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">Transported PM2.5</p>
          <p className="text-3xl font-bold text-orange-300">+{forecast.totalPM25} <span className="text-sm font-normal">µg/m³</span></p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">Delhi estimate (48h)</p>
          <p className="text-3xl font-bold">{forecast.delhiPM25Estimate} <span className="text-sm font-normal">µg/m³ · AQI {forecast.delhiAqiEstimate}</span></p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">Smoke peak</p>
          <p className="text-3xl font-bold">T+{forecast.peakHour}h</p>
        </div>
      </div>

      <section className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5">
        <h2 className="font-bold">48-hour Delhi PM2.5 forecast</h2>
        <div className="mt-3 flex h-32 items-end gap-[2px]" aria-hidden="true">
          {series.map((v, h) => (
            <div
              key={h}
              title={`T+${h}h: ${v} µg/m³`}
              className={`flex-1 rounded-t ${h === forecast.peakHour ? "bg-orange-400" : "bg-cyan-400/60"}`}
              style={{ height: `${Math.max(4, (v / maxSeries) * 100)}%` }}
            />
          ))}
        </div>
        <div className="mt-1 flex justify-between text-xs text-slate-400">
          <span>now</span>
          <span>T+24h</span>
          <span>T+47h</span>
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5">
        <h2 className="font-bold">Fire clusters → Delhi contribution</h2>
        <ul className="mt-3 space-y-3">
          {perFire.map((f) => (
            <li key={f.fireId} className="text-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-semibold">
                  {f.name} <span className="font-normal text-slate-400">({f.state}, {f.distanceKm} km)</span>
                </span>
                <span className="text-slate-300">
                  +{f.contributionPM25} µg/m³ · arrives T+{f.arrivalHour}h
                </span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-orange-400"
                  style={{ width: `${(f.contributionPM25 / maxFire) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
