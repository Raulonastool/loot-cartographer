// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Script } from "forge-std/Script.sol";
import { console2 } from "forge-std/console2.sol";

import { LootAtlas } from "../src/LootAtlas.sol";
import { LootCartographer } from "../src/LootCartographer.sol";
import { WaystoneNFT } from "../src/WaystoneNFT.sol";
import { WaystoneRenderer } from "../src/WaystoneRenderer.sol";
import { MockLoot } from "../test/helpers/MockLoot.sol";

/// @notice Local-dev deployment: stands up MockLoot + the full stack on Anvil and seeds
///         a handful of bags so the frontend has something to render.
/// @dev    Writes deployed addresses to /broadcast/SeedAnvil.s.sol/31337/addresses.json
///         (and a copy under apps/web for the UI). Uses the Anvil default key by default.
contract SeedAnvil is Script {
    uint256 internal constant DEFAULT_KEY = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;

    function run() external {
        uint256 pk = vm.envOr("ANVIL_DEPLOYER_PRIVATE_KEY", DEFAULT_KEY);

        vm.startBroadcast(pk);

        MockLoot loot = new MockLoot();
        LootCartographer carto = new LootCartographer(address(loot));
        LootAtlas atlas = new LootAtlas(address(carto));
        WaystoneRenderer renderer = new WaystoneRenderer();
        WaystoneNFT nft = new WaystoneNFT(address(atlas), address(renderer));

        // Seed some sample bags. Bag #1 and #2 share the Power order → road exists.
        string[8] memory powerLoadout = [
            string("Katana of Power"),
            "Robe of Power",
            "Crown of Power",
            "Belt of Power",
            "Boots of Power",
            "Gloves",
            "Pendant",
            "Gold Ring"
        ];
        loot.setBag(1, powerLoadout);
        loot.setBag(2, powerLoadout);

        string[8] memory brillianceLoadout = [
            string("Wand of Brilliance"),
            "Robe of Brilliance",
            "Crown of Brilliance",
            "Belt",
            "Boots",
            "Gloves",
            "Pendant",
            "Silver Ring"
        ];
        loot.setBag(3, brillianceLoadout);
        loot.setBag(4, brillianceLoadout);

        string[8] memory angerLoadout = [
            string("Maul of Anger"),
            "Mail of Anger",
            "Helm",
            "Belt",
            "Boots",
            "Gauntlets",
            "Pendant",
            "Bronze Ring"
        ];
        loot.setBag(5, angerLoadout);

        string[8] memory plainLoadout = [
            string("Quarterstaff"),
            "Shirt",
            "Cap",
            "Sash",
            "Shoes",
            "Gloves",
            "Pendant",
            "Gold Ring"
        ];
        loot.setBag(6, plainLoadout);

        vm.stopBroadcast();

        console2.log("MockLoot:         ", address(loot));
        console2.log("LootCartographer: ", address(carto));
        console2.log("LootAtlas:        ", address(atlas));
        console2.log("WaystoneRenderer: ", address(renderer));
        console2.log("WaystoneNFT:      ", address(nft));

        _writeAddresses(address(loot), address(carto), address(atlas), address(renderer), address(nft));
    }

    function _writeAddresses(address loot, address carto, address atlas, address renderer, address nft) internal {
        string memory json = string.concat(
            "{\n",
            '  "chainId": 31337,\n',
            '  "loot": "',          vm.toString(loot),     '",\n',
            '  "cartographer": "',  vm.toString(carto),    '",\n',
            '  "atlas": "',         vm.toString(atlas),    '",\n',
            '  "renderer": "',      vm.toString(renderer), '",\n',
            '  "waystone": "',      vm.toString(nft),      '"\n',
            "}\n"
        );
        vm.writeFile("./deployments/anvil.json", json);
        // Also drop a copy where the web app expects it.
        vm.writeFile("../apps/web/public/anvil-addresses.json", json);
    }
}
