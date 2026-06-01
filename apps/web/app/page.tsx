import Link from "next/link";

export default function HomePage() {
  return (
    <main className="space-y-8">
      <section className="space-y-3">
        <p className="leading-relaxed">
          Loot told us what each adventurer carried. Loot Cartographer answers a different question:
          where was the bag found?
        </p>
        <p className="text-rule text-sm">
          Every bag is a fixed point in a deterministic world generated entirely from the canonical Loot smart
          contract. Locations, regions, terrain, and roads are derived onchain. The frontend is only a viewer.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl tracking-widest uppercase text-rule">Begin</h2>
        <ul className="space-y-2">
          <li>
            <Link href="/atlas" className="underline decoration-rule/40 hover:decoration-ink">
              Open the atlas
            </Link>
            <span className="text-rule"> — see all 8,000 bags plotted across the world.</span>
          </li>
          <li>
            <Link href="/bag/1" className="underline decoration-rule/40 hover:decoration-ink">
              Inspect bag #1
            </Link>
            <span className="text-rule"> — coordinates, region, terrain.</span>
          </li>
        </ul>
      </section>
    </main>
  );
}
