import { BagView } from "@/components/BagView";

export default async function BagPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bagId = BigInt(id);

  return (
    <main className="space-y-8">
      <section>
        <p className="text-rule text-sm tracking-widest uppercase">Bag</p>
        <h2 className="text-3xl tracking-wider">#{id}</h2>
      </section>

      <BagView bagId={bagId} />
    </main>
  );
}
