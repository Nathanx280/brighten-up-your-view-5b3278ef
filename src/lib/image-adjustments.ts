// Pre-quantization image adjustments. All values are user-friendly:
// brightness/contrast/saturation: -100..100 (0 = no change)
// hue: -180..180 degrees
// gamma: 0.1..3 (1 = no change)
// sharpen: 0..100, blur: 0..10 (radius)
// posterize: 2..32 (levels), 0 = off
// curves: array of 256 LUT values per channel (or null = identity)

export type ScaleMode = "fit" | "fill" | "stretch";

export interface Adjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  gamma: number;
  sharpen: number;
  blur: number;
  posterize: number;
  invert: boolean;
  rotate: 0 | 90 | 180 | 270;
  flipH: boolean;
  flipV: boolean;
  curves?: { r?: Uint8Array; g?: Uint8Array; b?: Uint8Array };
  scaleMode: ScaleMode;
  bgColor: { r: number; g: number; b: number };
}

export const DEFAULT_ADJUSTMENTS: Adjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  hue: 0,
  gamma: 1,
  sharpen: 0,
  blur: 0,
  posterize: 0,
  invert: false,
  rotate: 0,
  flipH: false,
  flipV: false,
  scaleMode: "fit",
  bgColor: { r: 0, g: 0, b: 0 },
};

/** Renders the source image into a target-sized canvas applying rotate/flip/scaleMode/bg. */
export function renderToTarget(
  source: HTMLImageElement | HTMLCanvasElement,
  targetW: number,
  targetH: number,
  adj: Adjustments
): ImageData {
  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d")!;

  // Background
  ctx.fillStyle = `rgb(${adj.bgColor.r},${adj.bgColor.g},${adj.bgColor.b})`;
  ctx.fillRect(0, 0, targetW, targetH);

  const srcW = "naturalWidth" in source ? source.naturalWidth || source.width : source.width;
  const srcH = "naturalHeight" in source ? source.naturalHeight || source.height : source.height;

  // Compute draw rect based on scale mode
  let dx = 0,
    dy = 0,
    dw = targetW,
    dh = targetH;
  if (adj.scaleMode === "fit") {
    const s = Math.min(targetW / srcW, targetH / srcH);
    dw = srcW * s;
    dh = srcH * s;
    dx = (targetW - dw) / 2;
    dy = (targetH - dh) / 2;
  } else if (adj.scaleMode === "fill") {
    const s = Math.max(targetW / srcW, targetH / srcH);
    dw = srcW * s;
    dh = srcH * s;
    dx = (targetW - dw) / 2;
    dy = (targetH - dh) / 2;
  }

  ctx.save();
  ctx.translate(targetW / 2, targetH / 2);
  ctx.rotate((adj.rotate * Math.PI) / 180);
  ctx.scale(adj.flipH ? -1 : 1, adj.flipV ? -1 : 1);
  ctx.translate(-targetW / 2, -targetH / 2);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, dx, dy, dw, dh);
  ctx.restore();

  const data = ctx.getImageData(0, 0, targetW, targetH);
  applyPixelAdjustments(data, adj);
  if (adj.blur > 0) boxBlur(data, adj.blur);
  if (adj.sharpen > 0) sharpen(data, adj.sharpen / 100);
  return data;
}

function applyPixelAdjustments(img: ImageData, adj: Adjustments) {
  const d = img.data;
  const bri = adj.brightness * 2.55;
  const c = adj.contrast / 100;
  const contrastFactor = (1 + c) / (1 - c || 1e-6);
  const sat = 1 + adj.saturation / 100;
  const invGamma = 1 / Math.max(0.01, adj.gamma);
  const hueRad = (adj.hue * Math.PI) / 180;
  const cosH = Math.cos(hueRad);
  const sinH = Math.sin(hueRad);
  const post = adj.posterize > 1 ? adj.posterize : 0;
  const step = post ? 255 / (post - 1) : 0;

  for (let i = 0; i < d.length; i += 4) {
    let r = d[i],
      g = d[i + 1],
      b = d[i + 2];

    // Brightness
    r += bri; g += bri; b += bri;
    // Contrast
    r = (r - 128) * contrastFactor + 128;
    g = (g - 128) * contrastFactor + 128;
    b = (b - 128) * contrastFactor + 128;
    // Saturation (luma-preserving)
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    r = lum + (r - lum) * sat;
    g = lum + (g - lum) * sat;
    b = lum + (b - lum) * sat;
    // Hue rotate (YIQ)
    if (adj.hue !== 0) {
      const Y = 0.299 * r + 0.587 * g + 0.114 * b;
      const I = 0.596 * r - 0.274 * g - 0.322 * b;
      const Q = 0.211 * r - 0.523 * g + 0.312 * b;
      const I2 = I * cosH - Q * sinH;
      const Q2 = I * sinH + Q * cosH;
      r = Y + 0.956 * I2 + 0.621 * Q2;
      g = Y - 0.272 * I2 - 0.647 * Q2;
      b = Y - 1.106 * I2 + 1.703 * Q2;
    }
    // Gamma
    if (adj.gamma !== 1) {
      r = 255 * Math.pow(Math.max(0, r) / 255, invGamma);
      g = 255 * Math.pow(Math.max(0, g) / 255, invGamma);
      b = 255 * Math.pow(Math.max(0, b) / 255, invGamma);
    }
    // Invert
    if (adj.invert) { r = 255 - r; g = 255 - g; b = 255 - b; }
    // Posterize
    if (post) {
      r = Math.round(r / step) * step;
      g = Math.round(g / step) * step;
      b = Math.round(b / step) * step;
    }
    // Curves
    r = clamp(r); g = clamp(g); b = clamp(b);
    if (adj.curves?.r) r = adj.curves.r[r | 0];
    if (adj.curves?.g) g = adj.curves.g[g | 0];
    if (adj.curves?.b) b = adj.curves.b[b | 0];

    d[i] = r; d[i + 1] = g; d[i + 2] = b;
  }
}

function clamp(v: number) {
  return v < 0 ? 0 : v > 255 ? 255 : v;
}

function boxBlur(img: ImageData, radius: number) {
  const r = Math.max(1, Math.round(radius));
  const { data, width: w, height: h } = img;
  const tmp = new Uint8ClampedArray(data);
  // Horizontal then vertical
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sR = 0, sG = 0, sB = 0, n = 0;
      for (let k = -r; k <= r; k++) {
        const xx = Math.max(0, Math.min(w - 1, x + k));
        const o = (y * w + xx) * 4;
        sR += tmp[o]; sG += tmp[o + 1]; sB += tmp[o + 2]; n++;
      }
      const o = (y * w + x) * 4;
      data[o] = sR / n; data[o + 1] = sG / n; data[o + 2] = sB / n;
    }
  }
  tmp.set(data);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sR = 0, sG = 0, sB = 0, n = 0;
      for (let k = -r; k <= r; k++) {
        const yy = Math.max(0, Math.min(h - 1, y + k));
        const o = (yy * w + x) * 4;
        sR += tmp[o]; sG += tmp[o + 1]; sB += tmp[o + 2]; n++;
      }
      const o = (y * w + x) * 4;
      data[o] = sR / n; data[o + 1] = sG / n; data[o + 2] = sB / n;
    }
  }
}

function sharpen(img: ImageData, amount: number) {
  const { data, width: w, height: h } = img;
  const src = new Uint8ClampedArray(data);
  const k = [0, -1, 0, -1, 5, -1, 0, -1, 0];
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        let i = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const o = ((y + ky) * w + (x + kx)) * 4 + c;
            sum += src[o] * k[i++];
          }
        }
        const o = (y * w + x) * 4 + c;
        data[o] = clamp(src[o] * (1 - amount) + sum * amount);
      }
    }
  }
}

/** Build a curves LUT from an array of 0..1 control points (5 values: 0, 0.25, 0.5, 0.75, 1). */
export function curveLUT(points: number[]): Uint8Array {
  const lut = new Uint8Array(256);
  const n = points.length - 1;
  for (let i = 0; i < 256; i++) {
    const t = (i / 255) * n;
    const lo = Math.floor(t);
    const hi = Math.min(n, lo + 1);
    const f = t - lo;
    const v = points[lo] * (1 - f) + points[hi] * f;
    lut[i] = clamp(Math.round(v * 255));
  }
  return lut;
}

export function identityLUT(): Uint8Array {
  const lut = new Uint8Array(256);
  for (let i = 0; i < 256; i++) lut[i] = i;
  return lut;
}
