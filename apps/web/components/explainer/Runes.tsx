// The eight glyph primitives, reproduced verbatim from contracts/src/libraries/Glyphs.sol.
// Each path is normalized to a 20x20 cell; the renderer translates them into the sigil grid.
const RUNES: { name: string; d: string }[] = [
  { name: "Saltire", d: "M2 2L18 18M18 2L2 18" },
  { name: "Cross", d: "M10 2V18M2 10H18" },
  { name: "Diamond", d: "M10 2L18 10L10 18L2 10Z" },
  { name: "Peak", d: "M2 14L10 2L18 14" },
  { name: "Double rule", d: "M2 6L18 6M2 14L18 14" },
  { name: "Long cross", d: "M2 10H18M10 4V16" },
  { name: "Triangle", d: "M4 4L16 4L10 16Z" },
  { name: "Ring", d: "M4 10A6 6 0 1 1 16 10A6 6 0 1 1 4 10Z" },
];

export function Runes() {
  return (
    <div className="grid grid-cols-4 gap-px bg-rule/15 border border-rule/15">
      {RUNES.map((r, i) => (
        <figure key={r.name} className="bg-parchment flex flex-col items-center gap-2 px-3 py-5">
          <svg viewBox="0 0 20 20" className="h-9 w-9">
            <path d={r.d} fill="none" stroke="#e8ddb5" strokeWidth="1.2" />
          </svg>
          <figcaption className="text-center">
            <div className="font-mono text-[10px] text-gold">{String(i).padStart(2, "0")}</div>
            <div className="text-rule text-xs tracking-wide">{r.name}</div>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
