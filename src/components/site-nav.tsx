"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun, Wind } from "lucide-react";
import { useEffect, useState } from "react";

const links = [
  { href: "/observatory", label: "Observatory" },
  { href: "/#how", label: "Protocol" },
  { href: "/#tracer", label: "Stubble tracer" },
  { href: "/#grap", label: "GRAP autopilot" },
];

export function SiteNav() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/85 backdrop-blur-md light:border-slate-900/10 light:bg-white/85">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" aria-label="VayuLoom home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-breath text-ink">
            <Wind className="h-5 w-5" strokeWidth={2.25} />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-bold tracking-tight text-white light:text-ink">
              VayuLoom
            </span>
            <span className="font-mono2 text-[10px] uppercase tracking-[0.2em] text-breath light:text-breath-deep">
              Air safety OS
            </span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-white light:text-slate-600 light:hover:bg-slate-900/5 light:hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            aria-label="Toggle colour theme"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-slate-200 transition-colors hover:border-breath hover:text-breath light:border-slate-900/15 light:text-slate-600"
          >
            {mounted && theme === "light" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </button>
          <Link
            href="/observatory"
            className="hidden rounded-full bg-breath px-4 py-2 font-display text-sm font-semibold text-ink transition-all hover:brightness-110 sm:inline-flex"
          >
            Open live map
          </Link>
        </div>
      </div>
    </header>
  );
}
