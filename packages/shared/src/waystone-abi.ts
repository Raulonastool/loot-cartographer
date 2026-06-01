export const waystoneAbi = [
  {
    type: "function",
    name: "mintForRoad",
    stateMutability: "nonpayable",
    inputs: [
      { name: "bagA", type: "uint256" },
      { name: "bagB", type: "uint256" },
    ],
    outputs: [{ name: "tokenId", type: "uint256" }],
  },
  {
    type: "function",
    name: "tokenForRoad",
    stateMutability: "view",
    inputs: [
      { name: "bagA", type: "uint256" },
      { name: "bagB", type: "uint256" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "tokenURI",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ type: "string" }],
  },
  {
    type: "function",
    name: "totalSupply",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "event",
    name: "WaystoneMinted",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "kind", type: "uint8", indexed: false },
      { name: "minter", type: "address", indexed: true },
      { name: "discoveryKey", type: "bytes32", indexed: true },
    ],
  },
] as const;
