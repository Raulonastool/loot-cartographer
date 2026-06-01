"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";

function abbreviate(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <button
        onClick={() => disconnect()}
        className="text-rule text-xs uppercase tracking-widest hover:text-ink font-mono"
        title="disconnect"
      >
        {abbreviate(address)}
      </button>
    );
  }

  const injected = connectors[0];

  return (
    <button
      onClick={() => injected && connect({ connector: injected })}
      disabled={isPending || !injected}
      className="text-rule text-xs uppercase tracking-widest hover:text-ink disabled:opacity-50"
    >
      {isPending ? "connecting…" : "connect wallet"}
    </button>
  );
}
