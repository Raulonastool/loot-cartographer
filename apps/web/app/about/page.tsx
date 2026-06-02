import type { Metadata } from "next";

import { Code, Cta, Eyebrow, PullQuote, Stat } from "@/components/explainer/bits";
import { Pipeline } from "@/components/explainer/Pipeline";

export const metadata: Metadata = {
  title: "How it works — Loot Cartographer",
  description:
    "A technical love letter to Loot, onchain art, and deterministic worldbuilding: coordinates, orders, terrain, roads, and Waystones, derived from canonical Loot.",
};

const NAV: { id: string; label: string }[] = [
  { id: "thesis", label: "The thesis" },
  { id: "medium", label: "The contract as medium" },
  { id: "canon", label: "Canon in plain sight" },
  { id: "survivor", label: "Two readings" },
  { id: "pipeline", label: "System overview" },
  { id: "oracle", label: "Loot as oracle" },
  { id: "coordinates", label: "Coordinates" },
  { id: "orders", label: "Orders & greatness" },
  { id: "terrain", label: "Terrain" },
  { id: "roads", label: "Roads" },
  { id: "discovery", label: "Discovery & Waystones" },
  { id: "build", label: "Build on it" },
  { id: "close", label: "Carve the stone" },
];

const ORDERS = [
  "Power", "Giants", "Titans", "Skill", "Perfection", "Brilliance", "Enlightenment", "Protection",
  "Anger", "Rage", "Fury", "Vitriol", "the Fox", "Detection", "Reflection", "the Twins",
];

const TERRAIN: { cond: string; result: string; color: string }[] = [
  { cond: "rarityCount ≥ 4", result: "Ruins", color: "bg-terrain-ruins" },
  { cond: "Power · Titans · Skill", result: "Mountains", color: "bg-terrain-mountains" },
  { cond: "Giants · Brilliance", result: "Desert", color: "bg-terrain-desert" },
  { cond: "Anger · Rage · Fury", result: "Wasteland", color: "bg-terrain-wasteland" },
  { cond: "Detection · Enlightenment · Protection", result: "Forest", color: "bg-terrain-forest" },
  { cond: "Vitriol · the Twins", result: "Marsh", color: "bg-terrain-marsh" },
  { cond: "else → coordinate noise + greatness", result: "Coast / Plains / Forest", color: "bg-terrain-coast" },
];

const AFFINITY: { signal: string; weight: string; meaning: string }[] = [
  { signal: "sharedOrder", weight: "× 40", meaning: "Both bags share the same dominant Order — the strongest tie." },
  { signal: "sharedSuffix", weight: "× 8", meaning: "Matching non-zero Orders in the same slots." },
  { signal: "sharedTypes", weight: "× 4", meaning: "Identical item strings per slot (V1: strict equality)." },
  { signal: "rarityResonance", weight: "× 6", meaning: "min(+1 count of each) — shared density of revealed items." },
];

export default function AboutPage() {
  return (
    <div className="bleed border-t border-rule/15">
      <div className="mx-auto max-w-5xl px-6">
        {/* intro */}
        <header className="py-14 sm:py-20 max-w-3xl">
          <Eyebrow>A technical love letter</Eyebrow>
          <h2 className="mt-4 text-4xl sm:text-5xl leading-[1.05] tracking-tight">
            Reading a World Out of the Chain
          </h2>
          <p className="mt-5 text-lg text-ink/85 leading-relaxed">
            Loot, onchain art, and deterministic worldbuilding — and how an 8,000-bag seed from 2021 keeps
            growing. This is both a love letter and a walkthrough. The emotional claim only works if the system
            is real, so the system is laid out in full.
          </p>
          <p className="mt-5 text-2xl text-gold leading-snug">
            Loot Cartographer does not host a map of Loot. It derives one.
          </p>
        </header>

        <div className="lg:grid lg:grid-cols-[180px_1fr] lg:gap-12">
          {/* nav rail */}
          <nav className="hidden lg:block sticky top-10 self-start border-l border-rule/20 pl-4 text-xs font-mono space-y-2.5">
            {NAV.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="block text-rule hover:text-ink transition-colors">
                {s.label}
              </a>
            ))}
          </nav>

          {/* content */}
          <article className="max-w-2xl pb-24 [&_p]:leading-relaxed [&_h3]:scroll-mt-12">
            <Section id="thesis" eyebrow="The thesis" title="The chain is the world">
              <p>
                The frontend is just a window. Deploy this contract against the same Loot address, from any
                account, on any fork, and you get byte-identical coordinates, regions, terrain, and roads. The
                map isn&apos;t hosted — it is a deterministic projection of Loot that was always computable. We
                are simply the first to compute it.
              </p>
            </Section>

            <Section id="medium" eyebrow="Onchain art" title="The contract as medium">
              <p>
                Most NFT art lives <em>near</em> a blockchain: a token points at a file on a server or IPFS, and
                you trust it survives. Onchain art is different in kind. With onchain art the blockchain becomes
                part of the medium — the logic that creates the work lives in the same public environment as
                ownership, history, and state.
              </p>
              <p className="mt-4">
                The Waystones here are not images uploaded anywhere. They are SVGs generated by smart contracts,
                drawn from chain state at the moment you look. No link to break, no host to maintain. Once the
                contract becomes the canvas, art can be deterministic, composable, verifiable, and able to
                remember. Those are technical properties — but they are also artistic ones.
              </p>
            </Section>

            <Section id="canon" eyebrow="Canon hidden in plain sight" title="The 16 Orders">
              <p>
                Loot&apos;s canon flows outward, not down. There is no studio handing out official answers — the
                contract sits at the center as a permanent artifact, and the community builds meaning around it.
                The 16 Orders are the clearest example: they began as item suffixes and the community read them
                as Spirits, affinities, and factions. A suffix became a Spirit; a Spirit became an Order; an
                Order became lore.
              </p>
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-px bg-rule/15 border border-rule/15">
                {ORDERS.map((o, i) => (
                  <div key={o} className="bg-parchment px-3 py-2.5 font-mono text-xs">
                    <span className="text-gold">{String(i + 1).padStart(2, "0")}</span>{" "}
                    <span className="text-ink/85">{o}</span>
                  </div>
                ))}
              </div>
              <p className="mt-6">
                Loot Cartographer treats geography the way earlier builders treated the Orders: it reads the
                source material and makes another layer visible. The map is another act of reading.
              </p>
            </Section>

            <Section id="survivor" eyebrow="Loot was latent" title="Two readings of the same chain">
              <p>
                Greatness is disclosure. Each item carries a 0–20 value; at 15 it reveals an Order suffix, at 19
                a name prefix, at 20 the final <span className="font-mono">+1</span>. The item was always the
                item — higher Greatness lets more of its name appear. Loot Survivor turned that into play, letting
                players push items toward their hidden names. That proved Loot could be read mechanically without
                flattening the magic.
              </p>
              <PullQuote>
                Loot Survivor reads Loot vertically — down into Death Mountain. Loot Cartographer reads it
                horizontally — across the world. One found hidden names. The other finds hidden roads.
              </PullQuote>
            </Section>

            <Section id="pipeline" eyebrow="System overview" title="A small onchain geography engine">
              <p>
                From a computer-science view, Loot Cartographer is a deterministic derivation over canonical
                Loot. Every meaningful world property is either derived from Loot or recorded as a public
                discovery. Four contracts carry it:
              </p>
              <div className="mt-6 space-y-px bg-rule/15 border border-rule/15">
                <Contract name="LootCartographer" role="Derives the geography. Pure view functions, zero stored world state." />
                <Contract name="LootAtlas" role="Records first discoveries — permissionless, first-discoverer-wins." />
                <Contract name="WaystoneRenderer" role="Generates the SVG artifacts, fully onchain." />
                <Contract name="WaystoneNFT" role="Turns discoveries into commemorative onchain tokens." />
              </div>
              <p className="mt-6 text-rule text-sm">
                No game master — the rules are the game master. No offchain database — Loot is the database.
              </p>
              <div className="mt-8">
                <Pipeline />
              </div>
            </Section>

            <Section id="oracle" eyebrow="Interoperability" title="Reading Loot as an oracle">
              <p>
                Loot Cartographer does not copy, mirror, or parse Loot&apos;s metadata. It asks the original
                contract for the only things it needs: ownership and the eight item strings. The read surface is
                intentionally tiny.
              </p>
              <div className="mt-5">
                <Code>{`interface ILoot {
  function ownerOf(uint256 id) external view returns (address);
  function getWeapon(uint256 id) external view returns (string memory);
  function getChest (uint256 id) external view returns (string memory);
  // … head, waist, foot, hand, neck, ring
}`}</Code>
              </div>
              <p className="mt-5">
                It stores the Loot address as immutable and reads the live strings on demand. Same contract,
                same Loot address, same world — which keeps the project honest. The frontend can make the world
                easier to explore, but it is not the world.
              </p>
            </Section>

            <Section id="coordinates" eyebrow="The math" title="Coordinates — one hash, two axes">
              <p>
                Every bag gets a fixed point on a 10001 × 10001 grid. The derivation starts from a single hash
                of the bag id <em>and</em> all eight item strings — so a bag&apos;s location is a fingerprint of
                what it carries. Gear determines geography.
              </p>
              <div className="mt-5">
                <Code>{`bytes32 seed = keccak256(abi.encode(bagId, weapon, … , ring));

x = int256(uint128(seed)        % 10001) - 5000;  // low  128 bits
y = int256(uint128(seed >> 128) % 10001) - 5000;  // high 128 bits`}</Code>
              </div>
              <p className="mt-5">
                One keccak, two independent axes. The modulo bias of a 128-bit number onto a 10001-wide axis is
                negligible, so the grid is uniform without rejection sampling. Distance is Manhattan —
                integer-only, cheap, and it gives the Voronoi regions their diamond shape.
              </p>
            </Section>

            <Section id="orders" eyebrow="Reading lore out of strings" title="Orders, greatness & rarity">
              <p>
                Loot only hands you strings, so interop is string parsing. <span className="font-mono">Orders.sol</span>{" "}
                strips a trailing <span className="font-mono">+1</span> and matches the 16 canonical suffixes into
                an Order id. The dominant Order is a slot-priority majority across the eight slots — the weapon
                speaks first. Greatness is re-derived from Loot&apos;s own hidden{" "}
                <span className="font-mono">pluck()</span> logic and summed to <span className="font-mono">[0,160]</span>.
                Rarity counts the fully-revealed <span className="font-mono">+1</span> items. This is onchain
                archaeology: porting Loot&apos;s own machinery rather than inventing a score.
              </p>
            </Section>

            <Section id="terrain" eyebrow="Identity meets place" title="Terrain — a priority cascade">
              <p>
                Terrain is not purely random or purely authored. It comes from a mix of identity and place — a
                bag&apos;s rarity, dominant Order, and total Greatness, then coordinate-seeded noise as a fallback.
              </p>
              <div className="mt-6 border border-rule/15 divide-y divide-rule/15">
                {TERRAIN.map((t) => (
                  <div key={t.cond} className="flex items-center gap-4 px-4 py-3">
                    <span className={`h-3 w-3 shrink-0 ${t.color}`} />
                    <span className="font-mono text-xs text-rule flex-1">{t.cond}</span>
                    <span className="text-sm tracking-wide text-ink/90 text-right">{t.result}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="roads" eyebrow="The physics of the world" title="Roads — kinship vs. distance">
              <p>
                Two bags connect when their kinship overcomes the distance between them. Affinity pulls together;
                Manhattan distance pushes apart. A close pair with weak kinship can still fail; a distant pair
                with strong shared identity can still connect. That is what makes the map a world instead of a
                scatter plot.
              </p>
              <div className="mt-6 border border-rule/15 divide-y divide-rule/15">
                {AFFINITY.map((a) => (
                  <div key={a.signal} className="flex items-baseline gap-4 px-4 py-3">
                    <span className="font-mono text-sm text-ink w-32 shrink-0">{a.signal}</span>
                    <span className="font-mono text-sm text-gold w-12 shrink-0">{a.weight}</span>
                    <span className="text-sm text-rule">{a.meaning}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Code>{`score = affinity * 100 - distance / 20;
exists = score >= 5300;
cost   = distance + (10000 - affinity * 70) / 10;`}</Code>
              </div>
              <p className="mt-6">
                The threshold isn&apos;t a vibe. It was calibrated against a 100,000-pair sample of real mainnet
                Loot bags — the score distribution is bimodal, so the bar sits high to stay selective.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3">
                <Stat value="5300" label="Road threshold" />
                <Stat value="~10.4" label="Roads per bag" />
                <Stat value="~41.6k" label="Roads, all 8,000" />
              </div>
            </Section>

            <Section id="discovery" eyebrow="The only state" title="Discovery becomes artifact">
              <p>
                The geography already exists. All 8,000 bags already have coordinates, regions, terrain; every
                possible road already exists or doesn&apos;t. Nothing is generated. The only thing that changes is{" "}
                <span className="text-gold">discovery</span> — who charted a road or route first. A cartographer
                doesn&apos;t create the mountain; they map it.
              </p>
              <p className="mt-4">
                When a road or route is discovered, the discoverer can mint a Waystone. The contract checks the
                discovery exists, that you recorded it, and that it isn&apos;t already minted — then the
                <span className="font-mono"> tokenURI</span> returns a fully onchain{" "}
                <span className="font-mono">data:application/json;base64</span> with the SVG embedded inside. A
                discovery becomes a registry entry; the entry becomes a mint right; the mint becomes an artifact.
              </p>
              <p className="mt-4 text-rule">
                The Waystones are carved markers, not PFPs — stone outlines, sigil grids, glyph primitives,
                inscriptions. They show the trace the adventurer left behind, not the adventurer.
              </p>
              <div className="mt-6">
                <Cta href="/waystones" variant="ghost">
                  See the Waystone art & how it&apos;s derived →
                </Cta>
              </div>
            </Section>

            <Section id="build" eyebrow="An open world" title="Build on it">
              <p>
                V1 is deliberately simple where it counts, with the seams left obvious. The highest-leverage one
                is base-item parsing: today a road&apos;s <span className="font-mono">sharedTypes</span> signal
                uses strict string equality, so <span className="font-mono">Katana</span> doesn&apos;t yet match{" "}
                <span className="font-mono">Katana of Power</span>. Parse the base item and road kinship gets far
                richer — and far more Loot-native. The affinity weights, terrain rules, region capitals, and
                renderer glyphs are all open too. When a project is fully onchain, every seam becomes an
                invitation.
              </p>
              <p className="mt-4 text-rule text-sm">
                The repo&apos;s deep-dive carries the full derivation with{" "}
                <span className="font-mono">file:line</span> references and recalibration steps.
              </p>
              <div className="mt-6">
                <Cta
                  href="https://github.com/Raulonastool/loot-cartographer/blob/main/docs/how-the-world-is-made.md"
                  variant="ghost"
                  external
                >
                  Read the source deep-dive →
                </Cta>
              </div>
            </Section>

            <Section id="close" eyebrow="Conclusion" title="Carve the stone">
              <p>
                Loot Survivor found hidden names. Loot Cartographer finds hidden roads. Both come from the same
                belief: Loot was not empty, it was latent. The original contract gave us artifacts; Greatness gave
                them deeper names; Orders gave them spiritual gravity. Loot Cartographer gives them place.
              </p>
              <PullQuote>
                You are not just looking at a map. You are standing at the edge of a world that was hidden in
                plain sight. Pick two bags. Find the road. Carve the stone.
              </PullQuote>
              <div className="mt-8 flex flex-wrap gap-3">
                <Cta href="/atlas">Open the atlas →</Cta>
                <Cta href="/" variant="ghost">
                  Back to the start
                </Cta>
              </div>
            </Section>
          </article>
        </div>
      </div>
    </div>
  );
}

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-9 border-b border-rule/12 last:border-0">
      <h3 id={id} className="scroll-mt-12">
        <span className="block">
          <Eyebrow>{eyebrow}</Eyebrow>
        </span>
        <span className="mt-3 block text-2xl sm:text-3xl tracking-tight">{title}</span>
      </h3>
      <div className="mt-5 text-ink/85">{children}</div>
    </section>
  );
}

function Contract({ name, role }: { name: string; role: string }) {
  return (
    <div className="bg-parchment px-4 py-3">
      <div className="font-mono text-sm text-gold">{name}</div>
      <div className="text-rule text-sm mt-0.5">{role}</div>
    </div>
  );
}
