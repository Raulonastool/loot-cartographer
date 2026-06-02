// Decorative atlas backdrop: scattered bags, a few charted roads, two region capitals.
// Hardcoded coordinates (deterministic — no hydration drift).
const BAGS: [number, number][] = [
  [40, 60], [95, 40], [150, 90], [210, 55], [275, 95], [330, 50], [385, 110],
  [60, 150], [120, 175], [185, 140], [250, 185], [315, 150], [370, 195],
  [80, 230], [160, 250], [230, 235], [300, 260], [360, 240],
  [25, 110], [135, 110], [195, 215], [285, 35], [345, 290], [120, 295],
  [55, 290], [410, 165], [20, 200], [240, 120], [180, 30], [300, 200],
];

const ROADS: [number, number][] = [
  [0, 1], [1, 3], [3, 5], [2, 7], [7, 8], [8, 9], [4, 27], [27, 5],
  [10, 11], [9, 19], [19, 2], [13, 14], [14, 15], [15, 16], [29, 11],
];

const CAPITALS: [number, number][] = [
  [150, 90],
  [300, 200],
];

export function MapField({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 430 320"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
    >
      {ROADS.map(([a, b], i) => (
        <line
          key={i}
          x1={BAGS[a][0]}
          y1={BAGS[a][1]}
          x2={BAGS[b][0]}
          y2={BAGS[b][1]}
          stroke="#9c8b66"
          strokeWidth="0.6"
          opacity="0.5"
        />
      ))}
      {BAGS.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.6" fill="#e8ddb5" opacity="0.55" />
      ))}
      {CAPITALS.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="5" fill="none" stroke="#c9a227" strokeWidth="0.8" opacity="0.8" />
          <circle cx={x} cy={y} r="2" fill="#c9a227" />
        </g>
      ))}
    </svg>
  );
}
