import { findClosestColorIndex, getColorByIndex } from "./ark-palette";

export interface PNTResult {
  pntData: ArrayBuffer;
  previewImageData: ImageData;
  width: number;
  height: number;
}

// ARK painting target types with their resolutions
export const PAINTING_TARGETS = [
  // Signs & Canvases
  { name: "Painting Canvas", suffix: "_Sign_Large_Metal_C", width: 256, height: 256 },
  { name: "Wooden Sign", suffix: "_Sign_Small_Wood_C", width: 128, height: 128 },
  { name: "Wooden Billboard", suffix: "_Sign_Large_Wood_C", width: 256, height: 256 },
  { name: "Metal Sign", suffix: "_Sign_Small_Metal_C", width: 128, height: 128 },
  { name: "Metal Billboard", suffix: "_Sign_Large_Metal_C", width: 256, height: 256 },
  // Flags & Misc
  { name: "Single Flag", suffix: "_Flag_C", width: 256, height: 256 },
  { name: "Multi Panel Flag", suffix: "_FlagMultiPanel_C", width: 256, height: 384 },
  { name: "War Map", suffix: "_WarMap_C", width: 256, height: 256 },
  { name: "Shag Rug", suffix: "_Rug_C", width: 256, height: 256 },
  { name: "Spotlight", suffix: "_Spotlight_C", width: 256, height: 256 },
  { name: "Raft", suffix: "_Raft_C", width: 256, height: 256 },
  // Humans
  { name: "Human (Female)", suffix: "_PlayerPawnTest_Female_C", width: 512, height: 512 },
  { name: "Human (Male)", suffix: "_PlayerPawnTest_Male_C", width: 512, height: 512 },
  // Creatures & Dinos
  { name: "Achatina", suffix: "_Achatina_Character_BP_C", width: 256, height: 256 },
  { name: "Allosaurus", suffix: "_Allo_Character_BP_C", width: 256, height: 256 },
  { name: "Anglerfish", suffix: "_Angler_Character_BP_C", width: 256, height: 256 },
  { name: "Ankylosaurus", suffix: "_Ankylo_Character_BP_C", width: 256, height: 256 },
  { name: "Araneo", suffix: "_SpiderS_Character_BP_C", width: 256, height: 256 },
  { name: "Archaeopteryx", suffix: "_Archa_Character_BP_C", width: 256, height: 256 },
  { name: "Argentavis", suffix: "_Argent_Character_BP_C", width: 256, height: 256 },
  { name: "Arthropluera", suffix: "_Arthro_Character_BP_C", width: 256, height: 256 },
  { name: "Baryonyx", suffix: "_Baryonyx_Character_BP_C", width: 256, height: 256 },
  { name: "Basilosaurus", suffix: "_Basilosaurus_Character_BP_C", width: 256, height: 256 },
  { name: "Beelzebufo", suffix: "_Toad_Character_BP_C", width: 256, height: 256 },
  { name: "Brontosaurus", suffix: "_Sauropod_Character_BP_C", width: 256, height: 256 },
  { name: "Carcharodontosaurus", suffix: "_Carcha_Character_BP_C", width: 256, height: 256 },
  { name: "Carbonemys", suffix: "_Turtle_Character_BP_C", width: 256, height: 256 },
  { name: "Carnotaurus", suffix: "_Carno_Character_BP_C", width: 256, height: 256 },
  { name: "Castoroides", suffix: "_Beaver_Character_BP_C", width: 256, height: 256 },
  { name: "Chalicotherium", suffix: "_Chalico_Character_BP_C", width: 256, height: 256 },
  { name: "Compy", suffix: "_Compy_Character_BP_C", width: 256, height: 256 },
  { name: "Daeodon", suffix: "_Daeodon_Character_BP_C", width: 256, height: 256 },
  { name: "Dilophosaur", suffix: "_Dilo_Character_BP_C", width: 256, height: 256 },
  { name: "Dimetrodon", suffix: "_Dimetro_Character_BP_C", width: 256, height: 256 },
  { name: "Dimorphodon", suffix: "_Dimorph_Character_BP_C", width: 256, height: 256 },
  { name: "Direbear", suffix: "_Direbear_Character_BP_C", width: 256, height: 256 },
  { name: "Direwolf", suffix: "_Direwolf_Character_BP_C", width: 256, height: 256 },
  { name: "Doedicurus", suffix: "_Doed_Character_BP_C", width: 256, height: 256 },
  { name: "Dodo", suffix: "_Dodo_Character_BP_C", width: 256, height: 256 },
  { name: "Dunkleosteus", suffix: "_Dunkle_Character_BP_C", width: 256, height: 256 },
  { name: "Equus", suffix: "_Equus_Character_BP_C", width: 256, height: 256 },
  { name: "Gallimimus", suffix: "_Galli_Character_BP_C", width: 256, height: 256 },
  { name: "Giganotosaurus", suffix: "_Gigant_Character_BP_C", width: 256, height: 256 },
  { name: "Gigantopithecus", suffix: "_Bigfoot_Character_BP_C", width: 256, height: 256 },
  { name: "Griffin", suffix: "_Griffin_Character_BP_C", width: 256, height: 256 },
  { name: "Hesperornis", suffix: "_Hesperornis_Character_BP_C", width: 256, height: 256 },
  { name: "Hyaenodon", suffix: "_Hyaenodon_Character_BP_C", width: 256, height: 256 },
  { name: "Ichthyornis", suffix: "_Ichthyornis_Character_BP_C", width: 256, height: 256 },
  { name: "Jerboa", suffix: "_Jerboa_Character_BP_C", width: 256, height: 256 },
  { name: "Kairuku", suffix: "_Kairuku_Character_BP_C", width: 256, height: 256 },
  { name: "Kaprosuchus", suffix: "_Kapro_Character_BP_C", width: 256, height: 256 },
  { name: "Kentrosaurus", suffix: "_Kentro_Character_BP_C", width: 256, height: 256 },
  { name: "Lystrosaurus", suffix: "_Lystro_Character_BP_C", width: 256, height: 256 },
  { name: "Mammoth", suffix: "_Mammoth_Character_BP_C", width: 256, height: 256 },
  { name: "Manta", suffix: "_Manta_Character_BP_C", width: 256, height: 256 },
  { name: "Megalania", suffix: "_Megalania_Character_BP_C", width: 256, height: 256 },
  { name: "Megaloceros", suffix: "_Stag_Character_BP_C", width: 256, height: 256 },
  { name: "Megalodon", suffix: "_Megalodon_Character_BP_C", width: 256, height: 256 },
  { name: "Megaloceros", suffix: "_Stag_Character_BP_C", width: 256, height: 256 },
  { name: "Megalosaurus", suffix: "_Megalosaurus_Character_BP_C", width: 256, height: 256 },
  { name: "Mesopithecus", suffix: "_Mesopithecus_Character_BP_C", width: 256, height: 256 },
  { name: "Microraptor", suffix: "_Microraptor_Character_BP_C", width: 256, height: 256 },
  { name: "Mosasaurus", suffix: "_Mosa_Character_BP_C", width: 256, height: 256 },
  { name: "Moschops", suffix: "_Moschops_Character_BP_C", width: 256, height: 256 },
  { name: "Ophiura", suffix: "_Ophiura_Character_BP_C", width: 256, height: 256 },
  { name: "Oviraptor", suffix: "_Oviraptor_Character_BP_C", width: 256, height: 256 },
  { name: "Pachy", suffix: "_Pachy_Character_BP_C", width: 256, height: 256 },
  { name: "Pachyrhinosaurus", suffix: "_Pachyrhino_Character_BP_C", width: 256, height: 256 },
  { name: "Paraceratherium", suffix: "_Paracer_Character_BP_C", width: 256, height: 256 },
  { name: "Parasaur", suffix: "_Para_Character_BP_C", width: 256, height: 256 },
  { name: "Pegomastax", suffix: "_Pegomastax_Character_BP_C", width: 256, height: 256 },
  { name: "Pelagornis", suffix: "_Pelagornis_Character_BP_C", width: 256, height: 256 },
  { name: "Phiomia", suffix: "_Phiomia_Character_BP_C", width: 256, height: 256 },
  { name: "Plesiosaur", suffix: "_Plesiosaur_Character_BP_C", width: 256, height: 256 },
  { name: "Procoptodon", suffix: "_Procoptodon_Character_BP_C", width: 256, height: 256 },
  { name: "Pteranodon", suffix: "_Ptero_Character_BP_C", width: 256, height: 256 },
  { name: "Pulmonoscorpius", suffix: "_Scorpion_Character_BP_C", width: 256, height: 256 },
  { name: "Quetzal", suffix: "_Quetz_Character_BP_C", width: 256, height: 256 },
  { name: "Raptor", suffix: "_Raptor_Character_BP_C", width: 256, height: 256 },
  { name: "Rex", suffix: "_Rex_Character_BP_C", width: 256, height: 256 },
  { name: "Sabertooth", suffix: "_Saber_Character_BP_C", width: 256, height: 256 },
  { name: "Sarco", suffix: "_Sarco_Character_BP_C", width: 256, height: 256 },
  { name: "Spino", suffix: "_Spino_Character_BP_C", width: 256, height: 256 },
  { name: "Stegosaurus", suffix: "_Stego_Character_BP_C", width: 256, height: 256 },
  { name: "Tapejara", suffix: "_Tapejara_Character_BP_C", width: 256, height: 256 },
  { name: "Terror Bird", suffix: "_TerrorBird_Character_BP_C", width: 256, height: 256 },
  { name: "Therizinosaurus", suffix: "_Therizino_Character_BP_C", width: 256, height: 256 },
  { name: "Thorny Dragon", suffix: "_SpineyLizard_Character_BP_C", width: 256, height: 256 },
  { name: "Thylacoleo", suffix: "_Thylacoleo_Character_BP_C", width: 256, height: 256 },
  { name: "Titanoboa", suffix: "_BoaFrill_Character_BP_C", width: 256, height: 256 },
  { name: "Triceratops", suffix: "_Trike_Character_BP_C", width: 256, height: 256 },
  { name: "Troodon", suffix: "_Troodon_Character_BP_C", width: 256, height: 256 },
  { name: "Tusoteuthis", suffix: "_Tusoteuthis_Character_BP_C", width: 256, height: 256 },
  { name: "Woolly Rhino", suffix: "_Rhino_Character_BP_C", width: 256, height: 256 },
  { name: "Yutyrannus", suffix: "_Yutyrannus_Character_BP_C", width: 256, height: 256 },
  { name: "Wyvern", suffix: "_Wyvern_Character_BP_Base_C", width: 256, height: 256 },
  // Foundations
  { name: "Stone Foundation", suffix: "_StoneFloor_C", width: 256, height: 256 },
  { name: "Metal Foundation", suffix: "_MetalFloor_C", width: 256, height: 256 },
  { name: "Tek Foundation", suffix: "_TekFloor_C", width: 256, height: 256 },
  { name: "Wood Foundation", suffix: "_WoodFloor_C", width: 256, height: 256 },
  { name: "Thatch Foundation", suffix: "_ThatchFloor_C", width: 256, height: 256 },
  // Walls
  { name: "Stone Wall", suffix: "_StoneWall_C", width: 256, height: 256 },
  { name: "Metal Wall", suffix: "_MetalWall_C", width: 256, height: 256 },
  { name: "Tek Wall", suffix: "_TekWall_C", width: 256, height: 256 },
  { name: "Wood Wall", suffix: "_WoodWall_C", width: 256, height: 256 },
  // Ceilings
  { name: "Stone Ceiling", suffix: "_StoneCeiling_C", width: 256, height: 256 },
  { name: "Metal Ceiling", suffix: "_MetalCeiling_C", width: 256, height: 256 },
  { name: "Tek Ceiling", suffix: "_TekCeiling_C", width: 256, height: 256 },
  { name: "Wood Ceiling", suffix: "_WoodCeiling_C", width: 256, height: 256 },
  // Doors & Gates
  { name: "Metal Door", suffix: "_MetalDoor_C", width: 256, height: 256 },
  { name: "Stone Doorframe", suffix: "_StoneDoorframe_C", width: 256, height: 256 },
  { name: "Metal Dinosaur Gate", suffix: "_MetalGate_Large_C", width: 256, height: 256 },
  { name: "Behemoth Gate", suffix: "_BehemothGate_C", width: 256, height: 256 },
  // Other Structures
  { name: "Stone Pillar", suffix: "_StonePillar_C", width: 256, height: 256 },
  { name: "Metal Pillar", suffix: "_MetalPillar_C", width: 256, height: 256 },
  { name: "Tek Pillar", suffix: "_TekPillar_C", width: 256, height: 256 },
  { name: "Canoe", suffix: "_Canoe_C", width: 256, height: 256 },
  { name: "Motorboat", suffix: "_Motorboat_C", width: 256, height: 256 },
  { name: "Shield", suffix: "_Shield_C", width: 256, height: 256 },
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
