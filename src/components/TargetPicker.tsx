import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CATEGORY_ORDER, PAINTING_TARGETS, type PaintingTarget } from "@/lib/painting-targets";

interface Props {
  value: string;
  onChange: (suffix: string) => void;
}

const TargetPicker = ({ value, onChange }: Props) => {
  const [open, setOpen] = useState(false);
  const current = PAINTING_TARGETS.find((t) => t.suffix === value);
  const grouped = useMemo(() => {
    const map = new Map<string, PaintingTarget[]>();
    for (const cat of CATEGORY_ORDER) map.set(cat, []);
    for (const t of PAINTING_TARGETS) map.get(t.category)?.push(t);
    return map;
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full md:w-[320px] justify-between bg-muted/50"
        >
          <span className="truncate">
            {current ? (
              <>
                <span className="text-foreground">{current.name}</span>
                <span className="text-muted-foreground ml-2 text-xs">
                  {current.width}×{current.height}
                </span>
              </>
            ) : (
              "Select target..."
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[340px] p-0" align="start">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput placeholder="Search dinos, structures, armor..." className="border-0" />
          </div>
          <CommandList className="max-h-[420px]">
            <CommandEmpty>No target found.</CommandEmpty>
            {CATEGORY_ORDER.map((cat) => {
              const items = grouped.get(cat) || [];
              if (!items.length) return null;
              return (
                <CommandGroup key={cat} heading={`${cat} (${items.length})`}>
                  {items.map((t) => (
                    <CommandItem
                      key={t.suffix}
                      value={`${cat} ${t.name} ${t.suffix}`}
                      onSelect={() => {
                        onChange(t.suffix);
                        setOpen(false);
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", value === t.suffix ? "opacity-100" : "opacity-0")} />
                      <span className="flex-1">{t.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {t.width}×{t.height}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default TargetPicker;
