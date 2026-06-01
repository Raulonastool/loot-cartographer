// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Coordinates } from "./Coordinates.sol";

/// @notice 32 hand-authored region capitals and Voronoi-by-Manhattan region assignment.
/// @dev    Names and capital coordinates are locked at deploy time. To change them
///         we ship a new contract — chain is source of truth.
library Regions {
    uint8 internal constant REGION_COUNT = 32;

    /// @notice Lookup capital coordinates by region id.
    function capitalOf(uint8 id) internal pure returns (int256 x, int256 y) {
        if (id == 0) return (-4500, 4200);
        if (id == 1) return (-2800, 4100);
        if (id == 2) return (-800, 4500);
        if (id == 3) return (1500, 4300);
        if (id == 4) return (3800, 4400);
        if (id == 5) return (-4200, 2400);
        if (id == 6) return (-1700, 2800);
        if (id == 7) return (700, 2200);
        if (id == 8) return (3100, 2500);
        if (id == 9) return (4600, 1800);
        if (id == 10) return (-4400, 700);
        if (id == 11) return (-2400, 1100);
        if (id == 12) return (-300, 600);
        if (id == 13) return (2100, 800);
        if (id == 14) return (4300, 200);
        if (id == 15) return (-4700, -1000);
        if (id == 16) return (-2900, -1500);
        if (id == 17) return (-900, -1800);
        if (id == 18) return (1300, -1300);
        if (id == 19) return (3500, -900);
        if (id == 20) return (-3700, -3200);
        if (id == 21) return (-1900, -3500);
        if (id == 22) return (-100, -3000);
        if (id == 23) return (2300, -3400);
        if (id == 24) return (4500, -3000);
        if (id == 25) return (-4500, -4500);
        if (id == 26) return (-2200, -4700);
        if (id == 27) return (0, -4300);
        if (id == 28) return (2700, -4500);
        if (id == 29) return (4700, -4400);
        if (id == 30) return (-3500, -100);
        if (id == 31) return (3700, 3300);
        revert("Regions: bad id");
    }

    /// @notice Lookup region name by id.
    function nameOf(uint8 id) internal pure returns (string memory) {
        if (id == 0) return "Ashen Coast";
        if (id == 1) return "Glass Marsh";
        if (id == 2) return "Wyrmspine";
        if (id == 3) return "Crownlands";
        if (id == 4) return "Black Fen";
        if (id == 5) return "Silent Reach";
        if (id == 6) return "Broken Expanse";
        if (id == 7) return "Hollow Vale";
        if (id == 8) return "Saltreach";
        if (id == 9) return "Gilded Steppe";
        if (id == 10) return "Iron Hollow";
        if (id == 11) return "Pale Mire";
        if (id == 12) return "Thornward";
        if (id == 13) return "Sundered Hills";
        if (id == 14) return "Whitewatch";
        if (id == 15) return "Drowning Coast";
        if (id == 16) return "Cinder Plains";
        if (id == 17) return "Ravenmoor";
        if (id == 18) return "Witherwood";
        if (id == 19) return "Stonebreak";
        if (id == 20) return "Greyspire";
        if (id == 21) return "Frostfen";
        if (id == 22) return "Bleakshore";
        if (id == 23) return "Emberwild";
        if (id == 24) return "Quietmarch";
        if (id == 25) return "Old Sigil";
        if (id == 26) return "Mournwood";
        if (id == 27) return "Glasswind Pass";
        if (id == 28) return "Veilstone";
        if (id == 29) return "Hearthfall";
        if (id == 30) return "Last Reach";
        if (id == 31) return "Forgotten Verge";
        revert("Regions: bad id");
    }

    /// @notice Voronoi assignment by Manhattan distance to the 32 capitals.
    function regionOf(int256 x, int256 y) internal pure returns (uint8 bestId) {
        uint256 bestDist = type(uint256).max;
        for (uint8 i = 0; i < REGION_COUNT; i++) {
            (int256 cx, int256 cy) = capitalOf(i);
            uint256 d = Coordinates.manhattan(x, y, cx, cy);
            if (d < bestDist) {
                bestDist = d;
                bestId = i;
            }
        }
    }
}
