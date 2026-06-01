// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice SVG path-data constants for Waystone glyphs.
/// @dev    Eight minimal runic strokes designed to feel like carved marks rather than icons.
///         Coordinates are normalized into a 20x20 cell; the renderer translates them.
library Glyphs {
    function pathFor(uint8 i) internal pure returns (string memory) {
        uint8 g = i % 8;
        if (g == 0) return "M2 2L18 18M18 2L2 18"; // saltire
        if (g == 1) return "M10 2V18M2 10H18"; // cross
        if (g == 2) return "M10 2L18 10L10 18L2 10Z"; // diamond
        if (g == 3) return "M2 14L10 2L18 14"; // peak
        if (g == 4) return "M2 6L18 6M2 14L18 14"; // double rule
        if (g == 5) return "M2 10H18M10 4V16"; // long cross
        if (g == 6) return "M4 4L16 4L10 16Z"; // triangle
        return "M4 10A6 6 0 1 1 16 10A6 6 0 1 1 4 10Z"; // ring
    }
}
