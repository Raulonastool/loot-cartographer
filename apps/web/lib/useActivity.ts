import { atlasAbi, waystoneAbi, type DeploymentAddresses } from "@loot-cartographer/shared";
import { useQuery } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";

import { DEFAULT_CHAIN_ID } from "@/lib/wagmi";

export type ActivityEntry =
  | {
      kind: "road";
      key: string;
      bagA: bigint;
      bagB: bigint;
      discoverer: string;
      blockNumber: bigint;
      minted: boolean;
    }
  | {
      kind: "route";
      key: string;
      path: bigint[];
      discoverer: string;
      totalCost: bigint;
      blockNumber: bigint;
      minted: boolean;
    };

const MAX_ENTRIES = 25;

export function useActivity(addrs: DeploymentAddresses) {
  const client = usePublicClient({ chainId: DEFAULT_CHAIN_ID });

  return useQuery<ActivityEntry[]>({
    queryKey: ["activity", addrs.atlas, addrs.waystone],
    enabled: Boolean(client),
    refetchInterval: 10_000,
    queryFn: async () => {
      if (!client) return [];

      // fromBlock: 0n is fine on Anvil; a mainnet feed would chunk the range.
      const [roads, routes, mints] = await Promise.all([
        client.getContractEvents({
          address: addrs.atlas,
          abi: atlasAbi,
          eventName: "RoadDiscovered",
          fromBlock: 0n,
          toBlock: "latest",
        }),
        client.getContractEvents({
          address: addrs.atlas,
          abi: atlasAbi,
          eventName: "RouteDiscovered",
          fromBlock: 0n,
          toBlock: "latest",
        }),
        client.getContractEvents({
          address: addrs.waystone,
          abi: waystoneAbi,
          eventName: "WaystoneMinted",
          fromBlock: 0n,
          toBlock: "latest",
        }),
      ]);

      const mintedKeys = new Set(
        mints.map((m) => m.args.discoveryKey).filter((k): k is `0x${string}` => Boolean(k)),
      );

      const entries: ActivityEntry[] = [];

      for (const log of roads) {
        const { key, bagA, bagB, discoverer } = log.args;
        if (key === undefined || bagA === undefined || bagB === undefined || !discoverer) continue;
        if (log.blockNumber === null) continue;
        entries.push({
          kind: "road",
          key,
          bagA,
          bagB,
          discoverer,
          blockNumber: log.blockNumber,
          minted: mintedKeys.has(key),
        });
      }

      for (const log of routes) {
        const { key, path, discoverer, totalCost } = log.args;
        if (key === undefined || !path || !discoverer || totalCost === undefined) continue;
        if (log.blockNumber === null) continue;
        entries.push({
          kind: "route",
          key,
          path: [...path],
          discoverer,
          totalCost,
          blockNumber: log.blockNumber,
          minted: mintedKeys.has(key),
        });
      }

      entries.sort((a, b) => (a.blockNumber < b.blockNumber ? 1 : a.blockNumber > b.blockNumber ? -1 : 0));
      return entries.slice(0, MAX_ENTRIES);
    },
  });
}
