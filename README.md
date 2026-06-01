# Loot Cartographer

> Loot told us what each adventurer carried.
> Loot Cartographer answers a different question: **where was the bag found?**

Onchain worldbuilding for [Loot (for Adventurers)](https://etherscan.io/address/0xFF9C1b15B16263C61d017ee9F65C50e4AE0113D7). Every bag is treated as a fixed point in a deterministic world generated entirely from the canonical Loot smart contract. Locations, regions, terrain, and roads are derived from onchain data and computation — no game master, no offchain database.

## Why

Loot's lore has one rule: **the blockchain is the sole source of truth.** The mint was deterministic — random, but fixed. Run the contract again and the same bags fall out, item for item. Nothing about a bag lives offchain to be edited later.

But the contract carries more than item names. The machinery that decides each item's *greatness*, its rank, the rules for how it would grow — all of it is still onchain, left there for archaeologists and curious minters to find. Loot Survivor (Provable Games) took that machinery and ported it into play, revealing item prefixes and how things look as they gain greatness. It made something clear: the canonical bags are **trapped in time.** You can't level them up. The contract only shows you what they *could* become.

If they're trapped in time, they're likely trapped in space too. We know each bag's items, its owner, its state at mint — but not *where* it is. Loot Cartographer uses the interoperability and permissionless nature of Ethereum to uncover that: to discover where the bags sit in the world, the regions and terrain around them, and the roads that connect them.

And for the cartographers who help chart this world, each discovery can be commemorated by minting a **Waystone (for Adventurers)** NFT — an onchain record of the work, rendered entirely onchain. It's a fun way to explore the lore of the Loot universe while keeping the chain the only thing that decides what is true.

## What works today

- **Atlas** (`/atlas`) — all 8,000 bags plotted on their deterministic coordinates
- **Bag** (`/bag/[id]`) — a bag's location, region, and terrain, read from chain
- **Road** (`/road/[a]/[b]`) — connectivity between two bags; permissionless `discoverRoad`, then mint a road Waystone
- **Route** (`/route/[...path]`) — chart an ordered path of bags with valid hops; `discoverRoute`, then mint a route Waystone
- **Waystones** — ERC-721 with fully onchain SVG art, mint gated to the recorded discoverer

## Repo layout

```
contracts/         Foundry project — LootCartographer, LootAtlas, WaystoneRenderer, WaystoneNFT
apps/web/          Next.js 15 frontend (wagmi v2, viem v2)
packages/shared/   TypeScript type mirrors of onchain enums, names, and ABIs
```

The four contracts:

- **`LootCartographer`** — pure view functions deriving location, region, terrain, distance, and roads from Loot.
- **`LootAtlas`** — permissionless discovery registry (`discoverRoad`, `discoverRoute`), first-discoverer-wins.
- **`WaystoneRenderer`** — pure onchain SVG builder for road/route glyphs.
- **`WaystoneNFT`** — ERC-721; mint gated to the discoverer recorded in `LootAtlas`.

## Quick start

```bash
pnpm install
pnpm build:contracts
pnpm test:contracts

# terminal 1 — local chain
anvil

# terminal 2 — deploy + seed sample bags
cd contracts && forge script script/SeedAnvil.s.sol --rpc-url http://localhost:8545 --broadcast

# terminal 3 — frontend
pnpm dev
```

Then explore: `/atlas`, `/bag/1`, `/road/1/2`, `/route/1/2/7`. Connect an injected wallet to discover and mint Waystones.

## Design principles

1. **Respect Loot.** No characters, no reinterpretation, no overwriting lore.
2. **Chain is source of truth.** All geography is derivable from smart contracts; the frontend is only a viewer.
3. **Discovery over progression.** No leveling, no combat. Cartographers uncover roads and chart routes.
4. **Minimalism.** Maps, symbols, coordinates, roads, artifacts — not avatars, skill trees, or quest markers.

## Status

V0.1.5 — road and route discovery + Waystone minting work end to end against a local chain. Mainnet deployment and CI are still ahead. See `CLAUDE.md` for the full technical spec and current implementation state.
