// ARK paintable items — categorized blueprint suffixes & UV resolutions.
// Suffix is appended to the user's chosen filename to produce the .pnt filename
// that ARK will recognize (e.g. "MyImage_Rex_Character_BP_C.pnt").

export type PaintingCategory =
  | "Signs & Canvases"
  | "Flags & Decor"
  | "Humans"
  | "Creatures"
  | "Thatch Structures"
  | "Wood Structures"
  | "Stone Structures"
  | "Metal Structures"
  | "Tek Structures"
  | "Greenhouse Structures"
  | "Adobe Structures"
  | "Doors & Gates"
  | "Vehicles"
  | "Saddles"
  | "Armor"
  | "Weapons & Shields"
  | "Misc";

export interface PaintingTarget {
  name: string;
  suffix: string;
  width: number;
  height: number;
  category: PaintingCategory;
}

// Helper to keep the list compact.
const t = (
  name: string,
  suffix: string,
  width: number,
  height: number,
  category: PaintingCategory
): PaintingTarget => ({ name, suffix, width, height, category });

export const PAINTING_TARGETS: PaintingTarget[] = [
  // ───── Signs & Canvases
  t("Painting Canvas", "_PaintingCanvas_Large_C", 256, 256, "Signs & Canvases"),
  t("Wooden Sign (Small)", "_Sign_Small_Wood_C", 128, 128, "Signs & Canvases"),
  t("Wooden Sign (Medium)", "_Sign_Medium_Wood_C", 256, 128, "Signs & Canvases"),
  t("Wooden Billboard", "_Sign_Large_Wood_C", 256, 256, "Signs & Canvases"),
  t("Metal Sign (Small)", "_Sign_Small_Metal_C", 128, 128, "Signs & Canvases"),
  t("Metal Billboard", "_Sign_Large_Metal_C", 256, 256, "Signs & Canvases"),
  t("Stone Sign", "_Sign_Stone_C", 128, 128, "Signs & Canvases"),
  t("Adobe Sign", "_Sign_Adobe_C", 128, 128, "Signs & Canvases"),
  t("Bookshelf", "_Bookshelf_C", 256, 256, "Signs & Canvases"),

  // ───── Flags & Decor
  t("Single Flag", "_Flag_C", 256, 256, "Flags & Decor"),
  t("Multi Panel Flag", "_FlagMultiPanel_C", 256, 384, "Flags & Decor"),
  t("Wall Torch (banner)", "_WallTorch_C", 64, 128, "Flags & Decor"),
  t("War Map", "_WarMap_C", 256, 256, "Flags & Decor"),
  t("Shag Rug", "_Rug_C", 256, 256, "Flags & Decor"),
  t("Bear Rug", "_BearRug_C", 256, 256, "Flags & Decor"),
  t("Rex Trophy", "_RexTrophy_C", 256, 256, "Flags & Decor"),
  t("Spotlight", "_Spotlight_C", 256, 256, "Flags & Decor"),

  // ───── Humans
  t("Human (Female)", "_PlayerPawnTest_Female_C", 512, 512, "Humans"),
  t("Human (Male)", "_PlayerPawnTest_Male_C", 512, 512, "Humans"),

  // ───── Creatures (full UV at 1024×1024)
  ...[
    ["Achatina", "_Achatina_Character_BP_C"],
    ["Allosaurus", "_Allo_Character_BP_C"],
    ["Anglerfish", "_Angler_Character_BP_C"],
    ["Ankylosaurus", "_Ankylo_Character_BP_C"],
    ["Araneo", "_SpiderS_Character_BP_C"],
    ["Archaeopteryx", "_Archa_Character_BP_C"],
    ["Argentavis", "_Argent_Character_BP_C"],
    ["Arthropluera", "_Arthro_Character_BP_C"],
    ["Baryonyx", "_Baryonyx_Character_BP_C"],
    ["Basilosaurus", "_Basilosaurus_Character_BP_C"],
    ["Beelzebufo", "_Toad_Character_BP_C"],
    ["Brontosaurus", "_Sauropod_Character_BP_C"],
    ["Carbonemys", "_Turtle_Character_BP_C"],
    ["Carcharodontosaurus", "_Carcha_Character_BP_C"],
    ["Carnotaurus", "_Carno_Character_BP_C"],
    ["Castoroides", "_Beaver_Character_BP_C"],
    ["Chalicotherium", "_Chalico_Character_BP_C"],
    ["Compy", "_Compy_Character_BP_C"],
    ["Daeodon", "_Daeodon_Character_BP_C"],
    ["Deinonychus", "_Deinonychus_Character_BP_C"],
    ["Dilophosaur", "_Dilo_Character_BP_C"],
    ["Dimetrodon", "_Dimetro_Character_BP_C"],
    ["Dimorphodon", "_Dimorph_Character_BP_C"],
    ["Direbear", "_Direbear_Character_BP_C"],
    ["Direwolf", "_Direwolf_Character_BP_C"],
    ["Dodo", "_Dodo_Character_BP_C"],
    ["Doedicurus", "_Doed_Character_BP_C"],
    ["Dunkleosteus", "_Dunkle_Character_BP_C"],
    ["Equus", "_Equus_Character_BP_C"],
    ["Gallimimus", "_Galli_Character_BP_C"],
    ["Giganotosaurus", "_Gigant_Character_BP_C"],
    ["Gigantopithecus", "_Bigfoot_Character_BP_C"],
    ["Griffin", "_Griffin_Character_BP_C"],
    ["Hesperornis", "_Hesperornis_Character_BP_C"],
    ["Hyaenodon", "_Hyaenodon_Character_BP_C"],
    ["Ichthyornis", "_Ichthyornis_Character_BP_C"],
    ["Iguanodon", "_Iguanodon_Character_BP_C"],
    ["Jerboa", "_Jerboa_Character_BP_C"],
    ["Kairuku", "_Kairuku_Character_BP_C"],
    ["Kaprosuchus", "_Kapro_Character_BP_C"],
    ["Kentrosaurus", "_Kentro_Character_BP_C"],
    ["Lystrosaurus", "_Lystro_Character_BP_C"],
    ["Mammoth", "_Mammoth_Character_BP_C"],
    ["Manta", "_Manta_Character_BP_C"],
    ["Megalania", "_Megalania_Character_BP_C"],
    ["Megaloceros", "_Stag_Character_BP_C"],
    ["Megalodon", "_Megalodon_Character_BP_C"],
    ["Megalosaurus", "_Megalosaurus_Character_BP_C"],
    ["Mesopithecus", "_Mesopithecus_Character_BP_C"],
    ["Microraptor", "_Microraptor_Character_BP_C"],
    ["Mosasaurus", "_Mosa_Character_BP_C"],
    ["Moschops", "_Moschops_Character_BP_C"],
    ["Onyc (Bat)", "_Bat_Character_BP_C"],
    ["Otter", "_Otter_Character_BP_C"],
    ["Oviraptor", "_Oviraptor_Character_BP_C"],
    ["Ovis (Sheep)", "_Sheep_Character_BP_C"],
    ["Pachy", "_Pachy_Character_BP_C"],
    ["Pachyrhinosaurus", "_Pachyrhino_Character_BP_C"],
    ["Paraceratherium", "_Paracer_Character_BP_C"],
    ["Parasaur", "_Para_Character_BP_C"],
    ["Pegomastax", "_Pegomastax_Character_BP_C"],
    ["Pelagornis", "_Pelagornis_Character_BP_C"],
    ["Phiomia", "_Phiomia_Character_BP_C"],
    ["Plesiosaur", "_Plesiosaur_Character_BP_C"],
    ["Procoptodon", "_Procoptodon_Character_BP_C"],
    ["Pteranodon", "_Ptero_Character_BP_C"],
    ["Pulmonoscorpius", "_Scorpion_Character_BP_C"],
    ["Quetzal", "_Quetz_Character_BP_C"],
    ["Raptor", "_Raptor_Character_BP_C"],
    ["Rex", "_Rex_Character_BP_C"],
    ["Sabertooth", "_Saber_Character_BP_C"],
    ["Sarco", "_Sarco_Character_BP_C"],
    ["Spino", "_Spino_Character_BP_C"],
    ["Stegosaurus", "_Stego_Character_BP_C"],
    ["Tapejara", "_Tapejara_Character_BP_C"],
    ["Terror Bird", "_TerrorBird_Character_BP_C"],
    ["Therizinosaurus", "_Therizino_Character_BP_C"],
    ["Thorny Dragon", "_SpineyLizard_Character_BP_C"],
    ["Thylacoleo", "_Thylacoleo_Character_BP_C"],
    ["Titanoboa", "_BoaFrill_Character_BP_C"],
    ["Triceratops", "_Trike_Character_BP_C"],
    ["Troodon", "_Troodon_Character_BP_C"],
    ["Tusoteuthis", "_Tusoteuthis_Character_BP_C"],
    ["Woolly Rhino", "_Rhino_Character_BP_C"],
    ["Wyvern", "_Wyvern_Character_BP_Base_C"],
    ["Yutyrannus", "_Yutyrannus_Character_BP_C"],
    ["Mek", "_Mek_Character_BP_C"],
  ].map(([name, suffix]) => t(name, suffix, 1024, 1024, "Creatures")),

  // ───── Structure tiers (Foundations / Walls / Ceilings / Pillars / Ramps / Stairs)
  ...(["Thatch", "Wood", "Stone", "Metal", "Tek", "Greenhouse", "Adobe"] as const).flatMap(
    (tier) => {
      const cat = `${tier} Structures` as PaintingCategory;
      return [
        t(`${tier} Foundation`, `_${tier}Floor_C`, 256, 256, cat),
        t(`${tier} Wall`, `_${tier}Wall_C`, 256, 256, cat),
        t(`${tier} Ceiling`, `_${tier}Ceiling_C`, 256, 256, cat),
        t(`${tier} Pillar`, `_${tier}Pillar_C`, 256, 256, cat),
        t(`${tier} Ramp`, `_${tier}Ramp_C`, 256, 256, cat),
        t(`${tier} Staircase`, `_${tier}Staircase_C`, 256, 256, cat),
        t(`${tier} Sloped Wall (L)`, `_${tier}Wall_Sloped_Left_C`, 256, 256, cat),
        t(`${tier} Sloped Wall (R)`, `_${tier}Wall_Sloped_Right_C`, 256, 256, cat),
        t(`${tier} Sloped Roof`, `_${tier}Roof_C`, 256, 256, cat),
        t(`${tier} Triangle Foundation`, `_${tier}FloorTri_C`, 256, 256, cat),
        t(`${tier} Triangle Ceiling`, `_${tier}CeilingTri_C`, 256, 256, cat),
        t(`${tier} Fence Foundation`, `_${tier}FenceFoundation_C`, 256, 256, cat),
        t(`${tier} Doorframe`, `_${tier}Doorframe_C`, 256, 256, cat),
        t(`${tier} Windowframe`, `_${tier}Windowframe_C`, 256, 256, cat),
        t(`${tier} Window`, `_${tier}Window_C`, 128, 128, cat),
      ];
    }
  ),

  // ───── Doors & Gates
  t("Wood Door", "_WoodDoor_C", 256, 256, "Doors & Gates"),
  t("Stone Door", "_StoneDoor_C", 256, 256, "Doors & Gates"),
  t("Metal Door", "_MetalDoor_C", 256, 256, "Doors & Gates"),
  t("Tek Door", "_TekDoor_C", 256, 256, "Doors & Gates"),
  t("Greenhouse Door", "_GreenhouseDoor_C", 256, 256, "Doors & Gates"),
  t("Wood Dinosaur Gate", "_WoodGate_Large_C", 256, 256, "Doors & Gates"),
  t("Stone Dinosaur Gate", "_StoneGate_Large_C", 256, 256, "Doors & Gates"),
  t("Metal Dinosaur Gate", "_MetalGate_Large_C", 256, 256, "Doors & Gates"),
  t("Tek Dinosaur Gate", "_TekGate_Large_C", 256, 256, "Doors & Gates"),
  t("Behemoth Gate", "_BehemothGate_C", 512, 512, "Doors & Gates"),
  t("Behemoth Tek Gate", "_BehemothTekGate_C", 512, 512, "Doors & Gates"),
  t("Trapdoor (Wood)", "_WoodTrapdoor_C", 128, 128, "Doors & Gates"),
  t("Trapdoor (Metal)", "_MetalTrapdoor_C", 128, 128, "Doors & Gates"),

  // ───── Vehicles
  t("Raft", "_Raft_C", 256, 256, "Vehicles"),
  t("Motorboat", "_Motorboat_C", 256, 256, "Vehicles"),
  t("Canoe", "_Canoe_C", 256, 256, "Vehicles"),
  t("Tek Hover Skiff", "_TekHoverSkiff_C", 256, 256, "Vehicles"),

  // ───── Saddles
  ...[
    ["Rex Saddle", "_RexSaddle_C"],
    ["Bronto Platform Saddle", "_SauropodSaddle_Platform_C"],
    ["Paracer Platform Saddle", "_ParacerSaddle_Platform_C"],
    ["Plesiosaur Platform Saddle", "_PlesiosaurSaddle_Platform_C"],
    ["Quetzal Platform Saddle", "_QuetzSaddle_Platform_C"],
    ["Mosasaurus Platform Saddle", "_MosaSaddle_Platform_C"],
    ["Rex Tek Saddle", "_RexSaddle_Tek_C"],
    ["Megalodon Tek Saddle", "_MegalodonSaddle_Tek_C"],
    ["Mosa Tek Saddle", "_MosaSaddle_Tek_C"],
    ["Astrocetus Tek Saddle", "_AstrocetusSaddle_Tek_C"],
  ].map(([n, s]) => t(n, s, 256, 256, "Saddles")),

  // ───── Armor (each piece has its own UV)
  ...[
    ["Cloth Hat", "_ClothShirt_C"],
    ["Hide Shirt", "_HideShirt_C"],
    ["Hide Pants", "_HidePants_C"],
    ["Hide Boots", "_HideBoots_C"],
    ["Hide Gloves", "_HideGloves_C"],
    ["Hide Hat", "_HideHat_C"],
    ["Fur Cap", "_FurHat_C"],
    ["Fur Chestpiece", "_FurShirt_C"],
    ["Fur Leggings", "_FurPants_C"],
    ["Fur Boots", "_FurBoots_C"],
    ["Fur Gauntlets", "_FurGloves_C"],
    ["Chitin Helmet", "_ChitinHelmet_C"],
    ["Chitin Chestpiece", "_ChitinShirt_C"],
    ["Chitin Leggings", "_ChitinPants_C"],
    ["Chitin Boots", "_ChitinBoots_C"],
    ["Chitin Gauntlets", "_ChitinGloves_C"],
    ["Flak Helmet", "_FlakHelmet_C"],
    ["Flak Chestpiece", "_FlakShirt_C"],
    ["Flak Leggings", "_FlakPants_C"],
    ["Flak Boots", "_FlakBoots_C"],
    ["Flak Gauntlets", "_FlakGloves_C"],
    ["Riot Helmet", "_RiotHelmet_C"],
    ["Riot Chestpiece", "_RiotShirt_C"],
    ["Riot Leggings", "_RiotPants_C"],
    ["Riot Boots", "_RiotBoots_C"],
    ["Riot Gauntlets", "_RiotGloves_C"],
    ["Tek Helmet", "_TekHelmet_C"],
    ["Tek Chestpiece", "_TekShirt_C"],
    ["Tek Leggings", "_TekPants_C"],
    ["Tek Boots", "_TekBoots_C"],
    ["Tek Gauntlets", "_TekGloves_C"],
    ["Ghillie Mask", "_GhillieHelmet_C"],
    ["Ghillie Chestpiece", "_GhillieShirt_C"],
    ["Ghillie Leggings", "_GhilliePants_C"],
    ["Ghillie Boots", "_GhillieBoots_C"],
    ["Ghillie Gauntlets", "_GhillieGloves_C"],
    ["Desert Goggles & Hat", "_DesertHat_C"],
    ["Desert Cloth Shirt", "_DesertShirt_C"],
    ["Desert Cloth Pants", "_DesertPants_C"],
    ["Desert Cloth Boots", "_DesertBoots_C"],
    ["Desert Cloth Gloves", "_DesertGloves_C"],
  ].map(([n, s]) => t(n, s, 256, 256, "Armor")),

  // ───── Weapons & Shields
  ...[
    ["Wooden Shield", "_WoodShield_C"],
    ["Metal Shield", "_MetalShield_C"],
    ["Riot Shield", "_RiotShield_C"],
    ["Tek Shield", "_TekShield_C"],
    ["Wooden Club", "_WoodClub_C"],
    ["Pike", "_Pike_C"],
    ["Sword", "_Sword_C"],
    ["Bow", "_Bow_C"],
    ["Crossbow", "_Crossbow_C"],
    ["Compound Bow", "_CompoundBow_C"],
    ["Longneck Rifle", "_Longneck_C"],
    ["Pump-Action Shotgun", "_PumpShotgun_C"],
    ["Assault Rifle", "_AssaultRifle_C"],
    ["Fabricated Pistol", "_FabricatedPistol_C"],
    ["Fabricated Sniper Rifle", "_FabricatedSniper_C"],
    ["Tek Rifle", "_TekRifle_C"],
    ["Tek Sword", "_TekSword_C"],
    ["Tek Bow", "_TekBow_C"],
  ].map(([n, s]) => t(n, s, 256, 256, "Weapons & Shields")),

  // ───── Misc
  t("Tent", "_Tent_C", 256, 256, "Misc"),
  t("Wardrum", "_Wardrum_C", 256, 256, "Misc"),
  t("Cooking Pot", "_CookingPot_C", 128, 128, "Misc"),
  t("Industrial Cooker", "_IndustrialCooker_C", 256, 256, "Misc"),
  t("Storage Box (Wood)", "_StorageBox_Small_C", 128, 128, "Misc"),
  t("Storage Box (Large)", "_StorageBox_Large_C", 256, 256, "Misc"),
  t("Vault", "_Vault_C", 256, 256, "Misc"),
];

export const CATEGORY_ORDER: PaintingCategory[] = [
  "Signs & Canvases",
  "Flags & Decor",
  "Humans",
  "Creatures",
  "Thatch Structures",
  "Wood Structures",
  "Stone Structures",
  "Metal Structures",
  "Tek Structures",
  "Greenhouse Structures",
  "Adobe Structures",
  "Doors & Gates",
  "Vehicles",
  "Saddles",
  "Armor",
  "Weapons & Shields",
  "Misc",
];

export function getTargetByKey(key: string): PaintingTarget | undefined {
  return PAINTING_TARGETS.find((p) => p.suffix === key);
}
