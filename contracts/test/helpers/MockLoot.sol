// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ILoot } from "../../src/interfaces/ILoot.sol";

/// @notice Configurable Loot mock for non-fork tests.
/// @dev    Allows per-bag string assignments. Unset slots return "" (empty),
///         which still produces deterministic but unique coordinates.
contract MockLoot is ILoot {
    mapping(uint256 => string[8]) private _items;
    mapping(uint256 => address) private _owners;

    /// @param slots indexed [weapon, chest, head, waist, foot, hand, neck, ring]
    function setBag(uint256 tokenId, string[8] memory slots) external {
        _items[tokenId] = slots;
    }

    function setOwner(uint256 tokenId, address owner) external {
        _owners[tokenId] = owner;
    }

    function ownerOf(uint256 tokenId) external view returns (address) {
        return _owners[tokenId];
    }

    function getWeapon(uint256 tokenId) external view returns (string memory) {
        return _items[tokenId][0];
    }

    function getChest(uint256 tokenId) external view returns (string memory) {
        return _items[tokenId][1];
    }

    function getHead(uint256 tokenId) external view returns (string memory) {
        return _items[tokenId][2];
    }

    function getWaist(uint256 tokenId) external view returns (string memory) {
        return _items[tokenId][3];
    }

    function getFoot(uint256 tokenId) external view returns (string memory) {
        return _items[tokenId][4];
    }

    function getHand(uint256 tokenId) external view returns (string memory) {
        return _items[tokenId][5];
    }

    function getNeck(uint256 tokenId) external view returns (string memory) {
        return _items[tokenId][6];
    }

    function getRing(uint256 tokenId) external view returns (string memory) {
        return _items[tokenId][7];
    }
}
