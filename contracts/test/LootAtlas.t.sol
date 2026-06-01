// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Test } from "forge-std/Test.sol";

import { ILootAtlas } from "../src/interfaces/ILootAtlas.sol";
import { LootAtlas } from "../src/LootAtlas.sol";
import { LootCartographer } from "../src/LootCartographer.sol";
import { MockLoot } from "./helpers/MockLoot.sol";

contract LootAtlasTest is Test {
    LootAtlas internal atlas;
    LootCartographer internal carto;
    MockLoot internal loot;

    address internal alice = address(0xA11CE);
    address internal bob = address(0xB0B);

    function setUp() public {
        loot = new MockLoot();
        carto = new LootCartographer(address(loot));
        atlas = new LootAtlas(address(carto));

        // Two bags with identical Power-stacked loadout → guaranteed road.
        string[8] memory slots = [
            "Katana of Power",
            "Robe of Power",
            "Crown of Power",
            "Belt of Power",
            "Boots of Power",
            "Gloves",
            "Pendant",
            "Gold Ring"
        ];
        loot.setBag(1, slots);
        loot.setBag(2, slots);

        // Unrelated pair → no road
        string[8] memory aSlots = ["w1", "c1", "h1", "ws1", "ft1", "hd1", "nk1", "rg1"];
        string[8] memory bSlots = ["w2", "c2", "h2", "ws2", "ft2", "hd2", "nk2", "rg2"];
        loot.setBag(10, aSlots);
        loot.setBag(11, bSlots);
    }

    function test_DiscoverRoadEmitsEvent() public {
        vm.prank(alice);
        vm.expectEmit(false, true, true, false);
        emit ILootAtlas.RoadDiscovered(bytes32(0), 1, 2, alice, 1);
        atlas.discoverRoad(1, 2);

        assertEq(atlas.roadCount(), 1);

        ILootAtlas.RoadDiscovery memory d = atlas.getRoadDiscovery(1, 2);
        assertEq(d.bagA, 1);
        assertEq(d.bagB, 2);
        assertEq(d.discoverer, alice);
        assertEq(d.discoveryId, 1);
    }

    function test_DiscoverRoadRevertsOnDuplicate() public {
        vm.prank(alice);
        atlas.discoverRoad(1, 2);

        vm.expectRevert(LootAtlas.AlreadyDiscovered.selector);
        vm.prank(bob);
        atlas.discoverRoad(1, 2);
    }

    function test_DiscoverRoadRevertsIfNoRoad() public {
        vm.expectRevert(LootAtlas.NoSuchRoad.selector);
        vm.prank(alice);
        atlas.discoverRoad(10, 11);
    }

    function test_DiscoverRoadCanonicalizesPair() public {
        vm.prank(alice);
        atlas.discoverRoad(2, 1); // reversed order

        vm.expectRevert(LootAtlas.AlreadyDiscovered.selector);
        vm.prank(bob);
        atlas.discoverRoad(1, 2);
    }

    function test_RouteValidatesEveryHop() public {
        loot.setBag(3, _powerSlots());
        loot.setBag(4, _powerSlots());

        uint256[] memory path = new uint256[](3);
        path[0] = 1;
        path[1] = 2;
        path[2] = 3;

        vm.prank(alice);
        uint64 id = atlas.discoverRoute(path);
        assertEq(id, 1);
        assertEq(atlas.routeCount(), 1);

        ILootAtlas.RouteDiscovery memory d = atlas.getRouteDiscovery(path);
        assertEq(d.bagIds.length, 3);
        assertEq(d.discoverer, alice);
    }

    function test_RouteRejectsShortPath() public {
        uint256[] memory path = new uint256[](1);
        path[0] = 1;
        vm.expectRevert(LootAtlas.RoutePathTooShort.selector);
        atlas.discoverRoute(path);
    }

    function test_RouteRejectsBrokenLink() public {
        uint256[] memory path = new uint256[](2);
        path[0] = 1;
        path[1] = 10; // unrelated bag
        vm.expectRevert(LootAtlas.NoSuchRoad.selector);
        atlas.discoverRoute(path);
    }

    function _powerSlots() internal pure returns (string[8] memory s) {
        s = [
            string("Katana of Power"),
            "Robe of Power",
            "Crown of Power",
            "Belt of Power",
            "Boots of Power",
            "Gloves",
            "Pendant",
            "Gold Ring"
        ];
    }
}
