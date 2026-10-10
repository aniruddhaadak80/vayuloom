"use client";

import { useMemo, useState } from "react";
import { autopilotPlan } from "@/lib/agents";
import { categoryForAQI, getZones } from "@/lib/aqi";
import { grapActionForAQI, stageLabel } from "@/lib/grap";

const STAGE_COLOR: Record<string, string> = {
  None: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
  I: "bg-yellow-500/15 text-yellow-300 border-yellow-400/30",
  II: "bg-orange-500/15 text-orange-300 border-orange-400/30",
  III: "bg-red-500/15 text-red-300 border-red-400/30",
  IV: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-400/30",
};

async function copyText(text: string, onDone: (ok: boolean) => void): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    onDone(true);
  } catch {
    onDone(false);
  }
}

export default function SchoolClient() {
  const zones = useMemo(() => getZones(), []);
  const [zoneId, setZoneId] = useState("anand-vihar");
  const [students, setStudents] = useState(900);
  const [override, setOverride] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const zone = zones.find((z) => z.id === zoneId) ?? zones[0]!;
  const parsedOverride = override.trim() === "" ? null : Number(override);
  const effectiveAqi =
    parsedOverride !== null && Number.isFinite(parsedOverride) && parsedOverride >= 0
      ? Math.min(1000, parsedOverride)
      : zone.aqi;

  const plan = useMemo(
    () => autopilotPlan({ aqi: effectiveAqi, zoneName: zone.name, students }),
    [effectiveAqi, zone.name, students],
  );
  const grap = useMemo(() => grapActionForAQI(effectiveAqi), [effectiveAqi]);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">VayuLoom · School Autopilot</p>
      <h1 className="mt-2 text-3xl font-bold">Principal&apos;s GRAP autopilot</h1>
      <p className="mt-2 text-sm text-slate-300">
        Deterministic plan per zone — no keys, no network. Override AQI to rehearse tomorrow&apos;s smog.
      </p>

      <form
        className="mt-6 grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 sm:grid-cols-3"
        onSubmit={(e) => e.preventDefault()}
      >
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold">Monitoring zone</span>
          <select
            className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2"
            value={zoneId}
            onChange={(e) => setZoneId(e.target.value)}
          >
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name} — AQI {z.aqi}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold">Students</span>
          <input
            type="number"
            min={1}
            max={10000}
            className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2"
            value={students}
            onChange={(e) => setStudents(Math.max(1, Math.min(10000, Number(e.target.value) || 1)))}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold">AQI override (blank = live zone)</span>
          <input
            type="number"
            min={0}
            max={1000}
            placeholder={String(zone.aqi)}
            className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2"
            value={override}
            onChange={(e) => setOverride(e.target.value)}
          />
        </label>
      </form>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className={`rounded-full border px-4 py-1.5 text-sm font-bold ${STAGE_COLOR[plan.stage]}`}>
          {stageLabel(grap.stage)}
        </span>
        <span className="text-2xl font-bold">
          AQI {Math.round(effectiveAqi)}{" "}
          <span className="text-base font-medium text-slate-300">· {categoryForAQI(effectiveAqi)}</span>
        </span>
        <span className="text-sm text-slate-400">
          {zone.name} · {students} students
        </span>
      </div>

      <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">Principal card</h2>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-300"
          >
            Print card
          </button>
        </div>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed">
          {plan.principalCard.map((line, i) => (
            <li key={i} className={i === 0 ? "font-bold text-cyan-200" : "text-slate-200"}>
              {line}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-2">
        {(
          [
            { key: "en", title: "Parent SMS — English", body: plan.parentSMS_EN },
            { key: "hi", title: "Parent SMS — Hindi", body: plan.parentSMS_HI },
          ] as const
        ).map((sms) => (
          <div key={sms.key} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-bold">{sms.title}</h2>
              <button
                type="button"
                onClick={() => copyText(sms.body, (ok) => setCopied(ok ? sms.key : "failed"))}
                className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold hover:bg-white/10"
              >
                {copied === sms.key ? "Copied ✓" : "Copy"}
              </button>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-200">{sms.body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
