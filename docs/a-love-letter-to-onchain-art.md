# A love letter to onchain art

> Loot didn't ship a game. It shipped a seed.
> Five years later we're still finding out what grew.

This is the romantic half of Loot Cartographer — the part for collectors, onchain-art enjoyers, and anyone who feels the pull of a world that keeps revealing itself. The [technical deep-dive](how-the-world-is-made.md) explains *how* it works. This one is about *why it moves us*, and why none of it would be possible anywhere but on a blockchain.

## The contract is the medium

Most "NFT art" is a pointer. A token in your wallet holds a URL; the image lives on a server or a pinning service somewhere, and you trust it'll still be there next decade. That's art *near* the blockchain.

Onchain art is different in kind. The Waystones in this project aren't files we uploaded — they're **SVG drawn by a smart contract, from chain state, at the moment you look.** `WaystoneRenderer` is a pure function; the glyph for your road or route is *computed*, not stored. There is no link to break, no host to pay, no rug to pull. The art will render exactly as long as Ethereum runs — which is to say, the art is as permanent as the ledger itself.

When the canvas and the brush are both the contract, the medium starts doing things paint never could. It can be **deterministic** — the same inputs always yield the same world. It can be **composable** — anyone can build on it without asking. It can **remember** — every act leaves a permanent, timestamped trace. Loot Cartographer is an attempt to take those properties seriously as *artistic* properties, not just technical ones.

## A seed, not a picture

Loot launched in 2021 as 8,000 bags of plain white text on black — "Divine Robe," "Katana of Power," "Hard Leather Gloves +1." No images. No lore handed down. No rules about what any of it meant. It was radical generosity disguised as minimalism: a prompt for the world, deliberately left open.

What looked like emptiness was structure waiting to be read. The mint was random but **deterministic** — run the contract again and the same bags fall out, item for item, forever. And buried in that contract was more than names: the machinery that ranks each item's *greatness*, the suffixes that surface only as an item grows. Loot Survivor (Provable Games) reached into that machinery and pulled out prefixes nobody had seen, revealing how items *would* evolve if they could.

Which taught us something quietly profound: the canonical bags are **trapped in time.** You can't level them. The contract only shows you what they could become. And if they're trapped in time, why not space? We always knew *what* each bag carried and *who* held it — never *where* it was. The where was latent in the chain the entire time. Loot Cartographer just computes it: coordinates, regions, terrain, the roads that bind kin to kin.

That's the wonder of a real seed. It doesn't finish growing on mint day. It keeps unfolding across *cultural* time — years later, strangers find new structure in it and the world gets bigger.

## Why this can only happen onchain

Strip the romance and the argument still holds. This project is only possible because of properties unique to public blockchains:

- **Permissionless interop.** Loot Cartographer never asked Loot for permission. It reads the canonical Loot contract as an oracle — nine `view` functions — and derives a world from them. No license, no API key, no partnership, no server handshake. A five-year-old contract became the foundation for a new one, and its authors never had to lift a finger. Composability without coordination is the chain's superpower, and it is *the* enabling condition for this entire genre.
- **Determinism you can verify.** Deploy this against the real Loot from any account, on any fork, and you get byte-identical coordinates and roads. The world isn't *hosted* by us — it's *implied* by Loot, and anyone can recompute it and check our work. There is no privileged copy to trust.
- **Permanence.** The map, the discoveries, and the Waystone art all live in contracts that outlive any company, domain, or hard drive. This is worldbuilding that can't quietly disappear.
- **A single shared world.** One canonical Loot, one canonical geography on top of it, readable and extendable by everyone at once. Not your instance and my instance — *the* world. That shared-state quality is what makes the next part possible.
- **Onchain history.** Every discovery is a transaction: who, what, when, kept forever. The exploration of this world is itself a permanent record.

## Massively-multiplayer discovery

Here's the part that makes it a game without making it a game. The geography for all 8,000 bags already exists, deterministically, right now. Nobody has to *generate* it. Discovery is the act of being the **first to walk it** — to chart a road between two bags, or a route across several — and have the chain record that you were first.

`LootAtlas` is first-discoverer-wins. The map is ancient and complete; the *map of who found what* is being written live, by anyone with a wallet, in public, permanently. And for the cartographers doing that work, a **Waystone (for Adventurers)** is the commemoration: a fully onchain artifact that says *I charted this, and here is the proof, carved in SVG, mine forever.*

Minting one isn't buying a picture. It's leaving your name in the onchain history of a world's discovery — becoming, in a small and permanent way, part of the lore.

## An open world, in every sense

Because everything derives from Loot by pure function, the world is forkable, verifiable, and extendable by strangers who will never meet. The road physics are a few numbers; the terrain rules are a small decision tree; the renderer's glyphs are pure SVG primitives. Every one of those is an invitation. (The technical doc lists the [seams we left open](how-the-world-is-made.md#extension-points).)

A seed from 2021. A new contract that found its hidden geography. Cartographers minting waystones to mark what they discovered. And the whole thing still unfinished — still growing — because that's what onchain seeds do.

If that stirs something in you, you're already a cartographer. Pick two bags. Find the road. Carve the stone.
