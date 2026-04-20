import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Upload, Zap, Download, FileImage, FileUp } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

import ColorPalette from "@/components/ColorPalette";
import TargetPicker from "@/components/TargetPicker";
import AdjustmentsPanel from "@/components/AdjustmentsPanel";
import DitherSelect from "@/components/DitherSelect";
import PaintCanvas from "@/components/PaintCanvas";
import BatchPanel from "@/components/BatchPanel";
import PresetsPanel from "@/components/PresetsPanel";
import HistoryPanel from "@/components/HistoryPanel";
import AiGenerator from "@/components/AiGenerator";

import { ARK_PALETTE } from "@/lib/ark-palette";
import { PAINTING_TARGETS, getTargetByKey } from "@/lib/painting-targets";
import { DEFAULT_ADJUSTMENTS, type Adjustments } from "@/lib/image-adjustments";
import type { DitherMode } from "@/lib/dithering";
import { convertImage } from "@/lib/convert";
import { decodePNT, downloadPNT, encodePNT, indicesToImageData } from "@/lib/pnt-codec";
import { pushHistory } from "@/lib/storage";
import { getOverlayForTarget } from "@/lib/uv-overlays";

const Index = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pntInputRef = useRef<HTMLInputElement>(null);

  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState("MyPainting");
  const [targetSuffix, setTargetSuffix] = useState<string>(PAINTING_TARGETS[0].suffix);
  const [dither, setDither] = useState<DitherMode>("floyd-steinberg");
  const [adjustments, setAdjustments] = useState<Adjustments>(DEFAULT_ADJUSTMENTS);
  const [enabledColors, setEnabledColors] = useState<Set<number>>(
    () => new Set(ARK_PALETTE.map((c) => c.index))
  );
  const [paintColor, setPaintColor] = useState<number>(1);

  const [previewImageData, setPreviewImageData] = useState<ImageData | null>(null);
  const [indices, setIndices] = useState<Uint8Array | null>(null);
  const [pntData, setPntData] = useState<ArrayBuffer | null>(null);
  const [converting, setConverting] = useState(false);
  const [historyKey, setHistoryKey] = useState(0);

  // Undo/redo stack of pixel-index snapshots from manual paint edits
  const undoStack = useRef<Uint8Array[]>([]);
  const redoStack = useRef<Uint8Array[]>([]);
  const [, forceTick] = useState(0);

  const target = useMemo(
    () => getTargetByKey(targetSuffix) ?? PAINTING_TARGETS[0],
    [targetSuffix]
  );
  const overlay = useMemo(
    () => getOverlayForTarget(target.suffix, target.category),
    [target]
  );

  // Auto-convert pipeline
  useEffect(() => {
    if (!sourceImage) return;
    setConverting(true);
    const handle = setTimeout(() => {
      try {
        const result = convertImage({
          source: sourceImage,
          targetWidth: target.width,
          targetHeight: target.height,
          enabledColors,
          dither,
          adjustments,
        });
        setPreviewImageData(result.previewImageData);
        setIndices(result.indices);
        setPntData(result.pntData);
      } catch (e) {
        console.error(e);
        toast.error("Conversion failed");
      } finally {
        setConverting(false);
      }
    }, 30);
    return () => clearTimeout(handle);
  }, [sourceImage, target, enabledColors, dither, adjustments]);

  const loadImageFile = useCallback((file: File) => {
    const baseName = file.name.replace(/\.[^.]+$/, "");
    setFileName(baseName);
    const img = new Image();
    img.onload = () => setSourceImage(img);
    img.onerror = () => toast.error("Could not read image");
    img.src = URL.createObjectURL(file);
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadImageFile(file);
  };

  const handlePntImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const buffer = await file.arrayBuffer();
      const decoded = decodePNT(buffer);
      const img = indicesToImageData(decoded.indices, decoded.width, decoded.height);
      // Render to canvas then convert that canvas to an image element used as the source
      const c = document.createElement("canvas");
      c.width = decoded.width;
      c.height = decoded.height;
      c.getContext("2d")!.putImageData(img, 0, 0);
      const dataUrl = c.toDataURL();
      const im = new Image();
      im.onload = () => {
        setSourceImage(im);
        setAdjustments({ ...DEFAULT_ADJUSTMENTS, scaleMode: "stretch" });
        // try to find a matching target by dimensions
        const match = PAINTING_TARGETS.find(
          (t) => t.width === decoded.width && t.height === decoded.height
        );
        if (match) setTargetSuffix(match.suffix);
        toast.success(`Imported ${decoded.width}×${decoded.height} .pnt`);
      };
      im.src = dataUrl;
      setFileName(file.name.replace(/\.pnt$/i, ""));
    } catch (err) {
      console.error(err);
      toast.error("Invalid .pnt file");
    }
  };

  const handleDownload = () => {
    if (!pntData) return;
    const outputName = `${fileName}${target.suffix}.pnt`;
    downloadPNT(pntData, outputName);

    if (previewImageData) {
      const c = document.createElement("canvas");
      c.width = Math.min(64, target.width);
      c.height = Math.min(64, target.height);
      const ctx = c.getContext("2d")!;
      const tmp = document.createElement("canvas");
      tmp.width = target.width;
      tmp.height = target.height;
      tmp.getContext("2d")!.putImageData(previewImageData, 0, 0);
      ctx.drawImage(tmp, 0, 0, c.width, c.height);
      pushHistory({
        id: crypto.randomUUID(),
        fileName: outputName,
        thumbnail: c.toDataURL("image/png"),
        targetSuffix: target.suffix,
        width: target.width,
        height: target.height,
        createdAt: Date.now(),
      });
      setHistoryKey((k) => k + 1);
    }
    toast.success(`Saved ${outputName}`);
  };

  const applyIndices = (next: Uint8Array) => {
    setIndices(next);
    setPreviewImageData(indicesToImageData(next, target.width, target.height));
    setPntData(encodePNT(target.width, target.height, next));
  };

  const paintStrokeStarted = useRef(false);
  const handlePixelPaint = (x: number, y: number, color: number) => {
    if (!indices) return;
    const i = y * target.width + x;
    if (indices[i] === color) return;
    if (!paintStrokeStarted.current) {
      // Snapshot before the first edit of a stroke
      undoStack.current.push(new Uint8Array(indices));
      if (undoStack.current.length > 50) undoStack.current.shift();
      redoStack.current = [];
      paintStrokeStarted.current = true;
      forceTick((t) => t + 1);
    }
    const next = new Uint8Array(indices);
    next[i] = color;
    applyIndices(next);
  };

  // End of stroke when pointer is released anywhere
  useEffect(() => {
    const onUp = () => (paintStrokeStarted.current = false);
    window.addEventListener("pointerup", onUp);
    return () => window.removeEventListener("pointerup", onUp);
  }, []);

  const handleUndo = () => {
    if (!undoStack.current.length || !indices) return;
    const prev = undoStack.current.pop()!;
    redoStack.current.push(new Uint8Array(indices));
    applyIndices(prev);
    forceTick((t) => t + 1);
  };
  const handleRedo = () => {
    if (!redoStack.current.length || !indices) return;
    const next = redoStack.current.pop()!;
    undoStack.current.push(new Uint8Array(indices));
    applyIndices(next);
    forceTick((t) => t + 1);
  };

  // Reset undo when a new image is loaded / target changes
  useEffect(() => {
    undoStack.current = [];
    redoStack.current = [];
  }, [sourceImage, target]);

  const handleToggleColor = (i: number) =>
    setEnabledColors((prev) => {
      const n = new Set(prev);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 px-4 py-4 sticky top-0 z-20 bg-background/80 backdrop-blur">
        <div className="container max-w-7xl mx-auto flex items-center gap-3">
          <Zap className="w-7 h-7 text-primary fill-primary" />
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground leading-tight">
              ARK <span className="text-primary">PNT</span> Studio
            </h1>
            <p className="text-muted-foreground text-xs">
              Convert, edit & paint .pnt files for ARK: Survival Evolved
            </p>
          </div>
          {sourceImage && (
            <Button onClick={handleDownload} disabled={!pntData || converting} className="gap-1.5">
              <Download className="w-4 h-4" />
              Download .pnt
            </Button>
          )}
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-6">
        {!sourceImage ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto pt-12">
            <div
              className="glass rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-all relative"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.bmp,.webp"
                className="hidden"
                onChange={handleFileChange}
              />
              <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-foreground text-lg font-medium">Drop an image</p>
              <p className="text-muted-foreground text-xs mt-1">PNG · JPG · BMP · WEBP</p>
            </div>
            <div
              className="glass rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-all relative"
              onClick={() => pntInputRef.current?.click()}
            >
              <input
                ref={pntInputRef}
                type="file"
                accept=".pnt"
                className="hidden"
                onChange={handlePntImport}
              />
              <FileUp className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-foreground text-lg font-medium">Import existing .pnt</p>
              <p className="text-muted-foreground text-xs mt-1">View, edit & re-export</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
            {/* Sidebar */}
            <aside className="space-y-4">
              <div className="glass rounded-lg p-4 space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Target</Label>
                  <TargetPicker value={targetSuffix} onChange={setTargetSuffix} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">File name</Label>
                  <Input
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="h-9"
                  />
                  <p className="text-[10px] text-muted-foreground truncate">
                    Saves as <code className="text-accent">{fileName}{target.suffix}.pnt</code>
                  </p>
                </div>
                <DitherSelect value={dither} onChange={setDither} />
              </div>

              <div className="glass rounded-lg p-4">
                <Tabs defaultValue="adjust">
                  <TabsList className="grid grid-cols-4 w-full h-8">
                    <TabsTrigger value="adjust" className="text-xs">Adjust</TabsTrigger>
                    <TabsTrigger value="ai" className="text-xs">AI</TabsTrigger>
                    <TabsTrigger value="presets" className="text-xs">Presets</TabsTrigger>
                    <TabsTrigger value="batch" className="text-xs">Batch</TabsTrigger>
                  </TabsList>
                  <TabsContent value="adjust" className="pt-3">
                    <AdjustmentsPanel value={adjustments} onChange={setAdjustments} />
                  </TabsContent>
                  <TabsContent value="ai" className="pt-3">
                    <AiGenerator
                      onGenerated={(img, name) => {
                        setSourceImage(img);
                        setFileName(name || "AiPainting");
                        setAdjustments(DEFAULT_ADJUSTMENTS);
                      }}
                    />
                  </TabsContent>
                  <TabsContent value="presets" className="pt-3 space-y-4">
                    <PresetsPanel
                      current={{ targetSuffix, dither, enabledColors, adjustments }}
                      onApply={(p) => {
                        setTargetSuffix(p.targetSuffix);
                        setDither(p.dither);
                        setEnabledColors(new Set(p.enabledColors));
                        setAdjustments(p.adjustments);
                        toast.success(`Loaded preset "${p.name}"`);
                      }}
                    />
                    <Separator />
                    <HistoryPanel refreshKey={historyKey} />
                  </TabsContent>
                  <TabsContent value="batch" className="pt-3">
                    <BatchPanel
                      target={target}
                      enabledColors={enabledColors}
                      dither={dither}
                      adjustments={adjustments}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </aside>

            {/* Main canvas */}
            <section className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-foreground text-sm font-medium flex items-center gap-2">
                      <FileImage className="w-4 h-4" /> Original
                    </h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => {
                        setSourceImage(null);
                        setPreviewImageData(null);
                        setPntData(null);
                        setIndices(null);
                        setAdjustments(DEFAULT_ADJUSTMENTS);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                    >
                      New
                    </Button>
                  </div>
                  <div className="bg-muted/20 rounded flex items-center justify-center max-h-[420px] overflow-hidden">
                    <img
                      src={sourceImage.src}
                      alt="Original"
                      className="max-w-full max-h-[400px] object-contain"
                    />
                  </div>
                  <p className="text-muted-foreground text-xs text-center">
                    {sourceImage.naturalWidth} × {sourceImage.naturalHeight} px
                  </p>
                </div>

                <PaintCanvas
                  imageData={previewImageData}
                  width={target.width}
                  height={target.height}
                  label={converting ? "Converting..." : "PNT Preview"}
                  selectedColor={paintColor}
                  onSelectColor={setPaintColor}
                  onPaint={handlePixelPaint}
                />
              </div>

              <ColorPalette
                enabledColors={enabledColors}
                onToggleColor={handleToggleColor}
                onEnableAll={() => setEnabledColors(new Set(ARK_PALETTE.map((c) => c.index)))}
                onDisableAll={() => setEnabledColors(new Set())}
              />
            </section>
          </div>
        )}

        <div className="text-center text-muted-foreground text-xs space-y-1 pt-8 pb-4">
          <p>Place .pnt files in your ARK MyPaintings folder:</p>
          <code className="text-accent text-xs">
            Steam/steamapps/common/ARK/ShooterGame/Saved/MyPaintings/
          </code>
        </div>
      </main>
    </div>
  );
};

export default Index;
