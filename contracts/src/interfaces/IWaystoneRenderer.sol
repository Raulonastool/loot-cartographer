// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Pure SVG renderer for Waystone glyphs.
interface IWaystoneRenderer {
    function renderRoad(uint256 bagA, uint256 bagB) external view returns (string memory svg);

    function renderRoute(uint256[] calldata path) external view returns (string memory svg);
}
