// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Deterministic coordinate derivation for Loot bags.
/// @dev    Coordinates live in a bounded plane `(-5000, 5000)` on both axes,
///         giving a 10001 x 10001 grid. Modulo bias with a 128-bit dividend
///         and a 10001 divisor is ~3e-35 — negligible.
library Coordinates {
    int256 internal constant MIN_AXIS = -5000;
    int256 internal constant MAX_AXIS = 5000;
    uint256 internal constant AXIS_SPAN = 10_001;

    /// @notice Derive (x, y) from a bag's metadata fingerprint.
    /// @param  bagId      Loot token id
    /// @param  weapon..   The 8 item strings as returned by ILoot getters
    /// @return x          int in [-5000, 5000]
    /// @return y          int in [-5000, 5000]
    function locate(
        uint256 bagId,
        string memory weapon,
        string memory chest,
        string memory head,
        string memory waist,
        string memory foot,
        string memory hand,
        string memory neck,
        string memory ring
    ) internal pure returns (int256 x, int256 y) {
        bytes32 seed = keccak256(abi.encode(bagId, weapon, chest, head, waist, foot, hand, neck, ring));

        uint256 seedUint = uint256(seed);
        uint256 xRaw = uint256(uint128(seedUint));
        uint256 yRaw = uint256(uint128(seedUint >> 128));

        x = int256(xRaw % AXIS_SPAN) + MIN_AXIS;
        y = int256(yRaw % AXIS_SPAN) + MIN_AXIS;
    }

    /// @notice Manhattan distance between two coordinate pairs.
    function manhattan(int256 ax, int256 ay, int256 bx, int256 by) internal pure returns (uint256) {
        unchecked {
            uint256 dx = ax > bx ? uint256(ax - bx) : uint256(bx - ax);
            uint256 dy = ay > by ? uint256(ay - by) : uint256(by - ay);
            return dx + dy;
        }
    }
}
