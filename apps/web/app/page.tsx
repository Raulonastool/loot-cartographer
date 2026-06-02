import { Cta, Eyebrow } from "@/components/explainer/bits";
import { MapField } from "@/components/explainer/MapField";
import { Pipeline } from "@/components/explainer/Pipeline";
import { WaystoneGlyph } from "@/components/explainer/WaystoneGlyph";

const ITEMS = ["Katana", "Divine Robe", "Demon Crown", "Warhammer of Power", "Gold Ring"];

export default function HomePage() {
  return (
    <main>
      {/* ───────────── hero ───────────── */}
      <section className="bleed relative overflow-hidden vignette map-grid border-y border-rule/15">
        <MapField className="absolute inset-0 h-full w-full opacity-[0.5]" />
        <div className="relative mx-auto max-w-4xl px-6 py-20 sm:py-28 text-center rise">
          <Eyebrow>Waystone (for Adventurers)</Eyebrow>
          <h2 className="mt-5 text-4xl sm:text-6xl leading-[1.05] tracking-tight">
            Reading a World
            <br />
            Out of the Chain
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-ink/85 leading-relaxed">
            Loot told us what each adventurer carried. Loot Cartographer asks a different question —{" "}
            <span className="text-gold italic">where was the bag found?</span>
          </p>
          <p className="mx-auto mt-4 max-w-xl text-rule text-sm sm:text-base leading-relaxed">
            A world derived from Loot, not hosted. The chain is the source of truth; the map is a
            deterministic projection of it.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Cta href="/atlas">Explore the atlas →</Cta>
            <Cta href="/about" variant="ghost">
              Read the full story
            </Cta>
          </div>
        </div>
      </section>

      {/* ───────────── the seed ───────────── */}
      <section className="mx-auto max-w-2xl py-16 sm:py-20">
        <Eyebrow>The seed</Eyebrow>
        <h3 className="mt-4 text-3xl sm:text-4xl leading-tight">
          Loot didn&apos;t ship a game.
          <br />
          It shipped a seed.
        </h3>
        <p className="mt-5 text-lg leading-relaxed text-ink/85">
          It arrived as 8,000 bags of white text on black. No art, no client, no map, no lore bible —
          just names. It looked almost too simple. But the more people read the contract, the clearer it
          became: Loot was never empty. It was compressed possibility, a fantasy world folded into a smart
          contract.
        </p>
        <div className="mt-7 flex flex-wrap gap-2">
          {ITEMS.map((item) => (
            <span
              key={item}
              className="border border-rule/30 px-3 py-1.5 font-mono text-xs text-rule"
            >
              {item}
            </span>
          ))}
        </div>
        <p className="mt-7 text-rule italic text-lg">
          Five years later, people are still finding new things buried inside it.
        </p>
      </section>

      {/* ───────────── two readings ───────────── */}
      <section className="bleed border-y border-rule/15 bg-black/15">
        <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
          <div className="text-center">
            <Eyebrow>Two readings of the same chain</Eyebrow>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <Reading
              dir="↓"
              who="Loot Survivor"
              axis="reads Loot vertically"
              body="Down into Death Mountain — floors, beasts, risk, and the hidden names that items reveal as they grow in Greatness."
              found="found hidden names"
            />
            <Reading
              dir="→"
              who="Loot Cartographer"
              axis="reads Loot horizontally"
              body="Across the world — coordinates, regions, terrain, kinship, and the roads that connect one bag to another."
              found="finds hidden roads"
            />
          </div>
          <p className="mt-8 text-center text-xl sm:text-2xl text-ink/90">
            Both are acts of reading the chain. The original contract stays the same;{" "}
            <span className="text-gold">the world keeps getting bigger.</span>
          </p>
        </div>
      </section>

      {/* ───────────── the pipeline ───────────── */}
      <section className="mx-auto max-w-3xl py-16 sm:py-20">
        <Eyebrow>How a bag becomes a place</Eyebrow>
        <h3 className="mt-4 text-3xl sm:text-4xl leading-tight">A deterministic derivation</h3>
        <p className="mt-4 text-rule leading-relaxed">
          Every layer stays close to the source material. Same Loot in, same world out — inspectable and
          reproducible by anyone, with no private backend deciding what is true.
        </p>
        <div className="mt-9">
          <Pipeline />
        </div>
      </section>

      {/* ───────────── the loop ───────────── */}
      <section className="bleed border-y border-rule/15">
        <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20 grid gap-10 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <Eyebrow>The cartographer&apos;s loop</Eyebrow>
            <h3 className="mt-4 text-3xl sm:text-4xl">Find. Record. Carve.</h3>
            <ol className="mt-7 space-y-5">
              <Loop n="01" label="Find a road" detail="Two bags whose kinship overcomes the distance between them." />
              <Loop n="02" label="Record the discovery" detail="Permissionless and first-discoverer-wins, written to LootAtlas." />
              <Loop n="03" label="Carve the Waystone" detail="Mint a fully onchain artifact — gated to the discoverer." />
            </ol>
          </div>
          <WaystoneGlyph className="mx-auto w-36 sm:w-44 text-ink" />
        </div>
      </section>

      {/* ───────────── fully onchain + mint teaser ───────────── */}
      <section className="mx-auto max-w-2xl py-16 sm:py-20">
        <Eyebrow>Onchain art, not a link to one</Eyebrow>
        <h3 className="mt-4 text-3xl sm:text-4xl leading-tight">The art is computed, not stored.</h3>
        <p className="mt-5 text-lg leading-relaxed text-ink/85">
          A Waystone is an SVG generated by a smart contract, drawn from chain state at the moment you look.
          No server. No IPFS. No host to maintain. The renderer isn&apos;t fetching a picture — it&apos;s
          computing one. The art renders as long as the contracts remain readable on Ethereum.
        </p>

        <div className="mt-9 border border-gold/40 vignette">
          <div className="px-6 py-7">
            <div className="flex items-center justify-between gap-4">
              <Eyebrow>Waystones · minting soon</Eyebrow>
              <div className="flex gap-2 font-mono text-[11px] tracking-widest uppercase">
                <span className="border border-rule/40 px-2.5 py-1 text-rule">Date TBA</span>
                <span className="border border-rule/40 px-2.5 py-1 text-rule">Ethereum L1</span>
              </div>
            </div>
            <p className="mt-4 text-ink/85 leading-relaxed">
              The world is live now. Discoveries are being charted onchain today — the commemorative mint is
              on its way. Explore first; carve when it opens.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Cta href="/atlas">Explore the atlas →</Cta>
              <Cta href="/about" variant="ghost">
                Read the docs
              </Cta>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── closing ───────────── */}
      <section className="bleed border-t border-rule/15 vignette">
        <div className="mx-auto max-w-3xl px-6 py-20 sm:py-28 text-center">
          <h3 className="text-4xl sm:text-6xl leading-[1.05] tracking-tight">
            Pick two bags.
            <br />
            Find the road.
            <br />
            <span className="text-gold">Carve the stone.</span>
          </h3>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Cta href="/atlas">Open the atlas →</Cta>
            <Cta href="/about" variant="ghost">
              Read the full story
            </Cta>
          </div>
          <p className="mt-12 text-rule text-xs tracking-widest uppercase">
            A world hidden in plain sight, since 2021
          </p>
        </div>
      </section>
    </main>
  );
}

function Reading({
  dir,
  who,
  axis,
  body,
  found,
}: {
  dir: string;
  who: string;
  axis: string;
  body: string;
  found: string;
}) {
  return (
    <div className="border border-rule/25 p-6 h-full flex flex-col">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-3xl text-gold leading-none">{dir}</span>
        <div>
          <div className="text-xl tracking-wide">{who}</div>
          <div className="text-rule text-sm font-mono">{axis}</div>
        </div>
      </div>
      <p className="mt-4 text-ink/80 leading-relaxed flex-1">{body}</p>
      <p className="mt-4 text-gold text-sm tracking-widest uppercase">{found}</p>
    </div>
  );
}

function Loop({ n, label, detail }: { n: string; label: string; detail: string }) {
  return (
    <li className="flex gap-4">
      <span className="font-mono text-gold text-sm pt-1">{n}</span>
      <div>
        <div className="text-lg tracking-wide">{label}</div>
        <div className="text-rule text-sm mt-0.5 leading-relaxed">{detail}</div>
      </div>
    </li>
  );
}
