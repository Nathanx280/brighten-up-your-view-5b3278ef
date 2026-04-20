import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RefreshCw } from "lucide-react";

export type Channel = "rgb" | "r" | "g" | "b";

export interface CurvePoint {
  x: number; // 0..1
  y: number; // 0..1
}

interface Props {
  points: Record<Channel, CurvePoint[]>;
  onChange: (next: Record<Channel, CurvePoint[]>, luts: { r?: Uint8Array; g?: Uint8Array; b?: Uint8Array }) => void;
}

const DEFAULT_PTS: CurvePoint[] = [
  { x: 0, y: 0 },
  { x: 1, y: 1 },
];

export const DEFAULT_CURVES: Record<Channel, CurvePoint[]> = {
  rgb: [...DEFAULT_PTS],
  r: [...DEFAULT_PTS],
  g: [...DEFAULT_PTS],
  b: [...DEFAULT_PTS],
};

const SIZE = 220;

// Monotonic cubic interpolation across sorted points → 256-entry LUT.
function buildLUT(points: CurvePoint[]): Uint8Array {
  const lut = new Uint8Array(256);
  const sorted = [...points].sort((a, b) => a.x - b.x);
  for (let i = 0; i < 256; i++) {
    const x = i / 255;
    let y = sorted[0].y;
    for (let j = 0; j < sorted.length - 1; j++) {
      const p0 = sorted[j];
      const p1 = sorted[j + 1];
      if (x >= p0.x && x <= p1.x) {
        const t = (x - p0.x) / Math.max(1e-6, p1.x - p0.x);
        const ts = t * t * (3 - 2 * t); // smoothstep
        y = p0.y * (1 - ts) + p1.y * ts;
        break;
      }
      if (x > p1.x) y = p1.y;
    }
    lut[i] = Math.max(0, Math.min(255, Math.round(y * 255)));
  }
  return lut;
}

function compose(rgb: Uint8Array, ch: Uint8Array): Uint8Array {
  const out = new Uint8Array(256);
  for (let i = 0; i < 256; i++) out[i] = ch[rgb[i]];
  return out;
}

const CurvesEditor = ({ points, onChange }: Props) => {
  const [channel, setChannel] = useState<Channel>("rgb");
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef<number | null>(null);

  const currentPts = points[channel];

  const luts = useMemo(() => {
    const rgbLUT = buildLUT(points.rgb);
    return {
      r: compose(rgbLUT, buildLUT(points.r)),
      g: compose(rgbLUT, buildLUT(points.g)),
      b: compose(rgbLUT, buildLUT(points.b)),
    };
  }, [points]);

  // Path string for the active curve
  const path = useMemo(() => {
    const lut = buildLUT(currentPts);
    let d = `M 0 ${SIZE - (lut[0] / 255) * SIZE}`;
    for (let i = 1; i < 256; i++) {
      d += ` L ${(i / 255) * SIZE} ${SIZE - (lut[i] / 255) * SIZE}`;
    }
    return d;
  }, [currentPts]);

  const updatePts = (next: CurvePoint[]) => {
    const nextAll = { ...points, [channel]: next };
    const nextLuts = {
      r: compose(buildLUT(nextAll.rgb), buildLUT(nextAll.r)),
      g: compose(buildLUT(nextAll.rgb), buildLUT(nextAll.g)),
      b: compose(buildLUT(nextAll.rgb), buildLUT(nextAll.b)),
    };
    onChange(nextAll, nextLuts);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragging.current === null || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height));
    const idx = dragging.current;
    const next = currentPts.map((p, i) => (i === idx ? { x, y } : p));
    updatePts(next);
  };

  const addPoint = (e: React.MouseEvent) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height));
    const next = [...currentPts, { x, y }].sort((a, b) => a.x - b.x);
    updatePts(next);
  };

  const removePoint = (i: number) => {
    if (currentPts.length <= 2) return;
    if (i === 0 || i === currentPts.length - 1) return;
    updatePts(currentPts.filter((_, idx) => idx !== i));
  };

  // Recompute LUTs whenever channel state changes externally
  useEffect(() => {
    onChange(points, luts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stroke =
    channel === "r" ? "rgb(255,80,80)" :
    channel === "g" ? "rgb(80,220,120)" :
    channel === "b" ? "rgb(80,140,255)" : "hsl(var(--primary))";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Curves</h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={() => onChange(DEFAULT_CURVES, { r: undefined, g: undefined, b: undefined } as any)}
        >
          <RefreshCw className="w-3 h-3 mr-1" /> Reset all
        </Button>
      </div>
      <div className="grid grid-cols-4 gap-1">
        {(["rgb", "r", "g", "b"] as Channel[]).map((c) => (
          <Button
            key={c}
            size="sm"
            variant={channel === c ? "default" : "outline"}
            className="h-7 text-xs uppercase"
            onClick={() => setChannel(c)}
          >
            {c}
          </Button>
        ))}
      </div>
      <div
        className="rounded border border-border bg-muted/40 p-1 select-none"
        onPointerMove={handlePointerMove}
        onPointerUp={() => (dragging.current = null)}
        onPointerLeave={() => (dragging.current = null)}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="w-full h-auto cursor-crosshair"
          onDoubleClick={addPoint}
        >
          {/* grid */}
          {[0.25, 0.5, 0.75].map((t) => (
            <g key={t} stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.6">
              <line x1={SIZE * t} y1={0} x2={SIZE * t} y2={SIZE} />
              <line x1={0} y1={SIZE * t} x2={SIZE} y2={SIZE * t} />
            </g>
          ))}
          <line x1={0} y1={SIZE} x2={SIZE} y2={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="2 3" opacity="0.5" />
          <path d={path} fill="none" stroke={stroke} strokeWidth="1.5" />
          {currentPts.map((p, i) => (
            <circle
              key={i}
              cx={p.x * SIZE}
              cy={SIZE - p.y * SIZE}
              r={5}
              fill="hsl(var(--background))"
              stroke={stroke}
              strokeWidth="2"
              className="cursor-grab"
              onPointerDown={(e) => {
                e.stopPropagation();
                dragging.current = i;
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                removePoint(i);
              }}
            />
          ))}
        </svg>
      </div>
      <p className="text-[10px] text-muted-foreground">
        Double-click empty area to add a point · double-click a point to remove it
      </p>
    </div>
  );
};

export default CurvesEditor;
