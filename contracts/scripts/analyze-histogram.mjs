#!/usr/bin/env node
/**
 * Reads contracts/deployments/road-density-histogram.json and prints the
 * score distribution + threshold table so we can lock ROAD_THRESHOLD.
 *
 * The target density is configurable. Lower = sparser, more selective roads.
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const HISTOGRAM_PATH = resolve(__dirname, "../deployments/road-density-histogram.json");

const TARGET_AVG_ROADS_PER_BAG = Number(process.env.TARGET_AVG ?? 10);

const data = JSON.parse(readFileSync(HISTOGRAM_PATH, "utf8"));
const { buckets, bucketSize, totalBags, sampledPairs, minScore, maxScore, meanScoreX1000 } = data;

function estAvgFromHits(hits) {
  return ((totalBags - 1) * hits) / sampledPairs;
}

function hitsAtThreshold(thr) {
  // Sum buckets whose lower edge >= thr. (Conservative — actual hits could be
  // slightly higher since the threshold can split a bucket; resolution = bucketSize.)
  let hits = 0;
  for (let i = 0; i < buckets.length; i++) {
    const lower = i * bucketSize;
    if (lower >= thr) hits += buckets[i];
  }
  return hits;
}

console.log(`sampled pairs : ${sampledPairs}`);
console.log(`total bags    : ${totalBags}`);
console.log(`mean score    : ${(meanScoreX1000 / 1000).toFixed(1)}`);
console.log(`min / max     : ${minScore} / ${maxScore}`);
console.log("");

console.log("=== score distribution (non-empty buckets) ===");
console.log(`  ${"range".padStart(14)} ${"count".padStart(7)} ${"%".padStart(7)} ${"cum_above_est_avg".padStart(20)}`);
let cumAbove = 0;
for (let i = buckets.length - 1; i >= 0; i--) {
  const c = buckets[i];
  cumAbove += c;
  if (c === 0 && cumAbove === c) continue; // nothing yet
  if (c === 0) continue;
  const lo = i * bucketSize;
  const hi = i < buckets.length - 1 ? (i + 1) * bucketSize - 1 : "+";
  const label = i < buckets.length - 1 ? `${lo}-${hi}` : `>=${lo}`;
  const pct = ((100 * c) / sampledPairs).toFixed(2);
  const avg = estAvgFromHits(cumAbove).toFixed(2);
  console.log(`  ${label.padStart(14)} ${String(c).padStart(7)} ${(pct + "%").padStart(7)} ${avg.padStart(20)}`);
}
console.log("");

console.log("=== threshold probes ===");
console.log(`  ${"threshold".padStart(10)} ${"hits".padStart(7)} ${"%".padStart(7)} ${"est_avg_roads".padStart(15)}`);
const probes = [];
for (let t = 0; t <= maxScore + bucketSize; t += bucketSize) {
  probes.push(t);
}
for (const t of probes) {
  const hits = hitsAtThreshold(t);
  const avg = estAvgFromHits(hits);
  if (hits === 0) {
    console.log(`  ${String(t).padStart(10)} ${String(hits).padStart(7)} ${(0).toFixed(2).padStart(6)}%  ${avg.toFixed(2).padStart(14)}`);
    break;
  }
  const pct = ((100 * hits) / sampledPairs).toFixed(2);
  console.log(`  ${String(t).padStart(10)} ${String(hits).padStart(7)} ${(pct + "%").padStart(7)} ${avg.toFixed(2).padStart(15)}`);
}
console.log("");

// Find smallest threshold (multiple of bucketSize) such that est avg roads/bag <= TARGET_AVG.
let chosen = null;
for (const t of probes) {
  const hits = hitsAtThreshold(t);
  const avg = estAvgFromHits(hits);
  if (avg <= TARGET_AVG_ROADS_PER_BAG) {
    chosen = { threshold: t, hits, avg };
    break;
  }
}
console.log(`=== recommendation (target ${TARGET_AVG_ROADS_PER_BAG} avg roads/bag) ===`);
if (chosen) {
  console.log(`  threshold = ${chosen.threshold}  →  ${chosen.hits} hits / ${sampledPairs} pairs  →  est avg ${chosen.avg.toFixed(2)} roads/bag`);
} else {
  console.log(`  no threshold within histogram range produces avg <= ${TARGET_AVG_ROADS_PER_BAG}.`);
  console.log(`  Hint: pick a value above maxScore (${maxScore}); the score is bimodal, so even very high`);
  console.log(`  thresholds may have many hits. Consider increasing TARGET_AVG or refining the affinity formula.`);
}
