import { useEffect, useRef, useState } from "react";
import { ARK_PALETTE, getColorByIndex } from "@/lib/ark-palette";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Brush, Eraser, MousePointer2 } from "lucide-react";

interface Props {
  imageData: ImageData | null;
  width: number;
  height: number;
  label: string;
  selectedColor: number;
  onSelectColor: (i: number) => void;
  onPaint?: (x: number, y: number, color: number) => void;
  zoom?: number;
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
  zoom = 1,
}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>("view");
  const [brush, setBrush] = useState(2);
  const drawing = useRef(false);

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

  return (
    <div className="glass rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-foreground text-sm font-medium">{label}</h3>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant={tool === "view" ? "default" : "outline"}
            className="h-7 px-2"
            onClick={() => setTool("view")}
          >
            <MousePointer2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            variant={tool === "paint" ? "default" : "outline"}
            className="h-7 px-2"
            onClick={() => setTool("paint")}
            disabled={!onPaint}
          >
            <Brush className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            variant={tool === "eraser" ? "default" : "outline"}
            className="h-7 px-2"
            onClick={() => setTool("eraser")}
            disabled={!onPaint}
          >
            <Eraser className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {tool !== "view" && (
        <div className="flex items-center gap-3">
          <Label className="text-xs text-muted-foreground shrink-0">Brush {brush}px</Label>
          <Slider value={[brush]} min={1} max={12} step={1} onValueChange={([v]) => setBrush(v)} className="flex-1" />
        </div>
      )}

      {imageData ? (
        <div className="relative bg-muted/20 rounded overflow-auto max-h-[420px] flex items-center justify-center">
          <canvas
            ref={canvasRef}
            className="max-w-full"
            style={{
              imageRendering: "pixelated",
              cursor: tool === "view" ? "default" : "crosshair",
              width: `${Math.min(420, width * zoom)}px`,
              height: "auto",
              touchAction: "none",
            }}
            onPointerDown={(e) => {
              drawing.current = true;
              (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
              handlePaintAt(e.clientX, e.clientY);
            }}
            onPointerMove={(e) => drawing.current && handlePaintAt(e.clientX, e.clientY)}
            onPointerUp={() => (drawing.current = false)}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
          No preview available
        </div>
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
          {width} × {height} px {selectedColor !== 0 && tool === "paint" && (
            <span className="ml-2">· painting with {getColorByIndex(selectedColor)?.name}</span>
          )}
        </p>
      )}
    </div>
  );
};

export default PaintCanvas;
