// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice External interface to the canonical Loot (for Adventurers) contract.
/// @dev Mainnet address: 0xFF9C1b15B16263C61d017ee9F65C50e4AE0113D7
interface ILoot {
    function ownerOf(uint256 tokenId) external view returns (address);

    function getWeapon(uint256 tokenId) external view returns (string memory);
    function getChest(uint256 tokenId) external view returns (string memory);
    function getHead(uint256 tokenId) external view returns (string memory);
    function getWaist(uint256 tokenId) external view returns (string memory);
    function getFoot(uint256 tokenId) external view returns (string memory);
    function getHand(uint256 tokenId) external view returns (string memory);
    function getNeck(uint256 tokenId) external view returns (string memory);
    function getRing(uint256 tokenId) external view returns (string memory);
}
