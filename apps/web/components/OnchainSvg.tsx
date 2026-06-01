"use client";

import { waystoneAbi, type DeploymentAddresses } from "@loot-cartographer/shared";
import { useReadContract } from "wagmi";

import { decodeTokenUri } from "@/lib/decodeTokenUri";
import { DEFAULT_CHAIN_ID } from "@/lib/wagmi";

import { ErrorPanel } from "./ui";

// Rendered via <img src=data:> rather than dangerouslySetInnerHTML: minted SVGs are
// attacker-influenceable, and image context disables script execution (XSS-safe).
export function OnchainSvg({ image, alt }: { image: string; alt: string }) {
  return <img src={image} alt={alt} className="w-full border border-rule/30 bg-black/20" />;
}

export function WaystoneImage({
  tokenId,
  addrs,
}: {
  tokenId: bigint;
  addrs: DeploymentAddresses;
}) {
  const uri = useReadContract({
    address: addrs.waystone,
    abi: waystoneAbi,
    functionName: "tokenURI",
    args: [tokenId],
    chainId: DEFAULT_CHAIN_ID,
  });

  if (uri.isLoading) return <p className="text-rule italic">raising the waystone…</p>;
  if (uri.error) return <ErrorPanel message={uri.error.message} />;
  if (!uri.data) return null;

  const meta = decodeTokenUri(uri.data);
  return <OnchainSvg image={meta.image} alt={meta.name} />;
}
