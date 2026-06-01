# Loot Cartographer — project guide

This file orients future Claude sessions. Read it first.

## What this is

Onchain worldbuilding on top of [Loot (for Adventurers)](https://etherscan.io/address/0xFF9C1b15B16263C61d017ee9F65C50e4AE0113D7). Every Loot bag is treated as a fixed point in a deterministic world derived entirely from the canonical Loot contract. Locations, regions, terrain, and roads are all `view`-function derivations onchain.

PRD lives at `~/Downloads/Loot Cartographer PRD.pdf`. Initial plan that produced this scaffold: `~/.claude/plans/lets-flesh-this-project-async-pinwheel.md`.

## Design principles (load-bearing)

1. **Respect Loot.** No characters, no reinterpretation, no overwriting lore.
2. **Chain is source of truth.** Frontend is only a viewer.
3. **Discovery over progression.** No leveling, no combat.
4. **Minimalism.** Maps/symbols/coordinates — not avatars/skill trees/quest markers.

If a proposed change violates one of these, push back.

## Locked decisions

| Decision | Choice |
|---|---|
| Chain | Ethereum L1 (where canonical Loot lives) |
| Determinism | Fully onchain — all derivations are `view` functions |
| Discovery gating | Permissionless (any wallet) |
| Greatness derivation | Replicate Loot's `pluck()` exactly |
| Region names | Hand-authored, 32 names, locked at deploy |
| Distance metric | Manhattan |
| Coordinate bounds | `(-5000, 5000)` per axis |
| Solc | 0.8.24, via-IR, optimizer runs 1M |
| Libraries | OpenZeppelin v5.0.2, Solady, forge-std v1.9.x |

## Architecture

Four contracts:

- **`LootCartographer`** — pure view functions: `locate`, `regionOf`, `terrainOf`, `distance`, `roadBetween`. Constructor takes `ILoot` address. Zero state, zero access control.
- **`LootAtlas`** — discovery storage. Permissionless `discoverRoad(a, b)` and `discoverRoute(path)`. Validates by calling `LootCartographer`. First-discoverer-wins.
- **`WaystoneRenderer`** — pure SVG builder for road/route glyphs (carved-stone aesthetic, NOT PFPs).
- **`WaystoneNFT`** — ERC721. Mint gated to the discoverer recorded in `LootAtlas`. Renderer is constructor-set immutable.

Six libraries under `contracts/src/libraries/`:

- `Coordinates.sol` — `(x, y)` derivation from keccak256(bagId, items…)
- `Pluck.sol` — exact port of Loot's pluck logic for canonical greatness
- `Orders.sol` — 16 Loot order suffixes + dominant-order detection
- `Regions.sol` — 32 hand-authored capitals + names + Voronoi-by-Manhattan
- `Terrain.sol` — decision tree mapping (greatness, order, rarity, noise) → terrain enum
- `Glyphs.sol` — SVG path constants for runic glyph primitives

## Derivation algorithms (canonical)

### Coordinates
```
seed = keccak256(abi.encode(bagId, weapon, chest, head, waist, foot, hand, neck, ring))
x    = int256(uint128(uint256(seed))         % 10001) - 5000
y    = int256(uint128(uint256(seed) >> 128)  % 10001) - 5000
```

### Region
Voronoi over 32 hardcoded `(int16 x, int16 y)` capitals using Manhattan distance. Names in a fixed `string[32]` constant.

### Greatness (per slot)
```
rand      = uint256(keccak256(bytes(string.concat(KEY_PREFIX, toString(tokenId)))))
greatness = uint8(rand % 21)        // [0, 20]
```
Key prefixes are exactly Loot's: `"WEAPON"`, `"CHEST"`, `"HEAD"`, `"WAIST"`, `"FOOT"`, `"HAND"`, `"NECK"`, `"RING"`. Sum across 8 slots → `g ∈ [0, 160]`.

### Terrain
Decision tree on (rarityCount, dominantOrder, greatnessSum, coordinateNoise). See `Terrain.sol`.

### Road
```
dist     = |xA-xB| + |yA-yB|
affinity = sharedOrder*40 + sharedSuffix*8 + sharedTypes*4 + rarityResonance*6
score    = affinity*100 - dist/20
exists   = score >= ROAD_THRESHOLD     // 1000
cost     = exists ? dist + (10000 - affinity*70)/10 : 0
```

## Loot access

Loot exposes per-slot string getters (`getWeapon`, `getChest`, …, `getRing`) as pure functions over `bagId`. We read those via `ILoot`. No `tokenURI` parsing, no mirror.

For state-changing paths (discoveries), per-bag fingerprints can be cached in `LootAtlas` to avoid repeated string reads.

## What works today

- Repo scaffold + monorepo config
- Contracts compile with `forge build`
- Unit tests + a mainnet-fork test pass with `forge test`
- `SeedAnvil.s.sol` deploys MockLoot + all 4 contracts to a local Anvil
- Next.js page `/bag/[id]` reads `LootCartographer.locate(id)` from chain end-to-end

## What's deliberately missing (scaffold, not MVP)

- Mainnet deployment
- Real Waystone mint flow in the UI
- Atlas page populated with discoveries
- World-map SVG canvas with all 8000 bags
- Road-density simulation to lock `ROAD_THRESHOLD`
- CI workflow

## Conventions

- Solidity 0.8.24, via-IR, optimizer runs 1M, fuzz_runs 1024
- Solady > OpenZeppelin where both apply (cheaper string/base64)
- No proxies, no upgradability — contracts are immutable post-deploy
- Library contracts are stateless; main contracts wire them
- Tests: one file per main contract, `helpers/MockLoot.sol` for non-fork suites
