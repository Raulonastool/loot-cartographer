import Link from "next/link";
import type { ReactNode } from "react";

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-gold/80 text-[11px] sm:text-xs tracking-[0.28em] uppercase font-mono">{children}</p>
  );
}

export function Cta({
  href,
  children,
  variant = "primary",
  external = false,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
  external?: boolean;
}) {
  const cls = [
    "inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm tracking-widest uppercase transition-colors",
    variant === "primary"
      ? "border border-gold/60 text-ink hover:bg-gold/10 hover:border-gold"
      : "border border-rule/40 text-rule hover:text-ink hover:border-rule/80",
  ].join(" ");

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

export function Code({ children }: { children: ReactNode }) {
  return (
    <pre className="overflow-x-auto border border-rule/20 bg-black/25 p-4 text-[11.5px] sm:text-xs leading-relaxed font-mono text-ink/85">
      {children}
    </pre>
  );
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="border border-rule/20 px-5 py-4 text-center">
      <div className="font-mono text-2xl sm:text-3xl text-gold">{value}</div>
      <div className="text-rule text-[11px] tracking-widest uppercase mt-1">{label}</div>
    </div>
  );
}

export function PullQuote({ children }: { children: ReactNode }) {
  return (
    <blockquote className="border-l-2 border-gold/50 pl-5 my-8 text-2xl sm:text-3xl leading-snug text-ink/90">
      {children}
    </blockquote>
  );
}
