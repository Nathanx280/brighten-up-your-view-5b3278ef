import { useEffect, useState } from "react";
import { Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearHistory, getHistory, type HistoryEntry } from "@/lib/storage";

interface Props {
  refreshKey: number;
}

const HistoryPanel = ({ refreshKey }: Props) => {
  const [items, setItems] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setItems(getHistory());
  }, [refreshKey]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Clock className="w-4 h-4" /> Recent
        </h3>
        {items.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => {
              clearHistory();
              setItems([]);
            }}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        )}
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-2">No conversions yet</p>
      ) : (
        <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-auto">
          {items.map((h) => (
            <div key={h.id} className="space-y-1">
              <img
                src={h.thumbnail}
                alt={h.fileName}
                className="w-full aspect-square object-cover rounded bg-muted"
                style={{ imageRendering: "pixelated" }}
              />
              <p className="text-[10px] text-muted-foreground truncate" title={h.fileName}>
                {h.fileName}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPanel;
