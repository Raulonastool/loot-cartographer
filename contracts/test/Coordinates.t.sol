// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Test } from "forge-std/Test.sol";

import { Coordinates } from "../src/libraries/Coordinates.sol";

contract CoordinatesTest is Test {
    function test_LocateIsDeterministic() public pure {
        (int256 x1, int256 y1) =
            Coordinates.locate(42, "Katana", "Robe", "Crown", "Belt", "Boots", "Gloves", "Pendant", "Gold Ring");
        (int256 x2, int256 y2) =
            Coordinates.locate(42, "Katana", "Robe", "Crown", "Belt", "Boots", "Gloves", "Pendant", "Gold Ring");
        assertEq(x1, x2);
        assertEq(y1, y2);
    }

    function test_LocateDiffersAcrossBagIds() public pure {
        (int256 x1, int256 y1) = Coordinates.locate(1, "a", "b", "c", "d", "e", "f", "g", "h");
        (int256 x2, int256 y2) = Coordinates.locate(2, "a", "b", "c", "d", "e", "f", "g", "h");
        assertTrue(x1 != x2 || y1 != y2);
    }

    function testFuzz_LocateInBounds(uint256 bagId) public pure {
        (int256 x, int256 y) =
            Coordinates.locate(bagId, "w", "c", "h", "ws", "ft", "hd", "nk", "rg");
        assertGe(x, Coordinates.MIN_AXIS);
        assertLe(x, Coordinates.MAX_AXIS);
        assertGe(y, Coordinates.MIN_AXIS);
        assertLe(y, Coordinates.MAX_AXIS);
    }

    function test_ManhattanZero() public pure {
        assertEq(Coordinates.manhattan(5, 5, 5, 5), 0);
    }

    function test_ManhattanSymmetric() public pure {
        assertEq(Coordinates.manhattan(-10, 20, 30, -40), Coordinates.manhattan(30, -40, -10, 20));
        assertEq(Coordinates.manhattan(-10, 20, 30, -40), 100);
    }
}
