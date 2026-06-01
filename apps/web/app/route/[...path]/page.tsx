import { notFound } from "next/navigation";

import { RouteView } from "@/components/RouteView";

const BAG_ID = /^\d+$/;

export default async function RoutePage({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const { path } = await params;
  if (path.length < 2 || !path.every((seg) => BAG_ID.test(seg))) notFound();

  return (
    <main className="space-y-8">
      <section>
        <p className="text-rule text-sm tracking-widest uppercase">Route</p>
        <h2 className="text-3xl tracking-wider font-mono">
          {path.map((seg, i) => (
            <span key={i}>
              {i > 0 && <span className="text-rule"> → </span>}#{seg}
            </span>
          ))}
        </h2>
      </section>

      <RouteView path={path.map((seg) => BigInt(seg))} />
    </main>
  );
}
