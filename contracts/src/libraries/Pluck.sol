// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { LibString } from "solady/utils/LibString.sol";

/// @notice Exact port of canonical Loot's `pluck()` greatness derivation.
/// @dev    From Loot.sol:
///           function random(string memory input) internal pure returns (uint256) {
///               return uint256(keccak256(abi.encodePacked(input)));
///           }
///           function pluck(uint256 tokenId, string memory keyPrefix, ...) {
///               uint256 rand = random(string(abi.encodePacked(keyPrefix, toString(tokenId))));
///               uint256 greatness = rand % 21;
///               ...
///           }
///         We only need `greatness` (the [0, 20] integer) per slot. The bag's
///         total greatness for terrain decisions is the sum across 8 slots.
library Pluck {
    string internal constant KEY_WEAPON = "WEAPON";
    string internal constant KEY_CHEST = "CHEST";
    string internal constant KEY_HEAD = "HEAD";
    string internal constant KEY_WAIST = "WAIST";
    string internal constant KEY_FOOT = "FOOT";
    string internal constant KEY_HAND = "HAND";
    string internal constant KEY_NECK = "NECK";
    string internal constant KEY_RING = "RING";

    function greatness(uint256 tokenId, string memory keyPrefix) internal pure returns (uint8) {
        uint256 rand = uint256(keccak256(abi.encodePacked(keyPrefix, LibString.toString(tokenId))));
        return uint8(rand % 21);
    }

    /// @notice Sum greatness across all 8 slots. Range [0, 160].
    function totalGreatness(uint256 tokenId) internal pure returns (uint256 g) {
        unchecked {
            g += greatness(tokenId, KEY_WEAPON);
            g += greatness(tokenId, KEY_CHEST);
            g += greatness(tokenId, KEY_HEAD);
            g += greatness(tokenId, KEY_WAIST);
            g += greatness(tokenId, KEY_FOOT);
            g += greatness(tokenId, KEY_HAND);
            g += greatness(tokenId, KEY_NECK);
            g += greatness(tokenId, KEY_RING);
        }
    }
}
