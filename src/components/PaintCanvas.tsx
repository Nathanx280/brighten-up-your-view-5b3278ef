import { useEffect, useRef, useState } from "react";
import { ARK_PALETTE, getColorByIndex } from "@/lib/ark-palette";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Brush, Eraser, MousePointer2, Grid3x3, Undo2, Redo2, Eye, EyeOff, ZoomIn } from "lucide-react";
import type { UvOverlay } from "@/lib/uv-overlays";

interface Props {
  imageData: ImageData | null;
  width: number;
  height: number;
  label: string;
  selectedColor: number;
  onSelectColor: (i: number) => void;
  onPaint?: (x: number, y: number, color: number) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  overlay?: UvOverlay | null;
}

type Tool = "view" | "paint" | "eraser";

const PaintCanvas = ({
  imageData,
  width,
  height,
  label,
  selectedColor,
  onSelectColor,
  onPaint,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  overlay,
}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tool, setTool] = useState<Tool>("view");
  const [brush, setBrush] = useState(2);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [grid, setGrid] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const drawing = useRef(false);
  const panning = useRef<{ sx: number; sy: number; px: number; py: number } | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !imageData) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    canvasRef.current.width = width;
    canvasRef.current.height = height;
    ctx.putImageData(imageData, 0, 0);
  }, [imageData, width, height]);

  const handlePaintAt = (clientX: number, clientY: number) => {
    if (!onPaint || !canvasRef.current || tool === "view") return;
    const rect = canvasRef.current.getBoundingClientRect();
    const px = Math.floor(((clientX - rect.left) / rect.width) * width);
    const py = Math.floor(((clientY - rect.top) / rect.height) * height);
    const color = tool === "eraser" ? 0 : selectedColor;
    const r = Math.max(0, brush - 1);
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy > r * r + r) continue;
        const x = px + dx, y = py + dy;
        if (x < 0 || y < 0 || x >= width || y >= height) continue;
        onPaint(x, y, color);
      }
    }
  };

  const baseSize = 420; // displayed CSS size at zoom=1
  const scale = baseSize / Math.max(width, height);
  const dispW = width * scale * zoom;
  const dispH = height * scale * zoom;
  const gridStep = scale * zoom; // px per source pixel

  return (
    <div className="glass rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-foreground text-sm font-medium">{label}</h3>
        <div className="flex items-center gap-1 flex-wrap">
          <Button size="sm" variant={tool === "view" ? "default" : "outline"} className="h-7 px-2" onClick={() => setTool("view")}>
            <MousePointer2 className="w-3.5 h-3.5" />
          </Button>
          <Button size="sm" variant={tool === "paint" ? "default" : "outline"} className="h-7 px-2" onClick={() => setTool("paint")} disabled={!onPaint}>
            <Brush className="w-3.5 h-3.5" />
          </Button>
          <Button size="sm" variant={tool === "eraser" ? "default" : "outline"} className="h-7 px-2" onClick={() => setTool("eraser")} disabled={!onPaint}>
            <Eraser className="w-3.5 h-3.5" />
          </Button>
          <span className="w-px h-5 bg-border mx-1" />
          <Button size="sm" variant="outline" className="h-7 px-2" onClick={onUndo} disabled={!canUndo}>
            <Undo2 className="w-3.5 h-3.5" />
          </Button>
          <Button size="sm" variant="outline" className="h-7 px-2" onClick={onRedo} disabled={!canRedo}>
            <Redo2 className="w-3.5 h-3.5" />
          </Button>
          <span className="w-px h-5 bg-border mx-1" />
          <Button size="sm" variant={grid ? "default" : "outline"} className="h-7 px-2" onClick={() => setGrid(!grid)} title="Pixel grid">
            <Grid3x3 className="w-3.5 h-3.5" />
          </Button>
          {overlay && (
            <Button size="sm" variant={showOverlay ? "default" : "outline"} className="h-7 px-2" onClick={() => setShowOverlay(!showOverlay)} title="UV overlay">
              {showOverlay ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ZoomIn className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <Slider value={[zoom]} min={1} max={8} step={0.25} onValueChange={([v]) => setZoom(v)} className="flex-1" />
        <span className="text-xs tabular-nums text-muted-foreground w-10 text-right">{zoom.toFixed(1)}×</span>
        {zoom > 1 && (
          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>
            Fit
          </Button>
        )}
      </div>

      {tool !== "view" && (
        <div className="flex items-center gap-3">
          <Label className="text-xs text-muted-foreground shrink-0">Brush {brush}px</Label>
          <Slider value={[brush]} min={1} max={12} step={1} onValueChange={([v]) => setBrush(v)} className="flex-1" />
        </div>
      )}

      {imageData ? (
        <div
          ref={wrapRef}
          className="relative bg-muted/20 rounded overflow-hidden flex items-center justify-center"
          style={{ height: 440, touchAction: "none" }}
          onWheel={(e) => {
            e.preventDefault();
            setZoom((z) => Math.max(1, Math.min(8, z - e.deltaY * 0.005)));
          }}
        >
          <div
            className="relative"
            style={{
              width: dispW,
              height: dispH,
              transform: `translate(${pan.x}px, ${pan.y}px)`,
              cursor:
                tool === "view" ? (panning.current ? "grabbing" : zoom > 1 ? "grab" : "default") : "crosshair",
            }}
            onPointerDown={(e) => {
              if (tool === "view" && zoom > 1) {
                panning.current = { sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y };
                (e.target as HTMLElement).setPointerCapture(e.pointerId);
                return;
              }
              drawing.current = true;
              (e.target as HTMLElement).setPointerCapture(e.pointerId);
              handlePaintAt(e.clientX, e.clientY);
            }}
            onPointerMove={(e) => {
              if (panning.current) {
                setPan({
                  x: panning.current.px + (e.clientX - panning.current.sx),
                  y: panning.current.py + (e.clientY - panning.current.sy),
                });
                return;
              }
              if (drawing.current) handlePaintAt(e.clientX, e.clientY);
            }}
            onPointerUp={() => {
              drawing.current = false;
              panning.current = null;
            }}
          >
            <canvas
              ref={canvasRef}
              className="block"
              style={{
                imageRendering: "pixelated",
                width: dispW,
                height: dispH,
              }}
            />
            {grid && gridStep >= 4 && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.15) 1px, transparent 1px)",
                  backgroundSize: `${gridStep}px ${gridStep}px`,
                }}
              />
            )}
            {overlay && showOverlay && (
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 pointer-events-none text-primary"
                style={{ width: dispW, height: dispH, mixBlendMode: "screen", opacity: 0.7 }}
                dangerouslySetInnerHTML={{ __html: overlay.svg }}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">No preview available</div>
      )}

      {tool === "paint" && (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Active color</Label>
          <div className="flex flex-wrap gap-1">
            {ARK_PALETTE.map((c) => (
              <button
                key={c.index}
                title={c.name}
                onClick={() => onSelectColor(c.index)}
                className={`w-6 h-6 rounded border-2 transition-all ${
                  selectedColor === c.index ? "border-primary scale-110" : "border-transparent"
                }`}
                style={{ backgroundColor: `rgb(${c.r},${c.g},${c.b})` }}
              />
            ))}
          </div>
        </div>
      )}

      {imageData && (
        <p className="text-muted-foreground text-xs text-center">
          {width} × {height} px {tool === "paint" && (
            <span className="ml-2">· {getColorByIndex(selectedColor)?.name}</span>
          )}
          {overlay && showOverlay && <span className="ml-2">· {overlay.label}</span>}
        </p>
      )}
    </div>
  );
};

export default PaintCanvas;
