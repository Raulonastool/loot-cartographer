import { notFound } from "next/navigation";

import { RoadView } from "@/components/RoadView";

const BAG_ID = /^\d+$/;

export default async function RoadPage({
  params,
}: {
  params: Promise<{ a: string; b: string }>;
}) {
  const { a, b } = await params;
  if (!BAG_ID.test(a) || !BAG_ID.test(b)) notFound();
  return (
    <main className="space-y-8">
      <section>
        <p className="text-rule text-sm tracking-widest uppercase">Road</p>
        <h2 className="text-3xl tracking-wider font-mono">
          #{a} <span className="text-rule">→</span> #{b}
        </h2>
      </section>

      <RoadView bagA={BigInt(a)} bagB={BigInt(b)} />
    </main>
  );
}
