#!/usr/bin/env node
/**
 * Derives (x, y) coordinates for all 8000 Loot bags offchain, matching
 * Coordinates.sol exactly. Output is consumed by apps/web/app/atlas/ to
 * render the world map without making 8000 RPC calls.
 *
 * Reads:  contracts/test/fixtures/loot-bags.json   (or loot-bags-flat.json fallback)
 * Writes: apps/web/public/bag-coords.json          (array of {id, x, y})
 *
 * The formula (must match contracts/src/libraries/Coordinates.sol):
 *   seed = keccak256(abi.encode(bagId, weapon, chest, head, waist, foot, hand, neck, ring))
 *   x    = int128(low 128 bits of seed)  % 10001 - 5000
 *   y    = int128(high 128 bits of seed) % 10001 - 5000
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { encodeAbiParameters, keccak256 } from "viem";

const __dirname = dirname(fileURLToPath(import.meta.url));
const VERBOSE_FIXTURE = resolve(__dirname, "../test/fixtures/loot-bags.json");
const FLAT_FIXTURE = resolve(__dirname, "../test/fixtures/loot-bags-flat.json");
const OUTPUT = resolve(__dirname, "../../apps/web/public/bag-coords.json");

const AXIS_SPAN = 10_001n;
const MIN_AXIS = -5000n;
const MASK_128 = (1n << 128n) - 1n;

const PARAM_TYPES = [
  { type: "uint256" },
  { type: "string" },
  { type: "string" },
  { type: "string" },
  { type: "string" },
  { type: "string" },
  { type: "string" },
  { type: "string" },
  { type: "string" },
];

function locate(bagId, slots) {
  const encoded = encodeAbiParameters(PARAM_TYPES, [
    BigInt(bagId),
    slots.weapon,
    slots.chest,
    slots.head,
    slots.waist,
    slots.foot,
    slots.hand,
    slots.neck,
    slots.ring,
  ]);
  const seed = BigInt(keccak256(encoded));
  const xRaw = seed & MASK_128;
  const yRaw = (seed >> 128n) & MASK_128;
  const x = Number((xRaw % AXIS_SPAN) + MIN_AXIS);
  const y = Number((yRaw % AXIS_SPAN) + MIN_AXIS);
  return { x, y };
}

function loadBags() {
  if (existsSync(VERBOSE_FIXTURE)) {
    const raw = JSON.parse(readFileSync(VERBOSE_FIXTURE, "utf8"));
    return raw.bags;
  }
  if (existsSync(FLAT_FIXTURE)) {
    const raw = JSON.parse(readFileSync(FLAT_FIXTURE, "utf8"));
    const bags = [];
    const SLOTS = ["weapon", "chest", "head", "waist", "foot", "hand", "neck", "ring"];
    for (let i = 0; i < raw.totalBags; i++) {
      const off = i * 8;
      const slots = Object.fromEntries(SLOTS.map((s, j) => [s, raw.slots[off + j]]));
      bags.push({ id: i + 1, slots });
    }
    return bags;
  }
  throw new Error("no fixture found. Run `pnpm fetch:loot-bags` first.");
}

function main() {
  const bags = loadBags();
  console.log(`deriving coordinates for ${bags.length} bags`);

  const coords = bags.map((b) => {
    const { x, y } = locate(b.id, b.slots);
    return { id: b.id, x, y };
  });

  writeFileSync(OUTPUT, JSON.stringify(coords));
  console.log(`wrote ${OUTPUT} (${coords.length} entries)`);

  // Sanity: print a few so they can be cross-checked against the contract.
  console.log("\nspot-check against the contract:");
  for (const id of [1, 2, 100, 4321, 8000]) {
    const c = coords[id - 1];
    if (c) console.log(`  bag ${String(id).padStart(5)} → (${c.x}, ${c.y})`);
  }
}

main();
