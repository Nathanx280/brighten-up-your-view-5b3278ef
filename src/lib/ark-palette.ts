// ARK: Survival Evolved color palette
// Index 0 = transparent, indices 1-25 are the dye colors

export interface PaletteColor {
  index: number;
  name: string;
  r: number;
  g: number;
  b: number;
}

export const ARK_PALETTE: PaletteColor[] = [
  { index: 1, name: "Red", r: 0xff, g: 0x00, b: 0x00 },
  { index: 2, name: "Green", r: 0x00, g: 0xff, b: 0x00 },
  { index: 3, name: "Blue", r: 0x00, g: 0x00, b: 0xff },
  { index: 4, name: "Black", r: 0x1c, g: 0x1c, b: 0x1c },
  { index: 5, name: "White", r: 0xfe, g: 0xfe, b: 0xfe },
  { index: 6, name: "Brown", r: 0x75, g: 0x60, b: 0x46 },
  { index: 7, name: "Cyan", r: 0x00, g: 0xff, b: 0xff },
  { index: 8, name: "Forest", r: 0x00, g: 0x6b, b: 0x00 },
  { index: 9, name: "Purple", r: 0x7b, g: 0x00, b: 0xe0 },
  { index: 10, name: "Yellow", r: 0xff, g: 0xff, b: 0x00 },
  { index: 11, name: "Orange", r: 0xff, g: 0x88, b: 0x00 },
  { index: 12, name: "Parchment", r: 0xff, g: 0xff, b: 0xba },
  { index: 13, name: "Pink", r: 0xff, g: 0x7b, b: 0xe1 },
  { index: 14, name: "Magenta", r: 0xe7, g: 0x1c, b: 0xd9 },
  { index: 15, name: "Silver", r: 0xe0, g: 0xe0, b: 0xe0 },
  { index: 16, name: "Royalty", r: 0x7b, g: 0x00, b: 0xa8 },
  { index: 17, name: "Sky", r: 0xba, g: 0xd4, b: 0xff },
  { index: 18, name: "Tan", r: 0xff, g: 0xed, b: 0xb2 },
  { index: 19, name: "Tangerine", r: 0xad, g: 0x65, b: 0x2b },
  { index: 20, name: "Brick", r: 0x94, g: 0x32, b: 0x1c },
  { index: 21, name: "Cantaloupe", r: 0xff, g: 0x9a, b: 0x00 },
  { index: 22, name: "Mud", r: 0x46, g: 0x3b, b: 0x2b },
  { index: 23, name: "Navy", r: 0x32, g: 0x32, b: 0x6b },
  { index: 24, name: "Olive", r: 0xba, g: 0xba, b: 0x59 },
  { index: 25, name: "Slate", r: 0x59, g: 0x59, b: 0x59 },
];

function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  // Weighted distance for better perceptual matching
  return (2 + r1 / 256) * dr * dr + 4 * dg * dg + (2 + (255 - r1) / 256) * db * db;
}

export function findClosestColorIndex(
  r: number, g: number, b: number, a: number,
  enabledColors: Set<number>
): number {
  if (a < 128) return 0; // transparent

  let bestIndex = 0;
  let bestDist = Infinity;

  for (const color of ARK_PALETTE) {
    if (!enabledColors.has(color.index)) continue;
    const dist = colorDistance(r, g, b, color.r, color.g, color.b);
    if (dist < bestDist) {
      bestDist = dist;
      bestIndex = color.index;
    }
  }

  return bestIndex;
}

export function getColorByIndex(index: number): PaletteColor | null {
  if (index === 0) return null;
  return ARK_PALETTE.find(c => c.index === index) || null;
}
