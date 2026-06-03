# How the world is made

A builder's tour of Loot Cartographer's onchain derivations. Every coordinate, region, terrain, and road in this project is a **pure function of canonical Loot** — recomputed from the chain on every call, never stored, never mirrored. This document walks the actual math and the decisions behind it, with `file:line` references so you can read along in the source.

If you want to extend the world — better road physics, base-item parsing, new terrain rules — the [Extension points](#extension-points) section is the short list of seams we left open.

---

## The thesis: the world is implied by Loot

The system reads canonical [Loot](https://etherscan.io/address/0xFF9C1b15B16263C61d017ee9F65C50e4AE0113D7) as a **read-only oracle**, never a copy. The interface is nine functions — `ownerOf` plus the eight slot getters:

```solidity
// src/interfaces/ILoot.sol
interface ILoot {
    function ownerOf(uint256 tokenId) external view returns (address);
    function getWeapon(uint256 tokenId) external view returns (string memory);
    function getChest(uint256 tokenId) external view returns (string memory);
    // … getHead, getWaist, getFoot, getHand, getNeck, getRing
}
```

`LootCartographer` holds Loot's address as `immutable loot` and reads the live item strings on demand (`src/LootCartographer.sol:112-124`). There is no stored geography, no `tokenURI` parsing, no offchain index. The consequence that matters for builders:

> Deploy this contract against `0xFF9C…13D7` from any account, on any fork, and you get **byte-identical** coordinates, regions, terrain, and roads. The map isn't hosted — it's a deterministic projection of Loot that was always computable. We're just the first to compute it.

This is the whole design constraint: **chain is source of truth, everything is derivable.** The frontend is a viewer; the contracts are the world.

---

## Coordinates — one hash, two axes

Each bag occupies a fixed point on a bounded `(-5000, 5000)` plane — a `10001 × 10001` grid.

```solidity
// src/libraries/Coordinates.sol:29-36
bytes32 seed = keccak256(abi.encode(bagId, weapon, chest, head, waist, foot, hand, neck, ring));
uint256 seedUint = uint256(seed);
x = int256(uint256(uint128(seedUint))        % 10001) - 5000;   // low  128 bits
y = int256(uint256(uint128(seedUint >> 128)) % 10001) - 5000;   // high 128 bits
```

Three deliberate choices:

1. **One keccak, two independent axes.** The 256-bit digest is split into two 128-bit halves — low bits drive `x`, high bits drive `y`. No second hash, two statistically independent coordinates.
2. **Modulo bias is negligible.** A 128-bit dividend against a 10001 divisor produces bias on the order of `3e-35` (`Coordinates.sol:6-7`). The grid is uniform for all practical purposes — no rejection sampling needed.
3. **Location is fingerprinted from contents, not just the id.** `bagId` alone is already unique and deterministic. Folding all eight item strings into the seed is a *design* decision: a bag's position is a function of **what it carries**, not its index. Gear determines geography. This is the literal "trapped in space" property — as immutable as the mint.

> **On canon:** this is *a* deterministic placement, not *the* canonical one. There is no objectively correct coordinate for a Loot bag, and the project does not claim there is. What the derivation guarantees is narrower and more useful: a bag's location is **fixed, reproducible, and owner-independent** — `ownerOf` is deliberately *not* part of the seed, so trading a bag never moves it — and it's computed from Loot's own data rather than an arbitrary database. Placement is a choice; determinism and provenance are the point.

Distance is **Manhattan**, chosen to match the grid and keep everything integer math:

```solidity
// src/libraries/Coordinates.sol:40-46
function manhattan(int256 ax, int256 ay, int256 bx, int256 by) internal pure returns (uint256) {
    unchecked {
        uint256 dx = ax > bx ? uint256(ax - bx) : uint256(bx - ax);
        uint256 dy = ay > by ? uint256(ay - by) : uint256(by - ay);
        return dx + dy;
    }
}
```

---

## Greatness — an exact port of Loot's `pluck()`

Loot computed each item's *greatness* at mint but never exposed it as a clean getter. `Pluck.sol` resurrects it — same `random()`, same modulus, same key prefixes:

```solidity
// src/libraries/Pluck.sol:28-31
function greatness(uint256 tokenId, string memory keyPrefix) internal pure returns (uint8) {
    uint256 rand = uint256(keccak256(abi.encodePacked(keyPrefix, LibString.toString(tokenId))));
    return uint8(rand % 21);                 // [0, 20], exactly as Loot.pluck does
}
```

The key prefixes are Loot's verbatim (`"WEAPON"`, `"CHEST"`, …, `"RING"`). `totalGreatness` sums all eight slots into `g ∈ [0, 160]` (`Pluck.sol:34-45`), which feeds terrain classification. This is onchain archaeology: re-deriving a hidden mechanic that lived in the chain the whole time.

---

## Orders — reading lore back out of strings

Loot only hands you human-readable item names, so interop *is* string parsing. An item carries an order suffix (`" of Power"`, `" of the Twins"`, …) when its greatness is ≥ 15, and a trailing `" +1"` at greatness 20. `Orders.orderOf` decodes that:

```solidity
// src/libraries/Orders.sol:32-61 (abridged)
function orderOf(string memory item) internal pure returns (uint8) {
    bytes memory b = bytes(item);
    uint256 end = b.length;
    // strip a trailing " +1" (bytes 0x20 0x2b 0x31) before suffix-matching
    if (end >= 3 && b[end-3] == 0x20 && b[end-2] == 0x2b && b[end-1] == 0x31) end -= 3;
    if (_endsWith(b, end, " of Power")) return POWER;
    // … 15 more suffixes → ids 1..16, else NONE (0)
}
```

Supporting pieces:
- `isNamedPlusOne` flags the `+1` rarity tag (greatness 20) at the byte level (`Orders.sol:64-69`).
- `dominantOrder` counts orders across the 8 slots and breaks ties by **slot priority** (weapon > chest > … > ring) — a deterministic, position-weighted majority (`Orders.sol:74-92`).
- `sharedSuffixCount` counts slots where two bags carry the *same* order — a kinship signal used by road derivation (`Orders.sol:95-103`).

---

## Regions — Voronoi by Manhattan over 32 capitals

`Regions.sol` defines 32 hand-authored capitals with locked coordinates and names (Ashen Coast, Wyrmspine, Frostfen…). A bag's region is the **nearest capital by Manhattan distance**:

```solidity
// src/libraries/Regions.sol:87-97
function regionOf(int256 x, int256 y) internal pure returns (uint8 bestId) {
    uint256 bestDist = type(uint256).max;
    for (uint8 i = 0; i < REGION_COUNT; i++) {           // O(32)
        (int256 cx, int256 cy) = capitalOf(i);
        uint256 d = Coordinates.manhattan(x, y, cx, cy);
        if (d < bestDist) { bestDist = d; bestId = i; }
    }
}
```

This is a Voronoi tessellation under the L1 metric — Manhattan distance yields diamond-shaped cells that suit the grid. The capital coordinates and names are the **single** place human authorship enters the system; they're locked at deploy and immutable. Changing them means shipping a new contract — chain is source of truth (`Regions.sol:7-8`).

---

## Terrain — identity *and* place

`TerrainLib.classify` is a priority cascade over `(rarity, dominantOrder, greatness, coordinateNoise)`:

```solidity
// src/libraries/TerrainLib.sol:14-43 (abridged)
if (rarityCount >= 4) return Terrain.Ruins;                                  // rarity dominates
if (dominantOrder == POWER || TITANS || SKILL)       return Terrain.Mountains;
if (dominantOrder == GIANTS || BRILLIANCE)           return Terrain.Desert;
if (dominantOrder == ANGER || RAGE || FURY)          return Terrain.Wasteland;
// … DETECTION/ENLIGHTENMENT/PROTECTION → Forest, VITRIOL/THE_TWINS → Marsh
uint8 noise = uint8(uint256(keccak256(abi.encode(x, y, "TERRAIN_NOISE"))) % 256);
if (noise < 32)           return Terrain.Coast;
if (greatnessSum >= 120)  return Terrain.Mountains;
if (greatnessSum <= 40)   return Terrain.Plains;
return noise < 128 ? Terrain.Forest : Terrain.Plains;
```

Terrain is a function of **what the bag is** (its rarity, dominant order, total greatness) and **where it sits** (coordinate-seeded noise). The `Terrain` enum has 8 variants (`Plains, Marsh, Forest, Mountains, Ruins, Coast, Desert, Wasteland` — `src/interfaces/ILootCartographer.sol:6-15`).

---

## Roads — affinity vs. distance, calibrated against real bags

This is the physics of the world. Two bags are connected when their **kinship overcomes their distance** (`src/LootCartographer.sol:89-105`):

```solidity
affinity = sharedOrder*40 + sharedSuffix*8 + sharedTypes*4 + rarityResonance*6;
score    = affinity*100 - dist/20;          // kinship pulls together, distance pushes apart
exists   = score >= ROAD_THRESHOLD;         // 5300
cost     = exists ? dist + (10000 - affinity*70)/10 : 0;
```

The four affinity signals, weighted by how meaningful they are:

| Signal | Weight | Meaning |
|---|---|---|
| `sharedOrder` | ×40 | both bags share the same **dominant** order (the strongest tie) |
| `sharedSuffix` | ×8 | per slot where both carry the same order |
| `sharedTypes` | ×4 | per slot with an identical item string |
| `rarityResonance` | ×6 | `min(rarityA, rarityB)` — shared abundance of `+1` items |

In plain terms: **a road exists when `score` clears 5300.** The dominant-Order match is the big lever — but `sharedOrder` alone is worth only `40 × 100 = 4000`, which sits *under* the bar before distance even applies. So a road needs that shared Order **plus** a little more (a matching item, another shared suffix, or some `+1` rarity), and the pair has to be close enough to survive the distance penalty (`distance/20`, at most −1000). That's why a shared Order is necessary-ish but not sufficient.

`score` and `cost` use clamped integer math (no floats, no underflow): a negative score floors to 0 (`LootCartographer.sol:94-95`), and the cost discount clamps before subtraction (`:102-104`). `cost` grows with distance and shrinks with affinity — closer kin travel cheaper.

**The threshold is empirical, not a guess.** `ROAD_THRESHOLD = 5300` was calibrated against a **100,000-pair sample of real mainnet Loot bags** (`test/RoadDensity.t.sol` + the committed `deployments/road-density-histogram.json`). The score distribution is bimodal — sharing an order alone lands in the ~4000s — so the bar sits high to stay selective. 5300 yields ~10.4 outgoing roads per bag, ~41,600 roads across all 8,000 bags: sparse but explorable (`LootCartographer.sol:19-22`).

### Re-calibrating the threshold

If you change the affinity weights or want a different road density, re-derive the threshold against real data:

```bash
pnpm fetch:loot-bags        # one-time: pull real bag data from mainnet via public RPC (~1 min)
pnpm --filter @loot-cartographer/contracts test:density   # builds the score histogram
node contracts/scripts/analyze-histogram.mjs              # suggests a threshold (TARGET_AVG=10 default)
# update ROAD_THRESHOLD, then: pnpm test:contracts
```

---

## Architecture & gas

- **`LootCartographer` is 100% `view`, zero storage** beyond the immutable Loot address (`LootCartographer.sol:16-17`). Reads are free offchain; gas is paid only when `LootAtlas` validates a discovery onchain — roughly 8 Loot string reads per `locate`, 16 per `roadBetween` (`LootCartographer.sol:13-15`).
- **The `Bag` memory struct exists to dodge stack-too-deep.** Ten fields (8 item strings + x + y) loaded once per bag and passed by reference internally (`LootCartographer.sol:24-36, 112-124`).
- **Libraries are stateless; contracts wire them.** `Coordinates`, `Pluck`, `Orders`, `Regions`, `TerrainLib`, `Glyphs` are pure. No proxies, no upgradeability — immutable post-deploy.
- **Discovery is the only state.** The geography for all 8,000 bags already exists deterministically. The single thing ever *written* to chain is **who discovered what first** — `LootAtlas` records first-discoverer-wins, and a `WaystoneNFT` commemorates it. A *road* connects two bags; a *route* is a path **you supply** that `discoverRoute` validates hop-by-hop (each leg must be a real road) and prices by summing the legs — it verifies a path, it does not search for one. The map exists; discovery records who walked it.

Build settings are locked for reproducibility: solc `0.8.24`, `via-IR`, `optimizer_runs = 1_000_000`, `fuzz_runs = 1024` (`contracts/foundry.toml`).

---

## Extension points

The V1 derivations are deliberate but not final. The seams most worth contributing to:

- **`_sharedSlotIdentity` (`LootCartographer.sol:150-161`)** — currently strict full-string equality per slot, explicitly commented *"iterate later toward base-item parsing."* Parsing the base item (ignoring prefixes/suffixes) would let "Katana" match "Katana of Power," a much richer kinship signal. This is the single highest-leverage upgrade.
- **Affinity weights & `ROAD_THRESHOLD` (`LootCartographer.sol:89-97`)** — the road graph's shape is four numbers and a cutoff. Re-tune them (and re-calibrate against real data) to change how connected the world feels.
- **Terrain rules (`TerrainLib.sol`)** — the decision tree is small and readable; new terrain types or finer greatness/noise banding slot in cleanly.
- **Region capitals & names (`Regions.sol`)** — the one authored layer. A different 32 (or a different count) reshapes the political map.
- **Renderer glyphs (`Glyphs.sol` / `WaystoneRenderer`)** — Waystone art is pure onchain SVG. **The current carved-stone style is a working placeholder:** the *derivation* (a deterministic SVG from the discovery key) is settled, but the final visual language is still being designed. New glyph primitives expand what a discovery can look like.

Because everything is a pure function of Loot, any fork you deploy is independently verifiable — there's no privileged state to trust.

---

## Reproduce it yourself

```bash
pnpm install
pnpm build:contracts
pnpm test:contracts        # unit tests over a MockLoot stand-in

# prove it against the real Loot contract:
MAINNET_RPC_URL=https://… pnpm test:contracts   # runs testFork_LocateRealBag (skipped without an RPC)

# local world:
anvil
cd contracts && forge script script/SeedAnvil.s.sol --rpc-url http://localhost:8545 --broadcast
pnpm dev                   # /atlas, /bag/1, /road/1/2, /route/1/2/7
```

`testFork_LocateRealBag` (`test/LootCartographer.t.sol:105`) is the proof these derivations run against the *real* Loot contract, not just mocks: it forks mainnet, deploys `LootCartographer` against `0xFF9C…13D7`, and locates a real bag. It skips silently when `MAINNET_RPC_URL` is unset, so the default suite stays offline-friendly — set the env var to see the world come straight off mainnet.
