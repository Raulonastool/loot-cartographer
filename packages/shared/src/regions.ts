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

/// Mirrors Regions.capitalOf(id) in Solidity. Hand-placed capitals for the
/// 32 Voronoi-by-Manhattan regions. Keep in sync.
export const REGION_CAPITALS: ReadonlyArray<{ x: number; y: number }> = [
  { x: -4500, y: 4200 },  // 0 Ashen Coast
  { x: -2800, y: 4100 },  // 1 Glass Marsh
  { x: -800, y: 4500 },   // 2 Wyrmspine
  { x: 1500, y: 4300 },   // 3 Crownlands
  { x: 3800, y: 4400 },   // 4 Black Fen
  { x: -4200, y: 2400 },  // 5 Silent Reach
  { x: -1700, y: 2800 },  // 6 Broken Expanse
  { x: 700, y: 2200 },    // 7 Hollow Vale
  { x: 3100, y: 2500 },   // 8 Saltreach
  { x: 4600, y: 1800 },   // 9 Gilded Steppe
  { x: -4400, y: 700 },   // 10 Iron Hollow
  { x: -2400, y: 1100 },  // 11 Pale Mire
  { x: -300, y: 600 },    // 12 Thornward
  { x: 2100, y: 800 },    // 13 Sundered Hills
  { x: 4300, y: 200 },    // 14 Whitewatch
  { x: -4700, y: -1000 }, // 15 Drowning Coast
  { x: -2900, y: -1500 }, // 16 Cinder Plains
  { x: -900, y: -1800 },  // 17 Ravenmoor
  { x: 1300, y: -1300 },  // 18 Witherwood
  { x: 3500, y: -900 },   // 19 Stonebreak
  { x: -3700, y: -3200 }, // 20 Greyspire
  { x: -1900, y: -3500 }, // 21 Frostfen
  { x: -100, y: -3000 },  // 22 Bleakshore
  { x: 2300, y: -3400 },  // 23 Emberwild
  { x: 4500, y: -3000 },  // 24 Quietmarch
  { x: -4500, y: -4500 }, // 25 Old Sigil
  { x: -2200, y: -4700 }, // 26 Mournwood
  { x: 0, y: -4300 },     // 27 Glasswind Pass
  { x: 2700, y: -4500 },  // 28 Veilstone
  { x: 4700, y: -4400 },  // 29 Hearthfall
  { x: -3500, y: -100 },  // 30 Last Reach
  { x: 3700, y: 3300 },   // 31 Forgotten Verge
] as const;
