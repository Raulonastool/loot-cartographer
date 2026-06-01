// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Script } from "forge-std/Script.sol";
import { console2 } from "forge-std/console2.sol";

import { LootAtlas } from "../src/LootAtlas.sol";
import { LootCartographer } from "../src/LootCartographer.sol";
import { WaystoneNFT } from "../src/WaystoneNFT.sol";
import { WaystoneRenderer } from "../src/WaystoneRenderer.sol";

/// @notice Deploys the full Loot Cartographer stack against an existing Loot contract.
/// @dev    Env: LOOT_ADDRESS (the canonical Loot), DEPLOYER_PRIVATE_KEY.
contract Deploy is Script {
    function run() external {
        address lootAddress = vm.envAddress("LOOT_ADDRESS");
        uint256 pk = vm.envUint("DEPLOYER_PRIVATE_KEY");

        vm.startBroadcast(pk);

        LootCartographer carto = new LootCartographer(lootAddress);
        LootAtlas atlas = new LootAtlas(address(carto));
        WaystoneRenderer renderer = new WaystoneRenderer();
        WaystoneNFT nft = new WaystoneNFT(address(atlas), address(renderer));

        vm.stopBroadcast();

        console2.log("Loot:             ", lootAddress);
        console2.log("LootCartographer: ", address(carto));
        console2.log("LootAtlas:        ", address(atlas));
        console2.log("WaystoneRenderer: ", address(renderer));
        console2.log("WaystoneNFT:      ", address(nft));
    }
}
