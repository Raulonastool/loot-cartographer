const STEPS: { label: string; detail: string }[] = [
  { label: "Loot item strings", detail: "Eight equipment slots, read live from canonical Loot" },
  { label: "Bag fingerprint", detail: "keccak256(bagId, weapon, chest, … ring)" },
  { label: "Coordinates", detail: "One hash, two axes → a fixed (x, y)" },
  { label: "Region + terrain", detail: "Sorted into the nearest of 32 regions; land shaped by what it carries" },
  { label: "Road affinity", detail: "Shared traits vs. distance decide what connects" },
  { label: "Discovery graph", detail: "The map already exists — being first is the act" },
  { label: "Waystone", detail: "A discovery, carved into a fully onchain artifact" },
];

export function Pipeline() {
  return (
    <ol className="relative">
      {STEPS.map((step, i) => {
        const last = i === STEPS.length - 1;
        return (
          <li key={step.label} className="relative flex gap-5 pb-7 last:pb-0">
            {/* rail */}
            {!last && (
              <span
                className="absolute left-[15px] top-8 bottom-0 w-px bg-rule/25"
                aria-hidden="true"
              />
            )}
            {/* node */}
            <span
              className={[
                "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center border font-mono text-xs",
                last ? "border-gold/70 text-gold" : "border-rule/40 text-rule",
              ].join(" ")}
            >
              {i + 1}
            </span>
            <div className="pt-1">
              <div
                className={[
                  "text-base sm:text-lg tracking-wide",
                  last ? "text-gold" : "text-ink",
                ].join(" ")}
              >
                {step.label}
              </div>
              <div className="text-rule text-sm font-mono mt-0.5">{step.detail}</div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
