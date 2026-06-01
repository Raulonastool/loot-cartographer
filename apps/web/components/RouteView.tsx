"use client";

import { atlasAbi, cartographerAbi } from "@loot-cartographer/shared";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAccount, useReadContract, useReadContracts } from "wagmi";

import { loadAnvilAddresses, type DeploymentAddresses } from "@/lib/contracts";
import { useTxButton } from "@/lib/useTxButton";
import { DEFAULT_CHAIN_ID } from "@/lib/wagmi";

import { WaystonePanel } from "./WaystonePanel";
import { ErrorPanel, Row } from "./ui";

const ZERO = "0x0000000000000000000000000000000000000000" as const;

export function RouteView({ path }: { path: bigint[] }) {
  const [addrs, setAddrs] = useState<DeploymentAddresses | null>(null);
  const [loadingAddrs, setLoadingAddrs] = useState(true);

  useEffect(() => {
    loadAnvilAddresses()
      .then(setAddrs)
      .finally(() => setLoadingAddrs(false));
  }, []);

  if (loadingAddrs) return <p className="text-rule italic">consulting the atlas…</p>;
  if (!addrs) return <NoAddresses />;
  return <RouteViewWithAddrs path={path} addrs={addrs} />;
}

function RouteViewWithAddrs({ path, addrs }: { path: bigint[]; addrs: DeploymentAddresses }) {
  const { address: connected, isConnected } = useAccount();

  const hops = useReadContracts({
    contracts: path.slice(0, -1).map(
      (bag, i) =>
        ({
          address: addrs.cartographer,
          abi: cartographerAbi,
          functionName: "roadBetween",
          args: [bag, path[i + 1]],
          chainId: DEFAULT_CHAIN_ID,
        }) as const,
    ),
  });

  const discovery = useReadContract({
    address: addrs.atlas,
    abi: atlasAbi,
    functionName: "getRouteDiscovery",
    args: [path],
    chainId: DEFAULT_CHAIN_ID,
  });

  const discover = useTxButton({
    request: {
      address: addrs.atlas,
      abi: atlasAbi,
      functionName: "discoverRoute",
      args: [path],
      chainId: DEFAULT_CHAIN_ID,
    },
    idleLabel: "discover this route",
    onMined: discovery.refetch,
  });

  if (hops.isLoading) return <p className="text-rule italic">surveying the route…</p>;
  if (hops.error) return <ErrorPanel message={hops.error.message} />;

  const brokenHop = (hops.data ?? []).findIndex((h) => h.status !== "success" || !h.result?.exists);
  const allHopsValid = brokenHop === -1;

  const d = discovery.data;
  const isDiscovered = d && d.discoverer !== ZERO;
  const isDiscoverer =
    Boolean(isDiscovered && connected && d.discoverer.toLowerCase() === connected.toLowerCase());

  return (
    <div className="space-y-6">
      <HopChain path={path} brokenHop={brokenHop} />

      <span className="rule" />

      {!allHopsValid ? (
        <p className="text-rule italic">
          broken link at #{path[brokenHop].toString()} <span className="text-rule">→</span>{" "}
          #{path[brokenHop + 1].toString()}. These bags share no road, so no route runs through them.
        </p>
      ) : isDiscovered ? (
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
              <Row label="Total Cost" value={d.totalCost.toString()} />
            </div>
          </div>

          <WaystonePanel target={{ kind: "route", path }} addrs={addrs} canMint={isDiscoverer} />
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-rule text-xs tracking-widest uppercase">Undiscovered</p>
          {!isConnected ? (
            <p className="text-rule italic">connect a wallet to chart this route.</p>
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
        {path.map((bag, i) => (
          <span key={i}>
            {i > 0 && "  ·  "}
            <Link
              href={`/bag/${bag.toString()}`}
              className="underline decoration-rule/40 hover:decoration-ink"
            >
              inspect bag #{bag.toString()}
            </Link>
          </span>
        ))}
      </p>
    </div>
  );
}

function HopChain({ path, brokenHop }: { path: bigint[]; brokenHop: number }) {
  return (
    <p className="font-mono text-lg tracking-wider">
      {path.map((bag, i) => (
        <span key={i}>
          {i > 0 && (
            <span className={i - 1 === brokenHop ? "text-red-400" : "text-rule"}> → </span>
          )}
          #{bag.toString()}
        </span>
      ))}
    </p>
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
