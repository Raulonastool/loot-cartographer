export function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-rule/20 pb-2">
      <span className="text-rule text-xs tracking-widest uppercase">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}

export function ErrorPanel({ message }: { message: string }) {
  return (
    <div className="border border-red-900/40 p-3 text-sm text-red-300">
      <p className="font-mono break-all">{message}</p>
    </div>
  );
}
