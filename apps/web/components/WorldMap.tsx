"use client";

import { REGION_CAPITALS, REGION_NAMES } from "@loot-cartographer/shared";
import { useRouter } from "next/navigation";
import { PointerEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

interface BagCoord {
  id: number;
  x: number;
  y: number;
}

interface ViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

const WORLD_MIN = -5000;
const WORLD_MAX = 5000;
const WORLD_SPAN = WORLD_MAX - WORLD_MIN;
const PAD = 500;
const INITIAL_VIEWBOX: ViewBox = {
  x: WORLD_MIN - PAD,
  y: WORLD_MIN - PAD,
  width: WORLD_SPAN + PAD * 2,
  height: WORLD_SPAN + PAD * 2,
};

const ZOOM_MIN_WIDTH = 200;
const ZOOM_MAX_WIDTH = WORLD_SPAN + PAD * 4;

export function WorldMap() {
  const router = useRouter();
  const [bags, setBags] = useState<BagCoord[] | null>(null);
  const [viewBox, setViewBox] = useState<ViewBox>(INITIAL_VIEWBOX);
  const [hoveredBag, setHoveredBag] = useState<BagCoord | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [cursorWorld, setCursorWorld] = useState<{ x: number; y: number } | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; baseViewBox: ViewBox } | null>(null);

  useEffect(() => {
    fetch("/bag-coords.json")
      .then((r) => r.json())
      .then(setBags)
      .catch((e) => console.error("failed to load bag-coords.json", e));
  }, []);

  // 8000 circles, no per-element handlers (event delegation lives on the <svg>).
  const bagCircles = useMemo(() => {
    if (!bags) return null;
    return bags.map((b) => (
      <circle key={b.id} data-bag-id={b.id} cx={b.x} cy={-b.y} r={18} className="fill-ink/70" />
    ));
  }, [bags]);

  const bagsById = useMemo(() => {
    if (!bags) return new Map<number, BagCoord>();
    const m = new Map<number, BagCoord>();
    for (const b of bags) m.set(b.id, b);
    return m;
  }, [bags]);

  const onSvgClick = (e: PointerEvent<SVGSVGElement>) => {
    const id = (e.target as Element).getAttribute?.("data-bag-id");
    if (id) router.push(`/bag/${id}`);
  };

  const capitalMarks = useMemo(
    () =>
      REGION_CAPITALS.map((c, i) => (
        <g key={i}>
          <path
            d={`M${c.x - 30} ${-c.y} L${c.x + 30} ${-c.y} M${c.x} ${-c.y - 30} L${c.x} ${-c.y + 30}`}
            className="stroke-ink/40"
            strokeWidth={3}
            fill="none"
          />
          <text
            x={c.x + 40}
            y={-c.y - 20}
            className="fill-rule italic"
            fontSize={60}
            fontFamily="serif"
          >
            {REGION_NAMES[i]}
          </text>
        </g>
      )),
    []
  );

  // ─── interaction handlers ───────────────────────────────────────────

  const screenToWorld = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };
      const rect = svg.getBoundingClientRect();
      const px = (clientX - rect.left) / rect.width;
      const py = (clientY - rect.top) / rect.height;
      return {
        x: viewBox.x + px * viewBox.width,
        y: -(viewBox.y + py * viewBox.height),
      };
    },
    [viewBox]
  );

  const onPointerDown = (e: PointerEvent<SVGSVGElement>) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      baseViewBox: viewBox,
    };
  };

  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    setCursorWorld(screenToWorld(e.clientX, e.clientY));
    // delegated hover detection
    const target = e.target as Element;
    const idAttr = target.getAttribute?.("data-bag-id");
    if (idAttr) {
      const id = Number(idAttr);
      const b = bagsById.get(id);
      if (b && hoveredBag?.id !== id) setHoveredBag(b);
    } else if (hoveredBag) {
      setHoveredBag(null);
    }

    if (!dragRef.current) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const dx = ((e.clientX - dragRef.current.startX) / rect.width) * dragRef.current.baseViewBox.width;
    const dy = ((e.clientY - dragRef.current.startY) / rect.height) * dragRef.current.baseViewBox.height;
    setViewBox({
      ...dragRef.current.baseViewBox,
      x: dragRef.current.baseViewBox.x - dx,
      y: dragRef.current.baseViewBox.y - dy,
    });
  };

  const onPointerUp = () => {
    dragRef.current = null;
  };

  // Wheel listener attached natively so we can call preventDefault on a non-passive listener.
  // React's synthetic onWheel registers as passive and would warn on every event.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const handler = (e: globalThis.WheelEvent) => {
      e.preventDefault();
      const factor = Math.exp(e.deltaY * 0.0015);
      setViewBox((cur) => {
        const newWidth = Math.min(ZOOM_MAX_WIDTH, Math.max(ZOOM_MIN_WIDTH, cur.width * factor));
        const rect = svg.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        // anchor zoom on cursor world position
        const wx = cur.x + px * cur.width;
        const wy = cur.y + py * cur.height;
        return {
          x: wx - px * newWidth,
          y: wy - py * newWidth,
          width: newWidth,
          height: newWidth,
        };
      });
    };
    svg.addEventListener("wheel", handler, { passive: false });
    return () => svg.removeEventListener("wheel", handler);
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bags) return;
    const id = parseInt(searchValue, 10);
    if (!Number.isFinite(id) || id < 1 || id > bags.length) return;
    const bag = bags[id - 1];
    if (!bag) return;
    const span = 1500;
    setViewBox({
      x: bag.x - span / 2,
      y: -bag.y - span / 2,
      width: span,
      height: span,
    });
  };

  // ─── render ──────────────────────────────────────────────────────────

  return (
    <div className="relative w-full" style={{ aspectRatio: "1 / 1" }}>
      <svg
        ref={svgRef}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        className="w-full h-full border border-rule/30 bg-parchment cursor-grab active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onClick={onSvgClick}
        style={{ touchAction: "none" }}
      >
        {/* world bounding box */}
        <rect
          x={WORLD_MIN}
          y={WORLD_MIN}
          width={WORLD_SPAN}
          height={WORLD_SPAN}
          className="fill-none stroke-rule/30"
          strokeWidth={4}
        />
        {/* origin crosshair */}
        <line x1={WORLD_MIN} y1={0} x2={WORLD_MAX} y2={0} className="stroke-rule/15" strokeWidth={2} />
        <line x1={0} y1={WORLD_MIN} x2={0} y2={WORLD_MAX} className="stroke-rule/15" strokeWidth={2} />

        {/* region capitals (under bags) */}
        {capitalMarks}

        {/* bags */}
        {bagCircles}

        {/* hovered bag highlight */}
        {hoveredBag && (
          <g pointerEvents="none">
            <circle
              cx={hoveredBag.x}
              cy={-hoveredBag.y}
              r={24}
              className="fill-none stroke-ink"
              strokeWidth={3}
            />
            <text
              x={hoveredBag.x + 30}
              y={-hoveredBag.y - 30}
              className="fill-ink"
              fontSize={60}
              fontFamily="serif"
            >
              #{hoveredBag.id}
            </text>
          </g>
        )}
      </svg>

      {/* HUD: search */}
      <form
        onSubmit={submitSearch}
        className="absolute top-3 right-3 flex gap-2 bg-parchment/80 backdrop-blur-sm border border-rule/30 px-2 py-1"
      >
        <input
          type="text"
          inputMode="numeric"
          placeholder="bag id"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="bg-transparent text-ink placeholder-rule/60 outline-none text-sm w-20 font-mono"
        />
        <button type="submit" className="text-rule text-xs uppercase tracking-widest hover:text-ink">
          jump
        </button>
      </form>

      {/* HUD: cursor coords */}
      <div className="absolute bottom-3 left-3 text-rule text-xs font-mono">
        {cursorWorld ? `(${Math.round(cursorWorld.x)}, ${Math.round(cursorWorld.y)})` : "—"}
      </div>

      {/* HUD: reset */}
      <button
        onClick={() => setViewBox(INITIAL_VIEWBOX)}
        className="absolute bottom-3 right-3 text-rule text-xs uppercase tracking-widest hover:text-ink"
      >
        reset view
      </button>

      {/* HUD: bag count */}
      <div className="absolute top-3 left-3 text-rule text-xs uppercase tracking-widest">
        {bags ? `${bags.length} bags` : "consulting the atlas…"}
      </div>
    </div>
  );
}
