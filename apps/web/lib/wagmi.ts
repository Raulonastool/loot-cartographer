import { createConfig, http } from "wagmi";
import { mainnet, foundry } from "wagmi/chains";

export const wagmiConfig = createConfig({
  chains: [foundry, mainnet],
  transports: {
    [foundry.id]: http(process.env.NEXT_PUBLIC_ANVIL_RPC_URL ?? "http://localhost:8545"),
    [mainnet.id]: http(process.env.NEXT_PUBLIC_MAINNET_RPC_URL),
  },
  ssr: true,
});

export const DEFAULT_CHAIN_ID = foundry.id;
