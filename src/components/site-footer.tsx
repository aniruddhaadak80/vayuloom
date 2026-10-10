import Link from "next/link";
import { Wind } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-ink light:border-slate-900/10 light:bg-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-breath text-ink">
              <Wind className="h-5 w-5" strokeWidth={2.25} />
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-white light:text-ink">
              VayuLoom
            </span>
          </div>
          <p className="max-w-sm text-sm leading-6 text-slate-400 light:text-slate-600">
            The air safety OS for Indian schools. Hyperlocal AQI, stubble-fire
            drift and wind turned into GRAP-based school actions. Offline-first
            seeds, zero keys, deterministic by design.
          </p>
          <p className="font-mono2 text-[11px] uppercase tracking-widest text-slate-500">
            CPCB GRAP thresholds · WHO guidelines · IMD wind format
          </p>
        </div>
        <nav className="flex flex-col gap-2.5" aria-label="Product">
          <span className="font-mono2 text-[11px] uppercase tracking-widest text-slate-500">
            Product
          </span>
          <Link href="/observatory" className="text-sm text-slate-300 hover:text-breath light:text-slate-600">
            Live observatory
          </Link>
          <Link href="/#how" className="text-sm text-slate-300 hover:text-breath light:text-slate-600">
            School protocol
          </Link>
          <Link href="/#tracer" className="text-sm text-slate-300 hover:text-breath light:text-slate-600">
            Stubble tracer
          </Link>
        </nav>
        <nav className="flex flex-col gap-2.5" aria-label="Protocol">
          <span className="font-mono2 text-[11px] uppercase tracking-widest text-slate-500">
            GRAP stages
          </span>
          <span className="text-sm text-slate-300 light:text-slate-600">Stage I · Poor (201–300)</span>
          <span className="text-sm text-slate-300 light:text-slate-600">Stage II · Very poor (301–400)</span>
          <span className="text-sm text-slate-300 light:text-slate-600">Stage III–IV · Severe (401+)</span>
        </nav>
        <div className="flex flex-col gap-2.5">
          <span className="font-mono2 text-[11px] uppercase tracking-widest text-slate-500">
            Data
          </span>
          <span className="text-sm text-slate-300 light:text-slate-600">
            Deterministic offline seeds. No network calls, no API keys.
          </span>
          <span className="text-sm text-slate-300 light:text-slate-600">
            Built for Delhi October stubble season.
          </span>
        </div>
      </div>
      <div className="border-t border-white/10 light:border-slate-900/10">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-2 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:px-6">
          <span>© 2026 VayuLoom · Environmental Hacks Track 01 Air</span>
          <span className="font-mono2 uppercase tracking-widest">Breathe planned, not panic</span>
        </div>
      </div>
    </footer>
  );
}
