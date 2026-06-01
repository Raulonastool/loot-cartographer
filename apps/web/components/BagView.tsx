"use client";

import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";

import { cartographerAbi, loadAnvilAddresses, type DeploymentAddresses } from "@/lib/contracts";
import { DEFAULT_CHAIN_ID } from "@/lib/wagmi";

export function BagView({ bagId }: { bagId: bigint }) {
  const [addrs, setAddrs] = useState<DeploymentAddresses | null>(null);
  const [loadingAddrs, setLoadingAddrs] = useState(true);

  useEffect(() => {
    loadAnvilAddresses()
      .then(setAddrs)
      .finally(() => setLoadingAddrs(false));
  }, []);

  if (loadingAddrs) return <p className="text-rule italic">consulting the atlas…</p>;

  if (!addrs) {
    return (
      <div className="space-y-2 border border-rule/30 p-4 text-sm">
        <p className="text-rule">No deployment addresses found.</p>
        <p>
          Start <span className="font-mono">anvil</span>, then in <span className="font-mono">contracts/</span>:
        </p>
        <pre className="font-mono text-xs bg-black/30 p-3 overflow-x-auto">
forge script script/SeedAnvil.s.sol --rpc-url http://localhost:8545 --broadcast
        </pre>
      </div>
    );
  }

  return <BagViewWithAddrs bagId={bagId} addrs={addrs} />;
}

function BagViewWithAddrs({ bagId, addrs }: { bagId: bigint; addrs: DeploymentAddresses }) {
  const locate = useReadContract({
    address: addrs.cartographer,
    abi: cartographerAbi,
    functionName: "locate",
    args: [bagId],
    chainId: DEFAULT_CHAIN_ID,
  });

  const region = useReadContract({
    address: addrs.cartographer,
    abi: cartographerAbi,
    functionName: "regionOf",
    args: [bagId],
    chainId: DEFAULT_CHAIN_ID,
  });

  const terrain = useReadContract({
    address: addrs.cartographer,
    abi: cartographerAbi,
    functionName: "terrainOf",
    args: [bagId],
    chainId: DEFAULT_CHAIN_ID,
  });

  if (locate.isLoading) return <p className="text-rule italic">locating…</p>;
  if (locate.error) return <Error message={locate.error.message} />;
  if (!locate.data) return <p className="text-rule">no data</p>;

  const [x, y] = locate.data;

  return (
    <div className="space-y-6">
      <Row label="Coordinates" value={`(${x.toString()}, ${y.toString()})`} />
      {region.data && <Row label="Region" value={region.data.name} />}
      {terrain.data && <Row label="Terrain" value={terrain.data[1]} />}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-rule/20 pb-2">
      <span className="text-rule text-xs tracking-widest uppercase">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}

function Error({ message }: { message: string }) {
  return (
    <div className="border border-red-900/40 p-4 text-sm text-red-300">
      <p className="font-mono break-all">{message}</p>
    </div>
  );
}
