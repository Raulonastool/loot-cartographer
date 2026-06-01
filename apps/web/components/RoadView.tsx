"use client";

import { atlasAbi, cartographerAbi } from "@loot-cartographer/shared";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAccount, useReadContract } from "wagmi";

import { loadAnvilAddresses, type DeploymentAddresses } from "@/lib/contracts";
import { useTxButton } from "@/lib/useTxButton";
import { DEFAULT_CHAIN_ID } from "@/lib/wagmi";

import { WaystonePanel } from "./WaystonePanel";
import { ErrorPanel, Row } from "./ui";

const ZERO = "0x0000000000000000000000000000000000000000" as const;

export function RoadView({ bagA, bagB }: { bagA: bigint; bagB: bigint }) {
  const [addrs, setAddrs] = useState<DeploymentAddresses | null>(null);
  const [loadingAddrs, setLoadingAddrs] = useState(true);

  useEffect(() => {
    loadAnvilAddresses()
      .then(setAddrs)
      .finally(() => setLoadingAddrs(false));
  }, []);

  if (loadingAddrs) return <p className="text-rule italic">consulting the atlas…</p>;
  if (!addrs) return <NoAddresses />;
  return <RoadViewWithAddrs bagA={bagA} bagB={bagB} addrs={addrs} />;
}

function RoadViewWithAddrs({
  bagA,
  bagB,
  addrs,
}: {
  bagA: bigint;
  bagB: bigint;
  addrs: DeploymentAddresses;
}) {
  const { address: connected, isConnected } = useAccount();

  const road = useReadContract({
    address: addrs.cartographer,
    abi: cartographerAbi,
    functionName: "roadBetween",
    args: [bagA, bagB],
    chainId: DEFAULT_CHAIN_ID,
  });

  const discovery = useReadContract({
    address: addrs.atlas,
    abi: atlasAbi,
    functionName: "getRoadDiscovery",
    args: [bagA, bagB],
    chainId: DEFAULT_CHAIN_ID,
  });

  const discover = useTxButton({
    request: {
      address: addrs.atlas,
      abi: atlasAbi,
      functionName: "discoverRoad",
      args: [bagA, bagB],
      chainId: DEFAULT_CHAIN_ID,
    },
    idleLabel: "discover this road",
    onMined: discovery.refetch,
  });

  if (road.isLoading) return <p className="text-rule italic">surveying the route…</p>;
  if (road.error) return <ErrorPanel message={road.error.message} />;
  if (!road.data) return <p className="text-rule">no road data</p>;

  const r = road.data;

  if (!r.exists) {
    return (
      <div className="space-y-4">
        <Row label="Distance" value={r.distance.toString()} />
        <Row label="Score" value={r.score.toString()} />
        <p className="text-rule italic">
          no road. The bags share too little to be connected at this distance.
        </p>
      </div>
    );
  }

  const d = discovery.data;
  const isDiscovered = d && d.discoverer !== ZERO;
  const isDiscoverer =
    Boolean(isDiscovered && connected && d.discoverer.toLowerCase() === connected.toLowerCase());

  return (
    <div className="space-y-6">
      <Row label="Distance" value={r.distance.toString()} />
      <Row label="Cost" value={r.cost.toString()} />
      <Row label="Score" value={r.score.toString()} />

      <span className="rule" />

      {isDiscovered ? (
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-rule text-xs tracking-widest uppercase">Discovered</p>
            <div className="space-y-2">
              <Row
                label="Cartographer"
                value={
                  isDiscoverer
                    ? `${d.discoverer.slice(0, 6)}…${d.discoverer.slice(-4)} (you)`
                    : `${d.discoverer.slice(0, 6)}…${d.discoverer.slice(-4)}`
                }
              />
              <Row label="Block" value={d.blockNumber.toString()} />
              <Row label="Discovery ID" value={`#${d.discoveryId.toString()}`} />
            </div>
          </div>

          <WaystonePanel bagA={bagA} bagB={bagB} addrs={addrs} canMint={isDiscoverer} />
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-rule text-xs tracking-widest uppercase">Undiscovered</p>
          {!isConnected ? (
            <p className="text-rule italic">connect a wallet to chart this road.</p>
          ) : (
            <button
              onClick={discover.send}
              disabled={discover.isPending}
              className="border border-rule px-4 py-2 text-sm tracking-widest uppercase hover:bg-rule/10 disabled:opacity-50"
            >
              {discover.label}
            </button>
          )}
          {discover.error && <ErrorPanel message={discover.error.message} />}
        </div>
      )}

      <span className="rule" />

      <p className="text-rule text-sm">
        <Link href={`/bag/${bagA.toString()}`} className="underline decoration-rule/40 hover:decoration-ink">
          inspect bag #{bagA.toString()}
        </Link>
        {"  ·  "}
        <Link href={`/bag/${bagB.toString()}`} className="underline decoration-rule/40 hover:decoration-ink">
          inspect bag #{bagB.toString()}
        </Link>
      </p>
    </div>
  );
}

function NoAddresses() {
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
