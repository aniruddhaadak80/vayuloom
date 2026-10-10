"use client";

import { useMemo, useState } from "react";
import { co2pm25 } from "@/lib/indoor";

function num(v: string, fallback: number): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export default function IndoorClient() {
  const [students, setStudents] = useState("40");
  const [roomM3, setRoomM3] = useState("180");
  const [cadr, setCadr] = useState("0");
  const [hours, setHours] = useState("6");

  const { result, error } = useMemo(() => {
    try {
      return {
        result: co2pm25({
          students: Math.round(num(students, 40)),
          roomM3: num(roomM3, 180),
          purifierCADR: num(cadr, 0),
          hours: num(hours, 6),
        }),
        error: null as string | null,
      };
    } catch (e) {
      return { result: null, error: e instanceof Error ? e.message : "Invalid input" };
    }
  }, [students, roomM3, cadr, hours]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">VayuLoom · Classroom guardian</p>
      <h1 className="mt-2 text-3xl font-bold">Is this classroom safe to breathe in?</h1>
      <p className="mt-2 text-sm text-slate-300">
        Steady-state box model. Action level: CO2 ≈ 1000 ppm (ventilate), PM2.5 ≈ 60 µg/m³ (purify).
      </p>

      <div className="mt-6 grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 sm:grid-cols-2">
        {(
          [
            { label: "Students", value: students, set: setStudents },
            { label: "Room volume (m³)", value: roomM3, set: setRoomM3 },
            { label: "Purifier CADR (m³/h, 0 = none)", value: cadr, set: setCadr },
            { label: "Hours occupied", value: hours, set: setHours },
          ] as const
        ).map((f) => (
          <label key={f.label} className="flex flex-col gap-1 text-sm">
            <span className="font-semibold">{f.label}</span>
            <input
              type="number"
              className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2"
              value={f.value}
              onChange={(e) => f.set(e.target.value)}
            />
          </label>
        ))}
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</p>
      ) : (
        result && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400">Indoor PM2.5</p>
                <p className="text-3xl font-bold text-cyan-300">{result.pm25Indoor} <span className="text-sm font-normal">µg/m³</span></p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-cyan-400"
                    style={{ width: `${Math.min(100, (result.pm25Indoor / 150) * 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400">CO2</p>
                <p className="text-3xl font-bold text-orange-300">{result.co2} <span className="text-sm font-normal">ppm</span></p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-orange-400"
                    style={{ width: `${Math.min(100, (result.co2 / 2500) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
            <p className="mt-4 rounded-xl bg-white/5 p-3 text-sm leading-relaxed text-slate-200">
              {result.purifierAdvice}
            </p>
          </div>
        )
      )}
    </main>
  );
}
