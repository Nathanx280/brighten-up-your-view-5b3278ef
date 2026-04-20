import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  onGenerated: (img: HTMLImageElement, name: string) => void;
}

const SUGGESTIONS = [
  "A roaring fire dragon",
  "Skull with crossed swords",
  "Pixel sunset palm tree",
  "Tribal wolf head",
  "ARK logo retro",
  "Floating astronaut",
];

const AiGenerator = ({ onGenerated }: Props) => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async (text?: string) => {
    const p = (text ?? prompt).trim();
    if (!p) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: { prompt: p },
      });
      if (error) throw error;
      if (!data?.image) throw new Error(data?.error || "No image");
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        onGenerated(img, p.slice(0, 40).replace(/[^\w-]+/g, "_"));
        toast.success("Image generated!");
      };
      img.onerror = () => toast.error("Could not load generated image");
      img.src = data.image;
    } catch (e: any) {
      const msg = e?.message || "Generation failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" /> AI Generator
      </h3>
      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe what you want to paint..."
        className="text-sm min-h-[72px]"
        disabled={loading}
      />
      <div className="flex flex-wrap gap-1">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            disabled={loading}
            onClick={() => {
              setPrompt(s);
              generate(s);
            }}
            className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition"
          >
            {s}
          </button>
        ))}
      </div>
      <Button onClick={() => generate()} disabled={loading || !prompt.trim()} className="w-full">
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" /> Generate
          </>
        )}
      </Button>
      <p className="text-[10px] text-muted-foreground">
        Powered by Lovable AI. Result auto-loads as the source image.
      </p>
    </div>
  );
};

export default AiGenerator;
