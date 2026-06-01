// Mirrors ILootCartographer.Terrain enum order. Keep in sync with the Solidity source.
export const TERRAINS = [
  "Plains",
  "Marsh",
  "Forest",
  "Mountains",
  "Ruins",
  "Coast",
  "Desert",
  "Wasteland",
] as const;

export type Terrain = (typeof TERRAINS)[number];

export const terrainName = (id: number): Terrain | undefined => TERRAINS[id];
