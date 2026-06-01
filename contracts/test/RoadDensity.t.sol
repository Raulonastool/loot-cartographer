// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Test } from "forge-std/Test.sol";
import { console2 } from "forge-std/console2.sol";

import { ILootCartographer } from "../src/interfaces/ILootCartographer.sol";
import { LootCartographer } from "../src/LootCartographer.sol";
import { MockLoot } from "./helpers/MockLoot.sol";

/// @notice Samples the score distribution across real Loot bag pairs to lock ROAD_THRESHOLD.
/// @dev    Loads contracts/test/fixtures/loot-bags-flat.json (produced from a mainnet read).
///         Run with:
///           forge test --match-path test/RoadDensity.t.sol --match-test testFixture_BuildHistogram -vv
contract RoadDensityTest is Test {
    LootCartographer internal carto;
    MockLoot internal loot;

    uint256 internal constant TOTAL_BAGS = 8000;
    uint256 internal constant SAMPLE_PAIRS = 100_000;

    // Histogram: 0..6999 in steps of 25 → 280 buckets, overflow bucket = >=7000.
    // Observed max score from a coarser run was 6042, so this captures full resolution.
    uint256 internal constant BUCKET_SIZE = 25;
    uint256 internal constant BUCKET_COUNT = 280;

    function setUp() public {
        loot = new MockLoot();
        carto = new LootCartographer(address(loot));

        string memory raw = vm.readFile("./test/fixtures/loot-bags-flat.json");
        string[] memory flat = vm.parseJsonStringArray(raw, ".slots");
        require(flat.length == TOTAL_BAGS * 8, "fixture: unexpected length");

        for (uint256 id = 1; id <= TOTAL_BAGS; id++) {
            uint256 off = (id - 1) * 8;
            string[8] memory slots = [
                flat[off],
                flat[off + 1],
                flat[off + 2],
                flat[off + 3],
                flat[off + 4],
                flat[off + 5],
                flat[off + 6],
                flat[off + 7]
            ];
            loot.setBag(id, slots);
        }
    }

    /// @notice Asserts that the offchain coordinate derivation in
    ///         contracts/scripts/precompute-bag-coords.mjs matches Coordinates.sol
    ///         exactly for a handful of bags. Update both sides together if the
    ///         derivation ever changes.
    function testFixture_PrecomputedCoordsMatchContract() public view {
        uint256[5] memory ids = [uint256(1), 2, 100, 4321, 8000];
        int256[5] memory expectX = [int256(-1751), 3911, -3331, 2232, 2732];
        int256[5] memory expectY = [int256(-1253), 697, -4648, -845, -3858];

        for (uint256 i = 0; i < 5; i++) {
            (int256 x, int256 y) = carto.locate(ids[i]);
            assertEq(x, expectX[i], "x mismatch");
            assertEq(y, expectY[i], "y mismatch");
        }
    }

    /// @notice Build the histogram of road `score` across SAMPLE_PAIRS random pairs.
    ///         Writes to contracts/deployments/road-density-histogram.json so the next
    ///         step (analyze-and-lock) can pick the right threshold.
    function testFixture_BuildHistogram() public {
        uint256[BUCKET_COUNT + 1] memory hist;
        uint256[7] memory thresholdHits;
        uint256[7] memory thresholds = [uint256(4000), 4500, 5000, 5250, 5500, 5750, 6000];

        uint256 totalScored;
        uint256 totalScore;
        uint256 minScore = type(uint256).max;
        uint256 maxScore;

        for (uint256 i = 0; i < SAMPLE_PAIRS; i++) {
            uint256 a = (uint256(keccak256(abi.encode("ROAD_DENSITY.a", i))) % TOTAL_BAGS) + 1;
            uint256 b = (uint256(keccak256(abi.encode("ROAD_DENSITY.b", i))) % TOTAL_BAGS) + 1;
            if (a == b) {
                b = (b % TOTAL_BAGS) + 1;
            }

            ILootCartographer.Road memory r = carto.roadBetween(a, b);

            uint256 bucket = r.score / BUCKET_SIZE;
            if (bucket >= BUCKET_COUNT) bucket = BUCKET_COUNT;
            hist[bucket] += 1;

            totalScored += 1;
            totalScore += r.score;
            if (r.score < minScore) minScore = r.score;
            if (r.score > maxScore) maxScore = r.score;

            for (uint256 t = 0; t < 7; t++) {
                if (r.score >= thresholds[t]) thresholdHits[t] += 1;
            }
        }

        console2.log("sampled pairs", totalScored);
        console2.log("mean score x1000", (totalScore * 1000) / totalScored);
        console2.log("min score", minScore);
        console2.log("max score", maxScore);
        for (uint256 t = 0; t < 7; t++) {
            console2.log("threshold:", thresholds[t]);
            console2.log("  hits:", thresholdHits[t]);
            // estimated avg roads/bag if applied to all pairs:
            // total_pairs = TOTAL_BAGS*(TOTAL_BAGS-1)/2, hits_extrap = hits * total_pairs/SAMPLE_PAIRS
            // avg_roads_per_bag = 2 * hits_extrap / TOTAL_BAGS = (TOTAL_BAGS-1) * hits/SAMPLE_PAIRS
            uint256 avg = ((TOTAL_BAGS - 1) * thresholdHits[t]) / SAMPLE_PAIRS;
            console2.log("  est avg roads/bag:", avg);
        }

        _writeHistogram(hist, thresholds, thresholdHits, totalScored, totalScore, minScore, maxScore);
    }

    function _writeHistogram(
        uint256[BUCKET_COUNT + 1] memory hist,
        uint256[7] memory thresholds,
        uint256[7] memory thresholdHits,
        uint256 totalScored,
        uint256 totalScore,
        uint256 minScore,
        uint256 maxScore
    ) internal {
        string memory json = "{\n";
        json = string.concat(json, '  "sampledPairs": ', vm.toString(totalScored), ",\n");
        json = string.concat(json, '  "totalBags": ', vm.toString(TOTAL_BAGS), ",\n");
        json = string.concat(json, '  "bucketSize": ', vm.toString(BUCKET_SIZE), ",\n");
        json = string.concat(json, '  "bucketCount": ', vm.toString(BUCKET_COUNT), ",\n");
        json = string.concat(json, '  "meanScoreX1000": ', vm.toString((totalScore * 1000) / totalScored), ",\n");
        json = string.concat(json, '  "minScore": ', vm.toString(minScore), ",\n");
        json = string.concat(json, '  "maxScore": ', vm.toString(maxScore), ",\n");

        json = string.concat(json, '  "buckets": [');
        for (uint256 i = 0; i <= BUCKET_COUNT; i++) {
            json = string.concat(json, vm.toString(hist[i]));
            if (i < BUCKET_COUNT) json = string.concat(json, ",");
        }
        json = string.concat(json, "],\n");

        json = string.concat(json, '  "thresholdProbes": [\n');
        for (uint256 t = 0; t < 7; t++) {
            uint256 avg = ((TOTAL_BAGS - 1) * thresholdHits[t]) / SAMPLE_PAIRS;
            json = string.concat(
                json,
                "    {\"threshold\": ",
                vm.toString(thresholds[t]),
                ", \"hits\": ",
                vm.toString(thresholdHits[t]),
                ", \"estAvgRoadsPerBag\": ",
                vm.toString(avg),
                "}"
            );
            if (t < 6) json = string.concat(json, ",");
            json = string.concat(json, "\n");
        }
        json = string.concat(json, "  ]\n}\n");

        vm.writeFile("./deployments/road-density-histogram.json", json);
    }
}
