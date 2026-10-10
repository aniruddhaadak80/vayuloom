import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  CalendarClock,
  Flame,
  Printer,
  ShieldCheck,
  Wind,
} from "lucide-react";
import { BreathingCity } from "@/components/breathing-city";
import { Badge, ButtonLink, Card, CardText, CardTitle, SectionHeading, Stat } from "@/components/ui";

const logoWall = [
  "CPCB GRAP",
  "OpenAQ format",
  "NASA FIRMS format",
  "IMD wind",
  "WHO guidelines",
  "Delhi 12 zones",
];

const steps = [
  {
    icon: BellRing,
    title: "Sense",
    text: "Hyperlocal AQI across 12 Delhi zones streams into one school dashboard. Seeded offline data means the demo never needs a key or a network call.",
  },
  {
    icon: ShieldCheck,
    title: "Decide",
    text: "CPCB GRAP thresholds fire automatically — Stage I at 201, Stage II at 301, Stage III–IV past 401. No principal has to interpret raw PM2.5 at 6am.",
  },
  {
    icon: CalendarClock,
    title: "Act",
    text: "One click shifts timetables, pushes parent alerts and prints Hindi/English action cards for the gate, staffroom and classrooms.",
  },
];

const grapRows = [
  { stage: "Stage I · Poor", range: "201–300", action: "No outdoor assembly; masks advised; outdoor sports shortened.", tone: "cyan" as const },
  { stage: "Stage II · Very poor", range: "301–400", action: "Outdoor play suspended; windows protocol; parent alert sent.", tone: "amber" as const },
  { stage: "Stage III · Severe", range: "401–450", action: "Hybrid timetable; staggered dispersal; exposure scores frozen.", tone: "amber" as const },
  { stage: "Stage IV · Severe+", range: "450+", action: "School closure protocol; printed action cards; emergency contacts live.", tone: "red" as const },
];

export default function Home() {
  return (
    <main className="flex flex-col">
      {/* 1 — Split-screen hero: copy left, breathing canvas right */}
      <section className="vl-grid-bg relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-14 pt-14 sm:px-6 lg:grid-cols-2 lg:pt-20">
          <div className="flex max-w-xl flex-col gap-5">
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-white light:text-ink sm:text-5xl">
              When Delhi chokes, school already knows what to do.
            </h1>
            <p className="text-lg leading-8 text-slate-300 light:text-slate-600">
              VayuLoom turns stubble fires, wind and hyperlocal AQI into
              automatic GRAP school actions — action card, parent alert and
              timetable shift in one click.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <ButtonLink href="/observatory" size="lg">
                Open the live observatory
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            </div>
            <p className="font-mono2 text-xs uppercase tracking-widest text-slate-400">
              AQI 312 · Anand Vihar · GRAP Stage II · action ready
            </p>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-soft shadow-[0_24px_80px_-24px_rgba(34,211,238,0.35)] light:border-slate-900/10">
              <BreathingCity density={1000} className="h-[340px] w-full sm:h-[420px]" />
            </div>
            <div className="absolute -bottom-5 left-4 right-4 flex items-center justify-between rounded-xl border border-white/10 bg-ink/90 px-4 py-3 backdrop-blur light:border-slate-900/10 light:bg-white/95">
              <Stat label="Live zone" value="312" sub="Anand Vihar · Very poor" tone="amber" className="[&>span:nth-child(2)]:text-2xl" />
              <Stat label="Wind" value="NW 11" sub="Stubble drift from Punjab" tone="cyan" className="[&>span:nth-child(2)]:text-2xl" />
              <Stat label="Exposure" value="−38%" sub="With timetable shift" tone="green" className="hidden sm:flex [&>span:nth-child(2)]:text-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* 2 — Logo wall UNDER hero, never inside it */}
      <section aria-label="Data sources" className="border-y border-white/10 bg-ink-soft/40 light:border-slate-900/10 light:bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-3 px-4 py-6 sm:px-6">
          {logoWall.map((l) => (
            <span key={l} className="font-mono2 text-xs uppercase tracking-[0.2em] text-slate-400 light:text-slate-500">
              {l}
            </span>
          ))}
        </div>
      </section>

      {/* 3 — Live snapshot: bento strip */}
      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-16 sm:px-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <CardTitle>School autopilot, armed for October</CardTitle>
            <Badge tone="amber">GRAP Stage II</Badge>
          </div>
          <CardText>
            AQI crossed 312 at 6:40am. VayuLoom drafted the principal action
            card, queued 1,240 parent alerts and proposed a timetable shift —
            before the first bus left the depot.
          </CardText>
          <div className="mt-6 grid grid-cols-3 gap-4">
            <Stat label="Alerts queued" value="1,240" sub="Hindi + English SMS" tone="cyan" />
            <Stat label="Exposure cut" value="−38%" sub="Indoor-first timetable" tone="green" />
            <Stat label="Printed cards" value="6" sub="Gate · staffroom · classes" tone="amber" />
          </div>
        </Card>
        <Card className="flex flex-col justify-between gap-6 border-breath/25">
          <div>
            <CardTitle>One click, three outputs</CardTitle>
            <CardText>
              Principals do not read dashboards at 6am. They approve one card.
            </CardText>
          </div>
          <ul className="flex flex-col gap-3 text-sm text-slate-200 light:text-slate-700">
            <li className="flex items-center gap-2.5">
              <Printer className="h-4 w-4 shrink-0 text-breath" /> Printable gate + classroom cards
            </li>
            <li className="flex items-center gap-2.5">
              <BellRing className="h-4 w-4 shrink-0 text-breath" /> Parent alert in Hindi / English
            </li>
            <li className="flex items-center gap-2.5">
              <CalendarClock className="h-4 w-4 shrink-0 text-breath" /> Timetable shifted indoors
            </li>
          </ul>
        </Card>
      </section>

      {/* 4 — How it works: 3-column cards (single eyebrow of the page) */}
      <section id="how" className="border-y border-white/10 bg-ink-soft/40 light:border-slate-900/10 light:bg-slate-100/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-16 sm:px-6">
          <div className="flex flex-col gap-3">
            <span className="font-mono2 text-xs uppercase tracking-[0.25em] text-breath light:text-breath-deep">
              Sense → Decide → Act
            </span>
            <SectionHeading
              title="A protocol, not another dashboard"
              lede="Every October the same story: stubble smoke meets Diwali haze and schools improvise. VayuLoom replaces improvisation with a deterministic autopilot."
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((s) => (
              <Card key={s.title}>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-breath/15 text-breath">
                  <s.icon className="h-5 w-5" />
                </span>
                <CardTitle className="mt-4">{s.title}</CardTitle>
                <CardText>{s.text}</CardText>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 5 — Stubble tracer teaser: reversed split */}
      <section id="tracer" className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <div className="order-2 flex flex-col gap-5 lg:order-1">
          <SectionHeading
            title="Punjab fire → classroom air in 48 hours"
            lede="The stubble-to-classroom tracer replays fire detections, wind drift and PM2.5 arrival as one timeline. Students watch smoke travel before it reaches their lungs — then the timetable moves first."
          />
          <ul className="flex flex-col gap-3 text-sm leading-6 text-slate-300 light:text-slate-600">
            <li className="flex gap-2.5">
              <Flame className="mt-1 h-4 w-4 shrink-0 text-smog" />
              NASA FIRMS-format fire seeds light up across the northwest belt.
            </li>
            <li className="flex gap-2.5">
              <Wind className="mt-1 h-4 w-4 shrink-0 text-breath" />
              IMD-format wind pushes the plume down the corridor toward Delhi.
            </li>
            <li className="flex gap-2.5">
              <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-breath" />
              Classrooms get a 48-hour head start instead of a 6am surprise.
            </li>
          </ul>
          <div>
            <Link href="/observatory" className="inline-flex items-center gap-2 font-display text-sm font-semibold text-breath hover:brightness-125">
              Replay the tracer in the observatory <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <Card>
            <div className="flex items-center justify-between">
              <CardTitle>T+48h plume arrival</CardTitle>
              <Badge tone="amber">Oct 28 · NW flow</Badge>
            </div>
            <ol className="mt-5 flex flex-col gap-0">
              {[
                { t: "T+0h", d: "142 fires detected · Sangrur belt", aqi: "—" },
                { t: "T+12h", d: "Plume crosses Patiala · PM2.5 rising", aqi: "186" },
                { t: "T+24h", d: "Corridor drift · Panipat edge", aqi: "244" },
                { t: "T+36h", d: "Delhi border · Anand Vihar spikes", aqi: "298" },
                { t: "T+48h", d: "Classroom protocol armed · Stage II", aqi: "312" },
              ].map((r, i) => (
                <li key={r.t} className="relative flex gap-4 pb-5 last:pb-0">
                  {i < 4 && (
                    <span className="absolute left-[39px] top-10 h-[calc(100%-2rem)] w-px bg-white/15 light:bg-slate-900/15" aria-hidden="true" />
                  )}
                  <span className="w-10 shrink-0 font-mono2 text-xs text-breath">{r.t}</span>
                  <span className="flex-1 text-sm text-slate-300 light:text-slate-600">{r.d}</span>
                  <span className="font-mono2 text-xs text-smog">{r.aqi}</span>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </section>

      {/* 6 — GRAP autopilot: table layout */}
      <section id="grap" className="border-t border-white/10 bg-ink-soft/40 light:border-slate-900/10 light:bg-slate-100/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-16 sm:px-6">
          <SectionHeading
            title="GRAP stages, translated to school language"
            lede="Real CPCB thresholds. Each stage maps to concrete school orders — assemblies, play, dispersal, closure — printed in Hindi and English."
          />
          <div className="overflow-hidden rounded-2xl border border-white/10 light:border-slate-900/10">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-white/5 font-mono2 text-[11px] uppercase tracking-widest text-slate-400 light:bg-slate-900/5 light:text-slate-500">
                  <th className="px-5 py-3 font-medium">Stage</th>
                  <th className="px-5 py-3 font-medium">AQI range</th>
                  <th className="px-5 py-3 font-medium">School action</th>
                </tr>
              </thead>
              <tbody>
                {grapRows.map((r) => (
                  <tr key={r.stage} className="border-t border-white/10 bg-ink light:border-slate-900/10 light:bg-white">
                    <td className="px-5 py-4">
                      <Badge tone={r.tone}>{r.stage}</Badge>
                    </td>
                    <td className="px-5 py-4 font-mono2 text-xs text-slate-300 light:text-slate-600">{r.range}</td>
                    <td className="px-5 py-4 text-slate-200 light:text-slate-700">{r.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 7 — CTA band: single accent, single intent */}
      <section className="border-t border-breath/20 bg-breath/[0.06]">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-5 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex max-w-2xl flex-col gap-3">
            <h2 className="font-display text-3xl font-bold tracking-tight text-white light:text-ink">
              October is coming. Put your school on autopilot.
            </h2>
            <p className="leading-7 text-slate-300 light:text-slate-600">
              Open the live observatory: twelve Delhi zones, the 48-hour
              stubble tracer and the GRAP action engine — no keys, no signup.
            </p>
          </div>
          <ButtonLink href="/observatory" size="lg" className="shrink-0">
            Open the live observatory <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </div>
      </section>
    </main>
  );
}
