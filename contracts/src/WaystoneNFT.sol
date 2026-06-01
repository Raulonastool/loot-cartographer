// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { Base64 } from "solady/utils/Base64.sol";
import { LibString } from "solady/utils/LibString.sol";

import { ILootAtlas } from "./interfaces/ILootAtlas.sol";
import { IWaystoneNFT } from "./interfaces/IWaystoneNFT.sol";
import { IWaystoneRenderer } from "./interfaces/IWaystoneRenderer.sol";

/// @notice ERC721 of Waystone artifacts. Mint is gated to the recorded discoverer
///         in LootAtlas. Renderer is set at construction and immutable.
contract WaystoneNFT is ERC721, IWaystoneNFT {
    ILootAtlas public immutable atlas;
    IWaystoneRenderer public immutable renderer;

    uint256 private _nextId = 1;

    struct RoadMeta {
        uint256 bagA;
        uint256 bagB;
    }

    mapping(uint256 => WaystoneKind) private _kindOf;
    mapping(uint256 => RoadMeta) private _roadMeta;
    mapping(uint256 => uint256[]) private _routePath;
    mapping(bytes32 => uint256) private _mintedByKey;

    error NotDiscoverer();
    error AlreadyMinted();

    constructor(address atlasAddress, address rendererAddress) ERC721("Loot Waystone", "WAYSTONE") {
        require(atlasAddress != address(0), "WaystoneNFT: zero atlas");
        require(rendererAddress != address(0), "WaystoneNFT: zero renderer");
        atlas = ILootAtlas(atlasAddress);
        renderer = IWaystoneRenderer(rendererAddress);
    }

    // ─── mints ────────────────────────────────────────────────────────────

    function mintForRoad(uint256 bagA, uint256 bagB) external returns (uint256 tokenId) {
        bytes32 key = atlas.roadKey(bagA, bagB);
        if (_mintedByKey[key] != 0) revert AlreadyMinted();

        ILootAtlas.RoadDiscovery memory d = atlas.getRoadDiscovery(bagA, bagB);
        if (d.discoverer != msg.sender) revert NotDiscoverer();

        tokenId = _nextId++;
        _mintedByKey[key] = tokenId;
        _kindOf[tokenId] = WaystoneKind.Road;
        _roadMeta[tokenId] = RoadMeta({ bagA: d.bagA, bagB: d.bagB });

        _safeMint(msg.sender, tokenId);
        emit WaystoneMinted(tokenId, WaystoneKind.Road, msg.sender, key);
    }

    function mintForRoute(uint256[] calldata path) external returns (uint256 tokenId) {
        bytes32 key = atlas.routeKey(path);
        if (_mintedByKey[key] != 0) revert AlreadyMinted();

        ILootAtlas.RouteDiscovery memory d = atlas.getRouteDiscovery(path);
        if (d.discoverer != msg.sender) revert NotDiscoverer();

        tokenId = _nextId++;
        _mintedByKey[key] = tokenId;
        _kindOf[tokenId] = WaystoneKind.Route;
        for (uint256 i = 0; i < path.length; i++) {
            _routePath[tokenId].push(path[i]);
        }

        _safeMint(msg.sender, tokenId);
        emit WaystoneMinted(tokenId, WaystoneKind.Route, msg.sender, key);
    }

    // ─── views ────────────────────────────────────────────────────────────

    function totalSupply() external view returns (uint256) {
        return _nextId - 1;
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, IWaystoneNFT) returns (string memory) {
        _requireOwned(tokenId);

        WaystoneKind k = _kindOf[tokenId];
        string memory svg;
        string memory name;
        string memory description;

        if (k == WaystoneKind.Road) {
            RoadMeta memory m = _roadMeta[tokenId];
            svg = renderer.renderRoad(m.bagA, m.bagB);
            name = string.concat(
                "Waystone of Road ", LibString.toString(m.bagA), " \xE2\x86\x92 ", LibString.toString(m.bagB)
            );
            description = "An onchain record of a discovered road between two Loot bags.";
        } else {
            uint256[] memory path = _routePath[tokenId];
            svg = renderer.renderRoute(path);
            name = string.concat(
                "Waystone of Route (",
                LibString.toString(path.length),
                " bags from ",
                LibString.toString(path[0]),
                " to ",
                LibString.toString(path[path.length - 1]),
                ")"
            );
            description = "An onchain record of a charted route across the Loot world.";
        }

        string memory json = string.concat(
            '{"name":"',
            name,
            '","description":"',
            description,
            '","image":"data:image/svg+xml;base64,',
            Base64.encode(bytes(svg)),
            '"}'
        );

        return string.concat("data:application/json;base64,", Base64.encode(bytes(json)));
    }
}
