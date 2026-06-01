// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Test } from "forge-std/Test.sol";

import { WaystoneRenderer } from "../src/WaystoneRenderer.sol";

contract WaystoneRendererTest is Test {
    WaystoneRenderer internal renderer;

    function setUp() public {
        renderer = new WaystoneRenderer();
    }

    function test_RenderRoadReturnsNonEmptySVG() public view {
        string memory svg = renderer.renderRoad(1, 2);
        bytes memory b = bytes(svg);
        assertGt(b.length, 200);
        // Starts with "<svg"
        assertEq(b[0], bytes1("<"));
        assertEq(b[1], bytes1("s"));
        assertEq(b[2], bytes1("v"));
        assertEq(b[3], bytes1("g"));
    }

    function test_RenderRoadIsDeterministic() public view {
        string memory s1 = renderer.renderRoad(1, 2);
        string memory s2 = renderer.renderRoad(2, 1); // order shouldn't matter
        assertEq(keccak256(bytes(s1)), keccak256(bytes(s2)));
    }

    function test_RenderRouteReturnsNonEmptySVG() public view {
        uint256[] memory path = new uint256[](3);
        path[0] = 1;
        path[1] = 2;
        path[2] = 3;
        string memory svg = renderer.renderRoute(path);
        assertGt(bytes(svg).length, 200);
    }
}
