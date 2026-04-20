import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bookmark, Trash2, Save } from "lucide-react";
import { deletePreset, getPresets, savePreset, type Preset } from "@/lib/storage";
import type { Adjustments } from "@/lib/image-adjustments";
import type { DitherMode } from "@/lib/dithering";

interface Props {
  current: {
    targetSuffix: string;
    dither: DitherMode;
    enabledColors: Set<number>;
    adjustments: Adjustments;
  };
  onApply: (p: Preset) => void;
}

const PresetsPanel = ({ current, onApply }: Props) => {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    setPresets(getPresets());
  }, []);

  const handleSave = () => {
    if (!name.trim()) return;
    const p: Preset = {
      id: crypto.randomUUID(),
      name: name.trim(),
      targetSuffix: current.targetSuffix,
      dither: current.dither,
      enabledColors: Array.from(current.enabledColors),
      adjustments: current.adjustments,
      createdAt: Date.now(),
    };
    savePreset(p);
    setPresets(getPresets());
    setName("");
  };

  const handleDelete = (id: string) => {
    deletePreset(id);
    setPresets(getPresets());
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <Bookmark className="w-4 h-4" /> Presets
      </h3>
      <div className="flex gap-1.5">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Preset name..."
          className="h-8 text-sm"
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
        />
        <Button size="sm" onClick={handleSave} disabled={!name.trim()} className="h-8">
          <Save className="w-3.5 h-3.5" />
        </Button>
      </div>
      <div className="space-y-1 max-h-48 overflow-auto">
        {presets.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">No presets saved</p>
        )}
        {presets.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-1 group rounded hover:bg-muted/50 px-2 py-1"
          >
            <button
              onClick={() => onApply(p)}
              className="flex-1 text-left text-sm truncate text-foreground hover:text-primary"
            >
              {p.name}
            </button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
              onClick={() => handleDelete(p.id)}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PresetsPanel;
