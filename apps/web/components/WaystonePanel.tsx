"use client";

import { waystoneAbi, type DeploymentAddresses } from "@loot-cartographer/shared";
import { useReadContract } from "wagmi";

import { useTxButton } from "@/lib/useTxButton";
import { DEFAULT_CHAIN_ID } from "@/lib/wagmi";

import { WaystoneImage } from "./OnchainSvg";
import { ErrorPanel, Row } from "./ui";

export type WaystoneTarget =
  | { kind: "road"; bagA: bigint; bagB: bigint }
  | { kind: "route"; path: bigint[] };

export function WaystonePanel({
  target,
  addrs,
  canMint,
}: {
  target: WaystoneTarget;
  addrs: DeploymentAddresses;
  canMint: boolean;
}) {
  const isRoad = target.kind === "road";

  const roadToken = useReadContract({
    address: addrs.waystone,
    abi: waystoneAbi,
    functionName: "tokenForRoad",
    args: isRoad ? [target.bagA, target.bagB] : undefined,
    chainId: DEFAULT_CHAIN_ID,
    query: { enabled: isRoad },
  });

  const routeToken = useReadContract({
    address: addrs.waystone,
    abi: waystoneAbi,
    functionName: "tokenForRoute",
    args: isRoad ? undefined : [target.path],
    chainId: DEFAULT_CHAIN_ID,
    query: { enabled: !isRoad },
  });

  const minted = isRoad ? roadToken : routeToken;

  const mint = useTxButton({
    request:
      target.kind === "road"
        ? {
            address: addrs.waystone,
            abi: waystoneAbi,
            functionName: "mintForRoad",
            args: [target.bagA, target.bagB],
            chainId: DEFAULT_CHAIN_ID,
          }
        : {
            address: addrs.waystone,
            abi: waystoneAbi,
            functionName: "mintForRoute",
            args: [target.path],
            chainId: DEFAULT_CHAIN_ID,
          },
    idleLabel: "mint waystone",
    onMined: minted.refetch,
  });

  const tokenId = minted.data;
  const isMinted = tokenId !== undefined && tokenId !== 0n;

  return (
    <div className="space-y-3">
      <p className="text-rule text-xs tracking-widest uppercase">Waystone</p>

      {isMinted ? (
        <div className="space-y-3">
          <WaystoneImage tokenId={tokenId} addrs={addrs} />
          <Row label="Token" value={`#${tokenId.toString()}`} />
        </div>
      ) : canMint ? (
        <div className="space-y-3">
          <button
            onClick={mint.send}
            disabled={mint.isPending}
            className="border border-rule px-4 py-2 text-sm tracking-widest uppercase hover:bg-rule/10 disabled:opacity-50"
          >
            {mint.label}
          </button>
          {mint.error && <ErrorPanel message={mint.error.message} />}
        </div>
      ) : (
        <p className="text-rule italic">
          only the cartographer who charted this {target.kind} may raise its waystone.
        </p>
      )}
    </div>
  );
}
