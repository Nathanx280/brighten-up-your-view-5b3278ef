import { DITHER_LABELS, type DitherMode } from "@/lib/dithering";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  value: DitherMode;
  onChange: (m: DitherMode) => void;
}

const DitherSelect = ({ value, onChange }: Props) => (
  <div className="space-y-1.5">
    <Label className="text-xs text-muted-foreground">Dithering algorithm</Label>
    <Select value={value} onValueChange={(v) => onChange(v as DitherMode)}>
      <SelectTrigger className="bg-muted/50">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(DITHER_LABELS) as DitherMode[]).map((m) => (
          <SelectItem key={m} value={m}>
            {DITHER_LABELS[m]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export default DitherSelect;
