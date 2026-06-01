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
- **`LootAtlas`** — discovery storage. Permissionless `discoverRoad(a, b)` and `discoverRoute(path)`. Validates by calling `LootCartographer`. First-discoverer-wins. `RoadDiscovered` carries `bagA/bagB`; `RouteDiscovered` carries the full `path` (so route events are self-describing for the activity feed).
- **`WaystoneRenderer`** — pure SVG builder for road/route glyphs (carved-stone aesthetic, NOT PFPs).
- **`WaystoneNFT`** — ERC721. `mintForRoad(a,b)` / `mintForRoute(path)` gated to the discoverer recorded in `LootAtlas` (reverts `NotDiscoverer` / `AlreadyMinted`). `tokenForRoad(a,b)` / `tokenForRoute(path)` view getters return the minted tokenId (0 if unminted) so the UI can read mint state. `tokenURI` returns a fully onchain base64 data URI. Renderer is constructor-set immutable.

Six libraries under `contracts/src/libraries/`:

- `Coordinates.sol` — `(x, y)` derivation from keccak256(bagId, items…)
- `Pluck.sol` — exact port of Loot's pluck logic for canonical greatness
- `Orders.sol` — 16 Loot order suffixes + dominant-order detection
- `Regions.sol` — 32 hand-authored capitals + names + Voronoi-by-Manhattan
- `TerrainLib.sol` — decision tree mapping (greatness, order, rarity, noise) → terrain enum
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
Decision tree on (rarityCount, dominantOrder, greatnessSum, coordinateNoise). See `TerrainLib.sol`.

### Road
```
dist     = |xA-xB| + |yA-yB|
affinity = sharedOrder*40 + sharedSuffix*8 + sharedTypes*4 + rarityResonance*6
score    = affinity*100 - dist/20
exists   = score >= ROAD_THRESHOLD     // 5300 (locked from real bag data)
cost     = exists ? dist + (10000 - affinity*70)/10 : 0
```

**Threshold locking:** A 100k-pair sample of real mainnet Loot bags (see
`contracts/test/RoadDensity.t.sol` + `contracts/deployments/road-density-histogram.json`)
showed the score distribution is heavily bimodal — sharing an order alone produces
scores in the ~4000s, so the threshold must be high to be selective. Picked **5300**
to yield ~10.4 average outgoing roads per bag (~41,600 roads total across the 8000
bags) — sparse but explorable.

Re-lock workflow:
```
pnpm fetch:loot-bags      # one-time, ~1 min, hits mainnet via public RPC
pnpm --filter @loot-cartographer/contracts test:density   # builds the score histogram
node contracts/scripts/analyze-histogram.mjs    # TARGET_AVG=10 by default
# update ROAD_THRESHOLD in LootCartographer.sol, then re-run pnpm test:contracts
```

## Loot access

Loot exposes per-slot string getters (`getWeapon`, `getChest`, …, `getRing`) as pure functions over `bagId`. We read those via `ILoot`. No `tokenURI` parsing, no mirror.

(Future idea, not implemented: cache per-bag fingerprints in `LootAtlas` to avoid repeated string reads on discovery paths.)

## Frontend (`apps/web`)

Next.js 15 (app router) + wagmi v2 / viem v2. The frontend is a pure viewer — it reads derivations and discovery state from chain, never stores world data. Routes: `/atlas` (world map + activity feed), `/bag/[id]`, `/road/[a]/[b]`, `/route/[...path]`.

Reusable primitives (lean on these; don't reinvent):

- `lib/useTxButton.ts` — wraps `useWriteContract` + `useWaitForTransactionReceipt` + onMined refetch + button label states. Used by every write (discover, mint).
- `components/WaystonePanel.tsx` — generalized over a discriminated `target` (`{kind:"road",...} | {kind:"route",path}`); owns the `tokenForRoad/Route` read, the mint write, and the minted display.
- `components/OnchainSvg.tsx` + `lib/decodeTokenUri.ts` — render an onchain tokenURI's SVG via `<img src=data:>` (XSS-safe, never `dangerouslySetInnerHTML`); UTF-8-correct base64 decode.
- `lib/useActivity.ts` + `components/ActivityFeed.tsx` — read `RoadDiscovered/RouteDiscovered/WaystoneMinted` logs via `getContractEvents` (no backend), merge, sort newest-first, flag minted entries.
- `components/ui.tsx` — shared `Row` / `ErrorPanel`. `lib/contracts.ts` — `loadAnvilAddresses()` (reads `public/anvil-addresses.json`).

## What works today

- Contracts compile (`forge build`); **32 forge tests pass, 1 mainnet-fork test skips** unless `MAINNET_RPC_URL` is set (`pnpm test:contracts`)
- `ROAD_THRESHOLD` locked at 5300 against real bag data (see derivation section)
- `SeedAnvil.s.sol` deploys MockLoot + all 4 contracts to a local Anvil and seeds sample bags (1–7)
- Full UI end to end against a local chain: world map of all 8000 bags, bag inspection, road & route discovery, onchain Waystone minting (with revealed SVG), and a chain-read activity feed
- CI (`.github/workflows/ci.yml`): `forge fmt --check` + build + test, plus web typecheck + build, on every push/PR

## What's deliberately missing

- **Mainnet deployment** (the one remaining milestone — deploy against canonical Loot, wire the frontend to mainnet addresses, Etherscan verification)
- Route *builder* UX (path comes from the URL today; no map-click/form assembly)
- Mainnet-scale activity feed (current `getLogs` reads from block 0; mainnet needs range chunking)

## Docs

- `docs/how-the-world-is-made.md` — builder-facing derivation deep-dive (the canonical technical reference; supersedes the summary in this file if they ever drift)
- `docs/a-love-letter-to-onchain-art.md` — collector/art-facing narrative

## Conventions

- Solidity 0.8.24, via-IR, optimizer runs 1M, fuzz_runs 1024
- Solady > OpenZeppelin where both apply (cheaper string/base64)
- No proxies, no upgradability — contracts are immutable post-deploy
- Library contracts are stateless; main contracts wire them
- Tests: one file per main contract, `helpers/MockLoot.sol` for non-fork suites
