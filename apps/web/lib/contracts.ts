import { cartographerAbi, type DeploymentAddresses } from "@loot-cartographer/shared";

export { cartographerAbi };
export type { DeploymentAddresses };

/// Loads addresses written by SeedAnvil.s.sol. Returns null until Anvil has been seeded.
export async function loadAnvilAddresses(): Promise<DeploymentAddresses | null> {
  try {
    const res = await fetch("/anvil-addresses.json", { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as DeploymentAddresses;
  } catch {
    return null;
  }
}
