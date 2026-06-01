// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { LibString } from "solady/utils/LibString.sol";

import { IWaystoneRenderer } from "./interfaces/IWaystoneRenderer.sol";
import { Glyphs } from "./libraries/Glyphs.sol";

/// @notice Onchain SVG renderer for Waystone artifacts.
/// @dev    Deterministic from the discovery key. Visual vocabulary: carved stone outline,
///         3x3 sigil grid, coordinate inscription. Not characters, not PFPs.
contract WaystoneRenderer is IWaystoneRenderer {
    string private constant SVG_HEAD =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 280" preserveAspectRatio="xMidYMid meet">';
    string private constant BACKDROP = '<rect width="200" height="280" fill="#1a140d"/>';
    string private constant SVG_TAIL = "</svg>";

    string private constant STROKE = '" fill="none" stroke="#e8ddb5" stroke-width="1.2"/>';
    string private constant STROKE_THIN = '" fill="none" stroke="#9c8b66" stroke-width="0.6"/>';

    function renderRoad(uint256 bagA, uint256 bagB) external pure returns (string memory) {
        (uint256 lo, uint256 hi) = bagA < bagB ? (bagA, bagB) : (bagB, bagA);
        bytes32 key = keccak256(abi.encode("ROAD", lo, hi));
        string memory inscription = string.concat(LibString.toString(lo), " \xE2\x86\x92 ", LibString.toString(hi));
        return _render(key, inscription);
    }

    function renderRoute(uint256[] calldata path) external pure returns (string memory) {
        bytes32 key = keccak256(abi.encodePacked("ROUTE", path));
        string memory inscription =
            string.concat(LibString.toString(path[0]), " /", LibString.toString(path.length), " stops/ ",
                LibString.toString(path[path.length - 1]));
        return _render(key, inscription);
    }

    // ─── internals ────────────────────────────────────────────────────────

    function _render(bytes32 key, string memory inscription) private pure returns (string memory) {
        return string.concat(
            SVG_HEAD,
            BACKDROP,
            _stone(key),
            _glyphGrid(key),
            _inscription(inscription),
            SVG_TAIL
        );
    }

    function _stone(bytes32 key) private pure returns (string memory) {
        // 8-vertex octagon, perturbed by hash bytes. Center (100, 130), radius 80.
        int16[16] memory baseXY = [
            int16(180), 130,
            157, 187,
            100, 210,
            43, 187,
            20, 130,
            43, 73,
            100, 50,
            157, 73
        ];

        string memory points = "";
        for (uint256 i = 0; i < 8; i++) {
            // Perturb each vertex by [-5, +5] from two hash bytes.
            int16 dx = int16(int8(uint8(key[i * 2]))) / 26;     // ~[-5, 4]
            int16 dy = int16(int8(uint8(key[i * 2 + 1]))) / 26;
            int16 px = baseXY[i * 2] + dx;
            int16 py = baseXY[i * 2 + 1] + dy;
            points = string.concat(
                points, _i16(px), ",", _i16(py), i == 7 ? "" : " "
            );
        }

        return string.concat('<polygon points="', points, STROKE);
    }

    function _glyphGrid(bytes32 key) private pure returns (string memory out) {
        // 3x3 grid of 30x30 cells. Top-left of grid at (55, 85).
        out = "";
        for (uint8 row = 0; row < 3; row++) {
            for (uint8 col = 0; col < 3; col++) {
                uint8 idx = row * 3 + col;
                uint8 b = uint8(key[16 + idx]);
                if (b < 64) continue; // ~25% empty cells
                uint8 g = b % 8;
                uint16 cx = 55 + uint16(col) * 30;
                uint16 cy = 85 + uint16(row) * 30;
                out = string.concat(
                    out,
                    '<g transform="translate(',
                    LibString.toString(cx),
                    " ",
                    LibString.toString(cy),
                    ')"><path d="',
                    Glyphs.pathFor(g),
                    STROKE
                );
                out = string.concat(out, "</g>");
            }
        }
    }

    function _inscription(string memory text) private pure returns (string memory) {
        return string.concat(
            '<text x="100" y="255" font-family="serif" font-size="11" fill="#9c8b66" text-anchor="middle">',
            text,
            "</text>",
            // a subtle base rule under the inscription
            '<line x1="60" y1="263" x2="140" y2="263',
            STROKE_THIN
        );
    }

    function _i16(int16 v) private pure returns (string memory) {
        if (v >= 0) return LibString.toString(uint256(uint16(v)));
        return string.concat("-", LibString.toString(uint256(uint16(-v))));
    }
}
