import { useRef, useState } from "react";
import JSZip from "jszip";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Layers, Download, X } from "lucide-react";
import { convertImage } from "@/lib/convert";
import type { Adjustments } from "@/lib/image-adjustments";
import type { DitherMode } from "@/lib/dithering";
import type { PaintingTarget } from "@/lib/painting-targets";

interface Props {
  target: PaintingTarget;
  enabledColors: Set<number>;
  dither: DitherMode;
  adjustments: Adjustments;
}

const BatchPanel = ({ target, enabledColors, dither, adjustments }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);

  const onPick = (fl: FileList | null) => {
    if (!fl) return;
    setFiles(Array.from(fl));
  };

  const run = async () => {
    if (!files.length) return;
    setRunning(true);
    setProgress(0);
    const zip = new JSZip();
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const img = await loadImage(f);
      const result = convertImage({
        source: img,
        targetWidth: target.width,
        targetHeight: target.height,
        enabledColors,
        dither,
        adjustments,
      });
      const baseName = f.name.replace(/\.[^.]+$/, "");
      zip.file(`${baseName}${target.suffix}.pnt`, result.pntData);
      setProgress(Math.round(((i + 1) / files.length) * 100));
      await new Promise((r) => setTimeout(r, 0));
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ark-pnt-batch-${Date.now()}.zip`;
    a.click();
    URL.revokeObjectURL(url);
    setRunning(false);
  };

  return (
    <div className="glass rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Layers className="w-4 h-4" /> Batch Convert
        </h3>
        {files.length > 0 && (
          <Button variant="ghost" size="sm" className="h-7" onClick={() => setFiles([])}>
            <X className="w-3 h-3 mr-1" /> Clear
          </Button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".png,.jpg,.jpeg,.bmp,.webp"
        className="hidden"
        onChange={(e) => onPick(e.target.files)}
      />
      <Button variant="outline" className="w-full" onClick={() => inputRef.current?.click()}>
        Add images ({files.length})
      </Button>
      {files.length > 0 && (
        <div className="text-xs text-muted-foreground max-h-24 overflow-auto space-y-0.5">
          {files.slice(0, 8).map((f, i) => (
            <div key={i} className="truncate">• {f.name}</div>
          ))}
          {files.length > 8 && <div>+ {files.length - 8} more...</div>}
        </div>
      )}
      {running && <Progress value={progress} className="h-1.5" />}
      <Button
        className="w-full"
        disabled={!files.length || running}
        onClick={run}
      >
        <Download className="w-3.5 h-3.5 mr-2" />
        {running ? `Converting... ${progress}%` : `Convert & download ZIP`}
      </Button>
      <p className="text-xs text-muted-foreground">
        All files use current settings · suffix <code className="text-accent">{target.suffix}</code>
      </p>
    </div>
  );
};

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export default BatchPanel;
