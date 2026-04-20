// Orchestration: source image -> adjusted ImageData -> quantized indices -> .pnt buffer + preview.

import { quantize, type DitherMode } from "./dithering";
import { renderToTarget, type Adjustments } from "./image-adjustments";
import { encodePNT, indicesToImageData } from "./pnt-codec";

export interface ConvertParams {
  source: HTMLImageElement | HTMLCanvasElement;
  targetWidth: number;
  targetHeight: number;
  enabledColors: Set<number>;
  dither: DitherMode;
  adjustments: Adjustments;
}

export interface ConvertResult {
  pntData: ArrayBuffer;
  previewImageData: ImageData;
  indices: Uint8Array;
  width: number;
  height: number;
}

export function convertImage(params: ConvertParams): ConvertResult {
  const { source, targetWidth, targetHeight, enabledColors, dither, adjustments } = params;
  const adjusted = renderToTarget(source, targetWidth, targetHeight, adjustments);
  const indices = quantize(adjusted.data, targetWidth, targetHeight, enabledColors, dither);
  const previewImageData = indicesToImageData(indices, targetWidth, targetHeight);
  const pntData = encodePNT(targetWidth, targetHeight, indices);
  return { pntData, previewImageData, indices, width: targetWidth, height: targetHeight };
}
