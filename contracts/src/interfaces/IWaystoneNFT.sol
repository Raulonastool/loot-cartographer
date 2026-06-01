// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice ERC721 of Waystone artifacts; mint gated to the recorded discoverer in LootAtlas.
interface IWaystoneNFT {
    enum WaystoneKind {
        Road,
        Route
    }

    event WaystoneMinted(
        uint256 indexed tokenId, WaystoneKind kind, address indexed minter, bytes32 indexed discoveryKey
    );

    function mintForRoad(uint256 bagA, uint256 bagB) external returns (uint256 tokenId);
    function mintForRoute(uint256[] calldata path) external returns (uint256 tokenId);

    function tokenURI(uint256 tokenId) external view returns (string memory);
    function totalSupply() external view returns (uint256);
    function tokenForRoad(uint256 bagA, uint256 bagB) external view returns (uint256);
    function tokenForRoute(uint256[] calldata path) external view returns (uint256);
}
