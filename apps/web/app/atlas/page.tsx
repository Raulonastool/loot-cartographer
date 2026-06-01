import { ActivityFeed } from "@/components/ActivityFeed";
import { WorldMap } from "@/components/WorldMap";

export default function AtlasPage() {
  return (
    <main className="space-y-4">
      <section>
        <p className="text-rule text-sm tracking-widest uppercase">The Atlas</p>
        <h2 className="text-3xl tracking-wider">All 8,000 bags</h2>
      </section>

      <WorldMap />

      <p className="text-rule text-xs italic">
        scroll to zoom · drag to pan · click a point to inspect · search to jump
      </p>

      <span className="rule" />

      <ActivityFeed />
    </main>
  );
}
