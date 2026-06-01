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
  {
    type: "function",
    name: "discoverRoute",
    stateMutability: "nonpayable",
    inputs: [{ name: "path", type: "uint256[]" }],
    outputs: [{ name: "discoveryId", type: "uint64" }],
  },
  {
    type: "function",
    name: "getRouteDiscovery",
    stateMutability: "view",
    inputs: [{ name: "path", type: "uint256[]" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "bagIds", type: "uint256[]" },
          { name: "discoverer", type: "address" },
          { name: "blockNumber", type: "uint64" },
          { name: "discoveryId", type: "uint64" },
          { name: "totalCost", type: "uint256" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "routeKey",
    stateMutability: "pure",
    inputs: [{ name: "path", type: "uint256[]" }],
    outputs: [{ type: "bytes32" }],
  },
  {
    type: "function",
    name: "routeCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint64" }],
  },
  {
    type: "event",
    name: "RouteDiscovered",
    inputs: [
      { name: "key", type: "bytes32", indexed: true },
      { name: "discoverer", type: "address", indexed: true },
      { name: "totalCost", type: "uint256", indexed: false },
      { name: "discoveryId", type: "uint64", indexed: false },
      { name: "path", type: "uint256[]", indexed: false },
    ],
  },
] as const;
