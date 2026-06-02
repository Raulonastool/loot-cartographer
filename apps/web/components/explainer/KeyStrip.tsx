// Renders a 32-byte discovery key, colored by the role each byte plays in the render:
// bytes 0–15 perturb the stone silhouette, bytes 16–24 fill the 3×3 sigil grid.
export function KeyStrip({ hex }: { hex: string }) {
  const clean = hex.replace(/^0x/, "");
  const bytes = clean.match(/.{2}/g) ?? [];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1 font-mono text-[11px]">
        {bytes.map((b, i) => {
          const role = i < 16 ? "silhouette" : i < 25 ? "sigil" : "unused";
          const cls =
            role === "silhouette"
              ? "text-gold border-gold/40"
              : role === "sigil"
                ? "text-ink border-ink/30"
                : "text-rule/50 border-rule/15";
          return (
            <span key={i} className={`border px-1 py-0.5 ${cls}`} title={`byte ${i} · ${role}`}>
              {b}
            </span>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-[11px] tracking-widest uppercase">
        <Legend swatch="bg-gold" label="0–15 · silhouette" />
        <Legend swatch="bg-ink" label="16–24 · sigil grid" />
        <Legend swatch="bg-rule/40" label="25–31 · unused" />
      </div>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="flex items-center gap-2 text-rule">
      <span className={`h-2.5 w-2.5 ${swatch}`} />
      {label}
    </span>
  );
}
