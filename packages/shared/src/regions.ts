// Mirrors Regions.sol — keep in sync with the Solidity source.
export const REGION_NAMES = [
  "Ashen Coast",
  "Glass Marsh",
  "Wyrmspine",
  "Crownlands",
  "Black Fen",
  "Silent Reach",
  "Broken Expanse",
  "Hollow Vale",
  "Saltreach",
  "Gilded Steppe",
  "Iron Hollow",
  "Pale Mire",
  "Thornward",
  "Sundered Hills",
  "Whitewatch",
  "Drowning Coast",
  "Cinder Plains",
  "Ravenmoor",
  "Witherwood",
  "Stonebreak",
  "Greyspire",
  "Frostfen",
  "Bleakshore",
  "Emberwild",
  "Quietmarch",
  "Old Sigil",
  "Mournwood",
  "Glasswind Pass",
  "Veilstone",
  "Hearthfall",
  "Last Reach",
  "Forgotten Verge",
] as const;

export type RegionName = (typeof REGION_NAMES)[number];

export const regionName = (id: number): RegionName | undefined => REGION_NAMES[id];
