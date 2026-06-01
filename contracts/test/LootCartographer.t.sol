// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Test } from "forge-std/Test.sol";

import { ILootCartographer } from "../src/interfaces/ILootCartographer.sol";
import { LootCartographer } from "../src/LootCartographer.sol";
import { MockLoot } from "./helpers/MockLoot.sol";

contract LootCartographerTest is Test {
    LootCartographer internal carto;
    MockLoot internal loot;

    address internal constant LOOT_MAINNET = 0xFF9C1b15B16263C61d017ee9F65C50e4AE0113D7;

    function setUp() public {
        loot = new MockLoot();
        carto = new LootCartographer(address(loot));
    }

    function test_LocateReturnsBoundedCoordinates() public {
        string[8] memory slots =
            ["Katana of Power", "Robe of Brilliance", "Crown", "Belt", "Boots", "Gloves", "Pendant", "Gold Ring"];
        loot.setBag(1, slots);

        (int256 x, int256 y) = carto.locate(1);
        assertGe(x, -5000);
        assertLe(x, 5000);
        assertGe(y, -5000);
        assertLe(y, 5000);
    }

    function test_RegionResolvesToOneOf32() public {
        string[8] memory slots = ["a", "b", "c", "d", "e", "f", "g", "h"];
        loot.setBag(7, slots);

        ILootCartographer.Region memory r = carto.regionOf(7);
        assertLt(r.id, 32);
        assertGt(bytes(r.name).length, 0);
    }

    function test_TerrainResolves() public {
        // Anger-stacked bag should map to Wasteland.
        string[8] memory slots = [
            "Katana of Anger",
            "Robe of Anger",
            "Crown of Anger",
            "Belt of Anger",
            "Boots of Anger",
            "Gloves of Anger",
            "Pendant",
            "Gold Ring"
        ];
        loot.setBag(11, slots);

        (ILootCartographer.Terrain t, string memory name) = carto.terrainOf(11);
        assertEq(uint256(t), uint256(ILootCartographer.Terrain.Wasteland));
        assertEq(name, "Wasteland");
    }

    function test_RoadBetweenSharedOrderHigherScore() public {
        string[8] memory aSlots = [
            "Katana of Power",
            "Robe of Power",
            "Crown of Power",
            "Belt of Power",
            "Boots of Power",
            "Gloves",
            "Pendant",
            "Gold Ring"
        ];
        string[8] memory bSlots = [
            "Katana of Power",
            "Robe of Power",
            "Crown of Power",
            "Belt of Power",
            "Boots of Power",
            "Gloves",
            "Pendant",
            "Gold Ring"
        ];
        // Same loadout but different bagId → different coords (bagId is part of the seed).
        // High shared affinity should still clear the road threshold.
        loot.setBag(100, aSlots);
        loot.setBag(101, bSlots);

        ILootCartographer.Road memory r = carto.roadBetween(100, 101);
        assertTrue(r.exists);
        assertGt(r.score, 0);
    }

    function test_RoadBetweenUnrelatedBagsLikelyAbsent() public {
        string[8] memory aSlots = ["w1", "c1", "h1", "ws1", "ft1", "hd1", "nk1", "rg1"];
        string[8] memory bSlots = ["w2", "c2", "h2", "ws2", "ft2", "hd2", "nk2", "rg2"];
        loot.setBag(200, aSlots);
        loot.setBag(201, bSlots);

        ILootCartographer.Road memory r = carto.roadBetween(200, 201);
        // No shared anything → score under threshold for typical distances.
        assertFalse(r.exists);
    }

    /// @notice Fork mainnet and locate canonical Loot bag #1.
    /// @dev    Skipped silently if MAINNET_RPC_URL is not set.
    function testFork_LocateRealBag() public {
        string memory rpc = vm.envOr("MAINNET_RPC_URL", string(""));
        if (bytes(rpc).length == 0) {
            vm.skip(true);
        }
        vm.createSelectFork(rpc);

        LootCartographer real = new LootCartographer(LOOT_MAINNET);
        (int256 x, int256 y) = real.locate(1);
        emit log_named_int("bag-1 x", x);
        emit log_named_int("bag-1 y", y);
        assertGe(x, -5000);
        assertLe(x, 5000);
        assertGe(y, -5000);
        assertLe(y, 5000);
    }
}
