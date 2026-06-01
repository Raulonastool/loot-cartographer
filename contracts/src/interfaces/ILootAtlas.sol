// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Permissionless registry of discovered roads and routes.
interface ILootAtlas {
    event RoadDiscovered(
        bytes32 indexed key,
        uint256 indexed bagA,
        uint256 indexed bagB,
        address discoverer,
        uint64 discoveryId
    );

    event RouteDiscovered(
        bytes32 indexed key, address indexed discoverer, uint256 totalCost, uint64 discoveryId
    );

    struct RoadDiscovery {
        uint256 bagA;
        uint256 bagB;
        address discoverer;
        uint64 blockNumber;
        uint64 discoveryId;
    }

    struct RouteDiscovery {
        uint256[] bagIds;
        address discoverer;
        uint64 blockNumber;
        uint64 discoveryId;
        uint256 totalCost;
    }

    function cartographer() external view returns (address);
    function roadCount() external view returns (uint64);
    function routeCount() external view returns (uint64);

    function discoverRoad(uint256 bagA, uint256 bagB) external returns (uint64 discoveryId);
    function discoverRoute(uint256[] calldata path) external returns (uint64 discoveryId);

    function roadKey(uint256 bagA, uint256 bagB) external pure returns (bytes32);
    function routeKey(uint256[] calldata path) external pure returns (bytes32);

    function getRoadDiscovery(uint256 bagA, uint256 bagB) external view returns (RoadDiscovery memory);
    function getRouteDiscovery(uint256[] calldata path) external view returns (RouteDiscovery memory);
}
