// Read/write the .pnt binary format used by ARK.
// Layout: u32 version, i32 width, i32 height, u32 revision, i32 size, then `size` bytes of palette indices.

import { getColorByIndex } from "./ark-palette";

export interface PntFile {
  version: number;
  width: number;
  height: number;
  revision: number;
  indices: Uint8Array;
}

const HEADER_SIZE = 20;

export function encodePNT(width: number, height: number, indices: Uint8Array): ArrayBuffer {
  const total = width * height;
  if (indices.length !== total) {
    throw new Error(`Index length ${indices.length} does not match ${width}x${height}`);
  }
  const buffer = new ArrayBuffer(HEADER_SIZE + total);
  const view = new DataView(buffer);
  view.setUint32(0, 1, true);
  view.setInt32(4, width, true);
  view.setInt32(8, height, true);
  view.setUint32(12, 1, true);
  view.setInt32(16, total, true);
  new Uint8Array(buffer, HEADER_SIZE).set(indices);
  return buffer;
}

export function decodePNT(buffer: ArrayBuffer): PntFile {
  const view = new DataView(buffer);
  const version = view.getUint32(0, true);
  const width = view.getInt32(4, true);
  const height = view.getInt32(8, true);
  const revision = view.getUint32(12, true);
  const size = view.getInt32(16, true);
  if (width <= 0 || height <= 0 || size <= 0 || size > 4096 * 4096) {
    throw new Error("Invalid PNT header");
  }
  const indices = new Uint8Array(buffer, HEADER_SIZE, Math.min(size, buffer.byteLength - HEADER_SIZE));
  return { version, width, height, revision, indices: new Uint8Array(indices) };
}

export function indicesToImageData(indices: Uint8Array, width: number, height: number): ImageData {
  const img = new ImageData(width, height);
  for (let i = 0; i < indices.length; i++) {
    const c = getColorByIndex(indices[i]);
    const o = i * 4;
    if (c) {
      img.data[o] = c.r;
      img.data[o + 1] = c.g;
      img.data[o + 2] = c.b;
      img.data[o + 3] = 255;
    } else {
      img.data[o + 3] = 0;
    }
  }
  return img;
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
