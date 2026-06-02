import type { Metadata } from "next";

import { Cta, Eyebrow } from "@/components/explainer/bits";
import { KeyStrip } from "@/components/explainer/KeyStrip";
import { Runes } from "@/components/explainer/Runes";

export const metadata: Metadata = {
  title: "Waystones — Loot Cartographer",
  description:
    "Every discovery, carved in stone. Waystones are fully onchain SVGs derived from the discovery key — a unique silhouette, sigil grid, and inscription per road or route.",
};

const GALLERY: { src: string; label: string; kind: string }[] = [
  { src: "/waystones/road-1-7.svg", label: "#1 → #7", kind: "road" },
  { src: "/waystones/road-42-1337.svg", label: "#42 → #1337", kind: "road" },
  { src: "/waystones/route-1-2-7.svg", label: "#1 · 3 stops · #7", kind: "route" },
  { src: "/waystones/road-3-4.svg", label: "#3 → #4", kind: "road" },
  { src: "/waystones/road-100-2500.svg", label: "#100 → #2500", kind: "road" },
  { src: "/waystones/route-10-250-4000-8000.svg", label: "#10 · 4 stops · #8000", kind: "route" },
  { src: "/waystones/road-2-7.svg", label: "#2 → #7", kind: "road" },
  { src: "/waystones/road-777-8000.svg", label: "#777 → #8000", kind: "road" },
];

// Authentic key for road #1→#2: keccak256(abi.encode("ROAD", 1, 2)).
const ROAD_1_2_KEY = "0x0baa43b5b0639a41d2c8eebaa468c23141e6817b036eafdffcc6529da995be0d";

export default function WaystonesPage() {
  return (
    <main>
      {/* ───────────── hero ───────────── */}
      <section className="bleed vignette border-y border-rule/15">
        <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20 grid gap-10 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <Eyebrow>Waystone (for Adventurers)</Eyebrow>
            <h2 className="mt-4 text-4xl sm:text-5xl leading-[1.05] tracking-tight">
              Every discovery,
              <br />
              carved in stone.
            </h2>
            <p className="mt-5 text-lg text-ink/85 leading-relaxed max-w-md">
              A Waystone is a fully onchain SVG — drawn by the contract from the discovery itself. No two are
              alike: the key carves a unique silhouette, a sigil of runes, and the inscription that names it.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Cta href="/atlas">Find a road →</Cta>
              <Cta href="/about" variant="ghost">
                How the world works
              </Cta>
            </div>
          </div>
          <Stone src="/waystones/road-1-2.svg" label="#1 → #2" className="w-44 sm:w-52 mx-auto" />
        </div>
      </section>

      {/* ───────────── gallery ───────────── */}
      <section className="mx-auto max-w-4xl py-16 sm:py-20">
        <Eyebrow>The gallery</Eyebrow>
        <h3 className="mt-4 text-3xl sm:text-4xl leading-tight">No two stones alike</h3>
        <p className="mt-4 text-rule leading-relaxed max-w-xl">
          Each of these is the literal output of <span className="font-mono text-ink/80">renderRoad</span> /{" "}
          <span className="font-mono text-ink/80">renderRoute</span> — pure functions, rendered straight from
          the contract. A different discovery means a different key, and a different key means a different stone.
        </p>
        <div className="mt-9 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
          {GALLERY.map((g) => (
            <Stone key={g.src} src={g.src} label={g.label} kind={g.kind} />
          ))}
        </div>
      </section>

      {/* ───────────── how it's derived ───────────── */}
      <section className="bleed border-y border-rule/15 bg-black/15">
        <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
          <Eyebrow>How it&apos;s derived</Eyebrow>
          <h3 className="mt-4 text-3xl sm:text-4xl leading-tight">From one key, a whole stone</h3>
          <p className="mt-4 text-rule leading-relaxed max-w-2xl">
            The seed is the discovery itself:{" "}
            <span className="font-mono text-ink/80">key = keccak256(&quot;ROAD&quot;, lo, hi)</span>. Every visual
            choice reads from that key&apos;s bytes — so the art is a pure, deterministic function of what was
            found. Here is the real stone for road{" "}
            <span className="font-mono text-ink/80">#1 → #2</span>, taken apart.
          </p>

          <div className="mt-9 grid gap-10 lg:grid-cols-[auto_1fr] lg:items-start">
            <Stone src="/waystones/road-1-2.svg" label="#1 → #2" className="w-52 mx-auto lg:mx-0" />

            <div className="space-y-7">
              <div>
                <div className="text-rule text-xs tracking-widest uppercase mb-3">The 32-byte key</div>
                <KeyStrip hex={ROAD_1_2_KEY} />
              </div>

              <Derivation
                n="bytes 0–15"
                title="The silhouette"
                detail="An 8-vertex octagon (center 100,130, radius 80). Each vertex is nudged ±5px by two key bytes, so every stone has its own irregular, hand-cut outline."
              />
              <Derivation
                n="bytes 16–24"
                title="The sigil grid"
                detail="A 3×3 grid of cells. Each cell reads one byte: under 64 (~25%) it stays empty, otherwise byte mod 8 selects one of eight carved runes."
              />
              <Derivation
                n="text"
                title="The inscription"
                detail="The discovery, named in plain serif beneath the stone — “1 → 2” for a road, “first / N stops / last” for a route — over a single base rule."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── the runes ───────────── */}
      <section className="mx-auto max-w-3xl py-16 sm:py-20">
        <Eyebrow>The vocabulary</Eyebrow>
        <h3 className="mt-4 text-3xl sm:text-4xl leading-tight">Eight carved runes</h3>
        <p className="mt-4 text-rule leading-relaxed max-w-xl">
          The sigil grid draws from a fixed set of eight minimal strokes — designed to read as carved marks, not
          icons. They are constants in <span className="font-mono text-ink/80">Glyphs.sol</span>, normalized to a
          20×20 cell.
        </p>
        <div className="mt-8">
          <Runes />
        </div>
      </section>

      {/* ───────────── fully onchain ───────────── */}
      <section className="bleed border-t border-rule/15 vignette">
        <div className="mx-auto max-w-2xl px-6 py-16 sm:py-24 text-center">
          <Eyebrow>Owned forever</Eyebrow>
          <h3 className="mt-4 text-3xl sm:text-4xl leading-tight">
            The stone carries its own proof.
          </h3>
          <p className="mt-5 text-lg text-ink/85 leading-relaxed">
            The Waystone&apos;s <span className="font-mono">tokenURI</span> is a fully onchain{" "}
            <span className="font-mono">data:application/json</span> with the SVG embedded as{" "}
            <span className="font-mono">data:image/svg+xml</span>. No server, no IPFS, no host. It renders as long
            as the contract is readable on Ethereum.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Cta href="/atlas">Explore the atlas →</Cta>
            <Cta href="/about" variant="ghost">
              Read the full story
            </Cta>
          </div>
        </div>
      </section>
    </main>
  );
}

function Stone({
  src,
  label,
  kind,
  className = "",
}: {
  src: string;
  label: string;
  kind?: string;
  className?: string;
}) {
  return (
    <figure className={className}>
      <div className="border border-rule/30 bg-black/30">
        {/* eslint-disable-next-line @next/next/no-img-element -- static onchain SVG, no optimization needed */}
        <img src={src} alt={`Waystone for ${label}`} className="w-full block" />
      </div>
      <figcaption className="mt-2 flex items-center justify-between gap-2">
        <span className="font-mono text-xs text-ink/80">{label}</span>
        {kind && <span className="text-rule text-[10px] tracking-widest uppercase">{kind}</span>}
      </figcaption>
    </figure>
  );
}

function Derivation({ n, title, detail }: { n: string; title: string; detail: string }) {
  return (
    <div className="flex gap-4">
      <span className="font-mono text-xs text-gold pt-1 w-20 shrink-0">{n}</span>
      <div>
        <div className="text-lg tracking-wide">{title}</div>
        <div className="text-rule text-sm mt-1 leading-relaxed">{detail}</div>
      </div>
    </div>
  );
}
