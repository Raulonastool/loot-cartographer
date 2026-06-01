// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Test } from "forge-std/Test.sol";
import { LibString } from "solady/utils/LibString.sol";

import { LootAtlas } from "../src/LootAtlas.sol";
import { LootCartographer } from "../src/LootCartographer.sol";
import { WaystoneNFT } from "../src/WaystoneNFT.sol";
import { WaystoneRenderer } from "../src/WaystoneRenderer.sol";
import { MockLoot } from "./helpers/MockLoot.sol";

contract WaystoneNFTTest is Test {
    LootAtlas internal atlas;
    LootCartographer internal carto;
    WaystoneRenderer internal renderer;
    WaystoneNFT internal nft;
    MockLoot internal loot;

    address internal alice = address(0xA11CE);
    address internal bob = address(0xB0B);

    function setUp() public {
        loot = new MockLoot();
        carto = new LootCartographer(address(loot));
        atlas = new LootAtlas(address(carto));
        renderer = new WaystoneRenderer();
        nft = new WaystoneNFT(address(atlas), address(renderer));

        // Bags 1 & 2 share a Power-stacked loadout → guaranteed road.
        loot.setBag(1, _powerSlots());
        loot.setBag(2, _powerSlots());
    }

    function test_MintForRoadByDiscoverer() public {
        vm.prank(alice);
        atlas.discoverRoad(1, 2);

        vm.prank(alice);
        uint256 id = nft.mintForRoad(1, 2);

        assertEq(id, 1);
        assertEq(nft.ownerOf(1), alice);
        assertEq(nft.totalSupply(), 1);
    }

    function test_MintRevertsForNonDiscoverer() public {
        vm.prank(alice);
        atlas.discoverRoad(1, 2);

        vm.expectRevert(WaystoneNFT.NotDiscoverer.selector);
        vm.prank(bob);
        nft.mintForRoad(1, 2);
    }

    function test_MintRevertsWhenNotDiscovered() public {
        vm.expectRevert(WaystoneNFT.NotDiscoverer.selector);
        vm.prank(alice);
        nft.mintForRoad(1, 2);
    }

    function test_MintRevertsOnAlreadyMinted() public {
        vm.prank(alice);
        atlas.discoverRoad(1, 2);
        vm.prank(alice);
        nft.mintForRoad(1, 2);

        vm.expectRevert(WaystoneNFT.AlreadyMinted.selector);
        vm.prank(alice);
        nft.mintForRoad(1, 2);
    }

    function test_TokenForRoadZeroWhenUnminted() public view {
        assertEq(nft.tokenForRoad(1, 2), 0);
    }

    function test_TokenForRoadReturnsIdAfterMint() public {
        vm.prank(alice);
        atlas.discoverRoad(1, 2);
        vm.prank(alice);
        nft.mintForRoad(1, 2);

        assertEq(nft.tokenForRoad(1, 2), 1);
    }

    function test_TokenForRoadOrderIndependent() public {
        vm.prank(alice);
        atlas.discoverRoad(1, 2);
        vm.prank(alice);
        nft.mintForRoad(1, 2);

        assertEq(nft.tokenForRoad(2, 1), 1);
    }

    function test_TokenURIShape() public {
        vm.prank(alice);
        atlas.discoverRoad(1, 2);
        vm.prank(alice);
        nft.mintForRoad(1, 2);

        string memory uri = nft.tokenURI(1);
        assertTrue(LibString.startsWith(uri, "data:application/json;base64,"));
    }

    function test_TokenURIRevertsForUnowned() public {
        vm.expectRevert();
        nft.tokenURI(999);
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
