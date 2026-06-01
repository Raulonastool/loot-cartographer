// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ILootAtlas } from "./interfaces/ILootAtlas.sol";
import { ILootCartographer } from "./interfaces/ILootCartographer.sol";

/// @notice Permissionless registry of discovered roads and routes.
/// @dev    First-discoverer-wins. No fees. Duplicate registrations revert.
contract LootAtlas is ILootAtlas {
    address public immutable override cartographer;

    uint256 public constant MAX_ROUTE_LENGTH = 16;

    uint64 public override roadCount;
    uint64 public override routeCount;

    mapping(bytes32 => RoadDiscovery) private _roads;
    mapping(bytes32 => RouteDiscovery) private _routes;

    error AlreadyDiscovered();
    error NoSuchRoad();
    error RoutePathTooShort();
    error RoutePathTooLong();

    constructor(address cartographerAddress) {
        require(cartographerAddress != address(0), "LootAtlas: zero cartographer");
        cartographer = cartographerAddress;
    }

    // ─── writes ───────────────────────────────────────────────────────────

    function discoverRoad(uint256 bagA, uint256 bagB) external returns (uint64 discoveryId) {
        bytes32 key = roadKey(bagA, bagB);
        if (_roads[key].discoverer != address(0)) revert AlreadyDiscovered();

        ILootCartographer.Road memory r = ILootCartographer(cartographer).roadBetween(bagA, bagB);
        if (!r.exists) revert NoSuchRoad();

        unchecked {
            discoveryId = ++roadCount;
        }

        (uint256 lo, uint256 hi) = _sorted(bagA, bagB);
        _roads[key] = RoadDiscovery({
            bagA: lo,
            bagB: hi,
            discoverer: msg.sender,
            blockNumber: uint64(block.number),
            discoveryId: discoveryId
        });

        emit RoadDiscovered(key, lo, hi, msg.sender, discoveryId);
    }

    function discoverRoute(uint256[] calldata path) external returns (uint64 discoveryId) {
        if (path.length < 2) revert RoutePathTooShort();
        if (path.length > MAX_ROUTE_LENGTH) revert RoutePathTooLong();

        bytes32 key = routeKey(path);
        if (_routes[key].discoverer != address(0)) revert AlreadyDiscovered();

        ILootCartographer carto = ILootCartographer(cartographer);
        uint256 totalCost;
        for (uint256 i = 0; i + 1 < path.length; i++) {
            ILootCartographer.Road memory r = carto.roadBetween(path[i], path[i + 1]);
            if (!r.exists) revert NoSuchRoad();
            unchecked {
                totalCost += r.cost;
            }
        }

        unchecked {
            discoveryId = ++routeCount;
        }

        _routes[key] = RouteDiscovery({
            bagIds: path,
            discoverer: msg.sender,
            blockNumber: uint64(block.number),
            discoveryId: discoveryId,
            totalCost: totalCost
        });

        emit RouteDiscovered(key, msg.sender, totalCost, discoveryId);
    }

    // ─── views ────────────────────────────────────────────────────────────

    function roadKey(uint256 bagA, uint256 bagB) public pure returns (bytes32) {
        (uint256 lo, uint256 hi) = _sorted(bagA, bagB);
        return keccak256(abi.encode(lo, hi));
    }

    function routeKey(uint256[] calldata path) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(path));
    }

    function getRoadDiscovery(uint256 bagA, uint256 bagB) external view returns (RoadDiscovery memory) {
        return _roads[roadKey(bagA, bagB)];
    }

    function getRouteDiscovery(uint256[] calldata path) external view returns (RouteDiscovery memory) {
        return _routes[routeKey(path)];
    }

    // ─── helpers ──────────────────────────────────────────────────────────

    function _sorted(uint256 a, uint256 b) private pure returns (uint256 lo, uint256 hi) {
        return a < b ? (a, b) : (b, a);
    }
}
