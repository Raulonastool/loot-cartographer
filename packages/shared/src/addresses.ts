// Mainnet canonical Loot contract.
export const LOOT_MAINNET = "0xFF9C1b15B16263C61d017ee9F65C50e4AE0113D7" as const;

// Loot Cartographer contracts. Anvil addresses are read at runtime from
// /anvil-addresses.json (written by SeedAnvil.s.sol). Mainnet addresses
// will live here once deployed.
export interface DeploymentAddresses {
  chainId: number;
  loot: `0x${string}`;
  cartographer: `0x${string}`;
  atlas: `0x${string}`;
  renderer: `0x${string}`;
  waystone: `0x${string}`;
}

export const MAINNET_DEPLOYMENT: DeploymentAddresses | null = null;
