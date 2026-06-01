# Loot Cartographer

> Loot told us what each adventurer carried.
> Loot Cartographer answers a different question: **where was the bag found?**

Onchain worldbuilding for [Loot (for Adventurers)](https://etherscan.io/address/0xFF9C1b15B16263C61d017ee9F65C50e4AE0113D7). Every bag is treated as a fixed point in a deterministic world generated entirely from the canonical Loot smart contract. Locations, regions, terrain, and roads are derived from onchain data and computation — no game master, no offchain database.

## Repo layout

```
contracts/         Foundry project — LootCartographer, LootAtlas, WaystoneRenderer, WaystoneNFT
apps/web/          Next.js 15 frontend (wagmi v2, viem v2)
packages/shared/   TypeScript type mirrors of onchain enums + names
```

## Quick start

```bash
pnpm install
pnpm build:contracts
pnpm test:contracts

# in one terminal:
anvil

# in another:
cd contracts && forge script script/SeedAnvil.s.sol --rpc-url http://localhost:8545 --broadcast

# in a third:
pnpm dev
# then open http://localhost:3000/bag/1
```

## Design principles

1. **Respect Loot.** No characters, no reinterpretation, no overwriting lore.
2. **Chain is source of truth.** All geography is derivable from smart contracts; the frontend is only a viewer.
3. **Discovery over progression.** No leveling, no combat. Players uncover roads and chart routes.
4. **Minimalism.** Maps, symbols, coordinates, roads, artifacts — not avatars, skill trees, or quest markers.

## Status

V0.1 — scaffold + spec. See `CLAUDE.md` for the full technical spec and current implementation state.
