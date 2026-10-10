"use client";

import { useEffect, useRef } from "react";

/** Deterministic mulberry32 PRNG — offline seed, no network. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hue: number;
  alpha: number;
  phase: number;
}

interface BreathingCityProps {
  density?: number;
  className?: string;
  title?: string;
}

/**
 * Breathing-city canvas: a 1000-agent swarm drifting over a stylised
 * school-city skyline. Pure canvas 2D, transform/opacity-level work only
 * (positions via fillRect arcs), seeded PRNG, honours
 * prefers-reduced-motion by rendering one static frame.
 */
export function BreathingCity({
  density = 1000,
  className,
  title = "Breathing city swarm simulation",
}: BreathingCityProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rand = mulberry32(20261013);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let raf = 0;
    let t = 0;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const count = Math.max(200, Math.min(density, 1400));
    const parts: Particle[] = Array.from({ length: count }, () => ({
      x: rand(),
      y: rand(),
      vx: (rand() - 0.5) * 0.0016,
      vy: (rand() - 0.5) * 0.0011 - 0.0004,
      r: 0.8 + rand() * 2.1,
      hue: rand(),
      alpha: 0.25 + rand() * 0.6,
      phase: rand() * Math.PI * 2,
    }));

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      w = Math.max(280, rect.width);
      h = Math.max(220, rect.height);
      canvas!.width = Math.floor(w * dpr);
      canvas!.height = Math.floor(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    function skyline(c: CanvasRenderingContext2D) {
      // Stylised school-city rooftops along the bottom edge.
      c.save();
      c.fillStyle = "rgba(148,163,184,0.16)";
      const blocks = 14;
      const bw = w / blocks;
      const sr = mulberry32(77);
      for (let i = 0; i < blocks; i++) {
        const bh = h * (0.08 + sr() * 0.16);
        const bx = i * bw + 2;
        const by = h - bh;
        c.fillRect(bx, by, bw - 4, bh);
        // tiny lit windows
        c.fillStyle = "rgba(34,211,238,0.28)";
        const wr = mulberry32(i * 31 + 7);
        for (let k = 0; k < 3; k++) {
          if (wr() > 0.5) {
            c.fillRect(bx + 4 + wr() * (bw - 14), by + 6 + wr() * (bh - 14), 3, 3);
          }
        }
        c.fillStyle = "rgba(148,163,184,0.16)";
      }
      c.restore();
    }

    function frame() {
      t += 0.016;
      // Breath cycle: 4s inhale / 4s exhale modulation of drift + glow.
      const breath = (Math.sin((t * Math.PI) / 4) + 1) / 2;
      ctx!.clearRect(0, 0, w, h);

      // Ambient glow following the breath.
      const g = ctx!.createRadialGradient(
        w * 0.5,
        h * 0.42,
        10,
        w * 0.5,
        h * 0.42,
        Math.max(w, h) * 0.7,
      );
      g.addColorStop(0, `rgba(34,211,238,${0.1 + breath * 0.08})`);
      g.addColorStop(0.55, `rgba(245,158,11,${0.05 + (1 - breath) * 0.06})`);
      g.addColorStop(1, "rgba(11,16,38,0)");
      ctx!.fillStyle = g;
      ctx!.fillRect(0, 0, w, h);

      skyline(ctx!);

      for (const p of parts) {
        p.x += p.vx * (1 + breath * 1.6) + Math.sin(t + p.phase) * 0.0004;
        p.y += p.vy * (1 + breath) + Math.cos(t * 0.8 + p.phase) * 0.0003;
        if (p.x < -0.02) p.x = 1.02;
        if (p.x > 1.02) p.x = -0.02;
        if (p.y < -0.02) p.y = 1.02;
        if (p.y > 1.02) p.y = -0.02;

        const px = p.x * w;
        const py = p.y * h;
        const tw = 0.55 + 0.45 * Math.sin(t * 2 + p.phase);
        const a = p.alpha * tw;
        // Amber smog band near ground, cyan breath above.
        const smogMix = Math.max(0, (py - h * 0.55) / (h * 0.45));
        const cr = Math.round(34 + (245 - 34) * smogMix * 0.85);
        const cg = Math.round(211 - (211 - 158) * smogMix * 0.7);
        const cb = Math.round(238 - (238 - 11) * smogMix * 0.9);
        ctx!.beginPath();
        ctx!.arc(px, py, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${cr},${cg},${cb},${a.toFixed(3)})`;
        ctx!.fill();
      }

      // Breath ring pulse.
      ctx!.beginPath();
      ctx!.arc(
        w * 0.5,
        h * 0.42,
        24 + breath * 46,
        0,
        Math.PI * 2,
      );
      ctx!.strokeStyle = `rgba(34,211,238,${(0.35 - breath * 0.22).toFixed(3)})`;
      ctx!.lineWidth = 1.5;
      ctx!.stroke();

      raf = requestAnimationFrame(frame);
    }

    if (reduced) {
      // Single static frame — no animation.
      t = 1.2;
      const breath = 0.5;
      ctx.clearRect(0, 0, w, h);
      skyline(ctx);
      for (const p of parts) {
        const px = p.x * w;
        const py = p.y * h;
        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34,211,238,${(p.alpha * breath).toFixed(3)})`;
        ctx.fill();
      }
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [density]);

  return (
    <div
      className={className}
      role="img"
      aria-label={title}
      data-testid="breathing-city"
    >
      <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />
    </div>
  );
}
