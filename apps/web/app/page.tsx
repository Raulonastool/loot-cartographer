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
        <p>
          Enter a bag id to locate it.{" "}
          <Link href="/bag/1" className="underline decoration-rule/40 hover:decoration-ink">
            Try bag #1
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
