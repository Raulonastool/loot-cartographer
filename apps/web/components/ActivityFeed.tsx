"use client";

import { type DeploymentAddresses } from "@loot-cartographer/shared";
import Link from "next/link";
import { useEffect, useState } from "react";

import { loadAnvilAddresses } from "@/lib/contracts";
import { useActivity, type ActivityEntry } from "@/lib/useActivity";

import { ErrorPanel } from "./ui";

export function ActivityFeed() {
  const [addrs, setAddrs] = useState<DeploymentAddresses | null>(null);
  const [loadingAddrs, setLoadingAddrs] = useState(true);

  useEffect(() => {
    loadAnvilAddresses()
      .then(setAddrs)
      .finally(() => setLoadingAddrs(false));
  }, []);

  if (loadingAddrs || !addrs) return null;
  return <ActivityFeedWithAddrs addrs={addrs} />;
}

function ActivityFeedWithAddrs({ addrs }: { addrs: DeploymentAddresses }) {
  const { data, isLoading, error } = useActivity(addrs);

  return (
    <section className="space-y-4">
      <p className="text-rule text-sm tracking-widest uppercase">Recent discoveries</p>

      {isLoading ? (
        <p className="text-rule italic">reading the chain…</p>
      ) : error ? (
        <ErrorPanel message={error.message} />
      ) : !data || data.length === 0 ? (
        <p className="text-rule italic">no discoveries yet — chart the first road.</p>
      ) : (
        <ul className="space-y-2">
          {data.map((entry) => (
            <EntryRow key={`${entry.key}-${entry.kind}`} entry={entry} />
          ))}
        </ul>
      )}
    </section>
  );
}

function EntryRow({ entry }: { entry: ActivityEntry }) {
  const href =
    entry.kind === "road"
      ? `/road/${entry.bagA.toString()}/${entry.bagB.toString()}`
      : `/route/${entry.path.map((b) => b.toString()).join("/")}`;

  const chain =
    entry.kind === "road"
      ? `#${entry.bagA.toString()} → #${entry.bagB.toString()}`
      : entry.path.map((b) => `#${b.toString()}`).join(" → ");

  return (
    <li>
      <Link
        href={href}
        className="flex items-center justify-between gap-3 border-b border-rule/20 py-2 hover:bg-rule/5"
      >
        <span className="font-mono truncate">{chain}</span>
        <span className="flex items-center gap-3 shrink-0 text-xs tracking-widest uppercase">
          <span className="text-rule">{entry.kind}</span>
          <span className="text-rule font-mono normal-case tracking-normal">{abbreviate(entry.discoverer)}</span>
          {entry.minted && <span className="text-ink">◆ waystone</span>}
        </span>
      </Link>
    </li>
  );
}

function abbreviate(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}
