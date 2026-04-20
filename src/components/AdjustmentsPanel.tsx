import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RotateCw, FlipHorizontal, FlipVertical, RefreshCw } from "lucide-react";
import { DEFAULT_ADJUSTMENTS, type Adjustments, type ScaleMode } from "@/lib/image-adjustments";
import CurvesEditor, { DEFAULT_CURVES, type Channel, type CurvePoint } from "./CurvesEditor";

interface Props {
  value: Adjustments;
  onChange: (a: Adjustments) => void;
}

const Row = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  fmt,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  fmt?: (v: number) => string;
}) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <span className="text-xs tabular-nums text-foreground">{fmt ? fmt(value) : value}</span>
    </div>
    <Slider
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={([v]) => onChange(v)}
    />
  </div>
);

const AdjustmentsPanel = ({ value, onChange }: Props) => {
  const set = <K extends keyof Adjustments>(k: K, v: Adjustments[K]) => onChange({ ...value, [k]: v });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Image Adjustments</h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={() => onChange(DEFAULT_ADJUSTMENTS)}
        >
          <RefreshCw className="w-3 h-3 mr-1" /> Reset
        </Button>
      </div>

      <div className="space-y-3">
        <Row label="Brightness" value={value.brightness} min={-100} max={100} step={1} onChange={(v) => set("brightness", v)} />
        <Row label="Contrast" value={value.contrast} min={-100} max={100} step={1} onChange={(v) => set("contrast", v)} />
        <Row label="Saturation" value={value.saturation} min={-100} max={100} step={1} onChange={(v) => set("saturation", v)} />
        <Row label="Hue" value={value.hue} min={-180} max={180} step={1} onChange={(v) => set("hue", v)} fmt={(v) => `${v}°`} />
        <Row label="Gamma" value={value.gamma} min={0.1} max={3} step={0.05} onChange={(v) => set("gamma", v)} fmt={(v) => v.toFixed(2)} />
        <Row label="Sharpen" value={value.sharpen} min={0} max={100} step={1} onChange={(v) => set("sharpen", v)} />
        <Row label="Blur" value={value.blur} min={0} max={10} step={1} onChange={(v) => set("blur", v)} />
        <Row label="Posterize" value={value.posterize} min={0} max={32} step={1} onChange={(v) => set("posterize", v)} fmt={(v) => (v < 2 ? "off" : `${v} levels`)} />
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">Invert colors</Label>
        <Switch checked={value.invert} onCheckedChange={(v) => set("invert", v)} />
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Transform</Label>
        <div className="flex flex-wrap gap-1.5">
          <Button
            size="sm"
            variant="outline"
            className="h-8"
            onClick={() => set("rotate", (((value.rotate + 90) % 360) as 0 | 90 | 180 | 270))}
          >
            <RotateCw className="w-3.5 h-3.5 mr-1" /> {value.rotate}°
          </Button>
          <Button
            size="sm"
            variant={value.flipH ? "default" : "outline"}
            className="h-8"
            onClick={() => set("flipH", !value.flipH)}
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            variant={value.flipV ? "default" : "outline"}
            className="h-8"
            onClick={() => set("flipV", !value.flipV)}
          >
            <FlipVertical className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Scaling</Label>
        <div className="grid grid-cols-3 gap-1">
          {(["fit", "fill", "stretch"] as ScaleMode[]).map((m) => (
            <Button
              key={m}
              size="sm"
              variant={value.scaleMode === m ? "default" : "outline"}
              className="h-8 text-xs capitalize"
              onClick={() => set("scaleMode", m)}
            >
              {m}
            </Button>
          ))}
        </div>
      </div>

      {value.scaleMode === "fit" && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Background fill</Label>
          <input
            type="color"
            value={`#${[value.bgColor.r, value.bgColor.g, value.bgColor.b]
              .map((c) => c.toString(16).padStart(2, "0"))
              .join("")}`}
            onChange={(e) => {
              const hex = e.target.value;
              set("bgColor", {
                r: parseInt(hex.slice(1, 3), 16),
                g: parseInt(hex.slice(3, 5), 16),
                b: parseInt(hex.slice(5, 7), 16),
              });
            }}
            className="w-full h-8 rounded cursor-pointer bg-transparent border border-border"
          />
        </div>
      )}
    </div>
  );
};

export default AdjustmentsPanel;
