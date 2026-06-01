export const atlasAbi = [
  {
    type: "function",
    name: "discoverRoad",
    stateMutability: "nonpayable",
    inputs: [
      { name: "bagA", type: "uint256" },
      { name: "bagB", type: "uint256" },
    ],
    outputs: [{ name: "discoveryId", type: "uint64" }],
  },
  {
    type: "function",
    name: "getRoadDiscovery",
    stateMutability: "view",
    inputs: [
      { name: "bagA", type: "uint256" },
      { name: "bagB", type: "uint256" },
    ],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "bagA", type: "uint256" },
          { name: "bagB", type: "uint256" },
          { name: "discoverer", type: "address" },
          { name: "blockNumber", type: "uint64" },
          { name: "discoveryId", type: "uint64" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "roadKey",
    stateMutability: "pure",
    inputs: [
      { name: "bagA", type: "uint256" },
      { name: "bagB", type: "uint256" },
    ],
    outputs: [{ type: "bytes32" }],
  },
  {
    type: "function",
    name: "roadCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint64" }],
  },
  {
    type: "event",
    name: "RoadDiscovered",
    inputs: [
      { name: "key", type: "bytes32", indexed: true },
      { name: "bagA", type: "uint256", indexed: true },
      { name: "bagB", type: "uint256", indexed: true },
      { name: "discoverer", type: "address", indexed: false },
      { name: "discoveryId", type: "uint64", indexed: false },
    ],
  },
] as const;
