// Dithering algorithms operating on RGBA Float32 buffers.
// Each algorithm is an error-diffusion kernel except None / Bayer (ordered).

import { findClosestColorIndex, getColorByIndex } from "./ark-palette";

export type DitherMode =
  | "none"
  | "floyd-steinberg"
  | "atkinson"
  | "jarvis"
  | "stucki"
  | "burkes"
  | "sierra"
  | "bayer4"
  | "bayer8";

export const DITHER_LABELS: Record<DitherMode, string> = {
  none: "None",
  "floyd-steinberg": "Floyd–Steinberg",
  atkinson: "Atkinson",
  jarvis: "Jarvis–Judice–Ninke",
  stucki: "Stucki",
  burkes: "Burkes",
  sierra: "Sierra",
  bayer4: "Bayer 4×4",
  bayer8: "Bayer 8×8",
};

type Kernel = { divisor: number; offsets: Array<[number, number, number]> };

// [dx, dy, weight]
const KERNELS: Partial<Record<DitherMode, Kernel>> = {
  "floyd-steinberg": {
    divisor: 16,
    offsets: [
      [1, 0, 7],
      [-1, 1, 3],
      [0, 1, 5],
      [1, 1, 1],
    ],
  },
  atkinson: {
    divisor: 8,
    offsets: [
      [1, 0, 1],
      [2, 0, 1],
      [-1, 1, 1],
      [0, 1, 1],
      [1, 1, 1],
      [0, 2, 1],
    ],
  },
  jarvis: {
    divisor: 48,
    offsets: [
      [1, 0, 7], [2, 0, 5],
      [-2, 1, 3], [-1, 1, 5], [0, 1, 7], [1, 1, 5], [2, 1, 3],
      [-2, 2, 1], [-1, 2, 3], [0, 2, 5], [1, 2, 3], [2, 2, 1],
    ],
  },
  stucki: {
    divisor: 42,
    offsets: [
      [1, 0, 8], [2, 0, 4],
      [-2, 1, 2], [-1, 1, 4], [0, 1, 8], [1, 1, 4], [2, 1, 2],
      [-2, 2, 1], [-1, 2, 2], [0, 2, 4], [1, 2, 2], [2, 2, 1],
    ],
  },
  burkes: {
    divisor: 32,
    offsets: [
      [1, 0, 8], [2, 0, 4],
      [-2, 1, 2], [-1, 1, 4], [0, 1, 8], [1, 1, 4], [2, 1, 2],
    ],
  },
  sierra: {
    divisor: 32,
    offsets: [
      [1, 0, 5], [2, 0, 3],
      [-2, 1, 2], [-1, 1, 4], [0, 1, 5], [1, 1, 4], [2, 1, 2],
      [-1, 2, 2], [0, 2, 3], [1, 2, 2],
    ],
  },
};

const BAYER_4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const BAYER_8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

/**
 * Quantize an RGBA buffer to the ARK palette using the chosen dither algorithm.
 * Returns the index buffer (length = w*h, 0 = transparent).
 */
export function quantize(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  enabledColors: Set<number>,
  mode: DitherMode
): Uint8Array {
  const total = width * height;
  const indices = new Uint8Array(total);

  if (mode === "none") {
    for (let i = 0; i < total; i++) {
      const o = i * 4;
      indices[i] = findClosestColorIndex(pixels[o], pixels[o + 1], pixels[o + 2], pixels[o + 3], enabledColors);
    }
    return indices;
  }

  if (mode === "bayer4" || mode === "bayer8") {
    const matrix = mode === "bayer4" ? BAYER_4 : BAYER_8;
    const size = matrix.length;
    const max = size * size;
    const strength = 32; // amplitude of threshold offset in 0-255 space
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const o = (y * width + x) * 4;
        const threshold = (matrix[y % size][x % size] / max - 0.5) * strength;
        const r = Math.max(0, Math.min(255, pixels[o] + threshold));
        const g = Math.max(0, Math.min(255, pixels[o + 1] + threshold));
        const b = Math.max(0, Math.min(255, pixels[o + 2] + threshold));
        indices[y * width + x] = findClosestColorIndex(r, g, b, pixels[o + 3], enabledColors);
      }
    }
    return indices;
  }

  // Error-diffusion kernels
  const kernel = KERNELS[mode];
  if (!kernel) return quantize(pixels, width, height, enabledColors, "none");

  const work = new Float32Array(pixels.length);
  for (let i = 0; i < pixels.length; i++) work[i] = pixels[i];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4;
      const r = clamp(Math.round(work[o]));
      const g = clamp(Math.round(work[o + 1]));
      const b = clamp(Math.round(work[o + 2]));
      const a = clamp(Math.round(work[o + 3]));
      const idx = findClosestColorIndex(r, g, b, a, enabledColors);
      indices[y * width + x] = idx;
      if (a < 128) continue;
      const matched = getColorByIndex(idx);
      if (!matched) continue;
      const errR = r - matched.r;
      const errG = g - matched.g;
      const errB = b - matched.b;
      for (const [dx, dy, w] of kernel.offsets) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        const ni = (ny * width + nx) * 4;
        const f = w / kernel.divisor;
        work[ni] += errR * f;
        work[ni + 1] += errG * f;
        work[ni + 2] += errB * f;
      }
    }
  }
  return indices;
}

function clamp(v: number) {
  return v < 0 ? 0 : v > 255 ? 255 : v;
}
