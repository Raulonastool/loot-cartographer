#!/usr/bin/env node
/**
 * Fetches all 8000 Loot bag fingerprints from canonical mainnet Loot
 * (0xFF9C1b15B16263C61d017ee9F65C50e4AE0113D7) and writes a fixture JSON used
 * by RoadDensity.t.sol to lock the ROAD_THRESHOLD constant.
 *
 * Usage:
 *   MAINNET_RPC_URL=... node contracts/scripts/fetch-loot-bags.mjs
 *
 * If MAINNET_RPC_URL is unset, falls back to a public endpoint.
 */
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = resolve(__dirname, "../test/fixtures/loot-bags.json");

const LOOT_ADDRESS = "0xFF9C1b15B16263C61d017ee9F65C50e4AE0113D7";
const TOTAL_BAGS = 8000;
const CHUNK_SIZE = 50; // bag ids per multicall (50 * 8 calls = 400 per multicall)
const RPC_URL = process.env.MAINNET_RPC_URL || "https://ethereum-rpc.publicnode.com";

const lootAbi = [
  "getWeapon",
  "getChest",
  "getHead",
  "getWaist",
  "getFoot",
  "getHand",
  "getNeck",
  "getRing",
].map((fn) => ({
  type: "function",
  name: fn,
  stateMutability: "view",
  inputs: [{ name: "tokenId", type: "uint256" }],
  outputs: [{ name: "", type: "string" }],
}));

const SLOTS = ["weapon", "chest", "head", "waist", "foot", "hand", "neck", "ring"];

async function main() {
  console.log(`fetching ${TOTAL_BAGS} bags via ${RPC_URL}`);
  const client = createPublicClient({
    chain: mainnet,
    transport: http(RPC_URL, { batch: { batchSize: 100, wait: 50 } }),
  });

  const bags = new Array(TOTAL_BAGS);
  let elapsed = Date.now();

  for (let start = 1; start <= TOTAL_BAGS; start += CHUNK_SIZE) {
    const end = Math.min(start + CHUNK_SIZE - 1, TOTAL_BAGS);
    const contracts = [];
    for (let id = start; id <= end; id++) {
      for (const fn of lootAbi) {
        contracts.push({
          address: LOOT_ADDRESS,
          abi: [fn],
          functionName: fn.name,
          args: [BigInt(id)],
        });
      }
    }

    const results = await client.multicall({ contracts, allowFailure: false });

    for (let i = 0; i < end - start + 1; i++) {
      const id = start + i;
      const offset = i * 8;
      bags[id - 1] = {
        id,
        slots: Object.fromEntries(SLOTS.map((s, j) => [s, results[offset + j]])),
      };
    }

    const now = Date.now();
    const rate = (end / ((now - elapsed) / 1000)).toFixed(0);
    process.stdout.write(`\r  fetched ${end}/${TOTAL_BAGS} (${rate} bags/s)`);
  }
  console.log("\ndone fetching.");

  mkdirSync(dirname(FIXTURE_PATH), { recursive: true });
  writeFileSync(
    FIXTURE_PATH,
    JSON.stringify(
      {
        source: LOOT_ADDRESS,
        rpc: RPC_URL,
        fetchedAt: new Date().toISOString(),
        totalBags: TOTAL_BAGS,
        bags,
      },
      null,
      2
    )
  );
  console.log(`wrote ${FIXTURE_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
