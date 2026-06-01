// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ILoot } from "./interfaces/ILoot.sol";
import { ILootCartographer } from "./interfaces/ILootCartographer.sol";
import { Coordinates } from "./libraries/Coordinates.sol";
import { Orders } from "./libraries/Orders.sol";
import { Pluck } from "./libraries/Pluck.sol";
import { Regions } from "./libraries/Regions.sol";
import { TerrainLib } from "./libraries/TerrainLib.sol";

/// @notice Pure-view geographic derivations over Loot bags.
/// @dev    Stateless apart from the immutable Loot address. All functions are `view`
///         and free off-chain; on-chain reads (by `LootAtlas` during discoveries)
///         pay gas proportional to the number of Loot string reads (8 per locate, 16 per road).
contract LootCartographer is ILootCartographer {
    address public immutable override loot;

    /// @dev Locked from a 100k-pair sample of real mainnet Loot bags
    ///      (test/RoadDensity.t.sol + deployments/road-density-histogram.json):
    ///      threshold 5300 → est ~10.4 avg outgoing roads per bag (~41,600 roads total).
    uint256 public constant ROAD_THRESHOLD = 5300;

    /// @dev Memory bag-state used internally to avoid stack-too-deep.
    struct Bag {
        string weapon;
        string chest;
        string head;
        string waist;
        string foot;
        string hand;
        string neck;
        string ring;
        int256 x;
        int256 y;
    }

    constructor(address lootAddress) {
        require(lootAddress != address(0), "LootCartographer: zero loot");
        loot = lootAddress;
    }

    // ─── view: geography ──────────────────────────────────────────────────

    function locate(uint256 bagId) external view returns (int256 x, int256 y) {
        Bag memory b = _loadBag(bagId);
        return (b.x, b.y);
    }

    function regionOf(uint256 bagId) external view returns (Region memory) {
        Bag memory b = _loadBag(bagId);
        uint8 id = Regions.regionOf(b.x, b.y);
        (int256 cx, int256 cy) = Regions.capitalOf(id);
        return Region({ id: id, name: Regions.nameOf(id), capitalX: cx, capitalY: cy });
    }

    function terrainOf(uint256 bagId) external view returns (Terrain terrain, string memory name) {
        Bag memory b = _loadBag(bagId);
        (uint8[8] memory slotOrders, uint8 rarity) = _slotSignals(b);
        uint8 dominant = Orders.dominantOrder(slotOrders);
        uint256 g = Pluck.totalGreatness(bagId);
        terrain = TerrainLib.classify(b.x, b.y, rarity, dominant, g);
        name = TerrainLib.nameOf(terrain);
    }

    function distance(uint256 bagA, uint256 bagB) external view returns (uint256) {
        Bag memory a = _loadBag(bagA);
        Bag memory bb = _loadBag(bagB);
        return Coordinates.manhattan(a.x, a.y, bb.x, bb.y);
    }

    function roadBetween(uint256 bagA, uint256 bagB) external view returns (Road memory) {
        Bag memory a = _loadBag(bagA);
        Bag memory b = _loadBag(bagB);

        uint256 dist = Coordinates.manhattan(a.x, a.y, b.x, b.y);

        (uint8[8] memory aOrders, uint8 aRarity) = _slotSignals(a);
        (uint8[8] memory bOrders, uint8 bRarity) = _slotSignals(b);

        uint8 sharedSuffix = Orders.sharedSuffixCount(aOrders, bOrders);
        uint8 sharedTypes = _sharedSlotIdentity(a, b);

        uint8 aDom = Orders.dominantOrder(aOrders);
        uint8 bDom = Orders.dominantOrder(bOrders);
        uint8 sharedOrder = (aDom != Orders.NONE && aDom == bDom) ? 1 : 0;
        uint8 rarityResonance = aRarity < bRarity ? aRarity : bRarity;

        uint256 affinity =
            uint256(sharedOrder) * 40 + uint256(sharedSuffix) * 8 + uint256(sharedTypes) * 4
                + uint256(rarityResonance) * 6;

        // score = affinity*100 - dist/20
        int256 scoreSigned = int256(affinity) * 100 - int256(dist) / 20;
        uint256 score = scoreSigned < 0 ? 0 : uint256(scoreSigned);

        bool exists = score >= ROAD_THRESHOLD;
        uint256 cost = 0;
        if (exists) {
            // cost = dist + (10000 - affinity*70)/10
            // affinity is bounded so affinity*70 <= ~10000; clamp to avoid underflow
            uint256 sub = affinity * 70;
            uint256 base = sub >= 10_000 ? 0 : (10_000 - sub) / 10;
            cost = dist + base;
        }

        return Road({ exists: exists, cost: cost, score: score, distance: dist });
    }

    // ─── internal helpers ─────────────────────────────────────────────────

    function _loadBag(uint256 bagId) internal view returns (Bag memory b) {
        ILoot l = ILoot(loot);
        b.weapon = l.getWeapon(bagId);
        b.chest = l.getChest(bagId);
        b.head = l.getHead(bagId);
        b.waist = l.getWaist(bagId);
        b.foot = l.getFoot(bagId);
        b.hand = l.getHand(bagId);
        b.neck = l.getNeck(bagId);
        b.ring = l.getRing(bagId);
        (b.x, b.y) =
            Coordinates.locate(bagId, b.weapon, b.chest, b.head, b.waist, b.foot, b.hand, b.neck, b.ring);
    }

    function _slotSignals(Bag memory b)
        internal
        pure
        returns (uint8[8] memory slotOrders, uint8 rarityCount)
    {
        slotOrders[0] = Orders.orderOf(b.weapon);
        slotOrders[1] = Orders.orderOf(b.chest);
        slotOrders[2] = Orders.orderOf(b.head);
        slotOrders[3] = Orders.orderOf(b.waist);
        slotOrders[4] = Orders.orderOf(b.foot);
        slotOrders[5] = Orders.orderOf(b.hand);
        slotOrders[6] = Orders.orderOf(b.neck);
        slotOrders[7] = Orders.orderOf(b.ring);

        if (Orders.isNamedPlusOne(b.weapon)) rarityCount += 1;
        if (Orders.isNamedPlusOne(b.chest)) rarityCount += 1;
        if (Orders.isNamedPlusOne(b.head)) rarityCount += 1;
        if (Orders.isNamedPlusOne(b.waist)) rarityCount += 1;
        if (Orders.isNamedPlusOne(b.foot)) rarityCount += 1;
        if (Orders.isNamedPlusOne(b.hand)) rarityCount += 1;
        if (Orders.isNamedPlusOne(b.neck)) rarityCount += 1;
        if (Orders.isNamedPlusOne(b.ring)) rarityCount += 1;
    }

    /// @dev Identity-match-per-slot proxy for "shared item type". V1 scaffold heuristic:
    ///      strict equality of the full slot string. Iterate later toward base-item parsing.
    function _sharedSlotIdentity(Bag memory a, Bag memory b) internal pure returns (uint8 c) {
        if (_eq(a.weapon, b.weapon)) c += 1;
        if (_eq(a.chest, b.chest)) c += 1;
        if (_eq(a.head, b.head)) c += 1;
        if (_eq(a.waist, b.waist)) c += 1;
        if (_eq(a.foot, b.foot)) c += 1;
        if (_eq(a.hand, b.hand)) c += 1;
        if (_eq(a.neck, b.neck)) c += 1;
        if (_eq(a.ring, b.ring)) c += 1;
    }

    function _eq(string memory a, string memory b) private pure returns (bool) {
        return keccak256(bytes(a)) == keccak256(bytes(b));
    }
}
