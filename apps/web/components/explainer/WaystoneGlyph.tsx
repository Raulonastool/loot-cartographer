export function WaystoneGlyph({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 170"
      className={className}
      fill="none"
      role="img"
      aria-label="A carved waystone marker"
    >
      {/* stone body */}
      <path
        d="M24 56 C24 24 44 12 60 12 C76 12 96 24 96 56 L96 150 C96 156 92 160 86 160 L34 160 C28 160 24 156 24 150 Z"
        fill="rgba(0,0,0,0.25)"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.9"
      />
      {/* inner inscription border */}
      <path
        d="M33 58 C33 32 48 22 60 22 C72 22 87 32 87 58 L87 144 C87 149 84 151 80 151 L40 151 C36 151 33 149 33 144 Z"
        stroke="currentColor"
        strokeWidth="0.75"
        opacity="0.35"
      />
      {/* faint sigil grid */}
      <g fill="currentColor" opacity="0.18">
        {[44, 60, 76].map((x) =>
          [54, 72, 90].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1" />),
        )}
      </g>
      {/* road sigil — two nodes, a route hop, a waymark */}
      <g>
        <line x1="46" y1="70" x2="74" y2="94" stroke="#c9a227" strokeWidth="1.5" />
        <line x1="74" y1="94" x2="58" y2="118" stroke="#c9a227" strokeWidth="1.5" opacity="0.7" />
        <circle cx="46" cy="70" r="3.5" fill="#c9a227" />
        <circle cx="74" cy="94" r="3.5" fill="#c9a227" />
        <circle cx="58" cy="118" r="3" fill="#c9a227" opacity="0.7" />
        <path d="M60 82 l4 4 -4 4 -4 -4 Z" fill="none" stroke="#c9a227" strokeWidth="1" />
      </g>
      {/* inscription strokes */}
      <g stroke="currentColor" strokeWidth="1.5" opacity="0.4" strokeLinecap="round">
        <line x1="46" y1="135" x2="74" y2="135" />
        <line x1="50" y1="142" x2="70" y2="142" />
      </g>
    </svg>
  );
}
