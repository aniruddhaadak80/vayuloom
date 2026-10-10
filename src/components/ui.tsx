import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

// ---------- Button ----------
type ButtonVariant = "primary" | "ghost" | "amber" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-breath text-ink hover:brightness-110 focus-visible:ring-breath shadow-[0_0_24px_-6px_#22d3ee]",
  ghost: "bg-transparent text-slate-200 hover:bg-white/10",
  amber:
    "bg-smog text-ink hover:brightness-110 focus-visible:ring-smog shadow-[0_0_24px_-8px_#f59e0b]",
  outline:
    "border border-slate-400/30 bg-transparent text-inherit hover:border-breath hover:text-breath",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-7 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full font-display font-semibold tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:cursor-not-allowed disabled:opacity-50",
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

interface ButtonLinkProps {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-display font-semibold tracking-tight transition-all duration-200",
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
    >
      {children}
    </Link>
  );
}

// ---------- Card ----------
interface CardProps {
  className?: string;
  children: ReactNode;
  id?: string;
}

export function Card({ className, children, id }: CardProps) {
  return (
    <div
      id={id}
      className={cn(
        "rounded-2xl border border-white/10 bg-ink-soft/80 p-6 shadow-[0_8px_40px_-16px_rgba(0,0,0,0.7)] backdrop-blur-sm transition-colors duration-200",
        "light:border-slate-900/10 light:bg-white light:shadow-[0_8px_32px_-16px_rgba(11,16,38,0.25)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <h3
      className={cn(
        "font-display text-lg font-semibold tracking-tight text-white light:text-ink",
        className,
      )}
    >
      {children}
    </h3>
  );
}

export function CardText({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <p
      className={cn(
        "mt-2 text-sm leading-6 text-slate-300 light:text-slate-600",
        className,
      )}
    >
      {children}
    </p>
  );
}

// ---------- Badge ----------
type BadgeTone = "cyan" | "amber" | "red" | "green" | "slate";

const badgeTones: Record<BadgeTone, string> = {
  cyan: "border-breath/40 bg-breath/10 text-breath",
  amber: "border-smog/40 bg-smog/10 text-smog",
  red: "border-red-400/40 bg-red-500/10 text-red-300",
  green: "border-emerald-400/40 bg-emerald-500/10 text-emerald-300",
  slate: "border-white/15 bg-white/5 text-slate-300",
};

export function Badge({
  tone = "slate",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono2 text-[11px] font-medium uppercase tracking-widest",
        badgeTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

// ---------- Stat ----------
interface StatProps {
  label: string;
  value: string;
  sub?: string;
  tone?: BadgeTone;
  className?: string;
}

export function Stat({ label, value, sub, tone = "cyan", className }: StatProps) {
  const toneText: Record<BadgeTone, string> = {
    cyan: "text-breath",
    amber: "text-smog",
    red: "text-red-300",
    green: "text-emerald-300",
    slate: "text-white",
  };
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="font-mono2 text-[11px] uppercase tracking-widest text-slate-400">
        {label}
      </span>
      <span
        className={cn(
          "font-display text-3xl font-bold tracking-tight light:text-ink",
          toneText[tone],
        )}
      >
        {value}
      </span>
      {sub ? (
        <span className="text-xs leading-5 text-slate-400 light:text-slate-500">
          {sub}
        </span>
      ) : null}
    </div>
  );
}

// ---------- SectionHeading ----------
export function SectionHeading({
  title,
  lede,
  align = "left",
}: {
  title: string;
  lede?: string;
  align?: "left" | "center";
}) {
  return (
    <div
      className={cn(
        "flex max-w-2xl flex-col gap-3",
        align === "center" && "mx-auto items-center text-center",
      )}
    >
      <h2 className="font-display text-3xl font-bold tracking-tight text-white light:text-ink sm:text-4xl">
        {title}
      </h2>
      {lede ? (
        <p className="text-base leading-7 text-slate-300 light:text-slate-600">
          {lede}
        </p>
      ) : null}
    </div>
  );
}
