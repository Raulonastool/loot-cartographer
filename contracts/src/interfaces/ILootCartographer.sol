// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Pure-view geographic derivations over Loot bags.
interface ILootCartographer {
    enum Terrain {
        Plains,
        Marsh,
        Forest,
        Mountains,
        Ruins,
        Coast,
        Desert,
        Wasteland
    }

    struct Region {
        uint8 id;
        string name;
        int256 capitalX;
        int256 capitalY;
    }

    struct Road {
        bool exists;
        uint256 cost;
        uint256 score;
        uint256 distance;
    }

    function loot() external view returns (address);

    function locate(uint256 bagId) external view returns (int256 x, int256 y);

    function regionOf(uint256 bagId) external view returns (Region memory);

    function terrainOf(uint256 bagId) external view returns (Terrain terrain, string memory name);

    function distance(uint256 bagA, uint256 bagB) external view returns (uint256);

    function roadBetween(uint256 bagA, uint256 bagB) external view returns (Road memory);
}
