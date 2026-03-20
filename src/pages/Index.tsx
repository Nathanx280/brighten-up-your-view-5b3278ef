import { Upload, Zap } from "lucide-react";
import { useRef, useState, ChangeEvent } from "react";

const Index = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 px-4 py-4">
        <div className="container max-w-6xl mx-auto flex items-center gap-3">
          <Zap className="w-8 h-8 text-primary fill-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              ARK <span className="text-primary">PNT</span> Converter
            </h1>
            <p className="text-muted-foreground text-sm">
              Convert images to ARK: Survival Evolved painting files
            </p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Upload Zone */}
        <div className="w-full">
          <div className="relative glass rounded-lg p-8 text-center cursor-pointer transition-all duration-300 hover:border-primary/50">
            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.bmp,.webp"
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              onChange={handleFileChange}
            />
            <div className="space-y-4 py-8">
              <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
              <div>
                <p className="text-foreground text-xl">Drop your image here</p>
                <p className="text-muted-foreground text-sm mt-1">
                  PNG, JPG, JPEG, BMP, WEBP supported
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Preview uploaded image */}
        {uploadedImage && (
          <div className="space-y-4">
            <div className="glass rounded-lg p-4">
              <p className="text-muted-foreground text-sm mb-3">
                Uploaded: <span className="text-foreground">{fileName}</span>
              </p>
              <img
                src={uploadedImage}
                alt="Uploaded preview"
                className="max-w-full max-h-[500px] mx-auto rounded"
              />
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="text-center text-muted-foreground text-xs space-y-1 pb-8">
          <p>Place downloaded .pnt files in your ARK MyPaintings folder:</p>
          <code className="text-accent text-xs">
            Steam/steamapps/common/ARK/ShooterGame/Saved/MyPaintings/
          </code>
        </div>
      </main>
    </div>
  );
};

export default Index;
