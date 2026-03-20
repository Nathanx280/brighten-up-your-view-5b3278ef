import { findClosestColorIndex, getColorByIndex } from "./ark-palette";

export interface PNTResult {
  pntData: ArrayBuffer;
  previewImageData: ImageData;
  width: number;
  height: number;
}

// ARK painting target types with their resolutions
export const PAINTING_TARGETS = [
  { name: "Painting Canvas", suffix: "_Sign_Large_Metal_C", width: 256, height: 256 },
  { name: "War Map", suffix: "_WarMap_C", width: 256, height: 256 },
  { name: "Single Flag", suffix: "_Flag_C", width: 256, height: 256 },
  { name: "Multi Panel Flag", suffix: "_FlagMultiPanel_C", width: 256, height: 384 },
  { name: "Wooden Sign", suffix: "_Sign_Small_Wood_C", width: 128, height: 128 },
  { name: "Wooden Billboard", suffix: "_Sign_Large_Wood_C", width: 256, height: 256 },
  { name: "Metal Sign", suffix: "_Sign_Small_Metal_C", width: 128, height: 128 },
  { name: "Metal Billboard", suffix: "_Sign_Large_Metal_C", width: 256, height: 256 },
  { name: "Shag Rug", suffix: "_Rug_C", width: 256, height: 256 },
  { name: "Spotlight", suffix: "_Spotlight_C", width: 256, height: 256 },
  { name: "Raft", suffix: "_Raft_C", width: 256, height: 256 },
] as const;

export function convertImageToPNT(
  imageData: ImageData,
  targetWidth: number,
  targetHeight: number,
  enabledColors: Set<number>,
  dithering: boolean
): PNTResult {
  // Scale image to target size using canvas
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d")!;
  
  // Create temp canvas with source image
  const srcCanvas = document.createElement("canvas");
  srcCanvas.width = imageData.width;
  srcCanvas.height = imageData.height;
  const srcCtx = srcCanvas.getContext("2d")!;
  srcCtx.putImageData(imageData, 0, 0);
  
  // Draw scaled
  ctx.drawImage(srcCanvas, 0, 0, targetWidth, targetHeight);
  const scaledData = ctx.getImageData(0, 0, targetWidth, targetHeight);
  const pixels = scaledData.data;
  
  const totalPixels = targetWidth * targetHeight;
  const bits = new Uint8Array(totalPixels);
  
  // Working copy for dithering
  const workPixels = new Float32Array(pixels.length);
  for (let i = 0; i < pixels.length; i++) {
    workPixels[i] = pixels[i];
  }
  
  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const idx = (y * targetWidth + x) * 4;
      
      const r = Math.max(0, Math.min(255, Math.round(workPixels[idx])));
      const g = Math.max(0, Math.min(255, Math.round(workPixels[idx + 1])));
      const b = Math.max(0, Math.min(255, Math.round(workPixels[idx + 2])));
      const a = Math.max(0, Math.min(255, Math.round(workPixels[idx + 3])));
      
      const colorIndex = findClosestColorIndex(r, g, b, a, enabledColors);
      bits[y * targetWidth + x] = colorIndex;
      
      if (dithering && a >= 128) {
        const matched = getColorByIndex(colorIndex);
        if (matched) {
          const errR = r - matched.r;
          const errG = g - matched.g;
          const errB = b - matched.b;
          
          // Floyd-Steinberg dithering
          const distribute = (dx: number, dy: number, factor: number) => {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < targetWidth && ny >= 0 && ny < targetHeight) {
              const nIdx = (ny * targetWidth + nx) * 4;
              workPixels[nIdx] += errR * factor;
              workPixels[nIdx + 1] += errG * factor;
              workPixels[nIdx + 2] += errB * factor;
            }
          };
          
          distribute(1, 0, 7 / 16);
          distribute(-1, 1, 3 / 16);
          distribute(0, 1, 5 / 16);
          distribute(1, 1, 1 / 16);
        }
      }
    }
  }
  
  // Build preview ImageData
  const previewData = new ImageData(targetWidth, targetHeight);
  for (let i = 0; i < totalPixels; i++) {
    const colorIndex = bits[i];
    const color = getColorByIndex(colorIndex);
    const pIdx = i * 4;
    if (color) {
      previewData.data[pIdx] = color.r;
      previewData.data[pIdx + 1] = color.g;
      previewData.data[pIdx + 2] = color.b;
      previewData.data[pIdx + 3] = 255;
    } else {
      previewData.data[pIdx + 3] = 0; // transparent
    }
  }
  
  // Build PNT binary
  // Header: version(u32) + width(i32) + height(i32) + revision(u32) + size(i32) + pixel data
  const headerSize = 20; // 5 * 4 bytes
  const buffer = new ArrayBuffer(headerSize + totalPixels);
  const view = new DataView(buffer);
  
  view.setUint32(0, 1, true);  // version = 1
  view.setInt32(4, targetWidth, true);  // width
  view.setInt32(8, targetHeight, true); // height
  view.setUint32(12, 1, true); // revision = 1
  view.setInt32(16, totalPixels, true); // size
  
  const dataView = new Uint8Array(buffer, headerSize);
  dataView.set(bits);
  
  return {
    pntData: buffer,
    previewImageData: previewData,
    width: targetWidth,
    height: targetHeight,
  };
}

export function downloadPNT(data: ArrayBuffer, fileName: string) {
  const blob = new Blob([data], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
