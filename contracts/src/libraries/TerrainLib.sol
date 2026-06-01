// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ILootCartographer } from "../interfaces/ILootCartographer.sol";
import { Orders } from "./Orders.sol";

/// @notice Terrain decision tree from (rarity, dominantOrder, greatness, coordinateNoise).
library TerrainLib {
    function classify(int256 x, int256 y, uint8 rarityCount, uint8 dominantOrder, uint256 greatnessSum)
        internal
        pure
        returns (ILootCartographer.Terrain)
    {
        if (rarityCount >= 4) return ILootCartographer.Terrain.Ruins;

        if (
            dominantOrder == Orders.POWER || dominantOrder == Orders.TITANS || dominantOrder == Orders.SKILL
        ) return ILootCartographer.Terrain.Mountains;

        if (dominantOrder == Orders.GIANTS || dominantOrder == Orders.BRILLIANCE) {
            return ILootCartographer.Terrain.Desert;
        }

        if (dominantOrder == Orders.ANGER || dominantOrder == Orders.RAGE || dominantOrder == Orders.FURY) {
            return ILootCartographer.Terrain.Wasteland;
        }

        if (
            dominantOrder == Orders.DETECTION || dominantOrder == Orders.ENLIGHTENMENT
                || dominantOrder == Orders.PROTECTION
        ) return ILootCartographer.Terrain.Forest;

        if (dominantOrder == Orders.VITRIOL || dominantOrder == Orders.THE_TWINS) {
            return ILootCartographer.Terrain.Marsh;
        }

        uint8 noise = uint8(uint256(keccak256(abi.encode(x, y, "TERRAIN_NOISE"))) % 256);

        if (noise < 32) return ILootCartographer.Terrain.Coast;
        if (greatnessSum >= 120) return ILootCartographer.Terrain.Mountains;
        if (greatnessSum <= 40) return ILootCartographer.Terrain.Plains;
        if (noise < 128) return ILootCartographer.Terrain.Forest;
        return ILootCartographer.Terrain.Plains;
    }

    function nameOf(ILootCartographer.Terrain t) internal pure returns (string memory) {
        if (t == ILootCartographer.Terrain.Plains) return "Plains";
        if (t == ILootCartographer.Terrain.Marsh) return "Marsh";
        if (t == ILootCartographer.Terrain.Forest) return "Forest";
        if (t == ILootCartographer.Terrain.Mountains) return "Mountains";
        if (t == ILootCartographer.Terrain.Ruins) return "Ruins";
        if (t == ILootCartographer.Terrain.Coast) return "Coast";
        if (t == ILootCartographer.Terrain.Desert) return "Desert";
        return "Wasteland";
    }
}
