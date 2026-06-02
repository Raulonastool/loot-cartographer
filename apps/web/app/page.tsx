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
            Loot has a map.
            <br />
            <span className="text-gold">We computed it.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-ink/85 leading-relaxed">
            Loot told us what each adventurer carried. We worked out the part it left blank —{" "}
            <span className="text-gold italic">where was the bag found?</span>
          </p>
          <p className="mx-auto mt-4 max-w-xl text-rule text-sm sm:text-base leading-relaxed">
            Nothing here is hosted. The map isn&apos;t stored on a server — it&apos;s calculated straight
            from the original Loot contract, the same way every time.
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
          It launched in 2021 as 8,000 bags of plain white text on black — a Katana, a Divine Robe, a Demon
          Crown. No art, no game, no map, no lore. Just names. It looked almost too simple. But it was all
          there in the contract; people just had to read it. Loot wasn&apos;t empty — it was a world nobody
          had worked out yet.
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
            Same contract, read two different ways. Nobody changed Loot —{" "}
            <span className="text-gold">they just kept finding more in it.</span>
          </p>
        </div>
      </section>

      {/* ───────────── the pipeline ───────────── */}
      <section className="mx-auto max-w-3xl py-16 sm:py-20">
        <Eyebrow>How a bag becomes a place</Eyebrow>
        <h3 className="mt-4 text-3xl sm:text-4xl leading-tight">From a bag to a place</h3>
        <p className="mt-4 text-rule leading-relaxed">
          Each bag&apos;s spot in the world gets worked out step by step from what it carries. Same Loot in,
          same map out — anyone can run the numbers and land on the exact same answer.
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
              <Loop n="01" label="Find a road" detail="Two bags with enough in common to be linked across the distance between them." />
              <Loop n="02" label="Record the discovery" detail="Anyone can do it — the first to chart a road owns that find for good." />
              <Loop n="03" label="Carve the Waystone" detail="Mint a carved stone for the discovery — fully onchain, and only by the one who made it." />
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
          No server. No host to maintain. The renderer isn&apos;t fetching a picture — it&apos;s computing one,
          and it keeps rendering as long as the contract is readable on Ethereum.
        </p>
        <p className="mt-3 text-rule text-sm leading-relaxed">
          (The carved-stone art on display today is a placeholder — how a Waystone is derived is settled, but
          the final look is still being designed.)
        </p>

        <div className="mt-6">
          <Cta href="/waystones">See the Waystones →</Cta>
        </div>

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
