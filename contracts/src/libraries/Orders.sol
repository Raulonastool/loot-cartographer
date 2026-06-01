// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Detection of the 16 canonical Loot order suffixes and the per-bag dominant order.
/// @dev    Loot items can carry a suffix like " of Power" or " of the Twins" when greatness >= 15.
///         Greatness == 20 items also carry a trailing " +1".
library Orders {
    /// @dev Order ids are 1..16. Zero means "no order present".
    uint8 internal constant NONE = 0;
    uint8 internal constant POWER = 1;
    uint8 internal constant GIANTS = 2;
    uint8 internal constant TITANS = 3;
    uint8 internal constant SKILL = 4;
    uint8 internal constant PERFECTION = 5;
    uint8 internal constant BRILLIANCE = 6;
    uint8 internal constant ENLIGHTENMENT = 7;
    uint8 internal constant PROTECTION = 8;
    uint8 internal constant ANGER = 9;
    uint8 internal constant RAGE = 10;
    uint8 internal constant FURY = 11;
    uint8 internal constant VITRIOL = 12;
    uint8 internal constant THE_FOX = 13;
    uint8 internal constant DETECTION = 14;
    uint8 internal constant REFLECTION = 15;
    uint8 internal constant THE_TWINS = 16;

    uint8 internal constant ORDER_COUNT = 16;

    /// @notice Return the canonical order id present in `item`, or 0 if none.
    /// @dev    Strips trailing " +1" if present, then checks if the item ends with one of
    ///         the 16 known order suffixes.
    function orderOf(string memory item) internal pure returns (uint8) {
        bytes memory b = bytes(item);
        uint256 end = b.length;

        // Strip " +1" tail (3 bytes)
        if (end >= 3 && b[end - 3] == 0x20 && b[end - 2] == 0x2b && b[end - 1] == 0x31) {
            end -= 3;
        }

        if (end < 8) return NONE; // shortest suffix is " of Fox" (7) → fox is " of the Fox" (11); shortest is " of Rage" (8)

        // Check each known suffix
        if (_endsWith(b, end, " of Power")) return POWER;
        if (_endsWith(b, end, " of Giants")) return GIANTS;
        if (_endsWith(b, end, " of Titans")) return TITANS;
        if (_endsWith(b, end, " of Skill")) return SKILL;
        if (_endsWith(b, end, " of Perfection")) return PERFECTION;
        if (_endsWith(b, end, " of Brilliance")) return BRILLIANCE;
        if (_endsWith(b, end, " of Enlightenment")) return ENLIGHTENMENT;
        if (_endsWith(b, end, " of Protection")) return PROTECTION;
        if (_endsWith(b, end, " of Anger")) return ANGER;
        if (_endsWith(b, end, " of Rage")) return RAGE;
        if (_endsWith(b, end, " of Fury")) return FURY;
        if (_endsWith(b, end, " of Vitriol")) return VITRIOL;
        if (_endsWith(b, end, " of the Fox")) return THE_FOX;
        if (_endsWith(b, end, " of Detection")) return DETECTION;
        if (_endsWith(b, end, " of Reflection")) return REFLECTION;
        if (_endsWith(b, end, " of the Twins")) return THE_TWINS;
        return NONE;
    }

    /// @notice Whether `item` ends with the rarity tag " +1".
    function isNamedPlusOne(string memory item) internal pure returns (bool) {
        bytes memory b = bytes(item);
        uint256 n = b.length;
        if (n < 3) return false;
        return b[n - 3] == 0x20 && b[n - 2] == 0x2b && b[n - 1] == 0x31;
    }

    /// @notice The most-frequent order across 8 slots; ties broken by slot priority
    ///         (weapon > chest > head > waist > foot > hand > neck > ring).
    /// @dev    Passed pre-computed per-slot order ids so callers can reuse them.
    function dominantOrder(uint8[8] memory slotOrders) internal pure returns (uint8) {
        uint8[17] memory counts; // index 0 is "none"; indices 1..16 are real orders
        for (uint256 i = 0; i < 8; i++) {
            counts[slotOrders[i]] += 1;
        }

        uint8 bestOrder = NONE;
        uint8 bestCount = 0;
        // Walk by slot priority: first slot to claim a count-tied lead wins.
        for (uint256 i = 0; i < 8; i++) {
            uint8 o = slotOrders[i];
            if (o == NONE) continue;
            if (counts[o] > bestCount) {
                bestCount = counts[o];
                bestOrder = o;
            }
        }
        return bestOrder;
    }

    /// @notice Number of slots where two bags share the same order id (non-zero).
    function sharedSuffixCount(uint8[8] memory a, uint8[8] memory b) internal pure returns (uint8 count) {
        for (uint256 i = 0; i < 8; i++) {
            if (a[i] != NONE && a[i] == b[i]) {
                unchecked {
                    count += 1;
                }
            }
        }
    }

    function _endsWith(bytes memory b, uint256 end, string memory suffix) private pure returns (bool) {
        bytes memory s = bytes(suffix);
        uint256 slen = s.length;
        if (end < slen) return false;
        uint256 off = end - slen;
        for (uint256 i = 0; i < slen; i++) {
            if (b[off + i] != s[i]) return false;
        }
        return true;
    }
}
