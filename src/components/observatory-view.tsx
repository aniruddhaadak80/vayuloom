"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { Activity, Radio, Wind } from "lucide-react";
import { Badge, Card, CardText, CardTitle, Stat } from "@/components/ui";

const ObservatoryChart = dynamic(
  () =>
    import("@/components/observatory-chart").then((m) => m.ObservatoryChart),
  { ssr: false, loading: () => <div className="h-64 w-full animate-pulse rounded-xl bg-white/5" /> },
);

interface Zone {
  id: string;
  name: string;
  aqi: number;
  pm25: number;
}

interface HistoryPoint {
  t: string;
  aqi: number;
}

const FALLBACK_ZONES: Zone[] = [
  { id: "anand-vihar", name: "Anand Vihar", aqi: 312, pm25: 178 },
  { id: "mundka", name: "Mundka", aqi: 298, pm25: 164 },
  { id: "wazirpur", name: "Wazirpur", aqi: 287, pm25: 152 },
  { id: "rk-puram", name: "R.K. Puram", aqi: 264, pm25: 138 },
  { id: "punjabi-bagh", name: "Punjabi Bagh", aqi: 255, pm25: 131 },
  { id: "rohini", name: "Rohini", aqi: 249, pm25: 126 },
  { id: "dwarka", name: "Dwarka", aqi: 231, pm25: 118 },
  { id: "narela", name: "Narela", aqi: 226, pm25: 112 },
  { id: "okhla", name: "Okhla", aqi: 214, pm25: 104 },
  { id: "mandir-marg", name: "Mandir Marg", aqi: 198, pm25: 96 },
  { id: "siri-fort", name: "Siri Fort", aqi: 184, pm25: 88 },
  { id: "lodhi-road", name: "Lodhi Road", aqi: 176, pm25: 82 },
];

function fallbackHistory(zone: Zone): HistoryPoint[] {
  // Deterministic diurnal curve seeded from the zone id.
  let h = 0;
  for (const c of zone.id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const pts: HistoryPoint[] = [];
  for (let i = 0; i < 24; i++) {
    const wave = Math.sin((i / 24) * Math.PI * 2 - 1.2) * 28;
    const drift = ((h >> (i % 9)) % 17) - 8;
    pts.push({
      t: `${String(i).padStart(2, "0")}:00`,
      aqi: Math.max(60, Math.round(zone.aqi - 34 + wave + drift)),
    });
  }
  return pts;
}

function grapStage(aqi: number): { label: string; tone: "cyan" | "amber" | "red" | "green" } {
  if (aqi <= 100) return { label: "Good–Satisfactory", tone: "green" };
  if (aqi <= 200) return { label: "Moderate", tone: "cyan" };
  if (aqi <= 300) return { label: "GRAP I · Poor", tone: "amber" };
  if (aqi <= 400) return { label: "GRAP II · Very poor", tone: "amber" };
  return { label: "GRAP III–IV · Severe", tone: "red" };
}

type AqiModule = {
  getZones: () => Zone[];
  getHistory: (zoneId: string) => HistoryPoint[];
};

export default function ObservatoryView() {
  const [zones, setZones] = useState<Zone[]>(FALLBACK_ZONES);
  const [histories, setHistories] = useState<Record<string, HistoryPoint[]>>({});
  const [selectedId, setSelectedId] = useState<string>("anand-vihar");
  const [live, setLive] = useState(true);
  const [tick, setTick] = useState(0);
  const [source, setSource] = useState<"seed" | "lib">("seed");

  // Load Agent B's @/lib/aqi when available; fall back to inline seeds.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const mod = (await import("@/lib/aqi")) as unknown as AqiModule;
        if (typeof mod.getZones !== "function") throw new Error("no getZones");
        const z = mod.getZones();
        if (!Array.isArray(z) || z.length === 0) throw new Error("empty zones");
        const hist: Record<string, HistoryPoint[]> = {};
        for (const zone of z) {
          try {
            hist[zone.id] = mod.getHistory(zone.id);
          } catch {
            hist[zone.id] = fallbackHistory(zone);
          }
        }
        if (!cancelled) {
          setZones(z);
          setHistories(hist);
          setSelectedId(z[0].id);
          setSource("lib");
        }
      } catch {
        if (!cancelled) {
          const hist: Record<string, HistoryPoint[]> = {};
          for (const z of FALLBACK_ZONES) hist[z.id] = fallbackHistory(z);
          setZones(FALLBACK_ZONES);
          setHistories(hist);
          setSource("seed");
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  // SSE-style live simulation: small deterministic wobble every 2s.
  useEffect(() => {
    if (!live) return;
    const id = window.setInterval(() => setTick((v) => v + 1), 2000);
    return () => window.clearInterval(id);
  }, [live]);

  const liveZones = useMemo(() => {
    if (tick === 0) return zones;
    return zones.map((z, i) => {
      const wobble = Math.round(Math.sin(tick * 0.9 + i * 1.7) * 6);
      return { ...z, aqi: Math.max(50, z.aqi + wobble) };
    });
  }, [zones, tick]);

  const selected = liveZones.find((z) => z.id === selectedId) ?? liveZones[0];
  const stage = grapStage(selected.aqi);
  const history = histories[selected.id] ?? fallbackHistory(selected);
  const liveHistory = useMemo(() => {
    if (tick === 0) return history;
    return history.map((p, i) =>
      i === history.length - 1
        ? { ...p, aqi: selected.aqi }
        : p,
    );
  }, [history, selected.aqi, tick]);

  const worst = useMemo(
    () => [...liveZones].sort((a, b) => b.aqi - a.aqi)[0],
    [liveZones],
  );
  const avg = Math.round(
    liveZones.reduce((s, z) => s + z.aqi, 0) / Math.max(1, liveZones.length),
  );

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex max-w-2xl flex-col gap-3">
          <div className="flex items-center gap-2">
            <Badge tone="cyan">
              <Radio className="h-3 w-3" /> Live · {source === "lib" ? "lib feed" : "offline seed"}
            </Badge>
            <Badge tone={stage.tone}>{stage.label}</Badge>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white light:text-ink sm:text-4xl">
            Delhi observatory — 12 zones, one protocol
          </h1>
          <p className="leading-7 text-slate-300 light:text-slate-600">
            Simulated SSE ticks every 2 seconds. Select a zone to inspect its
            24-hour curve, PM2.5 and the GRAP action it triggers.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setLive((v) => !v)}
          aria-pressed={live}
          className="inline-flex items-center gap-2 rounded-full border border-breath/40 px-4 py-2 font-display text-sm font-semibold text-breath transition-colors hover:bg-breath/10"
        >
          <Activity className="h-4 w-4" />
          {live ? "Pause live feed" : "Resume live feed"}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><Stat label="City average AQI" value={String(avg)} sub="Across 12 zones" tone="cyan" /></Card>
        <Card><Stat label="Worst zone" value={String(worst.aqi)} sub={`${worst.name} · GRAP action armed`} tone="amber" /></Card>
        <Card><Stat label="Wind" value="NW 11" sub="Stubble drift corridor active" tone="cyan" /></Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>{selected.name} · 24h AQI</CardTitle>
            <Badge tone={stage.tone}>AQI {selected.aqi}</Badge>
          </div>
          <div className="mt-4">
            <ObservatoryChart data={liveHistory} />
          </div>
          <CardText>
            PM2.5 {selected.pm25} µg/m³ · {stage.label}. Timetable shift and
            parent alert draft update with every tick.
          </CardText>
        </Card>
        <Card>
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-breath" />
            <CardTitle>School action</CardTitle>
          </div>
          <CardText>
            {selected.aqi > 400
              ? "Closure protocol: hybrid classes, printed Hindi/English cards, emergency contacts live."
              : selected.aqi > 300
                ? "Outdoor play suspended, windows protocol on, parent alert queued for approval."
                : selected.aqi > 200
                  ? "No outdoor assembly, masks advised, sports periods shortened."
                  : "Normal timetable with heightened monitoring."}
          </CardText>
          <div className="mt-4 rounded-xl border border-breath/25 bg-breath/5 p-4 font-mono2 text-xs leading-5 text-slate-300 light:text-slate-600">
            AQI {selected.aqi} → {stage.label}
            <br />
            exposure −38% with indoor-first shift
          </div>
        </Card>
      </div>

      <section aria-label="Delhi zones" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {liveZones.map((z) => {
          const s = grapStage(z.aqi);
          const active = z.id === selectedId;
          return (
            <button
              key={z.id}
              type="button"
              onClick={() => setSelectedId(z.id)}
              aria-pressed={active}
              className={`flex items-center justify-between rounded-2xl border p-4 text-left transition-all duration-200 ${
                active
                  ? "border-breath bg-breath/10"
                  : "border-white/10 bg-ink-soft/80 hover:border-breath/40 light:border-slate-900/10 light:bg-white"
              }`}
            >
              <span className="flex flex-col gap-1">
                <span className="font-display text-sm font-semibold text-white light:text-ink">{z.name}</span>
                <span className="font-mono2 text-[11px] uppercase tracking-widest text-slate-400">
                  PM2.5 {z.pm25} · {s.label}
                </span>
              </span>
              <span className={`font-display text-2xl font-bold ${z.aqi > 300 ? "text-smog" : "text-breath"}`}>
                {z.aqi}
              </span>
            </button>
          );
        })}
      </section>
    </main>
  );
}
